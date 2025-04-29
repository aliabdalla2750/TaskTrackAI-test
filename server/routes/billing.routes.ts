import express from "express";
import { z } from "zod";
import { billingService } from "../services/billing.service";
import { insertBillingSchema, insertPaymentSchema } from "@shared/schema";

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // In a real auth implementation, we'd check req.session.user or similar
  // For now, we'll use a simple mock check to avoid errors
  const isUserLoggedIn = true; // This would be replaced with a real auth check
  if (!isUserLoggedIn) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Create a new billing entry
router.post("/billing", isAuthenticated, async (req, res) => {
  try {
    const billingData = insertBillingSchema.parse(req.body);
    const newBilling = await billingService.createBilling(billingData);
    res.status(201).json(newBilling);
  } catch (error) {
    console.error("Error creating billing:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error creating billing" });
  }
});

// Get a specific billing by id
router.get("/billing/:id", isAuthenticated, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const billing = await billingService.getBillingById(id);
    
    if (!billing) {
      return res.status(404).json({ message: "Billing not found" });
    }
    
    res.json(billing);
  } catch (error) {
    console.error("Error getting billing:", error);
    res.status(500).json({ message: "Server error getting billing" });
  }
});

// Get all billings for a client
router.get("/client/:clientId/billings", isAuthenticated, async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const billings = await billingService.getClientBillings(clientId);
    res.json(billings);
  } catch (error) {
    console.error("Error getting client billings:", error);
    res.status(500).json({ message: "Server error getting client billings" });
  }
});

// Get all billings for a project
router.get("/project/:projectId/billings", isAuthenticated, async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const billings = await billingService.getProjectBillings(projectId);
    res.json(billings);
  } catch (error) {
    console.error("Error getting project billings:", error);
    res.status(500).json({ message: "Server error getting project billings" });
  }
});

// Get all billings for an agency
router.get("/agency/:agencyId/billings", isAuthenticated, async (req, res) => {
  try {
    const agencyId = Number(req.params.agencyId);
    const billings = await billingService.getAgencyBillings(agencyId);
    res.json(billings);
  } catch (error) {
    console.error("Error getting agency billings:", error);
    res.status(500).json({ message: "Server error getting agency billings" });
  }
});

// Update billing status
router.patch("/billing/:id/status", isAuthenticated, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    
    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const updatedBilling = await billingService.updateBillingStatus(id, status);
    res.json(updatedBilling);
  } catch (error) {
    console.error("Error updating billing status:", error);
    res.status(500).json({ message: "Server error updating billing status" });
  }
});

// Create a new payment
router.post("/payment", isAuthenticated, async (req, res) => {
  try {
    const paymentData = insertPaymentSchema.parse(req.body);
    const newPayment = await billingService.createPayment(paymentData);
    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error creating payment" });
  }
});

// Get a specific payment by id
router.get("/payment/:id", isAuthenticated, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const payment = await billingService.getPaymentById(id);
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    res.json(payment);
  } catch (error) {
    console.error("Error getting payment:", error);
    res.status(500).json({ message: "Server error getting payment" });
  }
});

// Get all payments for a client
router.get("/client/:clientId/payments", isAuthenticated, async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const payments = await billingService.getClientPayments(clientId);
    res.json(payments);
  } catch (error) {
    console.error("Error getting client payments:", error);
    res.status(500).json({ message: "Server error getting client payments" });
  }
});

// Get all payments for a project
router.get("/project/:projectId/payments", isAuthenticated, async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const payments = await billingService.getProjectPayments(projectId);
    res.json(payments);
  } catch (error) {
    console.error("Error getting project payments:", error);
    res.status(500).json({ message: "Server error getting project payments" });
  }
});

// Get all payments for an agency
router.get("/agency/:agencyId/payments", isAuthenticated, async (req, res) => {
  try {
    const agencyId = Number(req.params.agencyId);
    const payments = await billingService.getAgencyPayments(agencyId);
    res.json(payments);
  } catch (error) {
    console.error("Error getting agency payments:", error);
    res.status(500).json({ message: "Server error getting agency payments" });
  }
});

// Get agency wallet
router.get("/agency/:agencyId/wallet", isAuthenticated, async (req, res) => {
  try {
    const agencyId = Number(req.params.agencyId);
    const wallet = await billingService.getOrCreateWallet(agencyId);
    res.json(wallet);
  } catch (error) {
    console.error("Error getting agency wallet:", error);
    res.status(500).json({ message: "Server error getting agency wallet" });
  }
});

// Generate invoice for a billing
router.post("/billing/:id/invoice", isAuthenticated, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const invoiceLink = await billingService.generateInvoice(id);
    res.json({ invoiceLink });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: "Server error generating invoice" });
  }
});

// Generate financial report
router.get("/agency/:agencyId/financial-report", isAuthenticated, async (req, res) => {
  try {
    const agencyId = Number(req.params.agencyId);
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    
    const report = await billingService.generateFinancialReport(agencyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    console.error("Error generating financial report:", error);
    res.status(500).json({ message: "Server error generating financial report" });
  }
});

export default router;