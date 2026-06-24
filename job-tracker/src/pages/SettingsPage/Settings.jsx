import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import './Settings.css';

function Settings() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  
  const dispatch = useDispatch();

  const [profile, setProfile] = useState({ name: 'Alexandros Milonakis', email: 'alex@example.com' });
  const [passwords, setPasswords] = useState({ current: '', new: '' });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    alert('Password changed successfully!');
    setPasswords({ current: '', new: '' }); 
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
          <form onSubmit={handleProfileUpdate} className="settings-form">
            <label>Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={profile.name} 
              onChange={(e) => setProfile({...profile, name: e.target.value})} 
            />
            
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={profile.email} 
              onChange={(e) => setProfile({...profile, email: e.target.value})} 
            />
            
            <button type="submit" className="submit-btn outline-btn">Save Profile</button>
          </form>
        </section>

        {/* Section 3: Change Password */}
        <section className="settings-card">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordChange} className="settings-form">
            <label>Current Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={passwords.current} 
              onChange={(e) => setPasswords({...passwords, current: e.target.value})} 
              required 
            />
            
            <label>New Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={passwords.new} 
              onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
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