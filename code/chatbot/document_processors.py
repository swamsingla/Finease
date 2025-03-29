import os
import requests
from config import (
    BACKEND_URL, 
    NANONETS_API_KEY, 
    GST_MODEL_ID, 
    ITR_MODEL_ID, 
    EPF_MODEL_ID,
    APP_DIR
)

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

def extract_gst_data(file_path, user_email=None):
    """Extract data from GST document using Nanonets API"""
    try:
        # Make sure we're using the absolute file path
        if not os.path.isabs(file_path):
            file_path = os.path.join(APP_DIR, file_path)
            
        # Verify the file exists before attempting to open it
        if not os.path.exists(file_path):
            return {"error": f"File not found: {file_path}"}
            
        print(f"Extracting data from GST file: {file_path}")
        
        # Prepare the file for upload
        with open(file_path, 'rb') as f:
            # Create a multipart form request
            files = {'file': f}
            
            # Send file to Nanonets API
            response = requests.post(
                f"https://app.nanonets.com/api/v2/OCR/Model/{GST_MODEL_ID}/LabelFile/",
                files=files,
                auth=(NANONETS_API_KEY, '')  # Basic auth with API key
            )
            
            if response.status_code == 200:
                result = response.json()
                # Process the extracted data
                if result and 'result' in result:
                    extracted_data = process_gst_response(result, user_email)
                    return extracted_data
                else:
                    return {"error": "Could not extract data from the invoice"}
            else:
                print(f"Nanonets API error: {response.status_code}, {response.text}")
                return {"error": f"Data extraction failed with status code: {response.status_code}"}
                
    except Exception as e:
        print(f"Error extracting GST data: {e}")
        return {"error": f"Data extraction error: {str(e)}"}

def extract_itr_data(file_path, user_email=None):
    """Extract data from ITR document using Nanonets API"""
    try:
        # Make sure we're using the absolute file path
        if not os.path.isabs(file_path):
            file_path = os.path.join(APP_DIR, file_path)
            
        # Verify the file exists before attempting to open it
        if not os.path.exists(file_path):
            return {"error": f"File not found: {file_path}"}
            
        print(f"Extracting data from ITR file: {file_path}")
        
        # Prepare the file for upload
        with open(file_path, 'rb') as f:
            # Create a multipart form request
            files = {'file': f}
            
            # Send file to Nanonets API
            response = requests.post(
                f"https://app.nanonets.com/api/v2/OCR/Model/{ITR_MODEL_ID}/LabelFile/",
                files=files,
                auth=(NANONETS_API_KEY, '')  # Basic auth with API key
            )
            
            if response.status_code == 200:
                result = response.json()
                # Process the extracted data
                if result and 'result' in result:
                    extracted_data = process_itr_response(result, user_email)
                    return extracted_data
                else:
                    return {"error": "Could not extract data from the ITR document"}
            else:
                print(f"Nanonets API error: {response.status_code}, {response.text}")
                return {"error": f"Data extraction failed with status code: {response.status_code}"}
                
    except Exception as e:
        print(f"Error extracting ITR data: {e}")
        return {"error": f"Data extraction error: {str(e)}"}

def extract_epf_data(file_path, user_email=None):
    """Extract data from EPF document using Nanonets API"""
    try:
        # Make sure we're using the absolute file path
        if not os.path.isabs(file_path):
            file_path = os.path.join(APP_DIR, file_path)
            
        # Verify the file exists before attempting to open it
        if not os.path.exists(file_path):
            return {"error": f"File not found: {file_path}"}
            
        print(f"Extracting data from EPF file: {file_path}")
        
        # Prepare the file for upload
        with open(file_path, 'rb') as f:
            # Create a multipart form request
            files = {'file': f}
            
            # Send file to Nanonets API
            response = requests.post(
                f"https://app.nanonets.com/api/v2/OCR/Model/{EPF_MODEL_ID}/LabelFile/",
                files=files,
                auth=(NANONETS_API_KEY, '')  # Basic auth with API key
            )
            
            if response.status_code == 200:
                result = response.json()
                # Process the extracted data
                if result and 'result' in result:
                    extracted_data = process_epf_response(result, user_email)
                    return extracted_data
                else:
                    return {"error": "Could not extract data from the EPF document"}
            else:
                print(f"Nanonets API error: {response.status_code}, {response.text}")
                return {"error": f"Data extraction failed with status code: {response.status_code}"}
                
    except Exception as e:
        print(f"Error extracting EPF data: {e}")
        return {"error": f"Data extraction error: {str(e)}"}

