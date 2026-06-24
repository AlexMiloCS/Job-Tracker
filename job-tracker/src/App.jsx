import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import JobForm from './components/JobForm/JobForm';
import Sidebar from './components/SideBar/Sidebar';
import Header from './components/Header/Header';
import LandingPage from './pages/LandingPage/LandingPage';
import Settings from './pages/SettingsPage/Settings';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate(); 

  // Job data state
  const [jobs, setJobs] = useState([
    {
      id: crypto.randomUUID(), 
      company: "Tech Corp",
      title: "Frontend Developer",
      dateApplied: "2026-06-23",
      status: "Applied", 
      workModel: "Hybrid", 
      link: "https://example.com/job",
      requirements: "Must know React and Vite." 
    }
  ]);

  const handleAddJob = (newJob) => {
    setJobs([newJob, ...jobs]);
    navigate('/dashboard');
  };

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
        </main>
      </div>
    );
  };

  return (
    <Routes>
      
      {/*The Landing Page */}
      <Route 
        path="/" 
        element={!isAuthenticated ? <LandingPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
      />

      {/*The Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedLayout>
            <section>
              <h2 className="section-title">Recent Activity ({jobs.length})</h2>
              
              <div className="job-list-container">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <h3 className="job-title">
                      {job.title} <span className="job-company">at {job.company}</span>
                    </h3>
                    
                    <div className="job-meta">
                      <span className="status-badge">{job.status}</span>
                      <span className="work-model-badge">{job.workModel}</span> 
                      <span>Applied: {job.dateApplied}</span>
                    </div>

                    {job.requirements && (
                      <p className="job-requirements">
                        <strong>Notes:</strong> {job.requirements}
                      </p>
                    )}

                    {job.link && (
                      <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-link">
                        View Posting →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </ProtectedLayout>
        } 
      />

      {/*New Job Form */}
      <Route 
        path="/new" 
        element={
          <ProtectedLayout>
            <section className="new-job-page">
              <button 
                onClick={() => navigate('/dashboard')} 
                style={{ marginBottom: '20px', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: '#f9f9f9' }}
              >
                ← Back to Dashboard
              </button>
              
              <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Log New Application</h2>
              <JobForm onAddJob={handleAddJob} />
            </section>
          </ProtectedLayout>
        } 
      />

      {/*Settings Page*/}
      <Route 
        path="/settings" 
        element={
          <ProtectedLayout>
            <Settings />
          </ProtectedLayout>
        } 
      />

    </Routes>
  );
}

export default App;