# Add time import at the top with the other imports
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import os
import requests
import time  # Add this import for time.sleep()
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get Twilio credentials from environment variables
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_WHATSAPP_NUMBER')
# Backend API endpoint for classification
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')

client = Client(account_sid, auth_token)

app = Flask(__name__)

# Get the absolute path of the application directory
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Create a media folder if it doesn't exist
os.makedirs(os.path.join(APP_DIR, 'media'), exist_ok=True)

# Create option-specific subfolders
for option in ['gst_filing', 'itr_filing', 'pf_filing', 'classify']:
    os.makedirs(os.path.join(APP_DIR, f'media/{option}'), exist_ok=True)

# Track user states
user_sessions = {}

# Menu options with emojis and descriptions
menu_options = {
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
    '4': {  # Added classify option
        'name': 'Document Classification',
        'key': 'classify',
        'emoji': '🔍',
        'description': 'Analyze and classify your document'
    }
}

@app.route("/")
def hello():
    return "WhatsApp Chatbot is running!"

def format_menu():
    """Create a well-formatted menu with emojis and numbers"""
    menu_text = "📋 *Welcome to our Document Filing Service!*\n\n"
    menu_text += "Please select an option by typing the number:\n\n"
    
    for key, option in menu_options.items():
        menu_text += f"*{key}*. {option['emoji']} {option['name']}\n   _{option['description']}_\n\n"
    
    menu_text += f"Reply with the option number (1-{len(menu_options)}) to continue."
    return menu_text

def classify_document(file_path):
    """Send a document to the backend classification API and return the result"""
    try:
        # Make sure we're using the absolute file path
        if not os.path.isabs(file_path):
            file_path = os.path.join(APP_DIR, file_path)
            
        # Verify the file exists before attempting to open it
        if not os.path.exists(file_path):
            return {"error": f"File not found: {file_path}"}
            
        print(f"Attempting to classify file: {file_path}")
        
        # Prepare the file for upload
        with open(file_path, 'rb') as f:
            files = {'file': f}
            
            # Send the file to the classification API
            response = requests.post(f"{BACKEND_URL}/api/classify", files=files)
            
            if response.status_code == 200:
                result = response.json()
                return result
            else:
                print(f"Classification API error: {response.status_code}, {response.text}")
                return {"error": f"Classification failed with status code: {response.status_code}"}
                
    except Exception as e:
        print(f"Error classifying document: {e}")
        return {"error": f"Classification error: {str(e)}"}

def extract_gst_data(file_path):
    """Extract data from GST document using Nanonets API"""
    try:
        # Make sure we're using the absolute file path
        if not os.path.isabs(file_path):
            file_path = os.path.join(APP_DIR, file_path)
            
        # Verify the file exists before attempting to open it
        if not os.path.exists(file_path):
            return {"error": f"File not found: {file_path}"}
            
        print(f"Extracting data from GST file: {file_path}")
        
        # Nanonets API credentials - same as in Gst.js
        api_key = "5aa26d66-fb76-11ef-a113-263262c841b0"
        model_id = "71087ee9-2900-4dd5-a53d-67efe247846c"
        
        # Prepare the file for upload
        with open(file_path, 'rb') as f:
            # Create a multipart form request
            files = {'file': f}
            
            # Send file to Nanonets API
            response = requests.post(
                f"https://app.nanonets.com/api/v2/OCR/Model/{model_id}/LabelFile/",
                files=files,
                auth=(api_key, '')  # Basic auth with API key
            )
            
            if response.status_code == 200:
                result = response.json()
                # Process the extracted data similar to Gst.js processNanonetsResponse
                if result and 'result' in result:
                    extracted_data = process_nanonets_response(result)
                    return extracted_data
                else:
                    return {"error": "Could not extract data from the invoice"}
            else:
                print(f"Nanonets API error: {response.status_code}, {response.text}")
                return {"error": f"Data extraction failed with status code: {response.status_code}"}
                
    except Exception as e:
        print(f"Error extracting GST data: {e}")
        return {"error": f"Data extraction error: {str(e)}"}

