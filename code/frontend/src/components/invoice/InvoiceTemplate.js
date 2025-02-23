// src/components/InvoiceTemplate.jsx
import React from "react";

// We forwardRef so react-to-print can target this component
const InvoiceTemplate = React.forwardRef(({ data }, ref) => {
  const {
    soldBy,
    soldByAddress,
    billingName,
    billingAddress,
    shippingName,
    shippingAddress,
    panNumber,
    gstNumber,
    stateUtCode,
    orderDate,
    orderNumber,
    items,
    invoiceNumber,
    invoiceDate,
    placeOfSupply,
    placeOfDelivery,
    netAmount,
    taxAmount,
    totalAmount,
    qrImage,
    logoImage,
  } = data;

  return (
    <div
      ref={ref}
      className="w-[210mm] mx-auto p-6 font-sans border border-gray-700"
      style={{ minHeight: "297mm" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <img src={logoImage} alt="Logo" className="h-10" />
        </div>
        <div className="text-right">
          <h3 className="m-0 font-bold">Tax Invoice/Bill of Supply/Cash Memo</h3>
          <p className="m-0">(Original for Recipient)</p>
        </div>
      </div>

      <hr className="my-2 border-black" />

      {/* Sold By / Billing Address */}
      <div className="flex justify-between mt-2">
        <div className="w-1/2">
          <p className="font-semibold">Sold by:</p>
          <p>{soldBy}</p>
          <p>
            {soldByAddress.buildingNumber}, {soldByAddress.address}
          </p>
          <p>{soldByAddress.landmark}</p>
          <p>
            {soldByAddress.city}, {soldByAddress.state} - {soldByAddress.pincode}
          </p>
          <p>{soldByAddress.countryCode}</p>
        </div>
        <div className="w-1/2 text-right">
          <p className="font-semibold">Billing Address:</p>
          <p>{billingName}</p>
          <p>
            {billingAddress.buildingNumber}, {billingAddress.address}
          </p>
          <p>{billingAddress.landmark}</p>
          <p>
            {billingAddress.city}, {billingAddress.state} -{" "}
            {billingAddress.pincode}
          </p>
          <p>{billingAddress.countryCode}</p>
          <p>
            <span className="font-semibold">State/UT Code:</span> {stateUtCode}
          </p>
        </div>
      </div>

      <hr className="my-2 border-black" />

      {/* Shipping Address / PAN / GST */}
      <div className="flex justify-between">
        <div className="w-1/2">
          <p className="font-semibold">Shipping Address:</p>
          <p>{shippingName}</p>
          <p>
            {shippingAddress.buildingNumber}, {shippingAddress.address}
          </p>
          <p>{shippingAddress.landmark}</p>
          <p>
            {shippingAddress.city}, {shippingAddress.state} -{" "}
            {shippingAddress.pincode}
          </p>
          <p>{shippingAddress.countryCode}</p>
        </div>
        <div className="w-1/2 text-right">
          <p>
            <span className="font-semibold">PAN No:</span> {panNumber}
          </p>
          <p>
            <span className="font-semibold">GST Registration Number:</span>{" "}
            {gstNumber}
          </p>
        </div>
      </div>

      <hr className="my-2 border-black" />

      {/* QR / Order Details */}
      <div className="flex justify-between">
        <div className="w-1/2">
          <p className="font-semibold">Dynamic QR Code:</p>
          <img src={qrImage} alt="QR Code" className="w-20 h-20" />
        </div>
        <div className="w-1/2 text-right">
          <p>
            <span className="font-semibold">Order Date:</span> {orderDate}
          </p>
          <p>
            <span className="font-semibold">Order Number:</span> {orderNumber}
          </p>
          <p>
            <span className="font-semibold">Invoice Number:</span> {invoiceNumber}
          </p>
          <p>
            <span className="font-semibold">Invoice Date:</span> {invoiceDate}
          </p>
        </div>
      </div>

      <hr className="my-2 border-black" />

      {/* Place of Supply / Delivery */}
      <div className="flex justify-between">
        <p>
          <span className="font-semibold">Place of Supply (Billing State):</span>{" "}
          {placeOfSupply}
        </p>
        <p>
          <span className="font-semibold">
            Place of Delivery (Shipping State):
          </span>{" "}
          {placeOfDelivery}
        </p>
      </div>

      <hr className="my-2 border-black" />

      {/* Items Table */}
      <table className="w-full border-collapse mb-2 text-sm">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-1">Item Name</th>
            <th className="text-right py-1">Unit Price</th>
            <th className="text-right py-1">Discount</th>
            <th className="text-right py-1">Qty</th>
            <th className="text-right py-1">Tax Type</th>
            <th className="text-right py-1">Total Tax</th>
            <th className="text-right py-1">Net Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="py-1">{item.name}</td>
              <td className="py-1 text-right">{item.unitPrice}</td>
              <td className="py-1 text-right">{item.discount}</td>
              <td className="py-1 text-right">{item.qty}</td>
              <td className="py-1 text-right">{item.taxType}</td>
              <td className="py-1 text-right">{item.totalTax}</td>
              <td className="py-1 text-right">{item.netAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="text-right">
        <div>Net Amount: {netAmount}</div>
        <div>Tax Amount: {taxAmount}</div>
        <div className="font-bold">Total Amount: {totalAmount}</div>
      </div>

      <hr className="my-2 border-black" />

    </div>
  );
});

export default InvoiceTemplate;
