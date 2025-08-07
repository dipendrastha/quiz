import React, { useState } from 'react';

const TeamSetup = ({ teams, onUpdate, onNext, onBack, onReset, onExport, onImport }) => {
  const [teamName, setTeamName] = useState('');

  const addTeam = () => {
    if (teamName.trim() && !teams.includes(teamName.trim())) {
      onUpdate([...teams, teamName.trim()]);
      setTeamName('');
    }
  };

  const removeTeam = (teamToRemove) => {
    onUpdate(teams.filter(team => team !== teamToRemove));
  };

  const canProceed = teams.length >= 2;

  return (
    <div className="card">
      <h1 className="title">👥 Team Setup</h1>
      
      <div className="form-group">
        <label>Add Team Name:</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            onKeyPress={(e) => e.key === 'Enter' && addTeam()}
          />
          <button className="btn" onClick={addTeam}>
            Add Team
          </button>
        </div>
      </div>

      <div className="team-list">
        {teams.map((team, index) => (
          <div key={index} className="team-item">
            <span style={{ fontWeight: 'bold' }}>{team}</span>
            <button 
              className="btn btn-danger" 
              onClick={() => removeTeam(team)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '20px' }}>
          No teams added yet. Add at least 2 teams to continue.
        </p>
      )}

      {teams.length === 1 && (
        <p style={{ textAlign: 'center', color: '#f56565', marginBottom: '20px' }}>
          Add at least one more team to continue.
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
            <input type="file" accept=".json" onChange={onImport} id="import-teams" />
            <label htmlFor="import-teams" className="file-input-label">
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
          Next: Categories ({teams.length} teams)
        </button>
      </div>
    </div>
  );
};

export default TeamSetup;