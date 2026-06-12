import React, { useState, useEffect } from "react";
import { Link2, Sparkles, X, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { GoogleSheetsConfig } from "../types";

interface SheetsModalProps {
  onClose: () => void;
  onConfigSaved: (config: GoogleSheetsConfig) => void;
}

export default function SheetsModal({ onClose, onConfigSaved }: SheetsModalProps) {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [status, setStatus] = useState<"connected" | "disconnected" | "not_configured">("not_configured");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Load current sheets configuration details on open
    async function fetchConfig() {
      try {
        const res = await fetch("/api/config/sheets");
        const json = await res.json();
        if (json.success && json.data) {
          setSpreadsheetId(json.data.spreadsheetId || "");
          setClientEmail(json.data.clientEmail || "");
          setStatus(json.data.status);
          // Don't pre-populate the actual private key to ensure it remains masked/secure
          if (json.data.privateKey) {
            setPrivateKey("●●●●●●●●●●●●マスクされる秘密鍵●●●●●●●●●●●●");
          }
        }
      } catch (err) {
        console.error("Failed to load spreadsheet config", err);
      }
    }
    fetchConfig();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Guard if user did not edit masked key
    let keyToSubmit = privateKey;
    if (privateKey.includes("マスクされる秘密鍵") || privateKey.startsWith("●")) {
      // User didn't modify are masked key, retrieve original stored from backend, but since they want to save same, we will just pass empty or we tell the server we aren't changing the privateKey.
      // To be safe, if we aren't editing, tell user to input or retrieve.
      // We will tell the body that if they send '●●●', server shouldn't overwrite original private key. 
      // Let's modify our submit so if it is unchanged we send a custom flag or the server handles it.
      // Actually, if we want them to enter, let's allow them to enter. Or let's handle if it contains "●" or "マスクされる秘密鍵", we send partial so server inherits the old key!
    }

    try {
      const res = await fetch("/api/config/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId,
          clientEmail,
          privateKey: (privateKey.startsWith("●") || privateKey.includes("秘密鍵")) ? undefined : privateKey,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "সংযোগে ব্যর্থ হয়েছে!");
      }

      setMessage(json.message);
      setStatus(json.status);
      onConfigSaved({
        spreadsheetId,
        clientEmail,
        privateKey: (privateKey.startsWith("●") || privateKey.includes("秘密鍵")) ? "" : privateKey,
        status: json.status,
      });
    } catch (err: any) {
      setError(err.message || "গুগল শিট টেস্ট কানেকশন ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে গুগল শিট ডিসকানেক্ট করতে চান? সমস্ত নতুন এন্ট্রি লোকাল ডাটাবেজে স্টোর হবে।")) {
      return;
    }
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/config/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId: "",
          clientEmail: "",
          privateKey: "",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSpreadsheetId("");
        setClientEmail("");
        setPrivateKey("");
        setStatus("not_configured");
        setMessage(json.message);
        onConfigSaved({
          spreadsheetId: "",
          clientEmail: "",
          privateKey: "",
          status: "not_configured"
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col my-8 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Link2 size={22} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">গুগল স্প্রেডশিট ডাটাবেজ ইন্টিগ্রেশন</h3>
              <p className="text-xs text-slate-500 font-medium">রিয়েল-টাইম ক্লাউড ব্যাকআপ সিঙ্ক করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content Tab Scrolled */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-sm text-slate-600 leading-relaxed">
          {/* Connection status card */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 font-medium ${
            status === "connected"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-amber-50 border-amber-100 text-amber-800"
          }`}>
            {status === "connected" ? (
              <>
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">সাকসেস: গুগল স্প্রেডশিট কানেক্টেড আছে!</p>
                  <p className="text-xs font-normal opacity-90">ডাটাবেজ স্বয়ংক্রিয়ভাবে গুগল ড্রাইভে সেভ হচ্ছে।</p>
                </div>
              </>
            ) : (
              <>
                <ShieldAlert size={24} className="text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">স্ট্যাটাস: লোকাল ডাটাবেজ চালু আছে</p>
                  <p className="text-xs font-normal opacity-90">পেমেন্ট ও ক্লায়েন্ট রেকর্ড বর্তমানে আপনার ব্রাউজার ও সার্ভার মেমরিতে সংরক্ষিত আছে। চিরস্থায়ী ব্যাকআপ নিশ্চিত করতে নিচের গাইড ফলো করে গুগল শিট কানেক্ট করুন!</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Step-by-Step setup guide */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-2.5">
            <h4 className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1 text-sm border-b border-slate-200 pb-1.5 uppercase tracking-wide">
              <Sparkles size={16} className="text-indigo-500" /> গুগল ক্লাউড এপিআই কি (API Credential) সেটাআপ গাইড
            </h4>
            <ol className="list-decimal list-inside space-y-2 font-medium">
              <li>
                <span className="text-slate-800 font-semibold">Google Cloud Console</span> (
                <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.cloud.google.com</a>
                ) এ গিয়ে ফ্রী প্রজেক্ট তৈরি করুন।
              </li>
              <li>
                <span className="text-slate-800 font-semibold">Google Sheets API</span> সার্চ বক্সে খুঁজে বের করে <span className="text-emerald-600 underline">Enable</span> করুন।
              </li>
              <li>
                <span className="text-slate-800 font-semibold">IAM & Admin &gt; Service Accounts</span> এ গিয়ে একটি Service Account বানিয়ে নিন।
              </li>
              <li>
                সার্ভিস অ্যাকাউন্টটির ভেতরে গিয়ে <span className="text-slate-800 font-semibold">Keys</span> ট্যাবে ক্লিক করুন। <span className="font-bold underline">Add Key &gt; Create New Key &gt; JSON</span> মেথডে একটি ফাইল ডাউনলোড করুন।
              </li>
              <li>
                ডাউনলোড করা JSON ফাইলটি ওপেন করে নিচের বক্সে প্রয়োজনীয় ৩টি ডাটা কপি-পেস্ট করুন।
              </li>
              <li className="text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-100/60">
                <span className="font-bold">গুরুত্বপূর্ণ পদক্ষেপ:</span> আপনার গুগল ড্রাইভ স্প্রেডশিটটি ওপেন করে <span className="font-semibold">Share</span> বাটনে ক্লিক করে Service Account-এর ইমেইলটিকে (<span className="underline italic">client_email</span>) <span className="font-bold border-b border-emerald-600">Editor</span> হিসেবে শেয়ার পারমিশন দিন!
              </li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleConnect} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                গুগল স্প্রেডশিট আইডি (Spreadsheet ID)
              </label>
              <input
                type="text"
                required
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="উদাহরণঃ 1xp2-zP_kI7mB_6n_U-mAs7T7_oIsHsd8s1jsBwZ"
                className="block w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-700 transition-all font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                পরামর্শঃ আপনার গুগল শিট ইউআরএল এর <span className="font-bold">/d/</span> এবং <span className="font-bold">/edit</span> এর ভেতরের ৫-৪০ অক্ষরের কোডটিই হল Spreadsheet ID।
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                সার্ভিস অ্যাকাউন্ট ইমেইল (Client Email)
              </label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="tasnim-jannat-knitt-sa@myproject.iam.gserviceaccount.com"
                className="block w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-700 transition-all font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                সার্ভিস প্রাইভেট কি (Private Key)
              </label>
              <textarea
                rows={5}
                required
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDbF...\n-----END PRIVATE KEY-----"
                className="block w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-700 transition-all font-mono text-xs leading-relaxed"
              ></textarea>
              <p className="text-[11px] text-slate-400 mt-1">
                পরামর্শঃ সম্পূর্ণ কীটি হুবহু কপি করে ফেলুন। ফাইলে এটি `-----BEGIN PRIVATE KEY-----` থেকে শুরু হয়।
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-medium text-xs leading-relaxed">
                ⚠️ {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl font-semibold text-xs leading-relaxed">
                ✅ {message}
              </div>
            )}

            {/* Actions button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-100 disabled:bg-slate-300 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : null}
                সংযুক্ত করুন ও সিঙ্ক করুন
              </button>

              {status === "connected" && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="py-2.5 px-4 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-sm transition-all cursor-pointer"
                >
                  কানেকশন বিচ্ছিন্ন (Disconnect)
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold text-sm transition-all cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
