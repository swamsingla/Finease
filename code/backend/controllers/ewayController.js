const Eway = require('../models/Eway');

exports.createEway = async (req, res) => {
  try {
    const getDefaultVehicle = (vehicles = []) =>
      vehicles.length > 0
        ? vehicles.map(vehicle => ({
            mode: vehicle.mode || "Road",
            vehicleNo: vehicle.vehicleNo || "-",
            from: vehicle.from || "-",
            enteredDate: vehicle.enteredDate || "-",
            enteredBy: vehicle.enteredBy || "-"
          }))
        : [{
            mode: "Road",
            vehicleNo: "-",
            from: "-",
            enteredDate: "-",
            enteredBy: "-"
          }];

    // Construct eway bill object
    const ewayData = {
      userId: req.user ? req.user._id : null,
      ewayBillNo: req.body.ewayBillNo || "-",
      documentNo: req.body.documentNo || "-",
      ewayBillDate: req.body.ewayBillDate || "-",
      generatedBy: req.body.generatedBy || "-",
      validFrom: req.body.validFrom || "-",
      validUntil: req.body.validUntil || "-",
      supplierGstin: req.body.supplierGstin || "-",
      recipientGstin: req.body.recipientGstin || "-",
      placeOfDelivery: req.body.placeOfDelivery || "-",
      placeOfDispatch: req.body.placeOfDispatch || "-",
      valueOfGoods: req.body.valueOfGoods || "0.00",
      transportReason: req.body.transportReason || "Supply",
      transporter: req.body.transporter || "-",
      vehicles: getDefaultVehicle(req.body.vehicles),
      status: req.body.status || "DRAFT",
      createdAt: new Date()
    };

    // Create new eway bill
    const eway = new Eway(ewayData);
    await eway.save();

    res.status(201).json(eway);
  } catch (error) {
    console.error('E-way bill creation error:', error);
    res.status(500).json({
      message: 'Failed to create e-way bill',
      error: error.message
    });
  }
};