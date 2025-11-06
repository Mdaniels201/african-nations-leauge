#!/usr/bin/env python3
"""
Setup script for African Nations League Platform
This script helps you configure the application with Google Gemini AI
"""

import os
import sys

def check_requirements():
    """Check if required packages are installed"""
    try:
        import google.generativeai
        print("Google Generative AI package is installed")
        return True
    except ImportError:
        print("Google Generative AI package not found")
        print("Run: pip install google-generativeai")
        return False

def setup_gemini():
    """Help user set up Gemini API key"""
    print("\n🤖 Google Gemini AI Setup")
    print("=" * 40)
    
    api_key = input("Enter your Gemini API key (or press Enter to skip): ").strip()
    
    if api_key:
        # Create .env file
        env_content = f"""# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google Gemini Configuration
GEMINI_API_KEY={api_key}

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
"""
        
        with open('.env', 'w') as f:
            f.write(env_content)
        
        print(".env file created with your Gemini API key")
        print("Don't forget to configure your email and Firebase settings!")
    else:
        print("Skipping Gemini setup - commentary will use template system")

def main():
    print("African Nations League Platform Setup")
    print("=" * 50)
    
    # Check requirements
    if not check_requirements():
        print("\nPlease install required packages first:")
        print("pip install -r requirements.txt")
        return
    
    # Setup Gemini
    setup_gemini()
    
    print("\nSetup complete!")
    print("\nNext steps:")
    print("1. Configure Firebase credentials in backend/firebase-credentials.json")
    print("2. Set up email configuration in .env file")
    print("3. Run: python backend/app.py")
    print("4. Run: npm start")
    print("\nFor detailed instructions, see README.md")

if __name__ == "__main__":
    main()
