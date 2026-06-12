import React, { useState, useEffect } from "react";
import { User, Client, LedgerEntry, GoogleSheetsConfig } from "./types";
import LoginScreen from "./components/LoginScreen";
import ClientSidebar from "./components/ClientSidebar";
import LedgerTable from "./components/LedgerTable";
import SheetsModal from "./components/SheetsModal";
import SupabaseModal from "./components/SupabaseModal";
import SettingsModal from "./components/SettingsModal";
import { Factory, LogOut, CloudCheck, Link, RefreshCcw, HelpCircle, Database, Settings } from "lucide-react";
import { translations } from "./translations";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig | null>(null);
  const [showSheetsConfig, setShowSheetsConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncDelay, setSyncDelay] = useState(false);

  const [supabaseStatus, setSupabaseStatus] = useState<{ url: string; status: 'connected' | 'missing_tables' | 'error' | 'loading'; error?: string | null }>({ url: "", status: 'loading' });
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Internationalization & Theme States
  const [language, setLanguage] = useState<"bn" | "en" | any>(() => {
    return (localStorage.getItem("factory_language") as "bn" | "en") || "bn";
  });
  
  const [theme, setTheme] = useState<"light" | "dark" | "night">(() => {
    return (localStorage.getItem("factory_theme") as "light" | "dark" | "night") || "light";
  });

  const [managerPhoto, setManagerPhoto] = useState<string | null>(() => {
    const cachedUser = localStorage.getItem("factory_logged_user");
    if (cachedUser) {
      try {
        const u = JSON.parse(cachedUser);
        if (u.photoUrl) return u.photoUrl;
      } catch (e) {}
    }
    return localStorage.getItem("factory_manager_photo") || null;
  });

  const t = translations[language as "bn" | "en"] || translations.bn;

  // Read logged-in user from localStorage on initial load
  useEffect(() => {
    const cachedUser = localStorage.getItem("factory_logged_user");
    if (cachedUser) {
      try {
        const u = JSON.parse(cachedUser) as User;
        setCurrentUser(u);
        if (u.photoUrl) {
          setManagerPhoto(u.photoUrl);
          localStorage.setItem("factory_manager_photo", u.photoUrl);
        }
      } catch (err) {
        console.error("Failed to parse cached session user", err);
      }
    }
  }, []);

  // Fetch all clients and ledger entries upon successful authentication
  useEffect(() => {
    if (!currentUser) return;

    async function fetchAppData() {
      setLoading(true);
      try {
        // Fetch clients
        const clientsRes = await fetch("/api/clients", {
          headers: { "x-user-id": currentUser.userId }
        });
        const clientsJson = await clientsRes.json();
        if (clientsJson.success) {
          setClients(clientsJson.data);
          if (clientsJson.data.length > 0 && !selectedClientId) {
            setSelectedClientId(clientsJson.data[0].clientId);
          }
        }

        // Fetch ledger
        const ledgerRes = await fetch("/api/ledger", {
          headers: { "x-user-id": currentUser.userId }
        });
        const ledgerJson = await ledgerRes.json();
        if (ledgerJson.success) {
          setEntries(ledgerJson.data);
        }

        // Fetch sheets config
        const sheetsRes = await fetch("/api/config/sheets");
        const sheetsJson = await sheetsRes.json();
        if (sheetsJson.success) {
          setSheetsConfig(sheetsJson.data);
        }

        // Fetch Supabase status
        try {
          const supabaseRes = await fetch("/api/config/supabase");
          const supabaseJson = await supabaseRes.json();
          if (supabaseJson.success) {
            setSupabaseStatus({
              url: supabaseJson.url,
              status: supabaseJson.status,
              error: supabaseJson.error
            });
          }
        } catch (err: any) {
          setSupabaseStatus({ url: "", status: "error", error: err.message });
        }
      } catch (err) {
        console.error("Error loading application core datasets", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAppData();
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("factory_logged_user", JSON.stringify(user));
    if (user.photoUrl) {
      setManagerPhoto(user.photoUrl);
      localStorage.setItem("factory_manager_photo", user.photoUrl);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("factory_logged_user");
    setClients([]);
    setEntries([]);
    setSelectedClientId("");
    setShowLogoutConfirm(false);
  };

  const handleClientAdded = (newClient: Client) => {
    setClients((prev) => [...prev, newClient]);
    setSelectedClientId(newClient.clientId);
  };

  const handleClientDeleted = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.clientId !== clientId));
    setEntries((prev) => prev.filter((e) => e.clientId !== clientId));
    if (selectedClientId === clientId) {
      setSelectedClientId("");
    }
  };

  const handleEntryAdded = (newEntry: LedgerEntry) => {
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleEntryDeleted = (entryId: string) => {
    setEntries((prev) => prev.filter((e) => e.entryId !== entryId));
  };

  const handleReloadData = async () => {
    if (!currentUser) return;
    setSyncDelay(true);
    try {
      const clientsRes = await fetch("/api/clients", {
        headers: { "x-user-id": currentUser.userId }
      });
      const clientData = await clientsRes.json();
      if (clientData.success) setClients(clientData.data);

      const ledgerRes = await fetch("/api/ledger", {
        headers: { "x-user-id": currentUser.userId }
      });
      const ledgerData = await ledgerRes.json();
      if (ledgerData.success) setEntries(ledgerData.data);

      try {
        const supabaseRes = await fetch("/api/config/supabase");
        const supabaseJson = await supabaseRes.json();
        if (supabaseJson.success) {
          setSupabaseStatus({
            url: supabaseJson.url,
            status: supabaseJson.status,
            error: supabaseJson.error
          });
        }
      } catch (err) {}
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setSyncDelay(false), 800);
    }
  };

  const handleSaveSettings = (settings: {
    name: string;
    photo: string | null;
    language: "bn" | "en";
    theme: "light" | "dark" | "night";
  }) => {
    setLanguage(settings.language);
    setTheme(settings.theme);
    setManagerPhoto(settings.photo);

    localStorage.setItem("factory_language", settings.language);
    localStorage.setItem("factory_theme", settings.theme);
    if (settings.photo) {
      localStorage.setItem("factory_manager_photo", settings.photo);
    } else {
      localStorage.removeItem("factory_manager_photo");
    }

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: settings.name,
        photoUrl: settings.photo || undefined,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("factory_logged_user", JSON.stringify(updatedUser));
    }
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const activeClient = clients.find((c) => c.clientId === selectedClientId) || null;

  // Theme Wrapper CSS selector helpers
  const appRootClass =
    theme === "dark"
      ? "min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased transition-all duration-300"
      : theme === "night"
      ? "min-h-screen bg-black text-[#FFF9E6] flex flex-col font-sans antialiased transition-all duration-300"
      : "min-h-screen bg-[#FAF9F5] classic-grid-bg flex flex-col font-sans antialiased text-slate-800 transition-all duration-300";

  const headerClass =
    theme === "dark"
      ? "bg-slate-850 border-b-2 border-teal-600 shadow-[0_2px_15px_rgba(0,0,0,0.4)] py-4 px-6 sticky top-0 z-40 no-print text-slate-100 transition-all"
      : theme === "night"
      ? "bg-zinc-900 border-b-2 border-amber-600 shadow-[0_2px_15px_rgba(0,0,0,0.7)] py-4 px-6 sticky top-0 z-40 no-print text-zinc-150 transition-all"
      : "bg-white border-b-2 border-[#045A3E] shadow-[0_2px_15px_rgba(4,90,62,0.05)] py-4 px-6 sticky top-0 z-40 no-print text-slate-800 transition-all";

  const brandTitleColor =
    theme === "dark"
      ? "text-teal-400"
      : theme === "night"
      ? "text-amber-400"
      : "text-slate-850";

  const brandTagText =
    theme === "dark"
      ? "text-teal-400 bg-slate-900 border border-teal-950/40"
      : theme === "night"
      ? "text-amber-400 bg-black border border-amber-950"
      : "text-emerald-700 bg-emerald-50 border border-emerald-100";

  const brandSubtextClass =
    theme === "dark" || theme === "night" ? "text-slate-500" : "text-slate-400";

  const badgeContainerClass =
    theme === "dark"
      ? "flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl shrink-0"
      : theme === "night"
      ? "flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl shrink-0"
      : "flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl shrink-0";

  const footerClass =
    theme === "dark"
      ? "py-8 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-550 font-bold tracking-wider leading-relaxed mt-12 no-print"
      : theme === "night"
      ? "py-8 bg-black border-t border-zinc-900 text-center text-[10px] text-zinc-650 font-bold tracking-wider leading-relaxed mt-12 no-print"
      : "py-8 bg-white border-t border-slate-100 text-center text-[10px] text-slate-400 font-bold tracking-wider leading-relaxed mt-12 no-print";

  return (
    <div className={appRootClass}>
      
      {/* Top Banner Navigation with Custom Theme Trim */}
      <header className={headerClass}>
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-[#045A3E] to-amber-500"></div>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 ${
              theme === "dark" ? "bg-teal-600 shadow-teal-900/10" : theme === "night" ? "bg-amber-600 shadow-amber-900/20" : "bg-emerald-600 shadow-emerald-100"
            }`}>
              <Factory size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h1 className={`text-lg font-extrabold tracking-tight flex items-center gap-1.5 leading-none ${brandTitleColor}`}>
                {t.appTitle} <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${brandTagText}`}>{language === "bn" ? "ফ্যাক্টরি খাতা" : "Factory Register"}</span>
              </h1>
              <p className={`text-[11px] font-bold mt-1 uppercase ${brandSubtextClass}`}>{t.appSubtitle}</p>
            </div>
          </div>

          {/* Quick sync & Manager profile settings toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            
            {/* Reload and data refetching trigger */}
            <button
              onClick={handleReloadData}
              disabled={syncDelay}
              className={`p-2 rounded-xl border transition-all cursor-pointer hover:shadow-xs disabled:opacity-50 shrink-0 ${
                theme === "dark" || theme === "night"
                  ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              }`}
              title={t.refreshTooltip}
            >
              <RefreshCcw size={15} className={syncDelay ? "animate-spin text-emerald-500" : ""} />
            </button>

            {/* Dedicated App Wide Settings Gear Option */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`p-2 rounded-xl border transition-all cursor-pointer group shrink-0 ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-teal-400 hover:bg-slate-800"
                  : theme === "night"
                  ? "bg-[#201010] border-zinc-855 text-amber-400 hover:bg-zinc-850"
                  : "bg-amber-50 border-amber-800/10 text-[#045A3E] hover:bg-amber-100/50"
              }`}
              title={language === "bn" ? "সেটিংস অপশন পোর্টাল" : "Application Settings Portal"}
            >
              <Settings size={15} className="group-hover:rotate-45 transition-all duration-300" />
            </button>

            {/* Custom User Info block with Avatar Display */}
            <div className={badgeContainerClass}>
              {managerPhoto ? (
                <img
                  referrerPolicy="no-referrer"
                  src={managerPhoto}
                  alt={currentUser.name}
                  className="h-6 w-6 rounded-full object-cover border border-slate-350"
                />
              ) : (
                <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-extrabold text-[#045A3E] dark:text-teal-400 uppercase">
                  {currentUser.name[0]}
                </div>
              )}
              <span className={`text-xs font-bold ${theme === "dark" || theme === "night" ? "text-slate-200" : "text-slate-700"}`}>
                {currentUser.name}
              </span>
            </div>

            {/* Sign out session trigger */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-rose-500 hover:text-white bg-rose-50/10 hover:bg-rose-600 border border-rose-900/10 hover:border-transparent rounded-xl transition-all cursor-pointer hover:shadow-md hover:shadow-rose-100 shrink-0"
              title={t.logoutTooltip}
            >
              <LogOut size={15} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Dual-Column Client & Bills Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Client Roll Book */}
        <div className="lg:col-span-4 h-[calc(100vh-140px)] min-h-[550px] lg:sticky lg:top-24 no-print select-none">
          <ClientSidebar
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            onClientAdded={handleClientAdded}
            onClientDeleted={handleClientDeleted}
            language={language}
            theme={theme}
            currentUser={currentUser}
          />
        </div>

        {/* Right Side Transaction Entry table and Print Receipts */}
        <div className="lg:col-span-8 print-container">
          <LedgerTable
            activeClient={activeClient}
            entries={entries}
            currentUser={currentUser}
            onEntryAdded={handleEntryAdded}
            onEntryDeleted={handleEntryDeleted}
            language={language}
            theme={theme}
            managerPhoto={managerPhoto}
          />
        </div>
      </main>

      {/* Settings Dialog Overlay Popup */}
      {showSettingsModal && (
        <SettingsModal
          currentUser={currentUser}
          currentLanguage={language}
          currentTheme={theme}
          managerPhoto={managerPhoto}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSaveSettings}
        />
      )}

      {/* Google Sheets configurations wizard popup */}
      {showSheetsConfig && (
        <SheetsModal
          onClose={() => setShowSheetsConfig(false)}
          onConfigSaved={(config) => {
            setSheetsConfig(config);
            handleReloadData();
          }}
        />
      )}

      {/* Supabase connections setups query diagnostic indicators panel */}
      {showSupabaseModal && (
        <SupabaseModal
          onClose={() => setShowSupabaseModal(false)}
          status={supabaseStatus.status}
          url={supabaseStatus.url}
          error={supabaseStatus.error}
        />
      )}

      {/* Sign Out Confirmation verification overlays modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-amber-800/15 relative overflow-hidden animate-fade-in text-slate-700">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#045A3E] to-amber-500"></div>
            
            <div className="text-center mt-2 font-sans">
              <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 animate-pulse">
                <LogOut size={24} />
              </div>
              <h3 className="text-base font-extrabold text-[#0D382A] mb-2">{t.logoutTitle}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">
                {t.logoutDesc}
              </p>
            </div>

            <div className="flex gap-3 mt-6 font-sans">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-4 border border-slate-200 text-xs font-bold text-slate-555 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                {t.goBack}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white rounded-xl shadow-md shadow-rose-100 hover:shadow-lg transition-all cursor-pointer"
              >
                {t.confirmLogout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimalistic Footer signatures */}
      <footer className={footerClass}>
        © 2026 Tasnim & Jannat Knit • Made by Salahuddin • Contact-01617699267
      </footer>

    </div>
  );
}
