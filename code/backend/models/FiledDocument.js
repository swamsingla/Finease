const mongoose = require('mongoose');

const filedDocumentSchema = new mongoose.Schema({
  total: { type: Number, required: true },
  taxDeducted: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  delete: { type: Boolean, default: false },
  name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('FiledDocument', filedDocumentSchema);
