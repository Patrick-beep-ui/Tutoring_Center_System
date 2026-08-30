import { useState, useEffect } from "react";
import auth from "../authService";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Header from "../components/Header";

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
            <section className="section">
                <main className="p-4">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="mb-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <h2 className="m-0 text-lg font-medium">Semesters</h2>
                                    <Link to="/terms/add" className="inline-flex items-center gap-2 rounded border border-[var(--blue)] px-2.5 py-1 text-sm text-[var(--blue)] hover:bg-[var(--blue)] hover:text-white">
                                        <i className='bx bx-calendar-plus'></i>
                                        Add Semester
                                    </Link>
                                </div>
                            </div>

                            <div className="p-4">
                                {terms.length === 0 ? (
                                    <p className="m-0 text-muted-foreground">No semesters yet. Click "Add Semester" to create the first one.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="m-0 w-full [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_td]:px-4 [&_td]:py-2 [&_td]:align-middle [&_tr]:border-b [&_tr]:border-gray-200 [&_tr:hover]:bg-gray-50">
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
                                                                ? <span className="inline-flex rounded-full bg-green-600 px-3 py-1 text-sm font-normal text-white">Current</span>
                                                                : <span className="inline-flex rounded-full bg-gray-500 px-3 py-1 text-sm font-normal text-white">Past</span>}
                                                        </td>
                                                        <td>
                                                            {!term.is_current &&
                                                                <button className="rounded border border-green-600 px-2.5 py-1 text-sm text-green-700 hover:bg-green-600 hover:text-white" onClick={() => handleSetCurrent(term)}>
                                                                    Set Current
                                                                </button>}
                                                        </td>
                                                        <td>
                                                            {!term.is_current &&
                                                                <i className='bx bx-trash cursor-pointer text-lg text-[var(--dark-gray)] transition-colors hover:text-red-600'
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
