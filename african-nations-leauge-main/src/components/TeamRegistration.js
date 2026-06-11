import React, { useState } from 'react';
import axios from 'axios';
import { RegisterIcon } from './ui/Icons';
import API_BASE_URL from '../config'; // API configuration

const TeamRegistration = ({ onTeamRegistered, loading }) => {
  const [formData, setFormData] = useState({
    country: '',
    manager: '',
    representative: '',
    email: '',
    players: []
  });

  const [currentPlayer, setCurrentPlayer] = useState({
    name: '',
    naturalPosition: 'MD',
    isCaptain: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const positions = [
    { value: 'GK', label: 'Goalkeeper (GK)' },
    { value: 'DF', label: 'Defender (DF)' },
    { value: 'MD', label: 'Midfielder (MD)' },
    { value: 'AT', label: 'Attacker (AT)' }
  ];

  const africanCountries = [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde',
    'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Côte d\'Ivoire', 'Democratic Republic of Congo',
    'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia',
    'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar',
    'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger',
    'Nigeria', 'Rwanda', 'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone',
    'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
    'Zambia', 'Zimbabwe'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePlayerInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentPlayer(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addPlayer = () => {
    if (!currentPlayer.name.trim()) {
      setErrors(prev => ({
        ...prev,
        player: 'Player name is required'
      }));
      return;
    }

    if (formData.players.length >= 23) {
      setErrors(prev => ({
        ...prev,
        player: 'Maximum 23 players allowed'
      }));
      return;
    }

    // Check if captain is already selected
    if (currentPlayer.isCaptain && formData.players.some(p => p.isCaptain)) {
      setErrors(prev => ({
        ...prev,
        player: 'Only one captain allowed'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      players: [...prev.players, { ...currentPlayer }]
    }));

    setCurrentPlayer({
      name: '',
      naturalPosition: 'MD',
      isCaptain: false
    });

    setErrors(prev => ({
      ...prev,
      player: ''
    }));
  };

  const removePlayer = (index) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index)
    }));
  };

  const generateRandomPlayers = () => {
    const randomNames = [
      'Ahmed', 'Mohamed', 'Ali', 'Hassan', 'Omar', 'Ibrahim', 'Yusuf', 'Abdul', 'Khalid', 'Said',
      'Fatima', 'Aisha', 'Zainab', 'Maryam', 'Khadija', 'Amina', 'Hawa', 'Safiya', 'Zara', 'Nadia',
      'John', 'Peter', 'James', 'Michael', 'David', 'Robert', 'William', 'Richard', 'Thomas', 'Christopher',
      'Sarah', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy'
    ];

    const surnames = [
      'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez',
      'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
      'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
    ];

    const newPlayers = [];
    for (let i = 0; i < 23; i++) {
      const firstName = randomNames[Math.floor(Math.random() * randomNames.length)];
      const lastName = surnames[Math.floor(Math.random() * surnames.length)];
      const position = positions[Math.floor(Math.random() * positions.length)].value;
      
      newPlayers.push({
        name: `${firstName} ${lastName}`,
        naturalPosition: position,
        isCaptain: i === 0 // First player is captain
      });
    }

    setFormData(prev => ({
      ...prev,
      players: newPlayers
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.manager) newErrors.manager = 'Manager name is required';
    if (!formData.representative) newErrors.representative = 'Representative name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (formData.players.length !== 23) {
      newErrors.players = 'Exactly 23 players required';
    }

    const captains = formData.players.filter(p => p.isCaptain);
    if (captains.length !== 1) {
      newErrors.players = 'Exactly one captain required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/teams`, formData);
      setFormData({
        country: '',
        manager: '',
        representative: '',
        email: '',
        players: []
      });
      setCurrentPlayer({
        name: '',
        naturalPosition: 'MD',
        isCaptain: false
      });
      setErrors({});
      onTeamRegistered();
    } catch (error) {
      setErrors({
        submit: error.response?.data?.error || 'Failed to register team'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-header">
        <h2>
          <RegisterIcon size={32} style={{ marginRight: '0.75rem', verticalAlign: 'middle' }} />
          Team Registration
        </h2>
        <p>Register your national team for the African Nations League tournament</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="team-info-section">
          <h3 className="section-title">Team Information</h3>
          <div className="form-grid">
        
            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className={errors.country ? 'error' : ''}
              >
                <option value="">Select your country</option>
                {africanCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && <span className="error-text">{errors.country}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="manager">Manager Name *</label>
              <input
                type="text"
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                placeholder="Enter manager's full name"
                className={errors.manager ? 'error' : ''}
              />
              {errors.manager && <span className="error-text">{errors.manager}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="representative">Federation Representative *</label>
              <input
                type="text"
                id="representative"
                name="representative"
                value={formData.representative}
                onChange={handleInputChange}
                placeholder="Enter representative's full name"
                className={errors.representative ? 'error' : ''}
              />
              {errors.representative && <span className="error-text">{errors.representative}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>
        </div>

        <div className="squad-section">
          <div className="squad-header">
            <h3 className="section-title">Squad Selection</h3>
            <span className="squad-counter">{formData.players.length}/23 Players</span>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={generateRandomPlayers}
            >
              Generate Random Squad
            </button>
          </div>

          <div className="player-input-section">
            <h4>Add Player</h4>
            <div className="player-input-row">
              <div className="form-group player-name-field">
                <label htmlFor="playerName">Player Name *</label>
                <input
                  type="text"
                  id="playerName"
                  name="name"
                  value={currentPlayer.name}
                  onChange={handlePlayerInputChange}
                  placeholder="Enter player's full name"
                  className="player-name-input"
                />
              </div>
              
              <div className="form-group position-field">
                <label htmlFor="position">Position</label>
                <select
                  id="position"
                  name="naturalPosition"
                  value={currentPlayer.naturalPosition}
                  onChange={handlePlayerInputChange}
                >
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="captain-field">
                <label>
                  <input
                    type="checkbox"
                    name="isCaptain"
                    checked={currentPlayer.isCaptain}
                    onChange={handlePlayerInputChange}
                  />
                  Captain
                </label>
              </div>
              
              <div className="add-button">
                <button type="button" className="btn btn-success" onClick={addPlayer}>
                  ADD
                </button>
              </div>
            </div>
            {errors.player && <span className="error-text">{errors.player}</span>}
          </div>

          {formData.players.length > 0 && (
            <div>
              <h4>Current Squad</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                {formData.players.map((player, index) => (
                  <div key={index} className="player-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{player.name}</strong>
                        {player.isCaptain && <span style={{ color: '#fdcb6e', marginLeft: '10px' }}>👑</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlayer(index)}
                        style={{ background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </div>
                    <div className={`rating-item ${player.naturalPosition.toLowerCase()}`}>
                      {player.naturalPosition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.players && <span className="error-text">{errors.players}</span>}
        </div>

        {errors.submit && (
          <div className="alert alert-error">
            {errors.submit}
          </div>
        )}

        <div className="register-button-container">
          <button 
            type="submit" 
            className="btn btn-success btn-large register-team-btn"
            disabled={isSubmitting || loading}
          >
            <RegisterIcon size={20} style={{ marginRight: '0.5rem' }} />
            {isSubmitting ? 'Registering Team...' : 'Register Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamRegistration;