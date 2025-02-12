require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require("multer");
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const classifyRoutes = require("./routes/classifyRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Use the classify routes
app.use("/api/classify", classifyRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', require('./routes/passwordResetRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
