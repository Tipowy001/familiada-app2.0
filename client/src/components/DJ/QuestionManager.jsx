import React, { useState, useRef } from 'react';
import socket from '../../services/socket';
import '../DJ/TeamSelector.css';

const QuestionManager = ({
  questions, setQuestions,
  currentQuestion, setCurrentQuestion,
  currentTeam, setCurrentTeam,
  scores, setScores,
  errors, setErrors,
  teamNames
}) => {
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualAnswers, setManualAnswers] = useState([{ answer: '', points: 0 }]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [revealedIndexes, setRevealedIndexes] = useState([]);

  const correctSound = useRef(new Audio('/sounds/correct.mp3'));
  const wrongSound = useRef(new Audio('/sounds/wrong.mp3'));
  const switchSound = useRef(new Audio('/sounds/switch.mp3'));

  const playSound = (soundRef) => {
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch((e) => {
        console.warn('Nie można odtworzyć dźwięku:', e);
      });
    }
  };

  const loadJSONFile = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const loadedQuestions = JSON.parse(event.target.result);
      setQuestions(loadedQuestions);
      setCurrentQuestion(loadedQuestions[0]);
      setCurrentQuestionIndex(0);
      setRevealedIndexes([]);
      socket.emit('send_question', loadedQuestions[0]);
      socket.emit('current_team', { team: currentTeam });
    };
    fileReader.readAsText(e.target.files[0]);
  };

  const handleManualSubmit = () => {
    const question = { question: manualQuestion, answers: manualAnswers };
    setQuestions([question]);
    setCurrentQuestion(question);
    setCurrentQuestionIndex(0);
    setRevealedIndexes([]);
    socket.emit('send_question', question);
    socket.emit('current_team', { team: currentTeam });
  };

  const revealAnswer = (index) => {
    if (revealedIndexes.includes(index)) return;
    if (!currentQuestion?.answers) return;

    const answer = currentQuestion.answers[index];
    const updatedScores = { ...scores };
    updatedScores[currentTeam] += answer.points;
    setScores(updatedScores);

    setRevealedIndexes(prev => [...prev, index]);

    socket.emit('show_answer', { index });
    socket.emit('update_scores', updatedScores);

    playSound(correctSound);
  };

  const handleRevealAll = () => {
    socket.emit('reveal_all');
    socket.emit('round_end');
    if (currentQuestion?.answers) {
      const allIndexes = currentQuestion.answers.map((_, idx) => idx);
      setRevealedIndexes(allIndexes);
    }
    playSound(switchSound);
  };
  const registerError = () => {
    const newErrors = { ...errors };
    newErrors[currentTeam] += 1;
    setErrors(newErrors);
    socket.emit('wrong_answer', { errors: newErrors });

    playSound(wrongSound);

    const nextTeam = currentTeam === 'czerwoni' ? 'niebiescy' : 'czerwoni';
    const currentHas3 = newErrors[currentTeam] >= 3;
    const nextHas3 = newErrors[nextTeam] >= 3;

    if (currentHas3 && !nextHas3) {
      setCurrentTeam(nextTeam);
      socket.emit('switch_team', { team: nextTeam });
      socket.emit('current_team', { team: nextTeam });
    }
  };

  const resetGame = () => {
    setQuestions([]);
    setCurrentQuestion(null);
    setCurrentTeam(null);
    setScores({ czerwoni: 0, niebiescy: 0 });
    setErrors({ czerwoni: 0, niebiescy: 0 });
    setManualQuestion('');
    setManualAnswers([{ answer: '', points: 0 }]);
    setCurrentQuestionIndex(0);
    setRevealedIndexes([]);

    socket.emit('send_question', null);
    socket.emit('update_scores', { czerwoni: 0, niebiescy: 0 });
    socket.emit('wrong_answer', { errors: { czerwoni: 0, niebiescy: 0 } });
    socket.emit('current_team', { team: null });
  };

  const handleNextQuestion = () => {
    if (questions.length === 0) return;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      alert('Brak więcej pytań.');
      return;
    }
    const nextQuestion = questions[nextIndex];
    setCurrentQuestion(nextQuestion);
    setCurrentQuestionIndex(nextIndex);
    setErrors({ czerwoni: 0, niebiescy: 0 });
    setRevealedIndexes([]);

    socket.emit('send_question', nextQuestion);
    socket.emit('wrong_answer', { errors: { czerwoni: 0, niebiescy: 0 } });
  };

  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = [...manualAnswers];
    updatedAnswers[index][field] = value;
    setManualAnswers(updatedAnswers);
  };

  const addAnswerField = () => {
    setManualAnswers([...manualAnswers, { answer: '', points: 0 }]);
  };

  const bothTeamsFailed = errors.czerwoni >= 3 && errors.niebiescy >= 3;

  return (
    <div className="container">
      <div className="section-box section-yellow">
        <h3>Wprowadź pytanie ręcznie</h3>
        <div className="input-group">
          <label>Treść pytania:</label>
          <input type="text" value={manualQuestion} onChange={(e) => setManualQuestion(e.target.value)} />
        </div>

        {manualAnswers.map((ans, idx) => (
          <div className="answer-row" key={idx}>
            <div className="input-group" style={{ flex: 2 }}>
              <label>Odpowiedź {idx + 1}:</label>
              <input type="text" value={ans.answer} onChange={(e) => handleAnswerChange(idx, 'answer', e.target.value)} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Punkty:</label>
              <input type="number" value={ans.points} onChange={(e) => handleAnswerChange(idx, 'points', parseInt(e.target.value))} min="0" />
            </div>
          </div>
        ))}

        <div className="button-group">
          <button className="button" style={{ backgroundColor: '#0044cc', color: '#fff' }} onClick={addAnswerField}>Dodaj odpowiedź</button>
          <button className="button" style={{ backgroundColor: '#28a745', color: '#fff' }} onClick={handleManualSubmit}>Zatwierdź pytanie</button>
        </div>
      </div>

      <div className="section-box section-blue">
        <h3>...lub wczytaj z pliku JSON:</h3>
        <input type="file" accept=".json" onChange={loadJSONFile} />
      </div>

      <div className="section-box section-yellow">
        <h3>Treść pytania:</h3>
        <p><strong>{currentQuestion?.question || 'Brak pytania'}</strong></p>
        <div className="button-group">
          {currentQuestion?.answers.map((ans, idx) => (
            <button
              key={idx}
              className="button"
              onClick={() => revealAnswer(idx)}
              disabled={revealedIndexes.includes(idx)}
              style={{
                backgroundColor: revealedIndexes.includes(idx) ? '#aaa' : '#0044cc',
                color: '#fff',
                cursor: revealedIndexes.includes(idx) ? 'not-allowed' : 'pointer',
                textDecoration: revealedIndexes.includes(idx) ? 'line-through' : 'none'
              }}
            >
              {ans.answer.toUpperCase()} ({ans.points})
            </button>
          ))}
        </div>
      </div>

      <div className="section-box section-red">
        <h3>Kontrola rundy</h3>
        <div className="button-group">
          <button className="button" style={{ backgroundColor: '#cc0000', color: '#fff' }} onClick={registerError}>BŁĄD</button>
          <button className="button" style={{ backgroundColor: '#28a745', color: '#fff' }} onClick={handleNextQuestion}>NASTĘPNE PYTANIE</button>
          <button className="button" style={{ backgroundColor: '#ff9800', color: '#fff' }} onClick={handleRevealAll}>ODKRYJ WSZYSTKIE</button>
          {bothTeamsFailed && (
            <button className="button" style={{ backgroundColor: '#ff9800', color: '#fff' }} onClick={handleRevealAll}>ZAKOŃCZ RUNDĘ</button>
          )}
          <button className="button" style={{ backgroundColor: '#cc0000', color: '#fff' }} onClick={resetGame}>RESET GRY</button>
        </div>
      </div>

      <div className="section-box section-green">
        <h3>Przełącz drużynę</h3>
        <div className="button-group">
          <button className="button" style={{ backgroundColor: '#cc0000', color: '#fff' }} onClick={() => {
            setCurrentTeam('czerwoni');
            socket.emit('switch_team', { team: 'czerwoni' });
            socket.emit('current_team', { team: 'czerwoni' });
          }}>
            CZERWONI ODPOWIADAJĄ
          </button>
          <button className="button" style={{ backgroundColor: '#0044cc', color: '#fff' }} onClick={() => {
            setCurrentTeam('niebiescy');
            socket.emit('switch_team', { team: 'niebiescy' });
            socket.emit('current_team', { team: 'niebiescy' });
          }}>
            NIEBIESCY ODPOWIADAJĄ
          </button>
        </div>
      </div>

      <div className="section-box">
        <h3>Wyniki</h3>
        <p><strong>{teamNames.czerwoni}</strong>: {scores.czerwoni}</p>
        <p><strong>{teamNames.niebiescy}</strong>: {scores.niebiescy}</p>
      </div>
    </div>
  );
};

export default QuestionManager;
