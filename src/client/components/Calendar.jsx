import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useOutletContext, useParams } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import ScheduleSession from './ScheduleSession';
import { ics } from 'ics';
import { createEvent } from 'ics';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const [sessions, setSessions] = useState([]);
    const [student, setStudent] = useState(false);
    const [tutor, setTutor] = useState('');
    const { user } = useOutletContext();
    const {tutor_id} = useParams();
    
    const isTutor = () => {
        return tutor_id === user.user_id
    }

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch(`/api/calendar-sessions/${tutor_id}`);
                const data = await response.json();

                setSessions(data.sessions.map(s => {
                    const sessionDate = moment(`${s.session_date}T${s.session_time}`);
                    const sessionTime = s.session_duration * 60 * 60 * 1000;

                    setTutor(s.tutor);

                    return {
                        id: s.session_id,
                        title: `${s.course_name} - ${s.scheduled_by}`,
                        start: sessionDate.toDate(),
                        end: sessionDate.add(sessionTime).toDate()
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
    }, [user]);

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
            <div className="popup-calendar-msg">
                <strong>{event.title}</strong><br />
                <p>{moment(event.start).format('h:mm a')} – {moment(event.end).format('h:mm a')}</p>
                <em>Start: {event.start.toString()}</em><br />
                <em>End: {event.end.toString()}</em>
                {isTutor() || student ? (
                    <button className="btn btn-primary" onClick={() => generateICSFile(event)}>Remind me</button>
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
                    <div className="popup-cell-msg">
                        <strong>Sessions Scheduled Today: </strong><br />
                        <ul>
                            {eventsForDay.map(event => (
                                <li key={event.id}>
                                    {moment(event.start).format('h:mm a')} – {moment(event.end).format('h:mm a')} 
                                    <p>{event.title}</p>
                                </li>
                            ))}
                        </ul>

                        <div className="schedule-session-container">
                            <ScheduleSession tutor_id={tutor_id} selectedDate={formattedDate} onSubmit={close} />
                        </div>

                    </div>

                ) : (
                    <div className="popup-cell-msg">
                        <strong>No Session Scheduled for Today</strong><br />
                        <div className="schedule-session-container">
                            <ScheduleSession tutor_id={tutor_id} selectedDate={formattedDate} onSubmit={close} />
                        </div>
                    </div>
                )
            )}
            </Popup>
        );
    };
    

    return (
        <Calendar
            localizer={localizer}
            events={sessions}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            style={{ height: 600 }}
            components={{
                event: Event,
                dateCellWrapper: props => <Cell {...props} sessions={sessions} />
            }}
        />
    );
}

export default MyCalendar;
