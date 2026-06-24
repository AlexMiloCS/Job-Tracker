import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateJob, addJob } from '../../store/jobsSlice';
import JobForm from '../../components/JobForm/JobForm';

export default function JobEditor({ isNew = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const job = useSelector(state => state.jobs.items.find(j => j._id === id));

  const handleSave = (data) => {
    isNew ? dispatch(addJob(data)) : dispatch(updateJob(data));
    navigate('/dashboard');
  };

  return (
    <section className="job-editor-page">
      <button onClick={() => navigate('/dashboard')}>← Back</button>
      <h2>{isNew ? 'Log New Application' : 'Edit Application'}</h2>
      <JobForm key={isNew ? 'new' : id} existingJob={job} onSaveJob={handleSave} />
    </section>
  );
}