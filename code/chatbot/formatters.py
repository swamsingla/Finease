"""
Format extracted document data into WhatsApp messages
"""

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

def format_classification_result(result):
    """Format classification result for WhatsApp message"""
    if "error" in result:
        return f"⚠️ *Classification Error*\n\n{result['error']}"
        
    message = f"🔍 *Document Classification Results*\n\n"
    message += f"📄 Document Type: *{result.get('classification', 'Unknown')}*\n"
    message += f"📅 Date: {result.get('date', 'No date detected')}\n\n"
    message += "Would you like to classify another document? Select an option from the menu."
    return message