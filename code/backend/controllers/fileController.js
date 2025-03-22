const FileUpload = require('../models/FileUpload');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Save file to database
exports.saveFile = async (req, res) => {
  try {
    const { userId, originalName, mimeType, fileData, documentType, classification, extractedData, size, whatsappNumber } = req.body;
    
    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const filename = `${Date.now()}-${originalName}`;
    
    const newFile = new FileUpload({
      userId,
      filename,
      originalName,
      mimeType,
      fileData: Buffer.from(fileData, 'base64'),
      documentType,
      classification,
      extractedData,
      size,
      uploadSource: 'chatbot',
      whatsappNumber
    });
    
    await newFile.save();
    
    res.status(201).json({ 
      message: 'File saved successfully',
      fileId: newFile._id,
      filename: newFile.filename 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get files for a user
exports.getFiles = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const files = await FileUpload.find({ userId })
      .select('-fileData') // Exclude the actual file data for performance
      .sort({ createdAt: -1 });
    
    res.json(files);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a single file
exports.getFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user._id;
    
    const file = await FileUpload.findOne({ _id: fileId, userId });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json(file);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Download a file
exports.downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user._id;
    
    const file = await FileUpload.findOne({ _id: fileId, userId });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.set('Content-Type', file.mimeType);
    res.set('Content-Disposition', `attachment; filename="${file.originalName}"`);
    
    res.send(file.fileData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Authenticate WhatsApp user
exports.authenticateWhatsApp = async (req, res) => {
  try {
    const { email, password, whatsappNumber } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create token with WhatsApp number
    const token = jwt.sign({ 
      userId: user._id,
      whatsappNumber 
    }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        whatsappNumber
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
