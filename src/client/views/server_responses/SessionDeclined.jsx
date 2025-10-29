export const SessionDeclined = () => {
  return (
    <div
      style={{
        backgroundColor: "#333333", // --black
        color: "#FFFEF6", // --white
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#192D64", // --blue
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
            color: "#EEAF32", // --yellow
            fontWeight: "700",
          }}
        >
          Session Declined
        </h1>

        <p
          style={{
            color: "#FFFEF6", // --white
            fontSize: "0.95rem",
            lineHeight: "1.6",
            marginBottom: "2rem",
            opacity: 0.9,
          }}
        >
          The session request has been declined.  
          You can leave a short comment to explain the reason or suggest a reschedule time.
        </p>

        <textarea
          placeholder="Write your comment or reschedule message..."
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid #777676", // --dark-gray
            backgroundColor: "#333333", // --black
            color: "#FFFEF6", // --white
            resize: "none",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#EEAF32")}
          onBlur={(e) => (e.target.style.borderColor = "#777676")}
        />

        <a
          href="/"
          style={{
            display: "inline-block",
            backgroundColor: "#EEAF32", // --yellow
            color: "#333333", // --black
            fontWeight: "600",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#d99824"; // darker yellow
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#EEAF32";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Submit Comment
        </a>
      </div>
    </div>
  );
};

export default SessionDeclined;
