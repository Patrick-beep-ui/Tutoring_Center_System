import { useState, useEffect, memo } from "react";
import FeedbackCard from "../../../components/feedback/FeedbackCard.jsx";
import api from "../../../axiosService";

const Activity_Feedback = ({ dateRange }) => {
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const params = new URLSearchParams();
                if (dateRange.from) params.set("date_from", dateRange.from);
                if (dateRange.to) params.set("date_to", dateRange.to);
                const response = await api.get(`/feedback${params.size ? `?${params}` : ""}`);
                setFeedbacks(response.data.feedbacks);
                console.log("Feedbacks:",response.data.feedbacks);
            }
            catch(e) {
                console.error("Error fetching feedbacks:", e);
            }
        }

        fetchFeedbacks();
    }, [dateRange]);

    return (
    <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(310px,1fr))] gap-5 p-5">
                {feedbacks.map((feedback) => (
                    <FeedbackCard key={feedback.feedback_id} feedback={feedback} />
                ))}
            </div>
    </>
    );
 };

export default memo(Activity_Feedback);
