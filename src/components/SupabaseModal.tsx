import React, { useState } from "react";
import { Database, Sparkles, X, ShieldAlert, CheckCircle2, Clipboard, CheckCircle } from "lucide-react";

interface SupabaseModalProps {
  onClose: () => void;
  status: 'connected' | 'missing_tables' | 'error' | 'loading';
  url: string;
  error?: string | null;
}

export default function SupabaseModal({ onClose, status, url, error }: SupabaseModalProps) {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- ১. Users টেবিল তৈরি করুন (ম্যানেজার প্রোফাইল)
CREATE TABLE IF NOT EXISTS public.users (
  "userId" TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  name TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "photoUrl" TEXT
);

-- ২. Clients টেবিল তৈরি করুন (প্রত্যেক অ্যাকাউন্ট আলাদা ডাটা)
CREATE TABLE IF NOT EXISTS public.clients (
  "clientId" TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  notes TEXT,
  "createdAt" TEXT NOT NULL,
  "userId" TEXT
);

-- ৩. Ledger টেবিল তৈরি করুন (ওজন, দর ও জমা হিসাব)
CREATE TABLE IF NOT EXISTS public.ledger (
  "entryId" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  "plyPage" TEXT,
  "productWeight" NUMERIC NOT NULL,
  "productRate" NUMERIC NOT NULL,
  "totalAmount" NUMERIC NOT NULL,
  "receivedAmount" NUMERIC NOT NULL,
  "createdAt" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "userId" TEXT
);

-- RLS (Row Level Security) সিকিউরিটি পারমিশন বন্ধ করুন রিয়েল-টাইম এক্সেস দিতে
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger DISABLE ROW LEVEL SECURITY;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-amber-800/15 flex flex-col my-8 max-h-[90vh]">
        
        {/* Top leather-trim decorative bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#045A3E] to-amber-500"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-800/10 px-6 py-4 bg-[#FAF9F5] pt-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-[#045A3E] rounded-xl flex items-center justify-center text-white shadow-sm">
              <Database size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0D382A] font-serif">সুপারবেজ (Supabase) ডাটাবেজ ইন্টিগ্রেশন</h3>
              <p className="text-xs text-amber-800/85 font-bold">Tasnim & Jannat Knit ক্লাউড ডাটাবেজ স্ট্যাটাস</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg cursor-pointer transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-sm text-slate-600 leading-relaxed">
          
          {/* Connection status card */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 font-medium ${
            status === "connected"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : status === "missing_tables"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            {status === "connected" ? (
              <>
                <CheckCircle2 size={24} className="text-[#045A3E] shrink-0" />
                <div>
                  <p className="font-bold text-sm text-[#0D382A]">সংযুক্ত: সুপারবেজ এ ডাটাবেজ সফলভাবে কানেক্টেড আছে!</p>
                  <p className="text-xs font-semibold opacity-90">আপনার ৩টি টেবিল (users, clients, ledger) সক্রিয় এবং রিয়েল-টাইমে সিঙ্ক হচ্ছে।</p>
                </div>
              </>
            ) : status === "missing_tables" ? (
              <>
                <ShieldAlert size={24} className="text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-amber-900">পার্শিয়াল কানেক্টেড: টেবিলসমূহ খুঁজে পাওয়া যায়নি!</p>
                  <p className="text-xs font-semibold opacity-90">সুপারবেজ এপিআই কী কানেক্টেড হয়েছে, তবে ডাটা রাখার জন্য প্রয়োজনীয় টেবিলগুলো তৈরি করা নেই। নিচে দেওয়া SQL কোডটি রান করে টেবিল তৈরি করে নিন!</p>
                </div>
              </>
            ) : (
              <>
                <ShieldAlert size={24} className="text-rose-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-rose-900">কানেকশন ত্রুটি: সুপারবেজ কানেক্ট করা সম্ভব হয়নি</p>
                  <p className="text-xs font-semibold opacity-90">রং ক্রেডেনশিয়াল বা নেটওয়ার্ক কারণে সমস্যা হয়েছে। ইরর মেসেজ: {error || "unknown"}</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Step-by-Step setup guide */}
          <div className="bg-[#FAF9F5] rounded-xl p-5 border border-amber-800/10 space-y-3">
            <h4 className="font-bold text-[#0D382A] flex items-center gap-1.5 mb-1 text-sm border-b border-amber-800/10 pb-1.5 uppercase tracking-wide">
              <Sparkles size={16} className="text-amber-600" /> ওয়ান-ক্লিক ডাটাবেজ টেবিল সেটআপ গাইড
            </h4>
            <ol className="list-decimal list-inside space-y-2 font-semibold text-slate-705">
              <li>
                আপনার <span className="text-[#0D382A] font-bold">Supabase Dashboard</span>-এ যান এবং <span className="text-[#0D382A] font-bold">Tasnim and jannat knit</span> প্রজেক্টটি ওপেন করুন।
              </li>
              <li>
                বামে থাকা সাইডবার থেকে <span className="text-amber-700 font-bold underline">SQL Editor</span> ট্যাবে ক্লিক করুন।
              </li>
              <li>
                <span className="font-bold">New Query</span> বাটনে ক্লিক করে একটি স্ক্র্যাচপ্যাড ওপেন করুন।
              </li>
              <li>
                নিচে দেওয়া SQL কোডটি কপি করে সেখানে পেস্ট করুন এবং নিচে ডানদিকের <span className="bg-[#045A3E] px-2 py-0.5 rounded text-white text-xs font-bold font-sans">Run</span> বাটনে ক্লিক করুন।
              </li>
              <li className="text-emerald-800 bg-emerald-50/50 py-1.5 px-3 rounded-lg border border-emerald-100">
                <span className="font-bold">লোকাল ডাটা ক্যাশে অটো-সিঙ্ক:</span> টেবিল সফলভাবে তৈরি করার সাথে সাথে আপনার লোকাল ডাটাবেজের সমস্ত বিদ্যমান ক্লায়েন্ট খাতা ও লেনদেন রেকর্ড স্বয়ংক্রিয়ভাবে সুপারবেজে স্থানান্তরিত (Bootstrap) হয়ে যাবে!
              </li>
            </ol>
          </div>

          {/* Code Schema Block */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-800 px-4 py-2 rounded-t-xl">
              <span className="text-xs font-mono text-slate-300">schema-setup.sql</span>
              <button
                onClick={copyToClipboard}
                className="text-xs flex items-center gap-1 bg-slate-700 text-white rounded px-2.5 py-1 hover:bg-slate-600 cursor-pointer transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <CheckCircle size={13} className="text-emerald-400" />
                    <span>কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Clipboard size={13} />
                    <span>কপি করুন</span>
                  </>
                )}
              </button>
            </div>
            
            <pre className="p-4 bg-slate-900 text-[#2ef2a0] rounded-b-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-[220px] shadow-inner select-all">
              {sqlSchema}
            </pre>
          </div>

          {/* Connected Credentials Details */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">কানেকশন ক্রেডেনশিয়ালস</h5>
            <div className="space-y-1 text-xs">
              <div className="flex gap-2">
                <span className="w-20 font-bold text-slate-400-text">URL:</span>
                <span className="font-mono text-slate-700 truncate">{url}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 font-bold text-slate-400-text">Project ID:</span>
                <span className="font-mono text-slate-700">mypljqrkpubuceikaene</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 font-bold text-slate-400-text">Role Api:</span>
                <span className="font-mono text-slate-700">Public Anonymous (anon) with Local Fallbacks active</span>
              </div>
            </div>
          </div>

          {/* Button footer actions */}
          <div className="flex justify-end pt-3 border-t border-slate-100 font-sans">
            <button
              onClick={onClose}
              className="py-2 px-6 bg-[#045A3E] text-white hover:bg-[#023E2A] rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md shadow-[#045A3E]/10"
            >
              বন্ধ করুন
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
