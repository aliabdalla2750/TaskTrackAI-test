import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertClientRatingSchema, insertClientNoteSchema, insertClientSchema } from "@shared/schema";
import { ZodError } from "zod";
import { clientService } from "../services/client.service";

// إنشاء موجه للطرق المتعلقة بالعملاء
const clientRouter = Router();

// الحصول على قائمة العملاء حسب الوكالة
clientRouter.get('/', async (req: Request, res: Response) => {
  try {
    const agencyId = Number(req.query.agencyId);
    
    if (!agencyId || isNaN(agencyId)) {
      return res.status(400).json({ error: "يجب تحديد معرف الوكالة" });
    }
    
    const clients = await clientService.getAllClients(agencyId);
    res.json(clients);
  } catch (error) {
    console.error("خطأ في الحصول على العملاء:", error);
    res.status(500).json({ error: "حدث خطأ أثناء الحصول على العملاء" });
  }
});

// الحصول على عميل محدد
clientRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "معرف العميل غير صالح" });
    }
    
    const client = await storage.getClient(clientId);
    
    if (!client) {
      return res.status(404).json({ error: "العميل غير موجود" });
    }
    
    res.json(client);
  } catch (error) {
    console.error("خطأ في الحصول على العميل:", error);
    res.status(500).json({ error: "حدث خطأ أثناء الحصول على العميل" });
  }
});

// إنشاء عميل جديد
clientRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = insertClientSchema.parse(req.body);
    const client = await storage.createClient(validatedData);
    res.status(201).json(client);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "بيانات العميل غير صالحة", details: error.errors });
    } else {
      console.error("خطأ في إنشاء العميل:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إنشاء العميل" });
    }
  }
});

// تحديث بيانات عميل
clientRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "معرف العميل غير صالح" });
    }
    
    // السماح بتحديث جزئي للبيانات
    const updatedClient = await storage.updateClient(clientId, req.body);
    
    if (!updatedClient) {
      return res.status(404).json({ error: "العميل غير موجود" });
    }
    
    res.json(updatedClient);
  } catch (error) {
    console.error("خطأ في تحديث العميل:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث العميل" });
  }
});

// حذف عميل
clientRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "معرف العميل غير صالح" });
    }
    
    const success = await storage.deleteClient(clientId);
    
    if (!success) {
      return res.status(404).json({ error: "العميل غير موجود" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("خطأ في حذف العميل:", error);
    res.status(500).json({ error: "حدث خطأ أثناء حذف العميل" });
  }
});

// ======= وظائف التقييمات =======

// الحصول على تقييمات العميل
clientRouter.get('/:id/ratings', async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "معرف العميل غير صالح" });
    }
    
    const ratings = await storage.getClientRatingsByClient(clientId);
    res.json(ratings);
  } catch (error) {
    console.error("خطأ في الحصول على تقييمات العميل:", error);
    res.status(500).json({ error: "حدث خطأ أثناء الحصول على تقييمات العميل" });
  }
});

// إضافة تقييم جديد للعميل
clientRouter.post('/:id/ratings', async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "معرف العميل غير صالح" });
    }
    
    // التحقق من وجود العميل
    const client = await storage.getClient(clientId);
    
    if (!client) {
      return res.status(404).json({ error: "العميل غير موجود" });
    }
    
    // التحقق من صحة البيانات وإضافة معرف العميل
    const data = { ...req.body, clientId };
    const validatedData = insertClientRatingSchema.parse(data);
    
    const rating = await storage.createClientRating(validatedData);
    res.status(201).json(rating);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "بيانات التقييم غير صالحة", details: error.errors });
    } else {
      console.error("خطأ في إضافة تقييم العميل:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إضافة تقييم العميل" });
    }
  }
});

// تحديث تقييم
clientRouter.put('/ratings/:id', async (req: Request, res: Response) => {
  try {
    const ratingId = Number(req.params.id);
    
    if (isNaN(ratingId)) {
      return res.status(400).json({ error: "معرف التقييم غير صالح" });
    }
    
    const updatedRating = await storage.updateClientRating(ratingId, req.body);
    
    if (!updatedRating) {
      return res.status(404).json({ error: "التقييم غير موجود" });
    }
    
    res.json(updatedRating);
  } catch (error) {
    console.error("خطأ في تحديث تقييم العميل:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث تقييم العميل" });
  }
});

