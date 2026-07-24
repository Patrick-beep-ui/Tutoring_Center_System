import { useMemo } from "react";
import "../App.css";

const Mini_Nav = ({ setSelectedSection, selectedSection }) => {

    const sections = useMemo(() => [
        { id: 'sessions', label: 'Sessions' },
        { id: 'feedback', label: 'Feedback' },
        { id: 'tutors', label: 'Tutors' },
        { id: 'alerts', label: 'Alerts' }
    ], []);

    return (
        <div className="navbar-container">
            <nav>
                <ul>
                    {sections.map(s => 
                        <li
                            key={s.id}
                            onClick={() => setSelectedSection(s.id)}
                            className={selectedSection === s.id ? 'active' : ''}
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
