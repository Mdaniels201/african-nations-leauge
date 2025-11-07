"""
African Nations League Tournament Management System - Backend API

This Flask application provides the backend API for managing an African Nations League
football tournament. It includes features for:
- Team registration and management
- Tournament bracket generation and management
- Live match simulation with AI commentary
- Email notifications for match results
- Real-time streaming of match events

Author: [Your Name]
Date: November 2024
Version: 1.0
"""

# Core Flask imports
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

# Firebase imports for database management
import firebase_admin
from firebase_admin import credentials, firestore

# Standard library imports
import os
import random
import json
import time
from datetime import datetime

# Third-party imports
from dotenv import load_dotenv  # For environment variable management
import requests  # For HTTP requests
from email.mime.text import MIMEText  # For email composition
from email.mime.multipart import MIMEMultipart  # For email composition
import smtplib  # For sending emails
import google.generativeai as genai  # For AI commentary generation

# Load environment variables from .env file
# This allows us to keep sensitive data like API keys secure
load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) to allow frontend requests
# This is necessary for React frontend to communicate with Flask backend
# Configure CORS for both development and production
# Allow all origins temporarily for deployment debugging
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     supports_credentials=False,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# ============================================================================
# FIREBASE CONFIGURATION
# ============================================================================

# Initialize Firebase Admin SDK for database operations
try:
    # Try to get Firebase credentials from individual environment variables
    firebase_type = os.getenv('FIREBASE_TYPE')
    firebase_project_id = os.getenv('FIREBASE_PROJECT_ID')
    firebase_private_key = os.getenv('FIREBASE_PRIVATE_KEY')
    firebase_client_email = os.getenv('FIREBASE_CLIENT_EMAIL')
    
    if all([firebase_type, firebase_project_id, firebase_private_key, firebase_client_email]):
        # Build credentials dict from environment variables
        cred_dict = {
            "type": firebase_type,
            "project_id": firebase_project_id,
            "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
            "private_key": firebase_private_key.replace('\\n', '\n'),
            "client_email": firebase_client_email,
            "client_id": os.getenv('FIREBASE_CLIENT_ID'),
            "auth_uri": os.getenv('FIREBASE_AUTH_URI'),
            "token_uri": os.getenv('FIREBASE_TOKEN_URI')
        }
        cred = credentials.Certificate(cred_dict)
        print("🔑 Using Firebase credentials from environment variables")
    elif os.path.exists('firebase-credentials.json'):
        # Use service account file for local development
        cred = credentials.Certificate('firebase-credentials.json')
        print("🔑 Using Firebase service account file")
    else:
        # Fallback to application default credentials
        cred = credentials.ApplicationDefault()
        print("🔑 Using Firebase application default credentials")
    
    # Initialize Firebase app with credentials
    firebase_admin.initialize_app(cred, {
        'projectId': os.getenv('FIREBASE_PROJECT_ID', 'africannationsleague')
    })
    
    # Get Firestore database client
    db = firestore.client()
    print("✅ Firebase initialized successfully")
    
except Exception as e:
    print(f"❌ Firebase initialization error: {e}")
    print("⚠️  Database operations will not work without Firebase")
    db = None

# ============================================================================
# EMAIL CONFIGURATION
# ============================================================================

# SMTP settings for Gmail
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587

# Get email credentials from environment variables
# These should be set in the .env file for security
EMAIL_USER = os.getenv('EMAIL_USER', '')  # Gmail address
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')  # Gmail app password

# Alternative SMTP settings for other email providers
EMAIL_HOST_ALT = 'smtp-mail.outlook.com'  # For Outlook/Hotmail
EMAIL_PORT_ALT = 587

# ============================================================================
# GOOGLE GEMINI AI CONFIGURATION
# ============================================================================

# Get Gemini API key from environment variables
# This is used for generating AI-powered match commentary
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
gemini_model = None  # Will hold the initialized Gemini model

# Initialize Gemini AI if API key is provided
if GEMINI_API_KEY:
    try:
        # Configure Gemini with API key
        genai.configure(api_key=GEMINI_API_KEY)
        
        # List available models to find the best one for our use case
        print("🤖 Checking available Gemini models...")
        available_models = genai.list_models()
        
        # Try to find a suitable model that supports content generation
        model_found = False
        for model in available_models:
            # Check if model supports content generation (required for commentary)
            if 'generateContent' in model.supported_generation_methods:
                print(f"🔍 Found model: {model.name} - {model.display_name}")
                
                # Prefer Gemini models for best performance
                if 'gemini' in model.name.lower():
                    gemini_model = genai.GenerativeModel(model.name)
                    print(f"🟢 Using model: {model.name}")
                    model_found = True
                    break
        
        if not model_found:
            # Fallback: try common model names
            try:
                gemini_model = genai.GenerativeModel('gemini-pro')
                print("🟢 Using gemini-pro model")
            except:
                try:
                    gemini_model = genai.GenerativeModel('models/gemini-pro')
                    print("🟢 Using models/gemini-pro model")
                except:
                    # Use the first available model that supports generateContent
                    for model in available_models:
                        if 'generateContent' in model.supported_generation_methods:
                            gemini_model = genai.GenerativeModel(model.name)
                            print(f"🟢 Fallback to model: {model.name}")
                            break
            
    except Exception as e:
        print(f"🔴 Gemini configuration error: {e}")
        gemini_model = None
else:
    print("🔴 Gemini API key not found - using template commentary")

def send_email(to_email, subject, body):
    """Send email notification"""
    if not EMAIL_USER or not EMAIL_PASSWORD:
        print("🔴 Email not configured - skipping email notification")
        return False
    
    if not to_email or to_email == '':
        print("🔴 No recipient email provided - skipping")
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Try Gmail first, then Outlook
        email_host = os.getenv('EMAIL_HOST', EMAIL_HOST)
        email_port = int(os.getenv('EMAIL_PORT', EMAIL_PORT))
        
        server = smtplib.SMTP(email_host, email_port)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_USER, to_email, text)
        server.quit()
        print(f"🟢 Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"🔴 Email sending error: {e}")
        print(f"🔴 Check your EMAIL_USER and EMAIL_PASSWORD in .env file")
        return False

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for uptime monitoring"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'African Nations League API'
    }), 200

