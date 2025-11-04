import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
        <h2 className="text-4xl font-bold text-christmas-red mb-4">404</h2>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h3>
        <p className="text-gray-600 mb-6">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-christmas-green text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}

