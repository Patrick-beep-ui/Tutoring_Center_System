
import "../App.css";


const AlertBox = ({ title, message, type, details }) => {
    return (

        <div className={`box ${type}`}>
            <div className="box-header">
                <h3 className="box-title">{title}</h3>
                <span className={`badge ${type}`}>
          {type === "urgent" ? "Urgent" : type === "warning" ? "Warning" : "Information"}
        </span>
            </div>
            <p className="box-message">{message}</p>
            <ul className="box-details">
                {details.map((detail, index) => (
                    <li key={index}>
                        <strong className="box-message1" >{detail.label}:</strong> {detail.value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AlertBox;
