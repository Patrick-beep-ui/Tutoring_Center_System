import { useMemo } from "react";

const containerClass = "flex mt-[80px] mb-[20px] ml-[20px]";
const navClass = "box-border bg-[rgba(175,175,175,0.2)] border-b-[0.7px] border-[#ffffffab] px-[70px] py-[9px] rounded-[3px] max-[991.98px]:p-[9px_12px]";
const navUlClass = "list-none float-right m-0 p-0 flex gap-[80px] max-[991.98px]:gap-0 max-[991.98px]:float-none max-[991.98px]:flex-col";
const navLiBaseClass = "px-[20px] no-underline text-[14px] cursor-pointer rounded-[4px] transition-[background] duration-[200ms] max-[991.98px]:w-full max-[991.98px]:p-[10px_12px]";
const navLiHoverClass = "hover:bg-[#ffffffab]";
const navLiActiveClass = "bg-[#333] text-white";

const Mini_Nav = ({ setSelectedSection, selectedSection }) => {

    const sections = useMemo(() => [
        { id: 'sessions', label: 'Sessions' },
        { id: 'feedback', label: 'Feedback' },
        { id: 'tutors', label: 'Tutors' },
        { id: 'alerts', label: 'Alerts' }
    ], []);

    return (
        <div className={containerClass}>
            <nav className={navClass}>
                <ul className={navUlClass}>
                    {sections.map(s => 
                        <li
                            key={s.id}
                            onClick={() => setSelectedSection(s.id)}
                            className={`${navLiBaseClass} ${selectedSection === s.id ? navLiActiveClass : ''} ${navLiHoverClass}`}
                        >
                            {s.label}
                        </li>
                    )}
                </ul>
            </nav>
        </div>
    );
};

export default Mini_Nav;
