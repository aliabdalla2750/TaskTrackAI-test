import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import util from 'util';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { fileTypeFromBuffer } from 'file-type-js';

// تهيئة مجلد التخزين المؤقت للملفات
const uploadDir = path.join(__dirname, '../temp-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد محرك تخزين الملفات
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// تصفية الملفات المسموح بها
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يرجى رفع ملف بتنسيق PDF أو DOCX أو TXT فقط.'));
  }
};

// إعداد uploader مع تقييد حجم الملف إلى 25MB
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  }
});

// وظيفة للتعامل مع أخطاء الرفع
export const handleUploadErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'حجم الملف كبير جدًا. الحد الأقصى هو 25 ميجابايت.' });
    }
    return res.status(400).json({ message: `خطأ في رفع الملف: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// استخراج النص من ملف PDF
export const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text || '';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('فشل في استخراج النص من ملف PDF');
  }
};

// استخراج النص من ملف DOCX
export const extractTextFromDocx = async (filePath: string): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('فشل في استخراج النص من ملف DOCX');
  }
};

// استخراج النص من ملف TXT
export const extractTextFromTxt = async (filePath: string): Promise<string> => {
  try {
    const readFile = util.promisify(fs.readFile);
    const content = await readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading TXT file:', error);
    throw new Error('فشل في قراءة ملف النص');
  }
};

// تحديد نوع الملف واستخراج النص من أي ملف مدعوم
export const extractTextFromFile = async (filePath: string): Promise<string> => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileInfo = await fileTypeFromBuffer(fileBuffer);
    
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (fileInfo?.mime === 'application/pdf' || fileExtension === '.pdf') {
      return await extractTextFromPdf(filePath);
    } else if (
      fileInfo?.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      fileExtension === '.docx'
    ) {
      return await extractTextFromDocx(filePath);
    } else if (fileExtension === '.txt') {
      return await extractTextFromTxt(filePath);
    } else {
      throw new Error('نوع الملف غير مدعوم. يرجى استخدام ملف PDF أو DOCX أو TXT فقط.');
    }
  } finally {
    // حذف الملف بعد المعالجة
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error deleting temporary file:', error);
    }
  }
};

// تنظيف النص المستخرج
export const cleanExtractedText = (text: string): string => {
  return text
    .replace(/\r\n/g, '\n') // توحيد نهايات السطر
    .replace(/\n{3,}/g, '\n\n') // تقليل الأسطر الفارغة المتتالية
    .trim(); // إزالة المسافات الزائدة في البداية والنهاية
};