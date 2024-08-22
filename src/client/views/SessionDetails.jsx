import { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Header from "../components/Header";
import Popup from "reactjs-popup";
import "../App.css";

function SessionDetails() {
  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange" });
  const [session, setSession] = useState([]);
  const [comment, setComment] = useState([]);
  const { session_id } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [commentToRemove, setCommentToRemove] = useState(null);

  //variable to check if the student who received the session is enrolled in the system
  const [studentIsOnSystem, setStudentIsOnSystem] = useState(false);
  const {user} = useOutletContext();

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const sessionResponse = await axios.get(`/api/session/details/${session_id}`);
        const sessionData = sessionResponse.data.session;
  
        console.log("Session: ", sessionData);
        setSession(sessionData);

        if (sessionData[0].student_name && sessionData[0].student_user_id != null) {
          setStudentIsOnSystem(true);
          console.log(true);
        }

      } catch (e) {
        console.error(e);
      }
    };
  
    fetchSessionData();
  }, [session_id]);
  

  useEffect(() => {
    const fetchCommentsData = async () => {
      try {
        const commentResponse = await axios.get(`/api/comments/${session_id}`);
        const commentsData = commentResponse.data.comments;
  
        console.log("Comments: ", commentsData);
        setComment(commentsData);
      } catch (e) {
        console.error(e);
      }
    };
  
    fetchCommentsData();
  }, []);  
  

  const processData = async (formData) => {
    try {
      const response = await fetch(`/api/comments/${session_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const { comments } = await response.json();
      setComment(comments);
      setIsOpen(false);
    } catch (e) {
      console.error(e);
    }
  }

  const addComment = () => {
    setIsOpen(true);
  }

  const removeComment = async () => {
    try {
      console.log(commentToRemove)
        const url = `/api/comments/${session_id}/${commentToRemove}`
        axios.delete(url)
        setIsRemoveOpen(false)
    } 
    catch(e) {
        console.error(e);
    }
  }

  if (session.length === 0) {
    return (
      <svg viewBox="25 25 50 50" id="loading-state-svg">
        <circle r="20" cy="50" cx="50" id="loading-state"></circle>
      </svg>
    );
  }

  return (
    <>
      <Header />
      <section className="session-details-container section">
      <div className="session-details">
        {session.map(s => (
          <div className="session-data" key={s.id}>
            <div className="session-data-container">
              <div className="form-group tutor-session-data">
                <p>{s.course_name} Tutoring Session</p>
                <span>Tutor: {s.tutor_name}</span>
              </div>
              <div className="form-group form-group-division">
                <div id="student-id-container" className="fg-inside-division">
                  {studentIsOnSystem ? (
                    <>
                      <label>Student: </label>
                      <Link to={`/profile/${s.student_user_id}`}>
                      <div className="d-flex align-items-center student-session-data">
                        <img src={`/profile/tutor${s.student_user_id}.jpg`} alt="" style={{width: '45px', height: '40px'}} class="rounded-circle"/>
                        <div className="ms-3">
                          <p>{s.student_name}</p>
                        </div>
                      </div>
                      </Link>
                    </>
                  ) : (
                    <>
                      <label htmlFor={`student-id-${s.id}`}>Student ID:</label>
                      <p>{s.student_id}</p>
                    </>
                  )}
                </div>
                <div id="date-container" className="fg-inside-division">
                  <label htmlFor={`session-date-${s.id}`}>Session Date:</label>
                  <p>{s.session_date}</p>
                </div>
              </div>
              <div className="session-date-data">
              <div className="form-group form-group-division">
                <div className="fg-inside-division" id="start-time-container">
                  <label htmlFor={`session-time-${s.id}`}>Session Start Time:</label>
                  <p>{s.session_time}</p>
                </div>
                <div className="fg-inside-division" id="duration-container">
                  <label htmlFor={`session-hours-${s.id}`}>Session Hours:</label>
                  <p>{s.session_hours}</p>
                </div>
              </div>
              </div>
            </div>
            <div className="session-data-container">
              <div className="form-group">
                <label htmlFor={`session-feedback-${s.id}`}>Session Outcomes:</label>
                <p id={`session-feedback`} >{s.session_feedback}</p>
              </div>
            </div>
          </div>
        ))}
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
                if (day > 3 && day < 21) return "th";
                switch (day % 10) {
                  case 1: return "st";
                  case 2: return "nd";
                  case 3: return "rd";
                  default: return "th";
                }
              };

              const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;

              // Format time
              const hours = date.getHours();
              const minutes = date.getMinutes();
              const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}${hours >= 12 ? 'pm' : 'am'}`;

              return (
                <div className="card comment" key={c.comment_id}>
                  <span className="title">Comments</span>
                  <div className="comments">
                    <div className="comment-react">
                      <button onClick={() => {
                        setIsRemoveOpen(true)
                        setCommentToRemove(c.comment_id)
                      }}>
                      <i className='bx bx-trash delete'></i>
                      </button>
                      <hr />
                    </div>
                    <div className="comment-container">
                      <div className="user">
                        <div className="user-pic">
                          <svg fill="none" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinejoin="round" fill="#707277" strokeLinecap="round" strokeWidth="2" stroke="#707277" d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z"></path>
                            <path strokeWidth="2" fill="#707277" stroke="#707277" d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"></path>
                          </svg>
                        </div>
                        <div className="user-info">
                          <span>{c.student_name}</span>
                          <p>{`${dayOfWeek}, ${month} ${dayWithSuffix} at ${formattedTime}`}</p>
                        </div>
                      </div>
                      <p className="comment-content">
                        {c.comment}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn btn-primary add-comment-btn" onClick={addComment}>Add Comment</button>

          <Popup open={isOpen} onClose={() => setIsOpen(false)} className="custom-popup add-comment-popup">
            <div className="popup-cell-msg">
              <strong>Add Comment</strong>
              <form onSubmit={handleSubmit(processData)} className="form-container add-comment-form">
              <input type="hidden" {...register("user_id")} value={user.user_id} />
                <section>
                  <textarea cols="30" rows="10" className="add-comment-textarea" {...register("content", { required: true })}></textarea>
                  {errors.content && <span>This field is required</span>}
                </section>
                <button type="submit" className="btn btn-primary">Submit</button>
              </form>
            </div>
          </Popup>

          <Popup open={isRemoveOpen} onClose={() => setIsRemoveOpen(false)} className="custom-popup add-delete-popup">
            <div className="popup-confirm-delete">
              <strong>Confirm Delete</strong>
              <h1>Are you sure you want to delete this comment? </h1>
              <button className="btn btn-danger" onClick={removeComment}>
                Delete
              </button>
              <button className="btn btn-secondary" onClick={() => setIsRemoveOpen(false)}>
                Cancel
              </button>
            </div>
          </Popup>

        </div>
      </section>
    </>
  )
}

export default SessionDetails;
