import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-6">
      <h1 className="text-4xl font-bold">Punchie Pass</h1>
      <p className="text-gray-600 max-w-md">
        Build habits with a tiny bunny companion.
      </p>
      <div className="flex gap-3">
        {user ? (
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/signup"
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Log in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
