import { useState, useEffect, memo } from "react";
import FeedbackCard from "../components/FeedbackCard.jsx";
import api from "../axiosService";

const Activity_Feedback =() =>{
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await api.get("/feedback");
                setFeedbacks(response.data.feedbacks);
                console.log("Feedbacks:",response.data.feedbacks);
            }
            catch(e) {
                console.error("Error fetching feedbacks:", e);
            }
        }

        fetchFeedbacks();
    }, []);

    return (
    <>
            <div className="feedbacks-grid">
                {feedbacks.map((feedback) => (
                    <FeedbackCard key={feedback.feedback_id} feedback={feedback} />
                ))}
            </div>
    </>
    );
 };

export default memo(Activity_Feedback);