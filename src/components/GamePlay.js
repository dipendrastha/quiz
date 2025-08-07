import React, { useState, useEffect } from 'react';

const GamePlay = ({ gameData, onUpdate, onReset, onExport, onImport }) => {
  const [currentView, setCurrentView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState(new Set(gameData.usedQuestions || []));
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [isPassedQuestion, setIsPassedQuestion] = useState(false);

  const { teams, categories, questions, scores, currentTeam } = gameData;

  // Update gameData when usedQuestions changes
  useEffect(() => {
    onUpdate({ usedQuestions: Array.from(usedQuestions) });
  }, [usedQuestions]);
  const currentTeamName = teams[currentTeam];

  const selectCategory = (category) => {
    const availableQuestions = questions[category]?.filter(q => 
      !usedQuestions.has(`${category}-${q.id}`)
    ) || [];
    
    if (availableQuestions.length === 0) {
      alert('No more questions available in this category!');
      return;
    }

    setSelectedCategory(category);
    setCurrentView('questionNumbers');
  };

  const selectQuestion = (questionIndex) => {
    const availableQuestions = questions[selectedCategory]?.filter(q => 
      !usedQuestions.has(`${selectedCategory}-${q.id}`)
    ) || [];
    
    const selectedQuestion = availableQuestions[questionIndex];
    setCurrentQuestion(selectedQuestion);
    setCurrentView('question');
    setSelectedAnswer(null);
    setShowResult(false);
    setShowOptions(false);
    setTextAnswer('');
    setIsPassedQuestion(false);
    setTimeLeft(60);
    setTimerActive(true);
  };

  const submitTextAnswer = () => {
    if (!textAnswer.trim()) return;
    setTimerActive(false);

    const correctOption = currentQuestion.options[currentQuestion.correctAnswer].toLowerCase();
    const isCorrect = textAnswer.toLowerCase().trim() === correctOption;
    const newScores = { ...scores };
    
    if (isCorrect) {
      newScores[currentTeamName] += 10;
      setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
      onUpdate({ scores: newScores });
      setShowResult(true);
    } else {
      newScores[currentTeamName] -= 1;
      onUpdate({ scores: newScores });
      setShowResult(true);
      setTimeout(() => {
        if (isPassedQuestion) {
          // Same team continues, go back to categories
          setCurrentView('categories');
          setCurrentQuestion(null);
          setSelectedAnswer(null);
          setShowResult(false);
          setSelectedCategory('');
          setShowOptions(false);
          setTextAnswer('');
          setIsPassedQuestion(false);
          setTimeLeft(60);
          setTimerActive(false);
        } else {
          // Pass to next team
          const nextTeamIndex = (currentTeam + 1) % teams.length;
          onUpdate({ currentTeam: nextTeamIndex });
          setSelectedAnswer(null);
          setShowResult(false);
          setShowOptions(false);
          setTextAnswer('');
          setIsPassedQuestion(true);
          setTimeLeft(60);
          setTimerActive(true);
        }
      }, 2000);
    }
  };

  const submitOptionAnswer = () => {
    if (selectedAnswer === null) return;
    setTimerActive(false);

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newScores = { ...scores };
    
    if (isCorrect) {
      newScores[currentTeamName] += 5;
      setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
      onUpdate({ scores: newScores });
      setShowResult(true);
    } else {
      newScores[currentTeamName] -= 2;
      setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
      onUpdate({ scores: newScores });
      setShowResult(true);
      if (isPassedQuestion) {
        // Same team continues after 2 seconds, go back to categories
        setTimeout(() => {
          setCurrentView('categories');
          setCurrentQuestion(null);
          setSelectedAnswer(null);
          setShowResult(false);
          setSelectedCategory('');
          setShowOptions(false);
          setTextAnswer('');
          setIsPassedQuestion(false);
          setTimeLeft(60);
          setTimerActive(false);
        }, 2000);
      }
    }
  };

  const passQuestion = () => {
    setTimerActive(false);
    const nextTeamIndex = (currentTeam + 1) % teams.length;
    onUpdate({ currentTeam: nextTeamIndex });
    setSelectedAnswer(null);
    setShowResult(false);
    setShowOptions(false);
    setTextAnswer('');
    setIsPassedQuestion(true);
    setTimeLeft(60);
    setTimerActive(true);
  };

  const handleTimeUp = () => {
    setTimerActive(false);
    if (!showOptions) {
      const newScores = { ...scores };
      newScores[currentTeamName] -= 1;
      onUpdate({ scores: newScores });
      setShowResult(true);
      setTimeout(() => {
        if (isPassedQuestion) {
          // Same team continues, go back to categories
          setCurrentView('categories');
          setCurrentQuestion(null);
          setSelectedAnswer(null);
          setShowResult(false);
          setSelectedCategory('');
          setShowOptions(false);
          setTextAnswer('');
          setIsPassedQuestion(false);
          setTimeLeft(60);
          setTimerActive(false);
        } else {
          // Pass to next team
          const nextTeamIndex = (currentTeam + 1) % teams.length;
          onUpdate({ currentTeam: nextTeamIndex });
          setSelectedAnswer(null);
          setShowResult(false);
          setShowOptions(false);
          setTextAnswer('');
          setIsPassedQuestion(true);
          setTimeLeft(60);
          setTimerActive(true);
        }
      }, 2000);
    } else {
      const newScores = { ...scores };
      newScores[currentTeamName] -= 2;
      setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
      onUpdate({ scores: newScores });
      setShowResult(true);
      if (isPassedQuestion) {
        // Same team continues after 2 seconds, go back to categories
        setTimeout(() => {
          setCurrentView('categories');
          setCurrentQuestion(null);
          setSelectedAnswer(null);
          setShowResult(false);
          setSelectedCategory('');
          setShowOptions(false);
          setTextAnswer('');
          setIsPassedQuestion(false);
          setTimeLeft(60);
          setTimerActive(false);
        }, 2000);
      }
    }
  };

  const nextTurn = () => {
    const nextTeamIndex = (currentTeam + 1) % teams.length;
    onUpdate({ currentTeam: nextTeamIndex });
    setCurrentView('categories');
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setSelectedCategory('');
    setShowOptions(false);
    setTextAnswer('');
    setIsPassedQuestion(false);
    setTimeLeft(60);
    setTimerActive(false);
  };

  const getAvailableCategories = () => {
    return categories.filter(category => {
      const availableQuestions = questions[category]?.filter(q => 
        !usedQuestions.has(`${category}-${q.id}`)
      ) || [];
      return availableQuestions.length > 0;
    });
  };

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

  const isGameOver = () => {
    return getAvailableCategories().length === 0;
  };

  if (isGameOver()) {
    const winner = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );

    return (
      <div className="card">
        <h1 className="title">🏆 Game Over!</h1>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#38b2ac', marginBottom: '20px' }}>
            Winner: {winner[0]}
          </h2>
          <div className="points-display" style={{ display: 'inline-block', fontSize: '24px' }}>
            {winner[1]} Points
          </div>
        </div>
        
        <div className="scoreboard">
          <h3 style={{ marginBottom: '20px' }}>Final Scores:</h3>
          {Object.entries(scores)
            .sort(([,a], [,b]) => b - a)
            .map(([team, score], index) => (
              <div key={team} className="score-item">
                <span style={{ fontWeight: 'bold' }}>
                  #{index + 1} {team}
                </span>
                <span className="points-display">{score} pts</span>
              </div>
            ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn" onClick={onReset}>
            Start New Game
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'questionNumbers') {
    const availableQuestions = questions[selectedCategory]?.filter(q => 
      !usedQuestions.has(`${selectedCategory}-${q.id}`)
    ) || [];

    return (
      <div className="card">
        <div className="question-header">
          <h1 className="title">🔢 Select Question Number</h1>
          <div className="points-display">
            Current Team: {currentTeamName}
          </div>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#4a5568' }}>
          Category: {selectedCategory}
        </h2>

        <div className="category-grid">
          {availableQuestions.map((_, index) => (
            <div 
              key={index} 
              className="category-card"
              onClick={() => selectQuestion(index)}
            >
              <h3>Question {index + 1}</h3>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="btn" onClick={() => setCurrentView('categories')}>
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'categories') {
    return (
      <div className="card">
        <div className="question-header">
          <h1 className="title">🎯 Choose Category</h1>
          <div className="points-display">
            Current Team: {currentTeamName}
          </div>
        </div>

        <div className="scoreboard">
          <h3 style={{ marginBottom: '15px' }}>Scoreboard:</h3>
          {teams.map(team => (
            <div 
              key={team} 
              className={`score-item ${team === currentTeamName ? 'current-team' : ''}`}
            >
              <span style={{ fontWeight: 'bold' }}>{team}</span>
              <span className="points-display">{scores[team]} pts</span>
            </div>
          ))}
        </div>

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

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="btn btn-danger" onClick={onReset}>
            Reset All Data
          </button>
          <button className="btn export-btn" onClick={onExport} style={{ marginLeft: '10px' }}>
            Export Data
          </button>
          <div className="file-input-wrapper" style={{ marginLeft: '10px' }}>
            <input type="file" accept=".json" onChange={onImport} id="import-game" />
            <label htmlFor="import-game" className="file-input-label">
              Import Data
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'question') {
    return (
      <div className="card">
        <div className="question-header">
          <h2 style={{ color: '#4a5568' }}>Category: {selectedCategory}</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div className={`points-display ${timeLeft <= 10 ? 'btn-danger' : ''}`}>
              ⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="points-display">
              {currentTeamName}
            </div>
          </div>
        </div>

        <div className="question-card">
          <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>
            {currentQuestion.question}
          </h3>

          {!showOptions ? (
            <div>
              <div className="form-group">
                <label>Your Answer (10 points):</label>
                <input
                  type="text"
                  className="input"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={showResult}
                />
              </div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button 
                  className="btn" 
                  onClick={() => setShowOptions(true)}
                  disabled={showResult}
                >
                  Show Options (5 points)
                </button>
                <button 
                  className="btn" 
                  onClick={passQuestion}
                  disabled={showResult}
                  style={{ marginLeft: '10px' }}
                >
                  Pass Question
                </button>
              </div>
            </div>
          ) : (
            <div className="options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`option ${selectedAnswer === index ? 'selected' : ''}`}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  style={{ 
                    cursor: showResult ? 'default' : 'pointer',
                    backgroundColor: showResult ? (
                      index === selectedAnswer ? (selectedAnswer === currentQuestion.correctAnswer ? '#c6f6d5' : '#fed7d7') : 'white'
                    ) : undefined,
                    borderColor: showResult ? (
                      index === selectedAnswer ? (selectedAnswer === currentQuestion.correctAnswer ? '#38a169' : '#e53e3e') : '#e2e8f0'
                    ) : undefined
                  }}
                >
                  {option}
                  {showResult && index === selectedAnswer && selectedAnswer === currentQuestion.correctAnswer && ' ✓'}
                  {showResult && index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && ' ✗'}
                </div>
              ))}
            </div>
          )}

          {showResult && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div className={`points-display ${(selectedAnswer === currentQuestion.correctAnswer || textAnswer.toLowerCase().trim() === currentQuestion.options[currentQuestion.correctAnswer].toLowerCase()) ? 'btn-success' : 'btn-danger'}`}>
                {timeLeft === 0 ? 
                  (!showOptions ? 'Time Up! -1 Point!' : 'Time Up! -2 Points!') : 
                  (selectedAnswer === currentQuestion.correctAnswer || textAnswer.toLowerCase().trim() === currentQuestion.options[currentQuestion.correctAnswer].toLowerCase()) ? 
                    (!showOptions ? 'Correct! +10 Points!' : 'Correct! +5 Points!') : 
                    (!showOptions ? 'Wrong Answer! -1 Point!' : 'Wrong Answer! -2 Points!')
                }
              </div>
              <p style={{ marginTop: '15px', color: '#4a5568' }}>
                {currentTeamName} now has {scores[currentTeamName]} points
              </p>
              {!showOptions && (selectedAnswer !== currentQuestion.correctAnswer && textAnswer.toLowerCase().trim() !== currentQuestion.options[currentQuestion.correctAnswer].toLowerCase()) && (
                <p style={{ marginTop: '10px', color: '#e53e3e', fontWeight: 'bold' }}>
                  Passing to next team...
                </p>
              )}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {!showResult ? (
              !showOptions ? (
                <button 
                  className="btn btn-success" 
                  onClick={submitTextAnswer}
                  disabled={!textAnswer.trim() || timeLeft === 0}
                  style={{ opacity: (!textAnswer.trim() || timeLeft === 0) ? 0.5 : 1 }}
                >
                  Submit Answer (10 pts)
                </button>
              ) : (
                <button 
                  className="btn btn-success" 
                  onClick={submitOptionAnswer}
                  disabled={selectedAnswer === null || timeLeft === 0}
                  style={{ opacity: (selectedAnswer === null || timeLeft === 0) ? 0.5 : 1 }}
                >
                  Submit Answer (5 pts)
                </button>
              )
            ) : (
              (showOptions && selectedAnswer !== currentQuestion.correctAnswer && isPassedQuestion) ? null : (
                <button className="btn" onClick={nextTurn}>
                  Continue Game
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default GamePlay;