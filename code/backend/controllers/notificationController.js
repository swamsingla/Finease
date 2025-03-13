const GstTaxInvoice = require('../models/GstTaxInvoice');
const EwayBill = require('../models/EwayBill');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.getNotifications = async (req, res) => {
  try {
    // Extract and verify token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user using the decoded token
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const userEmail = user.email;

    // Query GstTaxInvoice for due dates
    const gstInvoices = await GstTaxInvoice.find({ email: userEmail });
    const gstNotifications = gstInvoices.map(invoice => ({
      type: 'GST Invoice',
      dueDate: invoice.dueDate,
      message: `GST Invoice due on ${new Date(invoice.dueDate).toLocaleDateString()}`,
    }));

    // Query EwayBill for valid until dates
    const ewayBills = await EwayBill.find({ email: userEmail });
    const ewayNotifications = ewayBills.map(bill => ({
      type: 'Eway Bill',
      dueDate: bill.validUntil,
      message: `Eway Bill valid until ${new Date(bill.validUntil).toLocaleDateString()}`,
    }));

    // Combine and sort notifications by due date
    const notifications = [...gstNotifications, ...ewayNotifications];
    notifications.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};
