import { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar({ jobs, activeFilter, onSelectFilter }) {
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isRolesOpen, setIsRolesOpen] = useState(true);
  const [isWorkModelsOpen, setIsWorkModelsOpen] = useState(true);
  const [isLocationsOpen, setIsLocationsOpen] = useState(true);

  // Aggregate status
  const statusMap = {};
  // Aggregate roles
  const rolesMap = {};
  // Aggregate work models
  const workModelMap = {};
  // Aggregate locations
  const locationMap = {};

  jobs.forEach(job => {
    // Count Status
    if (job.status) {
      statusMap[job.status] = (statusMap[job.status] || 0) + 1;
    }
    // Count Roles
    if (job.title) {
      rolesMap[job.title] = (rolesMap[job.title] || 0) + 1;
    }
    // Count Work Models
    if (job.workModel) {
      workModelMap[job.workModel] = (workModelMap[job.workModel] || 0) + 1;
    }
    // Count Locations (prefer city, fallback to old location)
    const locKey = job.city || job.location;
    if (locKey) {
      locationMap[locKey] = (locationMap[locKey] || 0) + 1;
    }
  });

  const statuses = Object.entries(statusMap).sort((a, b) => b[1] - a[1]);
  const roles = Object.entries(rolesMap).sort((a, b) => b[1] - a[1]);
  const workModels = Object.entries(workModelMap).sort((a, b) => b[1] - a[1]);
  const locations = Object.entries(locationMap).sort((a, b) => b[1] - a[1]);

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <button 
          className={`sidebar-item ${!activeFilter ? 'active' : ''}`}
          onClick={() => onSelectFilter(null)}
        >
          All Jobs
          <span className="count-badge">{jobs.length}</span>
        </button>
      </div>

      {statuses.length > 0 && (
        <div className="sidebar-section">
          <div 
            className="sidebar-title collapsible" 
            onClick={() => setIsStatusOpen(!isStatusOpen)}
          >
            By Status
            {isStatusOpen ? <FaChevronDown className="sidebar-icon" /> : <FaChevronRight className="sidebar-icon" />}
          </div>
          {isStatusOpen && (
            <div className="sidebar-list">
              {statuses.map(([status, count]) => {
                const isActive = activeFilter?.type === 'status' && activeFilter?.value === status;
                return (
                  <button 
                    key={status}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectFilter({ type: 'status', value: status })}
                  >
                    <span className="item-label" title={status}>{status}</span>
                    <span className="count-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {workModels.length > 0 && (
        <div className="sidebar-section">
          <div 
            className="sidebar-title collapsible" 
            onClick={() => setIsWorkModelsOpen(!isWorkModelsOpen)}
          >
            By Work Model
            {isWorkModelsOpen ? <FaChevronDown className="sidebar-icon" /> : <FaChevronRight className="sidebar-icon" />}
          </div>
          {isWorkModelsOpen && (
            <div className="sidebar-list">
              {workModels.map(([model, count]) => {
                const isActive = activeFilter?.type === 'workModel' && activeFilter?.value === model;
                return (
                  <button 
                    key={model}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectFilter({ type: 'workModel', value: model })}
                  >
                    <span className="item-label">{model}</span>
                    <span className="count-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {locations.length > 0 && (
        <div className="sidebar-section">
          <div 
            className="sidebar-title collapsible" 
            onClick={() => setIsLocationsOpen(!isLocationsOpen)}
          >
            By Location
            {isLocationsOpen ? <FaChevronDown className="sidebar-icon" /> : <FaChevronRight className="sidebar-icon" />}
          </div>
          {isLocationsOpen && (
            <div className="sidebar-list">
              {locations.map(([location, count]) => {
                const isActive = activeFilter?.type === 'location' && activeFilter?.value === location;
                return (
                  <button 
                    key={location}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectFilter({ type: 'location', value: location })}
                  >
                    <span className="item-label" title={location}>{location}</span>
                    <span className="count-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {roles.length > 0 && (
        <div className="sidebar-section">
          <div 
            className="sidebar-title collapsible" 
            onClick={() => setIsRolesOpen(!isRolesOpen)}
          >
            By Role
            {isRolesOpen ? <FaChevronDown className="sidebar-icon" /> : <FaChevronRight className="sidebar-icon" />}
          </div>
          {isRolesOpen && (
            <div className="sidebar-list">
              {roles.map(([role, count]) => {
                const isActive = activeFilter?.type === 'role' && activeFilter?.value === role;
                return (
                  <button 
                    key={role}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectFilter({ type: 'role', value: role })}
                  >
                    <span className="item-label" title={role}>{role}</span>
                    <span className="count-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