// حذف تقييم
clientRouter.delete('/ratings/:id', async (req: Request, res: Response) => {
  try {
    const ratingId = Number(req.params.id);
    
    if (isNaN(ratingId)) {
      return res.status(400).json({ error: "معرف التقييم غير صالح" });
    }
    
    const success = await storage.deleteClientRating(ratingId);
    
    if (!success) {
      return res.status(404).json({ error: "التقييم غير موجود" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("خطأ في حذف تقييم العميل:", error);
    res.status(500).json({ error: "حدث خطأ أثناء حذف تقييم العميل" });
  }
});

// ======= وظائف الملاحظات الداخلية =======

// الحصول على ملاحظات العميل
clientRouter.get('/:id/notes', async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "معرف العميل غير صالح" });
    }
    
    const notes = await storage.getClientNotesByClient(clientId);
    res.json(notes);
  } catch (error) {
    console.error("خطأ في الحصول على ملاحظات العميل:", error);
    res.status(500).json({ error: "حدث خطأ أثناء الحصول على ملاحظات العميل" });
  }
});

// إضافة ملاحظة جديدة للعميل
clientRouter.post('/:id/notes', async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "معرف العميل غير صالح" });
    }
    
    // التحقق من وجود العميل
    const client = await storage.getClient(clientId);
    
    if (!client) {
      return res.status(404).json({ error: "العميل غير موجود" });
    }
    
    // التحقق من صحة البيانات وإضافة معرف العميل
    const data = { ...req.body, clientId };
    const validatedData = insertClientNoteSchema.parse(data);
    
    const note = await storage.createClientNote(validatedData);
    res.status(201).json(note);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "بيانات الملاحظة غير صالحة", details: error.errors });
    } else {
      console.error("خطأ في إضافة ملاحظة العميل:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إضافة ملاحظة العميل" });
    }
  }
});

// تحديث ملاحظة
clientRouter.put('/notes/:id', async (req: Request, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    
    if (isNaN(noteId)) {
      return res.status(400).json({ error: "معرف الملاحظة غير صالح" });
    }
    
    const updatedNote = await storage.updateClientNote(noteId, req.body);
    
    if (!updatedNote) {
      return res.status(404).json({ error: "الملاحظة غير موجودة" });
    }
    
    res.json(updatedNote);
  } catch (error) {
    console.error("خطأ في تحديث ملاحظة العميل:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث ملاحظة العميل" });
  }
});

// حذف ملاحظة
clientRouter.delete('/notes/:id', async (req: Request, res: Response) => {
  try {
    const noteId = Number(req.params.id);
    
    if (isNaN(noteId)) {
      return res.status(400).json({ error: "معرف الملاحظة غير صالح" });
    }
    
    const success = await storage.deleteClientNote(noteId);
    
    if (!success) {
      return res.status(404).json({ error: "الملاحظة غير موجودة" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("خطأ في حذف ملاحظة العميل:", error);
    res.status(500).json({ error: "حدث خطأ أثناء حذف ملاحظة العميل" });
  }
});

// ======= وظائف حالة الدفع =======

// تحديث حالة الدفع للعميل
clientRouter.put('/:id/payment-status', async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "معرف العميل غير صالح" });
    }
    
    if (!req.body.status || typeof req.body.status !== 'string') {
      return res.status(400).json({ error: "حالة الدفع غير صالحة" });
    }
    
    // التحقق من قيمة حالة الدفع
    const status = req.body.status;
    if (!['regular', 'late', 'stopped'].includes(status)) {
      return res.status(400).json({ error: "حالة الدفع يجب أن تكون 'regular' أو 'late' أو 'stopped'" });
    }
    
    const updatedClient = await storage.updateClientPaymentStatus(clientId, status);
    
    if (!updatedClient) {
      return res.status(404).json({ error: "العميل غير موجود" });
    }
    
    res.json(updatedClient);
  } catch (error) {
    console.error("خطأ في تحديث حالة الدفع:", error);
    res.status(500).json({ error: "حدث خطأ أثناء تحديث حالة الدفع" });
  }
});

// حساب حالة الدفع للعميل بناءً على الفواتير
clientRouter.post('/:id/calculate-payment-status', async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: "معرف العميل غير صالح" });
    }
    
    // التحقق من وجود العميل
    const client = await storage.getClient(clientId);
    
    if (!client) {
      return res.status(404).json({ error: "العميل غير موجود" });
    }
    
    const paymentStatus = await storage.calculateClientPaymentStatus(clientId);
    
    res.json({ clientId, paymentStatus });
  } catch (error) {
    console.error("خطأ في حساب حالة الدفع:", error);
    res.status(500).json({ error: "حدث خطأ أثناء حساب حالة الدفع" });
  }
});

export default clientRouter;