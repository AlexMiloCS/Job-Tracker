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

  const updateSectionTitle = (sIdx, title) => {
    const newSections = [...(data.sections || [])];
    newSections[sIdx] = { ...newSections[sIdx], title };
    onChange({ ...data, sections: newSections });
  };

  const updateSectionItem = (sIdx, iIdx, field, value) => {
    const newSections = [...(data.sections || [])];
    const newItems = [...(newSections[sIdx].items || [])];
    newItems[iIdx] = { ...newItems[iIdx], [field]: value };
    newSections[sIdx] = { ...newSections[sIdx], items: newItems };
    onChange({ ...data, sections: newSections });
  };

  const addSectionItem = (sIdx, defaultObj) => {
    const newSections = [...(data.sections || [])];
    const newItems = [...(newSections[sIdx].items || []), defaultObj];
    newSections[sIdx] = { ...newSections[sIdx], items: newItems };
    onChange({ ...data, sections: newSections });
  };

  const removeSectionItem = (sIdx, iIdx) => {
    const newSections = [...(data.sections || [])];
    const newItems = (newSections[sIdx].items || []).filter((_, i) => i !== iIdx);
    newSections[sIdx] = { ...newSections[sIdx], items: newItems };
    onChange({ ...data, sections: newSections });
  };

  const updateSectionHighlight = (sIdx, iIdx, hIdx, value) => {
    const newSections = [...(data.sections || [])];
    const newItems = [...(newSections[sIdx].items || [])];
    const newHighlights = [...(newItems[iIdx].highlights || [])];
    newHighlights[hIdx] = value;
    newItems[iIdx] = { ...newItems[iIdx], highlights: newHighlights };
    newSections[sIdx] = { ...newSections[sIdx], items: newItems };
    onChange({ ...data, sections: newSections });
  };

  const addSectionHighlight = (sIdx, iIdx) => {
    const newSections = [...(data.sections || [])];
    const newItems = [...(newSections[sIdx].items || [])];
    const newHighlights = [...(newItems[iIdx].highlights || []), ''];
    newItems[iIdx] = { ...newItems[iIdx], highlights: newHighlights };
    newSections[sIdx] = { ...newSections[sIdx], items: newItems };
    onChange({ ...data, sections: newSections });
  };

  const removeSectionHighlight = (sIdx, iIdx, hIdx) => {
    const newSections = [...(data.sections || [])];
    const newItems = [...(newSections[sIdx].items || [])];
    const newHighlights = (newItems[iIdx].highlights || []).filter((_, i) => i !== hIdx);
    newItems[iIdx] = { ...newItems[iIdx], highlights: newHighlights };
    newSections[sIdx] = { ...newSections[sIdx], items: newItems };
    onChange({ ...data, sections: newSections });
  };

  const addNewSection = () => {
    const newType = window.prompt("Enter layout type (DetailedList, ProjectList, SimpleList, TagsList):", "DetailedList");
    if (!newType) return;
    const newSections = [...(data.sections || []), { title: 'New Section', type: newType, items: [] }];
    onChange({ ...data, sections: newSections });
    setActiveTab(`section-${newSections.length - 1}`);
  };

  const deleteSection = (sIdx) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    const newSections = (data.sections || []).filter((_, i) => i !== sIdx);
    onChange({ ...data, sections: newSections });
    setActiveTab('basics');
  };

  const renderDetailedList = (sIdx, section) => (
    <>
      {(section.items || []).map((item, idx) => (
        <div key={idx} className="array-item">
          <div className="array-item-header">
            <h4>{item.title || 'New Item'}</h4>
            <button className="remove-btn" onClick={() => removeSectionItem(sIdx, idx)}>Remove</button>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Title/Role</label>
              <DynamicInput value={item.title || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'title', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Subtitle/Company</label>
              <DynamicInput value={item.subtitle || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'subtitle', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Date</label>
              <DynamicInput value={item.date || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'date', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <DynamicInput value={item.location || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'location', e.target.value)} />
            </div>
          </div>
          <div className="highlights-container">
            <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '8px' }}>Bullet Points</label>
            {(item.highlights || []).map((h, hIdx) => (
              <div key={hIdx} className="highlight-row">
                <DynamicInput value={h} onChange={(e) => updateSectionHighlight(sIdx, idx, hIdx, e.target.value)} />
                <button className="remove-btn" onClick={() => removeSectionHighlight(sIdx, idx, hIdx)}>X</button>
              </div>
            ))}
            <button className="add-btn" onClick={() => addSectionHighlight(sIdx, idx)} style={{ marginTop: '4px', padding: '6px' }}>+ Add Bullet</button>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => addSectionItem(sIdx, { title: '', subtitle: '', date: '', location: '', highlights: [] })}>+ Add Item</button>
    </>
  );

  const renderProjectList = (sIdx, section) => (
    <>
      {(section.items || []).map((item, idx) => (
        <div key={idx} className="array-item">
          <div className="array-item-header">
            <h4>{item.title || 'New Project'}</h4>
            <button className="remove-btn" onClick={() => removeSectionItem(sIdx, idx)}>Remove</button>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Project Name</label>
              <DynamicInput value={item.title || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'title', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Technologies/Subtitle</label>
              <DynamicInput value={item.subtitle || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'subtitle', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Date</label>
              <DynamicInput value={item.date || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'date', e.target.value)} />
            </div>
          </div>
          <div className="highlights-container">
            <label style={{ fontSize: '0.85rem', color: '#aaa', display: 'block', marginBottom: '8px' }}>Bullet Points</label>
            {(item.highlights || []).map((h, hIdx) => (
              <div key={hIdx} className="highlight-row">
                <DynamicInput value={h} onChange={(e) => updateSectionHighlight(sIdx, idx, hIdx, e.target.value)} />
                <button className="remove-btn" onClick={() => removeSectionHighlight(sIdx, idx, hIdx)}>X</button>
              </div>
            ))}
            <button className="add-btn" onClick={() => addSectionHighlight(sIdx, idx)} style={{ marginTop: '4px', padding: '6px' }}>+ Add Bullet</button>
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => addSectionItem(sIdx, { title: '', subtitle: '', date: '', highlights: [] })}>+ Add Project</button>
    </>
  );

  const renderSimpleList = (sIdx, section) => (
    <>
      {(section.items || []).map((item, idx) => (
        <div key={idx} className="array-item">
          <div className="array-item-header">
            <h4>{item.title || 'New Item'}</h4>
            <button className="remove-btn" onClick={() => removeSectionItem(sIdx, idx)}>Remove</button>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Title/Award</label>
              <DynamicInput value={item.title || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'title', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Date</label>
              <DynamicInput value={item.date || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'date', e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '8px' }}>
            <label>Description</label>
            <DynamicInput value={item.description || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'description', e.target.value)} />
          </div>
        </div>
      ))}
      <button className="add-btn" onClick={() => addSectionItem(sIdx, { title: '', date: '', description: '' })}>+ Add Item</button>
    </>
  );

  const renderTagsList = (sIdx, section) => (
    <>
      {(section.items || []).map((item, idx) => (
        <div key={idx} className="highlight-row">
          <DynamicInput value={item.title || ''} style={{ flex: '0.3' }} onChange={(e) => updateSectionItem(sIdx, idx, 'title', e.target.value)} placeholder="Category (e.g. Languages)" />
          <DynamicInput value={item.description || ''} onChange={(e) => updateSectionItem(sIdx, idx, 'description', e.target.value)} placeholder="Comma separated skills" />
          <button className="remove-btn" onClick={() => removeSectionItem(sIdx, idx)}>X</button>
        </div>
      ))}
      <button className="add-btn" onClick={() => addSectionItem(sIdx, { title: '', description: '' })}>+ Add Category</button>
    </>
  );

  const renderSectionContent = () => {
    if (activeTab === 'basics') {
      return (
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
      );
    }

    if (activeTab.startsWith('section-')) {
      const sIdx = parseInt(activeTab.split('-')[1]);
      const section = data.sections[sIdx];
      if (!section) return null;

      return (
        <div className="casual-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <DynamicInput 
              value={section.title || ''} 
              onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
              style={{ fontSize: '1.5rem', fontWeight: 'bold', border: 'none', background: 'transparent', padding: 0, color: 'white', flex: 1 }}
            />
            <button className="remove-btn" onClick={() => deleteSection(sIdx)} style={{ marginLeft: '16px', padding: '8px 16px' }}>Delete Section</button>
          </div>
          <p style={{ color: '#888', marginBottom: '16px', fontSize: '0.9rem' }}>Layout: {section.type}</p>
          
          {section.type === 'DetailedList' && renderDetailedList(sIdx, section)}
          {section.type === 'ProjectList' && renderProjectList(sIdx, section)}
          {section.type === 'SimpleList' && renderSimpleList(sIdx, section)}
          {section.type === 'TagsList' && renderTagsList(sIdx, section)}
        </div>
      );
    }
  };

  return (
    <div className="casual-form-container">
      <div className="casual-tabs" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <button className={`casual-tab-btn ${activeTab === 'basics' ? 'active' : ''}`} onClick={() => setActiveTab('basics')}>Personal Details</button>
        
        {(data.sections || []).map((section, idx) => (
          <button 
            key={idx} 
            className={`casual-tab-btn ${activeTab === ('section-' + idx) ? 'active' : ''}`} 
            onClick={() => setActiveTab('section-' + idx)}
          >
            {section.title || 'Untitled'}
          </button>
        ))}
        
        <button className="casual-tab-btn" onClick={addNewSection} style={{ backgroundColor: '#2d3748', border: '1px dashed #4a5568' }}>+ Add Section</button>
      </div>

      {renderSectionContent()}
    </div>
  );
}

export default CasualForm;
