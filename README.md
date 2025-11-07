# African Nations League Tournament Management System

A comprehensive web application for managing African Nations League football tournaments with real-time match simulation, AI commentary, and administrative controls.

---

## Features

### Team Management
- Register teams with 23-player rosters
- Automatic player rating generation based on positions (GK, DF, MD, AT)
- Team captain designation
- Overall team rating calculation
- Player position management

### Tournament System
- Knockout format: Quarter-finals, Semi-finals, Final
- Automatic bracket generation for 8 teams
- Visual bracket display with real-time updates
- Automatic winner advancement
- Extra time and penalty shootouts for draws

### Match Simulation Modes
- **Quick Simulation**: Instant results with final score and goal scorers
- **Live Simulation**: Real-time minute-by-minute match progression with commentary
- Dynamic scoring based on team ratings
- Realistic goal probability calculations
- Match events tracking (goals, scorers, timestamps)

### AI Commentary System
- Google Gemini-powered natural language commentary
- Context-aware match descriptions
- Pre-match analysis and predictions
- Goal event commentary
- Post-match summaries
- Automatic fallback to template commentary if AI unavailable

### Statistics & Analytics
- Golden Boot leaderboard (top goal scorers)
- Team performance metrics
- Match history with detailed results
- Player statistics across tournament
- Goals per match analytics

### Audio Features
- Goal celebration sound effects
- Referee whistle sounds (kickoff, half-time, full-time)
- Real-time audio during live matches
- Browser-based audio playback


## System Requirements

### Required Software
- **Node.js**: Version 16.0 or higher
- **Python**: Version 3.8 or higher (3.10+ recommended)
- **npm**: Comes with Node.js
- **pip**: Comes with Python

### Required Services
- **Firebase Account**: For Firestore database (free tier available)
- **Firebase Project**: With Firestore enabled

### Optional Services
- **Google Gemini API Key**: For AI commentary (free tier with limits)
- **Gmail Account**: For email notifications (requires app password)

### Hardware Requirements
**Minimum:**
- 4GB RAM
- 2GB free disk space
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Recommended:**
- 8GB RAM
- 5GB free disk space
- Stable internet connection for Firebase and AI services

## Project Structure

├── .venv
├── .vscode
├── backend/
├── .env
├── app.py
├── gunicorn_config.py
├── Profile
├── render.yaml
├── requirements-vercel.txt
├── requirements.txt
├── build/
│   ├── sounds/
│   │   ├── .gitkeep
│   │   ├── goal-celebration.wav
│   │   ├── whistle-long.wav
│   │   └── whistle-short.wav
│   ├── static/
│   │   ├── css/
│   │   │   ├── main.4a6ec09d.css
│   │   │   └── main.4a6ec09d.css.map
│   │   ├── js/
│   │   │   ├── main.698e2bc4.js
│   │   │   ├── main.698e2bc4.js.LICENSE.txt
│   │   │   └── main.698e2bc4.js.map
│   │   ├── asset-manifest.json
│   │   └── index.html
├── node_modules/
├── public/
│   ├── sounds/
│   │   ├── .gitkeep
│   │   ├── goal-celebration.wav
│   │   ├── whistle-long.wav
│   │   └── whistle-short.wav
│   └── index.html
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.js
│   │   │   └── Navigation.js
│   │   └── pages/
│   │       ├── ui/
│   │       │   ├── AdminPanel.js
│   │       │   ├── GoalsCorers.js
│   │       │   ├── Home.js
│   │       │   ├── LiveMatchSimulation.js
│   │       │   ├── MatchPage.js
│   │       │   ├── MatchSimulation.js
│   │       │   ├── TeamRegistration.js
│   │       │   └── TournamentBracket.js
│   │       ├── MatchHistory.js
│   │       └── TeamAnalytics.js
│   ├── utils/
│   ├── App.js
│   ├── config.js
│   ├── firebase.js
│   ├── index.css
│   └── index.js
├── .env
├── .env.production
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
├── render.yaml
└── vercel.json

## Environment Variables

### Backend (.env in backend folder)

**Firebase Configuration (Choose one method):**

Method 1: Service Account File (Recommended for development)
```env
# Place serviceAccountKey.json in project root
# No environment variables needed

Method 2: Environment Variables (Recommended for production)

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

Method 3: Full JSON String
FIREBASE_CONFIG_JSON={"type":"service_account","project_id":"..."}

Optional Services:
# Google Gemini AI (for AI commentary)
GEMINI_API_KEY=your-gemini-api-key

# Email Notifications (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

Frontend (.env in frontend folder)
REACT_APP_API_URL=http://localhost:5000

### 5. **Detailed API Documentation**
```markdown
## API Documentation

### Base URL
Development: `http://localhost:5000/api`

### Authentication
Admin endpoints require authentication (currently basic auth with admin credentials)

### Endpoints

