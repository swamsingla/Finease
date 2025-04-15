"""
Gemini AI integration for WhatsApp chatbot
"""
import os
import logging
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Gemini API
def init_gemini(api_key):
    """Initialize Gemini API with the provided API key"""
    try:
        genai.configure(api_key=api_key)
        logger.info("Gemini API initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Gemini API: {e}")
        return False

def get_gemini_models():
    """List available Gemini models"""
    try:
        models = genai.list_models()
        models_list = [model.name for model in models if "gemini" in model.name.lower()]
        logger.info(f"Available Gemini models: {models_list}")
        return models_list
    except Exception as e:
        logger.error(f"Error retrieving Gemini models: {e}")
        return []

def get_response_for_text(prompt, model_name="models/gemini-2.0-flash"):
    """Get Gemini AI response for a text prompt"""
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error generating Gemini response: {e}")
        return f"Error: Unable to process request with Gemini AI. {str(e)}"

def analyze_document_content(document_text, document_type):
    """Analyze document content and extract key information"""
    try:
        prompt = f"""
        Analyze this {document_type} document and extract key information:
        
        {document_text}
        
        Focus on extracting:
        1. Names, dates, and numeric values
        2. Key information specific to {document_type} documents
        3. Any potential issues or missing information in the document
        
        Format your response in clear sections.
        """
        
        model = genai.GenerativeModel("models/gemini-2.0-flash")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error analyzing document with Gemini: {e}")
        return f"Error analyzing document: {str(e)}"

def get_chat_response(user_message, chat_history=None, is_authenticated=False):
    """Get a conversational response from Gemini"""
    try:
        # Create a chat instance
        model = genai.GenerativeModel("models/gemini-2.0-flash")
        
        # Build the system prompt based on authentication status
        system_prompt = """
        You are FinEase Assistant, a helpful financial document processing assistant.
        Your job is to help users with questions about GST, ITR, and EPF filing.
        Be concise, knowledgeable and professional.
        """
        
        if is_authenticated:
            system_prompt += " The user is authenticated so you can provide detailed information."
        else:
            system_prompt += " The user needs to authenticate before accessing personalized services."
        
        # Initialize chat
        chat = model.start_chat(history=[])
        
        # Add relevant chat history if provided
        if chat_history:
            for message in chat_history:
                if message['role'] == 'user':
                    chat.send_message(message['content'])
                    
        # Send the current user message and get response
        response = chat.send_message(f"{system_prompt}\n\nUser question: {user_message}")
        return response.text
    
    except Exception as e:
        logger.error(f"Error getting chat response from Gemini: {e}")
        return "I'm having trouble connecting to my knowledge base right now. Please try again later."

def validate_document(extracted_data, document_type):
    """Validate extracted document data using Gemini"""
    try:
        prompt = f"""
        Validate this extracted {document_type} document data for accuracy and completeness:
        
        {extracted_data}
        
        Check for:
        1. Missing required fields for a {document_type} document
        2. Data format issues (dates, numbers, identifiers)
        3. Potential data extraction errors
        
        Provide a validation summary with any issues found. If no issues, confirm the data appears valid.
        """
        
        model = genai.GenerativeModel("models/gemini-2.0-flash")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error validating document with Gemini: {e}")
        return f"Error validating document: {str(e)}"

# Update initialization to log available models
if __name__ == "__main__":
    if os.getenv('GEMINI_API_KEY'):
        init_gemini(os.getenv('GEMINI_API_KEY'))
        get_gemini_models()  # Log available models