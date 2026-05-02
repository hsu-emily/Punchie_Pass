import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase';
import MascotBunny from '@/features/bunny/MascotBunny';
import './auth.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: cred.user.email,
        createdAt: serverTimestamp(),
        onboardingCompleted: false,
      });
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-bunny"><MascotBunny size={140} /></div>
        <div className="auth-eyebrow">★ A new beginning ★</div>
        <h1 className="auth-title">Hi, friend</h1>
        <p className="auth-subtitle">Let's hatch your bunny.</p>

        <form onSubmit={handleSignup} className="auth-form">
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
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="auth-input"
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-btn auth-btn-primary">
            Create my pass ▸
          </button>
        </form>

        <div className="auth-footer">
          Already have a bunny?{' '}
          <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
