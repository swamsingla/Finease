const mongoose = require('mongoose');

const itrSchema = new mongoose.Schema({
  // Basic fields (already present)
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
  netTaxPayable: { type: Number, required: true },

  // Additional fields for a comprehensive ITR-1 filing:
  // Personal Details
  name: { type: String, default: "N/A" },
  dob: { type: Date },
  aadhar: { type: String, default: "N/A" },
  city: { type: String, default: "N/A" },
  state: { type: String, default: "N/A" },
  pin: { type: String, default: "N/A" },
  phone: { type: String, default: "N/A" },

  // Bank Details (for refunds etc.)
  bankAccountNumber: { type: String, default: "N/A" },
  ifsc: { type: String, default: "N/A" },
  bankName: { type: String, default: "N/A" },
  branch: { type: String, default: "N/A" },

  // Income Details
  allowances: { type: Number, default: 0 },
  perquisites: { type: Number, default: 0 },
  deductionsUnderSection16: { type: Number, default: 0 },
  interestIncome: { type: Number, default: 0 },
  rentalIncome: { type: Number, default: 0 },
  otherIncome: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },

  // Deductions
  deduction80C: { type: Number, default: 0 },
  deduction80D: { type: Number, default: 0 },
  deduction80TTA: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },

  // Tax Computation
  grossTax: { type: Number, default: 0 },
  rebate: { type: Number, default: 0 },
  cess: { type: Number, default: 0 },
  tds: { type: Number, default: 0 },
  advanceTax: { type: Number, default: 0 },
  selfAssessmentTax: { type: Number, default: 0 },

  // Declaration Details
  declarationPlace: { type: String, default: "N/A" },
  declarationDate: { type: Date },
  declarationStatus: { type: String, default: "Draft" }
}, { timestamps: true });

module.exports = mongoose.model('ITR', itrSchema);
