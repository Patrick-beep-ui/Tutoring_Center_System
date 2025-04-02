import { FaClock, FaStar } from "react-icons/fa";// Import icons
import {useState} from "react";


const Box = ({ session}) => {
    const [type, setType] = useState(session.session_status);

    return (
        <div className={`box_element ${type}`}>
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
              : "Unknown"}
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
                            <FaStar key={index} className="star-icon" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Box;
