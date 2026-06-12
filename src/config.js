/**
 * API Configuration
 * Automatically switches between development and production URLs
 */

const API_CONFIG = {
  // Development: localhost
  development: 'http://localhost:5000/api',
  
  // Production: Your Render backend URL (you'll update this after deploying)
  production: process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com/api'
};

// Automatically detect environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? API_CONFIG.production 
  : API_CONFIG.development;

export default API_BASE_URL;
