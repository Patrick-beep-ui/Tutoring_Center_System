const ActivityCard = ({ time, title, description, tag }) => {
    const tagTone = {
        System: "bg-gray-300 text-gray-800",
        Reminder: "bg-indigo-200 text-indigo-700",
        Alert: "bg-orange-500 text-amber-950",
    }[tag] ?? "bg-gray-300 text-gray-800";

    return (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white px-6 py-5 text-left shadow-[0_4px_10px_rgba(0,0,0,0.04)] transition-all duration-300 ease-in-out">
            <div className="relative">
                <h4 className="mb-1.5 text-xl font-semibold">{title}</h4>
                <span className={`absolute right-0 top-0 rounded-xl px-2.5 py-1 text-xs font-semibold uppercase ${tagTone}`}>{tag}</span>
                <div className="mb-2.5 text-sm text-gray-500">{time}</div>
                <p className="mt-1.5 text-[0.95rem] leading-normal text-gray-600">{description}</p>
            </div>
        </div>
    );
};

export default ActivityCard;
