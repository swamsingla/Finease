const Invoice = require('../models/Invoice');

exports.createInvoice = async (req, res) => {
  try {
    const getDefaultAddress = (address = {}) => ({
      buildingNumber: address.buildingNumber || "-",
      address: address.address || "-",
      landmark: address.landmark || "-",
      city: address.city || "-",
      state: address.state || "-",
      pincode: address.pincode || "-",
      countryCode: address.countryCode || "IN"
    });

    const getDefaultItem = (items = []) =>
      items.length > 0
        ? items.map(item => ({
            name: item.name || "-",
            unitPrice: item.unitPrice || "0",
            discount: item.discount || "0",
            qty: item.qty || "1",
            taxType: item.taxType || "18",
            netAmount: item.netAmount || "0"
          }))
        : [{
            name: "-",
            unitPrice: "0",
            discount: "0",
            qty: "1",
            taxType: "18",
            netAmount: "0"
          }];

    // Construct invoice object
    const invoiceData = {
      userId: req.user ? req.user._id : null,
      soldBy: req.body.soldBy || "-",
      soldByAddress: getDefaultAddress(req.body.soldByAddress),
      billingName: req.body.billingName || "-",
      billingAddress: getDefaultAddress(req.body.billingAddress),
      shippingName: req.body.shippingName || "-",
      shippingAddress: getDefaultAddress(req.body.shippingAddress),
      sameAsBilling: req.body.sameAsBilling || false,
      panNumber: req.body.panNumber || "-",
      gstNumber: req.body.gstNumber || "-",
      stateUtCode: req.body.stateUtCode || "-",
      orderDate: req.body.orderDate || "-",
      orderNumber: req.body.orderNumber || "-",
      items: getDefaultItem(req.body.items),
      invoiceNumber: req.body.invoiceNumber || "-",
      invoiceDate: req.body.invoiceDate || "-",
      placeOfSupply: req.body.placeOfSupply || "-",
      placeOfDelivery: req.body.placeOfDelivery || "-",
      netAmount: req.body.netAmount || "0.00",
      taxAmount: req.body.taxAmount || "0.00",
      totalAmount: req.body.totalAmount || "0.00",
      status: req.body.status || "DRAFT",
      createdAt: new Date()
    };

    // Create new invoice
    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};
