import sys
import pytesseract
from PIL import Image
from collections import Counter
import re

# Load the image
image_path = sys.argv[1]

try:
    image = Image.open(image_path)

    # Extract text using Tesseract OCR
    extracted_text = pytesseract.image_to_string(image).lower()

    # Keywords for classification
    keywords = {
        "gst": "GST Filing",
        "esi": "ESI Filing",
        "epf": "PF Filing",
        "pf": "PF Filing",
        "itr": "ITR Filing",
        "income tax return": "ITR Filing",
    }

    # Count occurrences of each keyword (whole words only)
    keyword_counts = Counter()
    for keyword, category in keywords.items():
        pattern = rf'\b{re.escape(keyword)}\b'  # Match whole word
        matches = re.findall(pattern, extracted_text)
        keyword_counts[category] += len(matches)

    # Determine the most frequent category
    classification = "Unknown Document Type"
    if keyword_counts:
        most_common = keyword_counts.most_common(1)[0]  # (category, count)
        classification = most_common[0]

    # Extract dates from the text
    date_patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',  # Matches 12-05-2023, 12/05/23, etc.
        r'\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b',  # Matches 2023-05-12, 2023/05/12
        r'\b\w{3,9} \d{1,2}, \d{4}\b'  # Matches March 5, 2023
    ]

    dates = []
    for pattern in date_patterns:
        dates.extend(re.findall(pattern, extracted_text))

    # Pick the first detected date (assuming the first date in the document is most relevant)
    detected_date = dates[0] if dates else "No Date Found"

    # Return classification and detected date
    print(f"{classification} | Date: {detected_date}")

except Exception as e:
    print(f"Error: {e}")
