import React from 'react';
import { TrophyIcon } from '../ui/Icons';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>
          <TrophyIcon size={48} className="header-icon" />
          African Nations League
        </h1>
        <p className="subtitle">Tournament Simulation Platform</p>
        <div className="news-ticker">
          <strong>Latest:</strong> Experience AI-powered match commentary and advanced team analytics
        </div>
      </div>
    </header>
  );
};

export default Header;