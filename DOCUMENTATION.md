# Quiz Application Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Core Components](#core-components)
5. [Game Logic](#game-logic)
6. [State Management](#state-management)
7. [Key Features](#key-features)
8. [Code Locations](#code-locations)
9. [Backend Integration](#backend-integration)

## Project Overview

A React-based quiz application inspired by "Kaun Banega Crorepati" (KBC) with team-based gameplay, manual team selection, question passing mechanics, and comprehensive undo functionality.

### Tech Stack
- **Frontend**: React 18
- **Styling**: CSS3 with Neovim-inspired theme
- **Storage**: localStorage for data persistence
- **Build Tool**: Create React App

## Architecture

```
App.js (Main Container)
├── HostSetup.js (Welcome Screen)
├── TeamSetup.js (Team Management)
├── CategorySetup.js (Category Creation)
├── QuestionSetup.js (Question Management)
├── GamePlay.js (Main Game Logic)
├── SidebarScoreboard.js (Persistent Scoreboard)
└── MusicPlayer.js (Audio Control)
```

## File Structure

```
quiz/
├── public/
│   └── index.html                 # HTML template
├── src/
│   ├── components/
│   │   ├── HostSetup.js          # Welcome screen component
│   │   ├── TeamSetup.js          # Team creation and management
│   │   ├── CategorySetup.js      # Category creation
│   │   ├── QuestionSetup.js      # Question creation and editing
│   │   ├── GamePlay.js           # Main game logic and UI
│   │   ├── SidebarScoreboard.js  # Persistent leaderboard
│   │   ├── MusicPlayer.js        # Audio control component
│   │   └── CelebrationEffect.js  # Unused celebration component
│   ├── App.js                    # Main application container
│   ├── App.css                   # Application styles
│   ├── index.css                 # Global styles and theme
│   └── index.js                  # React entry point
├── package.json                  # Dependencies and scripts
└── DOCUMENTATION.md             # This file
```

## Core Components

### 1. App.js - Main Application Container
**Location**: `/src/App.js`

**Purpose**: Central state management and view routing

**Key Responsibilities**:
- Manages global game state
- Handles view transitions
- Provides data persistence (localStorage)
- Implements export/import functionality

**Key State Variables**:
```javascript
const [gameData, setGameData] = useState({
  teams: [],           // Array of team names
  categories: [],      // Array of category names
  questions: {},       // Object mapping categories to questions
  scores: {},          // Object mapping team names to scores
  currentTeam: 0,      // Index of current team
  gameStarted: false,  // Boolean for game state
  usedQuestions: []    // Array of used question IDs
});
const [currentView, setCurrentView] = useState('host');
```

**Key Functions**:
- `updateGameData()` - Updates game state and saves to localStorage
- `exportData()` - Downloads game state as JSON
- `importData()` - Uploads and restores game state
- `resetAllData()` - Clears all data and returns to host screen

### 2. GamePlay.js - Main Game Logic
**Location**: `/src/components/GamePlay.js`

**Purpose**: Handles all game mechanics, question flow, and team interactions

**Key State Variables**:
```javascript
const [currentView, setCurrentView] = useState('categories');
const [currentQuestion, setCurrentQuestion] = useState(null);
const [selectedAnswer, setSelectedAnswer] = useState(null);
const [showResult, setShowResult] = useState(false);
const [usedQuestions, setUsedQuestions] = useState(new Set());
const [timeLeft, setTimeLeft] = useState(60);
const [timerActive, setTimerActive] = useState(false);
const [showOptions, setShowOptions] = useState(false);
const [textAnswer, setTextAnswer] = useState('');
const [isPassedQuestion, setIsPassedQuestion] = useState(false);
const [teamsAttempted, setTeamsAttempted] = useState(new Set());
const [originalTeam, setOriginalTeam] = useState(null);
const [nextTurnTeam, setNextTurnTeam] = useState(0);
const [gameStateBackup, setGameStateBackup] = useState(null);
const [showUndo, setShowUndo] = useState(false);
```

**Key Functions**:
- `selectQuestion()` - Initializes question state
- `submitTextAnswer()` - Handles text-based answers (10 points)
- `submitOptionAnswer()` - Handles multiple choice answers (5 points)
- `passQuestion()` - Passes question to next team with cycle detection
- `handleTimeUp()` - Manages timer expiration
- `undoLastAction()` - Restores previous game state

### 3. SidebarScoreboard.js - Persistent Leaderboard
**Location**: `/src/components/SidebarScoreboard.js`

**Purpose**: Always-visible scoreboard with team rankings

**Key Features**:
- Sorts teams by score (highest first)
- Shows rank indicators (gold, silver, bronze)
- Highlights current team
- Responsive design

## Game Logic

### Question Flow System

#### 1. Team Selection (Manual)
**Location**: `GamePlay.js` - `categories` view
```javascript
// Manual team selection buttons
{teams.map((team, index) => (
  <button
    className={`btn ${index === currentTeam ? 'btn-success' : ''}`}
    onClick={() => onUpdate({ currentTeam: index })}
  >
    {team} ({scores[team]} pts)
  </button>
))}
```

#### 2. Question Types
**Text Mode** (10 points):
- Player types answer manually
- Host compares with correct answer
- Passable to other teams if wrong

**Options Mode** (5 points):
- Shows A, B, C, D options
- Not passable once options are shown
- Immediate correct answer display on wrong answer

#### 3. Question Passing Logic
**Location**: `GamePlay.js` - `passQuestion()` function

**One-Cycle System**:
```javascript
const nextTeamIndex = (currentTeam + 1) % teams.length;

// Check if we've completed one full cycle
if (nextTeamIndex === originalTeam) {
  // Completed one full cycle, show correct answer and end question
  setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
  setTeamsAttempted(new Set(teams.map(team => team)));
  // Show answer and proceed to next turn
}
```

**Flow Example** (4 teams):
1. Team A (original) → wrong → Team B
2. Team B → wrong → Team C  
3. Team C → wrong → Team D
4. Team D → wrong → Back to Team A (cycle detected) → Show answer

#### 4. Turn Management System
**Location**: `GamePlay.js` - `nextTurnTeam` state

**Logic**:
- Correct answer → Next team in sequence gets turn
- Wrong answer (text mode) → Next team in sequence gets turn
- Options mode → Next team gets turn (no passing)
- Passed questions → When cycle completes, original team + 1 gets turn

### Scoring System

**Points Distribution**:
- Text correct answer: +10 points
- Options correct answer: +5 points
- Text wrong answer: -1 point
- Options wrong answer: -2 points
- Timeout: Same as wrong answer

**Location**: `GamePlay.js` - `submitTextAnswer()` and `submitOptionAnswer()`

### Timer System
**Location**: `GamePlay.js` - `useEffect` with `timerActive`

**Features**:
- 60-second countdown per question
- Visual warning when ≤10 seconds
- Auto-submission on timeout
- Pause/resume functionality

## State Management

### Global State (App.js)
```javascript
gameData: {
  teams: string[],        // Team names
  categories: string[],   // Category names  
  questions: object,      // Category → Questions mapping
  scores: object,         // Team → Score mapping
  currentTeam: number,    // Current team index
  gameStarted: boolean,   // Game state flag
  usedQuestions: string[] // Used question IDs
}
```

### Local State (GamePlay.js)
- **UI State**: currentView, showResult, showOptions
- **Question State**: currentQuestion, selectedAnswer, textAnswer
- **Timer State**: timeLeft, timerActive
- **Passing State**: isPassedQuestion, teamsAttempted, originalTeam
- **Undo State**: gameStateBackup, showUndo

### Data Persistence
**Location**: `App.js` - `useEffect` and localStorage operations

**Auto-save**: Every state change saves to localStorage
**Manual backup**: Export/Import JSON functionality
**Recovery**: Automatic restoration on page reload

## Key Features

### 1. Undo System
**Location**: `GamePlay.js` - `undoLastAction()` function

**Backup Creation**:
```javascript
setGameStateBackup({
  scores: { ...scores },
  currentTeam,
  teamsAttempted: new Set(teamsAttempted),
  originalTeam,
  nextTurnTeam,
  usedQuestions: new Set(usedQuestions)
});
```

**Available For**:
- Wrong answers (text/options)
- Question passing
- Timer expiration
- Accidental submissions

### 2. Export/Import System
**Location**: `App.js` - `exportData()` and `importData()`

**Export**:
```javascript
const exportData = () => {
  const dataStr = JSON.stringify({ ...gameData, currentView }, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  // Download logic
};
```

**Import**:
```javascript
const importData = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const importedData = JSON.parse(e.target.result);
    // Restore state logic
  };
};
```

### 3. Question Management
**Location**: `QuestionSetup.js`

**Features**:
- Add/Edit/Delete questions per category
- Multiple choice options (A, B, C, D)
- Correct answer selection
- Question validation

### 4. Responsive Design
**Location**: `index.css`

**Breakpoints**:
```css
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    order: -1;
  }
}
```

## Code Locations

### Core Game Logic

#### Question Selection
**Location**: `GamePlay.js` - `selectQuestion()` function
```javascript
const selectQuestion = (questionIndex) => {
  const availableQuestions = questions[selectedCategory]?.filter(q => 
    !usedQuestions.has(`${selectedCategory}-${q.id}`)
  ) || [];
  
  const selectedQuestion = availableQuestions[questionIndex];
  setCurrentQuestion(selectedQuestion);
  setCurrentView('question');
  setOriginalTeam(currentTeam);
  setTimeLeft(60);
  setTimerActive(true);
};
```

#### Answer Submission (Text Mode)
**Location**: `GamePlay.js` - `submitTextAnswer()` function
```javascript
const submitTextAnswer = () => {
  const correctOption = currentQuestion.options[currentQuestion.correctAnswer].toLowerCase();
  const isCorrect = textAnswer.toLowerCase().trim() === correctOption;
  const newScores = { ...scores };
  
  if (isCorrect) {
    newScores[currentTeamName] += 10;
    setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
    setNextTurnTeam((currentTeam + 1) % teams.length);
  } else {
    newScores[currentTeamName] -= 1;
    // Pass to next team or show answer logic
  }
};
```

#### Answer Submission (Options Mode)
**Location**: `GamePlay.js` - `submitOptionAnswer()` function
```javascript
const submitOptionAnswer = () => {
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const newScores = { ...scores };
  
  if (isCorrect) {
    newScores[currentTeamName] += 5;
  } else {
    newScores[currentTeamName] -= 2;
  }
  setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
  setNextTurnTeam((originalTeam + 1) % teams.length);
};
```

#### Question Passing with Cycle Detection
**Location**: `GamePlay.js` - `passQuestion()` function
```javascript
const passQuestion = () => {
  const nextTeamIndex = (currentTeam + 1) % teams.length;
  
  // Check if we've completed one full cycle
  if (nextTeamIndex === originalTeam) {
    // Completed one full cycle, show correct answer and end question
    setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
    setTeamsAttempted(new Set(teams.map(team => team)));
    setShowResult(true);
  } else {
    // Pass to next team
    onUpdate({ currentTeam: nextTeamIndex });
    setIsPassedQuestion(true);
    setTeamsAttempted(prev => new Set([...prev, currentTeamName]));
  }
};
```

#### Timer Logic
**Location**: `GamePlay.js` - `useEffect` hook
```javascript
useEffect(() => {
  let interval;
  if (timerActive && timeLeft > 0) {
    interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  return () => clearInterval(interval);
}, [timerActive, timeLeft]);
```

### State Management

#### Global State Structure
**Location**: `App.js` - Main state
```javascript
const [gameData, setGameData] = useState({
  teams: [],           // Array of team names
  categories: [],      // Array of category names
  questions: {},       // Object mapping categories to questions
  scores: {},          // Object mapping team names to scores
  currentTeam: 0,      // Index of current team
  gameStarted: false,  // Boolean for game state
  usedQuestions: []    // Array of used question IDs
});
```

#### State Updates
**Location**: `App.js` - `updateGameData()` function
```javascript
const updateGameData = (newData) => {
  const updatedData = { ...gameData, ...newData };
  setGameData(updatedData);
  localStorage.setItem('quizGameData', JSON.stringify(updatedData));
};
```

#### Data Persistence
**Location**: `App.js` - `useEffect` hook
```javascript
useEffect(() => {
  const savedData = localStorage.getItem('quizGameData');
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
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }
}, []);
```

### UI Components

#### Team Selection Interface
**Location**: `GamePlay.js` - Categories view
```javascript
<div style={{ marginBottom: '20px' }}>
  <h3 style={{ color: '#89b4fa', marginBottom: '12px' }}>Choose Team:</h3>
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    {teams.map((team, index) => (
      <button
        key={team}
        className={`btn ${index === currentTeam ? 'btn-success' : ''}`}
        onClick={() => onUpdate({ currentTeam: index })}
      >
        {team} ({scores[team]} pts)
      </button>
    ))}
  </div>
</div>
```

#### Category Grid
**Location**: `GamePlay.js` - Categories view
```javascript
<div className="category-grid">
  {getAvailableCategories().map(category => (
    <div 
      key={category} 
      className="category-card"
      onClick={() => selectCategory(category)}
    >
      <h3>{category}</h3>
      <p style={{ marginTop: '10px', opacity: 0.8 }}>
        {questions[category]?.filter(q => !usedQuestions.has(`${category}-${q.id}`)).length || 0} questions left
      </p>
    </div>
  ))}
</div>
```

#### Options Display with Letters
**Location**: `GamePlay.js` - Question view
```javascript
<div className="options">
  {currentQuestion.options.map((option, index) => (
    <div
      key={index}
      className={`option ${selectedAnswer === index ? 'selected' : ''}`}
      data-letter={String.fromCharCode(65 + index)}
      onClick={() => !showResult && setSelectedAnswer(index)}
    >
      {option}
    </div>
  ))}
</div>
```

### Scoring System

#### Score Calculation Logic
**Location**: `GamePlay.js` - Answer submission functions
```javascript
// Text mode scoring
if (isCorrect) {
  newScores[currentTeamName] += 10;  // +10 for correct text answer
} else {
  newScores[currentTeamName] -= 1;   // -1 for wrong text answer
}

// Options mode scoring
if (isCorrect) {
  newScores[currentTeamName] += 5;   // +5 for correct option answer
} else {
  newScores[currentTeamName] -= 2;   // -2 for wrong option answer
}
```

#### Scoreboard Display
**Location**: `SidebarScoreboard.js` - Main component
```javascript
const sortedTeams = teams
  .map(team => ({ name: team, score: scores[team] || 0 }))
  .sort((a, b) => b.score - a.score);

return (
  <div className="sidebar-scoreboard">
    <h3>🏆 Leaderboard</h3>
    {sortedTeams.map((team, index) => (
      <div className={`sidebar-score-item ${team.name === currentTeamName ? 'current' : ''}`}>
        <div className={`score-rank ${getRankClass(index)}`}>
          {index + 1}
        </div>
        <span>{team.name}</span>
        <div className="points-display">{team.score} pts</div>
      </div>
    ))}
  </div>
);
```

### Undo Functionality

#### Backup Creation
**Location**: `GamePlay.js` - Before each action
```javascript
// Create backup before processing answer
setGameStateBackup({
  scores: { ...scores },
  currentTeam,
  teamsAttempted: new Set(teamsAttempted),
  originalTeam,
  nextTurnTeam,
  usedQuestions: new Set(usedQuestions)
});
```

#### State Restoration
**Location**: `GamePlay.js` - `undoLastAction()` function
```javascript
const undoLastAction = () => {
  if (!gameStateBackup) return;
  
  // Restore previous state
  onUpdate({ 
    scores: gameStateBackup.scores,
    currentTeam: gameStateBackup.currentTeam
  });
  setTeamsAttempted(gameStateBackup.teamsAttempted);
  setOriginalTeam(gameStateBackup.originalTeam);
  setNextTurnTeam(gameStateBackup.nextTurnTeam);
  setUsedQuestions(gameStateBackup.usedQuestions);
  
  // Reset question state
  setShowResult(false);
  setSelectedAnswer(null);
  setTextAnswer('');
  setShowUndo(false);
  setTimeLeft(60);
  setTimerActive(true);
};
```

### Data Export/Import

#### Export Logic
**Location**: `App.js` - `exportData()` function
```javascript
const exportData = () => {
  const dataToExport = {
    ...gameData,
    currentView,
    exportDate: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(dataToExport, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `quiz-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};
```

#### Import Logic
**Location**: `App.js` - `importData()` function
```javascript
const importData = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
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
      setCurrentViewAndSave(importedData.currentView || 'host');
    } catch (error) {
      alert('Error importing data. Please check the file format.');
    }
  };
  reader.readAsText(file);
};
```

This documentation provides a comprehensive overview of the quiz application's architecture, logic, and implementation details. Each section includes specific file locations and code references for easy navigation and maintenance.

## Backend Integration

For future backend integration, the application can be configured using environment variables.

### Configuration
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=https://api.example.com
```

### POST Requests
When sending data to the backend, ensure that environment variables are used to define the target endpoints. For example:
```javascript
const response = await fetch(`${process.env.REACT_APP_API_URL}/scores`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(scoreData),
});
```