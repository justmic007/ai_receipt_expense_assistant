"use client";

export default function Error({ error, reset }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                <p className="text-gray-500 mb-6 text-sm">{error?.message || "An unexpected error occurred"}</p>
                <button
                    onClick={reset}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}