import React, { useState } from "react";
import { Lock, Mail, User, ShieldCheck, Factory } from "lucide-react";
import { User as UserType } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (user: UserType) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [viewMode, setViewMode] = useState<"login" | "register" | "recover">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    let payload = {};
    let endpoint = "";

    if (viewMode === "login") {
      payload = { email, password };
      endpoint = "/api/auth/login";
    } else if (viewMode === "register") {
      payload = { email, password, name };
      endpoint = "/api/auth/register";
    } else {
      payload = { email, name, newPassword: password };
      endpoint = "/api/auth/recover";
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "কোনো একটি সমস্যা হয়েছে!");
      }

      if (viewMode === "login") {
        onLoginSuccess(data.user);
      } else if (viewMode === "register") {
        setSuccess(data.message + " স্বয়ংক্রিয়ভাবে পোর্টালে লগইন করা হচ্ছে...");
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1500);
      } else {
        setSuccess(data.message);
        setTimeout(() => {
          setViewMode("login");
          setPassword("");
          setError("");
          setSuccess("");
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "সার্ভার সংযোগে ব্যর্থ হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-[#FAF9F5] classic-grid-bg px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Traditional Border Framing for Artistry */}
      <div className="absolute inset-4 pointer-events-none border border-amber-800/10 rounded-3xl hidden md:block"></div>
      <div className="absolute inset-6 pointer-events-none border border-amber-800/5 rounded-2xl hidden md:block"></div>
      
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(45,35,20,0.06)] border border-amber-800/15 transition-all relative z-10">
        
        {/* Banner header resembling a classic registered trade stamp */}
        <div className="text-center relative">
          <div className="mx-auto h-16 w-16 bg-[#045A3E] rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-100 border-2 border-amber-500/30 relative">
            <Factory size={30} className="text-amber-500" />
            <div className="absolute -inset-1 rounded-full border border-dashed border-amber-500/20"></div>
          </div>
          
          <h2 className="mt-5 text-2xl font-extrabold text-[#0D382A] tracking-tight font-sans">
            তাসনিম এন্ড জান্নাত নীট
          </h2>
          <p className="text-xs text-amber-800/80 font-bold tracking-widest mt-1 uppercase">
            Est. 2026 • Made by Salahuddin
          </p>
          <div className="h-[2px] w-1/3 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent mx-auto mt-2.5"></div>
          <p className="text-[12px] text-slate-500 font-semibold mt-1">
            ফ্যাক্টেরি হিসাব রক্ষণ খাতা
          </p>
          
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200/50 uppercase">
              <ShieldCheck size={13} className="text-amber-700" /> সিকিউরড গুগল স্প্রেডশিট ক্লাউড
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-100 font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-100 font-semibold text-center">
            ✅ {success}
          </div>
        )}

        {/* Info header specifically to explain password recovery form values */}
        {viewMode === "recover" && (
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-800 font-semibold leading-relaxed">
            🔑 <strong className="text-amber-900 font-extrabold">পাসওয়ার্ড পুনরুদ্ধার নির্দেশিকা:</strong><br />
            নিবন্ধনকৃত ম্যানেজার ইমেইল এবং মূল নিবন্ধিত ম্যানেজার নাম হুবহু লিখুন। দুটি তথ্য মিলে গেলে তাৎক্ষণিকভাবে নতুন পাসওয়ার্ড সেট হয়ে যাবে।
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3.5">
            {/* Show manager name field for Registration or Password Recovery */}
            {(viewMode === "register" || viewMode === "recover") && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  {viewMode === "recover" ? "নিবন্ধিত ম্যানেজারের নাম (Registered Name)" : "ম্যানেজারের নাম (Manager Name)"} <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="উদাঃ সালাহউদ্দিন রহমান"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#045A3E]/20 focus:border-[#045A3E] text-slate-700 placeholder-slate-400 font-medium transition-all text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                ম্যানেজার ইমেইল (Email Address) <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@factory.com"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#045A3E]/20 focus:border-[#045A3E] text-slate-700 placeholder-slate-400 font-medium transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                {viewMode === "recover" ? "নতুন পাসওয়ার্ড (New Password)" : "নিরাপদ পাসওয়ার্ড (Password)"} <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড (কমপক্ষে ৫ অক্ষর)"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#045A3E]/20 focus:border-[#045A3E] text-slate-700 placeholder-slate-400 font-medium transition-all text-xs"
                />
              </div>
            </div>
          </div>

          {/* Forgot Password Link - Only shown on Login Mode */}
          {viewMode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setViewMode("recover");
                  setError("");
                  setSuccess("");
                }}
                className="text-xs text-amber-800 hover:text-amber-950 font-bold hover:underline cursor-pointer"
              >
                পাসওয়ার্ড ভুলে গেছেন? (Forgot Password)
              </button>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-xs font-bold rounded-xl text-white bg-[#034D35] hover:bg-[#023E2A] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#045A3E] disabled:bg-slate-350 disabled:shadow-none transition-all cursor-pointer"
            >
              {loading
                ? "প্রক্রিয়াধীন আছে..."
                : viewMode === "login"
                ? "নিরাপদ লগইন নিশ্চিত করুন"
                : viewMode === "register"
                ? "নতুন অ্যাকাউন্ট নিবন্ধন"
                : "পাসওয়ার্ড উদ্ধার করুন"}
            </button>
          </div>
        </form>

        <div className="text-center font-semibold mt-4 space-y-2">
          {viewMode === "login" ? (
            <p className="text-xs text-slate-500">
              ফ্যাক্টরি পোর্টালে নতুন?{" "}
              <button
                type="button"
                onClick={() => {
                  setViewMode("register");
                  setError("");
                  setSuccess("");
                }}
                className="text-amber-800 hover:text-amber-950 font-bold underline underline-offset-4 cursor-pointer"
              >
                নতুন অ্যাকাউন্ট নিবন্ধন করুন
              </button>
            </p>
          ) : viewMode === "register" ? (
            <p className="text-xs text-slate-500">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <button
                type="button"
                onClick={() => {
                  setViewMode("login");
                  setError("");
                  setSuccess("");
                }}
                className="text-[#045A3E] hover:text-[#023E2A] font-bold underline underline-offset-4 cursor-pointer"
              >
                লগইন উইন্ডোতে ফিরে যান
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              পাসওয়ার্ড মনে পড়েছে?{" "}
              <button
                type="button"
                onClick={() => {
                  setViewMode("login");
                  setError("");
                  setSuccess("");
                }}
                className="text-[#045A3E] hover:text-[#023E2A] font-bold underline underline-offset-4 cursor-pointer"
              >
                লগইন গেটওয়েতে ফিরে যান
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
