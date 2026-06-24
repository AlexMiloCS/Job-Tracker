import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, clearJobs } from "./store/jobsSlice";
import { logout } from './store/authSlice';

// Import your new modular pages
import Dashboard from './pages/Dashboard/Dashboard';
import JobEditor from './pages/JobEditor/JobEditor';
import LandingPage from './pages/LandingPage/LandingPage';
import Settings from './pages/SettingsPage/Settings';

import Header from './components/Header/Header';
import BottomBar from './components/BottomBar/BottomBar';
import './App.css';

function App() {
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // We are authenticated if we have a user in Redux
  const isAuthenticated = !!user;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchJobs());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogin = () => {
    // With real auth, state is updated via Redux, so just navigate
    navigate('/dashboard'); 
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearJobs());
    navigate('/'); 
  };

  const ProtectedLayout = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/" />; 
    
    return (
      <div className="protected-wrapper">
        <Header onLogout={handleLogout} />
        <main className="main-content">
          {children}
        </main>
        <BottomBar />
      </div>
    );
  };

  return (
    <Routes>
      {/* Landing Page */}
      <Route 
        path="/" 
        element={!isAuthenticated ? <LandingPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
      />

      {/* Main App Routes */}
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      
      {/* Editor page*/}
      <Route path="/new" element={<ProtectedLayout><JobEditor isNew={true} /></ProtectedLayout>} />
      <Route path="/edit/:id" element={<ProtectedLayout><JobEditor isNew={false} /></ProtectedLayout>} />
      
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
    </Routes>
  );
}

export default App;