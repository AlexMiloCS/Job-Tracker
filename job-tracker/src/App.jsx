import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchJobs } from "./store/jobsSlice";

// Import your new modular pages
import Dashboard from './pages/Dashboard/Dashboard';
import JobEditor from './pages/JobEditor/JobEditor';
import LandingPage from './pages/LandingPage/LandingPage';
import Settings from './pages/SettingsPage/Settings';

import Sidebar from './components/SideBar/Sidebar';
import Header from './components/Header/Header';
import BottomBar from './components/BottomBar/BottomBar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); 
  const dispatch = useDispatch();

  useState(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/dashboard'); 
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/'); 
  };

  const ProtectedLayout = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/" />; 
    
    return (
      <div className="app-layout">
        <Sidebar onOpenModal={() => navigate('/new')} />
        <main className="main-content">
          <Header onLogout={handleLogout} />
          {children}
          <BottomBar />
        </main>
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