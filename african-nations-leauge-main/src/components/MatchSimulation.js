import React from 'react';
import { FlagIcon, isoForTeam } from '../utils/flags';

const MatchSimulation = ({ matchResult, loading }) => {
  if (!matchResult) {
    return null;
  }

  return (
    <div className="card">
      <h3>Match Simulation Result</h3>
      
      <div className="match">
        <div className="match-teams">
          <div className="team">
            <FlagIcon iso2={isoForTeam(matchResult.team1)} country={matchResult.team1.country} /> {matchResult.team1.country}
          </div>
          <div className="vs">VS</div>
          <div className="team">
            <FlagIcon iso2={isoForTeam(matchResult.team2)} country={matchResult.team2.country} /> {matchResult.team2.country}
          </div>
        </div>
        
        <div className="score">
          {matchResult.score}
        </div>
        
        {matchResult.winner && (
          <div style={{ textAlign: 'center', margin: '15px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#00b894' }}>
            🏆 Winner: {matchResult.winner.country}
          </div>
        )}
        
        {matchResult.goal_scorers && matchResult.goal_scorers.length > 0 && (
          <div>
            <h4>Goal Scorers:</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {matchResult.goal_scorers.map((goal, index) => (
                <li key={index} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  {goal.scorer} ({goal.team}) - {goal.minute}'
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {matchResult.commentary && (
          <div className="commentary">
            <h4>Match Commentary:</h4>
            {matchResult.commentary.map((comment, index) => (
              <div key={index} className="commentary-item">
                {comment}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchSimulation;