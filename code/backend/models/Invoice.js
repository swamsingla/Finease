const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  email: { type: String, required: true, ref: 'User' },
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  billingAddress: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  soldBy: { type: String, required: true },
  gstin: { type: String, required: true },
  panNo: { type: String, required: true },
  items: [{
    description: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true },
    taxPercent: { type: Number, required: true },
    discount: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