def process_gst_response(data, user_email=None):
    """Process Nanonets API response for GST documents"""
    try:
        predictions = data['result'][0]['prediction']
        
        # Extract fields from predictions
        extracted_data = {
            "gstin": next((p['ocr_text'] for p in predictions if p['label'] == 'gstin'), ""),
            "invoiceDate": next((p['ocr_text'] for p in predictions if p['label'] == 'invoice_date'), ""),
            "placeOfSupply": next((p['ocr_text'] for p in predictions if p['label'] == 'place_of_supply'), ""),
            "address": next((p['ocr_text'] for p in predictions if p['label'] == 'address'), ""),
            "cgst": next((p['ocr_text'] for p in predictions if p['label'] == 'cgst_amount'), "0"),
            "sgst": next((p['ocr_text'] for p in predictions if p['label'] == 'sgst_amount'), "0"),
            "totalAmount": next((p['ocr_text'] for p in predictions if p['label'] == 'total_amount'), "0"),
            "ctin": next((p['ocr_text'] for p in predictions if p['label'] == 'ctin'), "NULL")  # Adding CTIN field with default
        }
        
        # Use the session user's email instead of extracting from document
        if user_email:
            extracted_data["email"] = user_email
        else:
            # Fallback to extracted email only if user_email is not provided
            extracted_data["email"] = next((p['ocr_text'] for p in predictions if p['label'] == 'email'), "")
        
        # Clean numeric values and ensure they're valid numbers
        for key in ['cgst', 'sgst', 'totalAmount']:
            if extracted_data[key]:
                # Remove currency symbols, commas, etc.
                clean_value = ''.join(c for c in extracted_data[key] if c.isdigit() or c in ['.', '-'])
                
                # Ensure it's a valid number (default to 0 if empty or invalid)
                try:
                    extracted_data[key] = float(clean_value) if clean_value else 0
                except ValueError:
                    extracted_data[key] = 0
            else:
                extracted_data[key] = 0
                
        return extracted_data
    except Exception as e:
        print(f"Error processing Nanonets response: {e}")
        return {"error": f"Error processing extracted data: {str(e)}"}

def process_itr_response(data, user_email=None):
    """Process Nanonets API response for ITR documents"""
    try:
        predictions = data['result'][0]['prediction']
        
        # Extract fields from predictions
        extracted_data = {
            "panNo": next((p['ocr_text'] for p in predictions if p['label'] == 'pan_no'), ""),
            "tan": next((p['ocr_text'] for p in predictions if p['label'] == 'tan'), ""),
            "addressEmployee": next((p['ocr_text'] for p in predictions if p['label'] == 'address_employee'), ""),
            "addressEmployer": next((p['ocr_text'] for p in predictions if p['label'] == 'address_employer'), ""),
            "grossTotalIncome": next((p['ocr_text'] for p in predictions if p['label'] == 'gross_total_income'), "0"),
            "grossTaxableIncome": next((p['ocr_text'] for p in predictions if p['label'] == 'gross_taxable_income'), "0"),
            "netTaxPayable": next((p['ocr_text'] for p in predictions if p['label'] == 'net_tax_payable'), "0")
        }
        
        # Use the session user's email instead of extracting from document
        if user_email:
            extracted_data["email"] = user_email
        else:
            # Fallback to extracted email only if user_email is not provided
            extracted_data["email"] = next((p['ocr_text'] for p in predictions if p['label'] == 'email'), "")
        
        # Handle period dates
        period_from = next((p['ocr_text'] for p in predictions if p['label'] == 'period_from'), "")
        period_to = next((p['ocr_text'] for p in predictions if p['label'] == 'period_to'), "")
        
        extracted_data["period"] = {
            "from": period_from,
            "to": period_to
        }
        
        # Clean numeric values and ensure they're valid numbers
        for key in ['grossTotalIncome', 'grossTaxableIncome', 'netTaxPayable']:
            if extracted_data[key]:
                # Remove currency symbols, commas, etc.
                clean_value = ''.join(c for c in extracted_data[key] if c.isdigit() or c in ['.', '-'])
                
                # Ensure it's a valid number (default to 0 if empty or invalid)
                try:
                    extracted_data[key] = float(clean_value) if clean_value else 0
                except ValueError:
                    extracted_data[key] = 0
            else:
                extracted_data[key] = 0
                
        return extracted_data
    except Exception as e:
        print(f"Error processing ITR response: {e}")
        return {"error": f"Error processing extracted data: {str(e)}"}

def process_epf_response(data, user_email=None):
    """Process Nanonets API response for EPF documents"""
    try:
        predictions = data['result'][0]['prediction']
        
        # Extract fields from predictions
        extracted_data = {
            "trrnNo": next((p['ocr_text'] for p in predictions if p['label'] == 'trrn_no'), ""),
            "establishmentId": next((p['ocr_text'] for p in predictions if p['label'] == 'establishment_id'), ""),
            "establishmentName": next((p['ocr_text'] for p in predictions if p['label'] == 'establishment_name'), ""),
            "wageMonth": next((p['ocr_text'] for p in predictions if p['label'] == 'wage_month'), ""),
            "member": next((p['ocr_text'] for p in predictions if p['label'] == 'member'), "0"),
            "totalAmount": next((p['ocr_text'] for p in predictions if p['label'] == 'total_amount'), "0")
        }
        
        # Use the session user's email instead of extracting from document
        if user_email:
            extracted_data["email"] = user_email
        else:
            # Fallback to extracted email only if user_email is not provided
            extracted_data["email"] = next((p['ocr_text'] for p in predictions if p['label'] == 'email'), "")
        
        # Clean numeric values and ensure they're valid numbers
        for key in ['member', 'totalAmount']:
            if extracted_data[key]:
                # Remove currency symbols, commas, etc.
                clean_value = ''.join(c for c in extracted_data[key] if c.isdigit() or c in ['.', '-'])
                
                # Ensure it's a valid number (default to 0 if empty or invalid)
                try:
                    extracted_data[key] = float(clean_value) if clean_value else 0
                except ValueError:
                    extracted_data[key] = 0
            else:
                extracted_data[key] = 0
                
        return extracted_data
    except Exception as e:
        print(f"Error processing EPF response: {e}")
        return {"error": f"Error processing extracted data: {str(e)}"}
