import { FaClock, FaStar } from "react-icons/fa";// Import icons
import {useState} from "react";


const Box = ({ feedback }) => {
    const [type, setType] = useState("completed");
    console.log("Feedback in Box:", feedback);

    return (
        <div className={`box_element ${type}`}>
            <div className="session-card-content">
                <div className="session-header">
                    <h2 className="session-title">Hola</h2>
                    <span className={`status-tag ${type}`}>
                    {type === "completed"
                        ? "Completed"
                        : feedback.session_status === "pending"
                            ? "pending"
                            : feedback.session_status === "scheduled"
                                ? "scheduled"
                                : "Unknown"}
                    </span>
                </div>

                <p className="session-time">
                    <FaClock className="clock-icon" /> {'2h'} | {'17th Aug, 2023 - 10:00 AM'}
                </p>

                <div className="session-details">
                    <div className="tutor">
                        <strong>{feedback.tutor_name}</strong>
                        <p>Tutor</p>
                    </div>
                    <div className="divider"></div>
                    <div className="student">
                        <strong>{feedback.student_name}</strong>
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
