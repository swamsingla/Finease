import os
import requests
import base64
from config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER, BACKEND_URL

def get_file_extension(content_type):
    """Get file extension based on content type"""
    extensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'application/pdf': 'pdf',
        'text/plain': 'txt'
    }
    
    return extensions.get(content_type, 'bin')

def download_media(media_url, file_path):
    """Download media from Twilio with authentication"""
    try:
        # Use authentication for Twilio media
        response = requests.get(
            media_url, 
            auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN), 
            stream=True
        )
        response.raise_for_status()  # Raises an error for bad responses
        
        # Make sure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        
        print(f"Downloaded file: {file_path}")
        return True
    except Exception as e:
        print(f"Error downloading media: {e}")
        return False

def save_to_database(file_path, user_id, original_name, mime_type, document_type, classification, extracted_data, whatsapp_number):
    """Save file to database instead of local storage"""
    try:
        # Read file data and convert to base64
        with open(file_path, 'rb') as f:
            file_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Prepare data for API request
        payload = {
            'userId': user_id,
            'originalName': original_name,
            'mimeType': mime_type,
            'fileData': file_data,
            'documentType': document_type,
            'classification': classification,
            'extractedData': extracted_data,
            'size': file_size,
            'whatsappNumber': whatsapp_number
        }
        
        # Send request to backend API
        response = requests.post(
            f"{BACKEND_URL}/api/files/save",
            json=payload
        )
        
        if response.status_code == 201:
            print(f"File saved to database successfully: {response.json().get('fileId')}")
            # Optionally, delete the local file after saving to database
            os.remove(file_path)
            return True
        else:
            print(f"Error saving file to database: {response.status_code}, {response.text}")
            return False
    except Exception as e:
        print(f"Error saving file to database: {e}")
        return False

def authenticate_user(email, password, whatsapp_number):
    """Authenticate a user with the backend"""
    try:
        payload = {
            'email': email,
            'password': password,
            'whatsappNumber': whatsapp_number
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/files/authenticate-whatsapp",
            json=payload
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Authentication error: {response.status_code}, {response.text}")
            return None
    except Exception as e:
        print(f"Authentication error: {e}")
        return None

def send_whatsapp_message(to_number, message_body, media_url=None):
    """Send a WhatsApp message with optional media attachment"""
    # This function requires Twilio client from the calling code
    from twilio.rest import Client
    
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    
    # Clean the phone number - remove "whatsapp:" prefix if present
    if to_number.startswith('whatsapp:'):
        clean_number = to_number
    else:
        clean_number = f"whatsapp:{to_number}"
    
    params = {
        'from_': f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
        'body': message_body,
        'to': clean_number
    }
    
    # Add media URL if provided
    if media_url:
        params['media_url'] = [media_url]
    
    message = client.messages.create(**params)
    return message.sid

def format_menu():
    """Create a well-formatted menu with emojis and numbers"""
    from config import MENU_OPTIONS
    
    menu_text = "📋 *Welcome to our Document Filing Service!*\n\n"
    menu_text += "Please select an option by typing the number:\n\n"
    
    for key, option in MENU_OPTIONS.items():
        menu_text += f"*{key}*. {option['emoji']} {option['name']}\n   _{option['description']}_\n\n"
    
    menu_text += f"Reply with the option number (1-{len(MENU_OPTIONS)}) to continue."
    
    
    return menu_text

def format_auth_menu():
    """Create a well-formatted authentication menu with instructions"""
    menu_text = "🔑 *User Authentication*\n\n"
    menu_text += "To link your WhatsApp with your account, please send your login details in this format:\n\n"
    menu_text += "```\nlogin:your_email@example.com:your_password\n```\n\n"
    menu_text += "For example: `login:john@example.com:password123`\n\n"
    menu_text += "Your credentials will be used only to link your WhatsApp number with your account."
    
    return menu_text

def format_welcome_message(user_email):
    """Format a welcome message for authenticated users"""
    welcome_text = f"👋 *Welcome, {user_email}!*\n\n"
    welcome_text += "You are now logged in to our document filing service. You can use all features of our chatbot.\n\n"
    welcome_text += "To log out at any time, simply type 'logout'."
    
    return welcome_text
