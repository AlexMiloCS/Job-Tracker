import './Header.css';
function Header({ onLogout }) {
  return (
    <header className="top-header">
      <div className="header-actions">
        {/* We replace the login/signup buttons with a single Log Out button */}
        <button className="auth-btn login-btn" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </header>
  );
}

export default Header;