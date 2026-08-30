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
    const statusTone = {
        scheduled: { border: "border-t-[#009dff]", badge: "bg-[#009dff]" },
        completed: { border: "border-t-[#00c522]", badge: "bg-[#00c522]" },
        pending: { border: "border-t-orange-500", badge: "bg-orange-500" },
        canceled: { border: "border-t-[#dc143c]", badge: "bg-[#dc143c]" },
    }[type] ?? { border: "border-t-red-600", badge: "bg-red-600" };

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
        <div className={`h-auto min-h-[100px] w-[350px] max-w-full rounded-xl border-t-[5px] bg-white p-[15px] shadow-[2px_4px_10px_rgba(0,0,0,0.1)] [&_strong]:text-[13px] [&_strong]:text-[#333] ${statusTone.border}`}>
            <Link to={`/session/details/${session.session_id}`} className="text-inherit no-underline">
            <div className="h-40">
                <div className="flex items-center justify-between">
                    <h2 className="block max-w-full truncate whitespace-nowrap text-left text-[17px]">{session.course_name}</h2>
                    <span className={`rounded-xl px-2.5 py-[3px] text-[11px] text-white ${statusTone.badge}`}>
                    {session.session_status === "completed"
                        ? "Completed"
                        : session.session_status === "pending"
                            ? "pending"
                            : session.session_status === "scheduled"
                                ? "scheduled"
                                : "canceled"}
                    </span>
                </div>

                <p className="my-2.5 flex items-center gap-1 text-[13px] text-[#555]">
                    <FaClock className="text-[#555]" /> {session.session_duration} | {session.session_date?.slice(5)}
                </p>

                <div className="my-[15px] flex items-center justify-between text-center">
                    <div className="flex-1 text-[10px]">
                        <strong>{session.tutor_name}</strong>
                        <p>Tutor</p>
                    </div>
                    <div className="h-[30px] w-px bg-[#ddd]"></div>
                    <div className="flex-1 text-[10px]">
                        <strong>{session.student_name}</strong>
                        <p>Student</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 [&>p]:mb-0">
                    <p>Feedback:</p>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => (
                        <FaStar
                            key={index}
                            style={{
                            color: index < session.rating ? "#ffc107" : "#e4e5e9" // gold if filled, gray otherwise
                            }}
                        />
                        ))}
                    </div>

                    <div className="ml-auto flex gap-[15px] pr-2.5 pt-2.5">
                        <i className='bx bxs-pencil edit text-gray-500'
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); 
                            navigate(`/session/edit/${session.session_id}/${session.tutor_id}`, { state: { source: 'activity' } });
                            
                          }}
                          ></i> 
                        <i className='bx bxs-trash text-gray-500'
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
