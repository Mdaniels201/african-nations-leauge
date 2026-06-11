/**
 * African Nations League Tournament Management System - Frontend Application
 * 
 * This is the main React application component that manages the entire
 * tournament system including team registration, bracket management,
 * live match simulation, and administrative functions.
 * 
 * Features:
 * - Team registration and management
 * - Tournament bracket visualization
 * - Live match simulation with AI commentary
 * - Administrative panel for tournament control
 * - Goal scorers tracking and analytics
 * - Match history and team statistics
 * 
 * @author [Your Name]
 * @version 1.0
 * @date November 2024
 */

// React core imports
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios'; // For API communication

// Layout Components
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';

// Main Page Components
import Home from './components/Home';
import TeamRegistration from './components/TeamRegistration';
import TournamentBracket from './components/TournamentBracket';
import MatchPage from './components/MatchPage';
import AdminPanel from './components/AdminPanel';
import GoalScorers from './components/GoalScorers';

// Additional Page Components
import MatchHistory from './components/pages/MatchHistory';
import TeamAnalytics from './components/pages/TeamAnalytics';

// UI Components
import Notification from './components/ui/Notification';

// ============================================================================
// API CONFIGURATION
// ============================================================================

import API_BASE_URL from './config'; // API configuration (auto-switches dev/prod)

/**
 * Main Application Component
 * 
 * Manages the global state of the tournament application including:
 * - Teams data and registration
 * - Tournament bracket state
 * - Loading states for API calls
 * - User notifications
 */
const App = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Teams state - holds all registered teams data
  const [teams, setTeams] = useState([]);
  
  // Tournament bracket state - holds the current tournament structure
  const [bracket, setBracket] = useState(null);
  
  // Loading state - shows loading indicators during API calls
  const [loading, setLoading] = useState(false);
  
  // Notification state - manages user feedback messages
  const [notification, setNotification] = useState(null);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Display a notification message to the user
   * @param {string} message - The message to display
   * @param {string} type - The type of notification (info, success, error, warning)
   */
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    // Auto-hide notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch teams
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/teams`);
      setTeams(response.data.teams || []);
    } catch (err) {
      showNotification('Failed to fetch teams', 'error');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tournament bracket
  const fetchBracket = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tournament/bracket`);
      setBracket(response.data.bracket);
    } catch (err) {
      console.error('Error fetching bracket:', err);
    }
  }, []);

  // Start tournament
  const startTournament = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/tournament/start`);
      setBracket(response.data.bracket);
      showNotification('Tournament started successfully!', 'success');
      fetchTeams();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to start tournament', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset tournament
  const resetTournament = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/tournament/reset`);
      setBracket(null);
      showNotification('Tournament reset successfully!', 'success');
      fetchTeams();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to reset tournament', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Play match function
  const playMatch = async (team1Id, team2Id, matchType = 'quarterFinal') => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/matches/play`, {
        team1_id: team1Id,
        team2_id: team2Id,
        match_type: matchType
      });
      
      showNotification('Match played with commentary!', 'success');
      fetchBracket();
      return response.data.match_result;
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to play match', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Simulate match
  const simulateMatch = async (team1Id, team2Id, matchType = 'quarterFinal') => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/matches/simulate`, {
        team1_id: team1Id,
        team2_id: team2Id,
        match_type: matchType
      });
      
      showNotification('Match simulated successfully!', 'success');
      fetchBracket();
      return response.data.match_result;
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to simulate match', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchBracket();
  }, [fetchTeams, fetchBracket]);

  return (
    <Router>
      <div className="app">
        <Header />
        <Navigation />
        
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <main className="main-content">
          <div className="container">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Home 
                    teams={teams}
                    bracket={bracket}
                    loading={loading}
                  />
                } 
              />
              <Route 
                path="/register" 
                element={
                  <TeamRegistration 
                    onTeamRegistered={fetchTeams}
                    loading={loading}
                  />
                } 
              />
              <Route 
                path="/bracket" 
                element={
                  <TournamentBracket 
                    bracket={bracket}
                    onSimulateMatch={simulateMatch}
                    onPlayMatch={playMatch}
                    loading={loading}
                  />
                } 
              />
              <Route
                path="/match/:round/:index"
                element={
                  <MatchPage
                    bracket={bracket}
                    onSimulateMatch={simulateMatch}
                    onPlayMatch={playMatch}
                    loading={loading}
                  />
                }
              />
              <Route 
                path="/admin" 
                element={
                  <AdminPanel 
                    teams={teams}
                    bracket={bracket}
                    onStartTournament={startTournament}
                    onResetTournament={resetTournament}
                    onSimulateMatch={simulateMatch}
                    onPlayMatch={playMatch}
                    loading={loading}
                  />
                } 
              />
              <Route 
                path="/goal-scorers" 
                element={<GoalScorers />} 
              />
              <Route 
                path="/match-history" 
                element={<MatchHistory />} 
              />
              <Route 
                path="/analytics/:teamId" 
                element={<TeamAnalytics />} 
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;