import React from "react";

export default function InvoiceForm({ formData, setFormData, onGenerate }) {
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        name: "",
        unitPrice: "0",
        discount: "0",
        qty: "1",
        taxType: "18",
        netAmount: "0"
      }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      
      // Calculate net amount automatically
      if (field === 'unitPrice' || field === 'discount' || field === 'qty') {
        const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
        const discount = parseFloat(newItems[index].discount) || 0;
        const qty = parseFloat(newItems[index].qty) || 0;
        const netAmount = (unitPrice - discount) * qty;
        newItems[index].netAmount = netAmount.toFixed(2);
      }
      
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const handleAddressChange = (e, addressType, field) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value,
      },
    }));
  };

  const handleSameAsBilling = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      sameAsBilling: checked,
      shippingName: checked ? prev.billingName : "",
      shippingAddress: checked ? { ...prev.billingAddress } : {
        buildingNumber: "",
        address: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        countryCode: "",
      },
    }));
  };

  return (
    <div className="space-y-4">
      {/* Seller Information */}
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-4">Seller Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold">Sold By:</label>
            <input
              type="text"
              name="soldBy"
              value={formData.soldBy}
              onChange={handleInputChange}
              className="border rounded p-1 w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Building Number:</label>
              <input
                type="text"
                value={formData.soldByAddress.buildingNumber}
                onChange={(e) => handleAddressChange(e, "soldByAddress", "buildingNumber")}
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">Address:</label>
              <input
                type="text"
                value={formData.soldByAddress.address}
                onChange={(e) => handleAddressChange(e, "soldByAddress", "address")}
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">Landmark:</label>
              <input
                type="text"
                value={formData.soldByAddress.landmark}
                onChange={(e) => handleAddressChange(e, "soldByAddress", "landmark")}
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">City:</label>
              <input
                type="text"
                value={formData.soldByAddress.city}
                onChange={(e) => handleAddressChange(e, "soldByAddress", "city")}
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">State:</label>
              <input
                type="text"
                value={formData.soldByAddress.state}
                onChange={(e) => handleAddressChange(e, "soldByAddress", "state")}
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">Pincode:</label>
              <input
                type="text"
                value={formData.soldByAddress.pincode}
                onChange={(e) => handleAddressChange(e, "soldByAddress", "pincode")}
                className="border rounded p-1 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-4">Billing Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold">Billing Name:</label>
            <input
              type="text"
              name="billingName"
              value={formData.billingName}
              onChange={handleInputChange}
              className="border rounded p-1 w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Building Number:</label>
              <input
                type="text"
                value={formData.billingAddress.buildingNumber}
                onChange={(e) => handleAddressChange(e, "billingAddress", "buildingNumber")}
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">Address:</label>
              <input
                type="text"
                value={formData.billingAddress.address}
                onChange={(e) => handleAddressChange(e, "billingAddress", "address")}
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">Landmark:</label>
              <input
                type="text"
                value={formData.billingAddress.landmark}
                onChange={(e) => handleAddressChange(e, "billingAddress", "landmark")}
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">City:</label>
              <input
                type="text"
                value={formData.billingAddress.city}
                onChange={(e) => handleAddressChange(e, "billingAddress", "city")}
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">State:</label>
              <input
                type="text"
                value={formData.billingAddress.state}
                onChange={(e) => handleAddressChange(e, "billingAddress", "state")}
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block font-semibold">Pincode:</label>
              <input
                type="text"
                value={formData.billingAddress.pincode}
                onChange={(e) => handleAddressChange(e, "billingAddress", "pincode")}
                className="border rounded p-1 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="border p-4 rounded">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Shipping Information</h3>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={formData.sameAsBilling}
              onChange={handleSameAsBilling}
              className="mr-2"
            />
            Same as Billing
          </label>
        </div>

        {!formData.sameAsBilling && (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold">Shipping Name:</label>
              <input
                type="text"
                value={formData.shippingName}
                onChange={(e) => setFormData(prev => ({ ...prev, shippingName: e.target.value }))}
                className="border rounded p-1 w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold">Building Number:</label>
                <input
                  type="text"
                  value={formData.shippingAddress.buildingNumber}
                  onChange={(e) => handleAddressChange(e, "shippingAddress", "buildingNumber")}
                  className="border rounded p-1 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Address:</label>
                <input
                  type="text"
                  value={formData.shippingAddress.address}
                  onChange={(e) => handleAddressChange(e, "shippingAddress", "address")}
                  className="border rounded p-1 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Landmark:</label>
                <input
                  type="text"
                  value={formData.shippingAddress.landmark}
                  onChange={(e) => handleAddressChange(e, "shippingAddress", "landmark")}
                  className="border rounded p-1 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">City:</label>
                <input
                  type="text"
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleAddressChange(e, "shippingAddress", "city")}
                  className="border rounded p-1 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">State:</label>
                <input
                  type="text"
                  value={formData.shippingAddress.state}
                  onChange={(e) => handleAddressChange(e, "shippingAddress", "state")}
                  className="border rounded p-1 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Pincode:</label>
                <input
                  type="text"
                  value={formData.shippingAddress.pincode}
                  onChange={(e) => handleAddressChange(e, "shippingAddress", "pincode")}
                  className="border rounded p-1 w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tax Information */}
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-4">Tax Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">PAN Number:</label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleInputChange}
              className="border rounded p-1 w-full"
            />
          </div>
          <div>
            <label className="block font-semibold">GST Number:</label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleInputChange}
              className="border rounded p-1 w-full"
            />
          </div>
          <div>
            <label className="block font-semibold">State/UT Code:</label>
            <input
              type="text"
              name="stateUtCode"
              value={formData.stateUtCode}
              onChange={handleInputChange}
              className="border rounded p-1 w-full"
            />
          </div>
        </div>
      </div>

      {/* Order Information */}
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-4">Order Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Order Date:</label>
            <input
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={handleInputChange}
              className="border rounded p-1 w-full"
            />
          </div>
          <div>
            <label className="block font-semibold">Order Number:</label>
            <input
              type="text"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleInputChange}
              className="border rounded p-1 w-full"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="border p-4 rounded">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Items</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Item
          </button>
        </div>

        {formData.items.map((item, idx) => (
          <div key={idx} className="border p-4 rounded mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Item #{idx + 1}</h4>
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-red-500"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold">Item Name:</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                  className="border rounded p-1 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Unit Price:</label>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                  className="border rounded p-1 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Discount:</label>
                <input
                  type="number"
                  value={item.discount}
                  onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                  className="border rounded p-1 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Quantity:</label>
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                  className="border rounded p-1 w-full"
                />
              </div>
              <div>
                <label className="block font-semibold">Tax Type:</label>
                <select
                  value={item.taxType}
                  onChange={(e) => handleItemChange(idx, 'taxType', e.target.value)}
                  className="border rounded p-1 w-full"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold">Net Amount:</label>
                <input
                  type="text"
                  value={item.netAmount}
                  readOnly
                  className="border rounded p-1 w-full bg-gray-100"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        className="bg-blue-600 text-white px-6 py-2 rounded shadow w-full"
      >
        Generate Invoice
      </button>
    </div>
  );
}