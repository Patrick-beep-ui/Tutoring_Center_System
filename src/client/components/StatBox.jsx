
const StatBox = ({ title, value, subtitle, color }) => {
    return (
        <div className="stat-box">
            <h3>{title}</h3>
            <h2>{value}</h2>
            <p style={{ color }}>{subtitle}</p>
        </div>
    );
};


export default StatBox;
