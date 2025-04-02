import "../App.css";

const TutorBox = ({ tutor }) => {
    return (
        <div className="tutor-box">
            <div className="tutor-header">
                <div className="avatar"></div>
                <div>
                    <h3 className="tutor-name">{tutor.name}</h3>
                    <p className="tutor-role">{tutor.role}</p>
                </div>
            </div>

            {tutor.schedule && (
                <div className="tutor-schedule">
                    <div>
                        <p><strong>Schedule Changes:</strong></p>
                    </div>

                    <div>
                        {tutor.schedule.map((day, index) => (
                            <p key={index}>
                                {day.day}: <span className="old-time">{day.oldTime}</span> → <span className="new-time">{day.newTime}</span>
                            </p>
                        ))}
                    </div>

                </div>
            )}

            {tutor.status && (
                <div className="tutor-status">
                    <p><strong>Status:</strong> <span className="status-active">Active</span> → <span className="status-inactive">{tutor.status}</span></p>
                </div>
            )}

            {tutor.sensitiveComment && (
                <div className="tutor-comment">
                    <p><strong>Sensitive Comment:</strong> <em>{tutor.sensitiveComment}</em></p>
                    <button className="details-btn">See details about the session</button>
                </div>
            )}
        </div>
    );
};

export default TutorBox;
