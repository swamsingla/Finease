const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  soldBy: { type: String, default: "-" },
  soldByAddress: {
    buildingNumber: { type: String, default: "-" },
    address: { type: String, default: "-" },
    landmark: { type: String, default: "-" },
    city: { type: String, default: "-" },
    state: { type: String, default: "-" },
    pincode: { type: String, default: "-" },
    countryCode: { type: String, default: "IN" }
  },

  billingName: { type: String, default: "-" },
  billingAddress: {
    buildingNumber: { type: String, default: "-" },
    address: { type: String, default: "-" },
    landmark: { type: String, default: "-" },
    city: { type: String, default: "-" },
    state: { type: String, default: "-" },
    pincode: { type: String, default: "-" },
    countryCode: { type: String, default: "IN" }
  },

  shippingName: { type: String, default: "-" },
  shippingAddress: {
    buildingNumber: { type: String, default: "-" },
    address: { type: String, default: "-" },
    landmark: { type: String, default: "-" },
    city: { type: String, default: "-" },
    state: { type: String, default: "-" },
    pincode: { type: String, default: "-" },
    countryCode: { type: String, default: "IN" }
  },

  sameAsBilling: { type: Boolean, default: false },
  panNumber: { type: String, default: "-" },
  gstNumber: { type: String, default: "-" },
  stateUtCode: { type: String, default: "-" },
  orderDate: { type: String, default: "-" },
  orderNumber: { type: String, default: "-" },

  items: [{
    name: { type: String, default: "-" },
    unitPrice: { type: String, default: "0" },
    discount: { type: String, default: "0" },
    qty: { type: String, default: "1" },
    taxType: { type: String, default: "18" },
    netAmount: { type: String, default: "0" }
  }],

  invoiceNumber: { type: String, default: "-" },
  invoiceDate: { type: String, default: "-" },
  placeOfSupply: { type: String, default: "-" },
  placeOfDelivery: { type: String, default: "-" },

  netAmount: { type: String, default: "0.00" },
  taxAmount: { type: String, default: "0.00" },
  totalTax: { type: String, default: "0.00" },
  totalAmount: { type: String, default: "0.00" },
  

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

module.exports = mongoose.model('Invoice', invoiceSchema);