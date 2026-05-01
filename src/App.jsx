import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { RequireAuth, RequireProfile } from './features/auth/RouteGuards';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import OnboardingFlow from './features/onboarding/OnboardingFlow';
import Dashboard from './features/dashboard/Dashboard';
import Home from './pages/Home';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
