import BottomBar from '../../components/BottomBar/BottomBar';
import './LandingPage.css';

function LandingPage({ onLogin }) {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <h2 className="brand-logo">Job Tracker</h2>
        <div className="header-actions">
          <button className="auth-btn login-btn" onClick={onLogin}>Log In</button>
          <button className="auth-btn signup-btn" onClick={onLogin}>Sign Up</button>
        </div>
      </nav>

      {/* The Hero Section */}
      <main className="hero-section">
        <div className="hero-text">
          <h1 className="hero-title">
            Take Control of Your <span className="text-highlight">Job Search.</span>
          </h1>
          <p className="hero-subtitle">
            Track applications, organize requirements, and land your dream job faster with an elegant, built-for-you dashboard.
          </p>
          <button className="cta-btn" onClick={onLogin}>
            Start Tracking for Free →
          </button>
        </div>
        
        <div className="hero-image-container">
          {/*free stock photo*/}
          <img 
            src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=1200" 
            alt="Workspace with computer" 
            className="hero-image"
          />
        </div>
      </main>

      {/*BottomBar component*/}
      <BottomBar />
      
    </div>
  );
}

export default LandingPage;