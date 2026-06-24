import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteJob } from '../../store/jobsSlice';
import Sidebar from '../../components/SideBar/Sidebar';
import './MyJobs.css';

export default function MyJobs() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: jobs, status, error } = useSelector((state) => state.jobs);
  
  const [jobToDelete, setJobToDelete] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const confirmDelete = () => {
    if (jobToDelete) {
      dispatch(deleteJob(jobToDelete._id));
      setJobToDelete(null);
    }
  };

  // Filter jobs
  const displayedJobs = jobs.filter(job => {
    if (!activeFilter) return true;
    if (activeFilter.type === 'status') return job.status === activeFilter.value;
    if (activeFilter.type === 'role') return job.title === activeFilter.value;
    if (activeFilter.type === 'workModel') return job.workModel === activeFilter.value;
    if (activeFilter.type === 'location') return job.location === activeFilter.value;
    return true;
  });

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
          <h2 className="section-title">{pageTitle} ({displayedJobs.length})</h2>
          <button className="new-job-btn" onClick={() => navigate('/new')}>
            + New Job
          </button>
        </div>
        
        {status === 'loading' && <p>Loading your applications...</p>}
        {status === 'failed' && <p className="error-text">Error: {error}</p>}

        <div className="job-list-container">
          {displayedJobs.length > 0 ? displayedJobs.map((job) => (
            <div key={job._id} className="job-card">
              {/* Top Section: Information */}
              <div className="card-header">
                <h2 className="card-company">{job.company}</h2>
                <h3 className="card-title">{job.title}</h3>
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
                  <button onClick={() => navigate(`/edit/${job._id}`)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => setJobToDelete(job)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )) : (
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
      </section>
    </div>
  );
}