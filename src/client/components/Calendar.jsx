import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useOutletContext } from 'react-router-dom';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const [sessions, setSessions] = useState([]);
    const { user } = useOutletContext();

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch(`/api/calendar-sessions/${user.user_id}`);
                const data = await response.json();
                setSessions(data.sessions.map(s => {
                    const sessionDate = new Date(s.session_date);
                    const [hours, minutes, seconds] = s.session_time.split(':').map(Number);
                    sessionDate.setHours(hours, minutes, seconds);
                    const sessionTime = s.session_durarion * 60 * 60 * 1000;
                    console.log(sessionTime);
                    return {
                        id: s.session_id,
                        title: `${s.course_name} - ${s.scheduled_by}`,
                        start: sessionDate,
                        end: new Date(sessionDate.getTime() + sessionTime)
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
        className="custom-popup"
    >
            <div className="popup-calendar-msg">
                <strong>{event.title}</strong><br />
                <em>Start: {event.start.toString()}</em><br />
                <em>End: {event.end.toString()}</em>
            </div>
        </Popup>
    );
    

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
            }}
        />
    );
}

export default MyCalendar;
