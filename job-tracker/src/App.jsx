import { useState } from 'react';

function App() {
  // We are placing your blueprint right here as our initial "dummy" data.
  // Later, this array will start empty, and our form will push new objects like this into it.
  const [jobs, setJobs] = useState([
    {
      id: crypto.randomUUID(), 
      company: "Tech Corp",
      title: "Frontend Developer",
      dateApplied: "2026-06-23",
      status: "Applied", 
      link: "https://example.com/job"
    }
  ]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>My Job Tracker</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>Add a New Job</h2>
        <p style={{ color: '#666' }}>Form goes here...</p>
      </section>

      <section>
        <h2>My Applications ({jobs.length})</h2>
        
        {/* Here is where we map over the jobs array to display them on the screen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {jobs.map((job) => (
            <div key={job.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{job.title} at {job.company}</h3>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                <strong>Status:</strong> {job.status} | <strong>Applied:</strong> {job.dateApplied}
              </p>
              <a href={job.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: 'blue' }}>
                View Job Description
              </a>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}

export default App;