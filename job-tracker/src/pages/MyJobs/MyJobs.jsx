import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteJob } from '../../store/jobsSlice';
import { FaLaptop, FaBuilding, FaSearch, FaTimes } from 'react-icons/fa';
import Sidebar from '../../components/SideBar/Sidebar';
import './MyJobs.css';

export default function MyJobs() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: jobs, status, error } = useSelector((state) => state.jobs);
  
  const [jobToDelete, setJobToDelete] = useState(null);
  const [jobToView, setJobToView] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset page when filter, sort, search, or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, sortBy, searchQuery, itemsPerPage]);

  const confirmDelete = () => {
    if (jobToDelete) {
      dispatch(deleteJob(jobToDelete._id));
      setJobToDelete(null);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    // 1. Filter by Sidebar selection
    if (activeFilter) {
      if (activeFilter.type === 'status' && job.status !== activeFilter.value) return false;
      if (activeFilter.type === 'cluster' && job.clusterLabel !== activeFilter.value) return false;
      if (activeFilter.type === 'workModel' && job.workModel !== activeFilter.value) return false;
      if (activeFilter.type === 'country' && job.country !== activeFilter.value) return false;
      if (activeFilter.type === 'city' && (job.city || job.location) !== activeFilter.value) return false;
    }
    
    // 2. Filter by Deep Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      // Combine all meaningful fields into one searchable string
      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.city,
        job.country,
        job.workModel,
        job.status,
        job.requirements,
        job.notes
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }

    return true;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'a-z') {
      return a.company.localeCompare(b.company);
    } else if (sortBy === 'oldest') {
      return new Date(a.dateApplied) - new Date(b.dateApplied);
    } else if (sortBy === 'status') {
      const statusOrder = {
        'Offer': 1,
        'Interviewing': 2,
        'Applied': 3,
        'Saved': 4,
        'Rejected': 5
      };
      
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // Fallback to latest if statuses are the same
      return new Date(b.dateApplied) - new Date(a.dateApplied);
    } else { // 'latest'
      return new Date(b.dateApplied) - new Date(a.dateApplied);
    }
  });

  // Paginate jobs
  const jobsPerPage = itemsPerPage;
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const displayedJobs = sortedJobs.slice(startIndex, startIndex + jobsPerPage);

  const pageTitle = activeFilter 
    ? `${activeFilter.value} Jobs`
    : 'All Jobs';

  return (
    <div className="my-jobs-layout">
      <Sidebar 
        jobs={jobs} 
        activeFilter={activeFilter} 
        onSelectFilter={setActiveFilter} 
      />
      
      <section className="my-jobs-content">
        <div className="dashboard-header">
          <h2 className="section-title">{pageTitle} ({filteredJobs.length})</h2>
          <div className="header-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select 
              className="sort-dropdown"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="a-z">A-Z</option>
              <option value="status">Status</option>
            </select>
            <select
              className="sort-dropdown"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              title="Items per page"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={1000}>Show All</option>
            </select>
            <button className="new-job-btn" onClick={() => navigate('/new')}>
              + New Job
            </button>
          </div>
        </div>
        
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by title, company, skills, or notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="Clear search">
              <FaTimes />
            </button>
          )}
        </div>

        {status === 'loading' && <p>Loading your applications...</p>}
        {status === 'failed' && <p className="error-text">Error: {error}</p>}

        <div className="job-list-container">
          {displayedJobs.length > 0 ? (
            <>
              {displayedJobs.map((job) => (
            <div key={job._id} className="job-card">
              {/* Top Section: Information */}
              <div className="card-header">
                <h2 className="card-company">{job.company}</h2>
                <h3 className="card-title">{job.title}</h3>
              </div>

              {/* Middle Section: Meta & Details */}
              <div className="card-details">
                <div className="job-meta">
                  {job.status && <span className={`status-badge status-${job.status.toLowerCase()}`}>{job.status}</span>}
                  {job.workModel && (
                    <span className="work-model-badge" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {job.workModel === 'Remote' && <FaLaptop style={{ marginRight: '5px' }} />}
                      {job.workModel === 'On-site' && <FaBuilding style={{ marginRight: '5px' }} />}
                      {job.workModel === 'Hybrid' && (
                        <span style={{ marginRight: '5px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <FaBuilding /> <span style={{ fontSize: '10px' }}>⇄</span> <FaLaptop />
                        </span>
                      )}
                      {job.workModel}
                    </span>
                  )}
                  {(job.city || job.country || job.location) && (
                    <span className="location-badge">
                      {[job.city, job.country].filter(Boolean).join(', ') || job.location}
                    </span>
                  )}
                </div>
                
                {job.requirements && (
                  <p className="job-requirements">
                    {job.requirements}
                  </p>
                )}
              </div>

              {/* Bottom Section: Actions */}
              <div className="card-footer">
                {job.link ? (
                  <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn-link">
                    View Posting →
                  </a>
                ) : (
                  <span className="spacer"></span>
                )}
                <div className="card-actions">
                  <button onClick={() => setJobToView(job)} className="btn-view">
                    View
                  </button>
                  <button onClick={() => navigate(`/edit/${job._id}`)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => setJobToDelete(job)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
              
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="btn-page"
                  >
                    Prev
                  </button>
                  <span className="page-info">Page {currentPage} of {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="btn-page"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="no-jobs-text">No jobs found for this category.</p>
          )}
        </div>

        {jobToDelete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Delete Job Entry</h3>
              <p>Are you sure you want to delete this entry?</p>
              <div className="modal-job-info">
                <strong>{jobToDelete.title}</strong> at {jobToDelete.company}
              </div>
              <div className="modal-actions">
                <button onClick={() => setJobToDelete(null)} className="btn-cancel">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="btn-confirm-delete">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {jobToView && (
          <div className="modal-overlay">
            <div className="modal-content view-modal">
              <h2 className="card-company" style={{ marginBottom: '5px' }}>{jobToView.company}</h2>
              <h3 className="card-title" style={{ marginBottom: '20px' }}>{jobToView.title}</h3>
              
              <div className="job-meta" style={{ marginBottom: '20px', justifyContent: 'center' }}>
                <span className={`status-badge status-${jobToView.status.toLowerCase()}`}>{jobToView.status}</span>
                <span className="work-model-badge">{jobToView.workModel}</span>
                {(jobToView.city || jobToView.country || jobToView.location) && (
                  <span className="location-badge">
                    {[jobToView.city, jobToView.country].filter(Boolean).join(', ') || jobToView.location}
                  </span>
                )}
              </div>

              <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                {jobToView.dateApplied && (
                  <p style={{ margin: '5px 0', color: 'var(--text-secondary)' }}>
                    <strong>Date Applied:</strong> {new Date(jobToView.dateApplied).toLocaleDateString()}
                  </p>
                )}
                {jobToView.requirements && (
                  <div style={{ margin: '15px 0' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Requirements:</strong>
                    <p style={{ margin: '5px 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{jobToView.requirements}</p>
                  </div>
                )}
                {jobToView.notes && (
                  <div style={{ margin: '15px 0' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Notes:</strong>
                    <p style={{ margin: '5px 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{jobToView.notes}</p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button onClick={() => setJobToView(null)} className="btn-cancel">
                  Close
                </button>
                <button onClick={() => { setJobToView(null); navigate(`/edit/${jobToView._id}`); }} className="btn-view">
                  Edit Job
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}