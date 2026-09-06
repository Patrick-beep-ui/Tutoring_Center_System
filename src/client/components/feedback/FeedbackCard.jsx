import { FaStar, FaBook  } from "react-icons/fa";// Import icons
import {useState, useMemo} from "react";

const MAX_LENGTH = 75;

const Box = ({ feedback }) => {
    const color = useMemo(() => {
        const map = {
          1: "#ff4d4f",
          2: "#ff7a45",
          3: "#facc15",
          4: "#84cc16",
          5: "#22c55e",
        };
        return map[feedback.rating] || "#d9d9d9";
      }, [feedback.rating]);

    return (
        <div className={`box_element feedback-box`} style={{ borderColor: '#459bf8' }}>
            <div className="session-card-content" style={{ height: '180px' }}>
                <div className="session-header">
                    <h2 className="session-title">{`SID: ${feedback.session_id}`}</h2>
                    <span className={`status-tag`} style={{ backgroundColor: color, fontSize: '12px' }}>
                    {`${feedback.rating}`} <FaStar className="star-icon" />
                    </span>
                </div>

                <p className="session-time">
                    <FaBook className="clock-icon" /> {feedback.course_name}
                </p>
                <div className="feedback-text" style={{ backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "5px", margin: "10px 0" }}>
                    <p style={{marginBottom: '0px', fontSize: '12px'}}>
                        {feedback.feedback_text && feedback.feedback_text.length > MAX_LENGTH
                        ? feedback.feedback_text.substring(0, MAX_LENGTH) + "..."
                        : feedback.feedback_text}
                    </p>
                </div>
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
            </div>
        </div>
    );
};

export default Box;
