"""
User session management for WhatsApp chatbot
"""

# Global storage for user sessions
user_sessions = {}

def init_session(user_id):
    """Initialize a new user session if it doesn't exist"""
    if user_id not in user_sessions:
        user_sessions[user_id] = {
            'state': 'initial',
            'selected_option': None,
            'auth': {
                'is_authenticated': False,
                'user_id': None,
                'token': None,
                'email': None
            },
            'chat_history': []  # Add chat history tracking for Gemini
        }
    return user_sessions[user_id]

def get_session(user_id):
    """Get a user's session data"""
    # Create if it doesn't exist
    return init_session(user_id)

def update_session(user_id, state=None, selected_option=None):
    """Update a user's session data"""
    session = init_session(user_id)
    
    if state is not None:
        session['state'] = state
    
    if selected_option is not None:
        session['selected_option'] = selected_option
    
    return session

def reset_session(user_id):
    """Reset a user's session to initial state but preserve auth data"""
    auth_data = user_sessions.get(user_id, {}).get('auth', {})
    chat_history = user_sessions.get(user_id, {}).get('chat_history', [])
    
    user_sessions[user_id] = {
        'state': 'initial',
        'selected_option': None,
        'auth': auth_data,
        'chat_history': chat_history  # Preserve chat history when resetting session
    }
    return user_sessions[user_id]

def get_user_state(user_id):
    """Get the current state for a user"""
    session = get_session(user_id)
    return session['state']

def get_selected_option(user_id):
    """Get the selected option for a user"""
    session = get_session(user_id)
    return session['selected_option']

def set_authenticated(user_id, user_data):
    """Set a user as authenticated with their user data"""
    session = get_session(user_id)
    session['auth'] = {
        'is_authenticated': True,
        'user_id': user_data.get('id'),
        'token': user_data.get('token'),
        'email': user_data.get('email')
    }
    return session

def is_authenticated(user_id):
    """Check if a user is authenticated"""
    session = get_session(user_id)
    return session['auth'].get('is_authenticated', False)

def get_user_id(user_id):
    """Get the database user ID for a WhatsApp user"""
    session = get_session(user_id)
    return session['auth'].get('user_id')

def get_auth_token(user_id):
    """Get the authentication token for a user"""
    session = get_session(user_id)
    return session['auth'].get('token')

def logout(user_id):
    """Clear authentication for a user"""
    session = get_session(user_id)
    session['auth'] = {
        'is_authenticated': False,
        'user_id': None,
        'token': None,
        'email': None
    }
    return session

def check_auth_required(user_id):
    """Check if user is authenticated and return appropriate message if not"""
    if not is_authenticated(user_id):
        return {
            'authenticated': False,
            'message': "🔒 *Authentication Required*\n\nYou need to log in to use this service. Please use the login option below."
        }
    return {
        'authenticated': True
    }

def get_user_email(user_id):
    """Get the email of the authenticated user"""
    session = get_session(user_id)
    return session['auth'].get('email')

# New functions for chat history management
def add_to_chat_history(user_id, role, content):
    """Add a message to the user's chat history"""
    session = get_session(user_id)
    
    # Initialize chat_history if not present (for backward compatibility)
    if 'chat_history' not in session:
        session['chat_history'] = []
    
    # Add the message to chat history
    session['chat_history'].append({
        'role': role,  # 'user' or 'assistant'
        'content': content
    })
    
    # Keep only the last 10 messages to prevent unlimited growth
    if len(session['chat_history']) > 10:
        session['chat_history'] = session['chat_history'][-10:]
    
    return session

def get_chat_history(user_id):
    """Get the current chat history for a user"""
    session = get_session(user_id)
    
    # Initialize chat_history if not present (for backward compatibility)
    if 'chat_history' not in session:
        session['chat_history'] = []
    
    return session['chat_history']

def clear_chat_history(user_id):
    """Clear the chat history for a user"""
    session = get_session(user_id)
    session['chat_history'] = []
    return session