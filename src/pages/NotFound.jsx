import { Link } from 'react-router-dom';
import MascotBunny from '@/features/bunny/MascotBunny';
import '@/features/auth/guards.css';

export default function NotFound() {
  return (
    <div className="guard-page">
      <div className="guard-card">
        <MascotBunny size={180} />
        <div className="guard-eyebrow">★ 404 ★</div>
        <h2 className="guard-title">This page wandered off</h2>
        <p className="guard-msg">
          The bunny couldn't find what you were looking for.
        </p>
        <Link to="/" className="guard-btn">Take me home ▸</Link>
      </div>
    </div>
  );
}
