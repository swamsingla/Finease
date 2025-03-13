const Invoice = require('../models/Invoice');
const EwayBill = require('../models/EwayBill');
const GstTaxInvoice = require('../models/GstTaxInvoice');
const FiledDocument = require('../models/FiledDocument');
const EPF = require('../models/EPF');
const ITR = require('../models/ITR');

// Get all user documents for dashboard
exports.getUserDocuments = async (req, res) => {
  try {
    // Get user info from auth middleware
    const email = req.user.email; // Assuming email is in the auth token

    // Fetch different document types from various collections
    const invoices = await Invoice.find({ email }).sort({ createdAt: -1 });
    const ewayBills = await EwayBill.find({ email }).sort({ createdAt: -1 });
    const gstDocuments = await GstTaxInvoice.find();
    const epfDocuments = await EPF.find({ email }).sort({ createdAt: -1 });
    const itrDocuments = await ITR.find({ email }).sort({ createdAt: -1 });
    const filedDocuments = await FiledDocument.find({ email }).sort({ createdAt: -1 });

    // Consolidate all documents with their types and dates
    const allDocuments = [
      ...invoices.map(doc => ({
        id: doc._id,
        type: 'invoice',
        date: doc.createdAt || doc.invoiceDate,
        amount: parseFloat(doc.totalAmount) || 0,
        status: doc.status || 'N/A'
      })),
      ...ewayBills.map(doc => ({
        id: doc._id,
        type: 'ewaybill',
        date: doc.createdAt || doc.date, // Adjust field name according to your schema
        amount: parseFloat(doc.totalValue) || 0,
        status: doc.status || 'N/A'
      })),
      ...gstDocuments.map(doc => ({
        id: doc._id,
        type: 'gst',
        date: doc.createdAt || doc.invoiceDate,
        amount: parseFloat(doc.totalAmount),
        taxAmount: parseFloat(doc.cgst) + parseFloat(doc.sgst) || 0
      })),
      ...epfDocuments.map(doc => ({
        id: doc._id,
        type: 'epf',
        date: doc.createdAt || doc.submissionDate,
        amount: 0, // Adjust if EPF has amount
        status: doc.status || 'N/A'
      })),
      ...itrDocuments.map(doc => ({
        id: doc._id,
        type: 'itr',
        date: doc.createdAt || doc.assessmentYear,
        amount: parseFloat(doc.totalTaxPaid) || 0,
        status: doc.status || 'N/A'
      })),
      ...filedDocuments.map(doc => ({
        id: doc._id,
        type: 'filed',
        date: doc.createdAt,
        documentType: doc.documentType,
        amount: parseFloat(doc.amount) || 0,
        status: doc.status || 'N/A'
      }))
    ];

    // Log document count for debugging
    console.log(`Found ${allDocuments.length} documents for user ${email}`);
    
    res.json({ 
      success: true,
      count: allDocuments.length,
      documents: allDocuments 
    });
    
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get document statistics for dashboard
exports.getDocumentStatistics = async (req, res) => {
  try {
    const email = req.user.email;
    const userId = req.user.id || req.user._id; // Get userId for invoice filtering
    const { year, month } = req.query;
    
    // Filter condition based on provided year and month
    let dateFilter = {};
    if (year && month) {
      // Filter for specific month and year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = { 
        createdAt: { 
          $gte: startDate, 
          $lte: endDate 
        } 
      };
    } else if (year) {
      // Filter for entire year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      dateFilter = { 
        createdAt: { 
          $gte: startDate, 
          $lte: endDate 
        } 
      };
    }
    
    // Create separate filters for invoices and other documents
    const invoiceFilter = { userId, ...dateFilter };
    const emailFilter = { email, ...dateFilter };
    
    // Count documents by type
    const invoiceCount = await Invoice.countDocuments(invoiceFilter);
    const ewayCount = await EwayBill.countDocuments(emailFilter);
    const gstCount = await GstTaxInvoice.countDocuments(emailFilter);
    const epfCount = await EPF.countDocuments(emailFilter);
    const itrCount = await ITR.countDocuments(emailFilter);
    const filedCount = await FiledDocument.countDocuments(emailFilter);
    
    // Calculate totals
    const totalDocuments = invoiceCount + ewayCount + gstCount + epfCount + itrCount + filedCount;
    
    // Get total amount from invoices - use invoiceFilter
    const invoices = await Invoice.find(invoiceFilter);
    const invoiceTotal = invoices.reduce((sum, doc) => sum + (parseFloat(doc.totalAmount) || 0), 0);
    
    // Get tax amount from GST documents - use emailFilter
    const gstDocs = await GstTaxInvoice.find(emailFilter);
    const taxTotal = gstDocs.reduce((sum, doc) => 
      sum + ((parseFloat(doc.cgst) || 0) + (parseFloat(doc.sgst) || 0)), 0);
    
    // Rest of the function remains the same...
    res.json({
      success: true,
      statistics: {
        totalDocuments,
        byType: {
          invoice: invoiceCount,
          ewaybill: ewayCount,
          gst: gstCount,
          epf: epfCount,
          itr: itrCount,
          filed: filedCount
        },
        financials: {
          invoiceTotal: invoiceTotal.toFixed(2),
          taxTotal: taxTotal.toFixed(2)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching document statistics:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get monthly document distribution for charts
exports.getMonthlyDocumentData = async (req, res) => {
  try {
    const email = req.user.email;
    const userId = req.user.id || req.user._id; // Get userId for invoice filtering
    const year = req.query.year || new Date().getFullYear();
    
    // Initialize monthly count arrays for each document type
    const monthlyData = {
      invoices: Array(12).fill(0),
      ewayBills: Array(12).fill(0),
      gstDocuments: Array(12).fill(0),
      totalCounts: Array(12).fill(0),
      amounts: Array(12).fill(0),
      taxes: Array(12).fill(0)
    };
    
    // Process each document type and populate monthly data
    const processDocuments = async (Model, dataKey, filterKey, filterValue) => {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      
      const filter = {
        [filterKey]: filterValue,
        createdAt: { $gte: startDate, $lte: endDate }
      };
      
      const documents = await Model.find(filter);
      
      documents.forEach(doc => {
        const date = new Date(doc.createdAt);
        const month = date.getMonth();
        
        monthlyData[dataKey][month]++;
        monthlyData.totalCounts[month]++;
        
        // Add amounts for financial documents
        if (doc.totalAmount) {
          monthlyData.amounts[month] += parseFloat(doc.totalAmount) || 0;
        }
        
        // Add tax amounts for GST documents
        if (doc.cgst && doc.sgst) {
          monthlyData.taxes[month] += (parseFloat(doc.cgst) + parseFloat(doc.sgst)) || 0;
        }
      });
    };
    
    // Process all document types with appropriate filter keys and values
    await Promise.all([
      processDocuments(Invoice, 'invoices', 'userId', userId),
      processDocuments(EwayBill, 'ewayBills', 'email', email),
      processDocuments(GstTaxInvoice, 'gstDocuments', 'email', email)
    ]);
    
    res.json({
      success: true,
      year,
      monthlyData: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        data: {
          invoices: monthlyData.invoices,
          ewayBills: monthlyData.ewayBills,
          gstDocuments: monthlyData.gstDocuments,
          totalCounts: monthlyData.totalCounts,
          amounts: monthlyData.amounts.map(val => parseFloat(val.toFixed(2))),
          taxes: monthlyData.taxes.map(val => parseFloat(val.toFixed(2)))
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching monthly document data:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};