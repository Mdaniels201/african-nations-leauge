import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HistoryIcon, GoalIcon, TrophyIcon } from '../ui/Icons';
import API_BASE_URL from '../../config'; // API configuration

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatchHistory();
  }, []);

  const fetchMatchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/matches/history`);
      setMatches(response.data.matches || []);
    } catch (err) {
      setError('Failed to fetch match history');
      console.error('Error fetching match history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading match history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="match-history">
      <div className="card">
        <h1 className="card-title">
          <HistoryIcon size={24} style={{ marginRight: '0.5rem' }} />
          Match History
        </h1>
        <p>Complete history of all matches played in the tournament.</p>
      </div>

      {matches.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <GoalIcon size={64} />
            </div>
            <h3>No Matches Played Yet</h3>
            <p>Match history will appear here once matches are simulated.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="matches-timeline">
            {matches.map((match, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker">
                  <div className="marker-icon">
                    {match.round === 'Final' ? <TrophyIcon size={20} /> : 
                     match.round === 'Semi Final' ? <GoalIcon size={20} /> : <GoalIcon size={20} />}
                  </div>
                </div>
                <div className="timeline-content">
                  <div className="match-card-history">
                    <div className="match-header-history">
                      <span className="match-round">{match.round}</span>
                      <span className={`match-type ${match.play_by_play ? 'ai-commentary' : 'quick-sim'}`}>
                        {match.play_by_play ? 'AI Commentary' : 'Quick Sim'}
                      </span>
                    </div>
                    <div className="match-teams-history">
                      <span className="team-name">{match.team1}</span>
                      <span className="vs">VS</span>
                      <span className="team-name">{match.team2}</span>
                    </div>
                    <div className="match-result-history">
                      <span className="score">{match.score}</span>
                      <span className="winner">
                        Winner: {match.winner === 'Draw' ? 'Draw' : match.winner}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;