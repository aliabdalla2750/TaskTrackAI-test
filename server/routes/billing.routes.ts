import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { isAuthenticated, isAgencyUser, isAdminUser } from '../middleware/auth';

const router = Router();

// Authentication middleware for all billing routes
router.use(isAuthenticated);

// Route middleware to ensure user is either an agency owner or admin
const ensureAgencyOrAdmin = (req: Request, res: Response, next: Function) => {
  if (req.user?.role === 'admin' || req.user?.role === 'agency') {
    return next();
  }
  return res.status(403).json({ error: 'Unauthorized: Insufficient permissions' });
};

// Get all billings (invoices) for an agency
router.get('/agency/:agencyId/billings', isAgencyUser, async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;
    
    // Check if the user has access to this agency
    if (req.user?.role === 'agency' && req.user.agencyId !== parseInt(agencyId)) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this agency' });
    }
    
    const billings = await storage.getBillingsByAgency(parseInt(agencyId));
    res.json({ billings });
  } catch (error) {
    console.error('Error fetching billings:', error);
    res.status(500).json({ error: 'Failed to fetch billings' });
  }
});

// Get a specific billing (invoice)
router.get('/billings/:id', ensureAgencyOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const billing = await storage.getBilling(parseInt(id));
    
    if (!billing) {
      return res.status(404).json({ error: 'Billing not found' });
    }
    
    // Check if the user has access to this billing
    if (req.user?.role === 'agency' && req.user.agencyId !== billing.agencyId) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this billing' });
    }
    
    res.json(billing);
  } catch (error) {
    console.error('Error fetching billing:', error);
    res.status(500).json({ error: 'Failed to fetch billing' });
  }
});

// Create a new billing (invoice)
router.post('/billings', ensureAgencyOrAdmin, async (req: Request, res: Response) => {
  try {
    const billingSchema = z.object({
      clientId: z.number(),
      projectId: z.number().optional(),
      description: z.string(),
      amount: z.number().positive(),
      dueDate: z.string(),
      agencyId: z.number(),
      status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).default('pending'),
      notes: z.string().optional(),
    });
    
    const validationResult = billingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid input data', 
        details: validationResult.error.format() 
      });
    }
    
    const billingData = validationResult.data;
    
    // Check if the user has access to this agency
    if (req.user?.role === 'agency' && req.user.agencyId !== billingData.agencyId) {
      return res.status(403).json({ error: 'Unauthorized: You cannot create billings for other agencies' });
    }
    
    // Generate invoice number
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    // Get count of invoices to generate sequential number
    const existingBillings = await storage.getBillingsByAgency(billingData.agencyId);
    const invoiceNumber = `INV-${year}${month}-${(existingBillings.length + 1).toString().padStart(3, '0')}`;
    
    const billing = await storage.createBilling({
      ...billingData,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    });
    
    res.status(201).json(billing);
  } catch (error) {
    console.error('Error creating billing:', error);
    res.status(500).json({ error: 'Failed to create billing' });
  }
});

// Update a billing (invoice)
router.put('/billings/:id', ensureAgencyOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const billing = await storage.getBilling(parseInt(id));
    
    if (!billing) {
      return res.status(404).json({ error: 'Billing not found' });
    }
    
    // Check if the user has access to this billing
    if (req.user?.role === 'agency' && req.user.agencyId !== billing.agencyId) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this billing' });
    }
    
    const billingSchema = z.object({
      description: z.string().optional(),
      amount: z.number().positive().optional(),
      dueDate: z.string().optional(),
      status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
      notes: z.string().optional(),
    });
    
    const validationResult = billingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid input data', 
        details: validationResult.error.format() 
      });
    }
    
    const updatedBilling = await storage.updateBilling(parseInt(id), validationResult.data);
    res.json(updatedBilling);
  } catch (error) {
    console.error('Error updating billing:', error);
    res.status(500).json({ error: 'Failed to update billing' });
  }
});

