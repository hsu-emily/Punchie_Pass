import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { useAuth } from '../auth/useAuth';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">
          Hello, {profile?.displayName || user?.email}
        </h1>
        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
      <p className="text-gray-600">
        Stub dashboard — features will land here as Phase 2 onward gets built.
      </p>
    </div>
  );
}
