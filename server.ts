import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { google } from "googleapis";
import { createServer as createViteServer } from "vite";
import { Client, LedgerEntry, GoogleSheetsConfig } from "./src/types.js";
import { createClient } from "@supabase/supabase-js";

// Supabase details provided by user
const SUPABASE_URL = process.env.SUPABASE_URL || "https://mypljqrkpubuceikaene.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGxqcXJrcHVidWNlaWthZW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzIwMjcsImV4cCI6MjA5NjUwODAyN30.Eycm0wGbKxGe8x5AmApNHSb0I31flUelXHYhr3pstO8";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Database structure
interface DBData {
  users: Array<{
    userId: string;
    email: string;
    passwordHash: string;
    name: string;
    createdAt: string;
  }>;
  clients: Client[];
  ledger: LedgerEntry[];
  sheetsConfig: {
    spreadsheetId: string;
    clientEmail: string;
    privateKey: string;
  };
}

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

// Security password hashing
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_salttasnimjannatknitt").digest("hex");
}

// Default initial database
const defaultDB: DBData = {
  users: [
    // Pre-create an initial admin for testing ease
    {
      userId: "user-admin",
      email: "demo@factory.com",
      passwordHash: hashPassword("demo123"),
      name: "Tasnim and Jannat Office",
      createdAt: new Date().toISOString(),
    }
  ],
  clients: [],
  ledger: [],
  sheetsConfig: {
    spreadsheetId: "",
    clientEmail: "",
    privateKey: "",
  },
};

// Ensure database file exist
function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      // Ensure properties exist
      return {
        users: parsed.users || defaultDB.users,
        clients: parsed.clients || [],
        ledger: parsed.ledger || [],
        sheetsConfig: parsed.sheetsConfig || defaultDB.sheetsConfig,
      };
    }
  } catch (err) {
    console.error("Error loading database file, resetting to fallback.", err);
  }
  saveDB(defaultDB);
  return defaultDB;
}

function saveDB(data: DBData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Supabase Read/Write Adapters with Resilient Local Fallbacks & Multi-Owner Data Isolation
async function getClients(userId?: string): Promise<Client[]> {
  const localClients = loadDB().clients;
  const filteredLocal = userId 
    ? localClients.filter(c => c.userId === userId) 
    : localClients;

  try {
    let query = supabase.from("clients").select("*");
    if (userId) {
      query = query.eq("userId", userId);
    }
    let { data, error } = await query.order("createdAt", { ascending: true });
    
    // Resilient fallback: if query with userId filter fails (e.g., table has no userId column yet), get all and filter in JS
    if (error && userId) {
      console.warn("Supabase clients query with userId equal filter failed, attempting manual client-side filter fallback:", error.message);
      const fallbackResult = await supabase.from("clients").select("*").order("createdAt", { ascending: true });
      if (!fallbackResult.error && fallbackResult.data) {
        data = fallbackResult.data.filter((c: any) => c.userId === userId);
        error = null;
      }
    }

    if (error) {
      if (error.message.includes("Could not find the table")) {
        console.info("ℹ️ Supabase 'clients' table not found. Using local database cache.");
      } else {
        console.warn("Supabase clients query failed, using local fallback. Error:", error.message);
      }
      return filteredLocal;
    }
    
    // Merge Supabase entries with local cache to prevent data loss
    const mergedMap = new Map<string, Client>();
    for (const c of filteredLocal) {
      if (c && c.clientId) mergedMap.set(c.clientId, c);
    }
    if (data) {
      for (const c of data) {
        if (c && c.clientId && (!userId || c.userId === userId)) {
          mergedMap.set(c.clientId, c);
        }
      }
    }
    return Array.from(mergedMap.values());
  } catch (err: any) {
    console.warn("Supabase clients network error, using local fallback:", err.message);
    return filteredLocal;
  }
}

async function getLedger(userId?: string): Promise<LedgerEntry[]> {
  const localLedger = loadDB().ledger;
  const filteredLocal = userId 
    ? localLedger.filter(e => e.userId === userId) 
    : localLedger;

  try {
    let query = supabase.from("ledger").select("*");
    if (userId) {
      query = query.eq("userId", userId);
    }
    let { data, error } = await query.order("createdAt", { ascending: true });
    
    // Resilient fallback: if query with userId filter fails (e.g., table has no userId column yet), get all and filter in JS
    if (error && userId) {
      console.warn("Supabase ledger query with userId equal filter failed, attempting manual client-side filter fallback:", error.message);
      const fallbackResult = await supabase.from("ledger").select("*").order("createdAt", { ascending: true });
      if (!fallbackResult.error && fallbackResult.data) {
        data = fallbackResult.data.filter((e: any) => e.userId === userId);
        error = null;
      }
    }

    if (error) {
      if (error.message.includes("Could not find the table")) {
        console.info("ℹ️ Supabase 'ledger' table not found. Using local database cache.");
      } else {
        console.warn("Supabase ledger failed, using local fallback. Error:", error.message);
      }
      return filteredLocal;
    }
    
    // Merge entries
    const mergedMap = new Map<string, LedgerEntry>();
    for (const e of filteredLocal) {
      if (e && e.entryId) mergedMap.set(e.entryId, e);
    }
    if (data) {
      for (const e of data) {
        if (e && e.entryId && (!userId || e.userId === userId)) {
          mergedMap.set(e.entryId, e);
        }
      }
    }
    return Array.from(mergedMap.values());
  } catch (err: any) {
    console.warn("Supabase ledger network error, using local fallback:", err.message);
    return filteredLocal;
  }
}

async function getUsers(): Promise<any[]> {
  const localUsers = loadDB().users;
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      if (error.message.includes("Could not find the table")) {
        console.info("ℹ️ Supabase 'users' table not found. Using local database cache (Setup SQL editor schema in-app).");
      } else {
        console.warn("Supabase users failed, using local fallback. Error:", error.message);
      }
      return localUsers;
    }
    
    // Merge Supabase users with local users to ensure absolute login resilience
    const mergedMap = new Map<string, any>();
    for (const u of localUsers) {
      if (u && u.email) {
        mergedMap.set(u.email.toLowerCase(), u);
      }
    }
    if (data) {
      for (const u of data) {
        if (u && u.email) {
          mergedMap.set(u.email.toLowerCase(), u);
        }
      }
    }
    return Array.from(mergedMap.values());
  } catch (err: any) {
    console.warn("Supabase users network error, using local fallback:", err.message);
    return localUsers;
  }
}

