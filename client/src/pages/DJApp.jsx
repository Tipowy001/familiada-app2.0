import React, { useState, useEffect } from 'react';
import socket from '../services/socket';
import TeamSelector from '../components/DJ/TeamSelector';
import QuestionManager from '../components/DJ/QuestionManager';
import '../styles/App.css';

function DJApp() {
  const [startingTeam, setStartingTeam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [scores, setScores] = useState({ czerwoni: 0, niebiescy: 0 });
  const [errors, setErrors] = useState({ czerwoni: 0, niebiescy: 0 });
  const [teamNames, setTeamNames] = useState({
    czerwoni: 'Czerwoni',
    niebiescy: 'Niebiescy',
  });

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Socket.io: Połączono z serwerem');
    });
    return () => socket.off('connect');
  }, []);

  return (
    <div className="container">
      <h1 className="title">🎧 PANEL DJ-A 🎧</h1>

      <button className="button" onClick={() => window.open('/player', '_blank')}>
        Otwórz Panel Gracza
      </button>

      {!startingTeam ? (
        <TeamSelector
  setStartingTeam={(team) => {
    setStartingTeam(team);
    setCurrentTeam(team);
    socket.emit('current_team', { team });
  }}
  setTeamNames={(names) => {
    setTeamNames(names); // USTAW stan
    socket.emit('team_names', names); // Wyślij do graczy
  }}
/>

      ) : (
        <QuestionManager
          questions={questions}
          setQuestions={setQuestions}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          currentTeam={currentTeam}
          setCurrentTeam={setCurrentTeam}
          scores={scores}
          setScores={setScores}
          errors={errors}
          setErrors={setErrors}
          teamNames={teamNames}
        />
      )}
    </div>
  );
}

export default DJApp;
