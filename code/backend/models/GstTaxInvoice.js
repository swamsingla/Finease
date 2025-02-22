const mongoose = require('mongoose');

const gstTaxInvoiceSchema = new mongoose.Schema({
  email: { type: String, required: true, ref: 'User' },
  gstin: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  dueDate: { 
    type: Date, 
    default: function() {
      // Set due date to 3 months after the invoice date
      const invoiceDate = new Date(this.invoiceDate);
      invoiceDate.setMonth(invoiceDate.getMonth() + 3);
      return invoiceDate;
    }
  },
  placeOfSupply: { type: String, required: true },
  address: { type: String, required: true },
  cgst: { type: Number, required: true },
  sgst: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('GstTaxInvoice', gstTaxInvoiceSchema);
