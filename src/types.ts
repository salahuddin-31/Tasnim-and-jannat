export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  photoUrl?: string;
}

export interface Client {
  clientId: string;
  name: string;      // ক্লায়েন্ট নাম
  contact?: string;  // যোগাযোগ
  notes?: string;    // মন্তব্য
  createdAt: string;
  userId?: string;   // ব্যবহারকারী আইডি (আইসোলেশন)
}

export interface LedgerEntry {
  entryId: string;
  clientId: string;
  clientName: string;
  date: string;               // তারিখ (YYYY-MM-DD)
  description: string;        // বিবরণ
  plyPage: string;            // ফালি বা পৃষ্ঠা
  productWeight: number;      // প্রডাক্টের ওজন (kg/lbs)
  productRate: number;        // প্রডাক্টের দর (price per unit)
  totalAmount: number;        // মোট টাকা (ওজন × দর) - auto-calculated
  receivedAmount: number;     // জমা টাকা
  createdAt: string;
  createdBy: string;          // এন্ট্রি কারী (user email)
  userId?: string;            // ব্যবহারকারী আইডি (আইসোলেশন)
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  status: 'connected' | 'disconnected' | 'not_configured';
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
