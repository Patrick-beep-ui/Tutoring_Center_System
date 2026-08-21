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
                    setSourceId(String(sorted[0].semester_id));
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
                    copySummary = parts.length > 0 ? ` Copied: ${parts.join(", ")}.` : "";
                } catch (copyError) {
                    toast.error("Semester created, but copying rosters failed. You can re-copy later.", { duration: 5000 });
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

    return(<div className="add-semester-page">
        <h1>Add Semester</h1>

        <section className="mt-4 add">
        <form onSubmit={handleSubmit(processData)} className="form-container">
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
                <section className="border rounded p-3 mt-3">
                    <label className="fw-bold">Copy rosters from:</label>
                    <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="form-select my-2">
                        <option value="">Don't copy anything</option>
                        {terms.map(t => (
                            <option key={t.semester_id} value={t.semester_id}>
                                {t.semester_type} {t.semester_year}
                            </option>
                        ))}
                    </select>

                    {sourceId && (
                        <div className="d-flex flex-column gap-1 mt-2">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="copyCourses"
                                    checked={copyCourses} onChange={(e) => setCopyCourses(e.target.checked)} />
                                <label className="form-check-label" htmlFor="copyCourses">Courses offered</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="copyTutors"
                                    checked={copyTutors} onChange={(e) => setCopyTutors(e.target.checked)} />
                                <label className="form-check-label" htmlFor="copyTutors">Tutor roster (with their course assignments)</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="copyStudents"
                                    checked={copyStudents} onChange={(e) => setCopyStudents(e.target.checked)} />
                                <label className="form-check-label" htmlFor="copyStudents">Student roster (with their course enrollments)</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="copySchedules"
                                    checked={copySchedules} onChange={(e) => setCopySchedules(e.target.checked)} />
                                <label className="form-check-label" htmlFor="copySchedules">Tutor schedules</label>
                            </div>
                            <small className="text-muted">After copying you can clean up or re-assign courses from each tutor/student profile.</small>
                        </div>
                    )}
                </section>
            )}

            <button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Submit"}</button>

        </form>
        </section>

        <div>
            <Link to={"/semesters"}>See Semesters</Link>
        </div>
        </div>
    )
}

export default AddSemester;
