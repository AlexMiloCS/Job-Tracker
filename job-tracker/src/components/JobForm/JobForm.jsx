import { useState } from 'react';
import './JobForm.css';

function JobForm({ onAddJob }) {
  const today = new Date().toISOString().split('T')[0];

  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Applied');
  const [workModel, setWorkModel] = useState('Remote'); 
  const [link, setLink] = useState('');
  const [dateApplied, setDateApplied] = useState(today);
  const [requirements, setRequirements] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newJob = {
      id: crypto.randomUUID(),
      company,
      title,
      status,
      workModel, // 2. Add it to our new job object
      link,
      dateApplied,
      requirements
    };

    onAddJob(newJob);

    setCompany('');
    setTitle('');
    setStatus('Applied');
    setWorkModel('Remote'); // 3. Reset it after submission
    setLink('');
    setDateApplied(today);
    setRequirements('');
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
      
      {/* 4. We can put the two dropdowns side-by-side using a quick flex container */}
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

        {/* 5. The new Work Model dropdown */}
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
        type="date" 
        value={dateApplied} 
        onChange={(e) => setDateApplied(e.target.value)} 
        required 
        className="form-input"
      />

      <textarea 
        placeholder="Requirements / Notes (e.g., React, TypeScript, Cover Letter needed)" 
        value={requirements} 
        onChange={(e) => setRequirements(e.target.value)} 
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
        Add Job
      </button>
    </form>
  );
}

export default JobForm;