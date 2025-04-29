import { storage } from '../storage';
import { InsertBilling, InsertPayment, InsertWallet } from '@shared/schema';

/**
 * Create a new invoice/billing
 * @param billingData The billing data
 * @returns The created billing
 */
export async function createInvoice(billingData: InsertBilling) {
  try {
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
    
    return billing;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw new Error('Failed to create invoice');
  }
}

/**
 * Process payment for an invoice
 * @param billingId The billing ID
 * @param paymentData The payment data
 * @returns The payment record and updated billing
 */
export async function processPayment(billingId: number, paymentData: Omit<InsertPayment, 'billingId' | 'agencyId' | 'clientId' | 'amount' | 'createdAt'>) {
  try {
    const billing = await storage.getBilling(billingId);
    
    if (!billing) {
      throw new Error('Billing not found');
    }
    
    // Check if the billing is already paid
    if (billing.status === 'paid') {
      throw new Error('This billing is already paid');
    }
    
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
    await updateWalletBalance(billing.agencyId, billing.amount);
    
    return { payment, billing: updatedBilling };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error(`Failed to process payment: ${error.message}`);
  }
}

/**
 * Update the wallet balance for an agency
 * @param agencyId The agency ID
 * @param amount The amount to add to the balance
 * @returns The updated wallet
 */
export async function updateWalletBalance(agencyId: number, amount: number) {
  try {
    const wallet = await storage.getWalletByAgency(agencyId);
    
    if (wallet) {
      return await storage.updateWallet(wallet.id, {
        currentBalance: wallet.currentBalance + amount,
        totalRevenue: wallet.totalRevenue + amount,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      return await storage.createWallet({
        agencyId,
        currentBalance: amount,
        totalRevenue: amount,
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    throw new Error('Failed to update wallet balance');
  }
}

/**
 * Generate a financial report for an agency
 * @param agencyId The agency ID
 * @param period The report period (weekly, monthly, yearly, custom)
 * @param startDate The start date (for custom period)
 * @param endDate The end date (for custom period)
 * @returns The financial report
 */
export async function generateFinancialReport(
  agencyId: number,
  period: 'weekly' | 'monthly' | 'yearly' | 'custom' = 'monthly',
  startDate?: string,
  endDate?: string
) {
  try {
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
        if (!startDate || !endDate) {
          throw new Error('Start date and end date are required for custom period');
        }
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = new Date();
        start.setMonth(start.getMonth() - 1);
    }
    
    // Get billings and payments for the period
    const billings = await storage.getBillingsByAgency(agencyId);
    const payments = await storage.getPaymentsByAgency(agencyId);
    
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
          clientName: billing.clientName || `Client #${billing.clientId}`,
          total: 0,
        };
      }
      
      billingsByClient[billing.clientId].total += billing.amount;
    }
    
    // Format response
    return {
      period,
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
  } catch (error) {
    console.error('Error generating financial report:', error);
    throw new Error(`Failed to generate financial report: ${error.message}`);
  }
}

/**
 * Check for overdue invoices and update their status
 * @returns The number of updated invoices
 */
export async function checkOverdueInvoices() {
  try {
    const currentDate = new Date().toISOString();
    const billings = await storage.getAllBillings();
    
    // Filter pending billings that are past their due date
    const overdueBillings = billings.filter(billing => 
      billing.status === 'pending' && 
      billing.dueDate < currentDate
    );
    
    // Update each overdue billing
    for (const billing of overdueBillings) {
      await storage.updateBilling(billing.id, { status: 'overdue' });
    }
    
    return overdueBillings.length;
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
    throw new Error('Failed to check overdue invoices');
  }
}

/**
 * Generate recurring invoices based on subscription settings
 * This is a placeholder function for future implementation
 */
export async function generateRecurringInvoices() {
  // This function would check for subscription settings and generate new invoices
  // as needed. For now, it's just a placeholder.
  console.log('Recurring invoice generation is not yet implemented');
  return 0;
}

/**
 * Create a PDF for an invoice
 * @param billingId The billing ID
 * @returns A success message (placeholder)
 */
export async function generateInvoicePdf(billingId: number) {
  try {
    const billing = await storage.getBilling(billingId);
    
    if (!billing) {
      throw new Error('Billing not found');
    }
    
    // For now, return a success message
    // In a real implementation, we would generate a PDF here
    return { 
      message: 'PDF generation successful', 
      note: 'Actual PDF generation to be implemented'
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF invoice: ${error.message}`);
  }
}