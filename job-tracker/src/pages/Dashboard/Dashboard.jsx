import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { items: jobs, status, error } = useSelector((state) => state.jobs);

  return (
    <section>
      <h2 className="section-title">Recent Activity ({jobs.length})</h2>
      {status === 'loading' && <p>Loading your applications...</p>}
      {status === 'failed' && <p className="error-text">Error: {error}</p>}

      <div className="job-list-container">
        {status === 'succeeded' && jobs.map((job) => (
          <div key={job._id} className="job-card">
  {/* Top Section: Information */}
  <div className="card-header">
    <h2 className="card-company">{job.company}</h2>
    <h3 className="card-title">{job.title}</h3>
  </div>

  {/* Bottom Section: Actions */}
  <div className="card-footer">
  {job.link && (
    <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn-link">
      View Posting →
    </a>
  )}
  <button onClick={() => navigate(`/edit/${job._id}`)} className="btn-edit">
    Edit
  </button>
</div>
</div>
        ))}
      </div>
    </section>
  );
}