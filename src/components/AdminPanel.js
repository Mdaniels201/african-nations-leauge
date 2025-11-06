/**
 * Administrator Panel Component
 * 
 * Provides administrative control over the tournament including:
 * - Secure login system (admin/admin123)
 * - Tournament management (start/reset)
 * - Match simulation control (quick sim and live sim)
 * - Team overview and management
 * - Live match simulation interface
 * 
 * This component is the control center for tournament administrators,
 * allowing them to manage all aspects of the tournament progression.
 * 
 * Security Features:
 * - Password-protected access
 * - Session management
 * - Admin-only functionality
 * 
 * @component
 * @param {Array} teams - Array of registered teams
 * @param {Object} bracket - Current tournament bracket state
 * @param {Function} onStartTournament - Callback to start tournament
 * @param {Function} onResetTournament - Callback to reset tournament
 * @param {Function} onSimulateMatch - Callback for quick match simulation
 * @param {boolean} loading - Loading state for API operations
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For navigation links
import { AdminIcon } from './ui/Icons'; // Admin interface icons
import { FlagIcon, isoForTeam } from '../utils/flags'; // Flag display utilities
import LiveMatchSimulation from './LiveMatchSimulation'; // Live match simulation component

const API_BASE_URL = 'http://localhost:5000/api';

const AdminPanel = ({ 
  teams, 
  bracket, 
  onStartTournament, 
  onResetTournament, 
  onSimulateMatch, 
  loading 
}) => {
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: ''
  });
  // Check localStorage for existing authentication on mount
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuthenticated') === 'true';
  });
  const [error, setError] = useState('');
  const [showLiveMatch, setShowLiveMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    setAdminCredentials({ username: '', password: '' });
  };

  const handleLiveSimulation = (team1, team2, matchType) => {
    setSelectedMatch({ team1, team2, matchType });
    setShowLiveMatch(true);
  };

  const handleLiveMatchComplete = async (matchResult) => {
    setShowLiveMatch(false);
    setSelectedMatch(null);
    
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
          match_type: selectedMatch.matchType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save live match result');
      }

      const data = await response.json();
      console.log('Live match result saved successfully:', data);
      
      // Refresh the page or bracket to show updated results
      window.location.reload();
    } catch (error) {
      console.error('Error saving live match result:', error);
      alert('Failed to save live match result. Please try again.');
    }
  };

  const handleCancelLiveMatch = () => {
    setShowLiveMatch(false);
    setSelectedMatch(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="login-card">
          <div className="login-header">
            <h2>
              <AdminIcon size={28} style={{ marginRight: '0.75rem', verticalAlign: 'middle' }} />
              Administrator Login
            </h2>
            <p>Enter your administrator credentials to access the admin panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={adminCredentials.username}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                required
              />
            </div>
            
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Login
            </button>
          </form>
          
          <div className="demo-credentials">
            <h4>Demo Credentials</h4>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
        </div>
      </div>
    );
  }

  const canStartTournament = teams.length >= 8;
  const tournamentActive = bracket && bracket.status === 'active';

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Administrator Panel</h2>
          <button className="btn btn-warning" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <p>Manage the tournament and simulate matches.</p>
      </div>

      <div className="card">
        <h3>Tournament Management</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div>
            <strong>Registered Teams:</strong> {teams.length}/8
          </div>
          <div>
            <strong>Tournament Status:</strong> 
            <span style={{ 
              color: tournamentActive ? '#00b894' : '#636e72',
              marginLeft: '10px',
              fontWeight: 'bold'
            }}>
              {tournamentActive ? 'Active' : 'Not Started'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {canStartTournament && !tournamentActive && (
            <button 
              className="btn btn-success" 
              onClick={onStartTournament}
              disabled={loading}
            >
              {loading ? 'Starting...' : 'Start Tournament'}
            </button>
          )}

          {tournamentActive && (
            <button 
              className="btn btn-warning" 
              onClick={onResetTournament}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Tournament'}
            </button>
          )}
        </div>

        {!canStartTournament && (
          <div className="alert alert-info">
            Need {8 - teams.length} more teams to start the tournament.
          </div>
        )}
      </div>

      {tournamentActive && (
        <div className="card">
          <h3>Match Simulation Control</h3>
          <p>As an administrator, you can simulate matches for the tournament. Regular users will only be able to view the results.</p>

          {/* Quarter Finals */}
          {bracket.quarterFinals && bracket.quarterFinals.length > 0 && (
            <div className="admin-match-section">
              <h4>Quarter Finals</h4>
              <div className="admin-matches-grid">
                {bracket.quarterFinals.map((match, index) => (
                  match?.team1 && match?.team2 && !match?.winner && (
                    <div key={index} className="admin-match-card">
                      <div className="admin-match-teams">
                        <span>{match.team1.country}</span>
                        <span className="vs">vs</span>
                        <span>{match.team2.country}</span>
                      </div>
                      <div className="admin-match-actions">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => onSimulateMatch(match.team1.id, match.team2.id, 'quarterFinal')}
                          disabled={loading}
                        >
                          Quick Sim
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleLiveSimulation(match.team1, match.team2, 'quarterFinal')}
                          disabled={loading}
                        >
                          Live Sim
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Semi Finals */}
          {bracket.semiFinals && bracket.semiFinals.length > 0 && (
            <div className="admin-match-section">
              <h4>Semi Finals</h4>
              <div className="admin-matches-grid">
                {bracket.semiFinals.map((match, index) => (
                  match?.team1 && match?.team2 && !match?.winner && (
                    <div key={index} className="admin-match-card">
                      <div className="admin-match-teams">
                        <span>{match.team1.country}</span>
                        <span className="vs">vs</span>
                        <span>{match.team2.country}</span>
                      </div>
                      <div className="admin-match-actions">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => onSimulateMatch(match.team1.id, match.team2.id, 'semiFinal')}
                          disabled={loading}
                        >
                          Quick Sim
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleLiveSimulation(match.team1, match.team2, 'semiFinal')}
                          disabled={loading}
                        >
                          Live Sim
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Final */}
          {bracket.final?.team1 && bracket.final?.team2 && !bracket.final?.winner && (
            <div className="admin-match-section">
              <h4>Final</h4>
              <div className="admin-matches-grid">
                <div className="admin-match-card final-match">
                  <div className="admin-match-teams">
                    <span>{bracket.final.team1.country}</span>
                    <span className="vs">vs</span>
                    <span>{bracket.final.team2.country}</span>
                  </div>
                  <div className="admin-match-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => onSimulateMatch(bracket.final.team1.id, bracket.final.team2.id, 'final')}
                      disabled={loading}
                    >
                      Quick Simulate Final
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleLiveSimulation(bracket.final.team1, bracket.final.team2, 'final')}
                      disabled={loading}
                    >
                      Live Simulate Final
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No matches available */}
          {(!bracket.quarterFinals?.some(m => m?.team1 && m?.team2 && !m?.winner) &&
            !bracket.semiFinals?.some(m => m?.team1 && m?.team2 && !m?.winner) &&
            !(bracket.final?.team1 && bracket.final?.team2 && !bracket.final?.winner)) && (
            <div className="alert alert-info">
              No matches are currently available for simulation. All matches have been completed or teams are not yet determined.
            </div>
          )}
        </div>
      )}

      {/* Live Match Simulation */}
      {showLiveMatch && selectedMatch && (
        <LiveMatchSimulation
          team1={selectedMatch.team1}
          team2={selectedMatch.team2}
          onMatchComplete={handleLiveMatchComplete}
          onCancel={handleCancelLiveMatch}
        />
      )}
          
      <div className="card">
        <h3>Registered Teams</h3>
        {teams.length === 0 ? (
          <p>No teams registered yet.</p>
        ) : (
          <div className="team-grid">
            {teams.map((team, index) => (
              <div key={team.id || index} className="team-card">
                <div className="team-header">
                  <FlagIcon 
                    iso2={isoForTeam(team)} 
                    country={team.country}
                    width={40}
                    height={30}
                    className="team-flag"
                  />
                  <h3 className="team-name">{team.country}</h3>
                </div>
                
                <div className="team-details">
                  <div className="team-detail">
                    <strong>Manager:</strong>
                    <span>{team.manager}</span>
                  </div>
                  <div className="team-detail">
                    <strong>Representative:</strong>
                    <span>{team.representative}</span>
                  </div>
                  <div className="team-detail">
                    <strong>Email:</strong>
                    <span>{team.email}</span>
                  </div>
                  <div className="team-detail">
                    <strong>Rating:</strong>
                    <span className="team-rating">
                      {team.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="team-detail">
                    <strong>Players:</strong>
                    <span>{team.players?.length || 0}/23</span>
                  </div>
                  <div className="team-detail">
                    <strong>Status:</strong>
                    <span className={`status-badge status-registered`}>
                      {team.status || 'registered'}
                    </span>
                  </div>
                </div>

                {/* Analytics Link */}
                {team.id && (
                  <Link 
                    to={`/analytics/${team.id}`}
                    className="btn btn-outline btn-sm"
                    style={{
                      marginTop: '15px',
                      display: 'block',
                      textAlign: 'center'
                    }}
                  >
                    📈 View Analytics
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;