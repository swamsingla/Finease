// routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ----- RAG Document Setup -----
// In-memory storage for document chunks and their embeddings
const documentChunks = [];
const CHUNK_SIZE = 300; // Smaller chunks for better context retrieval
const CHUNK_OVERLAP = 100;

// Load the web documentation
let helpDocument = "";
try {
  // Try multiple possible paths to find the web_doc.txt file
  const possiblePaths = [
    path.join(__dirname, 'documents/website_doc.txt'),
    path.join(__dirname, '../documents/website_doc.txt'),
    path.join(__dirname, '../../documents/website_doc.txt'),
    path.join(process.cwd(), 'documents/website_doc.txt'),
    path.join(process.cwd(), 'dass-spring-2025-project-team-2\code\backend\documents\website_doc.txt')
  ];
  
  let docPath = null;
  for (const testPath of possiblePaths) {
    console.log(`Trying to load documentation from: ${testPath}`);
    if (fs.existsSync(testPath)) {
      docPath = testPath;
      break;
    }
  }
  
  if (docPath) {
    helpDocument = fs.readFileSync(docPath, 'utf8');
    console.log(`Successfully loaded web documentation from: ${docPath}`);
    console.log(`Loaded documentation with ${helpDocument.length} characters`);
    
    // Debug: Print the first 100 characters to verify content
    console.log(`Document preview: ${helpDocument.substring(0, 100)}...`);
  } else {
    // Last resort: Create the documentation file with the content from your message
    const fallbackDocContent = `**Help & FAQ**

---

**Welcome to TaxFile Support**

Welcome to TaxFile—the platform designed to simplify tax filing, invoice management, and financial reporting. This document provides answers to frequently asked questions and guides you through the main features of our website.

---

**1. Getting Started**

- **How do I create an account?**  
  To create an account, click on the "Sign Up" button on the homepage and follow the registration process. Enter your basic information, verify your email, and set a secure password.

- **How do I log in?**  
  Once you have an account, click the "Login" button and enter your credentials. If you forget your password, use the "Forgot Password" link to reset it.

---

**2. Tax Filing**

- **What tax filing services are available?**  
  Our platform allows you to file your taxes quickly and securely. You can upload your necessary documents, fill in required forms, and submit your tax filings online.

- **How do I file taxes?**  
  Navigate to the "File" section from your dashboard. Follow the step-by-step instructions, upload your documents as prompted, and review your filing summary before submission.

---

**3. Invoice Uploading**

- **How do I create invoices?**  
  Go to the "Invoice" section on the website. Select the invoice files from your computer (supported formats: PDF, JPG, PNG) or click on "Scan Document" to scan hardcopies using your device camera and click "Submit." Your invoice will be processed.

- **What if an invoice fails to upload?**  
  Check your internet connection and file format. If the problem persists, try again later or contact support for assistance.

---

**4. Financial Reporting**

- **What financial reports are available?**  
  TaxFile provides detailed financial reports, including summaries of tax filings, invoice histories, and expenditure tracking. These reports help you manage your finances more efficiently.

- **How do I access my reports?**  
Your reports are available on the home page of the website. You can either refer to the graphs or use the sliding window to go through your reports.

- **Can I customize the reports?**  
  Yes, you can filter and sort reports based on date, type of filing, or invoice status to view the most relevant information.

---

**5. Tax Filing**
- **How to file taxes?**
Click on the "File" button on the navigation bar and click on the tax name you want to file."

---

**6. Additional Features**

- **What support channels are available?**  
  If you have questions or need assistance, click the "Support" button on your dashboard to chat with our support bot. Alternatively, you can email us at support@taxfile.com.

- **How do I update my profile information?**  
  Navigate to the "Profile" section and click "Edit Profile." Here you can update your contact information, company details (for business accounts), and other settings.

---

**7. Troubleshooting**

- **Why is my document upload failing?**  
  Ensure that your file meets the supported format and size criteria. If the problem continues, clear your browser cache and try again.

- **What should I do if the system displays an error message?**  
  Note down the error message and try refreshing the page. If the error persists, contact our support team with the details so we can assist you promptly.

---

**8. Contact Us**

If you need further help or have feedback, please contact our support team:  
**Email:** support@taxfile.com  
**Phone:** [Your Support Number]

Thank you for choosing TaxFile. We're here to help make managing your taxes and finances as simple as possible.`;

    // Create the directory if it doesn't exist
    const documentsDir = path.join(process.cwd(), 'documents');
    if (!fs.existsSync(documentsDir)) {
      console.log(`Creating documents directory at: ${documentsDir}`);
      fs.mkdirSync(documentsDir, { recursive: true });
    }
    
    // Create the web_doc.txt file
    const newDocPath = path.join(documentsDir, 'web_doc.txt');
    fs.writeFileSync(newDocPath, fallbackDocContent);
    console.log(`Created web_doc.txt at: ${newDocPath}`);
    
    helpDocument = fallbackDocContent;
  }
} catch (err) {
  console.error("Error while handling web documentation:", err.message);
  helpDocument = 
    "This website provides tax filing, invoice uploading, and financial reporting services. " +
    "For more details, please refer to our FAQ section or contact support.";
  console.log("Using fallback documentation text");
}

