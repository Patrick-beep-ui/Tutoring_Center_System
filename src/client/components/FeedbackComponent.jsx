import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import auth from '../authService';
import { useNavigate } from 'react-router-dom';

const FeedbackForm = ({sessionId, userId}) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [sessionDetails, setSessionDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId) {
      console.log("Feedback session ID on component: ", sessionId);
       console.log("Feedback user ID on component: ", userId);

    }
  }, [sessionId]);

  const onSubmit = async (data) => {
    try {
      const response = await auth.post('/api/feedback', {
        sessionId: sessionId,
        user_id: userId,
        rating: data.rating,
        feedback: data.feedback,
      });

      //alert(response.data); // You can also use a toast notification or redirect to another page
      navigate('/feedback/submission')
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert('Error submitting feedback');
    }
  };

  return (
    <div className="mt-8 rounded-lg bg-[var(--white)] p-8 text-left shadow-[0_4px_6px_rgba(0,0,0,0.1)] max-md:w-[90%] max-md:p-6 [&_label]:mb-2 [&_label]:block [&_label]:font-medium [&_label]:text-[var(--black)] [&_input]:mb-4 [&_input]:w-full [&_input]:rounded [&_input]:border [&_input]:border-[var(--gray)] [&_input]:p-3 [&_input]:text-base [&_input]:text-[var(--black)] [&_input:focus]:border-[var(--blue)] [&_input:focus]:outline-none [&_textarea]:mb-4 [&_textarea]:w-full [&_textarea]:rounded [&_textarea]:border [&_textarea]:border-[var(--gray)] [&_textarea]:p-3 [&_textarea]:text-base [&_textarea]:text-[var(--black)] [&_textarea:focus]:border-[var(--blue)] [&_textarea:focus]:outline-none [&_form_p]:mt-[-0.75rem] [&_form_p]:text-sm [&_form_p]:text-red-600">
      <h2 className="mb-4 text-2xl font-semibold text-[var(--blue)] max-md:text-xl">Provide Feedback</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="rating">Rating (1-5)</label>
          <input
            id="rating"
            type="number"
            min="1"
            max="5"
            {...register('rating', { required: 'Rating is required', min: 1, max: 5 })}
          />
          {errors.rating && <p>{errors.rating.message}</p>}
        </div>

        <div>
          <label htmlFor="feedback">Feedback</label>
          <textarea
            id="feedback"
            {...register('feedback', { required: 'Feedback is required', maxLength: 255 })}
          />
          {errors.feedback && <p>{errors.feedback.message}</p>}
        </div>

        <button type="submit" className="cursor-pointer rounded border-0 bg-[var(--blue)] px-6 py-3 text-base font-medium text-[var(--white)] transition-colors hover:bg-[var(--yellow)] hover:text-[var(--black)]">Submit Feedback</button>
      </form>
    </div>
  );
};

export default FeedbackForm;
