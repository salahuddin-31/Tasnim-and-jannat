import React, { useState, useRef, DragEvent } from "react";
import { X, User, Camera, Globe, Moon, Sun, Sparkles, Upload, Image as ImageIcon, Trash2, CheckCircle } from "lucide-react";
import { User as UserType } from "../types";
import { LanguageCode, translations } from "../translations";

interface SettingsModalProps {
  currentUser: UserType;
  currentLanguage: LanguageCode;
  currentTheme: "light" | "dark" | "night";
  managerPhoto: string | null;
  onClose: () => void;
  onSave: (settings: {
    name: string;
    photo: string | null;
    language: LanguageCode;
    theme: "light" | "dark" | "night";
  }) => void;
}

export default function SettingsModal({
  currentUser,
  currentLanguage,
  currentTheme,
  managerPhoto,
  onClose,
  onSave,
}: SettingsModalProps) {
  const t = translations[currentLanguage];

  const [managerName, setManagerName] = useState(currentUser.name);
  const [photoBase64, setPhotoBase64] = useState<string | null>(managerPhoto);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(currentLanguage);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "night">(currentTheme);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File processing with high performance canvas compression to avoid payload too large errors
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(currentLanguage === "bn" ? "অনুগ্রহ করে শুধুমাত্র ইমেজ টাইপ ফাইল আপলোড করুন!" : "Please upload image files only!");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert(currentLanguage === "bn" ? "ফাইলের সাইজ ২৫ এমবির নিচে হতে হবে!" : "File size must be less than 25 MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const originalBase64 = reader.result;
        
        // Load target image for synchronous resize
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 120; // 120x120 is perfect and super small
          const MAX_HEIGHT = 120;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            try {
              // High compression quality yielding tiny ~8KB base64 100% safe for transfers
              const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
              setPhotoBase64(compressedDataUrl);
            } catch (err) {
              setPhotoBase64(originalBase64);
            }
          } else {
            setPhotoBase64(originalBase64);
          }
        };
        img.onerror = () => {
          setPhotoBase64(originalBase64);
        };
        img.src = originalBase64;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setPhotoBase64(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToastMessage("");

    try {
      // Post profile update to server API
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.userId,
          name: managerName,
          photoUrl: photoBase64
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSave({
          name: managerName,
          photo: photoBase64,
          language: selectedLanguage,
          theme: selectedTheme,
        });

        setToastMessage(t.profileUpdatedSuccess);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        alert(json.message || t.profileSaveError);
      }
    } catch (err: any) {
      console.error(err);
      alert(t.profileSaveError + " -> " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in no-print select-none">
      <div className="bg-white dark:bg-slate-950 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-scale-up my-8">
        
        {/* Top gold/emerald premium styling trim banner */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#045A3E] to-amber-500"></div>

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between pt-7">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm leading-none font-serif">{t.settingsTitle}</h3>
              <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wider">{t.settingsSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer border border-transparent"
            title="বন্ধ করুন"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toast / Success Banner */}
        {toastMessage && (
          <div className="bg-emerald-50 border-y border-emerald-100 px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-emerald-800 animate-slide-down">
            <CheckCircle size={15} />
            {toastMessage}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Manager name setup card */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#0D382A] uppercase tracking-wide flex items-center gap-1.5">
              <User size={13} className="text-emerald-700" />
              {t.editManagerName}
            </label>
            <input
              type="text"
              required
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              placeholder={t.editManagerNamePlaceholder}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-black font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-[#045A3E] transition-all"
            />
          </div>

          {/* Photo Dropzone Block */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#0D382A] uppercase tracking-wide flex items-center gap-1.5">
              <Camera size={13} className="text-[#045A3E]" />
              {t.addManagerPhoto}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              
              {/* Photo Preview Column */}
              <div className="sm:col-span-3 flex flex-col items-center justify-center">
                {photoBase64 ? (
                  <div className="relative group ring-4 ring-emerald-50/80 rounded-full">
                    <img
                      referrerPolicy="no-referrer"
                      src={photoBase64}
                      alt="Manager Avatar"
                      className="h-16 w-16 rounded-full object-cover border border-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-rose-550 text-white rounded-full hover:bg-rose-700 transition-all shadow-md cursor-pointer border border-white"
                      title="ফটো মুছে ফেলুন"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-350">
                    <ImageIcon size={24} />
                  </div>
                )}
                <span className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-wider">
                  {photoBase64 ? "Manager Logo" : "No Profile Pic"}
                </span>
              </div>

              {/* Upload Drag & Drop Modality Column */}
              <div className="sm:col-span-9">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                    isDragOver
                      ? "border-emerald-500 bg-emerald-50/50 scale-[0.98]"
                      : "border-slate-250 bg-slate-50/30 hover:bg-slate-50/80 hover:border-[#045A3E]/40"
                  }`}
                >
                  <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-550 mb-1.5 group-hover:scale-110 transition-transform">
                    <Upload size={14} />
                  </div>
                  <p className="text-xs font-bold text-slate-750">
                    {t.photoDropHelp}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {t.photoClickHelp}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Bilingual Language Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold text-[#0D382A] uppercase tracking-wide flex items-center gap-1.5">
              <Globe size={13} className="text-emerald-700" />
              {t.languageSelect}
            </label>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setSelectedLanguage("bn")}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  selectedLanguage === "bn"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/10 font-extrabold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <span>বাংলা (Bangla)</span>
                {selectedLanguage === "bn" && <CheckCircle size={13} className="text-emerald-700" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedLanguage("en")}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  selectedLanguage === "en"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/10 font-extrabold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <span>English (ইংরেজি)</span>
                {selectedLanguage === "en" && <CheckCircle size={13} className="text-emerald-700" />}
              </button>
            </div>
          </div>

          {/* Visual display style mode option selector (Theme setup) */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold text-[#0D382A] uppercase tracking-wide flex items-center gap-1.5">
              <Moon size={13} className="text-emerald-700" />
              {t.themeSelect}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTheme("light")}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  selectedTheme === "light"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/10 font-extrabold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Sun size={15} className="text-amber-500" />
                <span>{t.themeLight}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTheme("dark")}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  selectedTheme === "dark"
                    ? "border-emerald-600 bg-slate-800 text-teal-400 ring-2 ring-emerald-500/10 font-extrabold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Moon size={15} className="text-indigo-400" />
                <span>{t.themeDark}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTheme("night")}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  selectedTheme === "night"
                    ? "border-amber-600 bg-black text-[#FFF9E6] ring-2 ring-amber-500/15 font-extrabold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                <Moon size={15} className="text-amber-400 animate-pulse" />
                <span>{t.themeNight}</span>
              </button>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-slate-200 text-xs font-bold text-slate-650 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-[#045A3E] hover:bg-[#023E2A] text-xs font-extrabold text-white rounded-xl shadow-md shadow-emerald-50 hover:shadow-lg transition-all cursor-pointer"
            >
              {loading ? t.savingRecord : t.save}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
