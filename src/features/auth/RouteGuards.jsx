import { Link, Navigate } from 'react-router-dom';
import MascotBunny from '@/features/bunny/MascotBunny';
import { useAuth } from './useAuth';
import './guards.css';

function LoadingScreen() {
  return (
    <div className="guard-page">
      <div className="guard-card">
        <MascotBunny size={160} />
        <div className="guard-eyebrow">★ One sec ★</div>
        <p className="guard-msg">Hopping over…</p>
        <div className="guard-dots" aria-hidden>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

function ProfileErrorScreen({ error }) {
  return (
    <div className="guard-page">
      <div className="guard-card">
        <MascotBunny size={160} />
        <div className="guard-eyebrow">★ Hmm ★</div>
        <h2 className="guard-title">Couldn't load your profile</h2>
        <p className="guard-msg">
          <strong>{error?.code || 'unknown'}</strong>: {error?.message || String(error)}
        </p>
        <p className="guard-hint">
          Most common cause: Firestore security rules haven't been deployed.
          The browser console has the full error.
        </p>
        <Link to="/" className="guard-btn">Back home</Link>
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
  if (!profile || !profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}
