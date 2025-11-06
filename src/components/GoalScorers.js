import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoalIcon, TeamIcon, AnalyticsIcon } from './ui/Icons';
import { FlagIcon, isoForTeam } from '../utils/flags';

const API_BASE_URL = 'http://localhost:5000/api';

const GoalScorers = () => {
  const [goalScorers, setGoalScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGoalScorers();
  }, []);

  const fetchGoalScorers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/goal-scorers`);
      setGoalScorers(response.data.goal_scorers || []);
    } catch (err) {
      setError('Failed to fetch goal scorers');
      console.error('Error fetching goal scorers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading goal scorers...</p>
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
    <div>
      <div className="card">
        <h2>Goal Scorers Ranking</h2>
        <p>Top goal scorers in the African Nations League tournament.</p>
      </div>

      {goalScorers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <GoalIcon size={64} />
            </div>
            <h3>No Goals Scored Yet</h3>
            <p>Goal scorers will appear here once matches are played.</p>
          </div>
        </div>
      ) : (
        <div className="card goal-scorers-card">
          {/* Top Scorer Hero Section */}
          {goalScorers.length > 0 && (
            <div className="top-scorer-hero">
              <div className="hero-background">
                <div className="hero-content">
                  <div className="hero-position">1</div>
                  <div className="hero-info">
                    <h2 className="hero-name">{goalScorers[0].name}</h2>
                    <div className="hero-team">
                      <FlagIcon 
                        iso2={isoForTeam({ country: goalScorers[0].team })} 
                        country={goalScorers[0].team}
                        width={24}
                        height={18}
                      />
                      <span>{goalScorers[0].team}</span>
                    </div>
                  </div>
                  <div className="hero-goals">{goalScorers[0].goals}</div>
                </div>
              </div>
            </div>
          )}

          {/* Goal Scorers Table */}
          <div className="goal-scorers-table">
            <div className="table-header">
              <div className="header-pos">Pos</div>
              <div className="header-player">Player</div>
              <div className="header-country">Country</div>
              <div className="header-goals">Goals</div>
            </div>
            
            <div className="table-body">
              {goalScorers.map((scorer, index) => (
                <div key={index} className={`table-row ${index === 0 ? 'top-scorer' : ''}`}>
                  <div className="row-pos">
                    <span className="position-number">{index + 1}</span>
                  </div>
                  <div className="row-player">
                    <span className="player-name">{scorer.name}</span>
                  </div>
                  <div className="row-country">
                    <FlagIcon 
                      iso2={isoForTeam({ country: scorer.team })} 
                      country={scorer.team}
                      width={20}
                      height={15}
                      className="country-flag"
                    />
                    <span className="country-code">{scorer.team.substring(0, 3).toUpperCase()}</span>
                  </div>
                  <div className="row-goals">
                    <span className="goals-number">{scorer.goals}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Tournament Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <GoalIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {goalScorers.reduce((total, scorer) => total + scorer.goals, 0)}
              </div>
              <div className="stat-label">Total Goals</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <TeamIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {goalScorers.length}
              </div>
              <div className="stat-label">Goal Scorers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <AnalyticsIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {goalScorers.length > 0 ? (goalScorers.reduce((total, scorer) => total + scorer.goals, 0) / goalScorers.length).toFixed(1) : '0.0'}
              </div>
              <div className="stat-label">Average Goals</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalScorers;