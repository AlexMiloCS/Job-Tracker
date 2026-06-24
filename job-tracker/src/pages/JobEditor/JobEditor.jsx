import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateJob, addJob } from '../../store/jobsSlice';
import { useJobAutofill } from '../../hooks/useJobAutofill';
import JobForm from '../../components/JobForm/JobForm';
import './JobEditor.css';

export default function JobEditor({ isNew = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const job = useSelector(state => state.jobs.items.find(j => j._id === id));

  const [showAutofill, setShowAutofill] = useState(false);
  const [description, setDescription] = useState('');
  const [autofillData, setAutofillData] = useState(null);
  const { error, isLoading, parseJobDescription } = useJobAutofill();

  const handleSave = (data) => {
    isNew ? dispatch(addJob(data)) : dispatch(updateJob(data));
    navigate('/my-jobs');
  };

  const handleAutofill = async () => {
    if (!description.trim()) return;
    const result = await parseJobDescription(description);
    if (result) {
      setAutofillData(result);
    }
  };

  return (
    <section className="job-editor-page">
      <div className="job-editor-header">
        <h2 className="section-title">{isNew ? 'Log New Application' : 'Edit Application'}</h2>
        <div className="header-buttons">
          <button
            className={`btn-autofill-toggle ${showAutofill ? 'active' : ''}`}
            onClick={() => setShowAutofill(!showAutofill)}
            type="button"
          >
            ✨ AI Autofill
          </button>
          <button className="btn-back" onClick={() => navigate('/my-jobs')}>Back</button>
        </div>
      </div>

      {showAutofill && (
        <div className="autofill-section">
          <textarea
            className="form-input textarea-input autofill-textarea"
            placeholder="Paste the job description here and let AI extract the details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
          <div className="autofill-actions">
            <button
              className="btn-autofill"
              onClick={handleAutofill}
              disabled={isLoading || !description.trim()}
              type="button"
            >
              {isLoading ? '⏳ Parsing...' : '✨ Parse & Fill Form'}
            </button>
            {error && <p className="autofill-error">{error}</p>}
            {autofillData && <p className="autofill-success">✓ Fields populated from description</p>}
          </div>
        </div>
      )}

      <JobForm key={isNew ? 'new' : id} existingJob={job} onSaveJob={handleSave} autofillData={autofillData} />
    </section>
  );
}