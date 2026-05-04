import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import '@/assets/cursors/globalCursor';
import { RequireAuth, RequireProfile } from '@/features/auth/RouteGuards';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Login from '@/features/auth/Login';
import Signup from '@/features/auth/Signup';
import NotFound from '@/pages/NotFound';
import RotateOverlay from '@/ui/RotateOverlay';

// Heavy routes deferred so the initial bundle (Home + auth) stays small.
// Avatar art, gacha, layout editor etc. only load once a user navigates there.
const OnboardingFlow = lazy(() => import('@/features/onboarding/OnboardingFlow'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const NewPassPage = lazy(() => import('@/features/punchpass/NewPassPage'));
const EditPassPage = lazy(() => import('@/features/punchpass/EditPassPage'));
const StudentIdPage = lazy(() => import('@/features/studentId/StudentIdPage'));
const GachaPage = lazy(() => import('@/features/gacha/GachaPage'));
const InventoryPage = lazy(() => import('@/features/gacha/InventoryPage'));
const PetsPage = lazy(() => import('@/features/pets/PetsPage'));
const CardLayoutEditor = lazy(() => import('@/features/punchpass/layout-editor/CardLayoutEditor'));
const CelebrationPage = lazy(() => import('@/features/celebration/CelebrationPage'));
const TestCelebration = lazy(() => import('@/pages/TestCelebration'));
const AvatarCustomizer = lazy(() => import('@/features/avatar/AvatarCustomizer'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RotateOverlay />
        <Suspense fallback={null}>
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
            path="/passes/new"
            element={
              <RequireProfile>
                <NewPassPage />
              </RequireProfile>
            }
          />
          <Route
            path="/passes/:id/edit"
            element={
              <RequireProfile>
                <EditPassPage />
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
          <Route
            path="/student-id"
            element={
              <RequireProfile>
                <StudentIdPage />
              </RequireProfile>
            }
          />
          <Route
            path="/gacha"
            element={
              <RequireProfile>
                <GachaPage />
              </RequireProfile>
            }
          />
          <Route
            path="/inventory"
            element={
              <RequireProfile>
                <InventoryPage />
              </RequireProfile>
            }
          />
          <Route
            path="/pets"
            element={
              <RequireProfile>
                <PetsPage />
              </RequireProfile>
            }
          />

          <Route path="/dev/card-layout-editor" element={<CardLayoutEditor />} />
          <Route path="/dev/test-celebration" element={<TestCelebration />} />
          <Route path="/avatar" element={<AvatarCustomizer />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
