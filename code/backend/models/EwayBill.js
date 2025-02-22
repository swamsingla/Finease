const mongoose = require('mongoose');

const ewayBillSchema = new mongoose.Schema({
  email: { type: String, required: true, ref: 'User' },
  billNo: { type: String, required: true },
  billDate: { type: Date, required: true },
  generatedBy: { type: String, required: true },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  gstNoSupplier: { type: String, required: true },
  gstNoRecipient: { type: String, required: true },
  placeOfDispatch: { type: String, required: true },
  placeOfDelivery: { type: String, required: true },
  documentNo: { type: String, required: true },
  documentDate: { type: Date, required: true },
  valueOfGood: { type: Number, required: true },
  reason: { type: String, required: true },
  transporter: { type: String, required: true },
  transportDetails: [{
    mode: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    from: { type: String, required: true },
    enteredDate: { type: Date, required: true },
    enteredBy: { type: String, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('EwayBill', ewayBillSchema);
