import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// استخدام WebSockets للاتصال بقاعدة البيانات عبر Neon
neonConfig.webSocketConstructor = ws;

// التحقق من وجود متغير بيئة اتصال قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// إنشاء مجمع اتصالات قاعدة البيانات
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// إنشاء كائن drizzle للتعامل مع قاعدة البيانات
export const db = drizzle(pool, { schema });