import { useState, useEffect } from 'react';
import './JobForm.css';


function JobForm({ onSaveJob, existingJob = null, autofillData = null }) {
  const today = new Date().toISOString().split('T')[0];

  const [company, setCompany] = useState(existingJob?.company || '');
  const [title, setTitle] = useState(existingJob?.title || '');
  const [status, setStatus] = useState(existingJob?.status || 'Applied');
  const [workModel, setWorkModel] = useState(existingJob?.workModel || 'Remote'); 
  const [city, setCity] = useState(existingJob?.city || existingJob?.location || ''); 
  const [country, setCountry] = useState(existingJob?.country || ''); 
  const [link, setLink] = useState(existingJob?.link || '');
  
  const initialDate = existingJob?.dateApplied 
    ? new Date(existingJob.dateApplied).toISOString().split('T')[0] 
    : today;
  const [dateApplied, setDateApplied] = useState(initialDate);
  
  const [requirements, setRequirements] = useState(existingJob?.requirements || '');
  const [notes, setNotes] = useState(existingJob?.notes || ''); 

  // Apply AI autofill data when it arrives (non-destructive: only sets fields present in the data)
  useEffect(() => {
    if (!autofillData) return;
    if (autofillData.company) setCompany(autofillData.company);
    if (autofillData.title) setTitle(autofillData.title);
    if (autofillData.workModel) setWorkModel(autofillData.workModel);
    if (autofillData.city) setCity(autofillData.city);
    if (autofillData.country) setCountry(autofillData.country);
    if (autofillData.requirements) setRequirements(autofillData.requirements);
  }, [autofillData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const jobData = {
      company,
      title,
      status,
      workModel,
      city,
      country,
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
      setCity(''); 
      setCountry('');
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
      
      <div className="form-row">
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          className="form-input"
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
        >
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>
      </div>

      <div className="form-row">
        <input 
          type="text" 
          placeholder="Country" 
          value={country} 
          onChange={(e) => setCountry(e.target.value)} 
          className="form-input"
        />
        <input 
          type="text" 
          placeholder="City" 
          value={city} 
          onChange={(e) => setCity(e.target.value)} 
          className="form-input"
        />
      </div>

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