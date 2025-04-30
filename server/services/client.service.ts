import { storage } from "../storage";
import { ClientRating, ClientNote, InsertClientRating, InsertClientNote } from "@shared/schema";

/**
 * خدمة العملاء
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
        company: "شركة الحلول المتكاملة",
        rating: 4.5,
        payment_status: "regular"
      },
      {
        id: 2,
        agencyId: 1,
        name: "سارة أحمد",
        email: "sara@client.com",
        phone: "+201123456789",
        company: "مؤسسة التطوير الرقمي",
        rating: 3.8,
        payment_status: "late"
      },
      {
        id: 3,
        agencyId: 1,
        name: "محمد علي",
        email: "mohamed@client.com",
        phone: "+201234567890",
        company: "شركة آفاق التسويق",
        rating: 5.0,
        payment_status: "regular"
      },
      {
        id: 4,
        agencyId: 1,
        name: "ليلى خالد",
        email: "laila@client.com",
        phone: "+201234567891",
        company: "متجر الإلكترونيات المتطورة",
        rating: 2.5,
        payment_status: "stopped"
      }
    ];
    
    // ربما تم إنشاؤها بالفعل
    // هنا نفترض أنها لم تنشأ بعد ونتجاهل أي خطأ
    try {
      for (const client of demoClients) {
        await storage.createClient(client);
      }
      console.log("تم إنشاء بيانات العملاء للديمو بنجاح");
      
      // إضافة بعض التقييمات الديمو
      await this.createDemoRatingsAndNotes();
    } catch (error) {
      console.log("العملاء موجودون بالفعل أو حدث خطأ:", error);
    }
    
    return demoClients;
  }
  
  /**
   * إنشاء بيانات ديمو للتقييمات والملاحظات
   */
  async createDemoRatingsAndNotes() {
    try {
      // إضافة تقييمات ديمو
      const demoRatings: Partial<InsertClientRating>[] = [
        {
          clientId: 1,
          projectId: 1,
          rating: 5,
          type: "positive",
          comment: "تعاون ممتاز وسداد في الموعد دائماً",
          createdBy: 1
        },
        {
          clientId: 2,
          projectId: 2,
          rating: 3,
          type: "neutral",
          comment: "تعاون جيد ولكن أحياناً يتأخر في السداد",
          createdBy: 1
        },
        {
          clientId: 3,
          projectId: 3,
          rating: 5,
          type: "positive",
          comment: "عميل مثالي ويسدد مستحقاته قبل موعدها",
          createdBy: 1
        },
        {
          clientId: 4,
          projectId: 4,
          rating: 2,
          type: "negative",
          comment: "تأخر متكرر في السداد وصعوبة في التواصل",
          createdBy: 1
        }
      ];
      
      for (const rating of demoRatings) {
        try {
          await storage.createClientRating(rating as InsertClientRating);
        } catch (error) {
          console.log("التقييم موجود بالفعل أو حدث خطأ:", error);
        }
      }
      
      // إضافة ملاحظات ديمو
      const demoNotes: Partial<InsertClientNote>[] = [
        {
          clientId: 1,
          note: "يفضل التواصل عبر الواتساب بدلاً من البريد الإلكتروني",
          type: "neutral",
          authorId: 1
        },
        {
          clientId: 2,
          note: "يحتاج إلى تذكير قبل موعد الفاتورة بأسبوع",
          type: "negative",
          authorId: 1
        },
        {
          clientId: 3,
          note: "يبحث عن فرص توسع في السوق السعودي",
          type: "positive",
          authorId: 1
        },
        {
          clientId: 4,
          note: "مستحقات متأخرة منذ 3 أشهر",
          type: "negative",
          authorId: 1
        }
      ];
      
      for (const note of demoNotes) {
        try {
          await storage.createClientNote(note as InsertClientNote);
        } catch (error) {
          console.log("الملاحظة موجودة بالفعل أو حدث خطأ:", error);
        }
      }
      
      console.log("تم إنشاء بيانات التقييمات والملاحظات للديمو بنجاح");
    } catch (error) {
      console.log("خطأ في إنشاء التقييمات والملاحظات:", error);
    }
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
  
  /**
   * الحصول على تقييمات العميل
   */
  async getClientRatings(clientId: number): Promise<ClientRating[]> {
    try {
      return await storage.getClientRatingsByClient(clientId);
    } catch (error) {
      console.error("خطأ في الحصول على تقييمات العميل:", error);
      return [];
    }
  }
  
  /**
   * الحصول على ملاحظات العميل
   */
  async getClientNotes(clientId: number): Promise<ClientNote[]> {
    try {
      return await storage.getClientNotesByClient(clientId);
    } catch (error) {
      console.error("خطأ في الحصول على ملاحظات العميل:", error);
      return [];
    }
  }
  
  /**
   * تحديث حالة الدفع للعميل
   */
  async updatePaymentStatus(clientId: number): Promise<string> {
    try {
      return await storage.calculateClientPaymentStatus(clientId);
    } catch (error) {
      console.error("خطأ في تحديث حالة الدفع للعميل:", error);
      throw error;
    }
  }
  
  /**
   * إنشاء ملخص للعميل مع كافة البيانات المرتبطة
   */
  async getClientSummary(clientId: number) {
    try {
      const client = await storage.getClient(clientId);
      
      if (!client) {
        throw new Error("العميل غير موجود");
      }
      
      const [ratings, notes, projects] = await Promise.all([
        this.getClientRatings(clientId),
        this.getClientNotes(clientId),
        storage.getProjectsByClient(clientId)
      ]);
      
      // حساب عدد المشاريع المفتوحة
      const openProjects = projects.filter(project => project.status === 'open').length;
      
      // حساب عدد المشاريع المكتملة
      const completedProjects = projects.filter(project => project.status === 'completed').length;
      
      return {
        client,
        stats: {
          totalProjects: projects.length,
          openProjects,
          completedProjects,
          totalRatings: ratings.length,
          averageRating: client.rating
        },
        latestRatings: ratings.slice(0, 3),
        latestNotes: notes.slice(0, 3)
      };
    } catch (error) {
      console.error("خطأ في الحصول على ملخص العميل:", error);
      throw error;
    }
  }
}

export const clientService = new ClientService();