import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER')

# Backend API endpoint for classification
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')

# Nanonets API credentials
NANONETS_API_KEY = "5aa26d66-fb76-11ef-a113-263262c841b0"
GST_MODEL_ID = "71087ee9-2900-4dd5-a53d-67efe247846c"
ITR_MODEL_ID = "13bad529-fff3-4bb9-898b-8fe0f57cbfe1"
EPF_MODEL_ID = "3329200a-1e45-4c4b-93ea-a8efa65dc32e"

# Get the absolute path of the application directory
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Media folder configuration
MEDIA_FOLDER = os.path.join(APP_DIR, 'media')

# Document type options
DOCUMENT_OPTIONS = ['gst_filing', 'itr_filing', 'pf_filing', 'classify']

# Menu options with emojis and descriptions
MENU_OPTIONS = {
    '1': {
        'name': 'GST Filing',
        'key': 'gst_filing',
        'emoji': '📄',
        'description': 'Upload documents related to GST Filing'
    },
    '2': {
        'name': 'ITR Filing',
        'key': 'itr_filing',
        'emoji': '📊',
        'description': 'Upload documents related to ITR Filing'
    },
    '3': {
        'name': 'PF Filing',
        'key': 'pf_filing',
        'emoji': '📱',
        'description': 'Upload documents related to PF Filing'
    },
    '4': {
        'name': 'Document Classification',
        'key': 'classify',
        'emoji': '🔍',
        'description': 'Analyze and classify your document'
    }
}