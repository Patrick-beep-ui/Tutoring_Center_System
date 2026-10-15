import { useCallback, useContext, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import Header from "../../components/shared/Header";
import auth from "../../authService";
import { SemesterContext } from "../../context/currentSemester";

const EMPTY_FORM = {
    title: "",
    body: "",
    audience: "all",
    semester_id: "",
    expires_at: ""
};

const audienceLabel = {
    all: "Everyone",
    students: "Students",
    tutors: "Tutors"
};

function Announcements() {
    const { user } = useOutletContext();
    const { semesters, selectedSemesterId } = useContext(SemesterContext);
    const [announcements, setAnnouncements] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [showComposer, setShowComposer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const canManage = user?.role === "admin" || user?.role === "dev";

    const loadAnnouncements = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedSemesterId) params.set("semester_id", selectedSemesterId);
            if (canManage) params.set("include_expired", "true");
            const { data } = await auth.get(`/api/announcements${params.size ? `?${params}` : ""}`);
            setAnnouncements(data.announcements || []);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to load announcements");
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    }, [selectedSemesterId, canManage]);

    useEffect(() => {
        loadAnnouncements();
    }, [loadAnnouncements]);

    const resetComposer = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowComposer(false);
    };

    const startEdit = (announcement) => {
        setEditingId(announcement.announcement_id);
        setForm({
            title: announcement.title || "",
            body: announcement.body || "",
            audience: announcement.audience || "all",
            semester_id: announcement.semester_id || "",
            expires_at: announcement.expires_at ? String(announcement.expires_at).slice(0, 10) : ""
        });
        setShowComposer(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                semester_id: form.semester_id || null,
                expires_at: form.expires_at || null
            };
            if (editingId) {
                await auth.put(`/api/announcements/${editingId}`, payload);
                toast.success("Announcement updated");
            } else {
                await auth.post("/api/announcements", payload);
                toast.success("Announcement published and email delivery started");
            }
            resetComposer();
            await loadAnnouncements();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Unable to save announcement");
        } finally {
            setSaving(false);
        }
    };

    const deleteAnnouncement = async (announcementId) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            await auth.delete(`/api/announcements/${announcementId}`);
            setAnnouncements((current) => current.filter((item) => item.announcement_id !== announcementId));
            toast.success("Announcement deleted");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Unable to delete announcement");
        }
    };

    return (
        <>
            <Header />
            <section className="min-h-screen bg-[#f8fafc] px-5 pb-8 pt-24 min-[992px]:pl-[calc(var(--sidebar-content-offset)+20px)] max-[600px]:px-4">
                <div className="mx-auto max-w-[1100px]">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="mb-1 text-3xl font-bold text-[#222]">Announcements</h1>
                            <p className="m-0 text-sm text-[#666]">Center news, reminders, and important updates.</p>
                        </div>
                        {canManage && (
                            <button type="button" className="inline-flex items-center gap-1.5 rounded-md bg-[#0a84ff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#086dce] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-2" onClick={() => { setForm({ ...EMPTY_FORM, semester_id: selectedSemesterId || "" }); setEditingId(null); setShowComposer(true); }}>
                                <i className="bx bx-plus text-base"></i> Post Announcement
                            </button>
                        )}
                    </div>

                    {canManage && showComposer && (
                        <form onSubmit={handleSubmit} className="mb-6 rounded-[10px] border border-[#d7e7fb] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="m-0 text-lg font-bold text-[#222]">{editingId ? "Edit Announcement" : "New Announcement"}</h2>
                                <button type="button" className="text-sm font-medium text-[#666] hover:text-[#222]" onClick={resetComposer}>Cancel</button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="flex flex-col gap-1 text-sm font-medium text-[#444] md:col-span-2">
                                    Title
                                    <input required maxLength="150" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="rounded-md border border-[#ddd] px-3 py-2 text-sm outline-none focus:border-[#0a84ff]" />
                                </label>
                                <label className="flex flex-col gap-1 text-sm font-medium text-[#444] md:col-span-2">
                                    Message
                                    <textarea required rows="5" value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} className="resize-y rounded-md border border-[#ddd] px-3 py-2 text-sm outline-none focus:border-[#0a84ff]" />
                                </label>
                                <label className="flex flex-col gap-1 text-sm font-medium text-[#444]">
                                    Audience
                                    <select value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))} className="rounded-md border border-[#ddd] bg-white px-3 py-2 text-sm outline-none focus:border-[#0a84ff]">
                                        <option value="all">Tutors and students</option>
                                        <option value="students">Students only</option>
                                        <option value="tutors">Tutors only</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1 text-sm font-medium text-[#444]">
                                    Semester
                                    <select value={form.semester_id} onChange={(event) => setForm((current) => ({ ...current, semester_id: event.target.value }))} className="rounded-md border border-[#ddd] bg-white px-3 py-2 text-sm outline-none focus:border-[#0a84ff]">
                                        <option value="">All semesters</option>
                                        {semesters.map((semester) => <option key={semester.semester_id} value={semester.semester_id}>{semester.semester_code}</option>)}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1 text-sm font-medium text-[#444]">
                                    Expires on
                                    <input type="date" value={form.expires_at} onChange={(event) => setForm((current) => ({ ...current, expires_at: event.target.value }))} className="rounded-md border border-[#ddd] px-3 py-2 text-sm outline-none focus:border-[#0a84ff]" />
                                </label>
                            </div>
                            <div className="mt-5 flex justify-end">
                                <button disabled={saving} type="submit" className="rounded-md bg-[#0a84ff] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : editingId ? "Save Changes" : "Publish Announcement"}</button>
                            </div>
                        </form>
                    )}

                    {loading ? (
                        <p className="rounded-[10px] border border-[#ddd] bg-white px-5 py-10 text-center text-sm text-[#666]">Loading announcements...</p>
                    ) : announcements.length === 0 ? (
                        <div className="rounded-[10px] border border-dashed border-[#bbb] bg-white px-5 py-14 text-center">
                            <i className="bx bx-message-rounded-dots text-4xl text-[#9ca3af]"></i>
                            <p className="mb-1 mt-3 text-base font-semibold text-[#444]">No announcements yet</p>
                            <p className="m-0 text-sm text-[#777]">Check back for center news and reminders.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((announcement) => {
                                const expired = announcement.expires_at && new Date(announcement.expires_at) <= new Date();
                                const author = announcement.author ? `${announcement.author.first_name} ${announcement.author.last_name}` : "Center administration";
                                return (
                                    <article key={announcement.announcement_id} className={`rounded-[10px] border bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${expired ? "border-amber-300" : "border-[#ddd]"}`}>
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#0a84ff]">{audienceLabel[announcement.audience]}</span>
                                                    {expired && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">Expired</span>}
                                                </div>
                                                <h2 className="m-0 text-xl font-bold text-[#222]">{announcement.title}</h2>
                                            </div>
                                            {canManage && (
                                                <div className="flex gap-2">
                                                    <button type="button" className="rounded-md border border-[#ddd] px-2.5 py-1.5 text-xs font-semibold text-[#555] hover:bg-[#f3f4f6]" onClick={() => startEdit(announcement)}>Edit</button>
                                                    <button type="button" className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => deleteAnnouncement(announcement.announcement_id)}>Delete</button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mb-4 mt-3 whitespace-pre-wrap text-sm leading-6 text-[#444]">{announcement.body}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[#eee] pt-3 text-xs text-[#777]">
                                            <span>Posted by {author}</span>
                                            <span>{new Date(announcement.published_at).toLocaleDateString()}</span>
                                            {announcement.expires_at && <span>Expires {new Date(announcement.expires_at).toLocaleDateString()}</span>}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default Announcements;
