export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#f2f4f7', 
        color: '#111827',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          fontSize: '6rem',
          fontWeight: '800',
          marginBottom: '1rem',
          color: '#0f172a', // dark slate
        }}
      >
        404
      </h1>

      <p
        style={{
          fontSize: '1.25rem',
          marginBottom: '2rem',
          color: '#1e293b',
          maxWidth: '480px',
        }}
      >
        Sorry, the page you’re looking for doesn’t exist or may have been moved.
      </p>

      <img
        src="./img/Picture1.svg"
        alt="Tutoring Center"
        style={{
          width: '220px',
          height: 'auto',
          marginBottom: '2.5rem',
          filter: 'contrast(1.1)',
        }}
      />

      <a
        href="/"
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          fontWeight: '600',
          backgroundColor: '#1e40af',
          color: '#ffffff',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          transition: 'background-color 0.3s ease, transform 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#1e3a8a';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#1e40af';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Go back home
      </a>
    </div>
  );
}
