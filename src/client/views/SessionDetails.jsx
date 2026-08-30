import { useState, useEffect, useCallback } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Header from "../components/Header";
import Popup from "reactjs-popup";
import auth from "../authService";
import { toast } from "sonner";

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
        const sessionResponse = await auth.get(`/api/sessions/session_details/${session_id}`);
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
        const commentResponse = await auth.get(`/api/comments/${session_id}`);
        const commentsData = commentResponse.data.comments;
  
        console.log("Comments: ", commentsData);
        setComment(commentsData);
      } catch (e) {
        console.error(e);
      }
    };
  
    fetchCommentsData();
  }, []);  
  

  const processData = useCallback(async (formData) => {
    try {

      const request = await auth.post(`/api/comments/${session_id}`, formData);
      toast.success("Comment added successfully!");

      const { comments } = request.data;
      setComment(comments);
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add comment. Please try again.");
    }
  }, [session_id, comment, isOpen]);

  const addComment = useCallback(() => {
    setIsOpen(true);
  }, [isOpen]);

  const removeComment = useCallback(async () => {
    try {
        const url = `/api/comments/${session_id}/${commentToRemove}`
        auth.delete(url)

        setComment(prevComments => prevComments.filter(c => c.comment_id !== commentToRemove));

        toast.success("Comment removed successfully!");
        setIsRemoveOpen(false)
        setCommentToRemove(null);
    } 
    catch(e) {
        console.error(e);
    }
  }, [session_id, commentToRemove, isRemoveOpen]);

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
      <section className="section">
      <div className="mb-5 w-full">
        {session.map(s => (
          <div className="grid w-full grid-cols-1 items-center rounded-lg border border-[#ddd] bg-white p-2 pt-5 md:grid-cols-2" key={s.id}>
            <div className="flex h-full w-full flex-col text-left [&_.form-group]:mb-2 [&_.form-group]:flex [&_.form-group]:flex-col [&_.form-group_label]:pb-0 [&_.form-group_label]:pl-0 [&_.form-group_label]:text-sm [&_.form-group_label]:font-medium [&_.form-group_label]:text-[#574f4f] [&_.form-group_p]:mb-0.5 [&_.form-group_p]:text-[1.4rem] [&_.form-group_p]:font-medium">
              <div className="form-group mb-[30px]!">
                <p>{s.course_name} Tutoring Session</p>
                <span className="text-xl font-medium text-[var(--dark-gray)]">Tutor: {s.tutor_name}</span>
              </div>
              <div className="form-group flex-row! items-center justify-start gap-5">
                <div id="student-id-container" className="w-[250px]">
                  {studentIsOnSystem ? (
                    <>
                      <label>Student: </label>
                      <Link to={`/profile/${s.student_user_id}`}>
                      <div className="flex items-center rounded-[5px] bg-[#c9ccce] p-1 [&_p]:text-[1.1rem]!">
                        <img src={`/profile/tutor${s.student_user_id}.jpg`} alt="" className="h-10 w-[45px] rounded-full object-cover"/>
                        <div className="ms-4">
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
                <div id="date-container" className="w-[250px]">
                  <label htmlFor={`session-date-${s.id}`}>Session Date:</label>
                  <p>{s.session_date}</p>
                </div>
              </div>
              <div className="flex">
              <div className="form-group flex-row! items-center justify-start gap-5">
                <div className="w-[250px]" id="start-time-container">
                  <label htmlFor={`session-time-${s.id}`}>Session Start Time:</label>
                  <p>{s.session_time}</p>
                </div>
                <div className="w-[250px]" id="duration-container">
                  <label htmlFor={`session-hours-${s.id}`}>Session Hours:</label>
                  <p>{s.session_hours}</p>
                </div>
              </div>
              </div>
            </div>
            <div className="flex h-full w-full flex-col text-left [&_.form-group]:mb-2 [&_.form-group]:flex [&_.form-group]:flex-col [&_.form-group_label]:text-sm [&_.form-group_label]:font-medium [&_.form-group_label]:text-[#574f4f] [&_.form-group_p]:mb-0.5 [&_.form-group_p]:text-[1.4rem] [&_.form-group_p]:font-medium">
            <div className="form-group">
                <label htmlFor={`session-feedback-${s.id}`}>Session Topics:</label>
                <p className="h-auto text-base! font-normal!" >{s.session_topics}</p>
              </div>
              <div className="form-group">
                <label htmlFor={`session-feedback-${s.id}`}>Session Outcomes:</label>
                <p className="h-auto text-base! font-normal!" >{s.session_feedback}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(user.user_id === session[0].tutor_id || user.role === 'admin' || user.role === 'dev') && (
        <div>
          <div className="flex flex-wrap content-center justify-start gap-5">
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
                <div className="h-fit w-[450px] rounded-[17px_17px_27px_27px] border border-gray-200 bg-white shadow-[0_187px_75px_rgba(0,0,0,0.01),0_105px_63px_rgba(0,0,0,0.05),0_47px_47px_rgba(0,0,0,0.09),0_12px_26px_rgba(0,0,0,0.1)]" key={c.comment_id}>
                  <span className="relative flex h-[50px] w-full items-center border-b border-[#f1f1f1] pl-5 text-[13px] font-bold text-[#47484b] after:absolute after:bottom-[-1px] after:h-px after:w-[8ch] after:bg-[#47484b] after:content-['']">Comments</span>
                  <div className="grid grid-cols-[35px_1fr] gap-5 p-5">
                    <div className="m-0 grid h-fit w-[35px] grid-cols-[auto] rounded-[5px] bg-[#f1f1f1] [&_hr]:m-auto [&_hr]:h-px [&_hr]:w-4/5 [&_hr]:border-0 [&_hr]:bg-[#dfe1e6]">
                      <button type="button" className="relative flex h-[35px] w-[35px] items-center justify-center rounded-[5px] border-0 bg-[#d43737] text-[var(--white)] outline-none transition-colors hover:bg-[#f5356e]" onClick={() => {
                        setIsRemoveOpen(true)
                        setCommentToRemove(c.comment_id)
                      }}>
                      <i className='bx bx-trash'></i>
                      </button>
                      <hr />
                    </div>
                    <div className="m-0 flex flex-col gap-[15px] p-0">
                      <div className="grid grid-cols-[40px_1fr] gap-2.5">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f1f1] after:absolute after:bottom-0 after:right-0 after:h-[9px] after:w-[9px] after:rounded-full after:border-2 after:border-white after:bg-[#0fc45a] after:content-['']">
                          <svg fill="none" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinejoin="round" fill="#707277" strokeLinecap="round" strokeWidth="2" stroke="#707277" d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z"></path>
                            <path strokeWidth="2" fill="#707277" stroke="#707277" d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"></path>
                          </svg>
                        </div>
                        <div className="flex w-full flex-col items-start justify-center gap-[3px]">
                          <span className="text-xs font-bold text-[#47484b]">{c.student_name}</span>
                          <p className="text-[10px] font-semibold text-[#acaeb4]">{`${dayOfWeek}, ${month} ${dayWithSuffix} at ${formattedTime}`}</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold leading-4 text-[#5f6064]">
                        {c.comment}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button type="button" className="mt-10 rounded-md border border-[var(--blue)] bg-[var(--blue)] px-3 py-1.5 text-white transition-colors hover:bg-[#252f6b]" onClick={addComment}>Add Comment</button>

          <Popup open={isOpen} onClose={() => setIsOpen(false)} className="custom-popup add-comment-popup">
            <div className="flex max-h-[80vh] h-full w-full flex-col overflow-y-auto bg-transparent px-9 py-8 max-md:px-7 max-md:py-6 max-[580px]:px-6 max-[580px]:py-5">
              <strong className="mb-5 block shrink-0 border-b-2 border-[var(--yellow)] pb-2.5 text-center text-2xl font-semibold text-[var(--blue)]">Add Comment</strong>
              <form onSubmit={handleSubmit(processData)} className="flex flex-col gap-4">
              <input type="hidden" {...register("user_id")} value={user.user_id} />
                <section className="flex flex-col gap-1">
                  <textarea cols="30" rows="10" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--blue)] focus:outline-none focus:ring-2 focus:ring-blue-100" {...register("content", { required: true })}></textarea>
                  {errors.content && <span className="text-sm text-red-600">This field is required</span>}
                </section>
                <button type="submit" className="rounded-md border border-[var(--blue)] bg-[var(--blue)] px-3 py-1.5 text-white hover:bg-[#252f6b]">Submit</button>
              </form>
            </div>
          </Popup>

          <Popup open={isRemoveOpen} onClose={() => setIsRemoveOpen(false)} className="custom-popup add-delete-popup">
            <div className="p-6 text-center">
              <strong className="block text-xl font-semibold text-[var(--blue)]">Confirm Delete</strong>
              <p className="my-4 text-base text-gray-700">Are you sure you want to delete this comment?</p>
              <div className="flex justify-center gap-3">
                <button className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700" onClick={removeComment}>
                  Delete
                </button>
                <button className="rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200" onClick={() => setIsRemoveOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </Popup>

        </div>
      )}
      </section>
    </>
  )
}

export default SessionDetails;