#### Teams
**GET /api/teams**
- Description: Retrieve all registered teams
- Response: Array of team objects with players and ratings

**POST /api/teams**
- Description: Register a new team
- Body: Team details with 23 players
- Response: Created team with generated ratings

#### Tournament
**GET /api/tournament/bracket**
- Description: Get current tournament bracket
- Response: Bracket structure with all matches

**POST /api/admin/create_tournament**
- Description: Initialize tournament with 8 teams
- Requires: Exactly 8 registered teams
- Response: Generated bracket with quarter-finals

**POST /api/admin/reset_tournament**
- Description: Reset tournament and clear all matches
- Response: Success message

#### Matches
**GET /api/matches**
- Description: Get all matches
- Response: Array of match objects

**GET /api/match/{id}**
- Description: Get specific match details
- Response: Match object with teams, score, commentary

**GET /api/match_preview/{id}**
- Description: Get AI-generated match preview
- Response: Preview text (AI or fallback)

**POST /api/matches/simulate**
- Description: Quick match simulation
- Body: team1_id, team2_id, match_type
- Response: Match result with score and goal scorers

**POST /api/matches/live-stream**
- Description: Live match simulation with SSE
- Body: team1_id, team2_id, match_type
- Response: Server-Sent Events stream

**POST /api/matches/save-live-result**
- Description: Save live match result to database
- Body: Match result data
- Response: Updated bracket

#### Analytics
**GET /api/goal-scorers**
- Description: Get goal scorers leaderboard
- Response: Array of players with goal counts

**GET /api/analytics/{team_id}**
- Description: Get team analytics
- Response: Team statistics and performance metrics

**GET /api/player_analysis/{match_id}/{player_name}**
- Description: Get AI analysis of player performance
- Response: Player analysis text

## Usage Examples

### Registering a Team
1. Navigate to `/register`
2. Fill in team information:
   - Country name
   - Manager name
   - Representative name
   - Contact email
3. Add 23 players:
   - Player name
   - Position (GK, DF, MD, AT)
   - Mark one as captain
4. Submit form
5. System automatically generates player ratings

### Starting a Tournament
1. Register 8 teams first
2. Login to admin panel (`admin@anl.com` / `admin123`)
3. Navigate to `/admin`
4. Click "Create Tournament"
5. System generates bracket with quarter-finals

### Simulating a Match

**Quick Simulation:**
1. Go to tournament bracket
2. Click on a match
3. Click "Quick Simulate"
4. View instant results

**Live Simulation:**
1. Go to tournament bracket
2. Click on a match
3. Click "Live Simulate"
4. Watch real-time match progression
5. See minute-by-minute updates
6. Hear sound effects for goals
7. Read AI commentary

### Viewing Statistics
- **Goal Scorers**: Navigate to `/standings`
- **Team Analytics**: Navigate to `/analytics`
- **Match History**: View from tournament bracket

## Troubleshooting

### Backend Issues

**"Firebase initialization error"**
- Verify `serviceAccountKey.json` exists in project root
- Or check environment variables are set correctly
- Ensure Firebase project has Firestore enabled
- Check Firebase project ID matches your configuration

**"Port 5000 already in use"**
- Kill process using port 5000: `lsof -ti:5000 | xargs kill` (Mac/Linux)
- Or change port in `backend/app.py`

**"Module not found" errors**
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`
- Check Python version: `python --version` (should be 3.8+)
- Try using `pip3` instead of `pip`

**AI Commentary not working**
- Check GEMINI_API_KEY is set correctly
- Verify API key is active at Google AI Studio
- Check API quota limits
- Application will use fallback commentary if AI fails

### Frontend Issues

**"npm install fails"**
- Clear cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

**"Blank page in browser"**
- Check browser console (F12) for errors
- Verify backend is running on port 5000
- Check CORS settings in backend
- Verify API URL in frontend config

**"Cannot connect to backend"**
- Ensure backend is running: `http://localhost:5000/api/health`
- Check firewall settings
- Verify REACT_APP_API_URL in frontend .env

### Database Issues

**"No teams showing up"**
- Check Firebase connection
- Verify Firestore database exists
- Check browser network tab for API errors
- Ensure teams collection exists in Firestore

**"Tournament won't start"**
- Verify exactly 8 teams are registered
- Check admin authentication
- Review browser console for errors
- Check backend logs for error messages

### Audio Issues

**"Sound effects not playing"**
- Check browser audio permissions
- Verify sound files exist in `public/sounds/`
- Check browser console for audio errors
- Try different browser
- Ensure audio files are correct format (WAV)

- **Google Gemini AI**: AI-powered commentary generation
- **Firebase**: Database and backend services
- **React**: Frontend framework
- **Flask**: Backend framework
- **Sound Effects**: Various open-source contributors

## Acknowledgments

- African Nations League for inspiration
- Open source community for tools and libraries
- Contributors and testers