async function saveUser(user: any) {
  const db = loadDB();
  db.users.push(user);
  saveDB(db);

  try {
    const { error } = await supabase.from("users").insert([user]);
    if (error) console.error("Failed to write user to Supabase:", error.message);
  } catch (err: any) {
    console.error("Supabase write user network error:", err.message);
  }
}

async function saveClient(client: Client) {
  const db = loadDB();
  db.clients.push(client);
  saveDB(db);

  try {
    const { error } = await supabase.from("clients").insert([client]);
    if (error) console.error("Failed to write client to Supabase:", error.message);
  } catch (err: any) {
    console.error("Supabase write client network error:", err.message);
  }
}

async function deleteClientFromDB(clientId: string) {
  const db = loadDB();
  db.clients = db.clients.filter(c => c.clientId !== clientId);
  db.ledger = db.ledger.filter(e => e.clientId !== clientId);
  saveDB(db);

  try {
    const { error: err1 } = await supabase.from("ledger").delete().eq("clientId", clientId);
    const { error: err2 } = await supabase.from("clients").delete().eq("clientId", clientId);
    if (err1) console.error("Failed to delete client ledger from Supabase:", err1.message);
    if (err2) console.error("Failed to delete client from Supabase:", err2.message);
  } catch (err: any) {
    console.error("Supabase delete client network error:", err.message);
  }
}

async function saveLedgerEntry(entry: LedgerEntry) {
  const db = loadDB();
  db.ledger.push(entry);
  saveDB(db);

  try {
    const { error } = await supabase.from("ledger").insert([entry]);
    if (error) console.error("Failed to write ledger entry to Supabase:", error.message);
  } catch (err: any) {
    console.error("Supabase write ledger entry network error:", err.message);
  }
}

async function deleteLedgerEntryFromDB(entryId: string) {
  const db = loadDB();
  db.ledger = db.ledger.filter(e => e.entryId !== entryId);
  saveDB(db);

  try {
    const { error } = await supabase.from("ledger").delete().eq("entryId", entryId);
    if (error) console.error("Failed to delete ledger entry from Supabase:", error.message);
  } catch (err: any) {
    console.error("Supabase delete ledger entry network error:", err.message);
  }
}

