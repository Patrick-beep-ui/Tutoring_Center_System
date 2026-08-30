import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import auth from "../authService";

function AddSemester() {
    const { register, handleSubmit, formState: {errors}} = useForm({mode: "onChange"});
    const navigate = useNavigate();

    const [terms, setTerms] = useState([]);
    const [sourceId, setSourceId] = useState("");
    const [copyCourses, setCopyCourses] = useState(true);
    const [copyTutors, setCopyTutors] = useState(true);
    const [copyStudents, setCopyStudents] = useState(true);
    const [copySchedules, setCopySchedules] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const res = await auth.get("/api/terms");
                const sorted = [...res.data.terms].sort((a, b) =>
                    Number(b.semester_year) - Number(a.semester_year) || b.semester_id - a.semester_id
                );
                setTerms(sorted);
                if (sorted.length > 0) {
                    const current = sorted.find(t => t.is_current);
                    setSourceId(String((current || sorted[0]).semester_id));
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchTerms();
    }, []);

    const processData = useCallback(async (formData) => {
        try {
            setSubmitting(true);
            const response = await auth.post("/api/terms", formData);
            const newId = response.data.term.semester_id;

            let copySummary = "";
            if (sourceId) {
                try {
                    const copyResponse = await auth.post(`/api/terms/${newId}/copy-from/${sourceId}`, {
                        courses: copyCourses,
                        tutors: copyTutors,
                        students: copyStudents,
                        schedules: copySchedules
                    });
                    const { copied } = copyResponse.data;
                    const parts = [];
                    if (copied.courses !== undefined) parts.push(`${copied.courses} courses`);
                    if (copied.tutors !== undefined) parts.push(`${copied.tutors} tutor assignments`);
                    if (copied.students !== undefined) parts.push(`${copied.students} student enrollments`);
                    if (copied.schedules !== undefined) parts.push(`${copied.schedules} schedule blocks`);
                    const totalCopied = Object.values(copied).reduce((sum, n) => sum + Number(n || 0), 0);
                    if (totalCopied === 0) {
                        toast.warning(`The source semester has nothing to copy for the selected options.`, { duration: 6000 });
                        copySummary = " Nothing was copied.";
                    } else {
                        copySummary = ` Copied: ${parts.join(", ")}.`;
                    }
                } catch (copyError) {
                    toast.error("Semester created, but copying rosters failed. You can re-copy later.", { duration: 8000 });
                    console.error(copyError);
                }
            }

            toast.success(`Semester added successfully!${copySummary}`, { duration: 5000 });

            setTimeout(() => {
                navigate("/semesters");
              }, 1200);
        }
        catch (e) {
            if (e.response && e.response.status === 409) {
              toast.error(e.response.data.msg || "This semester already exists", { duration: 3000 });
            } else {
              toast.error(`An error occurred: ${e.message}`, { duration: 3000 });
              console.error(e);
            }
        }
        finally {
            setSubmitting(false);
        }
    }, [navigate, sourceId, copyCourses, copyTutors, copyStudents, copySchedules]);

    return(<div className="min-h-screen bg-[var(--blue)] p-8 font-poppins text-center">
        <h1 className="mt-4 text-center text-3xl font-bold text-[var(--white)]">Add Semester</h1>

        <section className="mt-8 flex justify-center">
        <form onSubmit={handleSubmit(processData)} className="w-full max-w-[480px] rounded-2xl bg-[var(--white)] p-8 text-left text-[var(--black)] shadow-[0_4px_20px_rgba(0,0,0,0.15)] [&>section>label]:mb-1.5 [&>section>label]:block [&>section>label]:font-medium [&>section>input]:mb-4 [&>section>input]:w-full [&>section>input]:rounded-lg [&>section>input]:border-0 [&>section>input]:bg-[#f0f0f0] [&>section>input]:p-[0.8rem] [&>section>input]:text-[0.95rem] [&>section>input:focus]:outline-2 [&>section>input:focus]:outline-[var(--yellow)] [&>section>select]:mb-4 [&>section>select]:w-full [&>section>select]:rounded-lg [&>section>select]:border-0 [&>section>select]:bg-[#f0f0f0] [&>section>select]:p-[0.8rem] [&>section>select]:text-[0.95rem] [&>section>span]:mt-1.5 [&>section>span]:block [&>section>span]:text-sm [&>section>span]:text-red-500">
            <section>
                <label>Term: </label>
                <select {...register("semester_type", {required: true})}>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                </select>
                {errors.semester_type && <span>This field is required</span>}
            </section>
            <section>
                <label>Semester Code:</label>
                <input type="text" {...register("semester_code", {required: true})} />
                {errors.semester_code && <span>This field is required</span>}
            </section>
            <section>
                <label>Semester Year:</label>
                <input type="text" {...register("semester_year", {required: true})} />
                {errors.semester_year && <span>This field is required</span>}
            </section>
            <section>
                <label>Amount of weeks:</label>
                <input type="number" {...register("weeks", {required: true})} />
                {errors.weeks && <span>This field is required</span>}
            </section>
            <section>
                <label>Start Date:</label>
                <input type="date" {...register("start_date")} />
                {errors.start_date && <span>This field is required</span>}
            </section>

            {terms.length > 0 && (
                <section className="mt-4 rounded-md border border-border p-4">
                    <label className="font-bold">Copy rosters from:</label>
                    <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="my-2">
                        <option value="">Don't copy anything</option>
                        {terms.map(t => {
                            const rc = t.roster_counts || { courses: 0, tutors: 0, students: 0, schedules: 0 };
                            return (
                                <option key={t.semester_id} value={t.semester_id}>
                                    {`${t.semester_type} ${t.semester_year}${t.is_current ? ' (current)' : ''} — ${rc.courses} courses, ${rc.tutors} tutors, ${rc.students} students`}
                                </option>
                            );
                        })}
                    </select>

                    {sourceId && (
                        <div className="mt-2.5 flex flex-col gap-1.5">
                            {[
                                { id: "copyCourses", label: "Courses offered", state: copyCourses, set: setCopyCourses },
                                { id: "copyTutors", label: "Tutor roster (with their course assignments)", state: copyTutors, set: setCopyTutors },
                                { id: "copyStudents", label: "Student roster (with their course enrollments)", state: copyStudents, set: setCopyStudents },
                                { id: "copySchedules", label: "Tutor schedules", state: copySchedules, set: setCopySchedules }
                            ].map(({ id, label, state, set }) => (
                                <label className={`mb-0 flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 transition-[background-color,opacity] ${state ? 'bg-[rgba(25,45,100,0.06)]' : 'bg-transparent opacity-55'}`} key={id} htmlFor={id}>
                                    <input type="checkbox" id={id}
                                        className="m-0 h-4 w-4 shrink-0 cursor-pointer p-0 accent-[var(--blue)]"
                                        checked={state} onChange={(e) => set(e.target.checked)} />
                                    <span className={`min-w-0 flex-1 font-medium leading-[1.35] ${state ? '' : 'line-through'}`}>{label}</span>
                                    <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold uppercase tracking-[0.04em] ${state ? 'bg-[var(--blue)] text-[var(--white)]' : 'border border-[var(--gray)] bg-transparent text-[var(--dark-gray)]'}`}>{state ? "Included" : "Excluded"}</span>
                                </label>
                            ))}
                            <small className="text-muted-foreground">After copying you can clean up or re-assign courses from each tutor/student profile.</small>
                        </div>
                    )}
                </section>
            )}

            <button type="submit" className="w-full cursor-pointer rounded-lg bg-[var(--yellow)] p-[0.9rem] font-semibold text-[var(--black)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#d99a28] disabled:cursor-not-allowed disabled:opacity-60" disabled={submitting}>{submitting ? "Saving..." : "Submit"}</button>

        </form>
        </section>

        <div>
            <Link to={"/semesters"} className="mt-4 inline-block rounded-lg border-2 border-[var(--yellow)] px-4 py-2.5 font-medium text-[var(--yellow)] no-underline transition duration-300 hover:bg-[var(--yellow)] hover:text-[var(--black)]">See Semesters</Link>
        </div>
        </div>
    )
}

export default AddSemester;