# Add this function after extract_gst_data
def extract_itr_data(file_path):
    """Extract data from ITR document using Nanonets API"""
    try:
        # Make sure we're using the absolute file path
        if not os.path.isabs(file_path):
            file_path = os.path.join(APP_DIR, file_path)
            
        # Verify the file exists before attempting to open it
        if not os.path.exists(file_path):
            return {"error": f"File not found: {file_path}"}
            
        print(f"Extracting data from ITR file: {file_path}")
        
        # Nanonets API credentials - same as in Itr.js
        api_key = "5aa26d66-fb76-11ef-a113-263262c841b0"
        model_id = "13bad529-fff3-4bb9-898b-8fe0f57cbfe1"  # ITR model ID
        
        # Prepare the file for upload
        with open(file_path, 'rb') as f:
            # Create a multipart form request
            files = {'file': f}
            
            # Send file to Nanonets API
            response = requests.post(
                f"https://app.nanonets.com/api/v2/OCR/Model/{model_id}/LabelFile/",
                files=files,
                auth=(api_key, '')  # Basic auth with API key
            )
            
            if response.status_code == 200:
                result = response.json()
                # Process the extracted data similar to Itr.js processNanonetsResponse
                if result and 'result' in result:
                    extracted_data = process_itr_response(result)
                    return extracted_data
                else:
                    return {"error": "Could not extract data from the ITR document"}
            else:
                print(f"Nanonets API error: {response.status_code}, {response.text}")
                return {"error": f"Data extraction failed with status code: {response.status_code}"}
                
    except Exception as e:
        print(f"Error extracting ITR data: {e}")
        return {"error": f"Data extraction error: {str(e)}"}

def process_itr_response(data):
    """Process Nanonets API response similar to processNanonetsResponse in Itr.js"""
    try:
        predictions = data['result'][0]['prediction']
        
        # Extract fields from predictions - based on Itr.js structure
        extracted_data = {
            "email": next((p['ocr_text'] for p in predictions if p['label'] == 'email'), ""),
            "panNo": next((p['ocr_text'] for p in predictions if p['label'] == 'pan_no'), ""),
            "tan": next((p['ocr_text'] for p in predictions if p['label'] == 'tan'), ""),
            "addressEmployee": next((p['ocr_text'] for p in predictions if p['label'] == 'address_employee'), ""),
            "addressEmployer": next((p['ocr_text'] for p in predictions if p['label'] == 'address_employer'), ""),
            "grossTotalIncome": next((p['ocr_text'] for p in predictions if p['label'] == 'gross_total_income'), ""),
            "grossTaxableIncome": next((p['ocr_text'] for p in predictions if p['label'] == 'gross_taxable_income'), ""),
            "netTaxPayable": next((p['ocr_text'] for p in predictions if p['label'] == 'net_tax_payable'), "")
        }
        
        # Handle period dates
        period_from = next((p['ocr_text'] for p in predictions if p['label'] == 'period_from'), "")
        period_to = next((p['ocr_text'] for p in predictions if p['label'] == 'period_to'), "")
        
        extracted_data["period"] = {
            "from": period_from,
            "to": period_to
        }
        
        # Clean numeric values
        for key in ['grossTotalIncome', 'grossTaxableIncome', 'netTaxPayable']:
            if extracted_data[key]:
                # Remove currency symbols, commas, etc.
                extracted_data[key] = ''.join(c for c in extracted_data[key] if c.isdigit() or c in ['.', '-'])
                
        return extracted_data
    except Exception as e:
        print(f"Error processing ITR response: {e}")
        return {"error": f"Error processing extracted data: {str(e)}"}

