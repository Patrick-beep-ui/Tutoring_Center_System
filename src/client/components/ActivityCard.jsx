
import "../App.css"

const ActivityCard = ({ time, title, description, tag }) => {
    return (
        <div className="activity-card">
            <div className="activity-details">
                <h4 className="activity-title">{title}</h4>
                <span className={`tag ${tag.toLowerCase()}`}>{tag}</span>
                <div className="activity-time">{time}</div>
                <p className="activity-description">{description}</p>
            </div>
        </div>
    );
};

export default ActivityCard;