// Mark a billing as paid and create a payment record
router.post('/billings/:id/pay', ensureAgencyOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const billing = await storage.getBilling(parseInt(id));
    
    if (!billing) {
      return res.status(404).json({ error: 'Billing not found' });
    }
    
    // Check if the user has access to this billing
    if (req.user?.role === 'agency' && req.user.agencyId !== billing.agencyId) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this billing' });
    }
    
    // Check if the billing is already paid
    if (billing.status === 'paid') {
      return res.status(400).json({ error: 'This billing is already paid' });
    }
    
    const paymentSchema = z.object({
      paymentMethod: z.string(),
      reference: z.string().optional(),
      notes: z.string().optional(),
      paymentDate: z.string().default(new Date().toISOString()),
    });
    
    const validationResult = paymentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid payment data', 
        details: validationResult.error.format() 
      });
    }
    
    const paymentData = validationResult.data;
    
    // Update billing status to paid
    const updatedBilling = await storage.updateBilling(billing.id, { 
      status: 'paid',
      paymentDate: paymentData.paymentDate
    });
    
    // Create payment record
    const payment = await storage.createPayment({
      billingId: billing.id,
      agencyId: billing.agencyId,
      clientId: billing.clientId,
      amount: billing.amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      reference: paymentData.reference || null,
      notes: paymentData.notes || null,
      createdAt: new Date().toISOString(),
    });
    
    // Update wallet balance
    const wallet = await storage.getWalletByAgency(billing.agencyId);
    
    if (wallet) {
      await storage.updateWallet(wallet.id, {
        currentBalance: wallet.currentBalance + billing.amount,
        totalRevenue: wallet.totalRevenue + billing.amount,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      await storage.createWallet({
        agencyId: billing.agencyId,
        currentBalance: billing.amount,
        totalRevenue: billing.amount,
        lastUpdated: new Date().toISOString(),
      });
    }
    
    res.json({ billing: updatedBilling, payment });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Get all payments for an agency
router.get('/agency/:agencyId/payments', isAgencyUser, async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;
    
    // Check if the user has access to this agency
    if (req.user?.role === 'agency' && req.user.agencyId !== parseInt(agencyId)) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this agency' });
    }
    
    const payments = await storage.getPaymentsByAgency(parseInt(agencyId));
    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get wallet information for an agency
router.get('/agency/:agencyId/wallet', isAgencyUser, async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;
    
    // Check if the user has access to this agency
    if (req.user?.role === 'agency' && req.user.agencyId !== parseInt(agencyId)) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this agency' });
    }
    
    const wallet = await storage.getWalletByAgency(parseInt(agencyId));
    
    if (!wallet) {
      // Create a new wallet if it doesn't exist
      const newWallet = await storage.createWallet({
        agencyId: parseInt(agencyId),
        currentBalance: 0,
        totalRevenue: 0,
        lastUpdated: new Date().toISOString(),
      });
      
      return res.json(newWallet);
    }
    
    res.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet information' });
  }
});

// Generate financial reports
router.get('/agency/:agencyId/financial-reports', isAgencyUser, async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;
    const { period, startDate, endDate } = req.query;
    
    // Check if the user has access to this agency
    if (req.user?.role === 'agency' && req.user.agencyId !== parseInt(agencyId)) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this agency' });
    }
    
    // Validate period
    if (period && !['weekly', 'monthly', 'yearly', 'custom'].includes(period as string)) {
      return res.status(400).json({ error: 'Invalid period. Must be weekly, monthly, yearly, or custom' });
    }
    
    // For custom period, ensure start and end dates are provided
    if (period === 'custom' && (!startDate || !endDate)) {
      return res.status(400).json({ error: 'Start date and end date are required for custom period' });
    }
    
    let start: Date;
    let end: Date = new Date();
    
    // Set date range based on period
    switch (period) {
      case 'weekly':
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start = new Date();
        start.setMonth(start.getMonth() - 1);
        break;
      case 'yearly':
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'custom':
        start = new Date(startDate as string);
        end = new Date(endDate as string);
        break;
      default:
        // Default to monthly if not specified
        start = new Date();
        start.setMonth(start.getMonth() - 1);
    }
    
    // Get billings and payments for the period
    const billings = await storage.getBillingsByAgency(parseInt(agencyId));
    const payments = await storage.getPaymentsByAgency(parseInt(agencyId));
    
    // Filter by date range
    const filteredBillings = billings.filter(billing => {
      const billingDate = new Date(billing.createdAt);
      return billingDate >= start && billingDate <= end;
    });
    
    const filteredPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= start && paymentDate <= end;
    });
    
    // Calculate totals
    const totalBilled = filteredBillings.reduce((sum, billing) => sum + billing.amount, 0);
    const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const unpaidAmount = filteredBillings
      .filter(billing => billing.status === 'pending' || billing.status === 'overdue')
      .reduce((sum, billing) => sum + billing.amount, 0);
    
    // Group by status
    const billingsByStatus = {
      paid: filteredBillings.filter(billing => billing.status === 'paid').length,
      pending: filteredBillings.filter(billing => billing.status === 'pending').length,
      overdue: filteredBillings.filter(billing => billing.status === 'overdue').length,
      cancelled: filteredBillings.filter(billing => billing.status === 'cancelled').length,
    };
    
    // Group by client
    const billingsByClient: Record<number, { clientId: number, clientName: string, total: number }> = {};
    
    for (const billing of filteredBillings) {
      if (!billingsByClient[billing.clientId]) {
        billingsByClient[billing.clientId] = {
          clientId: billing.clientId,
          clientName: billing.clientName,
          total: 0,
        };
      }
      
      billingsByClient[billing.clientId].total += billing.amount;
    }
    
    // Format response
    const report = {
      period: period || 'monthly',
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      summary: {
        totalBilled,
        totalPaid,
        unpaidAmount,
        invoiceCount: filteredBillings.length,
        paymentCount: filteredPayments.length,
      },
      billingsByStatus,
      billingsByClient: Object.values(billingsByClient),
      recentBillings: filteredBillings.slice(0, 5),
      recentPayments: filteredPayments.slice(0, 5),
    };
    
    res.json(report);
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
});

// Generate PDF invoice
router.get('/billings/:id/pdf', ensureAgencyOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const billing = await storage.getBilling(parseInt(id));
    
    if (!billing) {
      return res.status(404).json({ error: 'Billing not found' });
    }
    
    // Check if the user has access to this billing
    if (req.user?.role === 'agency' && req.user.agencyId !== billing.agencyId) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this billing' });
    }
    
    // For now, return a success message
    // In a real implementation, we would generate a PDF here
    res.json({ 
      message: 'PDF generation endpoint ready', 
      billing,
      note: 'PDF generation to be implemented with proper PDF library'
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF invoice' });
  }
});

export default router;