const EPF = require("../models/EPF");

// Submit EPF data
exports.submitEPFData = async (req, res) => {
  const { email, trrnNo, establishmentId, establishmentName, wageMonth, member, totalAmount } = req.body;

  try {
    // Create a new EPF document
    const epfData = new EPF({
      email,
      trrnNo,
      establishmentId,
      establishmentName,
      wageMonth,
      member,
      totalAmount,
    });

    // Save the document to MongoDB
    await epfData.save();

    // Send success response
    res.status(200).json({ message: "EPF data submitted successfully!" });
  } catch (error) {
    console.error("Error saving EPF data:", error);
    res.status(500).json({ error: "Failed to submit EPF data. Please try again." });
  }
};