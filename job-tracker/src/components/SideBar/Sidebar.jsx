import { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar({ jobs, activeFilter, onSelectFilter }) {
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isRolesOpen, setIsRolesOpen] = useState(true);
  const [isWorkModelsOpen, setIsWorkModelsOpen] = useState(true);
  const [isCountriesOpen, setIsCountriesOpen] = useState(true);
  const [isCitiesOpen, setIsCitiesOpen] = useState(true);

  // Aggregate status
  const statusMap = {};
  // Aggregate roles
  const rolesMap = {};
  // Aggregate work models
  const workModelMap = {};
  // Aggregate countries
  const countryMap = {};
  // Aggregate cities
  const cityMap = {};

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
    // Count Countries
    if (job.country) {
      countryMap[job.country] = (countryMap[job.country] || 0) + 1;
    }
    // Count Cities (prefer city, fallback to old location)
    const cityKey = job.city || job.location;
    if (cityKey) {
      cityMap[cityKey] = (cityMap[cityKey] || 0) + 1;
    }
  });

  const statuses = Object.entries(statusMap).sort((a, b) => b[1] - a[1]);
  const roles = Object.entries(rolesMap).sort((a, b) => b[1] - a[1]);
  const workModels = Object.entries(workModelMap).sort((a, b) => b[1] - a[1]);
  const countries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]);
  const cities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);

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

      {countries.length > 0 && (
        <div className="sidebar-section">
          <div 
            className="sidebar-title collapsible" 
            onClick={() => setIsCountriesOpen(!isCountriesOpen)}
          >
            By Country
            {isCountriesOpen ? <FaChevronDown className="sidebar-icon" /> : <FaChevronRight className="sidebar-icon" />}
          </div>
          {isCountriesOpen && (
            <div className="sidebar-list">
              {countries.map(([country, count]) => {
                const isActive = activeFilter?.type === 'country' && activeFilter?.value === country;
                return (
                  <button 
                    key={country}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectFilter({ type: 'country', value: country })}
                  >
                    <span className="item-label" title={country}>{country}</span>
                    <span className="count-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {cities.length > 0 && (
        <div className="sidebar-section">
          <div 
            className="sidebar-title collapsible" 
            onClick={() => setIsCitiesOpen(!isCitiesOpen)}
          >
            By City
            {isCitiesOpen ? <FaChevronDown className="sidebar-icon" /> : <FaChevronRight className="sidebar-icon" />}
          </div>
          {isCitiesOpen && (
            <div className="sidebar-list">
              {cities.map(([city, count]) => {
                const isActive = activeFilter?.type === 'city' && activeFilter?.value === city;
                return (
                  <button 
                    key={city}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectFilter({ type: 'city', value: city })}
                  >
                    <span className="item-label" title={city}>{city}</span>
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
