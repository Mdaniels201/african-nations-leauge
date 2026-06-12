import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, RegisterIcon, ChartIcon, HistoryIcon, GoalIcon, AdminIcon } from '../ui/Icons';

const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <HomeIcon size={18} /> Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/register" 
              className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
            >
              <RegisterIcon size={18} /> Register Team
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/bracket" 
              className={`nav-link ${location.pathname === '/bracket' ? 'active' : ''}`}
            >
              <ChartIcon size={18} /> Tournament Bracket
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/match-history" 
              className={`nav-link ${location.pathname === '/match-history' ? 'active' : ''}`}
            >
              <HistoryIcon size={18} /> Match History
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/goal-scorers" 
              className={`nav-link ${location.pathname === '/goal-scorers' ? 'active' : ''}`}
            >
              <GoalIcon size={18} /> Goal Scorers
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              <AdminIcon size={18} /> Admin Panel
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;