def format_itr_data_for_whatsapp(data):
    """Format ITR data for WhatsApp message"""
    if "error" in data:
        return f"⚠️ *Error extracting ITR data*\n\n{data['error']}"
        
    message = "📊 *ITR Document Data Extracted*\n\n"
    
    # Add each field with emoji
    if data.get("panNo"):
        message += f"🆔 *PAN Number:* {data['panNo']}\n"
    
    if data.get("tan"):
        message += f"🏢 *TAN:* {data['tan']}\n"
    
    if data.get("email"):
        message += f"📧 *Email:* {data['email']}\n"
    
    if data.get("addressEmployee"):
        message += f"🏠 *Employee Address:* {data['addressEmployee']}\n"
        
    if data.get("addressEmployer"):
        message += f"🏢 *Employer Address:* {data['addressEmployer']}\n"
    
    if data.get("period") and data["period"].get("from") and data["period"].get("to"):
        message += f"📅 *Period:* {data['period']['from']} to {data['period']['to']}\n"
        
    if data.get("grossTotalIncome"):
        message += f"💵 *Gross Total Income:* ₹{data['grossTotalIncome']}\n"
        
    if data.get("grossTaxableIncome"):
        message += f"💰 *Gross Taxable Income:* ₹{data['grossTaxableIncome']}\n"
        
    if data.get("netTaxPayable"):
        message += f"💸 *Net Tax Payable:* ₹{data['netTaxPayable']}\n"
    
    message += "\nWould you like to upload another document? Select an option from the menu."
    return message

def process_nanonets_response(data):
    """Process Nanonets API response similar to processNanonetsResponse in Gst.js"""
    try:
        predictions = data['result'][0]['prediction']
        
        # Extract fields from predictions
        extracted_data = {
            "email": next((p['ocr_text'] for p in predictions if p['label'] == 'email'), ""),
            "gstin": next((p['ocr_text'] for p in predictions if p['label'] == 'gstin'), ""),
            "invoiceDate": next((p['ocr_text'] for p in predictions if p['label'] == 'invoice_date'), ""),
            "placeOfSupply": next((p['ocr_text'] for p in predictions if p['label'] == 'place_of_supply'), ""),
            "address": next((p['ocr_text'] for p in predictions if p['label'] == 'address'), ""),
            "cgst": next((p['ocr_text'] for p in predictions if p['label'] == 'cgst_amount'), ""),
            "sgst": next((p['ocr_text'] for p in predictions if p['label'] == 'sgst_amount'), ""),
            "totalAmount": next((p['ocr_text'] for p in predictions if p['label'] == 'total_amount'), "")
        }
        
        # Clean numeric values - similar to cleanNumericValue in Gst.js
        for key in ['cgst', 'sgst', 'totalAmount']:
            if extracted_data[key]:
                # Remove currency symbols, commas, etc.
                extracted_data[key] = ''.join(c for c in extracted_data[key] if c.isdigit() or c in ['.', '-'])
                
        return extracted_data
    except Exception as e:
        print(f"Error processing Nanonets response: {e}")
        return {"error": f"Error processing extracted data: {str(e)}"}

def format_gst_data_for_whatsapp(data):
    """Format GST data for WhatsApp message"""
    if "error" in data:
        return f"⚠️ *Error extracting GST data*\n\n{data['error']}"
        
    message = "📄 *GST Document Data Extracted*\n\n"
    
    # Add each field with emoji
    if data.get("gstin"):
        message += f"🆔 *GSTIN:* {data['gstin']}\n"
    
    if data.get("invoiceDate"):
        message += f"📅 *Invoice Date:* {data['invoiceDate']}\n"
    
    if data.get("email"):
        message += f"📧 *Email:* {data['email']}\n"
        
    if data.get("placeOfSupply"):
        message += f"📍 *Place of Supply:* {data['placeOfSupply']}\n"
        
    if data.get("address"):
        message += f"🏢 *Address:* {data['address']}\n"
        
    if data.get("cgst"):
        message += f"💰 *CGST:* ₹{data['cgst']}\n"
        
    if data.get("sgst"):
        message += f"💰 *SGST:* ₹{data['sgst']}\n"
        
    if data.get("totalAmount"):
        message += f"💵 *Total Amount:* ₹{data['totalAmount']}\n"
    
    message += "\nWould you like to upload another document? Select an option from the menu."
    return message

