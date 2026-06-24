import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateJob, addJob } from '../../store/jobsSlice';
import JobForm from '../../components/JobForm/JobForm';
import './JobEditor.css';

export default function JobEditor({ isNew = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const job = useSelector(state => state.jobs.items.find(j => j._id === id));

  const handleSave = (data) => {
    isNew ? dispatch(addJob(data)) : dispatch(updateJob(data));
    navigate('/my-jobs');
  };

  return (
    <section className="job-editor-page">
      <div className="job-editor-header">
        <h2 className="section-title">{isNew ? 'Log New Application' : 'Edit Application'}</h2>
        <button className="btn-back" onClick={() => navigate('/my-jobs')}>Back</button>
      </div>
      <JobForm key={isNew ? 'new' : id} existingJob={job} onSaveJob={handleSave} />
    </section>
  );
}