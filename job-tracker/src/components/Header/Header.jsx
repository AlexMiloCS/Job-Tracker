import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from '../NotificationBell/NotificationBell';
import './Header.css';

function Header({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="top-header">
      <div className="header-logo" onClick={() => navigate('/my-jobs')}>
        Career Hub
      </div>

      <nav className="header-nav">
        <button 
          className={`nav-link ${location.pathname === '/my-jobs' ? 'active' : ''}`}
          onClick={() => navigate('/my-jobs')}
        >
          My Jobs
        </button>
        <button 
          className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
          onClick={() => navigate('/analytics')}
        >
          Analytics
        </button>
        <button 
          className={`nav-link ${location.pathname === '/cv-builder' ? 'active' : ''}`}
          onClick={() => navigate('/cv-builder')}
        >
          CV Builder
        </button>
        <button 
          className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
        >
          Settings
        </button>
      </nav>

      <div className="header-actions">
        <NotificationBell />
        <button className="auth-btn login-btn" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </header>
  );
}

export default Header;