async function bootstrapSupabase() {
  try {
    console.log("Checking and syncing local database with Supabase...");
    
    const { data: suClients, error: clientsErr } = await supabase.from("clients").select("clientId").limit(1);
    if (clientsErr) {
      console.warn("Supabase 'clients' table not found or inaccessible. Bootstrapping skipped. Error:", clientsErr.message);
      return;
    }
    
    const db = loadDB();
    
    const { data: suUsers } = await supabase.from("users").select("userId").limit(1);
    if (suUsers && suUsers.length === 0 && db.users.length > 0) {
      console.log(`Bootstrapping ${db.users.length} users onto Supabase...`);
      await supabase.from("users").insert(db.users);
    }
    
    const { data: suClientsAll } = await supabase.from("clients").select("clientId").limit(1);
    if (suClientsAll && suClientsAll.length === 0 && db.clients.length > 0) {
      console.log(`Bootstrapping ${db.clients.length} clients onto Supabase...`);
      await supabase.from("clients").insert(db.clients);
    }
    
    const { data: suLedger } = await supabase.from("ledger").select("entryId").limit(1);
    if (suLedger && suLedger.length === 0 && db.ledger.length > 0) {
      console.log(`Bootstrapping ${db.ledger.length} ledger entries onto Supabase...`);
      await supabase.from("ledger").insert(db.ledger);
    }
    
    console.log("Supabase bootstrapping check completed successfully.");
  } catch (err: any) {
    console.error("Failed to bootstrap Supabase database:", err.message);
  }
}

// Google Sheets Client Initializer (Lazy & Safe)
async function getSheetsService(config: { spreadsheetId: string; clientEmail: string; privateKey: string }) {
  if (!config.spreadsheetId || !config.clientEmail || !config.privateKey) {
    throw new Error("Google Sheets credentials are not fully configured.");
  }
  
  const formattedKey = config.privateKey.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: config.clientEmail,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  await auth.authorize();
  return google.sheets({ version: "v4", auth });
}

// Auto Provision Sheets and Tabs
async function provisionGoogleSheets(config: { spreadsheetId: string; clientEmail: string; privateKey: string }, localDB: DBData) {
  const service = await getSheetsService(config);
  const spreadsheetId = config.spreadsheetId;

  // 1. Fetch spreadsheet metadata
  const spreadsheetMeta = await service.spreadsheets.get({ spreadsheetId });
  const sheets = spreadsheetMeta.data.sheets || [];
  const existingTitles = sheets.map(s => s.properties?.title || "");

  const requiredSheets = ["Users", "Clients", "Ledger"];
  const addRequests: any[] = [];

  for (const sheetName of requiredSheets) {
    if (!existingTitles.includes(sheetName)) {
      addRequests.push({
        addSheet: {
          properties: { title: sheetName }
        }
      });
    }
  }

  // 2. Add missing sheets
  if (addRequests.length > 0) {
    await service.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: addRequests
      }
    });
    console.log(`Successfully added missing sheet tabs in Google Sheet: ${requiredSheets.filter(name => !existingTitles.includes(name)).join(", ")}`);
  }

  // 3. Populate all sheets with headers + data
  await syncAllToGoogleSheets(service, spreadsheetId, localDB);
}

// Synchronize all data to Google Sheets (Full Mirror for bulletproof consistency)
async function syncAllToGoogleSheets(service: any, spreadsheetId: string, db: DBData) {
  // Sync Users Tab
  const usersRows = [
    ["userId", "email", "name", "createdAt"],
    ...db.users.map(u => [u.userId, u.email, u.name, u.createdAt])
  ];

  // Sync Clients Tab
  const clientsRows = [
    ["clientId", "name", "contact", "notes", "createdAt"],
    ...db.clients.map(c => [c.clientId, c.name, c.contact || "", c.notes || "", c.createdAt])
  ];

  // Sync Ledger Tab
  const ledgerRows = [
    ["entryId", "clientId", "clientName", "date", "description", "plyPage", "productWeight", "productRate", "totalAmount", "receivedAmount", "createdAt", "createdBy"],
    ...db.ledger.map(e => [
      e.entryId,
      e.clientId,
      e.clientName,
      e.date,
      e.description,
      e.plyPage,
      e.productWeight,
      e.productRate,
      e.totalAmount,
      e.receivedAmount,
      e.createdAt,
      e.createdBy
    ])
  ];

  // Batch update values
  await service.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        { range: "Users!A1:D1000", values: usersRows },
        { range: "Clients!A1:E1000", values: clientsRows },
        { range: "Ledger!A1:L3000", values: ledgerRows }
      ]
    }
  });

  console.log("Replicated all local databases to Google Sheets successfully.");
}