# Add this function after extract_itr_data
def extract_epf_data(file_path):
    """Extract data from EPF document using Nanonets API"""
    try:
        # Make sure we're using the absolute file path
        if not os.path.isabs(file_path):
            file_path = os.path.join(APP_DIR, file_path)
            
        # Verify the file exists before attempting to open it
        if not os.path.exists(file_path):
            return {"error": f"File not found: {file_path}"}
            
        print(f"Extracting data from EPF file: {file_path}")
        
        # Nanonets API credentials - same as in Epf.js
        api_key = "5aa26d66-fb76-11ef-a113-263262c841b0"
        model_id = "3329200a-1e45-4c4b-93ea-a8efa65dc32e"  # EPF model ID
        
        # Prepare the file for upload
        with open(file_path, 'rb') as f:
            # Create a multipart form request
            files = {'file': f}
            
            # Send file to Nanonets API
            response = requests.post(
                f"https://app.nanonets.com/api/v2/OCR/Model/{model_id}/LabelFile/",
                files=files,
                auth=(api_key, '')  # Basic auth with API key
            )
            
            if response.status_code == 200:
                result = response.json()
                # Process the extracted data similar to Epf.js processNanonetsResponse
                if result and 'result' in result:
                    extracted_data = process_epf_response(result)
                    return extracted_data
                else:
                    return {"error": "Could not extract data from the EPF document"}
            else:
                print(f"Nanonets API error: {response.status_code}, {response.text}")
                return {"error": f"Data extraction failed with status code: {response.status_code}"}
                
    except Exception as e:
        print(f"Error extracting EPF data: {e}")
        return {"error": f"Data extraction error: {str(e)}"}

def process_epf_response(data):
    """Process Nanonets API response similar to processNanonetsResponse in Epf.js"""
    try:
        predictions = data['result'][0]['prediction']
        
        # Extract fields from predictions
        extracted_data = {
            "email": next((p['ocr_text'] for p in predictions if p['label'] == 'email'), ""),
            "trrnNo": next((p['ocr_text'] for p in predictions if p['label'] == 'trrn_no'), ""),
            "establishmentId": next((p['ocr_text'] for p in predictions if p['label'] == 'establishment_id'), ""),
            "establishmentName": next((p['ocr_text'] for p in predictions if p['label'] == 'establishment_name'), ""),
            "wageMonth": next((p['ocr_text'] for p in predictions if p['label'] == 'wage_month'), ""),
            "member": next((p['ocr_text'] for p in predictions if p['label'] == 'member'), ""),
            "totalAmount": next((p['ocr_text'] for p in predictions if p['label'] == 'total_amount'), "")
        }
        
        # Clean numeric values
        for key in ['member', 'totalAmount']:
            if extracted_data[key]:
                # Remove currency symbols, commas, etc.
                extracted_data[key] = ''.join(c for c in extracted_data[key] if c.isdigit() or c in ['.', '-'])
                
        return extracted_data
    except Exception as e:
        print(f"Error processing EPF response: {e}")
        return {"error": f"Error processing extracted data: {str(e)}"}

