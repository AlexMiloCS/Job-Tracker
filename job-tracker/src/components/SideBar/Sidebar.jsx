import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaChevronDown, FaChevronRight, FaSyncAlt, FaMagic, FaPen, FaCheck, FaTimes } from 'react-icons/fa';
import { reclusterJobs, autoNameClusters, renameCluster } from '../../store/jobsSlice';
import './Sidebar.css';

export default function Sidebar({ jobs, activeFilter, onSelectFilter }) {
  const dispatch = useDispatch();

  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isClustersOpen, setIsClustersOpen] = useState(true);
  const [isWorkModelsOpen, setIsWorkModelsOpen] = useState(true);
  const [isCountriesOpen, setIsCountriesOpen] = useState(true);
  const [isCitiesOpen, setIsCitiesOpen] = useState(true);

  const [isReclustering, setIsReclustering] = useState(false);
  const [isAutoNaming, setIsAutoNaming] = useState(false);
  const [editingClusterId, setEditingClusterId] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  // Aggregate status
  const statusMap = {};
  // Aggregate clusters (replaces old roles)
  const clusterMap = {};
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
    // Count Clusters
    if (job.clusterLabel) {
      if (!clusterMap[job.clusterLabel]) {
        clusterMap[job.clusterLabel] = { count: 0, clusterId: job.clusterId };
      }
      clusterMap[job.clusterLabel].count += 1;
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
  const clusters = Object.entries(clusterMap).sort((a, b) => b[1].count - a[1].count);
  const workModels = Object.entries(workModelMap).sort((a, b) => b[1] - a[1]);
  const countries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]);
  const cities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);

  // Check if any jobs have cluster data
  const hasClusters = clusters.length > 0;
  // Check if there are any unnamed clusters (i.e. starts with 'Cluster ')
  const hasUnnamedClusters = clusters.some(([label]) => label.startsWith('Cluster '));

  const handleRecluster = async () => {
    setIsReclustering(true);
    try {
      await dispatch(reclusterJobs()).unwrap();
    } catch (err) {
      console.error('Recluster failed:', err);
    }
    setIsReclustering(false);
  };

  const handleAutoName = async () => {
    setIsAutoNaming(true);
    try {
      await dispatch(autoNameClusters()).unwrap();
    } catch (err) {
      console.error('Auto-name failed:', err);
    }
    setIsAutoNaming(false);
  };

  const handleRenameSubmit = async (clusterId) => {
    if (!editLabel.trim()) return;
    try {
      await dispatch(renameCluster({ clusterId, newLabel: editLabel.trim() })).unwrap();
    } catch (err) {
      console.error('Rename failed:', err);
    }
    setEditingClusterId(null);
    setEditLabel('');
  };

  const startEditing = (clusterId, currentLabel) => {
    setEditingClusterId(clusterId);
    setEditLabel(currentLabel);
  };

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

      {/* Cluster Section (replaces old "By Role") */}
      <div className="sidebar-section">
        <div 
          className="sidebar-title collapsible" 
          onClick={() => setIsClustersOpen(!isClustersOpen)}
        >
          By Role
          {isClustersOpen ? <FaChevronDown className="sidebar-icon" /> : <FaChevronRight className="sidebar-icon" />}
        </div>
        {isClustersOpen && (
          <div className="sidebar-list">
            {/* Action buttons */}
            <div className="cluster-actions">
              <button
                className="cluster-action-btn"
                onClick={handleRecluster}
                disabled={isReclustering || jobs.length < 2}
                title="Re-analyze and group your job titles"
              >
                <FaSyncAlt className={isReclustering ? 'spin' : ''} />
                {isReclustering ? 'Clustering...' : 'Re-cluster'}
              </button>
              {hasClusters && (
                <button
                  className="cluster-action-btn"
                  onClick={handleAutoName}
                  disabled={isAutoNaming || !hasUnnamedClusters}
                  title={hasUnnamedClusters ? "Use AI to generate cluster names" : "All clusters are already named"}
                >
                  <FaMagic className={isAutoNaming ? 'spin' : ''} />
                  {isAutoNaming ? 'Naming...' : 'AI Name'}
                </button>
              )}
            </div>

            {hasClusters ? (
              clusters.map(([label, { count, clusterId }]) => {
                const isActive = activeFilter?.type === 'cluster' && activeFilter?.value === label;
                const isEditing = editingClusterId === clusterId;

                return (
                  <div key={`cluster-${clusterId}`} className="cluster-item-row">
                    {isEditing ? (
                      <div className="cluster-edit-row">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit(clusterId);
                            if (e.key === 'Escape') setEditingClusterId(null);
                          }}
                          className="cluster-rename-input"
                          autoFocus
                        />
                        <button
                          className="cluster-edit-btn confirm"
                          onClick={() => handleRenameSubmit(clusterId)}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="cluster-edit-btn cancel"
                          onClick={() => setEditingClusterId(null)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <button 
                        className={`sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={() => onSelectFilter({ type: 'cluster', value: label })}
                      >
                        <span className="item-label" title={label}>{label}</span>
                        <span className="cluster-item-right">
                          <span className="count-badge">{count}</span>
                          <FaPen
                            className="rename-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(clusterId, label);
                            }}
                            title="Rename cluster"
                          />
                        </span>
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="cluster-hint">
                Click "Re-cluster" to group your job titles by similarity.
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
