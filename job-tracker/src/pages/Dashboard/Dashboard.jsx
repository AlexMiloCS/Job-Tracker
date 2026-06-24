import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteJob } from '../../store/jobsSlice';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: jobs, status, error } = useSelector((state) => state.jobs);
  
  const [jobToDelete, setJobToDelete] = useState(null);

  const confirmDelete = () => {
    if (jobToDelete) {
      dispatch(deleteJob(jobToDelete._id));
      setJobToDelete(null);
    }
  };

  return (
    <section>
      <div className="dashboard-header">
        <h2 className="section-title">Recent Activity ({jobs.length})</h2>
        <button className="new-job-btn" onClick={() => navigate('/new')}>
          + New Job
        </button>
      </div>
      
      {status === 'loading' && <p>Loading your applications...</p>}
      {status === 'failed' && <p className="error-text">Error: {error}</p>}

      <div className="job-list-container">
        {jobs.length > 0 && jobs.map((job) => (
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
        ))}
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
  );
}