// Function to split text into chunks with overlap
function splitTextIntoChunks(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    chunks.push(text.slice(startIndex, endIndex));
    startIndex = endIndex - overlap;
    
    // If the remaining text is shorter than the overlap, just end
    if (startIndex >= text.length - overlap) {
      break;
    }
  }
  
  return chunks;
}

// Function to get embeddings using Google's Gemini API
async function getEmbedding(text) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await axios.post(
      url,
      {
        content: {
          parts: [{ text: text }]
        }
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );
    
    if (!response.data.embedding || !response.data.embedding.values) {
      console.error("Unexpected embedding response structure:", JSON.stringify(response.data));
      throw new Error("Invalid embedding response structure");
    }
    
    return response.data.embedding.values;
  } catch (error) {
    console.error("Error getting embedding:", error.response ? error.response.data : error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

// Function to compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

// Process and embed document chunks with logging
async function processDocument() {
  try {
    console.log("Processing document chunks...");
    // Clear any existing chunks
    documentChunks.length = 0;
    
    // Check if document is loaded
    if (!helpDocument || helpDocument.length === 0) {
      console.error("No document content available to process");
      return { success: false, error: "No document content available" };
    }
    
    // Split the document into chunks
    const chunks = splitTextIntoChunks(helpDocument);
    console.log(`Split document into ${chunks.length} chunks`);
    
    if (chunks.length === 0) {
      console.error("Failed to create any document chunks");
      return { success: false, error: "Failed to create document chunks" };
    }
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i+1}/${chunks.length} (${chunks[i].length} chars)`);
      
      try {
        // Get the embedding for this chunk
        const embedding = await getEmbedding(chunks[i]);
        
        // Store the chunk and its embedding
        documentChunks.push({
          text: chunks[i],
          embedding: embedding
        });
        console.log(`Successfully embedded chunk ${i+1}`);
      } catch (error) {
        console.error(`Error embedding chunk ${i+1}:`, error.message);
        // Continue with other chunks
      }
    }
    
    console.log(`Document processing complete. ${documentChunks.length}/${chunks.length} chunks successfully processed.`);
    return { success: true, chunkCount: documentChunks.length };
  } catch (error) {
    console.error("Error processing document:", error);
    return { success: false, error: error.message };
  }
}

// Find the most relevant chunks for a query
async function findRelevantChunks(question, topK = 3) {  // Increased from 2 to 3 for better context
  try {
    // If no chunks are processed yet, return a generic chunk
    if (documentChunks.length === 0) {
      console.log("No document chunks available. Using the first 500 characters.");
      return [helpDocument.slice(0, 500)];
    }
    
    console.log(`Finding relevant chunks for question: "${question}"`);
    
    // Get embedding for the question
    const queryEmbedding = await getEmbedding(question);
    
    // Calculate similarity scores with all chunks
    const similarities = documentChunks.map((chunk, index) => {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        index,
        text: chunk.text,
        score
      };
    });
    
    // Sort by similarity score (highest first)
    similarities.sort((a, b) => b.score - a.score);
    
    // Log top matches for debugging
    similarities.slice(0, topK).forEach((item, i) => {
      console.log(`Top match #${i+1} (score: ${item.score.toFixed(4)}): ${item.text.substring(0, 50)}...`);
    });
    
    // Return the top K chunks
    const topChunks = similarities.slice(0, topK).map(item => item.text);
    return topChunks;
  } catch (error) {
    console.error("Error finding relevant chunks:", error);
    // Fallback to using all chunks up to a reasonable limit
    console.log("Using all available chunks as fallback");
    return documentChunks.slice(0, 3).map(chunk => chunk.text);
  }
}

