const TutorBox = ({ tutor }) => {
    return (
        <div className="mb-[15px] flex w-full max-w-[600px] flex-col rounded-[10px] border border-[#ddd] bg-white p-[15px] shadow-[0_2px_5px_rgba(0,0,0,0.15)]">
            <div className="flex items-center gap-3 border-b border-[#ddd] pb-2.5">
                <div className="h-[45px] w-[45px] rounded-full bg-[#f5c085]"></div>
                <div>
                    <h3 className="m-0 text-left text-base font-bold">{tutor.name}</h3>
                    <p className="m-0 text-sm text-[#777]">{tutor.role}</p>
                </div>
            </div>

            {tutor.schedule && (
                <div className="ml-0 flex items-center justify-between border-0 py-2.5 pl-0 [&_p]:my-1 [&_p]:flex [&_p]:justify-between [&_p]:px-2.5 [&_p]:text-sm">
                    <div>
                        <p><strong>Schedule Changes:</strong></p>
                    </div>

                    <div>
                        {tutor.schedule.map((day, index) => (
                            <p key={index}>
                                {day.day}: <span className="text-red-600 line-through">{day.oldTime}</span> → <span className="font-bold text-green-700">{day.newTime}</span>
                            </p>
                        ))}
                    </div>

                </div>
            )}

            {tutor.status && (
                <div className="py-2.5 text-sm">
                    <p><strong>Status:</strong> <span className="font-bold text-red-600 line-through">Active</span> → <span className="font-bold text-green-700">{tutor.status}</span></p>
                </div>
            )}

            {tutor.sensitiveComment && (
                <div className="py-2.5 text-sm [&_em]:text-[#666]">
                    <p><strong>Sensitive Comment:</strong> <em>{tutor.sensitiveComment}</em></p>
                    <button type="button" className="mt-2 cursor-pointer rounded-[5px] border-0 bg-red-600 px-3 py-[7px] text-sm text-white hover:bg-red-800">See details about the session</button>
                </div>
            )}
        </div>
    );
};

export default TutorBox;
