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
        <div className="h-auto min-h-[100px] w-[350px] max-w-full rounded-xl border-t-[5px] border-t-[#459bf8] bg-white p-[15px] shadow-[2px_4px_10px_rgba(0,0,0,0.1)] [&_strong]:text-[13px] [&_strong]:text-[#333]">
            <div className="h-[180px]">
                <div className="flex items-center justify-between">
                    <h2 className="block max-w-full truncate whitespace-nowrap text-left text-[17px]">{`SID: ${feedback.session_id}`}</h2>
                    <span className="rounded-xl px-2.5 py-[3px] text-xs text-white" style={{ backgroundColor: color }}>
                    {`${feedback.rating}`} <FaStar className="text-yellow-400" />
                    </span>
                </div>

                <p className="my-2.5 flex items-center gap-1 text-[13px] text-[#555]">
                    <FaBook className="text-[#555]" /> {feedback.course_name}
                </p>
                <div className="my-2.5 rounded-[5px] bg-[#f5f5f5] p-2.5">
                    <p className="mb-0 text-xs">
                        {feedback.feedback_text && feedback.feedback_text.length > MAX_LENGTH
                        ? feedback.feedback_text.substring(0, MAX_LENGTH) + "..."
                        : feedback.feedback_text}
                    </p>
                </div>
                <div className="my-[15px] flex items-center justify-between text-center">
                    <div className="flex-1 text-[10px]">
                        <strong>{feedback.tutor_name}</strong>
                        <p>Tutor</p>
                    </div>
                    <div className="h-[30px] w-px bg-[#ddd]"></div>
                    <div className="flex-1 text-[10px]">
                        <strong>{feedback.student_name}</strong>
                        <p>Student</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Box;
