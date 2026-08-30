import { useState, useEffect, useCallback, memo, useContext } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Profile from "../components/Picture";
import texts from "../texts/tutorProfile.json"
import auth from "../authService";
import Popup from "reactjs-popup";
import { toast } from "sonner";
import { SemesterContext } from "../context/currentSemester";


function TutorProfile() {
    const { user: contextUser } = useOutletContext(); 
    const [user, setUser] = useState([]);
    const [courses, setCourse] = useState([]);
    const [session, setSession] = useState(0);
    const [schedules, setSchedules] = useState([]);
    const [error, setError] = useState("");
    const { tutor_id, role } = useParams();
    const [profilePicUrl, setProfilePicUrl] = useState(`/profile/${role}${tutor_id}.webp?${new Date().getTime()}`);
    const [allCourses, setAllCourses] = useState([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);
    const [savingCourses, setSavingCourses] = useState(false);
    const [scheduleBlocks, setScheduleBlocks] = useState([]);
    const [savingSchedules, setSavingSchedules] = useState(false);

    console.log("User Role:", role);
    console.log("User context tole:", contextUser.role);

    const { selectedSemesterId } = useContext(SemesterContext);
    const semesterQuery = selectedSemesterId ? `?semester_id=${selectedSemesterId}` : '';

    const fetchTutorData = useCallback(async () => {
        try {
            const [TutorResponse, coursesResponse, sessionResponse, schedulesResponse] = await Promise.all([
                auth.get(`/api/tutors/${tutor_id}`),
                auth.get(`/api/courses/${tutor_id}${semesterQuery}`),
                auth.get(`/api/sessions/session_status/${tutor_id}${semesterQuery}`),
                auth.get(`/api/schedules/${tutor_id}${semesterQuery}`)
            ]);

            const tutorData = TutorResponse.data.tutor_info;
            const coursesData = coursesResponse.data.tutor_classes;
            const sessionData = sessionResponse.data.scheduled_sessions
            const schedulesData = schedulesResponse.data.schedules;

            console.log("Tutor:", tutorData);
            console.log("Courses:", coursesData);
            console.log("Session:", sessionData);
            console.log("Schedules:", schedulesData);

            setUser(Array.isArray(tutorData) ? tutorData : [tutorData]);
            setCourse(coursesData);
            setSession(sessionData);
            setSchedules(schedulesData);
            setProfilePicUrl(`/profile/tutor${tutor_id}.webp`);
            setError("");
        } catch (error) {

            if (error.response) {
                setError(error.response.data);
            }

            console.error("Error fetching data:", error);
        }
    }, [tutor_id, semesterQuery]);

    const fecthStudentData = useCallback(async () => {
        try {
            const response = await auth.get(`/api/users/${tutor_id}`);
            const {user} = response.data;
            console.log(user);
            setUser([user]);

            const coursesResponse = await auth.get(`/api/users/${tutor_id}/${user.ku_id}`);
            const {data} = coursesResponse;
            console.log(data.userCourses);
            setCourse(data.userCourses);
        }
        catch(e) {
            console.error(e);
        }
    }, [])

    const fetchAllCourses = useCallback(async () => {
        try {
            // Only courses offered in the current semester can be assigned
            const response = await auth.get("/api/courses/semester/current");
            setAllCourses(response.data.courses || []);
        } catch (e) {
            console.error("Error fetching semester courses:", e);
        }
    }, []);

    const openCoursePopup = useCallback(() => {
        setSelectedCourseIds(courses.map(c => String(c.course_id)));
        fetchAllCourses();
    }, [courses, fetchAllCourses]);

    const handleCourseCheckboxChange = useCallback((courseId) => {
        setSelectedCourseIds(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    }, []);

    const saveTutorCourses = useCallback(async (close) => {
        if (selectedCourseIds.length < 1) {
            toast.error("Select at least one course");
            return;
        }
        try {
            setSavingCourses(true);
            const endpoint = role === 'student'
                ? `/api/users/${tutor_id}/courses`
                : `/api/tutors/${tutor_id}/courses`;
            const response = await auth.put(endpoint, {
                course_ids: selectedCourseIds.map(Number)
            });
            setCourse(response.data.courses);
            toast.success("Courses updated successfully");
            close();
        } catch (e) {
            console.error(e);
            toast.error(`Error: ${e.response?.data?.error || e.message}`);
        } finally {
            setSavingCourses(false);
        }
    }, [selectedCourseIds, tutor_id, role]);

    const openSchedulePopup = useCallback(() => {
        const grouped = {};
        schedules.forEach(({ day, start_time, end_time }) => {
            const key = `${start_time.slice(0, 5)}-${end_time.slice(0, 5)}`;
            if (!grouped[key]) {
                grouped[key] = { days: [], start_time: start_time.slice(0, 5), end_time: end_time.slice(0, 5) };
            }
            grouped[key].days.push(day);
        });
        setScheduleBlocks(Object.values(grouped));
    }, [schedules]);

    const addScheduleBlock = useCallback(() => {
        setScheduleBlocks(prev => [...prev, { days: [], start_time: "09:00", end_time: "10:00" }]);
    }, []);

    const removeScheduleBlock = useCallback((index) => {
        setScheduleBlocks(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateScheduleBlock = useCallback((index, field, value) => {
        setScheduleBlocks(prev => prev.map((block, i) => i === index ? { ...block, [field]: value } : block));
    }, []);

    const toggleScheduleDay = useCallback((index, day) => {
        setScheduleBlocks(prev => prev.map((block, i) => {
            if (i !== index) return block;
            const days = block.days.includes(day)
                ? block.days.filter(d => d !== day)
                : [...block.days, day];
            return { ...block, days };
        }));
    }, []);

    const saveSchedules = useCallback(async (close) => {
        const hasDays = scheduleBlocks.some(b => b.days.length > 0);
        if (!hasDays) {
            toast.error("Add at least one schedule block with a day selected");
            return;
        }
        try {
            setSavingSchedules(true);
            const response = await auth.put(`/api/schedules/${tutor_id}`, {
                schedules: scheduleBlocks.filter(b => b.days.length > 0)
            });
            setSchedules(response.data.schedules);
            toast.success("Schedule updated successfully");
            close();
        } catch (e) {
            console.error(e);
            toast.error(`Error: ${e.response?.data?.error || e.message}`);
        } finally {
            setSavingSchedules(false);
        }
    }, [scheduleBlocks, tutor_id]);

    useEffect(() => {

        if(role === 'tutor') {
            fetchTutorData();
        }
        if(role === 'student') {
            fecthStudentData();
        }
    }, [role, fetchTutorData, fecthStudentData]);

    const handleImageUpload = useCallback(() => {
        setProfilePicUrl(`/profile/${role}${tutor_id}.webp?${new Date().getTime()}`);
    }, [role, tutor_id]);

    if (error) {
        return (
            <>
                <Header />
                <section className="profile-container section">
                    <div className="mx-auto max-w-xl rounded-lg border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700">
                        <p>{error}</p>
                    </div>
                </section>
            </>
        );
    }   

    const weekdayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const convertTo12Hour = useCallback((time) => {
        let [hours, minutes] = time.split(":");
        hours = parseInt(hours, 10);
        const suffix = hours >= 12 ? "PM" : "AM";
        if (hours > 12) {
            hours -= 12;
        } else if (hours === 0) {
            hours = 12;
        }
        return `${hours}:${minutes} ${suffix}`;
    }, [])

    const groupSchedulesByTime = useCallback((schedules) => {
        const dayMap = {
            Monday: "M",
            Tuesday: "T",
            Wednesday: "W",
            Thursday: "Th",
            Friday: "F",
            Saturday: "S",
            Sunday: "Su"
        };

        const grouped = {};

        schedules.forEach(({ day, start_time, end_time }) => {
            const timeKey = `${start_time.slice(0, 5)} - ${end_time.slice(0, 5)}`;
            if (!grouped[timeKey]) grouped[timeKey] = [];
            grouped[timeKey].push(dayMap[day]);
        });
        
        return Object.entries(grouped).map(([time, days], index) => {
            const [start, end] = time.split(" - ");
        
            const start12hr = convertTo12Hour(start);
            const end12hr = convertTo12Hour(end);
        
            return (
                <p key={index}>
                    {days.join("")} {start12hr} - {end12hr}
                </p>
            );
        });
        
    }, [schedules]);


    return (
        <>
            <Header />
            <section className="profile-container section">
            <Profile tutorId={tutor_id} onImageUpload={handleImageUpload} role={role} />
                <section className="mb-2.5 flex items-center justify-center rounded-[5px] bg-[var(--white)] px-[15px] py-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                    <div className="group ml-[30px] h-[250px] w-[250px] shrink-0 rounded-full">
                        <label htmlFor="image-upload" className="relative block h-full w-full cursor-pointer">
                        <img 
                        src={profilePicUrl} 
                        alt={texts.header.profilePictureAlt} 
                        className="h-full w-full rounded-full object-cover transition-[filter] duration-100 ease-in-out group-hover:brightness-[30%]"
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "/profile/profile.webp"; 
                          }}
                        fetchpriority="high"
                        decoding="async" />
                        <i className="bx bx-camera absolute inset-0 z-10 flex items-center justify-center text-[3.5rem] text-[var(--white)] opacity-0 transition-opacity duration-100 ease-in-out group-hover:opacity-100"></i>
                        </label>
                    </div>
                    <div className="ml-[30px]">
                    {user.map(t =>
                        <div className="flex flex-col justify-center p-2.5 text-left" key={t.user_id}>
                            <div>
                            <p className="mb-0 text-[1.3rem] font-medium">
                                {role === 'tutor'
                                    ? t.tutor_name
                                    : `${t.first_name ?? ''} ${t.last_name ?? ''}`}
                            </p>


                            <p className="mt-0.5 text-sm text-[var(--gray)]">{t.tutor_email || t.email}</p>
                            </div>
                            <div className="w-full text-left text-base [&_p]:mb-0.5">
                                <p> <strong>{texts.profileInfo.idLabel}</strong> {t.tutor_id || t.ku_id}</p>
                                <p><strong>{texts.profileInfo.majorLabel} </strong>{t.tutor_major || t.Major.major_name}</p>
                                { role == 'tutor' ? (
                                    <p><strong>{texts.profileInfo.contactLabel} </strong>{t.contact}</p>
                                ) : (
                                    <p><strong>Rol: </strong>Student</p>
                                )
                                }
                            </div>
                        
                            {user.map(t => 
                    <div className="mr-auto mt-[15px] text-left [&>p]:mb-px" key={t.tutor_id}>
                        <p id=""> <strong>{ role == 'tutor' ? (texts.profileInfo.scheduleLabel) : null} </strong>
                            {role === 'tutor' && (
                                <Popup
                                    trigger={<i className="bx bx-edit ml-1 cursor-pointer text-base" title="Edit schedule"></i>}
                                    modal
                                    onOpen={openSchedulePopup}
                                >
                                    {close => (
                                        <div className="p-6 text-left">
                                            <h2 className="mb-4 text-xl font-semibold text-[var(--blue)]">Edit Schedule</h2>
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {scheduleBlocks.map((block, index) => (
                                                    <div key={index} className="mb-2.5 rounded-md border border-[#ddd] p-2.5">
                                                        <div className="mb-2 flex flex-wrap gap-1">
                                                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                                                <label key={day} className="flex items-center gap-[3px] text-[13px]">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={block.days.includes(day)}
                                                                        onChange={() => toggleScheduleDay(index, day)}
                                                                    />
                                                                    {day.slice(0, 3)}
                                                                </label>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-2.5">
                                                            <label className="text-[13px]">Start:
                                                                <input type="time" value={block.start_time} onChange={e => updateScheduleBlock(index, 'start_time', e.target.value)} />
                                                            </label>
                                                            <label className="text-[13px]">End:
                                                                <input type="time" value={block.end_time} onChange={e => updateScheduleBlock(index, 'end_time', e.target.value)} />
                                                            </label>
                                                            <button
                                                                type="button"
                                                                className="cursor-pointer rounded border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2"
                                                                onClick={() => removeScheduleBlock(index)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="mt-1 rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200" onClick={addScheduleBlock}>+ Add Block</button>
                                            <div className="mt-[15px] flex gap-2.5">
                                                <button className="rounded-md border border-[var(--blue)] bg-[var(--blue)] px-3 py-1.5 text-white hover:bg-[#252f6b] disabled:pointer-events-none disabled:opacity-50" onClick={() => saveSchedules(close)} disabled={savingSchedules}>
                                                    {savingSchedules ? 'Saving...' : 'Save'}
                                                </button>
                                                <button className="rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200" onClick={close}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </Popup>
                            )}
                        </p>
                        <div className="[&_p]:mb-0.5 [&_p]:text-sm [&_p]:text-[var(--dark-gray)]">
                            {schedules.length > 0 ? (
                                <div>
                                    {groupSchedulesByTime([...schedules].sort(
                                        (a, b) => weekdayOrder.indexOf(a.day) - weekdayOrder.indexOf(b.day)
                                    ))}
                                </div>
                            ) : t.tutor_schedule && t.tutor_schedule.trim() !== '' ? (
                                t.tutor_schedule.split('\n').map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))
                            ) : (
                                <p>No schedule set</p>
                            )}
                        </div>


                        <div className="flex items-center pt-2.5 [&_p]:mb-0 [&_p]:ml-[15px] [&_p]:pb-0">
                            { role == 'tutor' ? 
                                <Link to={`/calendar/${tutor_id}`} className="inline-flex items-center rounded-md border border-[var(--blue)] bg-[var(--blue)] px-3 py-1.5 text-white transition-colors hover:bg-[#252f6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2">{texts.profileInfo.viewCalendarButton}</Link>
                            : null}
                            {session >= 1 ? (
                            <div className="ml-2.5 flex w-80 flex-row items-center justify-start rounded-lg bg-[#D7F1FD] p-[9px] shadow-[0_0_5px_-3px_#111]">
                                <div className="mr-2 h-5 w-5 -translate-y-0.5 [&_path]:fill-[#509AF8]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" height="24" fill="none"><path fill="#393a37" d="m12 1.5c-5.79844 0-10.5 4.70156-10.5 10.5 0 5.7984 4.70156 10.5 10.5 10.5 5.7984 0 10.5-4.7016 10.5-10.5 0-5.79844-4.7016-10.5-10.5-10.5zm.75 15.5625c0 .1031-.0844.1875-.1875.1875h-1.125c-.1031 0-.1875-.0844-.1875-.1875v-6.375c0-.1031.0844-.1875.1875-.1875h1.125c.1031 0 .1875.0844.1875.1875zm-.75-8.0625c-.2944-.00601-.5747-.12718-.7808-.3375-.206-.21032-.3215-.49305-.3215-.7875s.1155-.57718.3215-.7875c.2061-.21032.4864-.33149.7808-.3375.2944.00601.5747.12718.7808.3375.206.21032.3215.49305.3215.7875s-.1155.57718-.3215.7875c-.2061.21032-.4864.33149-.7808.3375z"></path></svg>
                                </div>
                                <div className="text-sm text-[#0C2A75] [&_a]:text-inherit">
                                    {texts.scheduledSessions.youHaveLabel} <a href={`/scheduled-sessions/${role}/${tutor_id}`}>{session} {texts.scheduledSessions.scheduledSessionsLabel}</a> 
                                </div> 
                        
                            </div> 

                    
                            ) : (
                                null
                            )}
                            { contextUser.role === 'admin' || contextUser.role === 'dev' ? (
                                <Link to={`/settings/${tutor_id}`}>
                                <i 
                                className="bx bxs-cog ml-2.5 mt-1 cursor-pointer text-2xl"
                                >
                                </i>
                             </Link>
                            ) : (null)}
                        </div> 
                    </div> // end of tutor-sched
                    )}
                        </div>
                    )}
                    </div>


                </section>

                <section className="flex flex-wrap items-center justify-center rounded-[5px] bg-[var(--white)] p-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                    <div className="flex w-full items-center justify-between px-2.5">
                        {(contextUser.role === 'admin' || contextUser.role === 'dev') && (role === 'tutor' || role === 'student') && (
                            <Popup
                                trigger={<i className="bx bx-edit cursor-pointer text-xl" title="Edit courses"></i>}
                                modal
                                onOpen={openCoursePopup}
                            >
                                {close => (
                                    <div className="p-6 text-left">
                                        <h2 className="mb-4 text-xl font-semibold text-[var(--blue)]">Manage {role === 'student' ? 'Student' : 'Tutor'} Courses</h2>
                                        <div className="grid max-h-[400px] grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5 overflow-y-auto">
                                            {allCourses.map(course => (
                                                <div key={course.course_id}>
                                                    <input
                                                        type="checkbox"
                                                        className="peer hidden"
                                                        id={`course-${course.course_id}`}
                                                        checked={selectedCourseIds.includes(String(course.course_id))}
                                                        onChange={() => handleCourseCheckboxChange(String(course.course_id))}
                                                    />
                                                    <label className="block cursor-pointer rounded-lg border-2 border-[var(--yellow)] bg-[var(--white)] p-2.5 text-center text-sm text-[var(--black)] transition duration-300 peer-checked:bg-[var(--yellow)] peer-checked:font-semibold" htmlFor={`course-${course.course_id}`}>{course.course_name} ({course.course_code})</label>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-[15px] flex gap-2.5">
                                            <button className="rounded-md border border-[var(--blue)] bg-[var(--blue)] px-3 py-1.5 text-white hover:bg-[#252f6b] disabled:pointer-events-none disabled:opacity-50" onClick={() => saveTutorCourses(close)} disabled={savingCourses}>
                                                {savingCourses ? 'Saving...' : 'Save'}
                                            </button>
                                            <button className="rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200" onClick={close}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </Popup>
                        )}
                    </div>

                    {courses.map(c =>
                    <div key={c.course_id}>

                        <Link className="no-underline" to={`/sessions/${role}/${tutor_id}/${c.course_id}`}>
                            <div className="m-2.5 max-w-[250px] flex-[1_1_250px] cursor-pointer rounded-lg border border-[#ddd] bg-white p-2.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)]" id={c.course_id}>
                                <div className="mb-1.5">
                                    <h3 className="mb-1 text-[1.1em] text-[var(--blue)]">{c.course_name}</h3>
                                    <p className="m-0 text-[0.9em]">{c.course_code}</p>
                                </div>
                                <div>
                                    <p className="m-0 text-xl">{c.completed_sessions || c.qtyOfSessions}</p>
                                    <p className="m-0 text-[0.9em] font-normal">{texts.tutorCourses.sessionsLabel}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                    )}
                </section>
            </section>
        </>
    );
}

export default memo(TutorProfile);
