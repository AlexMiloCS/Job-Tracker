import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, signupUser, clearError } from '../../store/authSlice';
import './AuthModal.css';

export default function AuthModal({ initialMode = 'login', onClose }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    
    if (isLogin) {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        onClose();
      }
    } else {
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }
      
      const payload = { firstName, lastName, location, email, password };
      const result = await dispatch(signupUser(payload));
      if (signupUser.fulfilled.match(result)) {
        onClose();
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setLocalError(null);
    dispatch(clearError());
  };

  const displayError = localError || error;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
        
        {displayError && <div className="auth-error">{displayError}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label>First Name <span className="required-asterisk">*</span></label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required 
                  placeholder="Jane"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email {(!isLogin) && <span className="required-asterisk">*</span>}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="you@example.com"
            />
          </div>
          
          <div className="form-group">
            <label>Password {(!isLogin) && <span className="required-asterisk">*</span>}</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="••••••••"
              />
              <button 
                type="button" 
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password <span className="required-asterisk">*</span></label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>

          {!isLogin && (
            <div className="required-legend">* fields are required</div>
          )}
        </form>
        
        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode} className="toggle-link">
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>
    </div>
  );
}
