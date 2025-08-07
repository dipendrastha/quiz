import React from 'react';

const SidebarScoreboard = ({ teams, scores, currentTeam }) => {
  if (!teams || teams.length === 0) {
    return null;
  }

  const currentTeamName = teams[currentTeam];
  
  // Sort teams by score (highest first)
  const sortedTeams = teams
    .map(team => ({ name: team, score: scores[team] || 0 }))
    .sort((a, b) => b.score - a.score);

  const getRankClass = (index) => {
    if (index === 0) return 'first';
    if (index === 1) return 'second';
    if (index === 2) return 'third';
    return '';
  };

  return (
    <div className="sidebar-scoreboard">
      <h3>🏆 Leaderboard</h3>
      {sortedTeams.map((team, index) => (
        <div 
          key={team.name} 
          className={`sidebar-score-item ${team.name === currentTeamName ? 'current' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`score-rank ${getRankClass(index)}`}>
              {index + 1}
            </div>
            <span>{team.name}</span>
          </div>
          <div className="points-display">
            {team.score} pts
          </div>
        </div>
      ))}
      {currentTeamName && (
        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          background: 'rgba(137,180,250,0.1)', 
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#89b4fa'
        }}>
          Current Turn: {currentTeamName}
        </div>
      )}
    </div>
  );
};

export default SidebarScoreboard;