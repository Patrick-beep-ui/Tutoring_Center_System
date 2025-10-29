export const SessionAccepted = () => {
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
          maxWidth: "420px",
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
          Session Accepted
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
          Your session has been successfully accepted. You will receive a
          confirmation email shortly with the session details.
        </p>

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
            e.target.style.backgroundColor = "#d99824"; // darker yellow hover
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#EEAF32";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Go back home
        </a>
      </div>
    </div>
  );
};

export default SessionAccepted;
