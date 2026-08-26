import { useState, useEffect } from "react";
import auth from "../authService";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Header from "../components/Header";
import '../App.css';

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const [y, m, d] = String(dateStr).split("T")[0].split("-").map(Number);
    if (!y || !m || !d) return String(dateStr);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

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
            <Header />
            <section className="section semesters-section">
                <main className="p-4">
                    <div className="container">
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h2 className="h5 mb-0">Semesters</h2>
                                    <Link to="/terms/add" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2">
                                        <i className='bx bx-calendar-plus'></i>
                                        Add Semester
                                    </Link>
                                </div>
                            </div>

                            <div className="card-body">
                                {terms.length === 0 ? (
                                    <p className="text-muted mb-0">No semesters yet. Click "Add Semester" to create the first one.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead>
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
                                                        <td>{formatDate(term.start_date)}</td>
                                                        <td>
                                                            {term.is_current
                                                                ? <span className="badge bg-success">Current</span>
                                                                : <span className="badge bg-secondary">Past</span>}
                                                        </td>
                                                        <td>
                                                            {!term.is_current &&
                                                                <button className="btn btn-sm btn-outline-success" onClick={() => handleSetCurrent(term)}>
                                                                    Set Current
                                                                </button>}
                                                        </td>
                                                        <td>
                                                            {!term.is_current &&
                                                                <i className='bx bx-trash delete'
                                                                    title="Delete semester"
                                                                    onClick={() => handleDelete(term)}></i>}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </section>
        </>
    );
}

export default Semesters;
