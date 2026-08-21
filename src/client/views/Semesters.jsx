import { useState, useEffect } from "react";
import auth from "../authService";
import { Link } from "react-router-dom";
import { toast } from "sonner";

function Semesters() {
    const [terms, setTerms] = useState([]);

    const fetchTerms = async () => {
        try {
            const response = await auth.get("/api/terms");
            setTerms(response.data.terms);
        } catch (e) {
            console.error(e);
            toast.error("An error occurred while fetching semesters");
        }
    };

    useEffect(() => {
        fetchTerms();
    }, []);

    const handleSetCurrent = async (term) => {
        if (!window.confirm(`Set ${term.semester_type} ${term.semester_year} as the current semester? All dashboards, reports and new sessions will point to it.`)) {
            return;
        }
        try {
            await auth.put(`/api/terms/${term.semester_id}/set-current`);
            toast.success(`${term.semester_type} ${term.semester_year} is now the current semester`);
            fetchTerms();
        } catch (e) {
            toast.error(e.response?.data?.msg || "An error occurred while setting the current semester");
        }
    };

    const handleDelete = async (term) => {
        if (!window.confirm(`Delete ${term.semester_type} ${term.semester_year}? This also removes its course offerings, rosters and schedules.`)) {
            return;
        }
        try {
            await auth.delete(`/api/terms/${term.semester_id}`);
            toast.success("Semester deleted successfully");
            fetchTerms();
        } catch (e) {
            toast.error(e.response?.data?.msg || "An error occurred while deleting the semester");
        }
    };

    return (
        <>
            <h1>Semesters</h1>

            <section className="mt-4">
                <table className="table table-striped">
                    <thead className="table-dark">
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Term</th>
                            <th scope="col">Code</th>
                            <th scope="col">Year</th>
                            <th scope="col">Weeks</th>
                            <th scope="col">Start Date</th>
                            <th scope="col">Status</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {terms.map(term =>
                            <tr key={term.semester_id}>
                                <td>{term.semester_id}</td>
                                <td>{term.semester_type}</td>
                                <td>{term.semester_code}</td>
                                <td>{term.semester_year}</td>
                                <td>{term.weeks}</td>
                                <td>{term.start_date || "—"}</td>
                                <td>
                                    {term.is_current
                                        ? <span className="badge bg-success">Current</span>
                                        : <span className="badge bg-secondary">Past</span>}
                                </td>
                                <td>
                                    {!term.is_current &&
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleSetCurrent(term)}>
                                            Set Current
                                        </button>}
                                </td>
                                <td>
                                    {!term.is_current &&
                                        <i className='bx bx-trash delete' style={{ cursor: 'pointer' }}
                                            onClick={() => handleDelete(term)}></i>}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            <Link to={"/terms/add"}>Add Semester</Link>
        </>
    );
}

export default Semesters;
