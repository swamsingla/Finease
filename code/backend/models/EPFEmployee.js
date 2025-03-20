//This Schema Model is for ECR

const mongoose = require('mongoose');

const epfEmployeeSchema = new mongoose.Schema({
  email: { type: String, required: true, ref: 'User' },
  epfBatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'EPFBatch' },
  uan: { type: String, required: true },
  name: { type: String, required: true },
  grossWages: { type: Number, required: true },
  epfWages: { type: Number, required: true },
  epsWages: { type: Number, required: true },
  edliWages: { type: Number, required: true },
  ncpDays: { type: Number, required: true, default: 0 },
  refundOfAdvances: { type: Number, default: 0 },
  // Auto-calculated fields
  epfContribution: { type: Number },
  epsContribution: { type: Number },
  epfEpsDifference: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('EPFEmployee', epfEmployeeSchema);