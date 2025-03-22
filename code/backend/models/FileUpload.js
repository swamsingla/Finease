const mongoose = require("mongoose");

const fileUploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileData: {
      type: Buffer,
      required: true,
    },
    documentType: {
      type: String,
      enum: ["gst_filing", "itr_filing", "pf_filing", "unknown", "classify"],
      default: "unknown",
    },
    classification: {
      type: String,
      default: "Unknown",
    },
    extractedData: {
      type: Object,
      default: {},
    },
    size: {
      type: Number,
      required: true,
    },
    uploadSource: {
      type: String,
      enum: ["web", "chatbot"],
      default: "web",
    },
    whatsappNumber: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

const FileUpload = mongoose.model("FileUpload", fileUploadSchema);

module.exports = FileUpload;
