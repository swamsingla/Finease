# FinEase Project Plan - Minutes of Meeting

## Project Details
- **Project Number:** 2  
- **Project Name:** FinEase  
- **Project Mentor (Sponsor):** Sarath Makineni  
- **Team Members:**  
  - Kushagra Trivedi  
  - Ronak Gaur  
  - Nidhi Vaidya  
  - Ayush Kumar Gupta  
  - Swam Singla  

## Key Discussion Points from Meeting:
1. **Odoo Access:** The client will provide Odoo custom plan access.
2. **Release 1 (R1):** Focus on basic UI, reading documentation, and GST filing.
3. **Release 2 (R2):** Include ITR APIs, sandboxes, and PF/ESI filings.
4. **Reconciliation Work:** Start working on file statement reading in R1; deliverables will be part of R2.
5. **Scanning Logic:** Two types of scanned documents:
   - Documents reflected in government databases.  
   - Invoices.  
   Example: If the GST number is on the seller's side, consider it a seller receipt. Otherwise, treat it as a purchase invoice.
6. **Open-Source Tools:** Open-source tools can be used for document classification.
7. **Data Handling:** Push data into both the database and sandboxes.
8. **Dashboard Requirements:** The dashboard should show all details from Figma, including GST data and graded input data.
9. **Reconciliation Logic:** Match data from bank statements, GST statements, and sales records.
   - Credit matches with sales.
   - Debit matches with incomes.
   - Notify if mismatches occur.
10. **Client Meeting:** A one-hour meeting is scheduled for Wednesday, where the client will demonstrate workflows.
11. **API Templates:** The client will share API templates during the meeting.

## Future Plans:
1. **R1 Deliverables:** Complete basic UI, document reading logic, and GST filing.
2. **R2 Deliverables:** Develop ITR filing, PF/ESI integration, and reconciliation logic.
3. **Document Scanning:** Implement seller receipt and purchase invoice classification logic.
4. **Open-Source Tools Integration:** Explore tools for automated document classification.
5. **Dashboard Implementation:** Display GST data, input data, and reconciliations as per Figma design.
6. **Reconciliation Module:** Develop logic for bank and GST statement matching with sales, expenditures, and cash flows.
7. **Workflow Review:** Attend the client's workflow demonstration on Wednesday.
8. **API Integration:** Integrate APIs based on the templates shared by the client.

