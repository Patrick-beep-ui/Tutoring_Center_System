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
    <div className="feedback-form">
      <h2>Provide Feedback</h2>
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

        <button type="submit">Submit Feedback</button>
      </form>
    </div>
  );
};

export default FeedbackForm;
