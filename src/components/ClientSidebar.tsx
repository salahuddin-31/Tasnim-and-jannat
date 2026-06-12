import React, { useState } from "react";
import { UserPlus, Search, Users, Phone, Trash2, CheckCircle, FileText, AlertTriangle } from "lucide-react";
import { Client, User } from "../types";
import { translations } from "../translations";

interface ClientSidebarProps {
  clients: Client[];
  selectedClientId: string;
  onSelectClient: (clientId: string) => void;
  onClientAdded: (client: Client) => void;
  onClientDeleted: (clientId: string) => void;
  language?: "bn" | "en";
  theme?: "light" | "dark" | "night";
  currentUser?: User | null;
}

export default function ClientSidebar({
  clients,
  selectedClientId,
  onSelectClient,
  onClientAdded,
  onClientDeleted,
  language = "bn",
  theme = "light",
  currentUser,
}: ClientSidebarProps) {
  const t = translations[language];

  const [newClientName, setNewClientName] = useState("");
  const [newClientContact, setNewClientContact] = useState("");
  const [newClientNotes, setNewClientNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientToConfirmDelete, setClientToConfirmDelete] = useState<Client | null>(null);

  // Filter clients based on search query
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.contact && client.contact.includes(searchQuery))
  );

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newClientName.trim()) {
      setError(language === "bn" ? "ক্লায়েন্টের নাম আবশ্যক!" : "Client name is required!");
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (currentUser?.userId) {
        headers["x-user-id"] = currentUser.userId;
      }
      const res = await fetch("/api/clients", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: newClientName,
          contact: newClientContact,
          notes: newClientNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || (language === "bn" ? "কোনো সমস্যা হয়েছে!" : "Something went wrong!"));
      }

      onClientAdded(json.data);
      setNewClientName("");
      setNewClientContact("");
      setNewClientNotes("");
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || (language === "bn" ? "সংযোজন ব্যর্থ হয়েছে!" : "Failed to add client!"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = (client: Client) => {
    setClientToConfirmDelete(client);
  };

  const confirmAndPerformDelete = async () => {
    if (!clientToConfirmDelete) return;
    const client = clientToConfirmDelete;
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (currentUser?.userId) {
        headers["x-user-id"] = currentUser.userId;
      }
      const res = await fetch(`/api/clients/${client.clientId}`, {
        method: "DELETE",
        headers,
      });
      const json = await res.json();
      if (json.success) {
        onClientDeleted(client.clientId);
        setClientToConfirmDelete(null);
      } else {
        alert(json.message);
      }
    } catch (err: any) {
      alert((language === "bn" ? "অপসারণ ব্যর্থ হয়েছে: " : "Deletion failed: ") + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Theme styling helpers
  const containerClass = 
    theme === "dark"
      ? "bg-slate-800 border-slate-700 flex flex-col h-full shadow-lg overflow-hidden shrink-0 relative"
      : theme === "night"
      ? "bg-zinc-950 border-zinc-850 flex flex-col h-full shadow-lg overflow-hidden shrink-0 relative"
      : "bg-white rounded-2xl border-2 border-amber-800/15 flex flex-col h-full shadow-lg overflow-hidden shrink-0 relative";

  const headerClass =
    theme === "dark"
      ? "p-5 border-b border-slate-700 bg-slate-900 pt-6"
      : theme === "night"
      ? "p-5 border-b border-zinc-850 bg-zinc-900 pt-6"
      : "p-5 border-b border-amber-800/10 bg-[#FAF9F5] pt-6";

  const titleClass =
    theme === "dark"
      ? "font-bold text-teal-400 text-sm leading-none"
      : theme === "night"
      ? "font-bold text-amber-400 text-sm leading-none"
      : "font-bold text-[#0D382A] text-sm leading-none font-serif";

  const subtitleClass =
    theme === "dark"
      ? "text-[11px] text-teal-500 font-bold mt-1"
      : theme === "night"
      ? "text-[11px] text-amber-500 font-bold mt-1"
      : "text-[11px] text-amber-800/80 font-bold mt-1";

  const formBgClass =
    theme === "dark"
      ? "p-4 border-b border-slate-700 bg-slate-900 space-y-3 animate-fade-in relative"
      : theme === "night"
      ? "p-4 border-b border-zinc-850 bg-zinc-900 space-y-3 animate-fade-in relative"
      : "p-4 border-b border-amber-800/10 bg-[#FAF9F5] space-y-3 animate-fade-in relative";

  const inputClass =
    theme === "dark"
      ? "w-full px-3 py-1.5 border border-slate-700 rounded-lg text-xs bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 font-bold"
      : theme === "night"
      ? "w-full px-3 py-1.5 border border-zinc-800 rounded-lg text-xs bg-black text-[#FFF9E6] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 font-bold"
      : "w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-[#045A3E]/10 focus:border-[#045A3E] transition-all";

  const searchBgClass =
    theme === "dark"
      ? "p-3.5 border-b border-slate-700 bg-slate-850"
      : theme === "night"
      ? "p-3.5 border-b border-zinc-900 bg-zinc-950"
      : "p-3.5 border-b border-slate-100 bg-white";

  const searchInputClass =
    theme === "dark"
      ? "w-full pl-8 pr-3 py-2 border border-slate-700 bg-slate-900 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-450 focus:bg-slate-900 font-bold"
      : theme === "night"
      ? "w-full pl-8 pr-3 py-2 border border-zinc-800 bg-black rounded-xl text-xs text-[#FFF9E6] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-450 focus:bg-black font-bold"
      : "w-full pl-8 pr-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-xs text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#045A3E]/10 focus:border-[#045A3E] focus:bg-white transition-all font-extrabold";

  const listContainerClass =
    theme === "dark"
      ? "flex-1 overflow-y-auto divide-y divide-slate-700 bg-slate-800"
      : theme === "night"
      ? "flex-1 overflow-y-auto divide-y divide-zinc-900 bg-zinc-950"
      : "flex-1 overflow-y-auto divide-y divide-slate-100 bg-white";

  return (
    <div className={containerClass}>
      {/* Top trim decorative bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#045A3E] to-amber-500"></div>
      
      {/* Title Header with Classic Ornaments */}
      <div className={headerClass}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm ${
              theme === "dark" ? "bg-teal-600 shadow-teal-900/30" : theme === "night" ? "bg-amber-600 shadow-amber-900/40" : "bg-[#045A3E] shadow-[#045A3E]/30"
            }`}>
              <Users size={18} />
            </div>
            <div>
              <h3 className={titleClass}>{t.clientRegister}</h3>
              <p className={subtitleClass}>{t.totalLedger}: {clients.length} টি</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg text-white hover:shadow-md transition-all flex items-center gap-1 cursor-pointer border ${
              theme === "dark"
                ? "bg-teal-600 hover:bg-teal-700 border-teal-600"
                : theme === "night"
                ? "bg-amber-600 hover:bg-amber-700 border-amber-600"
                : "bg-[#045A3E] hover:bg-[#023E2A] border-[#045A3E]"
            }`}
          >
            <UserPlus size={13} /> {showAddForm ? t.close : t.newLedger}
          </button>
        </div>
      </div>

      {/* Slide-Down Client Addition Form */}
      {showAddForm && (
        <form onSubmit={handleAddClientSubmit} className={formBgClass}>
          <div className="absolute top-0 left-0 h-full w-1 bg-amber-500"></div>
          <h4 className={`text-xs font-extrabold uppercase tracking-wider mb-3 ${theme === "dark" ? "text-teal-400" : theme === "night" ? "text-amber-400" : "text-[#0D382A]"}`}>
            ✨ {t.openNewClientHeader}
          </h4>
          
          <div className="space-y-2">
            <div>
              <label className={`block text-[10px] font-extrabold mb-1 ${
                theme === "dark" ? "text-teal-400" : theme === "night" ? "text-amber-400" : "text-[#045A3E]"
              }`}>{language === "bn" ? "ক্লায়েন্টের নাম (Client Name)*" : "Client Name*"}</label>
              <input
                type="text"
                required
                placeholder={t.clientNamePlaceholder}
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-extrabold mb-1 ${
                theme === "dark" ? "text-teal-400" : theme === "night" ? "text-amber-400" : "text-[#045A3E]"
              }`}>{language === "bn" ? "মোবাইল/যোগাযোগ (Contact)" : "Contact"}</label>
              <input
                type="text"
                placeholder={t.contactPlaceholder}
                value={newClientContact}
                onChange={(e) => setNewClientContact(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-extrabold mb-1 ${
                theme === "dark" ? "text-teal-400" : theme === "night" ? "text-amber-400" : "text-[#045A3E]"
              }`}>{language === "bn" ? "ঠিকানা/নোটস (Location/Notes)" : "Location/Notes"}</label>
              <input
                type="text"
                placeholder={t.notesPlaceholder}
                value={newClientNotes}
                onChange={(e) => setNewClientNotes(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="text-[11px] text-rose-500 font-bold">⚠️ {error}</p>}

          <div className="flex justify-end gap-2 pt-1 font-sans">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className={`px-2.5 py-1.25 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                theme === "dark" || theme === "night"
                  ? "border-slate-700 text-slate-350 hover:bg-slate-800"
                  : "border-slate-200 hover:bg-slate-50 text-slate-550"
              }`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-3 py-1.25 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                theme === "dark"
                  ? "bg-teal-600 hover:bg-teal-700"
                  : theme === "night"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-[#045A3E] hover:bg-[#023E2A]"
              }`}
            >
              {t.save}
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className={searchBgClass}>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder={t.searchClients}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={searchInputClass}
          />
        </div>
      </div>

      {/* Clients list item Scrolled container with classic bookmarking */}
      <div className={listContainerClass}>
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => {
            const isSelected = client.clientId === selectedClientId;
            
            const activeHoverBg =
              theme === "dark"
                ? isSelected
                  ? "bg-teal-950/30 text-teal-300"
                  : "hover:bg-slate-750/50 text-slate-305"
                : theme === "night"
                ? isSelected
                  ? "bg-amber-950/20 text-amber-300"
                  : "hover:bg-zinc-900/60 text-zinc-300"
                : isSelected
                ? "bg-amber-50/25 border-l-4 border-amber-600 hover:bg-amber-50/40"
                : "hover:bg-slate-50/80";

            return (
              <div
                key={client.clientId}
                className={`flex items-center justify-between p-3.5 transition-all relative group cursor-pointer ${activeHoverBg}`}
                onClick={() => onSelectClient(client.clientId)}
              >
                {/* Visual traditional bookmark ribbon on active client item */}
                {isSelected && (
                  <div className={`absolute right-0 top-0 bottom-0 w-1 ${theme === "dark" ? "bg-teal-555" : theme === "night" ? "bg-amber-555" : "bg-[#045A3E]"}`}></div>
                )}
                
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className={`mt-0.5 rounded-lg p-1.5 transition-all ${
                    isSelected
                      ? theme === "dark"
                        ? "bg-teal-900/40 text-teal-300"
                        : theme === "night"
                        ? "bg-amber-950/40 text-amber-300"
                        : "bg-amber-100 text-[#045A3E]"
                      : theme === "dark" || theme === "night"
                      ? "bg-slate-900 text-slate-400"
                      : "bg-slate-50 text-slate-500"
                  }`}>
                    {isSelected ? <CheckCircle size={15} /> : <FileText size={15} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-bold text-sm truncate leading-snug ${
                      isSelected
                        ? theme === "dark"
                          ? "text-teal-300"
                          : theme === "night"
                          ? "text-amber-300"
                          : "text-[#0D382A]"
                        : theme === "dark" || theme === "night"
                        ? "text-slate-300"
                        : "text-slate-700"
                    }`}>{client.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {client.contact && (
                        <span className={`text-[10px] font-bold flex items-center gap-0.5 font-sans ${theme === "dark" || theme === "night" ? "text-slate-400" : "text-slate-500"}`}>
                          <Phone size={10} /> {client.contact}
                        </span>
                      )}
                      {client.notes && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold truncate max-w-[120px] border ${
                          theme === "dark"
                            ? "bg-slate-900 border-teal-900/30 text-teal-400/80"
                            : theme === "night"
                            ? "bg-black border-amber-950 text-amber-500/85"
                            : "bg-[#FAF9F5] border-amber-800/10 text-amber-900/80"
                        }`}>
                          {client.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                 {/* Always Active Delete Action Button with Touch/Click Friendliness */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // crucial to prevent selection trigger
                    handleDeleteClient(client);
                  }}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ml-2 shrink-0 shadow-xs border ${
                    theme === "dark" || theme === "night"
                      ? "text-slate-450 hover:text-rose-450 hover:bg-slate-900 border-slate-750"
                      : "text-slate-440 hover:text-rose-600 hover:bg-rose-55 border-slate-100"
                  }`}
                  title={language === "bn" ? "মুছে ফেলুন" : "Delete Account"}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400 font-bold text-xs bg-transparent">
            {t.noClients}
          </div>
        )}
      </div>

      {/* State-Based Client Deletion Confirmation Modal */}
      {clientToConfirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in no-print">
          <div className="bg-white dark:bg-slate-950 rounded-2xl border-2 border-rose-100 w-full max-w-md shadow-2xl p-6 relative overflow-hidden select-none animate-scale-up">
            {/* Top decorative hazard stripes line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-[#A42F1B] to-rose-500"></div>

            <div className="flex items-start gap-4 mt-2">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1e293b] text-base leading-none">
                  {t.deleteClientConfirmHeading}
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
                  {t.deleteClientConfirmSubtitle}
                </p>

                <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="text-[11px] text-slate-400 font-bold">{t.clientNameLabel}:</p>
                  <p className="text-sm font-extrabold text-[#0D382A]">
                    {clientToConfirmDelete.name}
                  </p>
                  
                  {clientToConfirmDelete.contact && (
                    <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1 font-sans">
                      <Phone size={11} /> {clientToConfirmDelete.contact}
                    </p>
                  )}
                </div>

                <p className="text-xs text-[#A63A2B] font-bold leading-relaxed mt-4 bg-rose-50/55 p-3 rounded-xl border border-rose-100">
                  {t.deleteWarningBody}
                </p>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 font-sans">
              <button
                type="button"
                onClick={() => setClientToConfirmDelete(null)}
                className="px-3.5 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-660 transition-all cursor-pointer"
              >
                {t.dontDelete}
              </button>
              <button
                type="button"
                onClick={confirmAndPerformDelete}
                disabled={loading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {loading ? t.deleting : t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
