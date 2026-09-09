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
        <div className="m-[19px] rounded-[15px] bg-white p-5 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
            <h3>Top Tutors</h3>
            <p>{subtitle}</p>
            {tutors.length > 0 ? (
                <ol className="list-none p-0">
                    {tutors.map((tutor, index) => (
                        <li key={tutor.tutor_name} className="mx-[30px] my-[15px] flex items-center gap-2.5 rounded-[15px] border border-[var(--gray)] bg-[#f9f9f9] px-5 py-2.5 text-left">
                            <span className="min-w-[2.5ch] font-bold text-[var(--blue)]">#{index + 1}</span>
                            <span className="min-w-0 flex-1">{tutor.tutor_name}</span>
                            <span className="whitespace-nowrap font-bold text-[var(--blue)]">{formatHours(tutor.total_hours)}</span>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="italic text-[var(--dark-gray)]">No completed sessions were recorded for this period.</p>
            )}
        </div>
    );
};

export default TopTutorsList;
