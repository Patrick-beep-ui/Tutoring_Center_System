import React from 'react';
import { useParams } from 'react-router-dom';
import FeedbackForm from '../components/FeedbackComponent';

function Feedback() {
    const { sessionId, userId } = useParams(); 
    console.log("Feedback session ID: ", sessionId);
    console.log("Feedback user ID: ", userId);

    return(
        <>
            <section className='feedback-container'>
                <h1 className='feedback-page-title'>Feedback for Session {sessionId}</h1>
                <FeedbackForm sessionId={sessionId} userId={userId} />
            </section>
        </>
    )
}

export default Feedback;