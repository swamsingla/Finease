const ITR = require("../models/ITR");

exports.submitITRData = async (req, res) => {
  const {
    email,
    panNo,
    tan,
    addressEmployee,
    addressEmployer,
    period,
    grossTotalIncome,
    grossTaxableIncome,
    netTaxPayable,
  } = req.body;

  try {
    // Create a new ITR document
    const itrData = new ITR({
      email,
      panNo,
      tan,
      addressEmployee,
      addressEmployer,
      period,
      grossTotalIncome,
      grossTaxableIncome,
      netTaxPayable,
    });

    // Save the document to MongoDB
    await itrData.save();

    // Send success response
    res.status(200).json({ message: "ITR data submitted successfully!" });
  } catch (error) {
    console.error("Error saving ITR data:", error);
    res.status(500).json({ error: "Failed to submit ITR data. Please try again." });
  }
};