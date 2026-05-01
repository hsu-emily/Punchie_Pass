import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center text-pink-500">
      Loading…
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
  const { user, profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile?.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return children;
}
