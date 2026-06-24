import { useState, useEffect } from 'react';
import './JobForm.css';


function JobForm({ onSaveJob, existingJob = null }) {
  const today = new Date().toISOString().split('T')[0];

  const [company, setCompany] = useState(existingJob?.company || '');
  const [title, setTitle] = useState(existingJob?.title || '');
  const [status, setStatus] = useState(existingJob?.status || 'Applied');
  const [workModel, setWorkModel] = useState(existingJob?.workModel || 'Remote'); 
  const [location, setLocation] = useState(existingJob?.location || ''); 
  const [link, setLink] = useState(existingJob?.link || '');
  
  const initialDate = existingJob?.dateApplied 
    ? new Date(existingJob.dateApplied).toISOString().split('T')[0] 
    : today;
  const [dateApplied, setDateApplied] = useState(initialDate);
  
  const [requirements, setRequirements] = useState(existingJob?.requirements || '');
  const [notes, setNotes] = useState(existingJob?.notes || ''); 

  const handleSubmit = (e) => {
    e.preventDefault();

    const jobData = {
      company,
      title,
      status,
      workModel,
      location, 
      link,
      dateApplied,
      requirements,
      notes 
    };

    if (existingJob?._id) {
      jobData._id = existingJob._id;
    }

    onSaveJob(jobData);

    if (!existingJob) {
      setCompany('');
      setTitle('');
      setStatus('Applied');
      setWorkModel('Remote');
      setLocation(''); 
      setLink('');
      setDateApplied(today);
      setRequirements('');
      setNotes(''); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="job-form">
      <input 
        type="text" 
        placeholder="Company Name" 
        value={company} 
        onChange={(e) => setCompany(e.target.value)} 
        required 
        className="form-input"
      />
      
      <input 
        type="text" 
        placeholder="Job Title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required 
        className="form-input"
      />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          className="form-input"
          style={{ flex: 1 }}
        >
          <option value="Saved">Saved</option>
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select 
          value={workModel} 
          onChange={(e) => setWorkModel(e.target.value)}
          className="form-input"
          style={{ flex: 1 }}
        >
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>
      </div>

      <input 
        type="text" 
        placeholder="Location (e.g., City, State, or N/A)" 
        value={location} 
        onChange={(e) => setLocation(e.target.value)} 
        className="form-input"
      />

      <input 
        type="date" 
        value={dateApplied} 
        onChange={(e) => setDateApplied(e.target.value)} 
        required 
        className="form-input"
      />

      <textarea 
        placeholder="Requirements (e.g., React, TypeScript, 3+ Years Exp)" 
        value={requirements} 
        onChange={(e) => setRequirements(e.target.value)} 
        className="form-input textarea-input"
      />

      <textarea 
        placeholder="Notes (e.g., Cover Letter needed, Referral from Sarah)" 
        value={notes} 
        onChange={(e) => setNotes(e.target.value)} 
        className="form-input textarea-input"
      />

      <input 
        type="url" 
        placeholder="Link to Job Posting" 
        value={link} 
        onChange={(e) => setLink(e.target.value)} 
        className="form-input"
      />
      
      <button type="submit" className="submit-btn">
        {existingJob ? 'Update Application' : 'Add Job'}
      </button>
    </form> 
  );
}

export default JobForm;