// Function to generate a chatbot response using Google's Gemini API
async function generateResponse(question, contextChunks) {
  // Combine chunks into a single context
  const context = contextChunks.join('\n\n');
  
  // Craft a prompt that includes your retrieved context and the user's question
  const prompt = `You are a helpful assistant for TaxFile website. Answer questions using only the provided website documentation. Be concise and direct.

Website Documentation:
${context}

User Question: ${question}

Answer the question based only on the documentation provided. If the answer is not in the documentation, say "I don't have information about that in my documentation. For more details, please refer to our FAQ section or contact support." Double-check the documentation before saying information is not available, and if there's related information, provide that instead.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await axios.post(
      url,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300
        }
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    if (!response.data.candidates || response.data.candidates.length === 0) {
      console.error("Unexpected response structure:", JSON.stringify(response.data));
      throw new Error("Invalid response structure from Gemini API");
    }

    // Extract the generated text from Gemini's response
    const generatedText = response.data.candidates[0]?.content?.parts[0]?.text || "";
    return generatedText.trim();
  } catch (error) {
    console.error(
      "Error generating response using Gemini:",
      error.response ? error.response.data : error.message
    );
    return "I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
}

// Process the document on server startup
(async function initializeDocuments() {
  console.log("Initializing document processing...");
  const result = await processDocument();
  if (result.success) {
    console.log(`Successfully processed ${result.chunkCount} document chunks.`);
  } else {
    console.error(`Failed to process document chunks: ${result.error}`);
  }
})();

// Debugging endpoint to see chunks
router.get('/debug', (req, res) => {
  return res.json({
    chunksCount: documentChunks.length,
    documentLoaded: helpDocument.length > 0,
    documentLength: helpDocument.length,
    documentPreview: helpDocument.substring(0, 200) + '...',
    firstChunkPreview: documentChunks.length > 0 ? 
      documentChunks[0].text.substring(0, 100) + '...' : 'No chunks available',
    status: 'ok'
  });
});

// Main chatbot endpoint
router.post('/', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    console.log(`Processing chatbot request: "${question}"`);
    
    // If we don't have any processed chunks yet, process the document first
    if (documentChunks.length === 0) {
      console.log("No document chunks available. Processing document first...");
      const result = await processDocument();
      if (!result.success) {
        console.error("Failed to process document");
        return res.status(500).json({ error: 'Failed to process document. Please try again later.' });
      }
    }
    
    // Find relevant chunks for this question
    const relevantChunks = await findRelevantChunks(question);
    
    if (relevantChunks.length === 0) {
      console.warn("No relevant chunks found for question");
      return res.json({ answer: "I don't have specific information about that in my documentation. For more details, please refer to our FAQ section or contact support." });
    }
    
    // Generate a response based on the relevant chunks
    const answer = await generateResponse(question, relevantChunks);
    console.log(`Generated answer: "${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}"`);
    
    return res.json({ answer });
  } catch (error) {
    console.error("Error in chatbot processing:", error);
    return res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

// Endpoint to manually trigger document processing
router.post('/process-documents', async (req, res) => {
  try {
    console.log("Manual document processing triggered");
    const result = await processDocument();
    res.json(result);
  } catch (error) {
    console.error("Error in manual document processing:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;