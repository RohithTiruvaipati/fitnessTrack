import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navigation() {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();

  if (!currentUser) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/check-in', label: 'Check-in' },
    { path: '/progress', label: 'Progress' },
    { path: '/group', label: 'Group' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="bg-dark-card border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="text-xl font-bold text-dark-text">
              FitTrack
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-dark-muted hover:text-dark-text hover:bg-dark-bg'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <p className="text-sm text-dark-text">{userProfile?.name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-text hover:border-primary-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-dark-border">
        <div className="flex overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-shrink-0 px-4 py-3 text-sm transition-colors ${
                location.pathname === item.path
                  ? 'text-primary-400 border-b-2 border-primary-400'
                  : 'text-dark-muted'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
