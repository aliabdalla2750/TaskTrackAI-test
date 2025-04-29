import { db } from "../db";
import { billing, payments, wallet, projects, clients, type Billing, type Payment, type Wallet, type InsertBilling, type InsertPayment } from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

class BillingService {
  // Create a new billing entry
  async createBilling(billingData: InsertBilling): Promise<Billing> {
    const [newBilling] = await db
      .insert(billing)
      .values(billingData)
      .returning();
    
    return newBilling;
  }

  // Get a specific billing by id
  async getBillingById(id: number): Promise<Billing | null> {
    const [result] = await db
      .select()
      .from(billing)
      .where(eq(billing.id, id));
    
    return result || null;
  }

  // Get all billings for a specific client
  async getClientBillings(clientId: number): Promise<Billing[]> {
    return await db
      .select()
      .from(billing)
      .where(eq(billing.clientId, clientId))
      .orderBy(billing.createdAt);
  }

  // Get all billings for a specific project
  async getProjectBillings(projectId: number): Promise<Billing[]> {
    return await db
      .select()
      .from(billing)
      .where(eq(billing.projectId, projectId))
      .orderBy(billing.createdAt);
  }

  // Get all billings for an agency
  async getAgencyBillings(agencyId: number): Promise<Billing[]> {
    return await db
      .select()
      .from(billing)
      .where(eq(billing.agencyId, agencyId))
      .orderBy(billing.createdAt);
  }

  // Get billings by date range
  async getBillingsByDateRange(
    agencyId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Billing[]> {
    return await db
      .select()
      .from(billing)
      .where(
        and(
          eq(billing.agencyId, agencyId),
          gte(billing.createdAt, startDate),
          lte(billing.createdAt, endDate)
        )
      )
      .orderBy(billing.createdAt);
  }

  // Update billing status
  async updateBillingStatus(id: number, status: string): Promise<Billing> {
    const [updated] = await db
      .update(billing)
      .set({ status })
      .where(eq(billing.id, id))
      .returning();
    
    return updated;
  }

  // Create a new payment
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(paymentData)
      .returning();
    
    // Update the associated billing status to paid
    await this.updateBillingStatus(paymentData.billingId, "paid");
    
    // Update the agency wallet
    await this.updateWalletBalance(paymentData.agencyId, paymentData.amount);
    
    return newPayment;
  }

  // Get a specific payment by id
  async getPaymentById(id: number): Promise<Payment | null> {
    const [result] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    
    return result || null;
  }

  // Get all payments for a specific client
  async getClientPayments(clientId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.clientId, clientId))
      .orderBy(payments.paymentDate);
  }

  // Get all payments for a specific project
  async getProjectPayments(projectId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.projectId, projectId))
      .orderBy(payments.paymentDate);
  }

  // Get all payments for an agency
  async getAgencyPayments(agencyId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.agencyId, agencyId))
      .orderBy(payments.paymentDate);
  }

  // Get or create agency wallet
  async getOrCreateWallet(agencyId: number): Promise<Wallet> {
    // Try to get existing wallet
    const [existingWallet] = await db
      .select()
      .from(wallet)
      .where(eq(wallet.agencyId, agencyId));
    
    if (existingWallet) {
      return existingWallet;
    }
    
    // Create new wallet if it doesn't exist
    const [newWallet] = await db
      .insert(wallet)
      .values({
        agencyId,
        currentBalance: 0,
        totalRevenue: 0,
        updatedAt: new Date(),
      })
      .returning();
    
    return newWallet;
  }

  // Update agency wallet balance
  async updateWalletBalance(agencyId: number, amount: number): Promise<Wallet> {
    const currentWallet = await this.getOrCreateWallet(agencyId);
    
    const [updatedWallet] = await db
      .update(wallet)
      .set({
        currentBalance: currentWallet.currentBalance + amount,
        totalRevenue: currentWallet.totalRevenue + amount,
        updatedAt: new Date(),
      })
      .where(eq(wallet.agencyId, agencyId))
      .returning();
    
    return updatedWallet;
  }

  // Get agency wallet
  async getAgencyWallet(agencyId: number): Promise<Wallet | null> {
    const [result] = await db
      .select()
      .from(wallet)
      .where(eq(wallet.agencyId, agencyId));
    
    return result || null;
  }

  // Generate invoice for a billing (placeholder for actual invoice generation)
  async generateInvoice(billingId: number): Promise<string> {
    const billingData = await this.getBillingById(billingId);
    if (!billingData) {
      throw new Error("Billing not found");
    }

    // Here we would generate a PDF invoice and return a link to it
    // For now, just return a placeholder
    const invoiceLink = `/invoices/${billingData.id}_${Date.now()}.pdf`;
    
    // Update the billing record with the invoice link
    await db
      .update(billing)
      .set({ invoiceLink })
      .where(eq(billing.id, billingId));
    
    return invoiceLink;
  }

  // Generate financial report
  async generateFinancialReport(
    agencyId: number,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const billings = await this.getBillingsByDateRange(agencyId, startDate, endDate);
    const paymentsData = await this.getAgencyPayments(agencyId);
    const walletData = await this.getAgencyWallet(agencyId);

    // Filter payments by date range
    const periodPayments = paymentsData.filter(
      payment => {
        // Only process payments with a valid payment date
        if (!payment.paymentDate) return false;
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= startDate && paymentDate <= endDate;
      }
    );

    // Calculate total revenue for the period
    const totalRevenue = periodPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Calculate pending payments
    const pendingBillings = billings.filter(
      bill => bill.status === "pending"
    );
    
    const pendingAmount = pendingBillings.reduce(
      (sum, bill) => sum + bill.amount,
      0
    );

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      totalBilled: billings.reduce((sum, bill) => sum + bill.amount, 0),
      totalReceived: totalRevenue,
      pendingPayments: pendingAmount,
      currentBalance: walletData?.currentBalance || 0,
      totalRevenue: walletData?.totalRevenue || 0,
      billings,
      payments: periodPayments,
    };
  }
}

export const billingService = new BillingService();