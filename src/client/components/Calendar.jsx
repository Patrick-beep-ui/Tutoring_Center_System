import React, { useState, useEffect, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import ScheduleSession from './ScheduleSession';
import { ics } from 'ics';
import { createEvent } from 'ics';
import auth from '../authService';
import { SemesterContext } from '../context/currentSemester';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const [sessions, setSessions] = useState([]);
    const [student, setStudent] = useState(false);
    const [tutor, setTutor] = useState('');
    const { user } = useOutletContext();
    const {tutor_id} = useParams();
    const { selectedSemesterId } = useContext(SemesterContext);
    
    const isTutor = () => {
        return tutor_id === user.user_id
    }

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await auth.get(`/api/calendar-session/${tutor_id}${selectedSemesterId ? `?semester_id=${selectedSemesterId}` : ''}`);
                const {data} = response;
                console.log(data.sessions)

                setSessions(data.sessions.map(s => {
                    const sessionDate = moment(`${s.session_date}T${s.session_time}`);
                    const sessionDurationHours = parseInt(s.session_duration, 10);
                
                    const sessionEnd = moment(sessionDate).add(sessionDurationHours, 'hours').toDate();
                
                    setTutor(s.tutor);
                
                    return {
                        id: s.session_id,
                        title: `${s.course_name} - ${s.scheduled_by}`,
                        start: sessionDate.toDate(),
                        end: sessionEnd
                    };
                }));
                

                const isStudent = data.sessions.some(session => session.student_id === user.user_id);
                setStudent(isStudent);


            } catch (error) {
                console.error('Error fetching events:', error);
            }
        }

        if (user && user.user_id) {
            fetchEvents();
        }
    }, [user, selectedSemesterId]);

    const generateICSFile = (event) => {
        const start = [
            event.start.getFullYear(),
            event.start.getMonth() + 1,
            event.start.getDate(),
            event.start.getHours(),
            event.start.getMinutes()
        ];
        const end = [
            event.end.getFullYear(),
            event.end.getMonth() + 1,
            event.end.getDate(),
            event.end.getHours(),
            event.end.getMinutes()
        ];

        let description = ''

        if(student) {
            description = `Session with ${tutor}`
        } else {
            description = `Session with ${student}`
        }

        const icsEvent = {
            start,
            end,
            title: event.title,
            description: description,
            location: 'Keiser University Latin American Campus',
            url: window.location.href,
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
        };

        createEvent(icsEvent, (error, value) => {
            if (error) {
                console.log(error);
                return;
            }
            const blob = new Blob([value], { type: 'text/calendar' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'session.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    };


    const Event = ({ event }) => (
        <Popup
        trigger={<div className="rbc-event-content" title={event.title}>{event.title}</div>}
        position="center center"
        modal
        closeOnDocumentClick
        className="custom-popup session-detail-popup"
    >
            <div className="p-1">
                <strong>{event.title}</strong><br />
                <p>{moment(event.start).format('h:mm a')} – {moment(event.end).format('h:mm a')}</p>
                <em>Start: {event.start.toString()}</em><br />
                <em>End: {event.end.toString()}</em>
                {isTutor() || student ? (
                    <button
                        type="button"
                        className="my-2.5 block rounded-md border border-[var(--blue)] bg-[var(--blue)] px-3 py-1.5 text-white transition-colors hover:border-[#252f6b] hover:bg-[#252f6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2"
                        onClick={() => generateICSFile(event)}
                    >
                        Remind me
                    </button>
                ) : (null)}
            </div>
        </Popup>
    );

    const Cell = ({ value, children }) => {
        const eventsForDay = sessions.filter(session => (
            session.start.toDateString() === value.toDateString()
        ));
        const formattedDate = moment(value).format('YYYY-MM-DD');

        return (
            <Popup
                trigger={<div className="rbc-day-bg">{children}</div>}
                position="center center"
                modal
                closeOnDocumentClick
                className="custom-popup schedule-session-popup"
            >
            
            {close => (
                
                eventsForDay.length > 0 ? (
                    <div className="flex max-h-[80vh] h-full w-full flex-col overflow-y-auto bg-transparent px-9 py-8 max-md:px-7 max-md:py-6 max-[580px]:px-6 max-[580px]:py-5 [&>strong]:mb-5 [&>strong]:block [&>strong]:shrink-0 [&>strong]:border-b-2 [&>strong]:border-[var(--yellow)] [&>strong]:pb-2.5 [&>strong]:text-center [&>strong]:text-2xl [&>strong]:font-semibold [&>strong]:text-[var(--blue)] [&>ul]:mb-6 [&>ul]:max-h-40 [&>ul]:shrink-0 [&>ul]:list-none [&>ul]:overflow-y-auto [&>ul]:p-0 [&>ul>li]:mb-2.5 [&>ul>li]:rounded-lg [&>ul>li]:border [&>ul>li]:border-[#e9ecef] [&>ul>li]:border-l-4 [&>ul>li]:border-l-[var(--blue)] [&>ul>li]:bg-[#f8f9fa] [&>ul>li]:px-[18px] [&>ul>li]:py-3.5 [&>ul>li]:text-sm [&>ul>li:hover]:bg-[#e9ecef] [&>ul>li>p]:mt-1 [&>ul>li>p]:text-sm [&>ul>li>p]:font-medium [&>ul>li>p]:text-[var(--dark-gray)]">
                        <strong>Sessions Scheduled Today: </strong><br />
                        <ul>
                            {eventsForDay.map(event => (
                                <li key={event.id}>
                                    {moment(event.start).format('h:mm a')} – {moment(event.end).format('h:mm a')} 
                                    <p>{event.title}</p>
                                </li>
                            ))}
                        </ul>

                        <div className="flex min-h-0 flex-1 flex-col border-t border-[#e9ecef] pt-5">
                            <ScheduleSession tutor_id={tutor_id} selectedDate={formattedDate} onSubmit={close} />
                        </div>

                    </div>

                ) : (
                    <div className="flex max-h-[80vh] h-full w-full flex-col overflow-y-auto bg-transparent px-9 py-8 max-md:px-7 max-md:py-6 max-[580px]:px-6 max-[580px]:py-5 [&>strong]:mb-5 [&>strong]:block [&>strong]:shrink-0 [&>strong]:border-b-2 [&>strong]:border-[var(--yellow)] [&>strong]:pb-2.5 [&>strong]:text-center [&>strong]:text-2xl [&>strong]:font-semibold [&>strong]:text-[var(--blue)]">
                        <strong>No Session Scheduled for Today</strong><br />
                        <div className="flex min-h-0 flex-1 flex-col border-t border-[#e9ecef] pt-5">
                            <ScheduleSession tutor_id={tutor_id} selectedDate={formattedDate} onSubmit={close} />
                        </div>
                    </div>
                )
            )}
            </Popup>
        );
    };
    

    return (
        <>
        <Calendar
            localizer={localizer}
            events={sessions}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            style={{ height: 650 }}
            components={{
                event: Event,
                dateCellWrapper: props => <Cell {...props} sessions={sessions} />
            }}
        />
        <Link
            to={`/profile/tutor/${tutor_id}`}
            className="mt-5 inline-flex items-center rounded-md border border-[var(--blue)] bg-[var(--blue)] px-3 py-1.5 text-white transition-colors hover:border-[#252f6b] hover:bg-[#252f6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2"
        >
            Go Back
        </Link>
        </>
    );
}

export default MyCalendar;
