import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import { updateProfile, updatePassword, uploadCV, deleteCV } from '../../store/authSlice';
import './Settings.css';

function Settings() {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  
  const dispatch = useDispatch();

  const [profile, setProfile] = useState({ 
    firstName: '', 
    lastName: '',
    email: '' 
  });
  
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [profileMessage, setProfileMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [cvMessage, setCvMessage] = useState(null);
  const [hasSavedCV, setHasSavedCV] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }

    // Check if user has saved CV data
    const checkSavedCV = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/cv-data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setHasSavedCV(true);
        }
      } catch (err) {
        console.error("Failed to check saved CV:", err);
      }
    };
    if (token) checkSavedCV();
  }, [user, token]);

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

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setCvMessage({ type: 'error', text: 'Only PDF files are accepted.' });
      return;
    }

    setCvMessage(null);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const resultAction = await dispatch(uploadCV(formData));
      if (uploadCV.fulfilled.match(resultAction)) {
        setCvMessage({ type: 'success', text: 'CV uploaded successfully!' });
      } else {
        setCvMessage({ type: 'error', text: resultAction.payload || 'Failed to upload CV' });
      }
    } catch (err) {
      setCvMessage({ type: 'error', text: 'An unexpected error occurred' });
    }
  };

  const handleDeleteCV = async () => {
    setCvMessage(null);
    try {
      const resultAction = await dispatch(deleteCV());
      if (deleteCV.fulfilled.match(resultAction)) {
        setCvMessage({ type: 'success', text: 'CV deleted successfully!' });
      } else {
        setCvMessage({ type: 'error', text: resultAction.payload || 'Failed to delete CV' });
      }
    } catch (err) {
      setCvMessage({ type: 'error', text: 'An unexpected error occurred' });
    }
  };

  const handleViewCV = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/cv-file/uploaded`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch CV');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch(err) {
      setCvMessage({ type: 'error', text: 'Failed to load CV' });
    }
  };

  const handleViewGeneratedCV = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/cv-file/generated`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch generated CV');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch(err) {
      setCvMessage({ type: 'error', text: 'Failed to load generated CV' });
    }
  };

  const handleClearSavedCV = async () => {
    setCvMessage(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/cv-data`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setHasSavedCV(false);
        setCvMessage({ type: 'success', text: 'Saved Builder CV cleared successfully!' });
      } else {
        setCvMessage({ type: 'error', text: 'Failed to clear saved CV' });
      }
    } catch (err) {
      setCvMessage({ type: 'error', text: 'An unexpected error occurred' });
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

        {/* Section 4: Resume / CV */}
        <section className="settings-card">
          <h3>Resume / CV</h3>
          {cvMessage && (
            <div className={`settings-message ${cvMessage.type}`}>
              {cvMessage.text}
            </div>
          )}
          <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '15px' }}>
            <div className="setting-text">
              <strong>Upload your CV</strong>
              <p>Only PDF files are accepted. Max size 5MB.</p>
            </div>
            {user?.cvUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                <button onClick={handleViewCV} style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                  📄 View Current CV
                </button>
                <button type="button" onClick={handleDeleteCV} className="submit-btn outline-btn" style={{ borderColor: '#ef4444', color: '#ef4444', marginLeft: 'auto', padding: '6px 12px', marginTop: 0 }}>
                  ✖ Delete
                </button>
              </div>
            ) : (
              <div>
                <input 
                  type="file" 
                  id="cv-upload"
                  accept="application/pdf"
                  onChange={handleCVUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="cv-upload" className="submit-btn outline-btn" style={{ cursor: 'pointer', display: 'inline-block', marginTop: 0 }}>
                  Choose File
                </label>
              </div>
            )}
          </div>

          <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '15px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <div className="setting-text">
              <strong>Saved Builder CV</strong>
              <p>Your work from the CV Builder saved to your account.</p>
            </div>
            {hasSavedCV ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                  ✅ Linked to your account
                </span>
                
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
                  {user?.generatedCvUrl && (
                    <button onClick={handleViewGeneratedCV} style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                      📄 View PDF
                    </button>
                  )}
                  <button type="button" onClick={handleClearSavedCV} className="submit-btn outline-btn" style={{ borderColor: '#ef4444', color: '#ef4444', padding: '6px 12px', marginTop: 0 }}>
                    ✖ Clear Saved CV
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No Builder CV currently saved. Go to CV Builder and click 'Save CV'.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Settings;