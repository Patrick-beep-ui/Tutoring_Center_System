import { NavLink, Link } from "react-router-dom";
import {useState} from "react";

import "../App.css";



const Mini_Nav = ({setSelectedSection }) => {
    const [selectedItem, setSelectedItem] = useState(null);

    return (

        <>

            <div className="navbar-container">
                <nav>
                    <ul>
                        <li onClick={() => setSelectedSection('sessions')}>Sessions</li>
                        <li onClick={() => setSelectedSection('tutors')}>Tutors</li>
                        <li onClick={() => setSelectedSection('alerts')}>Students</li>
                        <li onClick={() => setSelectedSection('alerts')}>Alerts</li>
                    </ul>
                </nav>

                <div className="date-box">
                    <select name="" id="select-period">
                        <option value="">This Week</option>
                        <option value="">This Month</option>
                        <option value="">Testing</option>
                    </select>

                </div>




            </div>

        </>

    );
};

export default Mini_Nav;