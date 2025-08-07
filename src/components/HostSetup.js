import React, { useState } from 'react';

const HostSetup = ({ onNext, teams = [], onUpdateTeams, onExport, onImport }) => {
  const [teamName, setTeamName] = useState('');

  const addTeam = () => {
    if (teamName.trim() && !teams.includes(teamName.trim())) {
      onUpdateTeams([...teams, teamName.trim()]);
      setTeamName('');
    }
  };

  return (
    <div className="card">
      <h1 className="title">🎯 KBC Quiz Host Panel</h1>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', color: '#4a5568' }}>Welcome Host!</h2>
        <p style={{ marginBottom: '30px', fontSize: '18px', color: '#718096' }}>
          Set up your quiz game by creating teams, categories, and questions.
        </p>
        
        {teams.length === 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div className="form-group">
              <label>Quick Start - Add First Team:</label>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <input
                  type="text"
                  className="input"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                  style={{ maxWidth: '300px' }}
                />
                <button className="btn" onClick={addTeam}>
                  Add Team
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={onNext}>
            {teams.length > 0 ? 'Continue Setup' : 'Start Setup'}
          </button>
          <button className="btn export-btn" onClick={onExport}>
            Export Data
          </button>
          <div className="file-input-wrapper">
            <input type="file" accept=".json" onChange={onImport} id="import-host" />
            <label htmlFor="import-host" className="file-input-label">
              Import Data
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostSetup;