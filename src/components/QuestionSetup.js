import React, { useState } from 'react';

const QuestionSetup = ({ categories, questions, onUpdate, onNext, onBack, onReset, onExport, onImport }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || '');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const addQuestion = () => {
    if (question.trim() && options.every(opt => opt.trim())) {
      const newQuestions = { ...questions };
      if (!newQuestions[selectedCategory]) {
        newQuestions[selectedCategory] = [];
      }
      
      newQuestions[selectedCategory].push({
        question: question.trim(),
        options: options.map(opt => opt.trim()),
        correctAnswer,
        id: Date.now()
      });
      
      onUpdate(newQuestions);
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
    }
  };

  const removeQuestion = (category, questionId) => {
    const newQuestions = { ...questions };
    newQuestions[category] = newQuestions[category].filter(q => q.id !== questionId);
    onUpdate(newQuestions);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const getTotalQuestions = () => {
    return Object.values(questions).reduce((total, categoryQuestions) => 
      total + categoryQuestions.length, 0
    );
  };

  const canProceed = getTotalQuestions() >= categories.length;

  return (
    <div className="card">
      <h1 className="title">❓ Question Setup</h1>
      
      <div className="form-group">
        <label>Select Category:</label>
        <select 
          className="input"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Question:</label>
        <textarea
          className="textarea"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question here..."
        />
      </div>

      <div className="form-group">
        <label>Options:</label>
        {options.map((option, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="radio"
              name="correctAnswer"
              checked={correctAnswer === index}
              onChange={() => setCorrectAnswer(index)}
            />
            <input
              type="text"
              className="input"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              style={{ margin: 0 }}
            />
          </div>
        ))}
      </div>

      <button className="btn btn-success" onClick={addQuestion}>
        Add Question
      </button>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Questions by Category:</h3>
        {categories.map(category => (
          <div key={category} style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#4a5568', marginBottom: '10px' }}>
              {category} ({questions[category]?.length || 0} questions)
            </h4>
            {questions[category]?.map(q => (
              <div key={q.id} className="question-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{q.question}</p>
                    <div className="options">
                      {q.options.map((opt, idx) => (
                        <div 
                          key={idx} 
                          className={`option ${idx === q.correctAnswer ? 'selected' : ''}`}
                          style={{ cursor: 'default' }}
                        >
                          {opt} {idx === q.correctAnswer && '✓'}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger"
                    onClick={() => removeQuestion(category, q.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {getTotalQuestions() === 0 && (
        <p style={{ textAlign: 'center', color: '#718096', marginBottom: '20px' }}>
          No questions added yet. Add at least 1 question per category to continue.
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
            <input type="file" accept=".json" onChange={onImport} id="import-questions" />
            <label htmlFor="import-questions" className="file-input-label">
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
          Start Game ({getTotalQuestions()} questions)
        </button>
      </div>
    </div>
  );
};

export default QuestionSetup;