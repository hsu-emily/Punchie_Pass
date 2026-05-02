import { Link } from 'react-router-dom';
import MascotBunny from '@/features/bunny/MascotBunny';
import { useAuth } from '@/features/auth/useAuth';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="home-inner">
        <MascotBunny size={220} className="home-mascot" />

        <span className="home-eyebrow">★ Punchie Pass ★</span>
        <h1 className="home-title">Hi, friend.</h1>
        <p className="home-tagline">
          Build little habits with a tiny bunny companion. Punch a card, earn a treat,
          and let your bunny grow alongside you.
        </p>

        <div className="home-actions">
          {user ? (
            <Link to="/dashboard" className="home-btn home-btn-primary">
              Go to dashboard ▸
            </Link>
          ) : (
            <>
              <Link to="/signup" className="home-btn home-btn-primary">
                Start your pass ▸
              </Link>
              <Link to="/login" className="home-btn home-btn-ghost">
                I already have one
              </Link>
            </>
          )}
        </div>

        <div className="home-features">
          <Feature emoji="🥚" label="Hatch" text="Meet your bunny" />
          <Feature emoji="🎫" label="Punch" text="One stamp at a time" />
          <Feature emoji="🌸" label="Treat" text="Earn a sweet reward" />
        </div>
      </div>
    </div>
  );
}

function Feature({ emoji, label, text }) {
  return (
    <div className="home-feature">
      <div className="home-feature-emoji">{emoji}</div>
      <div className="home-feature-label">{label}</div>
      <div className="home-feature-text">{text}</div>
    </div>
  );
}
