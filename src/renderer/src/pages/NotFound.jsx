import { Link } from "react-router-dom";

// NotFound.jsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-9xl font-bold text-purple-800">404</h1>
      <p className="text-2xl mt-4 text-gray-700">Oops! Page not found.</p>
      <p className="mt-2 text-gray-500">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block bg-purple-800 text-white px-6 py-3 rounded-lg hover:bg-purple-900 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
