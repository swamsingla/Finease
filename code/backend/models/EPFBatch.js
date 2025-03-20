const mongoose = require('mongoose');

const epfBatchSchema = new mongoose.Schema({
  email: { type: String, required: true, ref: 'User' },
  establishmentId: { type: String, required: true },
  establishmentName: { type: String, required: true },
  wageMonth: { type: String, required: true },
  totalEmployees: { type: Number, default: 0 },
  totalEpfWages: { type: Number, default: 0 },
  totalEpsWages: { type: Number, default: 0 },
  totalEpfContribution: { type: Number, default: 0 },
  totalEpsContribution: { type: Number, default: 0 },
  totalEpfEpsDifference: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['DRAFT', 'FINAL'],
    default: 'DRAFT' 
  }
}, { timestamps: true });

module.exports = mongoose.model('EPFBatch', epfBatchSchema);