require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require("multer");
const connectDB = require('./config/database');
const invoiceRoutes = require('./routes/invoiceRoutes');
const authRoutes = require('./routes/authRoutes');
const classifyRoutes = require("./routes/classifyRoutes");
const epfRoutes = require("./routes/epfroutes"); // Import EPF routes
const gstRoutes = require("./routes/gstroutes");
const itrRoutes = require("./routes/itrroutes");
const chatbotRoutes = require('./routes/chatbotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const fileRoutes = require('./routes/fileRoutes'); // Import file routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use('/api/invoice', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ✅ Use the classify routes
app.use("/api/classify", classifyRoutes);

// ✅ Use the EPF routes
app.use(epfRoutes);
// ✅ Use the GST routes
app.use(gstRoutes);
// ✅ Use the ITR routes
app.use(itrRoutes);

app.use('/api/chatbot', chatbotRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', require('./routes/passwordResetRoutes'));

// File routes
app.use('/api/files', fileRoutes);

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
