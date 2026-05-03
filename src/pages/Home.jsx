import { Link } from 'react-router-dom';
import MascotBunny from '@/features/bunny/MascotBunny';
import { useAuth } from '@/features/auth/useAuth';
import windowsPink from '@/assets/punch_cards/WindowsPink.png';
import lacePink from '@/assets/punch_cards/LacePink.png';
import digiCam from '@/assets/punch_cards/DigiCam.png';
import coin from '@/assets/coin.png';
import shard from '@/assets/shard.png';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-text">
          <span className="home-eyebrow">★ Punchie Pass ★</span>
          <h1 className="home-title">Punchie Pass</h1>
          <p className="home-tagline">
            Create a punch pass and keep track of your habits, achievements,
            and tiny wins — with a bunny that grows alongside you.
          </p>
          <div className="home-actions">
            {user ? (
              <Link to="/dashboard" className="home-btn home-btn-primary">
                Go to dashboard ▸
              </Link>
            ) : (
              <>
                <Link to="/signup" className="home-btn home-btn-primary">
                  Sign up free ▸
                </Link>
                <Link to="/login" className="home-btn home-btn-ghost">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="home-hero-art">
          <div className="home-hero-card">
            <img src={windowsPink} alt="A pink Punchie Pass punch card" />
          </div>
          <MascotBunny size={180} className="home-hero-bunny" />
        </div>
      </section>

      {/* How it works */}
      <section className="home-how">
        <span className="home-section-eyebrow">★ HOW IT WORKS ★</span>
        <h2 className="home-section-title">Three small steps</h2>

        <div className="home-steps">
          <article className="home-step">
            <div className="home-step-art">
              <img src={lacePink} alt="A lace-pink punch card with bow icons" />
              <span className="home-step-num">1</span>
            </div>
            <h3>Make a punch card</h3>
            <p>
              Pick a card style, name your habit, and set a reward. Each
              completion punches a hole — fill the card to claim your treat.
            </p>
          </article>

          <article className="home-step">
            <div className="home-step-art home-step-art-bunny">
              <MascotBunny size={140} />
              <span className="home-step-num">2</span>
            </div>
            <h3>Hatch a bunny</h3>
            <p>
              Onboarding hatches your starter bunny. Show up consistently and
              your bunny levels up — unlocking new looks and ID skins.
            </p>
          </article>

          <article className="home-step">
            <div className="home-step-art home-step-art-rewards">
              <img src={digiCam} alt="A digi-cam style punch card" />
              <div className="home-step-overlay">
                <img src={coin} alt="" className="home-coin" />
                <img src={shard} alt="" className="home-shard" />
              </div>
              <span className="home-step-num">3</span>
            </div>
            <h3>Earn coins & pulls</h3>
            <p>
              Completed cards drop coins and gacha tokens. Spend them on the
              Punchie Machine for new card themes, icons, and pets.
            </p>
          </article>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="home-cta">
        <h2 className="home-cta-title">Ready to start punching?</h2>
        <p className="home-cta-sub">
          Free to start. New members get 10 starter tokens for the Punchie
          Machine.
        </p>
        <div className="home-actions">
          {user ? (
            <Link to="/dashboard" className="home-btn home-btn-primary">
              Go to dashboard ▸
            </Link>
          ) : (
            <>
              <Link to="/signup" className="home-btn home-btn-primary">
                Sign up free ▸
              </Link>
              <Link to="/login" className="home-btn home-btn-ghost">
                Log in
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
