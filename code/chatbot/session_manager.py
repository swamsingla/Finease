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
            'selected_option': None
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
    """Reset a user's session to initial state"""
    user_sessions[user_id] = {
        'state': 'initial',
        'selected_option': None
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