def format_epf_data_for_whatsapp(data):
    """Format EPF data for WhatsApp message"""
    if "error" in data:
        return f"⚠️ *Error extracting EPF data*\n\n{data['error']}"
        
    message = "📱 *EPF Document Data Extracted*\n\n"
    
    # Add each field with emoji
    if data.get("trrnNo"):
        message += f"🔢 *TRRN Number:* {data['trrnNo']}\n"
    
    if data.get("establishmentId"):
        message += f"🆔 *Establishment ID:* {data['establishmentId']}\n"
    
    if data.get("establishmentName"):
        message += f"🏢 *Establishment Name:* {data['establishmentName']}\n"
    
    if data.get("email"):
        message += f"📧 *Email:* {data['email']}\n"
        
    if data.get("wageMonth"):
        message += f"📅 *Wage Month:* {data['wageMonth']}\n"
        
    if data.get("member"):
        message += f"👥 *Members:* {data['member']}\n"
        
    if data.get("totalAmount"):
        message += f"💰 *Total Amount:* ₹{data['totalAmount']}\n"
    
    message += "\nWould you like to upload another document? Select an option from the menu."
    return message

# Now fix the webhook route for GST document handling
@app.route("/webhook", methods=['POST'])
def webhook():
    # Get incoming message information
    incoming_msg = request.values.get('Body', '').lower().strip()
    sender = request.values.get('From')
    
    # Create response
    resp = MessagingResponse()
    
    # Check for media in the message
    num_media = int(request.values.get('NumMedia', 0))
    
    # Initialize user session if not exists
    if sender not in user_sessions:
        user_sessions[sender] = {
            'state': 'initial',
            'selected_option': None
        }
    
    # Get current user state
    user_state = user_sessions[sender]['state']
    
    if num_media > 0:
        # Handle incoming media based on user state
        if user_state == 'awaiting_document':
            selected_option = user_sessions[sender]['selected_option']
            option_folder = os.path.join(APP_DIR, f'media/{selected_option}')
            option_name = next((o['name'] for o in menu_options.values() if o['key'] == selected_option), selected_option)
            option_emoji = next((o['emoji'] for o in menu_options.values() if o['key'] == selected_option), "📎")
            
            media_files = []
            
            for i in range(num_media):
                media_url = request.values.get(f'MediaUrl{i}')
                content_type = request.values.get(f'MediaContentType{i}')
                
                # Download media file to the option-specific folder
                media_extension = get_file_extension(content_type)
                media_filename = os.path.join(option_folder, f"document_{i}_{os.path.basename(media_url)}.{media_extension}")
                
                download_media(media_url, media_filename)
                media_files.append((media_filename, content_type))
            
            # Handle different options differently
            if selected_option == 'classify':
                # For classification, send to the classification API and report results
                if media_files:
                    # Only process the first file for classification
                    file_path, _ = media_files[0]
                    
                    print(f"Sending file to classification: {file_path}")
                    classification_result = classify_document(file_path)
                    print(f"Classification result: {classification_result}")
                    
                    if "error" in classification_result:
                        resp.message(f"⚠️ *Classification Error*\n\n{classification_result['error']}")
                    else:
                        # Format and send the classification result
                        result_message = f"🔍 *Document Classification Results*\n\n"
                        result_message += f"📄 Document Type: *{classification_result.get('classification', 'Unknown')}*\n"
                        result_message += f"📅 Date: {classification_result.get('date', 'No date detected')}\n\n"
                        result_message += "Would you like to classify another document? Select an option from the menu."
                        resp.message(result_message)
            
            elif selected_option == 'gst_filing':
                if media_files:
                    file_path, _ = media_files[0]
                    
                    # Send a simple initial message about classification
                    resp = MessagingResponse()
                    resp.message(f"{option_emoji} Classifying your document...")
                    
                    try:
                        # First classify the document
                        print(f"Classifying document: {file_path}")
                        classification_result = classify_document(file_path)
                        print(f"Classification result: {classification_result}")
                        
                        if "error" in classification_result:
                            client.messages.create(
                                body=f"⚠️ *Classification Error*\n\n{classification_result['error']}",
                                from_=f"whatsapp:{twilio_number}",
                                to=sender
                            )
                        else:
                            document_type = classification_result.get('classification', 'Unknown').lower()
                            print(f"Document classified as: {document_type}")
                            
                            # Send classification result
                            client.messages.create(
                                body=f"📄 Document classified as: *{document_type}*",
                                from_=f"whatsapp:{twilio_number}",
                                to=sender
                            )
                            
                            # Only process if document type matches GST
                            if 'gst' in document_type or 'invoice' in document_type or 'tax' in document_type:
                                # Now send the processing message
                                client.messages.create(
                                    body=f"{option_emoji} Processing your GST document...",
                                    from_=f"whatsapp:{twilio_number}",
                                    to=sender
                                )
                                
                                # Extract data
                                extraction_result = extract_gst_data(file_path)
                                print(f"GST Extraction result: {extraction_result}")
                                
                                # Format and send the result
                                gst_message = format_gst_data_for_whatsapp(extraction_result)
                                client.messages.create(
                                    body=gst_message,
                                    from_=f"whatsapp:{twilio_number}",
                                    to=sender
                                )
                                
                                # Also send menu after a short delay
                                time.sleep(1)
                            else:
                                # Document type doesn't match GST, send appropriate message
                                client.messages.create(
                                    body=f"⚠️ This doesn't appear to be a GST document. Classified as: *{document_type}*\n\nPlease try uploading a valid GST document.",
                                    from_=f"whatsapp:{twilio_number}",
                                    to=sender
                                )
                            
                            # Send menu in all cases
                            client.messages.create(
                                body=format_menu(),
                                from_=f"whatsapp:{twilio_number}",
                                to=sender
                            )
                    except Exception as e:
                        print(f"Error processing document: {e}")
                        client.messages.create(
                            body=f"⚠️ *Error processing document*\n\n{str(e)}",
                            from_=f"whatsapp:{twilio_number}",
                            to=sender
                        )
                    
                    # Reset user state
                    user_sessions[sender]['state'] = 'awaiting_option'
                    
                    # Return the simple initial response to close the webhook quickly
                    return str(resp)
            
            elif selected_option == 'itr_filing':
                if media_files:
                    file_path, _ = media_files[0]
                    
                    # Send a simple initial message about classification
                    resp = MessagingResponse()
                    resp.message(f"{option_emoji} Classifying your document...")
                    
                    try:
                        # First classify the document
                        print(f"Classifying document: {file_path}")
                        classification_result = classify_document(file_path)
                        print(f"Classification result: {classification_result}")
                        
                        if "error" in classification_result:
                            client.messages.create(
                                body=f"⚠️ *Classification Error*\n\n{classification_result['error']}",
                                from_=f"whatsapp:{twilio_number}",
                                to=sender
                            )
                        else:
                            document_type = classification_result.get('classification', 'Unknown').lower()
                            print(f"Document classified as: {document_type}")
                            
                            # Send classification result
                            client.messages.create(
                                body=f"📊 Document classified as: *{document_type}*",
                                from_=f"whatsapp:{twilio_number}",
                                to=sender
                            )
                            
                            # Only process if document type matches ITR
                            if 'itr' in document_type or 'income tax' in document_type or 'form 16' in document_type:
                                # Now send the processing message
                                client.messages.create(
                                    body=f"{option_emoji} Processing your ITR document...",
                                    from_=f"whatsapp:{twilio_number}",
                                    to=sender
                                )
                                
                                # Extract data
                                extraction_result = extract_itr_data(file_path)
                                print(f"ITR Extraction result: {extraction_result}")
                                
                                # Format and send the result
                                itr_message = format_itr_data_for_whatsapp(extraction_result)
                                client.messages.create(
                                    body=itr_message,
                                    from_=f"whatsapp:{twilio_number}",
                                    to=sender
                                )
                                
                                # Also send menu after a short delay
                                time.sleep(1)
                            else:
                                # Document type doesn't match ITR, send appropriate message
                                client.messages.create(
                                    body=f"⚠️ This doesn't appear to be an ITR document. Classified as: *{document_type}*\n\nPlease try uploading a valid ITR document.",
                                    from_=f"whatsapp:{twilio_number}",
                                    to=sender
                                )
                            
                            # Send menu in all cases
                            client.messages.create(
                                body=format_menu(),
                                from_=f"whatsapp:{twilio_number}",
                                to=sender
                            )
                    except Exception as e:
                        print(f"Error processing document: {e}")
                        client.messages.create(
                            body=f"⚠️ *Error processing document*\n\n{str(e)}",
                            from_=f"whatsapp:{twilio_number}",
                            to=sender
                        )
                    
                    # Reset user state
                    user_sessions[sender]['state'] = 'awaiting_option'
                    
                    # Return the simple initial response to close the webhook quickly
                    return str(resp)
                            
            elif selected_option == 'pf_filing':
                if media_files:
                    file_path, _ = media_files[0]
                    
                    # Send a simple initial message about classification
                    resp = MessagingResponse()
                    resp.message(f"{option_emoji} Classifying your document...")
                    
                    try:
                        # First classify the document
                        print(f"Classifying document: {file_path}")
                        classification_result = classify_document(file_path)
                        print(f"Classification result: {classification_result}")
                        
                        if "error" in classification_result:
                            client.messages.create(
                                body=f"⚠️ *Classification Error*\n\n{classification_result['error']}",
                                from_=f"whatsapp:{twilio_number}",
                                to=sender
                            )
                        else:
                            document_type = classification_result.get('classification', 'Unknown').lower()
                            print(f"Document classified as: {document_type}")
                            
                            # Send classification result
                            client.messages.create(
                                body=f"📱 Document classified as: *{document_type}*",
                                from_=f"whatsapp:{twilio_number}",
                                to=sender
                            )
                            
                            # Only process if document type matches PF
                            if 'epf' in document_type or 'pf' in document_type or 'provident' in document_type:
                                # Now send the processing message
                                client.messages.create(
                                    body=f"{option_emoji} Processing your PF document...",
                                    from_=f"whatsapp:{twilio_number}",
                                    to=sender
                                )
                                
                                # Extract data
                                extraction_result = extract_epf_data(file_path)
                                print(f"PF Extraction result: {extraction_result}")
                                
                                # Format and send the result
                                epf_message = format_epf_data_for_whatsapp(extraction_result)
                                client.messages.create(
                                    body=epf_message,
                                    from_=f"whatsapp:{twilio_number}",
                                    to=sender
                                )
                                
                                # Also send menu after a short delay
                                time.sleep(1)
                            else:
                                # Document type doesn't match PF, send appropriate message
                                client.messages.create(
                                    body=f"⚠️ This doesn't appear to be a PF document. Classified as: *{document_type}*\n\nPlease try uploading a valid PF document.",
                                    from_=f"whatsapp:{twilio_number}",
                                    to=sender
                                )
                            
                            # Send menu in all cases
                            client.messages.create(
                                body=format_menu(),
                                from_=f"whatsapp:{twilio_number}",
                                to=sender
                            )
                    except Exception as e:
                        print(f"Error processing document: {e}")
                        client.messages.create(
                            body=f"⚠️ *Error processing document*\n\n{str(e)}",
                            from_=f"whatsapp:{twilio_number}",
                            to=sender
                        )
                    
                    # Reset user state
                    user_sessions[sender]['state'] = 'awaiting_option'
                    
                    # Return the simple initial response to close the webhook quickly
                    return str(resp)
            else:
                # Regular file upload response for other document types
                if num_media == 1:
                    resp.message(f"{option_emoji} *Success!* Your document has been uploaded to *{option_name}*.")
                else:
                    resp.message(f"{option_emoji} *Success!* Your {num_media} documents have been uploaded to *{option_name}*.")
            
            # Reset user state
            user_sessions[sender]['state'] = 'initial'
            user_sessions[sender]['selected_option'] = None
            
            # Show the menu again after document upload
            resp.message(format_menu())
            user_sessions[sender]['state'] = 'awaiting_option'
            
        else:
            # Handle media when not expecting it
            for i in range(num_media):
                media_url = request.values.get(f'MediaUrl{i}')
                content_type = request.values.get(f'MediaContentType{i}')
                
                # Download media file to the general media folder
                media_extension = get_file_extension(content_type)
                media_filename = os.path.join(APP_DIR, f"media/received_media_{i}_{os.path.basename(media_url)}.{media_extension}")
                
                download_media(media_url, media_filename)
            
            resp.message("⚠️ Thanks for the file! Please select an option from the menu to properly categorize your document.")
            
            # Show the menu
            resp.message(format_menu())
            user_sessions[sender]['state'] = 'awaiting_option'
    
    else:
        # Handle text messages based on user state
        if user_state == 'awaiting_option':
            # User should select one of the options by number
            if incoming_msg in menu_options:
                selected_option = menu_options[incoming_msg]['key']
                option_name = menu_options[incoming_msg]['name']
                option_emoji = menu_options[incoming_msg]['emoji']
                
                user_sessions[sender]['selected_option'] = selected_option
                user_sessions[sender]['state'] = 'awaiting_document'
                
                resp.message(f"{option_emoji} You've selected *{option_name}*.\n\n📤 Please upload your document now.")
                
            else:
                # Invalid option selected, show menu again
                resp.message(f"❗ *Please select a valid option*\n\nReply with a number from 1-{len(menu_options)} to select a filing option.")
                resp.message(format_menu())
                
        else:
            # For any message, show the menu
            # Set state to awaiting_option regardless of the message content
            user_sessions[sender]['state'] = 'awaiting_option'
            
            # A friendly greeting for first-time or returning users
            if incoming_msg in ['hello', 'hi', 'hey', 'start']:
                resp.message(f"👋 *Welcome to FinEase!*")
                
            # Show the menu for any message
            resp.message(format_menu())
    
    return str(resp)

