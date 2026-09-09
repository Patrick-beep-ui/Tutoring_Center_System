import React from 'react';
import { useParams } from 'react-router-dom';

function ThanksFeedback() {

    return(
        <>
            <section className="mx-auto mt-20 max-w-[600px] rounded-lg bg-[var(--white)] p-8 text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] max-md:w-[90%] max-md:p-6">
                <h1 className="text-3xl font-bold text-[var(--blue)] max-md:text-2xl">Thanks for your Feedback</h1>
            </section>
        </>
    )
}

export default ThanksFeedback;
