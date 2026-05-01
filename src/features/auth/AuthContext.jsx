import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

export const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) setProfile(null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? snap.data() : null);
      setProfileLoading(false);
    });
    return unsub;
  }, [user]);

  const loading = authLoading || (!!user && profileLoading);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