@app.route('/api/test-email', methods=['POST'])
def test_email():
    """Test email configuration"""
    try:
        data = request.json
        test_email_address = data.get('email', '')
        
        if not test_email_address:
            return jsonify({'error': 'Email address required'}), 400
        
        subject = "African Nations League - Email Test"
        body = """
Hello!

This is a test email from the African Nations League tournament system.

If you received this email, the email configuration is working correctly!

Best regards,
African Nations League System
        """
        
        success = send_email(test_email_address, subject, body)
        
        if success:
            return jsonify({'message': 'Test email sent successfully!'}), 200
        else:
            return jsonify({'error': 'Failed to send test email'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_player_ratings(natural_position):
    """Generate player ratings based on natural position"""
    ratings = {}
    positions = ['GK', 'DF', 'MD', 'AT']
    
    for pos in positions:
        if pos == natural_position:
            ratings[pos] = random.randint(50, 100)
        else:
            ratings[pos] = random.randint(0, 50)
    
    return ratings

def calculate_team_rating(players):
    """Calculate team rating from player ratings"""
    if not players:
        return 0
    
    total_rating = 0
    for player in players:
        # Use the player's natural position rating for team calculation
        natural_pos = player.get('naturalPosition', 'MD')
        total_rating += player.get('ratings', {}).get(natural_pos, 50)
    
    return total_rating / len(players)

def generate_ai_commentary(team1, team2, score1, score2, goal_scorers):
    """Generate AI commentary for match using Google Gemini"""
    print(f"🎯 STARTING AI COMMENTARY for {team1['country']} vs {team2['country']}")
    print(f"🎯 Score: {score1}-{score2}, Goals: {len(goal_scorers)}")
    
    # If Gemini is not configured, fall back to template-based commentary
    if not gemini_model:
        print("🔴 GEMINI NOT CONFIGURED - Using template commentary")
        return generate_template_commentary(team1, team2, score1, score2, goal_scorers)
    
    print("🟢 GEMINI CONFIGURED - Generating AI commentary...")
    
    try:
        # Create detailed prompt for Gemini
        goal_details = ""
        if goal_scorers:
            goal_details = "\nGoal Scorers:\n"
            for goal in goal_scorers:
                goal_details += f"- {goal['scorer']} ({goal['team']}) at {goal['minute']} minutes\n"
        else:
            goal_details = "\nNo goals were scored in this match.\n"
        
        prompt = f"""
        You are a professional football commentator for the African Nations League tournament. 
        Generate exciting, realistic match commentary for the following match:
        
        Match: {team1['country']} vs {team2['country']}
        Final Score: {score1}-{score2}
        {goal_details}
        
        Please provide engaging, realistic football commentary that includes:
        1. Match introduction and atmosphere
        2. Commentary for each goal (if any)
        3. Key moments in the match
        4. Match conclusion and analysis
        
        Make it engaging, realistic, and exciting like a real football commentator would. 
        Include specific details about the teams and make it sound natural and passionate.
        Format each commentary line on a new line.
        Keep it to 8-12 lines maximum.
        """
        
        print("🟢 Sending request to Gemini API...")
        # Generate commentary using Gemini
        response = gemini_model.generate_content(prompt)
        commentary_text = response.text.strip()
        
        print(f"🟢 GEMINI RESPONSE: {commentary_text}")
        
        # Split into individual commentary lines
        commentary_lines = [line.strip() for line in commentary_text.split('\n') if line.strip()]
        
        # Ensure we have at least basic commentary
        if not commentary_lines:
            print("🔴 EMPTY COMMENTARY FROM GEMINI - Using template")
            return generate_template_commentary(team1, team2, score1, score2, goal_scorers)
        
        print(f"🟢 SUCCESS: Generated {len(commentary_lines)} AI commentary lines")
        return commentary_lines
        
    except Exception as e:
        print(f"🔴 GEMINI API ERROR: {e}")
        # Fall back to template commentary if Gemini fails
        return generate_template_commentary(team1, team2, score1, score2, goal_scorers)

def generate_single_ai_commentary(text_prompt):
    """Generate single line AI commentary for live streaming"""
    try:
        if not gemini_model:
            return text_prompt  # Fallback to original text
        
        prompt = f"""
        You are a professional football commentator. Based on this situation, write ONE single sentence of commentary:
        
        {text_prompt}
        
        STRICT RULES:
        - Write ONLY ONE sentence
        - Use ONLY the exact team names given (NO nicknames)
        - NO options, NO alternatives, NO choices
        - NO asterisks, NO formatting, NO bullet points
        - Just plain commentary text
        
        Example: "What a brilliant pass from the midfielder, splitting the defense wide open!"
        """
        
        response = gemini_model.generate_content(prompt)
        if response and response.text:
            commentary = response.text.strip()
            # Remove any option markers or formatting
            commentary = commentary.replace('**', '').replace('*', '').replace('Option', '').replace('option', '')
            # Remove anything that looks like multiple choices
            if 'Of course' in commentary or 'here are' in commentary.lower():
                # If AI is giving options, just use the fallback
                return text_prompt
            # Take only the first sentence
            if '.' in commentary:
                commentary = commentary.split('.')[0] + '.'
            # Take only the first line if multiple are generated
            commentary = commentary.split('\n')[0]
            return commentary
        else:
            return text_prompt
            
    except Exception as e:
        print(f"Error generating single AI commentary: {e}")
        return text_prompt

def generate_template_commentary(team1, team2, score1, score2, goal_scorers):
    """Fallback template-based commentary"""
    print("USING TEMPLATE COMMENTARY")
    commentary = []
    
    # Match start
    commentary.append(f"Welcome to this exciting African Nations League match between {team1['country']} and {team2['country']}!")
    commentary.append("The atmosphere is electric as both teams take to the field!")
    
    # First half
    commentary.append("The referee blows his whistle and we're underway!")
    commentary.append("Both teams are showing great intensity in the opening minutes.")
    
    # Goal events
    if goal_scorers:
        for goal in goal_scorers:
            minute = goal['minute']
            scorer = goal['scorer']
            team = goal['team']
            commentary.append(f"{minute}' - GOAL! {scorer} scores for {team}!")
            commentary.append(f"The stadium erupts as {team} takes the lead!")
    else:
        commentary.append("It's a tight defensive battle with few clear chances.")
    
    # Second half
    commentary.append("The second half begins with both teams pushing for a breakthrough.")
    
    # Match end
    if score1 > score2:
        commentary.append(f"Full time! {team1['country']} wins {score1}-{score2} in a thrilling encounter!")
    elif score2 > score1:
        commentary.append(f"Full time! {team2['country']} wins {score2}-{score1} in a fantastic match!")
    else:
        commentary.append(f"Full time! The match ends in a {score1}-{score2} draw!")
    
    commentary.append("What a fantastic display of African football!")
    
    return commentary

@app.route('/api/teams', methods=['POST'])
def register_team():
    """Register a new team"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['country', 'manager', 'representative', 'email', 'players']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate players
        if len(data['players']) != 23:
            return jsonify({'error': 'Team must have exactly 23 players'}), 400
        
        # Check if captain is specified
        captains = [p for p in data['players'] if p.get('isCaptain', False)]
        if len(captains) != 1:
            return jsonify({'error': 'Team must have exactly one captain'}), 400
        
        # Generate player ratings
        for player in data['players']:
            player['ratings'] = generate_player_ratings(player['naturalPosition'])
        
        # Calculate team rating
        team_rating = calculate_team_rating(data['players'])
        
        team_data = {
            'country': data['country'],
            'manager': data['manager'],
            'representative': data['representative'],
            'email': data['email'],
            'players': data['players'],
            'rating': team_rating,
            'registeredAt': datetime.now().isoformat(),
            'status': 'registered'
        }
        
        if db:
            doc_ref = db.collection('teams').add(team_data)
            team_data['id'] = doc_ref[1].id
        
        return jsonify({'message': 'Team registered successfully', 'team': team_data}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/teams', methods=['GET'])
def get_teams():
    """Get all registered teams"""
    try:
        if not db:
            return jsonify({'teams': []}), 200
        
        teams = []
        docs = db.collection('teams').stream()
        for doc in docs:
            team_data = doc.to_dict()
            team_data['id'] = doc.id
            teams.append(team_data)
        
        return jsonify({'teams': teams}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tournament/bracket', methods=['GET'])
def get_tournament_bracket():
    """Get tournament bracket"""
    try:
        if not db:
            return jsonify({'bracket': None}), 200
        
        # Get tournament data
        tournament_doc = db.collection('tournament').document('current').get()
        if tournament_doc.exists:
            return jsonify({'bracket': tournament_doc.to_dict()}), 200
        else:
            return jsonify({'bracket': None}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tournament/start', methods=['POST'])
def start_tournament():
    """Start tournament (requires 8 teams)"""
    try:
        if not db:
            return jsonify({'error': 'Database not available'}), 500
        
        # Check if we have 8 teams
        teams_docs = db.collection('teams').stream()
        teams = list(teams_docs)
        
        if len(teams) < 8:
            return jsonify({'error': f'Need exactly 8 teams to start tournament, currently have {len(teams)}'}), 400
        
        # Create tournament bracket
        teams_data = []
        for team_doc in teams:
            team_data = team_doc.to_dict()
            team_data['id'] = team_doc.id
            teams_data.append(team_data)
        
        # Shuffle teams for random bracket
        random.shuffle(teams_data)
        
        bracket = {
            'quarterFinals': [
                {'team1': teams_data[0], 'team2': teams_data[1], 'winner': None, 'score': None, 'goal_scorers': [], 'commentary': []},
                {'team1': teams_data[2], 'team2': teams_data[3], 'winner': None, 'score': None, 'goal_scorers': [], 'commentary': []},
                {'team1': teams_data[4], 'team2': teams_data[5], 'winner': None, 'score': None, 'goal_scorers': [], 'commentary': []},
                {'team1': teams_data[6], 'team2': teams_data[7], 'winner': None, 'score': None, 'goal_scorers': [], 'commentary': []}
            ],
            'semiFinals': [
                {'team1': None, 'team2': None, 'winner': None, 'score': None, 'goal_scorers': [], 'commentary': []},
                {'team1': None, 'team2': None, 'winner': None, 'score': None, 'goal_scorers': [], 'commentary': []}
            ],
            'final': {
                'team1': None, 'team2': None, 'winner': None, 'score': None, 'goal_scorers': [], 'commentary': []
            },
            'status': 'active',
            'startedAt': datetime.now().isoformat()
        }
        
        # Save tournament to database
        db.collection('tournament').document('current').set(bracket)
        
        return jsonify({'message': 'Tournament started successfully', 'bracket': bracket}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/matches/play', methods=['POST'])
def play_match():
    """Play a match with full AI commentary (play-by-play)"""
    print("🎮 PLAY MATCH ENDPOINT CALLED - WITH COMMENTARY")
    return simulate_match_internal(play_by_play=True)

@app.route('/api/matches/live-stream', methods=['POST'])
def live_stream_match():
    """Stream a live match with real-time AI commentary"""
    print("LIVE STREAM MATCH ENDPOINT CALLED")
    
    try:
        # Get request data first, before creating the generator
        data = request.json
        team1_id = data.get('team1_id')
        team2_id = data.get('team2_id')
        match_type = data.get('match_type', 'quarterFinal')
        
        if not team1_id or not team2_id:
            return jsonify({'error': 'Both team IDs are required'}), 400
        
        if not db:
            return jsonify({'error': 'Database not available'}), 500
        
        # Get team data
        team1_doc = db.collection('teams').document(team1_id).get()
        team2_doc = db.collection('teams').document(team2_id).get()
        
        if not team1_doc.exists or not team2_doc.exists:
            return jsonify({'error': 'Teams not found'}), 404
        
        team1 = team1_doc.to_dict()
        team2 = team2_doc.to_dict()
        team1['id'] = team1_id
        team2['id'] = team2_id
        
        print(f"🏟️ Starting live stream: {team1['country']} vs {team2['country']}")
        
    except Exception as e:
        print(f"Error setting up live stream: {e}")
        return jsonify({'error': str(e)}), 500
    
    def generate_live_match():
        """
        Generate live match stream with smooth timer progression.
        Uses template commentary for instant delivery without blocking.
        AI commentary can be added as a post-processing enhancement.
        """
        try:
            # Send initial match info
            yield f"data: {json.dumps({'type': 'match_start', 'team1': team1, 'team2': team2, 'minute': 0})}\n\n"
            
            # Simulate match minute by minute
            team1_goals = 0
            team2_goals = 0
            goal_scorers = []
            
            # Pre-match commentary (using template for smooth performance)
            pre_match_commentary = f"Welcome to this exciting African Nations League match between {team1['country']} and {team2['country']}! Both teams are ready for kickoff in what promises to be a thrilling encounter."
            yield f"data: {json.dumps({'type': 'commentary', 'minute': 0, 'text': pre_match_commentary, 'commentary_type': 'pre_match'})}\n\n"
            
            # Kickoff
            kickoff_commentary = f"The referee blows the whistle and we're underway! {team1['country']} kicks off against {team2['country']}."
            yield f"data: {json.dumps({'type': 'commentary', 'minute': 1, 'text': kickoff_commentary, 'commentary_type': 'kickoff'})}\n\n"
            
            # Simulate each minute
            for minute in range(1, 94):  # 90 minutes + injury time
                time.sleep(0.2)  # 0.2 seconds per minute for faster demo (prevents timeout)
                
                # Send keep-alive ping to prevent connection timeout
                yield f": keepalive\n\n"
                
                yield f"data: {json.dumps({'type': 'time_update', 'minute': minute})}\n\n"
                
                # Check for goals (higher probability for better teams)
                team1_rating = team1.get('rating', 50)
                team2_rating = team2.get('rating', 50)
                
                goal_chance = 0.03 if minute < 90 else 0.01  # Higher chance for demo
                
                if random.random() < goal_chance:
                    # Determine which team scores based on ratings
                    total_rating = team1_rating + team2_rating
                    team1_prob = team1_rating / total_rating
                    
                    if random.random() < team1_prob:
                        # Team 1 scores
                        team1_goals += 1
                        attacking_players = [p for p in team1['players'] if p.get('naturalPosition') in ['AT', 'MD']]
                        scorer = random.choice(attacking_players)['name'] if attacking_players else random.choice(team1['players'])['name']
                        
                        goal_scorers.append({
                            'scorer': scorer,
                            'team': team1['country'],
                            'minute': minute
                        })
                        
                        # Send goal event immediately
                        yield f"data: {json.dumps({'type': 'goal', 'minute': minute, 'scorer': scorer, 'team': team1['country'], 'team_id': 1, 'score': {'team1': team1_goals, 'team2': team2_goals}})}\n\n"
                        
                        # Use quick fallback commentary (AI generation happens in background without blocking)
                        goal_commentary = f"GOAL! {scorer} finds the back of the net for {team1['country']} in the {minute}th minute! What a brilliant strike! The score is now {team1['country']} {team1_goals} - {team2_goals} {team2['country']}."
                        yield f"data: {json.dumps({'type': 'commentary', 'minute': minute, 'text': goal_commentary, 'commentary_type': 'goal'})}\n\n"
                        
                    else:
                        # Team 2 scores
                        team2_goals += 1
                        attacking_players = [p for p in team2['players'] if p.get('naturalPosition') in ['AT', 'MD']]
                        scorer = random.choice(attacking_players)['name'] if attacking_players else random.choice(team2['players'])['name']
                        
                        goal_scorers.append({
                            'scorer': scorer,
                            'team': team2['country'],
                            'minute': minute
                        })
                        
                        # Send goal event immediately
                        yield f"data: {json.dumps({'type': 'goal', 'minute': minute, 'scorer': scorer, 'team': team2['country'], 'team_id': 2, 'score': {'team1': team1_goals, 'team2': team2_goals}})}\n\n"
                        
                        # Use quick fallback commentary (AI generation happens in background without blocking)
                        goal_commentary = f"GOAL! {scorer} scores for {team2['country']} in the {minute}th minute! Brilliant finish! The score is now {team1['country']} {team1_goals} - {team2_goals} {team2['country']}."
                        yield f"data: {json.dumps({'type': 'commentary', 'minute': minute, 'text': goal_commentary, 'commentary_type': 'goal'})}\n\n"
                
                # Random match commentary every few minutes
                elif minute % 10 == 0 and random.random() < 0.7:
                    match_situations = [
                        f"Good attacking play from {random.choice([team1['country'], team2['country']])}",
                        f"Solid defensive work there from both teams",
                        f"The midfield battle is heating up between {team1['country']} and {team2['country']}",
                        f"Corner kick awarded to {random.choice([team1['country'], team2['country']])}",
                        f"Both teams are looking for that crucial breakthrough",
                        f"Fast-paced action in the middle of the park",
                        f"Shot goes wide of the target - close but not close enough",
                        f"Great save by the goalkeeper! What a reflex stop",
                        f"The crowd is getting behind their team here"
                    ]
                    
                    commentary = random.choice(match_situations)
                    yield f"data: {json.dumps({'type': 'commentary', 'minute': minute, 'text': commentary, 'commentary_type': 'match_event'})}\n\n"
                
                # Half-time
                if minute == 45:
                    halftime_commentary = f"Half-time here and it's {team1['country']} {team1_goals} - {team2_goals} {team2['country']}. What a first half we've witnessed! Both teams will be looking to make their mark in the second period."
                    yield f"data: {json.dumps({'type': 'commentary', 'minute': minute, 'text': halftime_commentary, 'commentary_type': 'halftime'})}\n\n"
                
                # Second half start
                elif minute == 46:
                    second_half_commentary = f"We're back underway for the second half! {team2['country']} gets us started again. Can they find the breakthrough in this second period?"
                    yield f"data: {json.dumps({'type': 'commentary', 'minute': minute, 'text': second_half_commentary, 'commentary_type': 'second_half'})}\n\n"
                
                # Full-time
                elif minute == 90:
                    if team1_goals != team2_goals:
                        winner = team1 if team1_goals > team2_goals else team2
                        fulltime_commentary = f"Full-time! {team1['country']} {team1_goals} - {team2_goals} {team2['country']}. What a match! {winner['country']} takes the victory in this thrilling encounter."
                        yield f"data: {json.dumps({'type': 'commentary', 'minute': minute, 'text': fulltime_commentary, 'commentary_type': 'fulltime'})}\n\n"
                    else:
                        fulltime_commentary = f"Full-time and it's all square! {team1['country']} {team1_goals} - {team2_goals} {team2['country']}. We're heading to extra time!"
                        yield f"data: {json.dumps({'type': 'commentary', 'minute': minute, 'text': fulltime_commentary, 'commentary_type': 'fulltime'})}\n\n"
            
            # Extra time if draw (for knockout matches)
            penalties = None
            if team1_goals == team2_goals and match_type != 'group':
                # Extra time commentary
                extra_time_start = f"Extra time begins! Both teams have 30 more minutes to find a winner."
                yield f"data: {json.dumps({'type': 'commentary', 'minute': 91, 'text': extra_time_start, 'commentary_type': 'extra_time'})}\n\n"
                
                # Simulate extra time (30 minutes)
                for minute in range(91, 121):
                    time.sleep(0.2)
                    yield f": keepalive\n\n"
                    yield f"data: {json.dumps({'type': 'time_update', 'minute': minute})}\n\n"
                    
                    # Higher goal chance in extra time
                    if random.random() < 0.04:
                        team1_rating = team1.get('rating', 50)
                        team2_rating = team2.get('rating', 50)
                        total_rating = team1_rating + team2_rating
                        team1_prob = team1_rating / total_rating
                        
                        if random.random() < team1_prob:
                            team1_goals += 1
                            attacking_players = [p for p in team1['players'] if p.get('naturalPosition') in ['AT', 'MD']]
                            scorer = random.choice(attacking_players)['name'] if attacking_players else random.choice(team1['players'])['name']
                            goal_scorers.append({'scorer': scorer, 'team': team1['country'], 'minute': minute})
                            
                            yield f"data: {json.dumps({'type': 'goal', 'minute': minute, 'scorer': scorer, 'team': team1['country'], 'team_id': 1, 'score': {'team1': team1_goals, 'team2': team2_goals}})}\n\n"
                            goal_commentary = f"GOAL in extra time! {scorer} scores for {team1['country']}! The score is now {team1_goals}-{team2_goals}!"
                            yield f"data: {json.dumps({'type': 'commentary', 'minute': minute, 'text': goal_commentary, 'commentary_type': 'goal'})}\n\n"
                        else:
                            team2_goals += 1
                            attacking_players = [p for p in team2['players'] if p.get('naturalPosition') in ['AT', 'MD']]
                            scorer = random.choice(attacking_players)['name'] if attacking_players else random.choice(team2['players'])['name']
                            goal_scorers.append({'scorer': scorer, 'team': team2['country'], 'minute': minute})
                            
                            yield f"data: {json.dumps({'type': 'goal', 'minute': minute, 'scorer': scorer, 'team': team2['country'], 'team_id': 2, 'score': {'team1': team1_goals, 'team2': team2_goals}})}\n\n"
                            goal_commentary = f"GOAL in extra time! {scorer} scores for {team2['country']}! The score is now {team1_goals}-{team2_goals}!"
                            yield f"data: {json.dumps({'type': 'commentary', 'minute': minute, 'text': goal_commentary, 'commentary_type': 'goal'})}\n\n"
                
                # Penalties if still tied
                if team1_goals == team2_goals:
                    penalties_commentary = f"Extra time ends {team1_goals}-{team2_goals}. We're going to penalties!"
                    yield f"data: {json.dumps({'type': 'commentary', 'minute': 120, 'text': penalties_commentary, 'commentary_type': 'penalties_start'})}\n\n"
                    
                    team1_penalties = 0
                    team2_penalties = 0
                    
                    # Simulate 5 penalties each
                    for i in range(5):
                        time.sleep(0.5)
                        if random.random() < 0.75:
                            team1_penalties += 1
                            yield f"data: {json.dumps({'type': 'penalty', 'team': team1['country'], 'scored': True, 'penalties': {'team1': team1_penalties, 'team2': team2_penalties}})}\n\n"
                        else:
                            yield f"data: {json.dumps({'type': 'penalty', 'team': team1['country'], 'scored': False, 'penalties': {'team1': team1_penalties, 'team2': team2_penalties}})}\n\n"
                        
                        time.sleep(0.5)
                        if random.random() < 0.75:
                            team2_penalties += 1
                            yield f"data: {json.dumps({'type': 'penalty', 'team': team2['country'], 'scored': True, 'penalties': {'team1': team1_penalties, 'team2': team2_penalties}})}\n\n"
                        else:
                            yield f"data: {json.dumps({'type': 'penalty', 'team': team2['country'], 'scored': False, 'penalties': {'team1': team1_penalties, 'team2': team2_penalties}})}\n\n"
                    
                    # Sudden death if tied
                    round_num = 6
                    while team1_penalties == team2_penalties:
                        time.sleep(0.5)
                        team1_scores = random.random() < 0.75
                        if team1_scores:
                            team1_penalties += 1
                        yield f"data: {json.dumps({'type': 'penalty', 'team': team1['country'], 'scored': team1_scores, 'penalties': {'team1': team1_penalties, 'team2': team2_penalties}, 'sudden_death': True})}\n\n"
                        
                        time.sleep(0.5)
                        team2_scores = random.random() < 0.75
                        if team2_scores:
                            team2_penalties += 1
                        yield f"data: {json.dumps({'type': 'penalty', 'team': team2['country'], 'scored': team2_scores, 'penalties': {'team1': team1_penalties, 'team2': team2_penalties}, 'sudden_death': True})}\n\n"
                        
                        round_num += 1
                        if round_num > 15:  # Safety limit
                            break
                    
                    penalties = {'team1': team1_penalties, 'team2': team2_penalties}
                    winner = team1 if team1_penalties > team2_penalties else team2
                    score_display = f"{team1_goals}-{team2_goals} ({team1_penalties}-{team2_penalties} pens)"
                else:
                    winner = team1 if team1_goals > team2_goals else team2
                    score_display = f"{team1_goals}-{team2_goals} (AET)"
            else:
                # Determine winner
                winner = None
                if team1_goals > team2_goals:
                    winner = team1
                elif team2_goals > team1_goals:
                    winner = team2
                score_display = f"{team1_goals}-{team2_goals}"
            
            # Send final result
            final_result = {
                'type': 'match_complete',
                'team1': team1,
                'team2': team2,
                'score': score_display,
                'team1_goals': team1_goals,
                'team2_goals': team2_goals,
                'winner': winner,
                'goal_scorers': goal_scorers,
                'penalties': penalties,
                'play_by_play': True
            }
            
            yield f"data: {json.dumps(final_result)}\n\n"
            
        except Exception as e:
            print(f"Error in live stream generator: {e}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return Response(
        generate_live_match(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',  # Disable buffering for nginx/proxy
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    )

@app.route('/api/matches/save-live-result', methods=['POST'])
def save_live_match_result():
    """Save live match result to database"""
    print("SAVE LIVE MATCH RESULT ENDPOINT CALLED")
    try:
        data = request.json
        print(f" Received live match data: {data}")
        
        team1 = data.get('team1', {})
        team2 = data.get('team2', {})
        team1_id = team1.get('id')
        team2_id = team2.get('id')
        match_type = data.get('match_type', 'quarterFinal')
        team1_goals = data.get('team1_goals', 0)
        team2_goals = data.get('team2_goals', 0)
        score_display = data.get('score', f"{team1_goals}-{team2_goals}")
        goal_scorers = data.get('goal_scorers', [])
        winner = data.get('winner')
        
        if not team1_id or not team2_id:
            return jsonify({'error': 'Both team IDs are required'}), 400
        
        if not db:
            return jsonify({'error': 'Database not available'}), 500
        
        print(f"🏟️  Saving live match: {team1.get('country')} {team1_goals} - {team2_goals} {team2.get('country')}")
        
        # Update bracket in database with match result
        tournament_doc = db.collection('tournament').document('current').get()
        if not tournament_doc.exists:
            return jsonify({'error': 'Tournament not found'}), 404
        
        bracket = tournament_doc.to_dict()
        
        # Update the appropriate match based on match_type
        updated = False
        if match_type == 'quarterFinal':
            # Find and update quarter final match
            for i, match in enumerate(bracket.get('quarterFinals', [])):
                match_team1 = match.get('team1', {})
                match_team2 = match.get('team2', {})
                if ((match_team1.get('id') == team1_id or match_team1.get('id') == team2_id) and
                    (match_team2.get('id') == team1_id or match_team2.get('id') == team2_id)):
                    bracket['quarterFinals'][i]['winner'] = winner
                    bracket['quarterFinals'][i]['score'] = score_display
                    bracket['quarterFinals'][i]['team1_goals'] = team1_goals
                    bracket['quarterFinals'][i]['team2_goals'] = team2_goals
                    bracket['quarterFinals'][i]['goal_scorers'] = goal_scorers
                    bracket['quarterFinals'][i]['commentary'] = ["Live match - commentary generated during broadcast"]
                    bracket['quarterFinals'][i]['play_by_play'] = True
                    updated = True
                    print(f"✅ Updated quarter final match {i}")
                    break
            
            # Auto-advance to semi-finals when each side's two quarter finals finish
            if updated:
                qfs = bracket.get('quarterFinals', [])
                # Left side: QF 0 vs QF 1
                if len(qfs) >= 2 and qfs[0].get('winner') and qfs[1].get('winner'):
                    left_sf = bracket.get('semiFinals', [{}, {}])[0] if bracket.get('semiFinals') else {}
                    bracket.setdefault('semiFinals', [{}, {}])
                    bracket['semiFinals'][0] = {
                        'team1': qfs[0]['winner'],
                        'team2': qfs[1]['winner'],
                        'winner': left_sf.get('winner'),
                        'score': left_sf.get('score'),
                        'goal_scorers': left_sf.get('goal_scorers', []),
                        'commentary': left_sf.get('commentary', []),
                        'team1_goals': left_sf.get('team1_goals'),
                        'team2_goals': left_sf.get('team2_goals'),
                        'play_by_play': left_sf.get('play_by_play', False)
                    }
                # Right side: QF 2 vs QF 3
                if len(qfs) >= 4 and qfs[2].get('winner') and qfs[3].get('winner'):
                    right_sf = bracket.get('semiFinals', [{}, {}])[1] if len(bracket.get('semiFinals', [])) > 1 else {}
                    bracket['semiFinals'][1] = {
                        'team1': qfs[2]['winner'],
                        'team2': qfs[3]['winner'],
                        'winner': right_sf.get('winner'),
                        'score': right_sf.get('score'),
                        'goal_scorers': right_sf.get('goal_scorers', []),
                        'commentary': right_sf.get('commentary', []),
                        'team1_goals': right_sf.get('team1_goals'),
                        'team2_goals': right_sf.get('team2_goals'),
                        'play_by_play': right_sf.get('play_by_play', False)
                    }
        
        elif match_type == 'semiFinal':
            # Find and update semi final match
            for i, match in enumerate(bracket.get('semiFinals', [])):
                match_team1 = match.get('team1', {})
                match_team2 = match.get('team2', {})
                if ((match_team1.get('id') == team1_id or match_team1.get('id') == team2_id) and
                    (match_team2.get('id') == team1_id or match_team2.get('id') == team2_id)):
                    bracket['semiFinals'][i]['winner'] = winner
                    bracket['semiFinals'][i]['score'] = score_display
                    bracket['semiFinals'][i]['team1_goals'] = team1_goals
                    bracket['semiFinals'][i]['team2_goals'] = team2_goals
                    bracket['semiFinals'][i]['goal_scorers'] = goal_scorers
                    bracket['semiFinals'][i]['commentary'] = ["Live match - commentary generated during broadcast"]
                    bracket['semiFinals'][i]['play_by_play'] = True
                    updated = True
                    print(f"✅ Updated semi final match {i}")
                    break
            
            # Auto-advance to final if both semi finals are complete
            if updated:
                sf_complete = all(m.get('winner') for m in bracket.get('semiFinals', []))
                if sf_complete and not bracket.get('final', {}).get('team1'):
                    # Advance winners to final
                    winners = [m['winner'] for m in bracket['semiFinals'] if m.get('winner')]
                    if len(winners) >= 2:
                        bracket['final'] = {
                            'team1': winners[0],
                            'team2': winners[1],
                            'winner': None,
                            'score': None,
                            'goal_scorers': [],
                            'commentary': []
                        }
        
        elif match_type == 'final':
            # Update final match
            final_match = bracket.get('final', {})
            match_team1 = final_match.get('team1', {})
            match_team2 = final_match.get('team2', {})
            if ((match_team1.get('id') == team1_id or match_team1.get('id') == team2_id) and
                (match_team2.get('id') == team1_id or match_team2.get('id') == team2_id)):
                bracket['final']['winner'] = winner
                bracket['final']['score'] = score_display
                bracket['final']['team1_goals'] = team1_goals
                bracket['final']['team2_goals'] = team2_goals
                bracket['final']['goal_scorers'] = goal_scorers
                bracket['final']['commentary'] = ["Live match - commentary generated during broadcast"]
                bracket['final']['play_by_play'] = True
                updated = True
                print(f"Updated final match")
                # Mark tournament as completed
                bracket['status'] = 'completed'
        
        # Save updated bracket
        if updated:
            db.collection('tournament').document('current').set(bracket)
            print(f"Bracket saved successfully")
            return jsonify({'message': 'Live match result saved successfully', 'bracket': bracket}), 200
        else:
            return jsonify({'error': 'Match not found in bracket'}), 404
            
    except Exception as e:
        print(f"Error in save_live_match_result: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/matches/simulate', methods=['POST'])
def simulate_match():
    """Simulate a match without detailed commentary"""
    print("⚡ SIMULATE MATCH ENDPOINT CALLED - NO COMMENTARY")
    return simulate_match_internal(play_by_play=False)

def simulate_match_internal(play_by_play=False):
    """Internal function to simulate matches with or without commentary"""
    try:
        data = request.json
        print(f"Received request: {data}")
        print(f"Play by play mode: {play_by_play}")
        
        team1_id = data.get('team1_id')
        team2_id = data.get('team2_id')
        match_type = data.get('match_type', 'quarterFinal')
        
        if not team1_id or not team2_id:
            return jsonify({'error': 'Both team IDs are required'}), 400
        
        if not db:
            return jsonify({'error': 'Database not available'}), 500
        
        # Get team data
        team1_doc = db.collection('teams').document(team1_id).get()
        team2_doc = db.collection('teams').document(team2_id).get()
        
        if not team1_doc.exists or not team2_doc.exists:
            return jsonify({'error': 'One or both teams not found'}), 404
        
        team1 = team1_doc.to_dict()
        team2 = team2_doc.to_dict()
        team1['id'] = team1_id
        team2['id'] = team2_id
        
        print(f"Match: {team1['country']} vs {team2['country']}")
        print(f"Commentary requested: {play_by_play}")
        
        # Simulate match based on team ratings
        team1_rating = team1.get('rating', 50)
        team2_rating = team2.get('rating', 50)
        
        # Calculate win probabilities
        total_rating = team1_rating + team2_rating
        team1_prob = team1_rating / total_rating
        
        # Enhanced match simulation
        team1_goals = 0
        team2_goals = 0
        goal_scorers = []
        
        # Normal time simulation (90 minutes)
        for minute in range(1, 91):
            if random.random() < 0.015:  # 1.5% chance of goal per minute
                if random.random() < team1_prob:
                    team1_goals += 1
                    # Prefer attacking and midfield players as scorers
                    attacking_players = [p for p in team1['players'] if p['naturalPosition'] in ['AT', 'MD']]
                    scorer = random.choice(attacking_players)['name'] if attacking_players else random.choice(team1['players'])['name']
                    goal_scorers.append({
                        'scorer': scorer,
                        'team': team1['country'],
                        'minute': minute
                    })
                else:
                    team2_goals += 1
                    attacking_players = [p for p in team2['players'] if p['naturalPosition'] in ['AT', 'MD']]
                    scorer = random.choice(attacking_players)['name'] if attacking_players else random.choice(team2['players'])['name']
                    goal_scorers.append({
                        'scorer': scorer,
                        'team': team2['country'],
                        'minute': minute
                    })
        
        # Extra time if draw in knockout stages
        extra_time_goals = 0
        penalties = None
        
        if team1_goals == team2_goals and match_type != 'group':
            # Extra time (30 minutes)
            for minute in range(91, 121):
                if random.random() < 0.02:  # Higher chance in extra time
                    if random.random() < team1_prob:
                        team1_goals += 1
                        extra_time_goals += 1
                        attacking_players = [p for p in team1['players'] if p['naturalPosition'] in ['AT', 'MD']]
                        scorer = random.choice(attacking_players)['name'] if attacking_players else random.choice(team1['players'])['name']
                        goal_scorers.append({
                            'scorer': scorer,
                            'team': team1['country'],
                            'minute': minute
                        })
                    else:
                        team2_goals += 1
                        extra_time_goals += 1
                        attacking_players = [p for p in team2['players'] if p['naturalPosition'] in ['AT', 'MD']]
                        scorer = random.choice(attacking_players)['name'] if attacking_players else random.choice(team2['players'])['name']
                        goal_scorers.append({
                            'scorer': scorer,
                            'team': team2['country'],
                            'minute': minute
                        })
            
            # Penalties if still draw
            if team1_goals == team2_goals:
                team1_penalties = 0
                team2_penalties = 0
                
                # Simulate penalty shootout (5 penalties each)
                for i in range(5):
                    if random.random() < 0.75:  # 75% chance to score penalty
                        team1_penalties += 1
                    if random.random() < 0.75:
                        team2_penalties += 1
                
                # Sudden death if still tied
                while team1_penalties == team2_penalties:
                    if random.random() < 0.75:
                        team1_penalties += 1
                    if random.random() < 0.75:
                        team2_penalties += 1
                    # Stop when one team misses and the other scores
                    if team1_penalties != team2_penalties:
                        break
                
                penalties = {
                    'team1': team1_penalties,
                    'team2': team2_penalties
                }
                
                if team1_penalties > team2_penalties:
                    winner = team1
                    score_display = f"{team1_goals}-{team2_goals} ({team1_penalties}-{team2_penalties} pens)"
                else:
                    winner = team2
                    score_display = f"{team1_goals}-{team2_goals} ({team1_penalties}-{team2_penalties} pens)"
            else:
                winner = team1 if team1_goals > team2_goals else team2
                score_display = f"{team1_goals}-{team2_goals} (AET)"
        else:
            winner = team1 if team1_goals > team2_goals else team2 if team2_goals > team1_goals else None
            score_display = f"{team1_goals}-{team2_goals}"
        
        # Generate commentary based on play_by_play flag
        commentary = []
        if play_by_play:
            print("GENERATING AI COMMENTARY - Play by play mode is ON")
            commentary = generate_ai_commentary(team1, team2, team1_goals, team2_goals, goal_scorers)
            print(f"COMMENTARY RESULT: {len(commentary)} lines generated")
        else:
            print("SKIPPING COMMENTARY - Play by play mode is OFF")
            commentary = ["Match was simulated - no commentary available"]
        
        match_result = {
            'team1': team1,
            'team2': team2,
            'score': score_display,
            'team1_goals': team1_goals,
            'team2_goals': team2_goals,
            'winner': winner,
            'goal_scorers': goal_scorers,
            'commentary': commentary,
            'simulated_at': datetime.now().isoformat(),
            'match_type': match_type,
            'penalties': penalties,
            'play_by_play': play_by_play
        }
        
        # Update bracket in database with match result
        if db:
            try:
                tournament_doc = db.collection('tournament').document('current').get()
                if tournament_doc.exists:
                    bracket = tournament_doc.to_dict()
                    
                    # Update the appropriate match based on match_type
                    updated = False
                    if match_type == 'quarterFinal':
                        # Find and update quarter final match
                        for i, match in enumerate(bracket.get('quarterFinals', [])):
                            match_team1 = match.get('team1', {})
                            match_team2 = match.get('team2', {})
                            if ((match_team1.get('id') == team1_id or match_team1.get('id') == team2_id) and
                                (match_team2.get('id') == team1_id or match_team2.get('id') == team2_id)):
                                bracket['quarterFinals'][i]['winner'] = winner
                                bracket['quarterFinals'][i]['score'] = score_display
                                bracket['quarterFinals'][i]['team1_goals'] = team1_goals
                                bracket['quarterFinals'][i]['team2_goals'] = team2_goals
                                bracket['quarterFinals'][i]['goal_scorers'] = goal_scorers
                                bracket['quarterFinals'][i]['commentary'] = commentary
                                bracket['quarterFinals'][i]['play_by_play'] = play_by_play
                                updated = True
                                break
                        
                        # Auto-advance to semi-finals when each side's two quarter finals finish
                        if updated:
                            qfs = bracket.get('quarterFinals', [])
                            # Left side: QF 0 vs QF 1
                            if len(qfs) >= 2 and qfs[0].get('winner') and qfs[1].get('winner'):
                                left_sf = bracket.get('semiFinals', [{}, {}])[0]
                                bracket['semiFinals'][0] = {
                                    'team1': qfs[0]['winner'],
                                    'team2': qfs[1]['winner'],
                                    'winner': left_sf.get('winner'),
                                    'score': left_sf.get('score'),
                                    'goal_scorers': left_sf.get('goal_scorers', []),
                                    'commentary': left_sf.get('commentary', []),
                                    'team1_goals': left_sf.get('team1_goals'),
                                    'team2_goals': left_sf.get('team2_goals'),
                                    'play_by_play': left_sf.get('play_by_play', False)
                                }
                            # Right side: QF 2 vs QF 3
                            if len(qfs) >= 4 and qfs[2].get('winner') and qfs[3].get('winner'):
                                right_sf = bracket.get('semiFinals', [{}, {}])[1]
                                bracket['semiFinals'][1] = {
                                    'team1': qfs[2]['winner'],
                                    'team2': qfs[3]['winner'],
                                    'winner': right_sf.get('winner'),
                                    'score': right_sf.get('score'),
                                    'goal_scorers': right_sf.get('goal_scorers', []),
                                    'commentary': right_sf.get('commentary', []),
                                    'team1_goals': right_sf.get('team1_goals'),
                                    'team2_goals': right_sf.get('team2_goals'),
                                    'play_by_play': right_sf.get('play_by_play', False)
                                }
                    
                    elif match_type == 'semiFinal':
                        # Find and update semi final match
                        for i, match in enumerate(bracket.get('semiFinals', [])):
                            match_team1 = match.get('team1', {})
                            match_team2 = match.get('team2', {})
                            if ((match_team1.get('id') == team1_id or match_team1.get('id') == team2_id) and
                                (match_team2.get('id') == team1_id or match_team2.get('id') == team2_id)):
                                bracket['semiFinals'][i]['winner'] = winner
                                bracket['semiFinals'][i]['score'] = score_display
                                bracket['semiFinals'][i]['team1_goals'] = team1_goals
                                bracket['semiFinals'][i]['team2_goals'] = team2_goals
                                bracket['semiFinals'][i]['goal_scorers'] = goal_scorers
                                bracket['semiFinals'][i]['commentary'] = commentary
                                bracket['semiFinals'][i]['play_by_play'] = play_by_play
                                updated = True
                                break
                        
                        # Auto-advance to final if both semi finals are complete
                        if updated:
                            sf_complete = all(m.get('winner') for m in bracket.get('semiFinals', []))
                            if sf_complete and not bracket.get('final', {}).get('team1'):
                                # Advance winners to final
                                winners = [m['winner'] for m in bracket['semiFinals'] if m.get('winner')]
                                if len(winners) >= 2:
                                    bracket['final'] = {
                                        'team1': winners[0],
                                        'team2': winners[1],
                                        'winner': None,
                                        'score': None,
                                        'goal_scorers': [],
                                        'commentary': []
                                    }
                    
                    elif match_type == 'final':
                        # Update final match
                        final_match = bracket.get('final', {})
                        match_team1 = final_match.get('team1', {})
                        match_team2 = final_match.get('team2', {})
                        if ((match_team1.get('id') == team1_id or match_team1.get('id') == team2_id) and
                            (match_team2.get('id') == team1_id or match_team2.get('id') == team2_id)):
                            bracket['final']['winner'] = winner
                            bracket['final']['score'] = score_display
                            bracket['final']['team1_goals'] = team1_goals
                            bracket['final']['team2_goals'] = team2_goals
                            bracket['final']['goal_scorers'] = goal_scorers
                            bracket['final']['commentary'] = commentary
                            bracket['final']['play_by_play'] = play_by_play
                            updated = True
                            # Mark tournament as completed
                            bracket['status'] = 'completed'
                    
                    # Save updated bracket
                    if updated:
                        db.collection('tournament').document('current').set(bracket)
                    
            except Exception as e:
                print(f"Error updating bracket: {e}")
        
        # Send email notifications (only if configured)
        if EMAIL_USER and EMAIL_PASSWORD:
            try:
                email_subject = f"Match Result: {team1['country']} vs {team2['country']}"
                email_body = f"""
Match Result: {team1['country']} vs {team2['country']}
Final Score: {score_display}

Goal Scorers:
"""
                for goal in goal_scorers:
                    email_body += f"- {goal['scorer']} ({goal['team']}) - {goal['minute']}'\n"
                
                if penalties:
                    email_body += f"\nPenalty Shootout: {penalties['team1']}-{penalties['team2']}"
                
                if winner:
                    email_body += f"\nWinner: {winner['country']}"
                else:
                    email_body += "\nMatch ended in a draw"
                
                email_body += "\n\nThank you for participating in the African Nations League!"
                
                # Send to both team representatives
                send_email(team1.get('email', ''), email_subject, email_body)
                send_email(team2.get('email', ''), email_subject, email_body)
            except Exception as e:
                print(f"Email notification error: {e}")
        else:
            print("Email not configured - skipping email notifications")
        
        print(f"Match simulation completed: {score_display}")
        return jsonify({'match_result': match_result}), 200
        
    except Exception as e:
        print(f"Error in simulate_match_internal: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tournament/reset', methods=['POST'])
def reset_tournament():
    """Reset tournament to quarter-finals"""
    try:
        if not db:
            return jsonify({'message': 'Database not available, tournament reset locally'}), 200
        
        # Delete current tournament
        try:
            db.collection('tournament').document('current').delete()
        except:
            pass
        
        # Reset all teams status
        try:
            teams = db.collection('teams').stream()
            for team_doc in teams:
                db.collection('teams').document(team_doc.id).update({'status': 'registered'})
        except Exception as e:
            print(f"Error resetting teams: {e}")
        
        return jsonify({'message': 'Tournament reset successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/goal-scorers', methods=['GET'])
def get_goal_scorers():
    """Get goal scorers ranking"""
    try:
        if not db:
            return jsonify({'goal_scorers': []}), 200
        
        # Get all matches and compile goal scorers
        goal_scorers_dict = {}
        
        # Check if we have tournament data
        tournament_doc = db.collection('tournament').document('current').get()
        if tournament_doc.exists:
            bracket = tournament_doc.to_dict()
            
            # Function to process matches and extract goal scorers
            def process_matches(matches):
                for match in matches:
                    if match.get('goal_scorers'):
                        for goal in match['goal_scorers']:
                            scorer = goal['scorer']
                            if scorer not in goal_scorers_dict:
                                goal_scorers_dict[scorer] = {
                                    'name': scorer,
                                    'goals': 0,
                                    'team': goal['team']
                                }
                            goal_scorers_dict[scorer]['goals'] += 1
            
            # Process all rounds
            if 'quarterFinals' in bracket:
                process_matches(bracket['quarterFinals'])
            if 'semiFinals' in bracket:
                process_matches(bracket['semiFinals'])
            if 'final' in bracket:
                if bracket['final'].get('goal_scorers'):
                    process_matches([bracket['final']])
        
        # Convert to sorted list
        scorers_list = sorted(goal_scorers_dict.values(), key=lambda x: x['goals'], reverse=True)
        
        return jsonify({'goal_scorers': scorers_list}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/matches/history', methods=['GET'])
def get_match_history():
    """Get all match history"""
    try:
        if not db:
            return jsonify({'matches': []}), 200
        
        matches = []
        tournament_doc = db.collection('tournament').document('current').get()
        if tournament_doc.exists:
            bracket = tournament_doc.to_dict()
            
            # Extract matches from all rounds
            if 'quarterFinals' in bracket:
                for match in bracket['quarterFinals']:
                    if match.get('score'):
                        matches.append({
                            'round': 'Quarter Final',
                            'team1': match.get('team1', {}).get('country', 'Unknown'),
                            'team2': match.get('team2', {}).get('country', 'Unknown'),
                            'score': match.get('score', 'N/A'),
                            'winner': match.get('winner', {}).get('country', 'Draw') if match.get('winner') else 'Draw',
                            'play_by_play': match.get('play_by_play', False),
                            'commentary': match.get('commentary', [])
                        })
            
            if 'semiFinals' in bracket:
                for match in bracket['semiFinals']:
                    if match.get('score'):
                        matches.append({
                            'round': 'Semi Final',
                            'team1': match.get('team1', {}).get('country', 'Unknown'),
                            'team2': match.get('team2', {}).get('country', 'Unknown'),
                            'score': match.get('score', 'N/A'),
                            'winner': match.get('winner', {}).get('country', 'Draw') if match.get('winner') else 'Draw',
                            'play_by_play': match.get('play_by_play', False),
                            'commentary': match.get('commentary', [])
                        })
            
            if 'final' in bracket and bracket['final'].get('score'):
                final = bracket['final']
                matches.append({
                    'round': 'Final',
                    'team1': final.get('team1', {}).get('country', 'Unknown'),
                    'team2': final.get('team2', {}).get('country', 'Unknown'),
                    'score': final.get('score', 'N/A'),
                    'winner': final.get('winner', {}).get('country', 'Draw') if final.get('winner') else 'Draw',
                    'play_by_play': final.get('play_by_play', False),
                    'commentary': final.get('commentary', [])
                })
        
        return jsonify({'matches': matches}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/teams/<team_id>/analytics', methods=['GET'])
def get_team_analytics(team_id):
    """Get team performance analytics"""
    try:
        if not db:
            return jsonify({'analytics': {}}), 200
        
        # Get team data
        team_doc = db.collection('teams').document(team_id).get()
        if not team_doc.exists:
            return jsonify({'error': 'Team not found'}), 404
        
        team = team_doc.to_dict()
        team_name = team.get('country', 'Unknown')
        
        # Initialize analytics
        analytics = {
            'team_name': team_name,
            'matches_played': 0,
            'wins': 0,
            'losses': 0,
            'draws': 0,
            'goals_scored': 0,
            'goals_conceded': 0
        }
        
        # Calculate analytics from tournament data
        tournament_doc = db.collection('tournament').document('current').get()
        if tournament_doc.exists:
            bracket = tournament_doc.to_dict()
            
            def process_matches(matches):
                for match in matches:
                    if match.get('score'):
                        team1 = match.get('team1', {})
                        team2 = match.get('team2', {})
                        
                        # Check if our team is in this match
                        if team1.get('id') == team_id or team2.get('id') == team_id:
                            analytics['matches_played'] += 1
                            
                            team1_goals = match.get('team1_goals', 0)
                            team2_goals = match.get('team2_goals', 0)
                            
                            if team1.get('id') == team_id:
                                analytics['goals_scored'] += team1_goals
                                analytics['goals_conceded'] += team2_goals
                                
                                if team1_goals > team2_goals:
                                    analytics['wins'] += 1
                                elif team1_goals < team2_goals:
                                    analytics['losses'] += 1
                                else:
                                    analytics['draws'] += 1
                            else:
                                analytics['goals_scored'] += team2_goals
                                analytics['goals_conceded'] += team1_goals
                                
                                if team2_goals > team1_goals:
                                    analytics['wins'] += 1
                                elif team2_goals < team1_goals:
                                    analytics['losses'] += 1
                                else:
                                    analytics['draws'] += 1
            
            # Process all rounds
            if 'quarterFinals' in bracket:
                process_matches(bracket['quarterFinals'])
            if 'semiFinals' in bracket:
                process_matches(bracket['semiFinals'])
            if 'final' in bracket and bracket['final'].get('score'):
                process_matches([bracket['final']])
        
        return jsonify({'analytics': analytics}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/debug/gemini', methods=['GET'])
def debug_gemini():
    """Debug endpoint to test Gemini API"""
    try:
        if not gemini_model:
            return jsonify({
                'status': 'error',
                'message': 'Gemini model not configured',
                'gemini_available': False,
                'api_key_set': bool(GEMINI_API_KEY)
            }), 200
        
        # Test with a simple prompt
        test_prompt = "Say 'Gemini is working' in an excited football commentator style."
        response = gemini_model.generate_content(test_prompt)
        
        return jsonify({
            'status': 'success',
            'message': 'Gemini API is working',
            'gemini_available': True,
            'api_key_set': bool(GEMINI_API_KEY),
            'test_response': response.text
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Gemini API error: {str(e)}',
            'gemini_available': False,
            'api_key_set': bool(GEMINI_API_KEY)
        }), 200

if __name__ == '__main__':
    # Validate required environment variables
    required_env_vars = ['GEMINI_API_KEY']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        print(f"Warning: Missing environment variables: {missing_vars}")
    
    print("Starting African Nations League API Server...")
    print(f"Gemini AI Available: {gemini_model is not None}")
    print(f"Email Notifications: {bool(EMAIL_USER and EMAIL_PASSWORD)}")
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)