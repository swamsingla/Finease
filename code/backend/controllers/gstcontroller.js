const GstTaxInvoice = require("../models/GstTaxInvoice");

exports.submitGSTData = async (req, res) => {
  const { email, gstin, invoiceDate, placeOfSupply, address, cgst, sgst, totalAmount } = req.body;

  try {
    // Create a new GST Tax Invoice document
    const gstData = new GstTaxInvoice({
      email,
      gstin,
      invoiceDate,
      placeOfSupply,
      address,
      cgst,
      sgst,
      totalAmount,
    });

    // Save the document to MongoDB
    await gstData.save();

    // Send success response
    res.status(200).json({ message: "GST data submitted successfully!" });
  } catch (error) {
    console.error("Error saving GST data:", error);
    res.status(500).json({ error: "Failed to submit GST data. Please try again." });
  }
};