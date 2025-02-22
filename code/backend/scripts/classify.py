import os
import sys
import json
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
from collections import Counter
import re
import subprocess

# Get image path from command-line argument (if provided)
image_path = sys.argv[1] if len(sys.argv) > 1 else None

# Define the base directory where the script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(SCRIPT_DIR, "..", "uploads")  # Uploads folder

# Ensure uploads directory exists
os.makedirs(UPLOADS_DIR, exist_ok=True)

def process_pdf(pdf_path):
    """Process PDF file and extract text from all pages."""
    try:
        images = convert_from_path(
            pdf_path,
            dpi=300,
            fmt='jpeg',
            thread_count=4
        )
        
        if not images:
            raise Exception("No images extracted from PDF")

        extracted_text = ""
        for page_num, img in enumerate(images, 1):
            img = img.convert('L')  # Convert to grayscale
            text = pytesseract.image_to_string(
                img,
                config='--psm 6 --oem 3',
                lang='eng'
            ).lower()
            extracted_text += f"\n\n--- Page {page_num} ---\n{text}"
            
        return extracted_text.strip()
    except Exception as e:
        raise Exception(f"PDF processing error: {str(e)}")

def process_image(image_path):
    """Process single image file and extract text."""
    try:
        with Image.open(image_path) as img:
            img = img.convert('L')  # Convert to grayscale
            return pytesseract.image_to_string(
                img,
                config='--psm 6 --oem 3',
                lang='eng'
            ).lower()
    except Exception as e:
        raise Exception(f"Image processing error: {str(e)}")

def classify_document(text):
    """Classify the document based on keywords."""
    keywords = {
        "provident fund": "PF Filing",
        "supply": "GST Filing",
        "form no. 16": "ITR Filing",
    }

    keyword_counts = Counter()
    for keyword, category in keywords.items():
        pattern = rf'\b{re.escape(keyword)}\b'
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        keyword_counts[category] += len(matches)

    # If no keywords are found, classify as "Unknown Document Type"
    if not keyword_counts or sum(keyword_counts.values()) == 0:
        return "Unknown Document Type"

    # Otherwise, return the most common classification
    return keyword_counts.most_common(1)[0][0]

def extract_dates(text):
    """Extract dates from the text."""
    date_patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
        r'\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b',
        r'\b\w{3,9} \d{1,2}, \d{4}\b'
    ]

    dates = []
    for pattern in date_patterns:
        dates.extend(re.findall(pattern, text))

    return dates[0] if dates else "No Date Found"

def send_to_epf_script(extracted_text):
    """Send extracted text to epf.py for further processing."""
    try:
        # Call epf.py as a subprocess and pass the extracted text
        result = subprocess.run(
            ["python3", "epf.py", extracted_text],
            capture_output=True,
            text=True
        )
        # Print the output from epf.py for debugging
        print("Output from epf.py:", result.stdout, file=sys.stderr)
        if result.returncode != 0:
            print("Error in epf.py:", result.stderr, file=sys.stderr)
    except Exception as e:
        print(f"Error calling epf.py: {str(e)}", file=sys.stderr)

try:
    # Determine file to process
    if image_path and os.path.exists(image_path):
        file_path = image_path
    else:
        files = sorted(
            [f for f in os.listdir(UPLOADS_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf'))],
            key=lambda x: os.path.getmtime(os.path.join(UPLOADS_DIR, x)),
            reverse=True
        )
        
        if not files:
            print(json.dumps({"error": "No valid files found in uploads directory"}))
            sys.exit(1)
            
        file_path = os.path.join(UPLOADS_DIR, files[0])

    # Extract text based on file type
    if file_path.lower().endswith('.pdf'):
        extracted_text = process_pdf(file_path)
    else:
        extracted_text = process_image(file_path)

    if not extracted_text.strip():
        print(json.dumps({"error": "No text extracted from the file"}))
        sys.exit(1)

    # Classify the document
    classification = classify_document(extracted_text)

    # Extract dates from the text
    detected_date = extract_dates(extracted_text)

    # Print result in JSON format
    print(json.dumps({
        "classification": classification,
        "date": detected_date
    }))

    # # If the document is classified as PF Filing, send the text to epf.py
    # if classification == "PF Filing":
    #     send_to_epf_script(extracted_text)

except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)