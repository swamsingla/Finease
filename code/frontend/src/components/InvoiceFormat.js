import React, { useState, useRef } from 'react';
import { Button, TextField, Card, CardContent } from '@mui/material';
import html2canvas from 'html2canvas';

const InvoiceGenerator = () => {
  const [formData, setFormData] = useState({ amount: '', date: '', billTo: '', shipTo: '', item: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const invoiceRef = useRef(null);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => setSelectedImage(URL.createObjectURL(e.target.files[0]));

  const handleDownload = async () => {
    const canvas = await html2canvas(invoiceRef.current);
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `invoice-${formData.date}.png`;
    link.click();
  };

  return (
    <div>
      <Card ref={invoiceRef} style={{ padding: '20px' }}>
        {selectedImage && <img src={selectedImage} alt="Uploaded Logo" style={{ width: '100px', marginBottom: '20px' }} />}
        <p>Amount: {formData.amount}</p>
        <p>Date: {formData.date}</p>
        <p>Bill To: {formData.billTo}</p>
        <p>Ship To: {formData.shipTo}</p>
        <p>Item: {formData.item}</p>
      </Card>
      <CardContent>
        <input type="file" onChange={handleImageUpload} accept="image/*" />
        <TextField label="Amount" name="amount" fullWidth onChange={handleInputChange} />
        <TextField label="Date" type="date" name="date" fullWidth onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
        <TextField label="Bill To" name="billTo" fullWidth onChange={handleInputChange} />
        <TextField label="Ship To" name="shipTo" fullWidth onChange={handleInputChange} />
        <TextField label="Item" name="item" fullWidth onChange={handleInputChange} />
        <Button variant="contained" onClick={handleDownload} style={{ marginTop: '20px' }}>Generate and Download Invoice</Button>
      </CardContent>
    </div>
  );
};

export default InvoiceGenerator;
