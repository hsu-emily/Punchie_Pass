import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center text-pink-500">
      Loading…
    </div>
  );
}

function ProfileErrorScreen({ error }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-3">
        <h2 className="text-xl font-semibold text-red-600">
          Couldn't load your profile
        </h2>
        <p className="text-sm text-gray-600 break-words">
          {error?.code || 'unknown'}: {error?.message || String(error)}
        </p>
        <p className="text-sm text-gray-500">
          Most common cause: Firestore security rules haven't been deployed.
          Open the browser console for the full error.
        </p>
      </div>
    </div>
  );
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function RequireProfile({ children }) {
  const { user, profile, profileError, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (profileError) return <ProfileErrorScreen error={profileError} />;
  if (!profile?.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return children;
}
