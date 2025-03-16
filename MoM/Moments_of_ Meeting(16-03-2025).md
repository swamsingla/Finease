# **FinEase Project Plan - Minutes of Meeting (MoM)**

## **Project Details**
- **Project Number:** 2  
- **Project Name:** FinEase  
- **Project Mentor (Sponsor):** Sarath Makineni  
- **Team Members:**  
  - Kushagra Trivedi  
  - Ronak Gaur  
  - Nidhi Vaidya  
  - Ayush Kumar Gupta  
  - Swam Singla  

## **Key Discussion Points from Meeting (March 15)**

### **Client Demonstration**
- Release 1 (R1) was successfully presented to the client.  

### **NanoNets API Limitations**
- The free-tier NanoNets API has strict constraints:  
  - Maximum of **50 GST, 50 PF, and 3 ITR** requests per day.  
  - Model retraining can only be done **once every 24 hours**.  
  - A maximum of **3 models** can be created on a free account.  

### **Hosting and Deployment**
- The **backend and chatbot** have been deployed on **Render**.  
- The **frontend** has been deployed on **Vercel**.  

### **Classifier Performance Issues**
- The document classifier takes **2-3 minutes** to process on Render’s free-tier.  
- WhatsApp chatbot threads timeout after **15 seconds**, making it **incompatible** with Render's free account.  

### **Client Support for API & Hosting**
- The client has agreed to provide:  
  - **Paid access** to NanoNets API.  
  - **Bitbucket access** for improved hosting and deployment.  

### **Sandbox API Filing**
- Sandbox testing for **GST filing** will begin next week.  

### **Database Integration for WhatsApp Chatbot**
- Logic for mapping WhatsApp chatbot responses to **database storage** will be implemented.  

### **Vercel Access Restriction**
- The **Vercel account** does not allow open access to all users.  

## **Future Plans**
- Optimize API usage and explore paid options for better performance.  
- Implement mapping of WhatsApp chatbot responses to database storage.  
- Begin **GST sandbox API filing** as the first step in real tax filing.  
- Work on Bitbucket-based hosting and deployment.  
- Look for potential optimizations to reduce classification time.  
- Ensure that Vercel access settings align with project requirements.  
