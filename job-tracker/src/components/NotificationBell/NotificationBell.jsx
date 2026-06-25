import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaBell } from 'react-icons/fa';
import './NotificationBell.css';

export default function NotificationBell() {
  const { items: jobs } = useSelector(state => state.jobs);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Filter jobs for upcoming interviews
  const upcomingInterviews = jobs.filter(
    job => job.status === 'Phone Screen' || job.status === 'Technical'
  );
  
  const interviewCount = upcomingInterviews.length;

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="bell-button" 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <FaBell className="bell-icon" />
        {interviewCount > 0 && (
          <span className="bell-badge">{interviewCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="bell-dropdown">
          <h3 className="dropdown-header">Upcoming Interviews</h3>
          <div className="dropdown-content">
            {interviewCount === 0 ? (
              <p className="muted-text">No upcoming interviews.</p>
            ) : (
              <ul className="notification-list">
                {upcomingInterviews.map(job => {
                  const dateString = job.status === 'Phone Screen' && job.datePhoneScreen 
                    ? job.datePhoneScreen 
                    : job.status === 'Technical' && job.dateTechnical 
                    ? job.dateTechnical 
                    : null;
                  const dateFormatted = dateString ? new Date(dateString).toLocaleDateString() : '';

                  return (
                    <li key={job._id} className="notification-item">
                      <span className="notification-text">
                        Interview scheduled at <strong>{job.company}</strong> for <strong>{job.title}</strong>
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span className="notification-type">({job.status})</span>
                        {dateFormatted && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {dateFormatted}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
