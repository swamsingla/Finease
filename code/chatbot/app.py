from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import os
import time

# Import our modules
import config
from utils import get_file_extension, download_media, send_whatsapp_message, format_menu
from document_processors import (
    classify_document, 
    extract_gst_data, 
    extract_itr_data, 
    extract_epf_data,
    sync_user_data
)
from formatters import (
    format_gst_data_for_whatsapp, 
    format_itr_data_for_whatsapp, 
    format_epf_data_for_whatsapp,
    format_classification_result
)
import session_manager

# Initialize Twilio client
client = Client(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)

# Initialize Flask app
app = Flask(__name__)

# Create media folders if they don't exist
os.makedirs(config.MEDIA_FOLDER, exist_ok=True)

# Create option-specific subfolders
for option in config.DOCUMENT_OPTIONS:
    os.makedirs(os.path.join(config.MEDIA_FOLDER, option), exist_ok=True)

@app.route("/")
def hello():
    return "WhatsApp Chatbot is running!"

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
    session = session_manager.init_session(sender)
    
    # Get current user state
    user_state = session['state']
    
    # Sync user info to database (will create user if not exists)
    sync_result = sync_user_data(sender)
    if "error" in sync_result:
        print(f"Error syncing user data: {sync_result['error']}")
    
    if num_media > 0:
        # Handle incoming media based on user state
        if user_state == 'awaiting_document':
            selected_option = session['selected_option']
            option_folder = os.path.join(config.MEDIA_FOLDER, selected_option)
            option_name = next(
                (o['name'] for o in config.MENU_OPTIONS.values() if o['key'] == selected_option), 
                selected_option
            )
            option_emoji = next(
                (o['emoji'] for o in config.MENU_OPTIONS.values() if o['key'] == selected_option), 
                "📎"
            )
            
            media_files = []
            media_urls = []
            
            for i in range(num_media):
                media_url = request.values.get(f'MediaUrl{i}')
                content_type = request.values.get(f'MediaContentType{i}')
                
                # Store the media URL for database
                media_urls.append(media_url)
                
                # Download media file to the option-specific folder
                media_extension = get_file_extension(content_type)
                media_filename = os.path.join(
                    option_folder, 
                    f"document_{i}_{os.path.basename(media_url)}.{media_extension}"
                )
                
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
                        result_message = format_classification_result(classification_result)
                        resp.message(result_message)
                        
                        # Sync to database with classify document type
                        sync_user_data(
                            sender, 
                            document_type="classification", 
                            document_data=classification_result, 
                            media_url=media_urls[0] if media_urls else None
                        )
            
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
                                from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                to=sender
                            )
                        else:
                            document_type = classification_result.get('classification', 'Unknown').lower()
                            print(f"Document classified as: {document_type}")
                            
                            # Send classification result
                            client.messages.create(
                                body=f"📄 Document classified as: *{document_type}*",
                                from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                to=sender
                            )
                            
                            # Only process if document type matches GST
                            if 'gst' in document_type or 'invoice' in document_type or 'tax' in document_type:
                                # Now send the processing message
                                client.messages.create(
                                    body=f"{option_emoji} Processing your GST document...",
                                    from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                    to=sender
                                )
                                
                                # Extract data
                                extraction_result = extract_gst_data(file_path)
                                print(f"GST Extraction result: {extraction_result}")
                                
                                # Sync the data to database
                                sync_user_data(
                                    sender, 
                                    document_type="gst", 
                                    document_data=extraction_result, 
                                    media_url=media_urls[0] if media_urls else None
                                )
                                
                                # Format and send the result
                                gst_message = format_gst_data_for_whatsapp(extraction_result)
                                client.messages.create(
                                    body=gst_message,
                                    from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                    to=sender
                                )
                                
                                # Also send menu after a short delay
                                time.sleep(1)
                            else:
                                # Document type doesn't match GST, send appropriate message
                                client.messages.create(
                                    body=f"⚠️ This doesn't appear to be a GST document. Classified as: *{document_type}*\n\nPlease try uploading a valid GST document.",
                                    from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                    to=sender
                                )
                            
                            # Send menu in all cases
                            client.messages.create(
                                body=format_menu(),
                                from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                to=sender
                            )
                    except Exception as e:
                        print(f"Error processing document: {e}")
                        client.messages.create(
                            body=f"⚠️ *Error processing document*\n\n{str(e)}",
                            from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                            to=sender
                        )
                    
                    # Reset user state
                    session_manager.update_session(sender, state='awaiting_option')
                    
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
                                from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                to=sender
                            )
                        else:
                            document_type = classification_result.get('classification', 'Unknown').lower()
                            print(f"Document classified as: {document_type}")
                            
                            # Send classification result
                            client.messages.create(
                                body=f"📊 Document classified as: *{document_type}*",
                                from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                to=sender
                            )
                            
                            # Only process if document type matches ITR
                            if 'itr' in document_type or 'income tax' in document_type or 'form 16' in document_type:
                                # Now send the processing message
                                client.messages.create(
                                    body=f"{option_emoji} Processing your ITR document...",
                                    from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                    to=sender
                                )
                                
                                # Extract data
                                extraction_result = extract_itr_data(file_path)
                                print(f"ITR Extraction result: {extraction_result}")
                                
                                # Sync the data to database
                                sync_user_data(
                                    sender, 
                                    document_type="itr", 
                                    document_data=extraction_result, 
                                    media_url=media_urls[0] if media_urls else None
                                )
                                
                                # Format and send the result
                                itr_message = format_itr_data_for_whatsapp(extraction_result)
                                client.messages.create(
                                    body=itr_message,
                                    from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                    to=sender
                                )
                                
                                # Also send menu after a short delay
                                time.sleep(1)
                            else:
                                # Document type doesn't match ITR, send appropriate message
                                client.messages.create(
                                    body=f"⚠️ This doesn't appear to be an ITR document. Classified as: *{document_type}*\n\nPlease try uploading a valid ITR document.",
                                    from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                    to=sender
                                )
                            
                            # Send menu in all cases
                            client.messages.create(
                                body=format_menu(),
                                from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                to=sender
                            )
                    except Exception as e:
                        print(f"Error processing document: {e}")
                        client.messages.create(
                            body=f"⚠️ *Error processing document*\n\n{str(e)}",
                            from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                            to=sender
                        )
                    
                    # Reset user state
                    session_manager.update_session(sender, state='awaiting_option')
                    
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
                                from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                to=sender
                            )
                        else:
                            document_type = classification_result.get('classification', 'Unknown').lower()
                            print(f"Document classified as: {document_type}")
                            
                            # Send classification result
                            client.messages.create(
                                body=f"📱 Document classified as: *{document_type}*",
                                from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                to=sender
                            )
                            
                            # Only process if document type matches PF
                            if 'epf' in document_type or 'pf' in document_type or 'provident' in document_type:
                                # Now send the processing message
                                client.messages.create(
                                    body=f"{option_emoji} Processing your PF document...",
                                    from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                    to=sender
                                )
                                
                                # Extract data
                                extraction_result = extract_epf_data(file_path)
                                print(f"PF Extraction result: {extraction_result}")
                                
                                # Sync the data to database
                                sync_user_data(
                                    sender, 
                                    document_type="epf", 
                                    document_data=extraction_result, 
                                    media_url=media_urls[0] if media_urls else None
                                )
                                
                                # Format and send the result
                                epf_message = format_epf_data_for_whatsapp(extraction_result)
                                client.messages.create(
                                    body=epf_message,
                                    from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                    to=sender
                                )
                                
                                # Also send menu after a short delay
                                time.sleep(1)
                            else:
                                # Document type doesn't match PF, send appropriate message
                                client.messages.create(
                                    body=f"⚠️ This doesn't appear to be a PF document. Classified as: *{document_type}*\n\nPlease try uploading a valid PF document.",
                                    from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                    to=sender
                                )
                            
                            # Send menu in all cases
                            client.messages.create(
                                body=format_menu(),
                                from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                                to=sender
                            )
                    except Exception as e:
                        print(f"Error processing document: {e}")
                        client.messages.create(
                            body=f"⚠️ *Error processing document*\n\n{str(e)}",
                            from_=f"whatsapp:{config.TWILIO_WHATSAPP_NUMBER}",
                            to=sender
                        )
                    
                    # Reset user state
                    session_manager.update_session(sender, state='awaiting_option')
                    
                    # Return the simple initial response to close the webhook quickly
                    return str(resp)
            else:
                # Regular file upload response for other document types
                if num_media == 1:
                    resp.message(f"{option_emoji} *Success!* Your document has been uploaded to *{option_name}*.")
                else:
                    resp.message(f"{option_emoji} *Success!* Your {num_media} documents have been uploaded to *{option_name}*.")
            
            # Reset user state
            session_manager.reset_session(sender)
            
            # Show the menu again after document upload
            resp.message(format_menu())
            session_manager.update_session(sender, state='awaiting_option')
            
        else:
            # Handle media when not expecting it
            for i in range(num_media):
                media_url = request.values.get(f'MediaUrl{i}')
                content_type = request.values.get(f'MediaContentType{i}')
                
                # Download media file to the general media folder
                media_extension = get_file_extension(content_type)
                media_filename = os.path.join(
                    config.MEDIA_FOLDER, 
                    f"received_media_{i}_{os.path.basename(media_url)}.{media_extension}"
                )
                
                download_media(media_url, media_filename)
            
            resp.message("⚠️ Thanks for the file! Please select an option from the menu to properly categorize your document.")
            
            # Show the menu
            resp.message(format_menu())
            session_manager.update_session(sender, state='awaiting_option')
    
    else:
        # Handle text messages based on user state
        if user_state == 'awaiting_option':
            # User should select one of the options by number
            if incoming_msg in config.MENU_OPTIONS:
                selected_option = config.MENU_OPTIONS[incoming_msg]['key']
                option_name = config.MENU_OPTIONS[incoming_msg]['name']
                option_emoji = config.MENU_OPTIONS[incoming_msg]['emoji']
                
                session_manager.update_session(
                    sender, 
                    state='awaiting_document', 
                    selected_option=selected_option
                )
                
                resp.message(f"{option_emoji} You've selected *{option_name}*.\n\n📤 Please upload your document now.")
                
            else:
                # Invalid option selected, show menu again
                resp.message(f"❗ *Please select a valid option*\n\nReply with a number from 1-{len(config.MENU_OPTIONS)} to select a filing option.")
                resp.message(format_menu())
                
        else:
            # For any message, show the menu
            # Set state to awaiting_option regardless of the message content
            session_manager.update_session(sender, state='awaiting_option')
            
            # A friendly greeting for first-time or returning users
            if incoming_msg in ['hello', 'hi', 'hey', 'start']:
                resp.message(f"👋 *Welcome to FinEase!*")
                
            # Show the menu for any message
            resp.message(format_menu())
    
    return str(resp)

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
