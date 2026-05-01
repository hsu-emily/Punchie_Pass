import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import { useAuth } from '../auth/useAuth';

// Phase 1 stub. Phase 4 replaces this with the egg → hatch → avatar flow.
export default function OnboardingFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const completeStub = async () => {
    if (!user) return;
    await setDoc(
      doc(db, 'users', user.uid),
      { onboardingCompleted: true, updatedAt: serverTimestamp() },
      { merge: true }
    );
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Onboarding (stub)</h1>
        <p className="text-gray-600">
          The bunny narrative onboarding lands in Phase 4. For now you can skip
          straight to the dashboard.
        </p>
        <button
          onClick={completeStub}
          className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
        >
          Skip onboarding →
        </button>
      </div>
    </div>
  );
}
