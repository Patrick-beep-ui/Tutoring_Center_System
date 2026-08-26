import "../App.css"

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatHours = (hours) => {
    const n = Number(hours);
    if (Number.isNaN(n)) return "0h";
    return `${Number.isInteger(n) ? n : n.toFixed(1)}h`;
};

const TopTutorsList = ({ tutors, window: rankWindow, semesterCode }) => {
    const mode = rankWindow?.mode;
    const range = rankWindow?.from && rankWindow?.to
        ? `${formatDate(rankWindow.from)} – ${formatDate(rankWindow.to)}`
        : "";

    let subtitle = "Outstanding tutors of this week";
    if (mode === "last-week") {
        subtitle = semesterCode
            ? `Last active week · ${semesterCode}${range ? ` (${range})` : ""}`
            : `Last active week${range ? ` · ${range}` : ""}`;
    } else if (mode === "this-week" && range) {
        subtitle = `Outstanding tutors of this week · ${range}`;
    }

    return (
        <div className="top-tutors">
            <h3>Top Tutors</h3>
            <p>{subtitle}</p>
            {tutors.length > 0 ? (
                <ol>
                    {tutors.map((tutor, index) => (
                        <li key={tutor.tutor_name}>
                            <span className="top-tutor-rank">#{index + 1}</span>
                            <span className="top-tutor-name">{tutor.tutor_name}</span>
                            <span className="top-tutor-hours">{formatHours(tutor.total_hours)}</span>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="top-tutors-empty">No completed sessions were recorded for this period.</p>
            )}
        </div>
    );
};

export default TopTutorsList;
