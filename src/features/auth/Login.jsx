import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../services/firebase';
import MascotBunny from '@/features/bunny/MascotBunny';
import './auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-bunny"><MascotBunny size={140} /></div>
        <div className="auth-eyebrow">★ Welcome back ★</div>
        <h1 className="auth-title">Hi again</h1>
        <p className="auth-subtitle">Your bunny missed you.</p>

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-btn auth-btn-primary">
            Log in ▸
          </button>
          <div className="auth-divider">or</div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="auth-btn auth-btn-ghost"
          >
            Continue with Google
          </button>
        </form>

        <div className="auth-footer">
          New here?{' '}
          <Link to="/signup">Make a bunny</Link>
        </div>
      </div>
    </div>
  );
}
