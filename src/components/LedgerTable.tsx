import React, { useState } from "react";
import { LedgerEntry, Client, User } from "../types";
import { Calendar, Layers, Scale, DollarSign, PlusCircle, Printer, Download, Trash2, SlidersHorizontal, Calculator, Landmark, Sparkles, BookOpen, Clock, FileCheck, AlertTriangle } from "lucide-react";
import { translations } from "../translations";
import TJWatermark from "./TJWatermark";

interface LedgerTableProps {
  activeClient: Client | null;
  entries: LedgerEntry[];
  currentUser: User;
  onEntryAdded: (entry: LedgerEntry) => void;
  onEntryDeleted: (entryId: string) => void;
  language?: "bn" | "en";
  theme?: "light" | "dark" | "night";
  managerPhoto?: string | null;
}

const POPULAR_DESCRIPTIONS: string[] = [];

const POPULAR_PLYS: string[] = [];

// Helper function to dynamically stylize transaction entries dynamically based on keywords or string hashes for supreme professional colorful layouts
const getDescriptionStyle = (desc: string, language: "bn" | "en") => {
  const normalized = desc.toLowerCase();
  if (normalized.includes("red") || normalized.includes("লাল") || normalized.includes("suta") || normalized.includes("সুতা")) {
    const isRed = normalized.includes("red") || normalized.includes("লাল");
    return {
      bg: isRed 
        ? "bg-rose-50/70 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300"
        : "bg-emerald-50/70 border-emerald-205 text-emerald-850 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300",
      dot: isRed ? "bg-rose-500" : "bg-emerald-500",
      label: isRed 
        ? (language === "bn" ? "লাল সুতা (Red)" : "Red Yarn")
        : (language === "bn" ? "সুতা (Yarn)" : "Yarn Item")
    };
  }
  if (normalized.includes("black") || normalized.includes("blact") || normalized.includes("কালো") || normalized.includes("rool") || normalized.includes("রোল")) {
    const isBlack = normalized.includes("black") || normalized.includes("blact") || normalized.includes("কালো");
    return {
      bg: isBlack 
        ? "bg-zinc-100 border-zinc-300 text-zinc-800 dark:bg-zinc-850 dark:border-zinc-700 dark:text-zinc-300"
        : "bg-violet-50 border-violet-200 text-violet-750 dark:bg-violet-950/30 dark:border-violet-900/40 dark:text-violet-300",
      dot: isBlack ? "bg-zinc-900 dark:bg-zinc-100" : "bg-violet-500",
      label: isBlack 
        ? (language === "bn" ? "কালো রোল (Black)" : "Black Roll")
        : (language === "bn" ? "রোল (Roll)" : "Roll Item")
    };
  }
  if (normalized.includes("green") || normalized.includes("সবুজ")) {
    return {
      bg: "bg-teal-50 border-teal-200 text-teal-850 dark:bg-teal-950/30 dark:border-teal-900 dark:text-teal-300",
      dot: "bg-teal-500",
      label: language === "bn" ? "সবুজ (Green)" : "Green Shade"
    };
  }
  if (normalized.includes("blue") || normalized.includes("নীল")) {
    return {
      bg: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300",
      dot: "bg-blue-500",
      label: language === "bn" ? "নীল (Blue)" : "Blue Shade"
    };
  }
  if (normalized.includes("yellow") || normalized.includes("হলুদ")) {
    return {
      bg: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300",
      dot: "bg-amber-500",
      label: language === "bn" ? "হলুদ (Yellow)" : "Yellow Shade"
    };
  }
  if (normalized.includes("white") || normalized.includes("সাদা")) {
    return {
      bg: "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300",
      dot: "bg-slate-300 dark:bg-slate-600",
      label: language === "bn" ? "সাদা (White)" : "White Shade"
    };
  }

  // Fallback palettes dynamically generated from string hash to be colorful and exciting!
  const colors = [
    { bg: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900 dark:text-indigo-300", dot: "bg-indigo-500", code: "" },
    { bg: "bg-violet-50 border-violet-200 text-violet-750 dark:bg-violet-950/30 dark:border-violet-900 dark:text-violet-300", dot: "bg-violet-500", code: "" },
    { bg: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 dark:bg-fuchsia-950/30 dark:border-fuchsia-900 dark:text-fuchsia-300", dot: "bg-fuchsia-500", code: "" },
    { bg: "bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-950/30 dark:border-pink-900 dark:text-pink-300", dot: "bg-pink-500", code: "" },
    { bg: "bg-orange-50 border-orange-200 text-orange-755 dark:bg-orange-950/30 dark:border-orange-900 dark:text-orange-300", dot: "bg-orange-400", code: "" },
    { bg: "bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/30 dark:border-cyan-900 dark:text-cyan-300", dot: "bg-cyan-500", code: "" },
    { bg: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300", dot: "bg-amber-500", code: "" },
  ];
  
  const charSum = desc.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[charSum % colors.length];
  return {
    bg: color.bg,
    dot: color.dot,
    label: null
  };
};

export default function LedgerTable({
  activeClient,
  entries,
  currentUser,
  onEntryAdded,
  onEntryDeleted,
  language = "bn",
  theme = "light",
  managerPhoto = null,
}: LedgerTableProps) {
  const t = translations[language];

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [plyPage, setPlyPage] = useState("");
  const [productWeight, setProductWeight] = useState("");
  const [productRate, setProductRate] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  // Custom delete confirmation states
  const [entryToDelete, setEntryToDelete] = useState<LedgerEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!activeClient) {
    // Blank state themes
    const blankContainerClass =
      theme === "dark"
        ? "bg-slate-800 border-slate-700 text-slate-100 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center rounded-2xl border"
        : theme === "night"
        ? "bg-zinc-950 border-zinc-850 text-slate-100 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center rounded-2xl border"
        : "bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center";

    return (
      <div className={blankContainerClass}>
        <Landmark size={48} className="text-slate-350 animate-bounce mb-3" />
        <h3 className={`text-lg font-bold ${theme === "dark" ? "text-teal-400" : theme === "night" ? "text-amber-400" : "text-slate-700"}`}>
          {t.noClientSelected}
        </h3>
        <p className={`text-xs max-w-sm mt-1 font-semibold ${theme === "dark" || theme === "night" ? "text-slate-400" : "text-slate-400"}`}>
          {t.selectClientPrompt}
        </p>
      </div>
    );
  }

  // Calculate dynamic auto total-bill amount before submission
  const weightVal = parseFloat(productWeight) || 0;
  const rateVal = parseFloat(productRate) || 0;
  const calculatedTotal = parseFloat((weightVal * rateVal).toFixed(2));

  // Filter entries for active client and selected date range
  const clientEntries = entries.filter((e) => e.clientId === activeClient.clientId);
  
  const filteredEntries = clientEntries.filter((e) => {
    if (!startDate && !endDate) return true;
    const entryDate = new Date(e.date);
    if (startDate) {
      const start = new Date(startDate);
      if (entryDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (entryDate > end) return false;
    }
    return true;
  });

  // Calculations
  const totalBill = filteredEntries.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalReceived = filteredEntries.reduce((sum, e) => sum + e.receivedAmount, 0);
  const remainingBalance = parseFloat((totalBill - totalReceived).toFixed(2));

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!date || !description.trim()) {
      setFormError(language === "bn" ? "তারিখ এবং বিবরণ পূরণ করা বাধ্যতামূলক!" : "Date and Description are required!");
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentUser?.userId) {
        headers["x-user-id"] = currentUser.userId;
      }
      const res = await fetch("/api/ledger", {
        method: "POST",
        headers,
        body: JSON.stringify({
          clientId: activeClient.clientId,
          date,
          description,
          plyPage: plyPage || "",
          productWeight: weightVal,
          productRate: rateVal,
          receivedAmount: parseFloat(receivedAmount) || 0,
          createdBy: currentUser.name,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || (language === "bn" ? "সংরক্ষণ করতে সমস্যা হয়েছে!" : "Failed to save record!"));
      }

      onEntryAdded(json.data);
      setFormSuccess(language === "bn" ? "রেকর্ডটি খাতায় সফলভাবে জমা হয়েছে!" : "Record posted to ledger successfully!");
      
      // Reset inputs but preserve date for easy consecutive inputs
      setDescription("");
      setPlyPage("");
      setProductWeight("");
      setProductRate("");
      setReceivedAmount("");
    } catch (err: any) {
      setFormError(err.message || (language === "bn" ? "সার্ভার সংযোগ ত্রুটি!" : "Server connection error!"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = (entry: LedgerEntry) => {
    setEntryToDelete(entry);
  };

  const confirmDeleteEntry = async () => {
    if (!entryToDelete) return;
    setDeletingId(entryToDelete.entryId);

    try {
      const headers: Record<string, string> = {};
      if (currentUser?.userId) {
        headers["x-user-id"] = currentUser.userId;
      }
      const res = await fetch(`/api/ledger/${entryToDelete.entryId}`, {
        method: "DELETE",
        headers,
      });
      const json = await res.json();
      if (json.success) {
        onEntryDeleted(entryToDelete.entryId);
        setEntryToDelete(null);
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert((language === "bn" ? "রেকর্ড সরাতে ব্যর্থতা: " : "Removal failed: ") + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Export to Excel CSV (UTF-8 BOM supported!)
  const handleExportCSV = () => {
    const headers = [
      language === "bn" ? "তারিখ (Date)" : "Date",
      language === "bn" ? "বিবরণ (Description)" : "Description",
      language === "bn" ? "পৃষ্ঠা/ফালি (Page/Ply)" : "Page/Ply",
      language === "bn" ? "ওজন (Weight - kg)" : "Weight (kg)",
      language === "bn" ? "দর (Rate)" : "Rate (৳)",
      language === "bn" ? "মোট টাকা (Total Bill)" : "Total Bill (৳)",
      language === "bn" ? "জমা টাকা (Received Amount)" : "Received Amount (৳)"
    ];
    
    const rows = filteredEntries.map((e) => [
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.plyPage || ""}"`,
      e.productWeight,
      e.productRate,
      e.totalAmount,
      e.receivedAmount,
    ]);

    rows.push([]);
    rows.push(["M/S Tasnim & Jannat Knit"]);
    rows.push([language === "bn" ? "ক্লায়েন্টঃ" : "Client:", `"${activeClient.name}"`]);
    rows.push([language === "bn" ? "রিপোর্ট মেয়াদঃ" : "Report Period:", `${startDate || "شروع"} to ${endDate || "Present"}`]);
    rows.push([language === "bn" ? "মোট বিল টাকা (Total Bill):" : "Total Bill Amount:", totalBill]);
    rows.push([language === "bn" ? "মোট আদায়/জমা (Total Received):" : "Total Received Amount:", totalReceived]);
    rows.push([language === "bn" ? "অবশিষ্ট পাওনা (Remaining Balance):" : "Total Remaining Outstanding:", remainingBalance]);

    const csvContent = 
      "\uFEFF" + // UTF-8 BOM
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeClient.name.replace(/\s+/g, "_")}_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterActive(false);
  };

  // Theme styling configurations
  const primaryBg =
    theme === "dark" 
      ? "bg-slate-800 border-slate-700 shadow-md text-slate-100" 
      : theme === "night"
      ? "bg-zinc-950 border-zinc-850 shadow-md text-zinc-100"
      : "bg-white rounded-2xl border-2 border-amber-800/15 p-6 shadow-md";

  const bannerClass =
    theme === "dark"
      ? "bg-slate-850 border border-slate-755 text-slate-100"
      : theme === "night"
      ? "bg-zinc-900 border border-zinc-855 text-zinc-100"
      : "bg-white rounded-2xl border-2 border-amber-800/15 p-6 shadow-md";

  const cardTitleClass =
    theme === "dark" ? "text-teal-400" : theme === "night" ? "text-amber-400" : "text-[#0D382A] font-serif";

  const subtitleSpan =
    theme === "dark"
      ? "text-amber-400 bg-slate-900/40 border border-slate-700/80"
      : theme === "night"
      ? "text-amber-300 bg-black/50 border border-zinc-800"
      : "text-amber-800 bg-amber-50 border border-amber-200/60";

  const paperCardClass =
    theme === "dark"
      ? "bg-slate-800 border border-slate-700 p-5 shadow-md relative overflow-hidden"
      : theme === "night"
      ? "bg-zinc-950 border border-zinc-900 p-5 shadow-md relative overflow-hidden"
      : "bg-white rounded-2xl p-5 shadow-md border-2 border-amber-800/15 transition-all relative overflow-hidden";

  const inputClass =
    theme === "dark"
      ? "w-full px-3.5 py-2 border border-slate-700 rounded-xl text-xs bg-slate-950 text-slate-100 placeholder-slate-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-450 font-bold"
      : theme === "night"
      ? "w-full px-3.5 py-2 border border-zinc-800 rounded-xl text-xs bg-black text-[#FFF9E6] placeholder-zinc-500 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-450 font-bold"
      : "w-full px-3.5 py-2 border border-slate-250 rounded-xl text-xs bg-slate-50/55 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#045A3E]/10 focus:border-[#045A3E] text-black font-extrabold placeholder-slate-500 transition-all";

  const formBoxClass =
    theme === "dark"
      ? "bg-slate-800 border border-slate-700 p-6 shadow-md relative overflow-hidden space-y-4"
      : theme === "night"
      ? "bg-zinc-950 border border-zinc-850 p-6 shadow-md relative overflow-hidden space-y-4"
      : "bg-white rounded-2xl border-2 border-amber-800/15 p-6 shadow-md relative overflow-hidden space-y-4";

  const gridTableBoxClass =
    theme === "dark"
      ? "bg-slate-800 border border-slate-700 shadow-md rounded-2xl overflow-hidden"
      : theme === "night"
      ? "bg-zinc-950 border border-zinc-850 shadow-md rounded-2xl overflow-hidden"
      : "bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden";

  const labelClass =
    theme === "dark"
      ? "block text-xs font-extrabold text-teal-400 mb-1.5"
      : theme === "night"
      ? "block text-xs font-extrabold text-amber-400 mb-1.5"
      : "block text-xs font-extrabold text-[#045A3E] mb-1.5";

  const tableHeaderBg =
    theme === "dark"
      ? "bg-slate-900 border-b border-slate-700 text-teal-400 font-bold uppercase"
      : theme === "night"
      ? "bg-zinc-900 border-b border-zinc-850 text-amber-400 font-bold uppercase"
      : "bg-[#045A3E] text-white font-bold border-b border-slate-200 uppercase";

  const trThemeClass =
    theme === "dark"
      ? "border-b border-slate-750 hover:bg-slate-700/30 text-slate-150"
      : theme === "night"
      ? "border-b border-zinc-900 hover:bg-zinc-900/30 text-zinc-150"
      : "hover:bg-slate-50/45 transition-all text-black border-b border-slate-200/60";

  return (
    <div className="space-y-6">
      
      {/* Client Header Info Box */}
      <div className={`${bannerClass} p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print transition-all relative overflow-hidden animate-fade-in`}>
        {/* Left gold decorative sash */}
        <div className="absolute left-0 inset-y-0 w-1.5 bg-gradient-to-b from-[#045A3E] via-amber-500 to-[#045A3E]"></div>
        <div className="pl-3">
          <span className={`${subtitleSpan} text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1.5 max-w-max`}>
            <Sparkles size={11} className="animate-pulse" /> {language === "bn" ? "সক্রিয় ক্লায়েন্ট খাতা (Active Ledger)" : "Active Client Ledger"}
          </span>
          <h2 className={`text-xl md:text-2xl font-bold mt-2 ${cardTitleClass}`}>{activeClient.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium font-sans">
            {activeClient.contact && <span className={`${theme === "dark" || theme === "night" ? "bg-slate-900" : "bg-slate-50"} border border-slate-700/10 px-2 py-0.5 rounded-md`}>📞 {language === "bn" ? "যোগাযোগঃ " : "Contact: "}{activeClient.contact}</span>}
            {activeClient.notes && <span className={`${theme === "dark" || theme === "night" ? "bg-[#251A0A]" : "bg-amber-50/50"} border border-amber-200/10 px-2 py-0.5 rounded-md text-amber-500`}>📍 {language === "bn" ? "ঠিকানা/নোটঃ " : "Notes: "}{activeClient.notes}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto pl-3">
          <button
            onClick={handlePrint}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${
              theme === "dark" || theme === "night"
                ? "border-slate-700 hover:bg-slate-800 text-slate-200"
                : "border-amber-800/10 hover:border-amber-800/30 hover:bg-[#FAF8F5] text-amber-950"
            }`}
          >
            <Printer size={15} className={theme === "light" ? "text-amber-800" : "text-amber-400"} /> {t.printReceiptBtn}
          </button>
          <button
            onClick={handleExportCSV}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
              theme === "dark"
                ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600"
                : theme === "night"
                ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                : "bg-[#045A3E] hover:bg-[#023E2A] text-white border-[#045A3E] hover:shadow-md hover:shadow-emerald-100"
            }`}
          >
            <Download size={15} /> {language === "bn" ? "এক্সেল ডাউনলোড (Excel)" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Numerical Stats Summaries (হালখাতা মোট হিসাব) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print animate-fade-in">
        
        {/* Total Bill Card */}
        <div className={`text-white rounded-2xl p-5 shadow-lg border transition-all relative overflow-hidden ${
          theme === "night" ? "bg-zinc-900 border-zinc-800" : "bg-[#045A3E] border-emerald-800"
        }`}>
          <p className="text-xs font-bold uppercase text-emerald-200 tracking-wider">{t.totalCol}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight mt-1.5 text-white">
            ৳ {totalBill.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
          </h3>
          <p className="text-[10px] text-emerald-200/85 mt-1 uppercase font-bold">
            {language === "bn" ? "ওজন × দর এর সমষ্টি" : "Weight x Rate Aggregate Sum"}
          </p>
          <div className="absolute top-0 right-0 p-3 text-emerald-500/15 pointer-events-none">
            <Calculator size={70} className="transform rotate-12" />
          </div>
        </div>

        {/* Total Received Card */}
        <div className={paperCardClass}>
          <p className={`text-xs font-bold uppercase tracking-wider ${theme === "light" ? "text-amber-800" : "text-slate-400"}`}>{t.receivedCol}</p>
          <h3 className={`text-2xl md:text-3xl font-extrabold font-mono tracking-tight mt-1.5 ${
            theme === "dark" ? "text-teal-400" : theme === "night" ? "text-amber-400" : "text-[#045A3E]"
          }`}>
            ৳ {totalReceived.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
            {language === "bn" ? "আদায়কৃত ভাউচার ক্যাশ" : "Cleared Account Cash"}
          </p>
          <div className="absolute top-0 right-0 p-3 text-emerald-500/10 pointer-events-none">
            <DollarSign size={70} className="transform rotate-12" />
          </div>
        </div>

        {/* Dynamic Remaining Balance Card */}
        <div className={`rounded-2xl p-5 shadow-md border transition-all relative overflow-hidden ${
          remainingBalance > 0 
            ? theme === "dark" || theme === "night"
              ? "bg-rose-950/20 border-rose-900/60 text-rose-300"
              : "bg-rose-50/55 border-rose-200/80 text-rose-900" 
            : theme === "dark" || theme === "night"
              ? "bg-teal-950/20 border-teal-900/50 text-teal-300"
              : "bg-emerald-50 border-emerald-100 text-emerald-950"
        }`}>
          <p className="text-xs font-bold uppercase opacity-85 tracking-wider">{language === "bn" ? "অবশিষ্ট মোট টাকা (Remaining Dues)" : "Remaining outstanding dues"}</p>
          <h3 className={`text-2xl md:text-3xl font-extrabold font-mono tracking-tight mt-1.5 ${
            remainingBalance > 0 ? "text-rose-500" : "text-emerald-500"
          }`}>
            ৳ {remainingBalance.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
          </h3>
          <p className="text-[10px] opacity-85 mt-1 uppercase font-bold">
            {remainingBalance > 0 
              ? (language === "bn" ? "ফ্যাক্টরি পাওনা পাবেন" : "Receivable outstanding dues")
              : (language === "bn" ? "হিসাব সম্পূর্ণ পরিশোধ" : "fully cleared")}
          </p>
          <div className="absolute top-0 right-0 p-3 text-rose-500/10 pointer-events-none">
            <BookOpen size={70} className="transform rotate-12" />
          </div>
        </div>

      </div>

      {/* Date Range filters block */}
      <div className={`${primaryBg} p-5 space-y-4 no-print border-l-4 border-emerald-600`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/10 pb-3 gap-2">
          <div className={`flex items-center gap-1.5 font-extrabold text-sm px-3 py-1 bg-[#045A3E]/10 rounded-lg ${
            theme === "dark" ? "text-teal-400 bg-slate-900 border border-slate-800" : theme === "night" ? "text-amber-400 bg-black border border-zinc-900" : "text-[#045A3E]"
          }`}>
            <SlidersHorizontal size={15} className="animate-pulse" /> 
            {language === "bn" ? "নির্দিষ্ট ডেটরেঞ্জ ফিল্টার (Filter Ledger)" : "Specific Date-range Filter"}
          </div>
          {(startDate || endDate) && (
            <button onClick={resetFilters} className="text-xs text-rose-600 hover:underline cursor-pointer font-extrabold">
              {language === "bn" ? "ফিল্টার রিসেট ❌" : "Reset Filter ❌"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{language === "bn" ? "শুরুর তারিখ (Start Date)*" : "Start Date*"}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{language === "bn" ? "শেষের তারিখ (End Date)*" : "End Date*"}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Transaction Records Data Grid Table */}
      <div className={gridTableBoxClass + " no-print relative overflow-hidden"}>
        {/* Subtle, beautiful live client database background watermark */}
        <TJWatermark size={240} opacity={theme === "light" ? 0.04 : 0.02} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
          theme === "dark" 
            ? "bg-slate-900 border-slate-700" 
            : theme === "night" 
            ? "bg-black border-zinc-900" 
            : "bg-emerald-50/50 border-emerald-100 text-[#045A3E]"
        }`}>
          <span className={`text-sm font-extrabold flex items-center gap-2 ${
            theme === "dark" ? "text-teal-400" : theme === "night" ? "text-amber-400" : "text-[#045A3E]"
          }`}>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            {t.ledgerTitle} ({filteredEntries.length} Plugs)
          </span>
          <span className={`text-xs font-extrabold flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            theme === "dark"
              ? "bg-slate-800 text-slate-100 border-slate-700"
              : theme === "night"
              ? "bg-zinc-900 text-amber-400 border-zinc-800"
              : "bg-emerald-800 text-white border-[#045A3E] shadow-3xs"
          }`}>
            {managerPhoto && <img referrerPolicy="no-referrer" src={managerPhoto} alt="Manager" className="h-5 w-5 rounded-full object-cover border-2 border-white/40 shadow-2xs" />}
            <span>{t.activeManagerLabel}: <strong className="font-extrabold underline decoration-amber-400 decoration-2">{currentUser.name}</strong></span>
          </span>
        </div>

        {/* Scrollable table container */}
        <div className="overflow-x-auto print-container">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={tableHeaderBg}>
                <th className="p-4 font-extrabold text-xs">{t.dateCol}</th>
                <th className="p-4 font-extrabold text-xs">{t.descriptionCol}</th>
                <th className="p-4 font-extrabold text-xs">{language === "bn" ? "ফালি বা পৃষ্ঠা (Page/Ply)" : "Page/Ply"}</th>
                <th className="p-4 text-right font-extrabold text-xs">{t.weightCol}</th>
                <th className="p-4 text-right font-extrabold text-xs">{t.rateCol}</th>
                <th className="p-4 text-right font-extrabold text-xs">{language === "bn" ? "মোট টাকা (Total)" : "Total Bill"}</th>
                <th className="p-4 text-right font-extrabold text-xs">{language === "bn" ? "টাকা জমা (Received)" : "Payment Received"}</th>
                <th className="p-4 text-center font-extrabold text-xs">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/10 font-bold">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((e) => {
                  const style = getDescriptionStyle(e.description, language);
                  return (
                    <tr key={e.entryId} className={trThemeClass}>
                      <td className="p-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold shadow-3xs border ${
                          theme === "dark"
                            ? "bg-slate-900 text-slate-300 border-slate-700"
                            : theme === "night"
                            ? "bg-zinc-900 text-[#FFF9E6] border-zinc-800"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}>
                          <Calendar size={12} className="text-[#045A3E] dark:text-teal-400" />
                          {e.date}
                        </div>
                      </td>
                      <td className="p-4 max-w-[260px]">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-extrabold border shadow-3xs ${style.bg}`}>
                          <span className={`h-2 w-2 rounded-full shrink-0 ${style.dot} animate-pulse`} />
                          <span className="truncate" title={e.description}>{e.description}</span>
                          {style.label && (
                            <span className="text-[9px] font-extrabold opacity-85 uppercase tracking-widest pl-1.5 ml-1 border-l border-current">
                              {style.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {e.plyPage ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                            theme === "dark"
                              ? "bg-slate-900 border-slate-700 text-teal-400 font-mono"
                              : theme === "night"
                              ? "bg-zinc-950 border-zinc-800 text-amber-400 font-mono"
                              : "bg-purple-50 border-purple-100 text-purple-700 font-mono"
                          }`}>
                            <Layers size={11} className="opacity-75" />
                            {e.plyPage}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-medium">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {e.productWeight > 0 ? (
                          <div className="inline-flex items-center gap-1 justify-end">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${
                              theme === "dark"
                                ? "bg-slate-900 border-slate-700 text-sky-400"
                                : theme === "night"
                                ? "bg-zinc-900 border-zinc-800 text-sky-300"
                                : "bg-blue-50 border-blue-100 text-blue-700"
                            }`}>
                              <Scale size={11} className="inline mr-1 opacity-70" />
                              {e.productWeight.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold ml-1">kg</span>
                          </div>
                        ) : (
                          <span className="text-slate-450 italic font-medium">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {e.productRate > 0 ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${
                            theme === "dark"
                              ? "bg-slate-900 border-slate-700 text-amber-400"
                              : theme === "night"
                              ? "bg-zinc-900 border-zinc-800 text-[#FFF9E6]"
                              : "bg-emerald-50/50 border-emerald-150 text-emerald-800"
                          }`}>
                            ৳{e.productRate.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-450 italic font-medium">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {e.totalAmount > 0 ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border shadow-3xs ${
                            theme === "dark"
                              ? "bg-rose-950/20 border-rose-900/40 text-rose-300"
                              : theme === "night"
                              ? "bg-rose-950/30 border-rose-900/50 text-[#FFA6A6]"
                              : "bg-rose-550/10 border-rose-200 text-rose-700"
                          }`}>
                            ৳{e.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-450 italic font-medium">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {e.receivedAmount > 0 ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border shadow-3xs ${
                            theme === "dark"
                              ? "bg-emerald-950/25 border-emerald-900/40 text-teal-300"
                              : theme === "night"
                              ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                              : "bg-emerald-50 border-emerald-150 text-emerald-700"
                          }`}>
                            <FileCheck size={11} className="text-emerald-500 mr-0.5" />
                            ৳{e.receivedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-450 italic font-medium">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteEntry(e)}
                          className={`p-1.5 rounded-lg border border-transparent transition-all cursor-pointer ${
                            theme === "dark" || theme === "night"
                              ? "text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 hover:border-rose-900/40"
                              : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-150"
                          }`}
                          title={language === "bn" ? "মুছে ফেলুন" : "Delete record"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                    {language === "bn" ? "কোনো লেনদেনের রেকর্ড পাওয়া যায়নি। নিচের ফরমটি পূরণ করে প্রথম এন্ট্রি করুন!" : "No transaction records found. Fill the form below to post the first ledger record!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live ledger entry form inside non-printable area */}
      <div className={formBoxClass + " no-print border-l-4 border-[#045A3E]"}>
        
        <div className={`p-3 font-extrabold rounded-xl border flex items-center gap-2 ${
          theme === "dark"
            ? "bg-slate-900 border-slate-755 text-teal-400 text-sm"
            : theme === "night"
            ? "bg-black border-zinc-900 text-amber-400 text-sm"
            : "bg-emerald-550/10 border-emerald-100 text-[#045A3E] text-sm shadow-xs"
        }`}>
          <PlusCircle size={18} className="animate-pulse" /> 
          {t.addEntryHeader}
        </div>

        {formError && <div className="bg-rose-550/10 text-rose-500 text-xs p-3.5 rounded-xl border border-rose-900/10 font-bold">⚠️ {formError}</div>}
        {formSuccess && <div className="bg-emerald-555/10 text-emerald-500 text-xs p-3.5 rounded-xl border border-emerald-900/10 font-bold">✅ {formSuccess}</div>}

        <form onSubmit={handleAddEntry} className="space-y-4 pb-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            <div>
              <label className={labelClass}>{t.datePlaceholder}*</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>{language === "bn" ? "বিবরণ ও বিবরণী (Description)*" : "Description*"}</label>
              <input
                type="text"
                required
                placeholder={t.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {POPULAR_DESCRIPTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDescription(sug)}
                    className="text-[10px] bg-slate-900/25 hover:bg-emerald-800/10 hover:text-emerald-500 font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer border border-transparent text-slate-400 shrink-0"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>{t.plyPagePlaceholder}</label>
              <input
                type="text"
                placeholder="উদাঃ ৪ পৃষ্ঠা"
                value={plyPage}
                onChange={(e) => setPlyPage(e.target.value)}
                className={inputClass}
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {POPULAR_PLYS.map((ply, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPlyPage(ply)}
                    className="text-[10px] bg-slate-900/25 hover:bg-emerald-800/10 hover:text-emerald-500 font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer border border-transparent text-slate-400 shrink-0"
                  >
                    + {ply}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>{language === "bn" ? "প্রডাক্টের ওজন (Weight kg)" : "Product Weight (kg)"}</label>
              <input
                type="number"
                step="0.01"
                placeholder={t.weightPlaceholder}
                value={productWeight}
                onChange={(e) => setProductWeight(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>{language === "bn" ? "দর রেট (Price per unit ৳)" : "Rate of product (৳)"}</label>
              <input
                type="number"
                step="0.01"
                placeholder={t.ratePlaceholder}
                value={productRate}
                onChange={(e) => setProductRate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>
                {language === "bn" ? "টাকার অঙ্ক দিন (Payment Amount)*" : "Amount (৳)"}
              </label>
              <input
                type="number"
                step="0.01"
                placeholder={t.receivedPlaceholder}
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                className={inputClass}
              />
              <p className={`text-[10px] font-extrabold mt-1.5 ${
                theme === "dark" ? "text-teal-400/85" : theme === "night" ? "text-amber-400/85" : "text-[#7C2D12]"
              }`}>
                {language === "bn" ? "*যদি নগদ বা ব্যাংক জমা থাকে তবে এন্ট্রি করুন। খালি রাখলে জমা ০ হিসেবে গণ্য হবে।" : "*Enter cash or bank deposits here."}
              </p>
            </div>

            <div className={`p-4 rounded-xl flex flex-col justify-center border ${
              theme === "dark"
                ? "bg-slate-950 border-slate-700 text-slate-100 shadow-sm"
                : theme === "night"
                ? "bg-black border-zinc-850 text-zinc-100 shadow-sm"
                : "bg-amber-50/50 border-amber-200 text-[#301602] shadow-xs"
            }`}>
              <span className={`text-[10px] font-extrabold uppercase ${
                theme === "dark" ? "text-teal-400" : theme === "night" ? "text-amber-400" : "text-amber-900"
              }`}>{language === "bn" ? "বিলিং হিসাব ক্যালকুলেটর" : "Total auto-calculation"}</span>
              <span className="text-[11px] font-extrabold mt-1 text-slate-700 dark:text-slate-300">
                {productWeight && productRate ? (
                  <span className="bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded text-xs select-none">
                    {productWeight} kg × ৳{productRate}
                  </span>
                ) : (
                  <span className="text-rose-500 dark:text-rose-400 font-extrabold">🚫 {language === "bn" ? "ওজন ও দর লিখুন" : "Provide weights and rate"}</span>
                )}
              </span>
              <span className={`text-md font-extrabold mt-1.5 leading-none ${
                theme === "light" ? "text-[#045A3E]" : "text-emerald-400"
              }`}>
                {calculatedTotal > 0 ? `৳ ${calculatedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "৳ ০.০০"}
              </span>
            </div>

          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-2.5 text-xs font-extrabold text-white rounded-xl shadow-md cursor-pointer border flex items-center justify-center gap-1.5 transition-all ${
                theme === "dark"
                  ? "bg-teal-600 hover:bg-teal-700 border-teal-600"
                  : theme === "night"
                  ? "bg-amber-600 hover:bg-amber-700 border-amber-600"
                  : "bg-[#045A3E] hover:bg-[#023E2A] border-[#045A3E] hover:shadow-lg hover:shadow-emerald-100"
              }`}
            >
              <PlusCircle size={15} /> {loading ? t.savingRecord : t.addRecordBtn}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Sleek Delete Confirmation Modal Overlay */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in no-print">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-xl relative overflow-hidden ${
            theme === "dark"
              ? "bg-slate-900 border-slate-750 text-slate-100"
              : theme === "night"
              ? "bg-zinc-950 border-zinc-850 text-zinc-100"
              : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                <AlertTriangle size={24} className="animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold text-rose-500 uppercase tracking-wider">
                  {language === "bn" ? "রেকর্ড মুছে ফেলার সতর্কতা!" : "Delete Confirmation!"}
                </h3>
                <p className="text-xs font-bold mt-2 font-semibold">
                  {language === "bn" 
                    ? "আপনি কি নিশ্চিতভাবে এই খাতা রেকর্ডটি মুছে ফেলতে চান? এটি স্থায়ীভাবে ডিলিট হয়ে যাবে এবং আর পুনরুদ্ধার করা যাবে না।"
                    : "Are you sure you want to permanently delete this entry? This action is irreversible."}
                </p>
                
                {/* Details view */}
                <div className={`mt-4 p-3 rounded-xl border text-xs space-y-1.5 font-bold ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-300"
                    : theme === "night"
                    ? "bg-black border-zinc-900 text-zinc-300"
                    : "bg-slate-50 border-slate-150 text-slate-700"
                }`}>
                  <div className="flex justify-between">
                    <span className="opacity-70">{language === "bn" ? "তারিখঃ" : "Date:"}</span>
                    <span className="font-mono text-black dark:text-white font-extrabold">{entryToDelete.date}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="opacity-70">{language === "bn" ? "বিবরণঃ" : "Description:"}</span>
                    <span className="text-right text-black dark:text-white font-extrabold truncate max-w-[200px]" title={entryToDelete.description}>{entryToDelete.description}</span>
                  </div>
                  {(entryToDelete.productWeight > 0 || entryToDelete.receivedAmount > 0) && (
                    <div className="border-t border-slate-700/15 pt-1.5 mt-1.5 space-y-1">
                      {entryToDelete.productWeight > 0 && (
                        <div className="flex justify-between text-[11px]">
                          <span className="opacity-70">{language === "bn" ? "ওজন ও দরঃ" : "Weight & Rate:"}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-extrabold">{entryToDelete.productWeight} kg × ৳{entryToDelete.productRate}</span>
                        </div>
                      )}
                      {entryToDelete.totalAmount > 0 && (
                        <div className="flex justify-between text-[11px]">
                          <span className="opacity-70">{language === "bn" ? "মোট বিলঃ" : "Total Bill:"}</span>
                          <span className="text-rose-500 font-extrabold">৳{entryToDelete.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {entryToDelete.receivedAmount > 0 && (
                        <div className="flex justify-between text-[11px]">
                          <span className="opacity-70">{language === "bn" ? "জমাঃ" : "Received:"}</span>
                          <span className="text-emerald-500 font-extrabold">৳{entryToDelete.receivedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-700/15 pt-4">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer border ${
                  theme === "dark" || theme === "night"
                    ? "border-slate-700 hover:bg-slate-800 text-slate-300"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                {language === "bn" ? "বাতিল করুন" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={confirmDeleteEntry}
                className="px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer border border-rose-600 flex items-center gap-1.5"
              >
                {deletingId ? (
                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
                {language === "bn" ? "হ্যাঁ, মুছে ফেলুন" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Special Printable Only Receipt Document - Activated only on Print Command */}
      <div className="print-only-block bg-white text-black p-4 space-y-6 relative overflow-hidden min-h-[850px]">
        {/* Printable Paper Watermark Logo representing the official "TJ" letterhead seal */}
        <TJWatermark size={380} opacity={0.07} className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="text-center pb-4 border-b-2 border-slate-800 relative">
          
          {/* Printable Logo/Stamp decoration if manager photo exists */}
          {managerPhoto && (
            <img
              referrerPolicy="no-referrer"
              src={managerPhoto}
              alt="Manager Stamp"
              className="absolute left-2 top-0 h-16 w-16 rounded-full object-cover border border-slate-800"
            />
          )}

          <h1 className="text-2xl font-bold uppercase tracking-wider font-serif">{t.printMemoTitle}</h1>
          <p className="text-xs font-semibold mt-1">{t.mrsName}</p>
          <p className="text-[11px] text-slate-600">{t.factorySubtitle}</p>
          <p className="text-[10px] text-slate-500 font-bold">
            {t.reportDate}ঃ {new Date().toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")} | {t.managerLabel}ঃ {currentUser.name}
          </p>
        </div>

        <div className="flex justify-between items-start text-xs pt-2">
          <div>
            <p className="font-bold uppercase">{language === "bn" ? "গ্রাহক বিবরণী (Client Details):" : "Client Details:"}</p>
            <p className="text-sm font-extrabold mt-1 text-slate-900">{activeClient.name}</p>
            {activeClient.contact && <p className="font-bold">{language === "bn" ? "মোবাইলঃ " : "Mobile: "}{activeClient.contact}</p>}
            {activeClient.notes && <p className="font-bold">{language === "bn" ? "ঠিকানাঃ " : "Address: "}{activeClient.notes}</p>}
          </div>
          <div className="text-right">
            <p className="font-bold uppercase">{language === "bn" ? "মেয়াদকাল (Duration):" : "Duration Period:"}</p>
            <p className="font-semibold">{startDate ? startDate : (language === "bn" ? "গোড়াপত্তন" : "Beginning")} - {endDate ? endDate : (language === "bn" ? "চলতি সময়" : "Present")}</p>
            <p className="mt-2.5 font-extrabold uppercase">{language === "bn" ? "বিলের সারসংক্ষেপঃ" : "Billing summary:"}</p>
            <p className="font-mono">{t.totalCalculationLabel} ৳ {totalBill.toLocaleString("en-IN")}</p>
            <p className="font-mono">{t.totalReceivedLabel} ৳ {totalReceived.toLocaleString("en-IN")}</p>
            <p className="font-bold border-t border-black pt-1 font-mono text-rose-700">
              {t.remainingDueLabel} ৳ {remainingBalance.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Dynamic Table populated inside print view */}
        <table className="w-full text-xs text-left border-collapse border border-slate-800 mt-4">
          <thead>
            <tr className="bg-slate-200 font-bold border border-slate-800">
              <th className="p-2 border border-slate-800 text-center">{language === "bn" ? "তারিখ (Date)" : "Date"}</th>
              <th className="p-2 border border-slate-800 text-left">{language === "bn" ? "বিবরণ (Description)" : "Description"}</th>
              <th className="p-2 border border-slate-800 text-center">{language === "bn" ? "পৃষ্ঠা (Page)" : "Page/Ply"}</th>
              <th className="p-2 border border-slate-800 text-right">{language === "bn" ? "ওজন (Weight kg)" : "Weight kg"}</th>
              <th className="p-2 border border-slate-800 text-right">{language === "bn" ? "দর (Rate)" : "Rate"}</th>
              <th className="p-2 border border-slate-800 text-right">{language === "bn" ? "মোট টাকা (Total)" : "Total Bill"}</th>
              <th className="p-2 border border-slate-800 text-right">{language === "bn" ? "জমা (Received)" : "Received"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((e, idx) => (
                <tr key={idx} className="border border-slate-800 font-medium">
                  <td className="p-2 border border-slate-800 text-center font-mono">{e.date}</td>
                  <td className="p-2 border border-slate-800 text-left">{e.description}</td>
                  <td className="p-2 border border-slate-800 text-center">{e.plyPage || "—"}</td>
                  <td className="p-2 border border-slate-800 text-right font-mono">{e.productWeight > 0 ? `${e.productWeight} kg` : "—"}</td>
                  <td className="p-2 border border-slate-800 text-right font-mono">{e.productRate > 0 ? `৳${e.productRate}` : "—"}</td>
                  <td className="p-2 border border-slate-800 text-right font-mono">{e.totalAmount > 0 ? `৳${e.totalAmount.toLocaleString("en-IN")}` : "—"}</td>
                  <td className="p-2 border border-slate-800 text-right font-mono text-emerald-800 font-semibold">{e.receivedAmount > 0 ? `৳${e.receivedAmount.toLocaleString("en-IN")}` : "—"}</td>
                </tr>
              ))
            ) : (
              <tr className="border border-slate-800">
                <td colSpan={7} className="p-4 text-center text-slate-400 font-medium text-xs">
                  {language === "bn" ? "কোনো লেনদেনের রেকর্ড পাওয়া যায়নি।" : "No historical entries recorded."}
                </td>
              </tr>
            )}
            {/* Total Footer row */}
            <tr className="border-t border-slate-800 bg-slate-100 font-bold">
              <td colSpan={3} className="p-2 text-right">{t.totalCalculationLabel}</td>
              <td className="p-2 text-right font-mono">{filteredEntries.reduce((s, x) => s + x.productWeight, 0).toFixed(1)} kg</td>
              <td className="p-2"></td>
              <td className="p-2 text-right font-mono">৳ {totalBill.toLocaleString("en-IN")}</td>
              <td className="p-2 text-right font-mono">৳ {totalReceived.toLocaleString("en-IN")}</td>
            </tr>
            {/* Outstanding Remaining Dues row */}
            <tr className="border-t border-slate-800 bg-rose-50 font-bold text-rose-950">
              <td colSpan={5} className="p-2 text-right">{t.remainingDueLabel}</td>
              <td colSpan={2} className="p-2 text-right font-mono text-rose-700">৳ {remainingBalance.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>

        {/* Terms and signature with preview photo */}
        <div className="pt-16 flex justify-between items-end text-[11px]">
          <div>
            <p className="font-bold underline">{language === "bn" ? "বিশেষ শর্তাবলীঃ" : "Terms & conditions:"}</p>
            <p className="text-slate-600 mt-1">
              {language === "bn" 
                ? "১. এই বিলটি তাসনিম ও জান্নাত নিটিং ফ্যাক্টরির ডিজিটাল সার্ভার দ্বারা তৈরিকৃত।"
                : "1. This invoice invoice is computer generated by the factory server."}
            </p>
            <p className="text-slate-600">
              {language === "bn"
                ? "২. কোনো গড়মিল বা সমস্যা পরিলক্ষিত হলে তিন কার্যদিবসের মধ্যে ম্যানেজারকে অবহিত করুন।"
                : "2. Report any calculation discrepancies within 3 business days."}
            </p>
          </div>
          
          <div className="text-center w-[150px] flex flex-col items-center justify-center">
            {managerPhoto && (
              <div className="mb-2 relative">
                <img
                  referrerPolicy="no-referrer"
                  src={managerPhoto}
                  alt="Official Sign Stamp"
                  className="h-10 w-10 rounded-full object-cover border border-slate-350 transform rotate-6 opacity-85"
                />
                <span className="text-[7px] text-indigo-700 font-bold uppercase absolute -bottom-1 -right-2 bg-yellow-50 scale-90 border rounded-sm px-1 leading-none shadow-xs pointer-events-none">
                  {language === "bn" ? "ভেরিফাইড" : "Verified"}
                </span>
              </div>
            )}
            <div className="border-t border-slate-800 pt-1 font-bold text-[10px]">
              {language === "bn" ? "ম্যানেজারের স্বাক্ষর" : "Authorized signature"}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
