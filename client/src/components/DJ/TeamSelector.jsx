import React, { useState } from 'react';
import socket from '../../services/socket';
import './TeamSelector.css';

const TeamSelector = ({ setStartingTeam, setTeamNames }) => {
  const [redName, setRedName] = useState('Czerwoni');
  const [blueName, setBlueName] = useState('Niebiescy');

  const handleStartTeam = (team) => {
    const updatedNames = {
      czerwoni: redName.trim() || 'Czerwoni',
      niebiescy: blueName.trim() || 'Niebiescy',
    };
    setTeamNames(updatedNames);
    setStartingTeam(team);
    socket.emit('team_names', updatedNames);
    socket.emit('current_team', { team });
  };

  return (
    <div className="list" style={{ textAlign: 'center' }}>
      <h2 className="title">Wybierz drużynę, która zaczyna:</h2>

      <input
        type="text"
        className="input"
        value={redName}
        onChange={(e) => setRedName(e.target.value)}
        placeholder="Nazwa czerwonych"
      />
      <input
        type="text"
        className="input"
        style={{ marginTop: 10 }}
        value={blueName}
        onChange={(e) => setBlueName(e.target.value)}
        placeholder="Nazwa niebieskich"
      />

      {/* Dodany opis */}
      <p className="team-hint">Zmień nazwę drużyny lub wybierz kto zaczyna</p>

      <div className="button-group" style={{ marginTop: 20 }}>
        <button className="button button-danger" onClick={() => handleStartTeam('czerwoni')}>
          {redName || 'Czerwoni'}
        </button>
        <button className="button" onClick={() => handleStartTeam('niebiescy')}>
          {blueName || 'Niebiescy'}
        </button>
      </div>
    </div>
  );
};

export default TeamSelector;
