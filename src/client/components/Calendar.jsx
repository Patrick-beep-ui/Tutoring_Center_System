import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useOutletContext, useParams } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import ScheduleSession from './ScheduleSession';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const [sessions, setSessions] = useState([]);
    const { user } = useOutletContext();
    const {tutor_id} = useParams();
    console.log(user)

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch(`/api/calendar-sessions/${tutor_id}`);
                const data = await response.json();
                setSessions(data.sessions.map(s => {
                    const sessionDate = moment(`${s.session_date}T${s.session_time}`);
                    const sessionTime = s.session_duration * 60 * 60 * 1000;
                    return {
                        id: s.session_id,
                        title: `${s.course_name} - ${s.scheduled_by}`,
                        start: sessionDate.toDate(),
                        end: sessionDate.add(sessionTime).toDate()
                    };
                }));
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        }

        if (user && user.user_id) {
            fetchEvents();
        }
    }, [user]);

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
                <em>Start: {event.start.toString()}</em><br />
                <em>End: {event.end.toString()}</em>
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
                        <strong>Schedule a Session</strong><br />
                        <em>Date: {value.toString()}</em>
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
