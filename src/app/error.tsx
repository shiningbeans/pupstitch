'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold text-amber-900 mb-4">Something went wrong!</h2>
        <p className="text-amber-700 mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
