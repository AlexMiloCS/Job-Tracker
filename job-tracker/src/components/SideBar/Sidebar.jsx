import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ onOpenModal }) {
  const navigate = useNavigate();
  const location = useLocation(); 

  return (
    <aside className="sidebar">
      <h2>Career Hub</h2>
      
      <button className="new-job-btn" onClick={onOpenModal}>
        + New Job
      </button>

      <ul className="nav-links">
        {/*Dashboard */}
        <li 
          className={location.pathname === '/dashboard' ? 'active' : ''} 
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </li>
        
        <li>Analytics</li> 
        
        {/*Settings */}
        <li 
          className={location.pathname === '/settings' ? 'active' : ''} 
          onClick={() => navigate('/settings')}
        >
          Settings
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;