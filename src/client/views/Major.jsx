import { useState, useEffect } from "react";
import auth from "../authService";
import { Link, useNavigate } from "react-router-dom";
import {v4 as uuid} from "uuid";
import { toast } from "sonner";

function Major() {
    const [majors, setMajors] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const navigate = useNavigate();

    const fetchMajors = async () => {
        try {
            const response = await auth.get("/api/majors")
            setMajors(response.data.majors)
        }
        catch(e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchMajors();
    }, [])

    const handleEdit = (major) => {
        setEditingId(major.major_id);
        setEditName(major.major_name);
    };

    const handleSaveEdit = async (major_id) => {
        if (!editName.trim()) {
            toast.error("Major name cannot be empty");
            return;
        }
        try {
            await auth.put(`/api/majors/${major_id}`, { major_name: editName.trim() });
            toast.success("Major updated successfully");
            setEditingId(null);
            setEditName("");
            fetchMajors();
        } catch (e) {
            if (e.response && e.response.status === 409) {
                toast.error(e.response.data.msg || "A major with that name already exists");
            } else {
                toast.error("An error occurred while updating the major");
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const handleDelete = async (major_id, major_name) => {
        if (!window.confirm(`Are you sure you want to delete "${major_name}"? This will also remove the major association from all users and courses linked to it.`)) {
            return;
        }
        try {
            await auth.delete(`/api/majors/${major_id}`);
            toast.success("Major deleted successfully");
            fetchMajors();
        } catch (e) {
            if (e.response && e.response.status === 404) {
                toast.error("Major not found");
            } else {
                toast.error("An error occurred while deleting the major");
            }
        }
    };

    return(
        <>
        <h1>Majors</h1>

        <section className="mt-4">
            <table className="table table-striped">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Major Name</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {majors.map(major =>
                    <tr key={major.major_id}>
                        <td>{major.major_id}</td>
                        <td>
                            {editingId === major.major_id ? (
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveEdit(major.major_id);
                                        if (e.key === "Escape") handleCancelEdit();
                                    }}
                                    autoFocus
                                    className="form-control form-control-sm"
                                    style={{ display: "inline-block", width: "auto" }}
                                />
                            ) : (
                                major.major_name
                            )}
                        </td>
                        <td>
                            {editingId === major.major_id ? (
                                <>
                                    <i className='bx bx-check edit' style={{color: 'green', cursor: 'pointer', marginRight: '10px'}}
                                        onClick={() => handleSaveEdit(major.major_id)}></i>
                                    <i className='bx bx-x delete' style={{color: 'red', cursor: 'pointer'}}
                                        onClick={handleCancelEdit}></i>
                                </>
                            ) : (
                                <i className='bx bx-pencil edit' style={{cursor: 'pointer'}}
                                    onClick={() => handleEdit(major)}></i>
                            )}
                        </td>
                        <td>
                            <i className='bx bx-trash delete' style={{cursor: 'pointer'}}
                                onClick={() => handleDelete(major.major_id, major.major_name)}></i>
                        </td>
                    </tr>    
                        )}
                </tbody>
            </table>
        </section>

        <Link to={"/majors/add"}>Add Major</Link>
        </>
    )

}

export default Major
