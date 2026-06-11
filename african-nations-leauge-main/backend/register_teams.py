#!/usr/bin/env python3
"""
Quick script to register tournament teams for testing
"""

import requests
import json

# Base URL of the API
BASE_URL = "http://localhost:5000/api"

# Teams to register
teams_data = [
    {
        "country": "Nigeria",
        "manager": "Ahmed Hassan",
        "representative": "Bola Johnson",
        "email": "nigeria@afcon.com"
    },
    {
        "country": "Egypt",
        "manager": "Mohamed Ali",
        "representative": "Omar Hassan",
        "email": "egypt@afcon.com"
    },
    {
        "country": "Ghana",
        "manager": "Kwame Mensah",
        "representative": "Kofi Asante",
        "email": "ghana@afcon.com"
    },
    {
        "country": "Senegal",
        "manager": "Aliou Cissé",
        "representative": "Moussa Sow",
        "email": "senegal@afcon.com"
    },
    {
        "country": "Cameroon",
        "manager": "Rigobert Song",
        "representative": "Samuel Eto'o",
        "email": "cameroon@afcon.com"
    },
    {
        "country": "Morocco",
        "manager": "Walid Regragui",
        "representative": "Fouzi Lekjaa",
        "email": "morocco@afcon.com"
    },
    {
        "country": "South Africa",
        "manager": "Hugo Broos",
        "representative": "Sefako Nyathi",
        "email": "southafrica@afcon.com"
    },
    {
        "country": "Côte d'Ivoire",
        "manager": "Jean-Louis Gasset",
        "representative": "Yacine Idriss Diallo",
        "email": "cotedivoire@afcon.com"
    }
]

def create_random_squad():
    """Create a random squad of 23 players"""
    positions = ['GK', 'GK', 'GK', 'DF', 'DF', 'DF', 'DF', 'DF', 'DF', 'DF', 'MD', 'MD', 'MD', 'MD', 'MD', 'MD', 'MD', 'AT', 'AT', 'AT', 'AT', 'AT', 'AT']
    players = []
    for i, pos in enumerate(positions):
        players.append({
            "name": f"Player {i+1}",
            "naturalPosition": pos,
            "isCaptain": i == 0  # First player is captain
        })
    return players

def register_teams():
    """Register all teams"""
    for team in teams_data:
        try:
            team["players"] = create_random_squad()
            response = requests.post(f"{BASE_URL}/teams", json=team, timeout=10)
            response.raise_for_status()
            data = response.json()
            status = "✅ SUCCESS" if data.get('success') else "❌ FAILED"
            print(f"{status} - {team['country']}: {data.get('message', 'Registered')}")
        except Exception as e:
            print(f"❌ ERROR - {team['country']}: {str(e)}")

def start_tournament():
    """Start the tournament"""
    try:
        response = requests.post(f"{BASE_URL}/tournament/start", timeout=10)
        response.raise_for_status()
        data = response.json()
        if data.get('success'):
            print(f"✅ Tournament started successfully")
        else:
            print(f"❌ Tournament start failed: {data.get('message')}")
    except Exception as e:
        print(f"❌ ERROR starting tournament: {str(e)}")

if __name__ == "__main__":
    print("🏟️  Registering teams for African Nations League tournament...")
    print("-" * 60)
    register_teams()
    print("-" * 60)
    print("🏁 Starting tournament...")
    start_tournament()
    print("✅ Setup complete!")
