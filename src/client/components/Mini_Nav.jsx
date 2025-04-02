import { NavLink, Link } from "react-router-dom";
import "../App.css";



const Mini_Nav = () => {

    return (

        <>

            <div className="navbar-container">
                <nav>
                    <ul>
                        <li><NavLink to='/activity'>Sessions</NavLink> </li>
                        <li><NavLink to='/activity-students'>Students</NavLink></li>
                        <li><NavLink to='/activity-tutors'>Tutors</NavLink></li>
                        <li><NavLink to='/activity-alerts'>Alerts</NavLink></li>
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