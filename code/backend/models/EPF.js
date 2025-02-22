const mongoose = require('mongoose');

const epfSchema = new mongoose.Schema({
  email: { type: String, required: true, ref: 'User' },
  trrnNo: { type: String, required: true },
  establishmentId: { type: String, required: true },
  establishmentName: { type: String, required: true },
  wageMonth: { type: String, required: true },
  member: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('EPF', epfSchema);
