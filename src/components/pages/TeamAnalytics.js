import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AnalyticsIcon, GoalIcon, CheckIcon, WarningIcon, TeamIcon } from '../ui/Icons';
import API_BASE_URL from '../../config';

const TeamAnalytics = () => {
  const { teamId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (teamId) {
      fetchTeamAnalytics();
    }
  }, [teamId]);

  const fetchTeamAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/teams/${teamId}/analytics`);
      setAnalytics(response.data.analytics);
    } catch (err) {
      setError('Failed to fetch team analytics');
      console.error('Error fetching team analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading team analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="card">
        <div className="alert alert-error">
          {error || 'Team analytics not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="team-analytics">
      <div className="card">
        <h1 className="card-title">
          <AnalyticsIcon size={24} style={{ marginRight: '0.5rem' }} />
          Team Analytics
        </h1>
        <h2 className="team-name-large">{analytics.team_name}</h2>
      </div>

      <div className="card">
        <h3 className="card-title">Performance Overview</h3>
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-icon">
              <GoalIcon size={24} />
            </div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.matches_played}</div>
              <div className="analytics-label">Matches Played</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">
              <CheckIcon size={24} />
            </div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.wins}</div>
              <div className="analytics-label">Wins</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">
              <WarningIcon size={24} />
            </div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.losses}</div>
              <div className="analytics-label">Losses</div>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">
              <TeamIcon size={24} />
            </div>
            <div className="analytics-content">
              <div className="analytics-value">{analytics.draws}</div>
              <div className="analytics-label">Draws</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Goal Statistics</h3>
        <div className="goals-stats">
          <div className="goal-stat">
            <div className="goal-stat-value">{analytics.goals_scored}</div>
            <div className="goal-stat-label">Goals Scored</div>
          </div>
          <div className="goal-stat">
            <div className="goal-stat-value">{analytics.goals_conceded}</div>
            <div className="goal-stat-label">Goals Conceded</div>
          </div>
          <div className="goal-stat">
            <div className="goal-stat-value">
              {analytics.matches_played > 0 
                ? (analytics.goals_scored / analytics.matches_played).toFixed(1)
                : '0.0'
              }
            </div>
            <div className="goal-stat-label">Goals per Match</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Win Rate</h3>
        <div className="win-rate">
          <div className="win-rate-circle">
            <div 
              className="win-rate-fill"
              style={{
                background: `conic-gradient(
                  #00b894 0deg ${(analytics.wins / analytics.matches_played) * 360}deg,
                  #fd7e14 ${(analytics.wins / analytics.matches_played) * 360}deg ${((analytics.wins + analytics.draws) / analytics.matches_played) * 360}deg,
                  #dc3545 ${((analytics.wins + analytics.draws) / analytics.matches_played) * 360}deg
                )`
              }}
            ></div>
            <div className="win-rate-text">
              {analytics.matches_played > 0 
                ? `${((analytics.wins / analytics.matches_played) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
          </div>
          <div className="win-rate-legend">
            <div className="legend-item">
              <div className="legend-color wins"></div>
              <span>Wins: {analytics.wins}</span>
            </div>
            <div className="legend-item">
              <div className="legend-color draws"></div>
              <span>Draws: {analytics.draws}</span>
            </div>
            <div className="legend-item">
              <div className="legend-color losses"></div>
              <span>Losses: {analytics.losses}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;