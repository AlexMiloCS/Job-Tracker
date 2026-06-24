import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import { updateProfile, updatePassword } from '../../store/authSlice';
import './Settings.css';

function Settings() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const user = useSelector((state) => state.auth.user);
  
  const dispatch = useDispatch();

  const [profile, setProfile] = useState({ 
    firstName: '', 
    lastName: '',
    email: '' 
  });
  
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [profileMessage, setProfileMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      const resultAction = await dispatch(updateProfile(profile));
      if (updateProfile.fulfilled.match(resultAction)) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMessage({ type: 'error', text: resultAction.payload || 'Failed to update profile' });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'An unexpected error occurred' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    try {
      const resultAction = await dispatch(updatePassword(passwords));
      if (updatePassword.fulfilled.match(resultAction)) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswords({ currentPassword: '', newPassword: '' }); 
      } else {
        setPasswordMessage({ type: 'error', text: resultAction.payload || 'Failed to update password' });
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'An unexpected error occurred' });
    }
  };

  return (
    <div className="settings-page">
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Settings</h2>

      <div className="settings-grid">
        
        {/* Section 1: Appearance */}
        <section className="settings-card">
          <h3>Appearance</h3>
          <div className="setting-item">
            <div className="setting-text">
              <strong>Dark Mode</strong>
              <p>Switch between light and dark themes.</p>
            </div>
            
            <label className="toggle-switch">
              {/* 3. Dispatch the Redux action when the switch is clicked */}
              <input 
                type="checkbox" 
                checked={isDarkMode} 
                onChange={() => dispatch(toggleTheme())} 
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        {/* Section 2: Profile Information */}
        <section className="settings-card">
          <h3>Profile Information</h3>
          {profileMessage && (
            <div className={`settings-message ${profileMessage.type}`}>
              {profileMessage.text}
            </div>
          )}
          <form onSubmit={handleProfileUpdate} className="settings-form">
            <label>First Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={profile.firstName} 
              onChange={(e) => setProfile({...profile, firstName: e.target.value})}
              required 
            />
            
            <label>Last Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={profile.lastName} 
              onChange={(e) => setProfile({...profile, lastName: e.target.value})} 
            />
            
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={profile.email} 
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              required 
            />
            
            <button type="submit" className="submit-btn outline-btn">Save Profile</button>
          </form>
        </section>

        {/* Section 3: Change Password */}
        <section className="settings-card">
          <h3>Change Password</h3>
          {passwordMessage && (
            <div className={`settings-message ${passwordMessage.type}`}>
              {passwordMessage.text}
            </div>
          )}
          <form onSubmit={handlePasswordChange} className="settings-form">
            <label>Current Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={passwords.currentPassword} 
              onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} 
              required 
            />
            
            <label>New Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={passwords.newPassword} 
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} 
              required 
            />
            
            <button type="submit" className="submit-btn outline-btn">Update Password</button>
          </form>
        </section>

      </div>
    </div>
  );
}

export default Settings;