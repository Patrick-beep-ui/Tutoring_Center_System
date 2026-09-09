const AlertBox = ({ title, message, type, details }) => {
    const tones = {
        urgent: { border: "border-l-red-600", badge: "bg-red-600" },
        warning: { border: "border-l-orange-500", badge: "bg-orange-500" },
        information: { border: "border-l-sky-500", badge: "bg-sky-500" },
    };
    const tone = tones[type] ?? tones.information;

    return (
        <div className={`mb-6 mr-5 rounded-lg border-l-[6px] bg-white p-4 shadow-md ${tone.border}`}>
            <div className="flex items-center justify-between gap-4">
                <h3 className="text-base">{title}</h3>
                <span className={`rounded-full px-3 py-1 text-sm font-normal text-white ${tone.badge}`}>
                    {type === "urgent" ? "Urgent" : type === "warning" ? "Warning" : "Information"}
                </span>
            </div>
            <p className="my-2 text-left text-sm text-[#555]">{message}</p>
            <ul className="m-0 list-none p-0">
                {details.map((detail, index) => (
                    <li key={index} className="my-1 text-left text-sm">
                        <strong className="text-[13px] text-black">{detail.label}:</strong> {detail.value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AlertBox;
