'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffbeb' }}>
          <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '28rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#78350f', marginBottom: '1rem' }}>Something went wrong!</h2>
            <p style={{ color: '#92400e', marginBottom: '1.5rem' }}>{error.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => reset()}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#d97706', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
