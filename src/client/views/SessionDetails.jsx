import { useState, useEffect } from "react";
import axios from "axios";
import {v4 as uuid} from "uuid";
import { Link, useOutletContext, Outlet, useParams } from "react-router-dom";
import Header from "../components/Header";
import "../App.css"

function SessionDetails() {
    const [session, setSession] = useState([]);
    const [comment, setComment] = useState([]);
    const {session_id} = useParams();

    useEffect(() => {
        const fetchData = async () => {
           try {
                const [sessionResponse, commentResponse] = await Promise.all([
                    axios.get(`/api/session/details/${session_id}`),
                    axios.get(`/api/comments/${session_id}`)
                ]);

                const sessionData = sessionResponse.data.session;
                const commentsData = commentResponse.data.comments;

                console.log("Session: ", sessionData);
                console.log("Comments: ", commentsData);

                setSession(sessionData);
                setComment(commentsData);

           } catch(e) {
                console.error(e)
           }
        }

        fetchData();
    }, [])

    if (session.length === 0) {
        return <svg viewBox="25 25 50 50" id="loading-state-svg" >
        <circle r="20" cy="50" cx="50" id="loading-state"></circle>
      </svg>; 
    }

    return(
        <>
        <Header/>
        <section className="session-details-container section">
            <div className="session-details">
                {session.map(s => 
                    <div className="session-data">
                        <p><strong>Course: </strong>{s.course_name}</p>
                        <p><strong>Tutor: </strong>{s.tutor_name}</p>
                        <p><strong>Student Id: </strong>{s.student_id}</p>
                        <p><strong>Session Date: </strong>{s.session_date}</p>
                        <p><strong>Session Start Time: </strong>{s.session_time}</p>
                        <p><strong>Session Hours: </strong>{s.session_hours}</p>
                        <p><strong>Session Outcomes: </strong>{s.session_feedback}</p>
                    </div>)}
            </div>
            <div className="session-comments">
                <div className="comment">
                {comment.map(c => {
                    const date = new Date(c.creation_date);
                    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
                    const day = date.getDate();
                    const month = date.toLocaleString('en-US', { month: 'long' });
                    const year = date.getFullYear();

                    // Add ordinal suffix
                    const getOrdinalSuffix = (day) => {
                        if (day > 3 && day < 21) return 'th';
                        switch (day % 10) {
                            case 1:  return 'st';
                            case 2:  return 'nd';
                            case 3:  return 'rd';
                            default: return 'th';
                        }
                    };

                    const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;

                    // Format time
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}${hours >= 12 ? 'pm' : 'am'}`;

                    return (
                        <div class="card comment">
                        <span class="title">Comments</span>
                        <div class="comments">
                          <div class="comment-react">
                            <button>
                              <svg fill="none" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                <path fill="#707277" stroke-linecap="round" stroke-width="2" stroke="#707277" d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"></path>
                              </svg>
                            </button>
                            <hr></hr>
                            <span>14</span>
                          </div>
                          <div class="comment-container">
                            <div class="user">
                              <div class="user-pic">
                                <svg fill="none" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                                  <path stroke-linejoin="round" fill="#707277" stroke-linecap="round" stroke-width="2" stroke="#707277" d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z"></path>
                                  <path stroke-width="2" fill="#707277" stroke="#707277" d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"></path>
                                </svg>
                              </div>
                              <div class="user-info">
                                <span>{c.student_name}</span>
                                <p>{`${dayOfWeek}, ${month} ${dayWithSuffix} at ${formattedTime}`}</p>
                              </div>
                            </div>
                            <p class="comment-content">
                              {c.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                })}
                

                </div>
            </div>
        </section>
        </>
    )
} 

export default SessionDetails;
