import React, { useState, useEffect } from 'react';
import HostSetup from './components/HostSetup';
import TeamSetup from './components/TeamSetup';
import CategorySetup from './components/CategorySetup';
import QuestionSetup from './components/QuestionSetup';
import GamePlay from './components/GamePlay';
import MusicPlayer from './components/MusicPlayer';
import SidebarScoreboard from './components/SidebarScoreboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('host');
  const [gameData, setGameData] = useState({
    teams: [],
    categories: [],
    questions: {},
    scores: {},
    currentTeam: 0,
    gameStarted: false,
    usedQuestions: []
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('kbc-quiz-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setGameData({
          teams: parsedData.teams || [],
          categories: parsedData.categories || [],
          questions: parsedData.questions || {},
          scores: parsedData.scores || {},
          currentTeam: parsedData.currentTeam || 0,
          gameStarted: parsedData.gameStarted || false,
          usedQuestions: parsedData.usedQuestions || []
        });
        setCurrentView(parsedData.currentView || 'host');
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const dataToSave = { ...gameData, currentView };
      localStorage.setItem('kbc-quiz-data', JSON.stringify(dataToSave));
    }
  }, [gameData, currentView, isLoaded]);

  const updateGameData = (newData) => {
    setGameData(prev => ({ ...prev, ...newData }));
  };

  const setCurrentViewAndSave = (view) => {
    setCurrentView(view);
  };

  const resetGame = () => {
    const resetData = {
      teams: [],
      categories: [],
      questions: {},
      scores: {},
      currentTeam: 0,
      gameStarted: false,
      usedQuestions: [],
      currentView: 'host'
    };
    setGameData(resetData);
    setCurrentView('host');
  };

  const exportData = () => {
    const dataToExport = { ...gameData, currentView };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kbc-quiz-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setGameData({
            teams: importedData.teams || [],
            categories: importedData.categories || [],
            questions: importedData.questions || {},
            scores: importedData.scores || {},
            currentTeam: importedData.currentTeam || 0,
            gameStarted: importedData.gameStarted || false,
            usedQuestions: importedData.usedQuestions || []
          });
          setCurrentView(importedData.currentView || 'host');
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const resetAllData = () => {
    if (window.confirm('Are you sure you want to reset all data and start over? This cannot be undone.')) {
      localStorage.removeItem('kbc-quiz-data');
      resetGame();
    }
  };

  if (!isLoaded) {
    return <div className="container"><div className="card">Loading...</div></div>;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'host':
        return (
          <HostSetup 
            onNext={() => setCurrentViewAndSave('teams')}
            teams={gameData.teams}
            onUpdateTeams={(teams) => {
              updateGameData({ teams });
              if (teams.length > 0) {
                setCurrentViewAndSave('teams');
              }
            }}
            onExport={exportData}
            onImport={importData}
          />
        );
      case 'teams':
        return (
          <TeamSetup
            teams={gameData.teams}
            onUpdate={(teams) => {
              updateGameData({ teams });
            }}
            onNext={() => setCurrentViewAndSave('categories')}
            onBack={() => setCurrentViewAndSave('host')}
            onReset={resetAllData}
            onExport={exportData}
            onImport={importData}
          />
        );
      case 'categories':
        return (
          <CategorySetup
            categories={gameData.categories}
            onUpdate={(categories) => updateGameData({ categories })}
            onNext={() => setCurrentViewAndSave('questions')}
            onBack={() => setCurrentViewAndSave('teams')}
            onReset={resetAllData}
            onExport={exportData}
            onImport={importData}
          />
        );
      case 'questions':
        return (
          <QuestionSetup
            categories={gameData.categories}
            questions={gameData.questions}
            onUpdate={(questions) => updateGameData({ questions })}
            onNext={() => {
              const scores = {};
              gameData.teams.forEach(team => {
                scores[team] = 0;
              });
              updateGameData({ scores, gameStarted: true });
              setCurrentViewAndSave('game');
            }}
            onBack={() => setCurrentViewAndSave('categories')}
            onReset={resetAllData}
            onExport={exportData}
            onImport={importData}
          />
        );
      case 'game':
        return (
          <GamePlay
            gameData={gameData}
            onUpdate={updateGameData}
            onReset={resetAllData}
            onExport={exportData}
            onImport={importData}
          />
        );
      default:
        return <HostSetup onNext={() => setCurrentView('teams')} />;
    }
  };

  return (
    <div className="container">
      <MusicPlayer />
      <div className="main-content">
        {renderCurrentView()}
      </div>
      {gameData.teams && gameData.teams.length > 0 && (
        <div className="sidebar">
          <SidebarScoreboard 
            teams={gameData.teams}
            scores={gameData.scores}
            currentTeam={gameData.currentTeam}
          />
        </div>
      )}
    </div>
  );
}

export default App;