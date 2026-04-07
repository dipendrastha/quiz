import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock URL and Blob for export
window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();

const testGameData = {
  teams: ["Team A", "Team B"],
  categories: ["General"],
  questions: {
    "General": [
      {
        question: "What is 2+2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        id: 1
      },
      {
        question: "What is 3+3?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 1,
        id: 2
      }
    ]
  },
  scores: { "Team A": 0, "Team B": 0 },
  currentTeam: 0,
  gameStarted: true,
  usedQuestions: [],
  currentView: 'game'
};

describe('KBC Quiz Application Scoring and Transitions', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('Correct text answer gives 10 points and shows celebration', async () => {
    localStorage.setItem('kbc-quiz-data', JSON.stringify(testGameData));

    render(<App />);

    // Select General category
    fireEvent.click(screen.getByText("General"));

    // Select Question 1
    fireEvent.click(screen.getByText("Question 1"));

    // Type correct answer "4"
    const input = screen.getByPlaceholderText(/Type your answer here/i);
    fireEvent.change(input, { target: { value: '4' } });

    // Submit answer
    fireEvent.click(screen.getByText(/Submit Answer \(10 pts\)/i));

    // Verify score update (+10)
    await waitFor(() => {
      const elements = screen.getAllByText(/-?\d+ pts/);
      expect(elements.some(el => el.textContent.includes('10 pts'))).toBe(true);
    });

    expect(screen.getByText(/Correct! \+10 Points!/i)).toBeInTheDocument();
  });

  test('Wrong text answer deducts 1 point', async () => {
    localStorage.setItem('kbc-quiz-data', JSON.stringify(testGameData));

    render(<App />);

    fireEvent.click(screen.getByText("General"));
    fireEvent.click(screen.getByText("Question 1"));

    const input = screen.getByPlaceholderText(/Type your answer here/i);
    fireEvent.change(input, { target: { value: 'wrong' } });

    fireEvent.click(screen.getByText(/Submit Answer \(10 pts\)/i));

    await waitFor(() => {
      const elements = screen.getAllByText(/-?\d+ pts/);
      expect(elements.some(el => el.textContent.includes('-1 pts'))).toBe(true);
    });
    expect(screen.getByText(/Wrong Answer! -1 Point!/i)).toBeInTheDocument();
  });

  test('Correct option answer gives 5 points', async () => {
    localStorage.setItem('kbc-quiz-data', JSON.stringify(testGameData));

    render(<App />);

    fireEvent.click(screen.getByText("General"));
    fireEvent.click(screen.getByText("Question 1"));

    // Switch to options
    fireEvent.click(screen.getByText(/Show Options \(5 points\)/i));

    // Correct answer is "4" (index 1)
    const option4 = screen.getByText("4");
    fireEvent.click(option4);

    fireEvent.click(screen.getByText(/Submit Answer \(5 pts\)/i));

    await waitFor(() => {
      const elements = screen.getAllByText(/-?\d+ pts/);
      expect(elements.some(el => el.textContent.includes('5 pts'))).toBe(true);
    });
    expect(screen.getByText(/Correct! \+5 Points!/i)).toBeInTheDocument();
  });

  test('Wrong option answer deducts 2 points', async () => {
    localStorage.setItem('kbc-quiz-data', JSON.stringify(testGameData));

    render(<App />);

    fireEvent.click(screen.getByText("General"));
    fireEvent.click(screen.getByText("Question 1"));

    fireEvent.click(screen.getByText(/Show Options \(5 points\)/i));

    // Wrong answer "3" (index 0)
    const option3 = screen.getByText("3");
    fireEvent.click(option3);

    fireEvent.click(screen.getByText(/Submit Answer \(5 pts\)/i));

    await waitFor(() => {
      const elements = screen.getAllByText(/-?\d+ pts/);
      expect(elements.some(el => el.textContent.includes('-2 pts'))).toBe(true);
    });
    expect(screen.getByText(/Wrong Answer! -2 Points!/i)).toBeInTheDocument();
  });
});
