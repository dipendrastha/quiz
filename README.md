# KBC Quiz Application

A React-based quiz application inspired by "Kaun Banega Crorepati" (KBC) with team-based gameplay.

## Features

- **Host Setup**: Welcome screen for quiz host
- **Team Management**: Create and manage multiple teams (minimum 2 required)
- **Category Setup**: Create different question categories
- **Question Management**: Add questions with multiple choice answers for each category
- **Game Play**: 
  - Teams take turns selecting categories
  - Random questions from selected categories
  - Scoring system: +10 points for correct answers, -5 points for wrong answers
  - Real-time scoreboard
  - Game over detection when no questions remain
- **Local Storage**: All data persisted in browser's localStorage

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Game Flow

1. **Host Setup**: Start the application
2. **Team Setup**: Add team names (minimum 2 teams)
3. **Category Setup**: Create question categories
4. **Question Setup**: Add questions and answers for each category
5. **Game Play**: Teams alternate selecting categories and answering questions
6. **Game Over**: Winner declared when all questions are exhausted

## Scoring Rules

- Correct Answer: +10 points
- Wrong Answer: -5 points (minimum score is 0)

## Data Storage

All game data is automatically saved to localStorage and persists between browser sessions.

## Technologies Used

- React 18
- CSS3 with modern styling
- localStorage for data persistence