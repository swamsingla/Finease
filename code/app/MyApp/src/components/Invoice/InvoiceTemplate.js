import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const InvoiceTemplate = ({ invoiceData }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      {/* Invoice Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.companyName}>{invoiceData.soldBy}</Text>
          <Text style={styles.address}>
            {invoiceData.soldByAddress.buildingNumber}, {invoiceData.soldByAddress.address}
          </Text>
          <Text style={styles.address}>
            {invoiceData.soldByAddress.city}, {invoiceData.soldByAddress.state} - {invoiceData.soldByAddress.pincode}
          </Text>
          <Text style={styles.taxInfo}>GSTIN: {invoiceData.gstNumber}</Text>
          <Text style={styles.taxInfo}>PAN: {invoiceData.panNumber}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
          <Text style={styles.invoiceNumber}>Invoice #: {invoiceData.invoiceNumber}</Text>
          <Text style={styles.invoiceDate}>Date: {invoiceData.invoiceDate}</Text>
          <Text style={styles.orderNumber}>Order #: {invoiceData.orderNumber}</Text>
          <Text style={styles.orderDate}>Order Date: {invoiceData.orderDate}</Text>
        </View>
      </View>

      {/* Customer Details */}
      <View style={styles.customerDetails}>
        <View style={styles.billTo}>
          <Text style={styles.sectionTitle}>BILL TO:</Text>
          <Text style={styles.customerName}>{invoiceData.billingName}</Text>
          <Text style={styles.customerAddress}>
            {invoiceData.billingAddress.buildingNumber}, {invoiceData.billingAddress.address}
          </Text>
          <Text style={styles.customerAddress}>
            {invoiceData.billingAddress.city}, {invoiceData.billingAddress.state} - {invoiceData.billingAddress.pincode}
          </Text>
        </View>
        <View style={styles.shipTo}>
          <Text style={styles.sectionTitle}>SHIP TO:</Text>
          <Text style={styles.customerName}>{invoiceData.shippingName || invoiceData.billingName}</Text>
          <Text style={styles.customerAddress}>
            {invoiceData.sameAsBilling
              ? `${invoiceData.billingAddress.buildingNumber}, ${invoiceData.billingAddress.address}`
              : `${invoiceData.shippingAddress.buildingNumber}, ${invoiceData.shippingAddress.address}`}
          </Text>
          <Text style={styles.customerAddress}>
            {invoiceData.sameAsBilling
              ? `${invoiceData.billingAddress.city}, ${invoiceData.billingAddress.state} - ${invoiceData.billingAddress.pincode}`
              : `${invoiceData.shippingAddress.city}, ${invoiceData.shippingAddress.state} - ${invoiceData.shippingAddress.pincode}`}
          </Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.itemsContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Item Description</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Unit Price</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Discount</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Net Amount</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Tax (%)</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Tax Amount</Text>
        </View>

        {invoiceData.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{item.name}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{formatCurrency(item.unitPrice)}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.qty}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{formatCurrency(item.discount)}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{formatCurrency(item.netAmount)}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.taxType}%</Text>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>{formatCurrency(item.totalTax)}</Text>
          </View>
        ))}
      </View>

      {/* Total Section */}
      <View style={styles.totalSection}>
        <View style={{ flex: 1 }} />
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoiceData.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Tax:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoiceData.totalTax)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoiceData.grandTotal)}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Thank you for your business!</Text>
        <Text style={styles.footerTerms}>Terms & Conditions Apply</Text>
        <Text style={styles.footerNote}>
          This is a computer-generated invoice and does not require a signature.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    marginBottom: 2,
    color: '#555',
  },
  taxInfo: {
    fontSize: 12,
    marginBottom: 2,
    color: '#555',
  },
  invoiceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0066cc',
  },
  invoiceNumber: {
    fontSize: 14,
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  customerDetails: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 20,
  },
  billTo: {
    flex: 1,
    paddingRight: 10,
  },
  shipTo: {
    flex: 1,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#777',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 12,
    marginBottom: 2,
    color: '#555',
  },
  itemsContainer: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#444',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
  },
  totalSection: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
  },
  totalContainer: {
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 14,
    color: '#555',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 5,
    paddingTop: 5,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  footerTerms: {
    fontSize: 12,
    color: '#777',
    marginBottom: 5,
  },
  footerNote: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default InvoiceTemplate;