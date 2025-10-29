import { useEffect, useMemo, useRef, useState } from 'react';

export default function ServerError505({
  status,
  endpoint,
  requestInit,
  healthyContent = null,
  message: messageProp,
}) {
  const isServerErrorStatus = (s) => typeof s === 'number' && s >= 500 && s <= 599;

  class HttpError extends Error {
    constructor(s, statusText, payload) {
      super(`${s} ${statusText || 'HTTP Error'}`);
      this.name = 'HttpError';
      this.status = s;
      this.payload = payload;
    }
  }

  const validateResponse = async (res) => {
    if (res.ok) return res;
    let payload = null;
    try { payload = await res.clone().json(); } catch {}
    throw new HttpError(res.status, res.statusText, payload);
  };

  const safeRequest = async (input, init) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 25000);
    try {
      const res = await fetch(input, { signal: controller.signal, ...init });
      clearTimeout(id);
      await validateResponse(res);
      return true; 
    } catch (err) {
      if (err?.name === 'AbortError') throw new HttpError(504, 'Gateway Timeout', { reason: 'abort' });
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, 'Internal Client Error', { original: String(err) });
    }
  };

  // ---------- State machine ----------
  const [probeState, setProbeState] = useState(endpoint ? 'idle' : 'skip'); // 'idle' | 'loading' | 'healthy' | 'error'
  const [probeError, setProbeError] = useState(null);
  const lastTried = useRef(0);

  const effectiveStatus = useMemo(() => {
    // If status prop is provided, that takes precedence
    if (typeof status === 'number') return status;
    // If we probed and got an error, use that status
    if (probeError?.status) return probeError.status;
    return undefined;
  }, [status, probeError]);

  const message = useMemo(() => {
    if (messageProp) return messageProp;
    if (probeError?.message) return probeError.message;
    if (typeof status === 'number') return 'A server error occurred.';
    return 'A server error occurred while contacting the server.';
  }, [messageProp, probeError, status]);

  // ---------- Effects ----------
  useEffect(() => {
    if (!endpoint) return; // nothing to probe
    let mounted = true;
    const run = async () => {
      setProbeState('loading');
      setProbeError(null);
      try {
        await safeRequest(endpoint, requestInit);
        mounted && setProbeState('healthy');
      } catch (e) {
        mounted && (setProbeError(e), setProbeState('error'));
      }
    };
    // only (re)run if endpoint changes or on first mount
    run();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  // ---------- Handlers ----------
  const handleRetry = async () => {
    if (endpoint) {
      // Debounce retries a bit
      const now = Date.now();
      if (now - lastTried.current < 600) return;
      lastTried.current = now;

      setProbeState('loading');
      setProbeError(null);
      try {
        await safeRequest(endpoint, requestInit);
        setProbeState('healthy');
      } catch (e) {
        setProbeError(e);
        setProbeState('error');
      }
    } else {
      // No endpoint to retry, do a full reload
      window.location.reload();
    }
  };

  // ---------- Render decision ----------
  const shouldShow505 =
    isServerErrorStatus(effectiveStatus) ||
    (endpoint ? probeState === 'error' : true); // if no endpoint and no status, this is a dedicated 505 view

  if (endpoint && probeState === 'healthy' && !isServerErrorStatus(effectiveStatus)) {
    // Endpoint is healthy: render fallback content (optional)
    return healthyContent ?? null;
  }

  // ---------- 505 UI ----------
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', textAlign: 'center', backgroundColor: '#f2f4f7',
        fontFamily: "'Inter', sans-serif", color: '#111827', padding: '2rem',
      }}
      role="alert"
      aria-live="assertive"
    >
      <h1
        style={{
          fontSize: '6rem', fontWeight: 800, marginBottom: '1rem',
          color: '#7f1d1d',
        }}
      >
        {shouldShow505 ? (effectiveStatus ?? 505) : (effectiveStatus ?? '…')}
      </h1>

      <p
        style={{ fontSize: '1.25rem', marginBottom: '.5rem', color: '#374151', maxWidth: 560 }}
      >
        Oops! Something went wrong on our end.
      </p>

      <p
        style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#4b5563', maxWidth: 560 }}
      >
        {message}
      </p>

      {probeError?.payload?.error && (
        <pre
          style={{
            textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            background: '#fff', padding: '0.75rem 1rem', borderRadius: '0.5rem',
            border: '1px solid #e5e7eb', maxWidth: 640, marginBottom: '1.25rem',
            fontSize: '.875rem', color: '#1f2937',
          }}
        >
{JSON.stringify(probeError.payload.error, null, 2)}
        </pre>
      )}

      <img
        src="/img/Picture1.svg"
        alt="Server Error"
        style={{ width: 240, height: 'auto', marginBottom: '2rem', filter: 'contrast(1.05)' }}
      />

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleRetry}
          disabled={endpoint ? probeState === 'loading' : false}
          style={{
            padding: '0.75rem 1.25rem', fontSize: '1rem', fontWeight: 600,
            backgroundColor: '#991b1b', color: '#fff', borderRadius: '0.5rem',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            transition: 'background-color .2s ease, transform .2s ease, opacity .2s',
            opacity: endpoint && probeState === 'loading' ? 0.8 : 1,
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#7f1d1d'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#991b1b'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {endpoint && probeState === 'loading' ? 'Retrying…' : 'Retry'}
        </button>

        <a
          href="/"
          style={{
            display: 'inline-block', padding: '0.75rem 1.25rem', fontSize: '1rem', fontWeight: 600,
            backgroundColor: '#1e40af', color: '#fff', borderRadius: '0.5rem', textDecoration: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)', transition: 'background-color .2s ease, transform .2s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1e3a8a'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#1e40af'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}
