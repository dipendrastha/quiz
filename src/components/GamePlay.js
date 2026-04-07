import React, { useState, useEffect } from 'react';
import CelebrationEffect from './CelebrationEffect';

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
  const [teamsAttempted, setTeamsAttempted] = useState(new Set());
  const [originalTeam, setOriginalTeam] = useState(null);
  const [nextTurnTeam, setNextTurnTeam] = useState(0);
  const [gameStateBackup, setGameStateBackup] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const { teams, categories, questions, scores, currentTeam } = gameData;

  // Update gameData when usedQuestions changes
  useEffect(() => {
    onUpdate({ usedQuestions: Array.from(usedQuestions) });
  }, [usedQuestions]);

  // Sync usedQuestions when gameData.usedQuestions changes (e.g., after import)
  useEffect(() => {
    const propUsedQuestions = new Set(gameData.usedQuestions || []);
    if (propUsedQuestions.size !== usedQuestions.size ||
        ![...propUsedQuestions].every(q => usedQuestions.has(q))) {
      setUsedQuestions(propUsedQuestions);
    }
  }, [gameData.usedQuestions]);
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
    setTeamsAttempted(new Set());
    setOriginalTeam(currentTeam);
    setShowUndo(false);
    setGameStateBackup(null);
    setTimeLeft(60);
    setTimerActive(true);
  };

  const submitTextAnswer = () => {
    if (!textAnswer.trim()) return;
    setTimerActive(false);
    
    // Create backup before processing answer
    setGameStateBackup({
      scores: { ...scores },
      currentTeam,
      teamsAttempted: new Set(teamsAttempted),
      originalTeam,
      nextTurnTeam,
      usedQuestions: new Set(usedQuestions)
    });

    const correctOption = currentQuestion.options[currentQuestion.correctAnswer].toLowerCase();
    const isCorrect = textAnswer.toLowerCase().trim() === correctOption;
    const newScores = { ...scores };
    
    if (isCorrect) {
      newScores[currentTeamName] += 10;
      setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
      onUpdate({ scores: newScores });
      setShowResult(true);
      setShowCelebration(true);
      setShowUndo(false); // Hide undo for correct answers
      // If this was a passed question and answered correctly, next turn goes to next team from original
      if (isPassedQuestion && originalTeam !== null) {
        setNextTurnTeam((originalTeam + 1) % teams.length);
      } else {
        // Normal case: next team in sequence
        setNextTurnTeam((currentTeam + 1) % teams.length);
      }
    } else {
      newScores[currentTeamName] -= 1;
      onUpdate({ scores: newScores });
      const newTeamsAttempted = new Set([...teamsAttempted, currentTeamName]);
      setTeamsAttempted(newTeamsAttempted);
      setShowResult(true);
      setShowUndo(true); // Show undo for wrong answers
      
      setTimeout(() => {
        if (newTeamsAttempted.size >= teams.length) {
          // All teams have attempted, keep showing result with correct answer
          setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
          // Show correct answer for 3 seconds then continue
          setTimeout(() => {
            // Next turn goes to the next team in sequence from original team
            const nextTurn = (originalTeam + 1) % teams.length;
            setNextTurnTeam(nextTurn);
            onUpdate({ currentTeam: nextTurn });
            setCurrentView('categories');
            setCurrentQuestion(null);
            setSelectedAnswer(null);
            setShowResult(false);
            setSelectedCategory('');
            setShowOptions(false);
            setTextAnswer('');
            setIsPassedQuestion(false);
            setTeamsAttempted(new Set());
            setOriginalTeam(null);
            setShowUndo(false);
            setGameStateBackup(null);
            setTimeLeft(60);
            setTimerActive(false);
          }, 3000);
        } else {
          // Check if we've completed one full cycle
          const nextTeamIndex = (currentTeam + 1) % teams.length;
          if (nextTeamIndex === originalTeam) {
            // Completed one full cycle, show correct answer and end question
            setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
            setTeamsAttempted(new Set(teams.map(team => team))); // Mark all as attempted to show correct answer
            setTimeout(() => {
              const nextTurn = (originalTeam + 1) % teams.length;
              setNextTurnTeam(nextTurn);
              onUpdate({ currentTeam: nextTurn });
              setCurrentView('categories');
              setCurrentQuestion(null);
              setSelectedAnswer(null);
              setShowResult(false);
              setSelectedCategory('');
              setShowOptions(false);
              setTextAnswer('');
              setIsPassedQuestion(false);
              setTeamsAttempted(new Set());
              setOriginalTeam(null);
              setShowUndo(false);
              setGameStateBackup(null);
              setTimeLeft(60);
              setTimerActive(false);
            }, 3000);
          } else {
            // Pass to next team without showing correct answer
            onUpdate({ currentTeam: nextTeamIndex });
            setSelectedAnswer(null);
            setShowResult(false);
            setShowOptions(false);
            setTextAnswer('');
            setIsPassedQuestion(true);
            setTimeLeft(60);
            setTimerActive(true);
          }
        }
      }, 2000);
    }
  };

  const submitOptionAnswer = () => {
    if (selectedAnswer === null) return;
    setTimerActive(false);
    
    // Create backup before processing answer
    setGameStateBackup({
      scores: { ...scores },
      currentTeam,
      teamsAttempted: new Set(teamsAttempted),
      originalTeam,
      nextTurnTeam,
      usedQuestions: new Set(usedQuestions)
    });

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newScores = { ...scores };
    
    if (isCorrect) {
      newScores[currentTeamName] += 5;
      setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
      onUpdate({ scores: newScores });
      setShowResult(true);
      setShowCelebration(true);
      setShowUndo(false); // Hide undo for correct answers
      // If this was a passed question and answered correctly, next turn goes to next team from original
      if (isPassedQuestion && originalTeam !== null) {
        setNextTurnTeam((originalTeam + 1) % teams.length);
      } else {
        // Normal case: next team in sequence
        setNextTurnTeam((originalTeam + 1) % teams.length);
      }
    } else {
      newScores[currentTeamName] -= 2;
      setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
      onUpdate({ scores: newScores });
      setShowResult(true);
      setShowUndo(true); // Show undo for wrong answers
      // Options mode: question is not passable, next turn goes to next team
      setNextTurnTeam((originalTeam + 1) % teams.length);
    }
  };

  const passQuestion = () => {
    // Create backup before passing
    setGameStateBackup({
      scores: { ...scores },
      currentTeam,
      teamsAttempted: new Set(teamsAttempted),
      originalTeam,
      nextTurnTeam,
      usedQuestions: new Set(usedQuestions)
    });
    
    setTimerActive(false);
    const nextTeamIndex = (currentTeam + 1) % teams.length;
    
    // Check if we've completed one full cycle before passing
    if (nextTeamIndex === originalTeam) {
      // Completed one full cycle, show correct answer and end question
      setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
      setTeamsAttempted(new Set(teams.map(team => team))); // Mark all as attempted to show correct answer
      setShowResult(true);
      setShowUndo(true);
      setTimeout(() => {
        const nextTurn = (originalTeam + 1) % teams.length;
        setNextTurnTeam(nextTurn);
        onUpdate({ currentTeam: nextTurn });
        setCurrentView('categories');
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setShowResult(false);
        setSelectedCategory('');
        setShowOptions(false);
        setTextAnswer('');
        setIsPassedQuestion(false);
        setTeamsAttempted(new Set());
        setOriginalTeam(null);
        setShowUndo(false);
        setGameStateBackup(null);
        setTimeLeft(60);
        setTimerActive(false);
      }, 3000);
    } else {
      // Pass to next team
      onUpdate({ currentTeam: nextTeamIndex });
      setSelectedAnswer(null);
      setShowResult(false);
      setShowOptions(false);
      setTextAnswer('');
      setIsPassedQuestion(true);
      setTeamsAttempted(prev => new Set([...prev, currentTeamName]));
      setShowUndo(false); // Don't show undo during passing cycle
      setTimeLeft(60);
      setTimerActive(true);
    }
  };

  const handleTimeUp = () => {
    // Create backup before timeout
    setGameStateBackup({
      scores: { ...scores },
      currentTeam,
      teamsAttempted: new Set(teamsAttempted),
      originalTeam,
      nextTurnTeam,
      usedQuestions: new Set(usedQuestions)
    });
    
    setTimerActive(false);
    if (!showOptions) {
      const newScores = { ...scores };
      newScores[currentTeamName] -= 1;
      onUpdate({ scores: newScores });
      setShowResult(true);
      setShowUndo(true); // Show undo for timeout
      setTimeout(() => {
        const newTeamsAttempted = new Set([...teamsAttempted, currentTeamName]);
        setTeamsAttempted(newTeamsAttempted);
        
        if (newTeamsAttempted.size >= teams.length) {
          // All teams have attempted, keep showing result with correct answer
          setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
          // Show correct answer for 3 seconds then continue
          setTimeout(() => {
            // Next turn goes to the next team in sequence from original team
            const nextTurn = (originalTeam + 1) % teams.length;
            setNextTurnTeam(nextTurn);
            onUpdate({ currentTeam: nextTurn });
            setCurrentView('categories');
            setCurrentQuestion(null);
            setSelectedAnswer(null);
            setShowResult(false);
            setSelectedCategory('');
            setShowOptions(false);
            setTextAnswer('');
            setIsPassedQuestion(false);
            setTeamsAttempted(new Set());
            setOriginalTeam(null);
            setShowUndo(false);
            setGameStateBackup(null);
            setTimeLeft(60);
            setTimerActive(false);
          }, 3000);
        } else {
          // Check if we've completed one full cycle
          const nextTeamIndex = (currentTeam + 1) % teams.length;
          if (nextTeamIndex === originalTeam) {
            // Completed one full cycle, show correct answer and end question
            setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
            setTeamsAttempted(new Set(teams.map(team => team))); // Mark all as attempted to show correct answer
            setTimeout(() => {
              const nextTurn = (originalTeam + 1) % teams.length;
              setNextTurnTeam(nextTurn);
              onUpdate({ currentTeam: nextTurn });
              setCurrentView('categories');
              setCurrentQuestion(null);
              setSelectedAnswer(null);
              setShowResult(false);
              setSelectedCategory('');
              setShowOptions(false);
              setTextAnswer('');
              setIsPassedQuestion(false);
              setTeamsAttempted(new Set());
              setOriginalTeam(null);
              setShowUndo(false);
              setGameStateBackup(null);
              setTimeLeft(60);
              setTimerActive(false);
            }, 3000);
          } else {
            // Pass to next team without showing correct answer
            onUpdate({ currentTeam: nextTeamIndex });
            setSelectedAnswer(null);
            setShowResult(false);
            setShowOptions(false);
            setTextAnswer('');
            setIsPassedQuestion(true);
            setTimeLeft(60);
            setTimerActive(true);
          }
        }
      }, 2000);
    } else {
      const newScores = { ...scores };
      newScores[currentTeamName] -= 2;
      setUsedQuestions(prev => new Set([...prev, `${selectedCategory}-${currentQuestion.id}`]));
      onUpdate({ scores: newScores });
      setShowResult(true);
      setShowUndo(true); // Show undo for timeout in options mode
      // Options mode: question is not passable, next turn goes to next team
      setNextTurnTeam((originalTeam + 1) % teams.length);
    }
  };

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
    setGameStateBackup(null);
    setTimeLeft(60);
    setTimerActive(true);
  };

  const nextTurn = () => {
    // Set current team to the next turn team
    onUpdate({ currentTeam: nextTurnTeam });
    setCurrentView('categories');
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setSelectedCategory('');
    setShowOptions(false);
    setTextAnswer('');
    setIsPassedQuestion(false);
    setTeamsAttempted(new Set());
    setOriginalTeam(null);
    setShowUndo(false);
    setGameStateBackup(null);
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
          <h1 className="title">🎯 Select Team & Category</h1>
        </div>
        
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
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#89b4fa', marginBottom: '12px' }}>Choose Category for {currentTeamName}:</h3>
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
        <CelebrationEffect show={showCelebration} onComplete={() => setShowCelebration(false)} />
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
                  data-letter={String.fromCharCode(65 + index)}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  style={{ 
                    cursor: showResult ? 'default' : 'pointer',
                    backgroundColor: showResult ? (
                      index === selectedAnswer ? (selectedAnswer === currentQuestion.correctAnswer ? 'rgba(46,213,115,0.3)' : 'rgba(255,71,87,0.3)') : undefined
                    ) : undefined,
                    borderColor: showResult ? (
                      index === selectedAnswer ? (selectedAnswer === currentQuestion.correctAnswer ? '#2ed573' : '#ff4757') : '#ffd700'
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
              <p style={{ marginTop: '15px', color: '#89b4fa' }}>
                {currentTeamName} now has {scores[currentTeamName]} points
              </p>
              {(selectedAnswer !== currentQuestion.correctAnswer && textAnswer.toLowerCase().trim() !== currentQuestion.options[currentQuestion.correctAnswer].toLowerCase()) && (
                <div>
                  {!showOptions ? (
                    // Text mode: only show correct answer when all teams attempted or one full cycle completed
                    teamsAttempted.size >= teams.length ? (
                      <div style={{ marginTop: '15px', textAlign: 'center' }}>
                        <p style={{ color: '#f9e2af', fontWeight: 'bold', marginBottom: '10px' }}>
                          Correct Answer: {currentQuestion.options[currentQuestion.correctAnswer]}
                        </p>
                        <p style={{ color: '#6c7086' }}>
                          {teamsAttempted.size === teams.length ? 'One full cycle completed.' : 'All teams attempted.'} Next turn: {teams[(originalTeam + 1) % teams.length]}...
                        </p>
                      </div>
                    ) : (
                      <p style={{ marginTop: '10px', color: '#f38ba8', fontWeight: 'bold' }}>
                        Passing to next team... ({teamsAttempted.size}/{teams.length} teams attempted)
                      </p>
                    )
                  ) : (
                    // Options mode: always show correct answer for wrong answers
                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
                      <p style={{ color: '#f9e2af', fontWeight: 'bold', marginBottom: '10px' }}>
                        Correct Answer: {currentQuestion.options[currentQuestion.correctAnswer]}
                      </p>
                      <p style={{ color: '#6c7086' }}>
                        Next turn: {teams[(originalTeam + 1) % teams.length]}...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {!showResult ? (
              <div>
                {!showOptions ? (
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
                )}
                {showUndo && (
                  <button 
                    className="btn btn-danger" 
                    onClick={undoLastAction}
                    style={{ marginLeft: '10px' }}
                  >
                    Undo
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {showUndo && (
                  <button className="btn btn-danger" onClick={undoLastAction}>
                    Undo Last Action
                  </button>
                )}
                <button className="btn" onClick={nextTurn}>
                  Back to Team Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default GamePlay;