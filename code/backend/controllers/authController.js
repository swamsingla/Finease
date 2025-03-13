const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, companyName, gstin} = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      email,
      password,
      role: gstin ? 'business' : 'individual',
      companyName,
      gstin
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        createdAt: user.createdAt, // ✅ Add this
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        gstin: user.gstin,
        createdAt: user.createdAt, // ✅ Add this
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// In authController.js

exports.updateProfile = async (req, res) => {
  try {
    const { email, companyName, gstin } = req.body;
    // req.user is set by your auth middleware
    const user = req.user;
    if (email) user.email = email;
    if (companyName !== undefined) user.companyName = companyName;
    if (gstin !== undefined) user.gstin = gstin;
    
    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        gstin: user.gstin,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
