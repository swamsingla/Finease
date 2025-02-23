const mongoose = require('mongoose');

const ewaySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ewayBillNo: { type: String, default:"-"},
  documentNo: { type: String, default:"-"},
  ewayBillDate: { type: String, default:"-"},
  generatedBy: { type: String, default:"-"},
  validFrom: { type: String,default:"-"},
  validUntil: { type: String,default:"-"},
  supplierGstin: { type: String, default:"-"},
  recipientGstin: { type: String, default:"-"},
  placeOfDelivery: { type: String, default:"-"},
  placeOfDispatch: { type: String, default:"-"},
  valueOfGoods: { type: String, default:"-" },
  transportReason: { type: String, default: 'Supply' },
  transporter: { type: String, default:"-"},
  vehicles: [{
    mode: { type: String, default: 'Road' },
    vehicleNo: { type: String, default:"-"},
    from: { type: String, default:"-" },
    enteredDate: { type: String,default:"-"},
    enteredBy: { type: String,default:"-"}
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'FINAL'],
    default: 'DRAFT'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Eway', ewaySchema);