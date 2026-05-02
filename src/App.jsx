import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { RequireAuth, RequireProfile } from '@/features/auth/RouteGuards';
import Login from '@/features/auth/Login';
import Signup from '@/features/auth/Signup';
import OnboardingFlow from '@/features/onboarding/OnboardingFlow';
import Dashboard from '@/features/dashboard/Dashboard';
import CreatePunchPass from '@/features/punchpass/CreatePunchPass';
import CardLayoutEditor from '@/features/punchpass/layout-editor/CardLayoutEditor';
import CelebrationPage from '@/features/celebration/CelebrationPage';
import Home from '@/pages/Home';
import About from '@/pages/About';
import TestCelebration from '@/pages/TestCelebration';
import AvatarCustomizer from '@/features/avatar/AvatarCustomizer';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <OnboardingFlow />
              </RequireAuth>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireProfile>
                <Dashboard />
              </RequireProfile>
            }
          />
          <Route
            path="/create-punch-pass"
            element={
              <RequireProfile>
                <CreatePunchPass />
              </RequireProfile>
            }
          />
          <Route
            path="/celebration"
            element={
              <RequireProfile>
                <CelebrationPage />
              </RequireProfile>
            }
          />

          <Route path="/dev/card-layout-editor" element={<CardLayoutEditor />} />
          <Route path="/dev/test-celebration" element={<TestCelebration />} />
          <Route path="/avatar" element={<AvatarCustomizer />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
