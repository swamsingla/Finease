const mongoose = require('mongoose');

const itrSchema = new mongoose.Schema({
  email: { type: String, required: true, ref: 'User' },
  panNo: { type: String, required: true },
  tan: { type: String, required: true },
  addressEmployee: { type: String, required: true },
  addressEmployer: { type: String, required: true },
  period: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  grossTotalIncome: { type: Number, required: true },
  grossTaxableIncome: { type: Number, required: true },
  netTaxPayable: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ITR', itrSchema);
