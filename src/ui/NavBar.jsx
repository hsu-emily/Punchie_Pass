// src/components/NavBar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "@/features/auth/useAuth";

export default function NavBar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="nav">
      <div className="nav-container">
        {/* Left: App Name */}
        <Link
          to={user ? "/dashboard" : "/"}
          className="nav-brand"
        >
          Punchie
        </Link>

        {/* Right: Nav Links */}
        <div className="nav-links">
          {!user ? (
            <>
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
              >
                About
              </Link>
              <Link
                to="/login"
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/about"
                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
              >
                About
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}