import React from 'react';
import { Link } from 'react-router-dom';
import { FlagIcon, isoForTeam } from '../utils/flags';
import { TrophyIcon, ChartIcon, RegisterIcon, CheckIcon, WarningIcon, InfoIcon, TeamIcon, AnalyticsIcon, GoalIcon } from './ui/Icons';

const Home = ({ teams, bracket, loading }) => {
  const canStartTournament = teams.length >= 8;
  const tournamentActive = bracket && bracket.status === 'active';
  const tournamentCompleted = bracket && bracket.status === 'completed';

  const getTournamentStatus = () => {
    if (tournamentCompleted) return { text: 'Completed', class: 'completed' };
    if (tournamentActive) return { text: 'Active', class: 'active' };
    return { text: 'Not Started', class: 'inactive' };
  };

  const status = getTournamentStatus();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="card hero-card">
        <div className="hero-content">
          <h1>
            <TrophyIcon size={48} className="hero-icon" />
            African Nations League
          </h1>
          <p className="hero-subtitle">
            Experience the thrill of African football with our advanced tournament simulation platform. 
            Register teams, simulate matches with AI commentary, and follow the journey to continental glory.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{teams.length}</span>
              <span className="stat-label">Teams Registered</span>
            </div>
            <div className="stat">
              <span className="stat-number">{teams.filter(t => t.players?.length === 23).length}</span>
              <span className="stat-label">Complete Squads</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {bracket ? (
                  Object.values(bracket).filter(match => match && match.winner).length
                ) : 0}
              </span>
              <span className="stat-label">Matches Played</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Tournament Status</h2>
          <span className={`status-badge status-${status.class}`}>
            {status.class === 'active' && <CheckIcon size={16} />}
            {status.class === 'completed' && <TrophyIcon size={16} />}
            {status.class === 'inactive' && <InfoIcon size={16} />}
            {status.text}
          </span>
        </div>

        <div className="status-grid">
          <div className="status-item">
            <strong>Registered Teams:</strong>
            <span className="team-count">
              {teams.length}/8
              {teams.length >= 8 && <CheckIcon size={16} style={{ marginLeft: '0.5rem', color: 'var(--secondary-green)' }} />}
            </span>
          </div>
          <div className="status-item">
            <strong>Tournament Phase:</strong>
            <span>
              {bracket?.final?.winner ? 'Final Completed' :
               bracket?.final?.team1 ? 'Final' :
               bracket?.semiFinals?.some(sf => sf.winner) ? 'Semi Finals' :
               bracket?.quarterFinals?.some(qf => qf.winner) ? 'Quarter Finals' :
               'Not Started'}
            </span>
          </div>
          <div className="status-item">
            <strong>Next Action:</strong>
            <span>
              {tournamentCompleted ? 'Tournament Finished' :
               !canStartTournament ? `Need ${8 - teams.length} more teams` :
               !tournamentActive ? 'Contact Admin to Start Tournament' :
               'View Bracket & Matches'}
            </span>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/bracket" className="btn btn-primary">
            <ChartIcon size={18} /> View Bracket
          </Link>

          <Link to="/register" className="btn btn-outline">
            <RegisterIcon size={18} /> Register Team
          </Link>
        </div>

        {!canStartTournament && (
          <div className="alert alert-info">
            <WarningIcon size={18} style={{ marginRight: '0.5rem' }} />
            <strong>Tournament Requirements:</strong> Need {8 - teams.length} more teams to start the tournament. Contact the admin once all teams are registered.
          </div>
        )}

        {canStartTournament && !tournamentActive && (
          <div className="alert alert-success">
            <CheckIcon size={18} style={{ marginRight: '0.5rem' }} />
            <strong>Ready to Start:</strong> All teams registered! Contact the admin to start the tournament.
          </div>
        )}
      </div>

      {/* Registered Teams */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Registered Teams</h2>
          <span className="team-badge">{teams.length} Teams</span>
        </div>

        {teams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <TeamIcon size={64} />
            </div>
            <h3>No Teams Registered Yet</h3>
            <p>Be the first to register your national team for the tournament!</p>
            <Link to="/register" className="btn btn-primary">
              Register First Team
            </Link>
          </div>
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
                  />
                  <h3 className="team-name">{team.country}</h3>
                </div>
                
                <div className="team-details">
                  <div className="team-detail">
                    <strong>Manager:</strong>
                    <span>{team.manager}</span>
                  </div>
                  <div className="team-detail">
                    <strong>Rating:</strong>
                    <span className="team-rating">
                      {team.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="team-detail">
                    <strong>Squad:</strong>
                    <span>{team.players?.length || 0}/23 players</span>
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
                    <AnalyticsIcon size={16} style={{ marginRight: '0.25rem' }} />
                    View Analytics
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="card-title">Quick Actions</h2>
        <div className="grid grid-3">
          <div className="action-card">
            <div className="action-icon">
              <TeamIcon size={48} />
            </div>
            <h4>Team Registration</h4>
            <p>Register your national team with 23 players and team management</p>
            <Link to="/register" className="btn btn-outline">
              Register Team
            </Link>
          </div>
          
          <div className="action-card">
            <div className="action-icon">
              <ChartIcon size={48} />
            </div>
            <h4>Tournament Bracket</h4>
            <p>View the tournament bracket and simulate matches with AI commentary</p>
            <Link to="/bracket" className="btn btn-outline">
              View Bracket
            </Link>
          </div>
          
          <div className="action-card">
            <div className="action-icon">
              <GoalIcon size={48} />
            </div>
            <h4>Goal Scorers</h4>
            <p>Check the top goal scorers and tournament statistics</p>
            <Link to="/goal-scorers" className="btn btn-outline">
              View Rankings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;