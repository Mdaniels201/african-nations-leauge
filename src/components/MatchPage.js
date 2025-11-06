import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FlagIcon, isoForTeam } from '../utils/flags';
import { TrophyIcon, LightningIcon, PlayIcon, GoalIcon } from './ui/Icons';
import LiveMatchSimulation from './LiveMatchSimulation';

const API_BASE_URL = 'http://localhost:5000/api';

const MatchPage = ({ bracket, onSimulateMatch, onPlayMatch, loading }) => {
  const navigate = useNavigate();
  const { round, index } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [showLiveMatch, setShowLiveMatch] = useState(false);

  const matchFromState = location.state?.match || null;

  const match = useMemo(() => {
    if (matchFromState) return matchFromState;
    if (!bracket) return null;
    if (round === 'final') {
      return bracket.final || null;
    }
    if (round === 'quarterFinal') {
      return bracket.quarterFinals?.[Number(index)] || null;
    }
    if (round === 'semiFinal') {
      return bracket.semiFinals?.[Number(index)] || null;
    }
    return null;
  }, [bracket, matchFromState, round, index]);

  const team1 = match?.team1 || location.state?.team1 || null;
  const team2 = match?.team2 || location.state?.team2 || null;

  const canPlay = Boolean(team1 && team2 && !match?.winner);
  const isCompleted = match?.winner;

  const getRoundTitle = () => {
    switch (round) {
      case 'final': return (
        <>
          <TrophyIcon size={20} style={{ marginRight: '0.5rem' }} />
          Final
        </>
      );
      case 'semiFinal': return (
        <>
          <GoalIcon size={20} style={{ marginRight: '0.5rem' }} />
          Semi Final
        </>
      );
      case 'quarterFinal': return (
        <>
          <GoalIcon size={20} style={{ marginRight: '0.5rem' }} />
          Quarter Final
        </>
      );
      default: return 'Match';
    }
  };

  const handleQuickSim = async () => {
    if (!canPlay) return;
    const res = await onSimulateMatch(team1.id, team2.id, round);
    if (res) setResult(res);
  };



  const handleLiveMatch = () => {
    setShowLiveMatch(true);
  };

  const handleLiveMatchComplete = async (matchResult) => {
    setResult(matchResult);
    setShowLiveMatch(false);
    
    // Save the live match result to the database
    try {
      const response = await fetch(`${API_BASE_URL}/matches/save-live-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1: matchResult.team1,
          team2: matchResult.team2,
          team1_goals: matchResult.team1_goals,
          team2_goals: matchResult.team2_goals,
          score: matchResult.score,
          winner: matchResult.winner,
          goal_scorers: matchResult.goal_scorers,
          match_type: round
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save live match result');
      }

      const data = await response.json();
      console.log('Live match result saved successfully:', data);
      
      // Refresh the page to show updated results
      window.location.reload();
    } catch (error) {
      console.error('Error saving live match result:', error);
      alert('Failed to save live match result. Please try again.');
    }
  };

  const handleCancelLiveMatch = () => {
    setShowLiveMatch(false);
  };

  if (!match || !team1 || !team2) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">
            <GoalIcon size={64} />
          </div>
          <h2>Match Not Found</h2>
          <p>The match you're looking for is not available. It may be waiting for the previous round to complete.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            ← Back to Bracket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="match-page">
      {/* Match Header */}
      <div className="card">
        <div className="match-header">
          <button 
            className="btn btn-outline back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <div className="match-title">
            <h1>{getRoundTitle()}</h1>
            <p className="match-subtitle">African Nations League Tournament</p>
          </div>
          <div className="match-status-badge">
            {isCompleted ? (
              <span className="status-badge status-completed">
                <TrophyIcon size={16} style={{ marginRight: '0.25rem' }} />
                Completed
              </span>
            ) : canPlay ? (
              <span className="status-badge status-ready">
                <PlayIcon size={16} style={{ marginRight: '0.25rem' }} />
                Ready to Play
              </span>
            ) : (
              <span className="status-badge status-pending">
                <LightningIcon size={16} style={{ marginRight: '0.25rem' }} />
                Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Teams Display */}
      <div className="card">
        <div className="teams-display">
          <div className="team-card large">
            <div className="team-flag-container">
              <FlagIcon 
                iso2={isoForTeam(team1)} 
                country={team1.country}
                width={80}
                height={60}
              />
            </div>
            <h2 className="team-name">{team1.country}</h2>
            <div className="team-details">
              <div className="team-detail">
                <strong>Manager:</strong> {team1.manager}
              </div>
              <div className="team-detail">
                <strong>Rating:</strong> 
                <span className="team-rating">{team1.rating?.toFixed(1)}</span>
              </div>
              <div className="team-detail">
                <strong>Players:</strong> {team1.players?.length || 0}/23
              </div>
            </div>
          </div>

          <div className="vs-container">
            <div className="vs-circle">
              <span className="vs-text">VS</span>
            </div>
            {isCompleted && (
              <div className="match-score-large">
                {match.score || `${match.team1_goals || 0}-${match.team2_goals || 0}`}
              </div>
            )}
          </div>

          <div className="team-card large">
            <div className="team-flag-container">
              <FlagIcon 
                iso2={isoForTeam(team2)} 
                country={team2.country}
                width={80}
                height={60}
              />
            </div>
            <h2 className="team-name">{team2.country}</h2>
            <div className="team-details">
              <div className="team-detail">
                <strong>Manager:</strong> {team2.manager}
              </div>
              <div className="team-detail">
                <strong>Rating:</strong> 
                <span className="team-rating">{team2.rating?.toFixed(1)}</span>
              </div>
              <div className="team-detail">
                <strong>Players:</strong> {team2.players?.length || 0}/23
              </div>
            </div>
          </div>
        </div>

        {/* Match Status for Regular Users */}
        {!isCompleted && (
          <div className="match-status-container">
            <div className="match-waiting">
              <div className="waiting-icon">
                <PlayIcon size={48} />
              </div>
              <h3>Match Pending</h3>
              <p>This match is waiting to be simulated by the tournament administrator.</p>
              <p>Check back later to see the results!</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Match Simulation */}
      {showLiveMatch && (
        <LiveMatchSimulation
          team1={team1}
          team2={team2}
          onMatchComplete={handleLiveMatchComplete}
          onCancel={handleCancelLiveMatch}
        />
      )}

      {/* Match Result */}
      {(result || isCompleted) && (
        <div className="card">
          <div className="result-header">
            <h2>🎯 Match Result</h2>
            {result?.play_by_play && (
              <span className="commentary-badge">AI Commentary</span>
            )}
          </div>

          <div className="result-display">
            <div className="result-teams">
              <div className="result-team">
                <FlagIcon 
                  iso2={isoForTeam((result || match).team1)} 
                  country={(result || match).team1.country}
                  width={60}
                  height={45}
                />
                <span className="team-name">{(result || match).team1.country}</span>
              </div>
              
              <div className="result-score">
                <div className="score-display">
                  {(result || match).score || `${match.team1_goals || 0}-${match.team2_goals || 0}`}
                </div>
                <div className="score-label">Final Score</div>
              </div>
              
              <div className="result-team">
                <FlagIcon 
                  iso2={isoForTeam((result || match).team2)} 
                  country={(result || match).team2.country}
                  width={60}
                  height={45}
                />
                <span className="team-name">{(result || match).team2.country}</span>
              </div>
            </div>

            {(result?.winner || match.winner) && (
              <div className="winner-section">
                <div className="winner-trophy">🏆</div>
                <div className="winner-info">
                  <div className="winner-label">Match Winner</div>
                  <div className="winner-name">
                    {(result?.winner || match.winner).country}
                  </div>
                </div>
              </div>
            )}

            {/* Goal Scorers */}
            {(result?.goal_scorers?.length ? result.goal_scorers : match.goal_scorers)?.length > 0 && (
              <div className="goal-scorers-section">
                <h3>⚽ Goal Scorers</h3>
                <div className="scorers-list">
                  {(result?.goal_scorers || match.goal_scorers).map((goal, i) => (
                    <div key={i} className="goal-item detailed">
                      <span className="goal-minute">{goal.minute}'</span>
                      <span className="goal-scorer">{goal.scorer}</span>
                      <span className="goal-team">{goal.team}</span>
                      <span className="goal-type">Goal</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Match Commentary */}
            {result?.commentary && result.commentary.length > 1 && (
              <div className="commentary-section">
                <h3>🎙️ Match Commentary</h3>
                <div className="commentary-feed enhanced">
                  {result.commentary.map((comment, i) => (
                    <div key={i} className="commentary-item enhanced">
                      <div className="commentary-timeline">
                        <div className="timeline-dot"></div>
                      </div>
                      <div className="commentary-content">
                        {comment}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Match Statistics */}
            <div className="match-statistics">
              <h3>📊 Match Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{result?.goal_scorers?.length || match.goal_scorers?.length || 0}</div>
                  <div className="stat-label">Total Goals</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {result?.penalties ? 'Yes' : 'No'}
                  </div>
                  <div className="stat-label">Penalties</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {result?.play_by_play ? 'AI Commentary' : 'Quick Sim'}
                  </div>
                  <div className="stat-label">Simulation Type</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="card">
        <div className="navigation-actions">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            ← Back to Bracket
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/bracket')}
          >
            View Full Bracket 📊
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchPage;