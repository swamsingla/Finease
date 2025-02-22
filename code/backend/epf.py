import sys
import re
import json

def extract_epf_info(text):
    """Extract EPF-specific information from the OCR text."""
    try:
        # Extract TRRN Number (number after "TRRN")
        trrn_no = re.search(r"trr\s*no\s*:\s*(\d+)", text, re.IGNORECASE)
        trrn_no = trrn_no.group(1) if trrn_no else None

        # Extract Establishment ID (string after "Establishment ID")
        establishment_id = re.search(r"establishment\s*id\s*:\s*([a-z0-9]+)", text, re.IGNORECASE)
        establishment_id = establishment_id.group(1) if establishment_id else None

        # Extract Establishment Name (string after "Establishment Name")
        establishment_name = re.search(r"establishment\s*name\s*:\s*([a-z\s]+)", text, re.IGNORECASE)
        establishment_name = establishment_name.group(1).strip() if establishment_name else None

        # Extract Wage Month (text after "Wage Month")
        wage_month = re.search(r"wage\s*month\s*:\s*([a-z0-9\s]+)", text, re.IGNORECASE)
        wage_month = wage_month.group(1).strip() if wage_month else None

        # Extract Members (number after "Members" or "Subscribers")
        member = re.search(r"(members|subscribers)\s*:\s*(\d+)", text, re.IGNORECASE)
        member = int(member.group(2)) if member else None

        # Extract Total Amount (number after "Grand Total" or "Total Amount")
        total_amount = re.search(r"(grand\s*total|total\s*amount)\s*:\s*(\d+)", text, re.IGNORECASE)
        total_amount = int(total_amount.group(2)) if total_amount else None

        return {
            "trrnNo": trrn_no,
            "establishmentId": establishment_id,
            "establishmentName": establishment_name,
            "wageMonth": wage_month,
            "member": member,
            "totalAmount": total_amount,
            "text": text
        }
    except Exception as e:
        raise Exception(f"Error extracting EPF info: {str(e)}")

def main(extracted_text):
    """Main function to extract EPF info and print it."""
    try:
        # Extract EPF info from OCR text
        epf_data = extract_epf_info(extracted_text)

        # Print the extracted data
        print(json.dumps(epf_data, indent=2))
    except Exception as e:
        # Print errors to stderr
        print(json.dumps({"status": "error", "message": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # Get extracted text from command-line argument
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No extracted text provided."}), file=sys.stderr)
        sys.exit(1)

    extracted_text = sys.argv[1]
    main(extracted_text)