import { storage } from "../storage";

/**
 * خدمة العملاء للديمو
 */
class ClientService {
  /**
   * إنشاء بيانات ديمو للعملاء
   */
  async createDemoClients() {
    console.log("إنشاء بيانات العملاء للديمو...");
    
    const demoClients = [
      {
        id: 1,
        agencyId: 1,
        name: "أحمد محمود",
        email: "ahmed@client.com",
        phone: "+201012345678",
        company: "شركة الحلول المتكاملة"
      },
      {
        id: 2,
        agencyId: 1,
        name: "سارة أحمد",
        email: "sara@client.com",
        phone: "+201123456789",
        company: "مؤسسة التطوير الرقمي"
      },
      {
        id: 3,
        agencyId: 1,
        name: "محمد علي",
        email: "mohamed@client.com",
        phone: "+201234567890",
        company: "شركة آفاق التسويق"
      },
      {
        id: 4,
        agencyId: 1,
        name: "ليلى خالد",
        email: "laila@client.com",
        phone: "+201234567891",
        company: "متجر الإلكترونيات المتطورة"
      }
    ];
    
    // ربما تم إنشاؤها بالفعل
    // هنا نفترض أنها لم تنشأ بعد ونتجاهل أي خطأ
    try {
      for (const client of demoClients) {
        await storage.createClient(client);
      }
      console.log("تم إنشاء بيانات العملاء للديمو بنجاح");
    } catch (error) {
      console.log("العملاء موجودون بالفعل أو حدث خطأ:", error);
    }
    
    return demoClients;
  }
  
  /**
   * الحصول على جميع العملاء
   */
  async getAllClients(agencyId: number) {
    // محاولة الحصول على العملاء من قاعدة البيانات
    try {
      const clients = await storage.getClientsByAgency(agencyId);
      
      // إذا لم تكن هناك بيانات، قم بإنشاء بيانات للديمو
      if (!clients || clients.length === 0) {
        await this.createDemoClients();
        return await storage.getClientsByAgency(agencyId);
      }
      
      return clients;
    } catch (error) {
      console.error("خطأ في الحصول على بيانات العملاء:", error);
      
      // في حالة وجود خطأ، قم بإنشاء بيانات للديمو
      await this.createDemoClients();
      return await storage.getClientsByAgency(agencyId);
    }
  }
}

export const clientService = new ClientService();