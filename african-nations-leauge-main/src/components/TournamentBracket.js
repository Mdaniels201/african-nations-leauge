/**
 * Tournament Bracket Component
 * 
 * Displays the complete tournament bracket in a visual format showing:
 * - Quarter Finals (4 matches)
 * - Semi Finals (2 matches) 
 * - Final (1 match)
 * - Match results and winners
 * - Tournament statistics and progress
 * 
 * This is a view-only component for regular users. Match simulation
 * is handled by administrators through the AdminPanel component.
 * 
 * Features:
 * - Responsive bracket layout
 * - Click-to-view match details
 * - Real-time tournament progress tracking
 * - Professional tournament visualization
 * 
 * @component
 * @param {Object} bracket - Tournament bracket data from backend
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation to match pages
import { FlagIcon, isoForTeam } from '../utils/flags'; // Flag display utilities
import { TrophyIcon, PlayIcon, CheckIcon, GoalIcon, AnalyticsIcon, CrownIcon, RegisterIcon, InfoIcon } from './ui/Icons'; // UI icons

const TournamentBracket = ({ bracket }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const navigate = useNavigate();



  const renderMatch = (match, matchType, matchIndex) => {
    const hasTeams = match.team1 && match.team2;
    const isCompleted = match.winner;
    const isPlayable = hasTeams && !isCompleted;
    
    return (
      <div 
        key={matchIndex} 
        className={`match-card ${isCompleted ? 'completed' : ''} ${isPlayable ? 'playable' : ''}`}
        onClick={() => {
          if (hasTeams) {
            navigate(`/match/${matchType}/${matchIndex}`, { state: { match } });
          }
        }}
      >
        <div className="match-teams">
          <div className="team-display">
            {match.team1 ? (
              <>
                <FlagIcon 
                  iso2={isoForTeam(match.team1)} 
                  country={match.team1.country || 'Unknown'}
                  width={20}
                  height={15}
                  className="team-flag-small"
                />
                <span className="team-name">{match.team1.country || 'Unknown Team'}</span>
                {match.winner?.id === match.team1.id && (
                  <span className="winner-indicator">
                    <CrownIcon size={16} />
                  </span>
                )}
              </>
            ) : (
              <span className="team-placeholder">TBD</span>
            )}
          </div>
          
          <div className="vs">VS</div>
          
          <div className="team-display">
            {match.team2 ? (
              <>
                <FlagIcon 
                  iso2={isoForTeam(match.team2)} 
                  country={match.team2.country || 'Unknown'}
                  width={20}
                  height={15}
                  className="team-flag-small"
                />
                <span className="team-name">{match.team2.country || 'Unknown Team'}</span>
                {match.winner?.id === match.team2.id && (
                  <span className="winner-indicator">
                    <CrownIcon size={16} />
                  </span>
                )}
              </>
            ) : (
              <span className="team-placeholder">TBD</span>
            )}
          </div>
        </div>
        
        {isCompleted && (
          <div className="match-score">
            {match.score || `${match.team1_goals || 0}-${match.team2_goals || 0}`}
          </div>
        )}
        
        {!hasTeams && (
          <div className="match-status">
            <span className="status-waiting">
              <InfoIcon size={14} style={{ marginRight: '0.25rem' }} />
              Waiting for previous round
            </span>
          </div>
        )}
        
        {isPlayable && (
          <div className="match-status">
            <span className="status-waiting">
              <InfoIcon size={14} style={{ marginRight: '0.25rem' }} />
              Ready to be simulated by admin
            </span>
          </div>
        )}
      </div>
    );
  };

  if (!bracket) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">
            <TrophyIcon size={64} />
          </div>
          <h2>Tournament Bracket</h2>
          <p>No tournament has been started yet. Register 8 teams and start the tournament to view the bracket.</p>
          <div style={{ marginTop: '2rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/register'}
            >
              <RegisterIcon size={18} /> Register Teams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-bracket">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">
            <TrophyIcon size={24} style={{ marginRight: '0.5rem' }} />
            Tournament Bracket
            {bracket.final?.winner && (
              <span style={{ marginLeft: '1rem', fontSize: '1rem', color: 'var(--secondary-green)' }}>
                <CheckIcon size={16} style={{ marginRight: '0.25rem' }} />
                COMPLETED
              </span>
            )}
          </h1>
          <div className="tournament-progress">
            <span className="progress-label">Tournament Progress</span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{
                  width: `${bracket.final?.winner ? '100' : 
                          bracket.final?.team1 ? '75' : 
                          bracket.semiFinals?.some(sf => sf.winner) ? '50' : 
                          bracket.quarterFinals?.some(qf => qf.winner) ? '25' : '0'}%`
                }}
              ></div>
            </div>
          </div>
        </div>
        <p>Follow the tournament progress and view match results. Click on any match to view details and commentary.</p>
        {bracket.final?.winner && (
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            <CrownIcon size={18} style={{ marginRight: '0.5rem' }} />
            <strong>Tournament Champion: {bracket.final.winner.country}</strong>
            <CrownIcon size={18} style={{ marginLeft: '0.5rem' }} />
          </div>
        )}
      </div>

      {/* Bracket Visualization */}
      <div className="bracket-container">
        <div className="scroll-hint">
          <span>← Scroll horizontally to view full bracket →</span>
        </div>
        <div className="bracket-grid-compact">
          {/* Left Side */}
          <div className="bracket-side">
            <div className="bracket-column">
              <h3 className="bracket-round-title">Quarter Finals</h3>
              <div className="matches-group">
                {renderMatch(bracket.quarterFinals?.[0] || {}, 'quarterFinal', 0)}
                {renderMatch(bracket.quarterFinals?.[1] || {}, 'quarterFinal', 1)}
              </div>
            </div>
            
            <div className="bracket-column">
              <h3 className="bracket-round-title">Semi Finals</h3>
              <div className="matches-group centered">
                {renderMatch(bracket.semiFinals?.[0] || {}, 'semiFinal', 0)}
              </div>
            </div>
          </div>

          {/* Center - Final */}
          <div className="bracket-center">
            <div className="final-match">
              <h3 className="bracket-round-title final-title">
                <TrophyIcon size={20} style={{ marginRight: '0.5rem' }} />
                Final
              </h3>
              {renderMatch(bracket.final || {}, 'final', 0)}
            </div>
          </div>

          {/* Right Side */}
          <div className="bracket-side">
            <div className="bracket-column">
              <h3 className="bracket-round-title">Semi Finals</h3>
              <div className="matches-group centered">
                {renderMatch(bracket.semiFinals?.[1] || {}, 'semiFinal', 1)}
              </div>
            </div>
            
            <div className="bracket-column">
              <h3 className="bracket-round-title">Quarter Finals</h3>
              <div className="matches-group">
                {renderMatch(bracket.quarterFinals?.[2] || {}, 'quarterFinal', 2)}
                {renderMatch(bracket.quarterFinals?.[3] || {}, 'quarterFinal', 3)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Statistics */}
      <div className="card tournament-stats">
        <h3 className="card-title">
          <AnalyticsIcon size={20} style={{ marginRight: '0.5rem' }} />
          Tournament Statistics
        </h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <GoalIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {(bracket.quarterFinals?.reduce((total, match) => total + (match.goal_scorers?.length || 0), 0) || 0) +
                 (bracket.semiFinals?.reduce((total, match) => total + (match.goal_scorers?.length || 0), 0) || 0) +
                 (bracket.final?.goal_scorers?.length || 0)}
              </div>
              <div className="stat-label">Total Goals</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <PlayIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {(bracket.quarterFinals?.filter(match => match.play_by_play)?.length || 0) +
                 (bracket.semiFinals?.filter(match => match.play_by_play)?.length || 0) +
                 (bracket.final?.play_by_play ? 1 : 0)}
              </div>
              <div className="stat-label">AI Commentary Matches</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <CheckIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {(bracket.quarterFinals?.filter(match => match.winner)?.length || 0) +
                 (bracket.semiFinals?.filter(match => match.winner)?.length || 0) +
                 (bracket.final?.winner ? 1 : 0)}
              </div>
              <div className="stat-label">Matches Completed</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <CrownIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {bracket.final?.winner ? 1 : 0}
              </div>
              <div className="stat-label">Tournament Winner</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <AnalyticsIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {(() => {
                  const totalGoals = (bracket.quarterFinals?.reduce((total, match) => total + (match.goal_scorers?.length || 0), 0) || 0) +
                                   (bracket.semiFinals?.reduce((total, match) => total + (match.goal_scorers?.length || 0), 0) || 0) +
                                   (bracket.final?.goal_scorers?.length || 0);
                  const totalMatches = (bracket.quarterFinals?.filter(match => match.winner)?.length || 0) +
                                     (bracket.semiFinals?.filter(match => match.winner)?.length || 0) +
                                     (bracket.final?.winner ? 1 : 0);
                  return totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0.0';
                })()}
              </div>
              <div className="stat-label">Average Goals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Result Modal */}
      {selectedMatch && matchResult && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Match Result</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setSelectedMatch(null);
                  setMatchResult(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="match-result">
              <div className="match-teams large">
                <div className="team-display">
                  <FlagIcon 
                    iso2={isoForTeam(matchResult.team1)} 
                    country={matchResult.team1.country}
                    width={50}
                    height={35}
                  />
                  <span className="team-name">{matchResult.team1.country}</span>
                </div>
                
                <div className="score-display">
                  <div className="final-score">{matchResult.score}</div>
                  <div className="vs">VS</div>
                </div>
                
                <div className="team-display">
                  <FlagIcon 
                    iso2={isoForTeam(matchResult.team2)} 
                    country={matchResult.team2.country}
                    width={50}
                    height={35}
                  />
                  <span className="team-name">{matchResult.team2.country}</span>
                </div>
              </div>
              
              {matchResult.winner && (
                <div className="winner-announcement">
                  <div className="trophy">🏆</div>
                  <div className="winner-text">
                    <div className="winner-label">Winner</div>
                    <div className="winner-name">{matchResult.winner.country}</div>
                  </div>
                </div>
              )}
              
              {matchResult.goal_scorers && matchResult.goal_scorers.length > 0 && (
                <div className="goal-scorers">
                  <h4>Goal Scorers</h4>
                  <div className="scorers-list">
                    {matchResult.goal_scorers.map((goal, index) => (
                      <div key={index} className="goal-item">
                        <span className="goal-minute">{goal.minute}'</span>
                        <span className="goal-scorer">{goal.scorer}</span>
                        <span className="goal-team">({goal.team})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {matchResult.commentary && matchResult.commentary.length > 0 && (
                <div className="match-commentary">
                  <h4>
                    {matchResult.play_by_play ? '🎮 AI Commentary' : '📝 Match Summary'}
                  </h4>
                  <div className="commentary-feed">
                    {matchResult.commentary.map((comment, index) => (
                      <div key={index} className="commentary-item">
                        {comment}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSelectedMatch(null);
                  setMatchResult(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;