# Helper functions for media handling
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
        # File path is now already absolute
        response = requests.get(media_url, auth=(account_sid, auth_token), stream=True)
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

# Function to send a message proactively
def send_whatsapp_message(to_number, message_body, media_url=None):
    """Send a WhatsApp message with optional media attachment"""
    params = {
        'from_': f"whatsapp:{twilio_number}",
        'body': message_body,
        'to': f"whatsapp:{to_number}"
    }
    
    # Add media URL if provided
    if (media_url):
        params['media_url'] = [media_url]
    
    message = client.messages.create(**params)
    return message.sid

def send_extraction_results(to_number, data, document_type):
    """Send extraction results directly without going through the webhook response"""
    try:
        # Format the message based on document type
        if document_type == 'gst':
            message = format_gst_data_for_whatsapp(data)
        elif document_type == 'itr':
            message = format_itr_data_for_whatsapp(data)
        elif document_type == 'epf':
            message = format_epf_data_for_whatsapp(data)
        else:
            message = f"✅ Data extracted successfully!\n\n{str(data)}"
        
        # Clean the phone number - remove "whatsapp:" prefix if present
        if to_number.startswith('whatsapp:'):
            clean_number = to_number.replace('whatsapp:', '')
        else:
            clean_number = to_number
            
        print(f"Sending extraction results to {clean_number}: {message[:100]}...")
        
        # Send the message using the Twilio client
        message_sid = send_whatsapp_message(clean_number, message)
        print(f"Message sent successfully with SID: {message_sid}")
        return True
    except Exception as e:
        print(f"Error sending extraction results: {e}")
        return False

if __name__ == "__main__":
    # Change port to 5001 to avoid conflict with backend
    app.run(debug=True, port=5001)