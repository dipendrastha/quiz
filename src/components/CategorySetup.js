import React, { useState } from 'react';

const CategorySetup = ({ categories, onUpdate, onNext, onBack, onReset, onExport, onImport }) => {
  const [categoryName, setCategoryName] = useState('');

  const addCategory = () => {
    if (categoryName.trim() && !categories.includes(categoryName.trim())) {
      onUpdate([...categories, categoryName.trim()]);
      setCategoryName('');
    }
  };

  const removeCategory = (categoryToRemove) => {
    onUpdate(categories.filter(category => category !== categoryToRemove));
  };

  const canProceed = categories.length >= 1;

  return (
    <div className="card">
      <h1 className="title">📚 Category Setup</h1>
      
      <div className="form-group">
        <label>Add Category:</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g., Sports, History, Science"
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          />
          <button className="btn" onClick={addCategory}>
            Add Category
          </button>
        </div>
      </div>

      <div className="category-grid">
        {categories.map((category, index) => (
          <div key={index} className="category-card">
            <h3 style={{ marginBottom: '10px' }}>{category}</h3>
            <button 
              className="btn btn-danger" 
              onClick={() => removeCategory(category)}
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '20px' }}>
          No categories added yet. Add at least 1 category to continue.
        </p>
      )}

      <div className="nav-buttons">
        <div>
          <button className="btn" onClick={onBack}>
            Back
          </button>
          <button className="btn btn-danger" onClick={onReset}>
            Reset All Data
          </button>
          <button className="btn export-btn" onClick={onExport}>
            Export Data
          </button>
          <div className="file-input-wrapper">
            <input type="file" accept=".json" onChange={onImport} id="import-categories" />
            <label htmlFor="import-categories" className="file-input-label">
              Import Data
            </label>
          </div>
        </div>
        <button 
          className="btn btn-success" 
          onClick={onNext}
          disabled={!canProceed}
          style={{ opacity: canProceed ? 1 : 0.5 }}
        >
          Next: Questions ({categories.length} categories)
        </button>
      </div>
    </div>
  );
};

export default CategorySetup;