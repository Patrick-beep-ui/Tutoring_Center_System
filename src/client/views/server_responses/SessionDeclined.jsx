import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import auth from "../../authService";
import { toast } from 'sonner';

export const SessionDeclined = () => {
  const [tutor, setTutor] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sid");
  const tutorId = searchParams.get("tid");
  const navigate = useNavigate();

  console.log("Tutor ID from URL:", tutorId);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await auth.get(`api/tutors/${tutorId}`);
        setTutor(response.data.tutor_info);
      } catch (err) {
        console.error("Error fetching tutor data:", err);
      }
    };

    fetchTutor();
  }, [tutorId]);

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) {
      setStatus({ type: "error", msg: "Message cannot be empty" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await auth.post(
        `http://localhost:3000/api/calendar-session/decline/justification/${sessionId}`,
        { message, tutorName: tutor[0]?.tutor_name },
      );

      toast.success("Message sent successfully", { duration: 3000 });
      setStatus({ type: "success", msg: response.data.msg });

      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: err.response?.data?.msg || "Error sending message" });
    }
    finally {
      setIsLoading(false);
    }
  }, [message, sessionId, tutor]);

  return (
    <div
      style={{
        backgroundColor: "#333333",
        color: "#FFFEF6",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#192D64",
          borderRadius: "1rem",
          padding: "3rem 2.5rem",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
          textAlign: "center",
        }}
      >
        <img
          src="./img/Picture1.svg"
          alt="Tutoring Center"
          style={{
            width: "160px",
            height: "auto",
            marginBottom: "1.8rem",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        />
        <h1
          style={{
            fontSize: "1.75rem",
            marginBottom: "1rem",
            color: "#EEAF32",
            fontWeight: "700",
          }}
        >
          Session Declined
        </h1>
        <p
          style={{
            color: "#FFFEF6",
            fontSize: "0.95rem",
            lineHeight: "1.6",
            marginBottom: "2rem",
            opacity: 0.9,
          }}
        >
          The session request has been declined. You can leave a short comment to explain the reason or suggest a reschedule time.
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your comment or reschedule message..."
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid #777676",
            backgroundColor: "#333333",
            color: "#FFFEF6",
            resize: "none",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#EEAF32")}
          onBlur={(e) => (e.target.style.borderColor = "#777676")}
        />

        {status && (
          <p
            style={{
              color: status.type === "success" ? "#4BB543" : "#FF4D4D",
              marginBottom: "1rem",
            }}
          >
            {status.msg}
          </p>
        )}

        <button
          onClick={handleSubmit}
          style={{
            display: "inline-block",
            backgroundColor: "#EEAF32",
            color: "#333333",
            fontWeight: "600",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#d99824";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#EEAF32";
            e.target.style.transform = "translateY(0)";
          }}
        >
          {isLoading ? "Sending comment...." : "Submit Comment"}
        </button>
      </div>
    </div>
  );
};

export default SessionDeclined;
