/**
 * Live Match Simulation Component
 * 
 * This component provides a real-time match simulation experience with:
 * - Live timer showing match progression (0-90+ minutes)
 * - Real-time AI-generated commentary
 * - Sound effects for goals, whistles, and match events
 * - Live score updates as goals are scored
 * - Professional broadcast-style presentation
 * 
 * The component connects to the backend streaming API to receive match events
 * in real-time and provides an immersive viewing experience for administrators.
 * 
 * @component
 * @param {Object} team1 - First team object with country, players, rating, etc.
 * @param {Object} team2 - Second team object with country, players, rating, etc.
 * @param {Function} onMatchComplete - Callback when match finishes with results
 * @param {Function} onCancel - Callback when user cancels the simulation
 */

import React, { useState, useEffect, useRef } from 'react';
import { FlagIcon, isoForTeam } from '../utils/flags'; // Flag display utilities
import { PlayIcon, GoalIcon, ClockIcon } from './ui/Icons'; // UI icons
import soundManager from '../utils/soundManager'; // Sound effects manager

// API endpoint for live match streaming
const API_BASE_URL = 'http://localhost:5000/api';

const LiveMatchSimulation = ({ team1, team2, onMatchComplete, onCancel }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Match timing state
  const [matchTime, setMatchTime] = useState(0); // Current match minute (0-90+)
  const [isPlaying, setIsPlaying] = useState(false); // Whether match is currently streaming
  
  // Match content state
  const [commentary, setCommentary] = useState([]); // Array of commentary messages
  const [score, setScore] = useState({ team1: 0, team2: 0 }); // Live score tracking
  const [events, setEvents] = useState([]); // Match events (goals, cards, etc.)
  
  // Match status state
  const [matchComplete, setMatchComplete] = useState(false); // Whether match has ended
  const [error, setError] = useState(null); // Error messages from streaming
  
  // Sound system state
  const [soundEnabled, setSoundEnabled] = useState(true); // User sound preference
  const [soundIndicator, setSoundIndicator] = useState(null); // Visual sound feedback

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundManager.stopAmbient();
    };
  }, []);

  // Sound control
  useEffect(() => {
    if (soundEnabled) {
      soundManager.enable();
    } else {
      soundManager.disable();
    }
  }, [soundEnabled]);

  const connectToLiveStream = async () => {
    try {
      setError(null);
      setIsPlaying(true);
      
      // Create the streaming request
      const response = await fetch(`${API_BASE_URL}/matches/live-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1_id: team1.id,
          team2_id: team2.id,
          match_type: 'quarterFinal'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start live stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleStreamEvent(data);
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      setError('Failed to connect to live match stream');
      setIsPlaying(false);
    }
  };

  const handleStreamEvent = (data) => {
    switch (data.type) {
      case 'match_start':
        console.log('Match started:', data);
        break;
        
      case 'time_update':
        setMatchTime(data.minute);
        break;
        
      case 'commentary':
        const commentaryItem = {
          minute: data.minute,
          text: data.text,
          type: data.commentary_type || 'commentary'
        };
        
        setCommentary(prev => [...prev, commentaryItem]);
        
        // Play sound effects based on commentary type
        if (soundEnabled) {
          switch (data.commentary_type) {
            case 'kickoff':
              soundManager.playSound('kickoff');
              showSoundIndicator('🎵 Kickoff Whistle');
              break;
            case 'halftime':
              soundManager.playSound('halftime');
              showSoundIndicator('🎵 Half-time Whistle');
              break;
            case 'second_half':
              soundManager.playSound('kickoff');
              showSoundIndicator('🎵 Second Half Whistle');
              break;
            case 'fulltime':
              soundManager.playSound('fulltime');
              showSoundIndicator('🎵 Full-time Whistle');
              break;
          }
        }
        break;
        
      case 'goal':
        setScore(data.score);
        setEvents(prev => [...prev, {
          minute: data.minute,
          type: 'goal',
          team: data.team,
          player: data.scorer,
          teamId: data.team_id
        }]);
        
        // Play goal celebration sound
        if (soundEnabled) {
          soundManager.playSound('goal');
          showSoundIndicator('🎉 GOAL! Crowd Celebrates');
        }
        break;
        
      case 'match_complete':
        setMatchComplete(true);
        setIsPlaying(false);
        setTimeout(() => {
          onMatchComplete(data);
        }, 2000);
        break;
        
      case 'error':
        setError(data.error);
        setIsPlaying(false);
        break;
        
      default:
        console.log('Unknown event type:', data.type);
    }
  };

  const startMatch = () => {
    connectToLiveStream();
  };

  const showSoundIndicator = (message) => {
    setSoundIndicator(message);
    setTimeout(() => {
      setSoundIndicator(null);
    }, 2000);
  };

  const formatTime = (minutes) => {
    if (minutes <= 90) return `${minutes}'`;
    return `90+${minutes - 90}'`;
  };

  return (
    <div className="live-match-container">
      {/* Sound Indicator */}
      {soundIndicator && (
        <div className="sound-indicator">
          {soundIndicator}
        </div>
      )}
      {/* Match Header */}
      <div className="live-match-header">
        <div className="match-timer">
          <ClockIcon size={24} />
          <span className="time-display">{formatTime(matchTime)}</span>
          {matchTime >= 90 && !matchComplete && (
            <span className="injury-time">Injury Time</span>
          )}
        </div>
        
        <div className="match-controls">
          {!isPlaying && !matchComplete && (
            <button className="btn btn-success" onClick={startMatch}>
              <PlayIcon size={20} />
              Start Live Match
            </button>
          )}
          
          {isPlaying && !matchComplete && (
            <div className="live-indicator">
              <span className="live-dot"></span>
              LIVE
            </div>
          )}
          
          <button 
            className={`btn ${soundEnabled ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>

      {/* Live Score */}
      <div className="live-scoreboard">
        <div className="team-score">
          <FlagIcon 
            iso2={isoForTeam(team1)} 
            country={team1.country}
            width={40}
            height={30}
          />
          <span className="team-name">{team1.country}</span>
          <span className="score">{score.team1}</span>
        </div>
        
        <div className="vs-divider">-</div>
        
        <div className="team-score">
          <span className="score">{score.team2}</span>
          <span className="team-name">{team2.country}</span>
          <FlagIcon 
            iso2={isoForTeam(team2)} 
            country={team2.country}
            width={40}
            height={30}
          />
        </div>
      </div>

      {/* Live Commentary */}
      <div className="live-commentary">
        <h3>
          <GoalIcon size={20} />
          Live Commentary
        </h3>
        <div 
          className="commentary-feed"
          ref={(el) => {
            if (el) {
              el.scrollTop = el.scrollHeight;
            }
          }}
        >
          {commentary.map((comment, index) => (
            <div 
              key={index} 
              className={`commentary-item ${comment.type}`}
            >
              <span className="comment-time">{formatTime(comment.minute)}</span>
              <span className="comment-text">{comment.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Match Events */}
      {events.length > 0 && (
        <div className="match-events">
          <h3>Match Events</h3>
          <div className="events-list">
            {events.map((event, index) => (
              <div key={index} className="event-item">
                <span className="event-time">{formatTime(event.minute)}</span>
                <GoalIcon size={16} />
                <span className="event-text">
                  {event.player} ({event.team})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="match-error">
          <h3>⚠️ Connection Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={startMatch}>
            Retry Connection
          </button>
        </div>
      )}

      {matchComplete && (
        <div className="match-complete">
          <h2>🏆 Match Complete!</h2>
          <p>Final Score: {team1.country} {score.team1} - {score.team2} {team2.country}</p>
        </div>
      )}
    </div>
  );
};

export default LiveMatchSimulation;