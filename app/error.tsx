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
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-amber-900">Algo salió mal</h2>
        <p className="text-amber-700 mb-4">{error.message || 'Error desconocido'}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}