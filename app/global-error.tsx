'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-6">{error.message || 'An unexpected error occurred'}</p>
            <button
              onClick={reset}
              className="px-6 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

