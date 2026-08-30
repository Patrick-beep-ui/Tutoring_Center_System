import React from 'react';
import { useParams } from 'react-router-dom';
import FeedbackForm from '../components/FeedbackComponent';

function Feedback() {
    const { sessionId, userId } = useParams(); 
    console.log("Feedback session ID: ", sessionId);
    console.log("Feedback user ID: ", userId);

    return(
        <>
            <section className="mx-auto mt-20 max-w-[600px] rounded-lg bg-[var(--white)] p-8 text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] max-md:w-[90%] max-md:p-6">
                <h1 className="mb-4 text-3xl font-bold text-[var(--blue)] max-md:text-2xl">Feedback for Session {sessionId}</h1>
                <FeedbackForm sessionId={sessionId} userId={userId} />
            </section>
        </>
    )
}

export default Feedback;
