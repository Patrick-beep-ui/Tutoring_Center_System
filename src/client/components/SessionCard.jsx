import { FaClock, FaStar } from "react-icons/fa";// Import icons
import {useState, useCallback} from "react";
import { Link } from "react-router-dom";
import ConfirmAlert from "./ui-snippets/ConfirmAlert";
import LoadingSpinner from "./ui-snippets/LoadingSpinner";
import { toast } from 'sonner';
import api from "../axiosService";
import { useNavigate } from "react-router-dom";


const Box = ({ session, onDelete }) => {
    const [type, setType] = useState(session.session_status);
    const [showAlert, setShowAlert] = useState(false);
    const [isloading, setIsloading] = useState(false);
    const navigate = useNavigate();

    const deleteSession = useCallback(async () => {
        setIsloading(true);
      try {
        const url = `/sessions/session/${session.session_id}`;
        await api.delete(url);

        toast.success('Session deleted successfully!', {
            duration: 3000
          });  

        // ✅ Remove from parent DOM
         if (onDelete) onDelete(session.session_id);

      }
      catch(e) {
        console.error(e);
        toast.error('Failed to delete session.', {
            duration: 3000
          });  
      }
      finally {
        setIsloading(false);
      }

    }, [session]);

    const handleCancelClick = useCallback(() => setShowAlert(true), []);
    const handleConfirmCancel = useCallback(async () => {
        setShowAlert(false);
        await deleteSession();
    }, [deleteSession]);

    const handleCancelAlert = useCallback(() => setShowAlert(false), []);

    return (
        <div className={`box_element ${type}`}>
            <Link to={`/session/details/${session.session_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="session-card-content">
                <div className="session-header">
                    <h2 className="session-title">{session.course_name}</h2>
                    <span className={`status-tag ${type}`}>
                    {session.session_status === "completed"
                        ? "Completed"
                        : session.session_status === "pending"
                            ? "pending"
                            : session.session_status === "scheduled"
                                ? "scheduled"
                                : "canceled"}
                    </span>
                </div>

                <p className="session-time">
                    <FaClock className="clock-icon" /> {session.session_duration} | {session.session_date?.slice(5)}
                </p>

                <div className="session-details">
                    <div className="tutor">
                        <strong>{session.tutor_name}</strong>
                        <p>Tutor</p>
                    </div>
                    <div className="divider"></div>
                    <div className="student">
                        <strong>{session.student_name}</strong>
                        <p>Student</p>
                    </div>
                </div>

                <div className="feedback">
                    <p>Feedback:</p>
                    <div className="stars">
                        {[...Array(5)].map((_, index) => (
                        <FaStar
                            key={index}
                            className="star-icon"
                            style={{
                            color: index < session.rating ? "#ffc107" : "#e4e5e9" // gold if filled, gray otherwise
                            }}
                        />
                        ))}
                    </div>

                    <div className="edit-btns" style={{marginLeft: 'auto', paddingTop: '10px', paddingRight: '10px', display: 'flex', gap: '15px'}}>
                        <i className='bx bxs-pencil edit' style={{color: 'gray'}}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); 
                            navigate(`/session/edit/${session.session_id}/${session.tutor_id}`, {state: { source: 'profile' },
                                state: { source: 'activity' }});
                            
                          }}
                          ></i> 
                        <i className='bx bxs-trash delete'style={{color: 'gray'}}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); 
                            handleCancelClick();
                            
                          }}
                          ></i>
                    </div>
                </div>

            </div>
            </Link>

                    <ConfirmAlert 
                          visible={showAlert}
                          message={isloading ? <LoadingSpinner/> : "Are you sure you want to delete this session?"}
                          onConfirm={handleConfirmCancel}
                          onCancel={handleCancelAlert}
                          alert={"This action will delete comments and feedback associated with this session."}
                  />
        </div>
    );
};

export default Box;