// Helper to handle sheets sync safely on any operations
async function safeGoogleSheetsSync(db: DBData) {
  const { spreadsheetId, clientEmail, privateKey } = db.sheetsConfig;
  if (spreadsheetId && clientEmail && privateKey) {
    try {
      const service = await getSheetsService(db.sheetsConfig);
      await syncAllToGoogleSheets(service, spreadsheetId, db);
    } catch (err: any) {
      console.error("Real-time Google Sheet synchronization failed. Background sync will retry next time. Error:", err.message);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Bootstrap data onto Supabase asynchronously on startup
  bootstrapSupabase();

  // API - Check Auth status or register or login
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: "ইমেইল, পাসওয়ার্ড এবং নাম আবশ্যক!" });
      }

      const users = await getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: "এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে! অনুগ্রহ করে আগের পাসওয়ার্ড দিয়ে সরাসরি লগইন করুন।" });
      }

      const newUser = {
        userId: "user-" + crypto.randomBytes(4).toString("hex"),
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        name,
        createdAt: new Date().toISOString(),
      };

      await saveUser(newUser);

      // Background register in Supabase native Authentication manager so it populates the Auth Tab
      try {
        await supabase.auth.signUp({
          email: email.toLowerCase(),
          password: password,
          options: {
            data: {
              display_name: name,
              userId: newUser.userId
            }
          }
        });
      } catch (authErr: any) {
        console.warn("Background registration on Supabase Native Auth skipped/failed:", authErr.message);
      }

      res.json({
        success: true,
        message: "অ্যাকাউন্ট সফলভাবে নিবন্ধন করা হয়েছে!",
        user: { userId: newUser.userId, email: newUser.email, name: newUser.name, createdAt: newUser.createdAt }
      });

      const db = loadDB();
      await safeGoogleSheetsSync(db);
    } catch (err: any) {
      res.status(500).json({ success: false, message: "নিবন্ধন করতে সমস্যা হয়েছে: " + err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "ইমেইল এবং পাসওয়ার্ড আবশ্যক!" });
      }

      const users = await getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: "সঠিক ইমেইল ঠিকানা প্রদান করুন!" });
      }

      const hash = hashPassword(password);
      if (user.passwordHash !== hash) {
        return res.status(401).json({ success: false, message: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" });
      }

      res.json({
        success: true,
        message: "লগইন সফল হয়েছে!",
        user: { userId: user.userId, email: user.email, name: user.name, createdAt: user.createdAt, photoUrl: (user as any).photoUrl }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "লগইন ব্যর্থ হয়েছে: " + err.message });
    }
  });

  app.post("/api/auth/recover", async (req, res) => {
    try {
      const { email, name, newPassword } = req.body;
      if (!email || !name || !newPassword) {
        return res.status(400).json({ success: false, message: "ইমেইল, ম্যানেজারের নাম এবং নতুন পাসওয়ার্ড আবশ্যক!" });
      }

      const users = await getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return res.status(404).json({ success: false, message: "এই ইমেইল ঠিকানা দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি!" });
      }

      // Exact case-insensitive and whitespace-stripped name check as a security recovery question
      const inputName = name.trim().toLowerCase();
      const dbName = user.name.trim().toLowerCase();
      if (inputName !== dbName) {
        return res.status(400).json({ success: false, message: "প্রদানকৃত ম্যানেজারের নাম অ্যাকাউন্টের সাথে মেলেনি!" });
      }

      const newHash = hashPassword(newPassword);
      const db = loadDB();
      
      // Update in local DB cache
      const localIdx = db.users.findIndex(u => u.userId === user.userId);
      if (localIdx !== -1) {
        db.users[localIdx].passwordHash = newHash;
        saveDB(db);
      } else {
        const newUser = {
          userId: user.userId,
          email: user.email,
          passwordHash: newHash,
          name: user.name,
          createdAt: user.createdAt || new Date().toISOString()
        };
        db.users.push(newUser);
        saveDB(db);
      }

      // Update in Supabase native users table
      try {
        const { error } = await supabase
          .from("users")
          .update({ passwordHash: newHash })
          .eq("userId", user.userId);
        if (error) {
          console.warn("Supabase user password sync error:", error.message);
        }
      } catch (err: any) {
        console.warn("Supabase user password update offline skipping:", err.message);
      }

      res.json({
        success: true,
        message: "আপনার অ্যাকাউন্ট পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! নতুন পাসওয়ার্ড দিয়ে লগইন করুন।"
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "পাসওয়ার্ড উদ্ধার করতে ব্যর্থতা: " + err.message });
    }
  });

  // API - Profile Management
  app.put("/api/users/profile", async (req, res) => {
    try {
      const { userId, name, photoUrl } = req.body;
      if (!userId || !name) {
        return res.status(400).json({ success: false, message: "ব্যবহারকারী ইউজার আইডি ও নাম আবশ্যক!" });
      }

      const db = loadDB();
      const userIdx = db.users.findIndex(u => u.userId === userId);
      if (userIdx !== -1) {
        db.users[userIdx].name = name;
        if (photoUrl !== undefined) {
          (db.users[userIdx] as any).photoUrl = photoUrl;
        }
        saveDB(db);
      }

      // Sync user profile update to Supabase
      try {
        const { error } = await supabase
          .from("users")
          .update({ name, photoUrl })
          .eq("userId", userId);
        if (error) console.error("Failed to update user in Supabase:", error.message);
      } catch (err) {}

      res.json({
        success: true,
        message: "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!",
        user: {
          userId,
          name,
          photoUrl
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে: " + err.message });
    }
  });

  // API - Clients Management
  app.get("/api/clients", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const clients = await getClients(userId);
      res.json({ success: true, data: clients });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const { name, contact, notes } = req.body;
      const userId = req.headers["x-user-id"] as string;
      if (!name) {
        return res.status(400).json({ success: false, message: "ক্লায়েন্টের নাম আবশ্যক!" });
      }

      const newClient: Client = {
        clientId: "client-" + crypto.randomBytes(4).toString("hex"),
        name,
        contact: contact || "",
        notes: notes || "",
        createdAt: new Date().toISOString(),
        userId: userId || "user-admin"
      };

      await saveClient(newClient);

      res.json({ success: true, message: "ক্লায়েন্ট যোগ করা হয়েছে!", data: newClient });
      const db = loadDB();
      await safeGoogleSheetsSync(db);
    } catch (err: any) {
      res.status(500).json({ success: false, message: "ক্লায়েন্ট যোগ করতে সমস্যা হয়েছে: " + err.message });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const clientId = req.params.id;
      await deleteClientFromDB(clientId);
      res.json({ success: true, message: "ক্লায়েন্ট এবং জর্নাল রেকর্ড অপসারণ করা হয়েছে!" });
      const db = loadDB();
      await safeGoogleSheetsSync(db);
    } catch (err: any) {
      res.status(500).json({ success: false, message: "ক্লায়েন্ট অপসারণে সমস্যা হয়েছে: " + err.message });
    }
  });

  // API - Ledger Management
  app.get("/api/ledger", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const ledger = await getLedger(userId);
      res.json({ success: true, data: ledger });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/ledger", async (req, res) => {
    try {
      const { clientId, date, description, plyPage, productWeight, productRate, receivedAmount, createdBy } = req.body;
      const userId = req.headers["x-user-id"] as string;
      if (!clientId || !date || !description) {
        return res.status(400).json({ success: false, message: "ক্লায়েন্ট আইডি, তারিখ এবং বিবরণ আবশ্যক!" });
      }

      const clients = await getClients(userId);
      const parentClient = clients.find(c => c.clientId === clientId);
      if (!parentClient) {
        return res.status(400).json({ success: false, message: "সঠিক ক্লায়েন্ট পাওয়া যায়নি!" });
      }

      const weight = Number(productWeight) || 0;
      const rate = Number(productRate) || 0;
      const received = Number(receivedAmount) || 0;
      const totalAmount = Number((weight * rate).toFixed(2)); // ওজন × দর = মোট টাকা

      const newEntry: LedgerEntry = {
        entryId: "entry-" + crypto.randomBytes(4).toString("hex"),
        clientId,
        clientName: parentClient.name,
        date,
        description,
        plyPage: plyPage || "",
        productWeight: weight,
        productRate: rate,
        totalAmount,
        receivedAmount: received,
        createdAt: new Date().toISOString(),
        createdBy: createdBy || "সিস্টেম অফিস",
        userId: userId || "user-admin"
      };

      await saveLedgerEntry(newEntry);

      res.json({ success: true, message: "রেকর্ড সফলভাবে সংরক্ষণ করা হয়েছে!", data: newEntry });
      const db = loadDB();
      await safeGoogleSheetsSync(db);
    } catch (err: any) {
      res.status(500).json({ success: false, message: "রেকর্ড যুক্ত করা ব্যর্থ হয়েছে: " + err.message });
    }
  });

  app.delete("/api/ledger/:id", async (req, res) => {
    try {
      const entryId = req.params.id;
      await deleteLedgerEntryFromDB(entryId);
      res.json({ success: true, message: "রেকর্ড মুছে ফেলা হয়েছে!" });
      const db = loadDB();
      await safeGoogleSheetsSync(db);
    } catch (err: any) {
      res.status(500).json({ success: false, message: "রেকর্ড মুছতে ত্রুটি: " + err.message });
    }
  });

  // API - Supabase connection status check
  app.get("/api/config/supabase", async (req, res) => {
    try {
      const { data: clients, error: clientsErr } = await supabase.from("clients").select("clientId").limit(1);
      const { data: users, error: usersErr } = await supabase.from("users").select("userId").limit(1);
      const { data: ledger, error: ledgerErr } = await supabase.from("ledger").select("entryId").limit(1);

      const tablesExist = !clientsErr && !usersErr && !ledgerErr;
      
      res.json({
        success: true,
        url: SUPABASE_URL,
        status: tablesExist ? "connected" : "missing_tables",
        error: clientsErr?.message || usersErr?.message || ledgerErr?.message || null
      });
    } catch (err: any) {
      res.json({
        success: true,
        url: SUPABASE_URL,
        status: "error",
        error: err.message
      });
    }
  });

  // API - Google Sheets Connection configuration
  app.get("/api/config/sheets", (req, res) => {
    const db = loadDB();
    const configStatus: GoogleSheetsConfig = {
      spreadsheetId: db.sheetsConfig.spreadsheetId,
      clientEmail: db.sheetsConfig.clientEmail,
      privateKey: db.sheetsConfig.privateKey ? "●●●●●●●●●●●●" : "", // keep it hidden for security in get calls
      status: (db.sheetsConfig.spreadsheetId && db.sheetsConfig.clientEmail && db.sheetsConfig.privateKey) ? "connected" : "not_configured"
    };

    res.json({ success: true, data: configStatus });
  });

  app.post("/api/config/sheets", async (req, res) => {
    try {
      const { spreadsheetId, clientEmail, privateKey } = req.body;
      const db = loadDB();

      // Test sheets connection before saving
      console.log("Testing google sheets connection with: ", spreadsheetId, clientEmail);
      
      const config = {
        spreadsheetId: spreadsheetId || "",
        clientEmail: clientEmail || "",
        privateKey: privateKey || ""
      };

      if (!config.spreadsheetId || !config.clientEmail || !config.privateKey) {
        // Clearing sheets credentials
        db.sheetsConfig = { spreadsheetId: "", clientEmail: "", privateKey: "" };
        saveDB(db);
        return res.json({ success: true, message: "গুগল শিট সংযোগ সম্পূর্ণ বিচ্ছিন্ন করা হয়েছে এবং লোকাল স্টোরেজে ফিরে গেছে।", status: "not_configured" });
      }

      await provisionGoogleSheets(config, db);

      // Verify connection worked, write credentials
      db.sheetsConfig = config;
      saveDB(db);

      res.json({
        success: true,
        message: "গুগল স্প্রেডশিট সফলভাবে টেস্ট ও কানেক্ট হয়েছে! প্রয়োজনীয় ৩টি ট্যাব (Users, Clients, Ledger) ও ডাটা সিঙ্ক সম্পন্ন হয়েছে।",
        status: "connected"
      });
    } catch (err: any) {
      console.error("Sheets connection test failed", err);
      res.status(400).json({
        success: false,
        message: "গুগল শিট সংযোগ ব্যর্থ হয়েছে! পাস করা ক্রেডেনশিয়াল সঠিক কি না তা যাঁচাই করুন। ত্রুটি: " + err.message
      });
    }
  });

  // Vite middleware for frontend development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tasnim & Jannat Knit server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
