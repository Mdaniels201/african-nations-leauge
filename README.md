# African Nations League Tournament Management System

A comprehensive web application for managig the Afrn Nations League football tournaments with real-time match simulation, AI commentary, and administrative controls.

## 🏆 Features

### Core Tournament Management
- **Team Registration**: Complete team registration with player rosters (23 players per team)
- **Tournament Bracket**: Visual bracket display with quarter-finals, semi-finals, and final
- **Match Simulation**: Two simulation modes - Quick simulation and Live simulation with AI commentary
- **Administrative Panel**: Secure admin interface for tournament control

### Advanced Features
- **Live Match Simulation**: Real-time match progression with minute-by-minute updates
- **AI Commentary**: Google Gemini-powered match commentary for immersive experience
- **Sound Effects**: Professional audio effects for goals, whistles, and match events
- **Email Notifications**: Automated email notifications for match results
- **Goal Scorers Tracking**: Premier League-style goal scorers leaderboard
- **Team Analytics**: Detailed team statistics and performance metrics
- **Match History**: Complete record of all tournament matches

### Technical Features
- **Real-time Streaming**: Server-sent events for live match updates
- **Responsive Design**: Mobile-friendly interface for all devices
- **Professional UI**: Modern, clean design with African Nations League branding
- **Flag Integration**: Country flags for all African nations
- **Sound Management**: Configurable audio system with WAV/MP3 support

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing for single-page application
- **Axios**: HTTP client for API communication
- **CSS3**: Custom CSS with CSS variables and modern layouts
- **Web Audio API**: Sound effects and audio management

### Backend
- **Flask**: Python web framework for REST API
- **Firebase Firestore**: NoSQL database for data storage
- **Google Gemini AI**: AI-powered commentary generation
- **SMTP Email**: Automated email notifications
- **Server-Sent Events**: Real-time streaming for live matches

### Infrastructure
- **Firebase Admin SDK**: Server-side Firebase integration
- **CORS**: Cross-origin resource sharing for API access
- **Environment Variables**: Secure configuration management
- **Gunicorn**: Production WSGI server

## 📁 Project Structure

```
african-nations-league/
├── backend/                    # Flask API server
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── firebase-credentials.json # Firebase service account
│   ├── .env                   # Environment variables
│   └── Procfile              # Deployment configuration
├── src/                       # React frontend
│   ├── components/           # React components
│   │   ├── layout/          # Header, Navigation
│   │   ├── pages/           # Page components
│   │   └── ui/              # UI components and icons
│   ├── utils/               # Utility functions
│   │   ├── flags.js         # Flag management
│   │   └── soundManager.js  # Audio system
│   ├── App.js               # Main React component
│   └── index.css            # Global styles
├── public/                   # Static assets
│   └── sounds/              # Audio files for match events
└── README.md                # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ and pip
- Firebase project with Firestore
- Google Gemini API key
- Gmail account for email notifications

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd african-nations-league/backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   Create `.env` file in backend folder:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Setup Firebase**
   - Download Firebase service account JSON
   - Save as `firebase-credentials.json` in backend folder

5. **Start the backend server**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ../
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the application**
   Open http://localhost:3000 in your browser

### Sound Effects Setup (Optional)

1. **Add sound files to `public/sounds/`**:
   - `goal-celebration.wav` - Crowd cheering for goals
   - `whistle-short.wav` - Referee whistle for kickoff
   - `whistle-long.wav` - Half-time whistle
   - `whistle-triple.wav` - Full-time whistle (optional)

2. **Sound files can be downloaded from**:
   - Freesound.org (requires free account)
   - BBC Sound Effects Library
   - Pixabay Sound Effects

## 🎮 Usage Guide

### For Regular Users

1. **View Tournament**: Browse the tournament bracket and match results
2. **Team Registration**: Register new teams with complete player rosters
3. **Goal Scorers**: View the goal scorers leaderboard
4. **Match History**: Browse completed matches and results
5. **Team Analytics**: View detailed team statistics

### For Administrators

1. **Login**: Access admin panel with credentials (admin/admin123)
2. **Start Tournament**: Initialize tournament when 8 teams are registered
3. **Simulate Matches**: Choose between Quick Sim or Live Sim for each match
4. **Live Simulation**: Watch matches unfold in real-time with AI commentary
5. **Tournament Management**: Reset tournament or manage team data

### Live Match Simulation

1. **Start Live Match**: Click "Live Match Simulation" in admin panel
2. **Watch Real-time**: See match timer, live score, and AI commentary
3. **Sound Effects**: Hear crowd cheers for goals and referee whistles
4. **Match Events**: View goals, scorers, and match statistics as they happen
5. **Results**: Automatic bracket updates when match completes

## 🔧 Configuration

### Email Setup
1. Create Gmail account for the application
2. Enable 2-Step Verification in Google Account
3. Generate App Password for "Mail"
4. Add credentials to `.env` file

### AI Commentary Setup
1. Visit https://makersuite.google.com/app/apikey
2. Create new API key
3. Add to `.env` file as `GEMINI_API_KEY`

### Firebase Setup
1. Create Firebase project
2. Enable Firestore database
3. Generate service account key
4. Save as `firebase-credentials.json`


### Teams
- `GET /api/teams` - Get all registered teams
- `POST /api/teams` - Register new team

### Tournament
- `GET /api/tournament/bracket` - Get tournament bracket
- `POST /api/tournament/start` - Start tournament (admin only)
- `POST /api/tournament/reset` - Reset tournament (admin only)

### Matches
- `POST /api/matches/simulate` - Quick match simulation
- `POST /api/matches/play` - Match with AI commentary
- `POST /api/matches/live-stream` - Live match streaming

### Analytics
- `GET /api/goal-scorers` - Get goal scorers leaderboard
- `GET /api/analytics/{team_id}` - Get team analytics

## Troubleshooting

### Common Issues

**Backend won't start**
- Check Python version (3.8+ required)
- Verify all dependencies installed
- Check Firebase credentials file exists

**Frontend build fails**
- Clear node_modules and reinstall
- Check Node.js version (16+ required)
- Verify all imports are correct

**AI Commentary not working**
- Verify Gemini API key is valid
- Check internet connection
- Review API quota limits

**Email notifications failing**
- Verify Gmail app password (not regular password)
- Check 2-Step Verification is enabled
- Test email credentials

**Sound effects not playing**
- Check audio files exist in `public/sounds/`
- Verify file formats (WAV/MP3)
- Test browser audio permissions



## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

##  Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

## Acknowledgments

- African Nations League for inspiration
- Google Gemini AI for commentary generation
- Firebase for database services
- React community for excellent documentation
- Open source sound effects contributors

