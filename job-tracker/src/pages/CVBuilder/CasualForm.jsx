import React, { useState } from 'react';
import './CasualForm.css';
import DynamicInput from './DynamicInput';

function CasualForm({ data, onChange }) {
  const [activeTab, setActiveTab] = useState('basics');
  const updateBasics = (field, value) => {
    onChange({ ...data, basics: { ...data.basics, [field]: value } });
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...(data.basics?.links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange({ ...data, basics: { ...data.basics, links: newLinks } });
  };

  const addLink = () => {
    const newLinks = [...(data.basics?.links || []), { name: '', url: '' }];
    onChange({ ...data, basics: { ...data.basics, links: newLinks } });
  };

  const removeLink = (index) => {
    const newLinks = (data.basics?.links || []).filter((_, i) => i !== index);
    onChange({ ...data, basics: { ...data.basics, links: newLinks } });
  };

  const updateArrayItem = (arrayName, index, field, value) => {
    const newArray = [...(data[arrayName] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    onChange({ ...data, [arrayName]: newArray });
  };

  const addArrayItem = (arrayName, defaultObj) => {
    const newArray = [...(data[arrayName] || []), defaultObj];
    onChange({ ...data, [arrayName]: newArray });
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = (data[arrayName] || []).filter((_, i) => i !== index);
    onChange({ ...data, [arrayName]: newArray });
  };

  const updateHighlight = (arrayName, itemIndex, hIndex, value) => {
    const newArray = [...(data[arrayName] || [])];
    const newHighlights = [...(newArray[itemIndex].highlights || [])];
    newHighlights[hIndex] = value;
    newArray[itemIndex] = { ...newArray[itemIndex], highlights: newHighlights };
    onChange({ ...data, [arrayName]: newArray });
  };

  const addHighlight = (arrayName, itemIndex) => {
    const newArray = [...(data[arrayName] || [])];
    const newHighlights = [...(newArray[itemIndex].highlights || []), ''];
    newArray[itemIndex] = { ...newArray[itemIndex], highlights: newHighlights };
    onChange({ ...data, [arrayName]: newArray });
  };

  const removeHighlight = (arrayName, itemIndex, hIndex) => {
    const newArray = [...(data[arrayName] || [])];
    const newHighlights = (newArray[itemIndex].highlights || []).filter((_, i) => i !== hIndex);
    newArray[itemIndex] = { ...newArray[itemIndex], highlights: newHighlights };
    onChange({ ...data, [arrayName]: newArray });
  };

  const updateSkill = (oldKey, newKey, value) => {
    const newSkills = { ...data.skills };
    if (oldKey !== newKey) {
      delete newSkills[oldKey];
    }
    newSkills[newKey] = value;
    onChange({ ...data, skills: newSkills });
  };

  const addSkill = () => {
    onChange({ ...data, skills: { ...data.skills, ['New Category']: '' } });
  };

  const removeSkill = (key) => {
    const newSkills = { ...data.skills };
    delete newSkills[key];
    onChange({ ...data, skills: newSkills });
  };

  return (
    <div className="casual-form-container">
      <div className="casual-tabs">
        <button className={`casual-tab-btn ${activeTab === 'basics' ? 'active' : ''}`} onClick={() => setActiveTab('basics')}>Personal Details</button>
        <button className={`casual-tab-btn ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>Education</button>
        <button className={`casual-tab-btn ${activeTab === 'experience' ? 'active' : ''}`} onClick={() => setActiveTab('experience')}>Experience</button>
        <button className={`casual-tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects</button>
        <button className={`casual-tab-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>Skills</button>
      </div>

      {activeTab === 'basics' && (
        <div className="casual-section">
          <h3>Personal Details</h3>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <DynamicInput value={data.basics?.name || ''} onChange={(e) => updateBasics('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <DynamicInput value={data.basics?.email || ''} onChange={(e) => updateBasics('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <DynamicInput value={data.basics?.phone || ''} onChange={(e) => updateBasics('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <DynamicInput value={data.basics?.location || ''} onChange={(e) => updateBasics('location', e.target.value)} />
            </div>
          </div>
          
          <h4 style={{ color: '#ccc', marginTop: '16px', marginBottom: '8px' }}>Links</h4>
          {(data.basics?.links || []).map((link, idx) => (
            <div key={idx} className="highlight-row">
              <DynamicInput placeholder="Name (e.g. GitHub)" value={link.name} onChange={(e) => updateLink(idx, 'name', e.target.value)} />
              <DynamicInput placeholder="URL" value={link.url} onChange={(e) => updateLink(idx, 'url', e.target.value)} />
              <button className="remove-btn" onClick={() => removeLink(idx)}>X</button>
            </div>
          ))}
          <button className="add-btn" onClick={addLink}>+ Add Link</button>
        </div>
      )}

      {activeTab === 'education' && (
        <div className="casual-section">
          <h3>Education</h3>
          {(data.education || []).map((edu, idx) => (
            <div key={idx} className="array-item">
              <div className="array-item-header">
                <h4>{edu.institution || 'New Institution'}</h4>
                <button className="remove-btn" onClick={() => removeArrayItem('education', idx)}>Remove</button>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Institution</label>
                  <DynamicInput value={edu.institution || ''} onChange={(e) => updateArrayItem('education', idx, 'institution', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Degree</label>
                  <DynamicInput value={edu.degree || ''} onChange={(e) => updateArrayItem('education', idx, 'degree', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <DynamicInput value={edu.location || ''} onChange={(e) => updateArrayItem('education', idx, 'location', e.target.value)} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Start Date</label>
                    <DynamicInput value={edu.startDate || ''} onChange={(e) => updateArrayItem('education', idx, 'startDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <DynamicInput value={edu.endDate || ''} onChange={(e) => updateArrayItem('education', idx, 'endDate', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={() => addArrayItem('education', { institution: '', degree: '', location: '', startDate: '', endDate: '' })}>+ Add Education</button>
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="casual-section">
          <h3>Experience</h3>
          {(data.experience || []).map((exp, idx) => (
            <div key={idx} className="array-item">
              <div className="array-item-header">
                <h4>{exp.company || 'New Company'}</h4>
                <button className="remove-btn" onClick={() => removeArrayItem('experience', idx)}>Remove</button>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Company</label>
                  <DynamicInput value={exp.company || ''} onChange={(e) => updateArrayItem('experience', idx, 'company', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <DynamicInput value={exp.title || ''} onChange={(e) => updateArrayItem('experience', idx, 'title', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <DynamicInput value={exp.location || ''} onChange={(e) => updateArrayItem('experience', idx, 'location', e.target.value)} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Start Date</label>
                    <DynamicInput value={exp.startDate || ''} onChange={(e) => updateArrayItem('experience', idx, 'startDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <DynamicInput value={exp.endDate || ''} onChange={(e) => updateArrayItem('experience', idx, 'endDate', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="highlights-container">
                <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '8px' }}>Bullet Points</label>
                {(exp.highlights || []).map((h, hIdx) => (
                  <div key={hIdx} className="highlight-row">
                    <DynamicInput value={h} onChange={(e) => updateHighlight('experience', idx, hIdx, e.target.value)} />
                    <button className="remove-btn" onClick={() => removeHighlight('experience', idx, hIdx)}>X</button>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addHighlight('experience', idx)} style={{ marginTop: '4px', padding: '6px' }}>+ Add Bullet</button>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={() => addArrayItem('experience', { company: '', title: '', location: '', startDate: '', endDate: '', highlights: [] })}>+ Add Experience</button>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="casual-section">
          <h3>Projects</h3>
          {(data.projects || []).map((proj, idx) => (
            <div key={idx} className="array-item">
              <div className="array-item-header">
                <h4>{proj.name || 'New Project'}</h4>
                <button className="remove-btn" onClick={() => removeArrayItem('projects', idx)}>Remove</button>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Project Name</label>
                  <DynamicInput value={proj.name || ''} onChange={(e) => updateArrayItem('projects', idx, 'name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Technologies Used</label>
                  <DynamicInput value={proj.technologies || ''} onChange={(e) => updateArrayItem('projects', idx, 'technologies', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <DynamicInput value={proj.date || ''} onChange={(e) => updateArrayItem('projects', idx, 'date', e.target.value)} />
                </div>
              </div>
              <div className="highlights-container">
                <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '8px' }}>Bullet Points</label>
                {(proj.highlights || []).map((h, hIdx) => (
                  <div key={hIdx} className="highlight-row">
                    <DynamicInput value={h} onChange={(e) => updateHighlight('projects', idx, hIdx, e.target.value)} />
                    <button className="remove-btn" onClick={() => removeHighlight('projects', idx, hIdx)}>X</button>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addHighlight('projects', idx)} style={{ marginTop: '4px', padding: '6px' }}>+ Add Bullet</button>
              </div>
            </div>
          ))}
          <button className="add-btn" onClick={() => addArrayItem('projects', { name: '', technologies: '', date: '', highlights: [] })}>+ Add Project</button>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="casual-section">
          <h3>Skills</h3>
          {Object.entries(data.skills || {}).map(([key, value], idx) => (
            <div key={idx} className="highlight-row">
              <DynamicInput value={key} style={{ flex: '0.3' }} onChange={(e) => updateSkill(key, e.target.value, value)} placeholder="Category (e.g. Languages)" />
              <DynamicInput value={value} onChange={(e) => updateSkill(key, key, e.target.value)} placeholder="Comma separated skills" />
              <button className="remove-btn" onClick={() => removeSkill(key)}>X</button>
            </div>
          ))}
          <button className="add-btn" onClick={addSkill}>+ Add Skill Category</button>
        </div>
      )}
    </div>
  );
}

export default CasualForm;
