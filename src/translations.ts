export interface AppTranslation {
  appTitle: string;
  appSubtitle: string;
  refreshTooltip: string;
  logoutTooltip: string;
  clientRegister: string;
  totalLedger: string;
  close: string;
  newLedger: string;
  openNewClientHeader: string;
  clientNamePlaceholder: string;
  contactPlaceholder: string;
  notesPlaceholder: string;
  cancel: string;
  save: string;
  searchClients: string;
  noClients: string;
  deleteClientConfirmHeading: string;
  deleteClientConfirmSubtitle: string;
  clientNameLabel: string;
  deleteWarningBody: string;
  dontDelete: string;
  confirmDelete: string;
  deleting: string;
  logoutTitle: string;
  logoutDesc: string;
  goBack: string;
  confirmLogout: string;
  
  // Ledger translations
  ledgerTitle: string;
  activeManagerLabel: string;
  dateCol: string;
  descriptionCol: string;
  plyPageCol: string;
  weightCol: string;
  rateCol: string;
  totalCol: string;
  receivedCol: string;
  actionCol: string;
  totalCalculationLabel: string;
  totalReceivedLabel: string;
  remainingDueLabel: string;
  noClientSelected: string;
  selectClientPrompt: string;
  addEntryHeader: string;
  datePlaceholder: string;
  descriptionPlaceholder: string;
  plyPagePlaceholder: string;
  weightPlaceholder: string;
  ratePlaceholder: string;
  receivedPlaceholder: string;
  savingRecord: string;
  addRecordBtn: string;
  deleteRecordTitle: string;
  deleteRecordBody: string;
  printReceiptBtn: string;
  printMemoTitle: string;
  mrsName: string;
  factorySubtitle: string;
  reportDate: string;
  managerLabel: string;
  paymentVerificationSeal: string;
  authorizedSignature: string;
  
  // Settings modal specific translations
  settingsTitle: string;
  settingsSubtitle: string;
  editManagerName: string;
  editManagerNamePlaceholder: string;
  addManagerPhoto: string;
  photoDropHelp: string;
  photoClickHelp: string;
  languageSelect: string;
  themeSelect: string;
  themeLight: string;
  themeDark: string;
  themeNight: string;
  profileUpdatedSuccess: string;
  profileSaveError: string;
}

export type LanguageCode = "bn" | "en";

export const translations: Record<LanguageCode, AppTranslation> = {
  bn: {
    appTitle: "Tasnim & Jannat Knit",
    appSubtitle: "অনলাইন লেজার ও হিসাব রক্ষণ খাতা পোর্টাল",
    refreshTooltip: "রিফ্রেশ ডাটা",
    logoutTooltip: "প্রস্থান করুন (Logout)",
    clientRegister: "ক্লায়েন্ট রেজিস্টার",
    totalLedger: "মোট খাতা",
    close: "বন্ধ",
    newLedger: "নতুন খাতা",
    openNewClientHeader: "নতুন ক্লায়েন্ট খাতা খুলুন",
    clientNamePlaceholder: "ক্লায়েন্টের নাম (উদাঃ মেসার্স রহিম টেক্সটাইল)*",
    contactPlaceholder: "মোবাইল/যোগাযোগ",
    notesPlaceholder: "ঠিকানা/নোটস",
    cancel: "বাতিল",
    save: "সংরক্ষণ",
    searchClients: "খাতা খুঁজুন...",
    noClients: "কোনো খাতা পাওয়া যায়নি।",
    deleteClientConfirmHeading: "ক্লায়ারেন্ট ডিলিট নিশ্চিতকরণ",
    deleteClientConfirmSubtitle: "Client Account Permanent Removal",
    clientNameLabel: "নাম",
    deleteWarningBody: "⚠️ আপনি কি নিশ্চিতভাবে এই ক্লায়েন্ট ডিলিট করতে চান? ডিলিট করলে ওনার সব নিটিং হিসেব, চালান রিপোর্ট এবং লেজার খাতা চিরতরে মুছে যাবে। এই কাজ আর ড্রাফট বা রিকভার করা সম্ভব নয়!",
    dontDelete: "না, বাতিল করুন",
    confirmDelete: "হ্যাঁ, ডিলিট করুন 🗑️",
    deleting: "অপসারণ হচ্ছে...",
    logoutTitle: "লগ আউট কনফার্মেশন",
    logoutDesc: "আপনি কি নিশ্চিতভাবে এই খাতা সেশন থেকে লগ আউট করতে চান? লগ আউট করলে পুনরায় ইমেইল এবং পাসওয়ার্ড দিয়ে লগইন করতে হবে।",
    goBack: "না, ফিরে যাই",
    confirmLogout: "হ্যাঁ, লগ আউট করুন",
    
    ledgerTitle: "লেনদেনের ইতিহাস ও বিবরণী",
    activeManagerLabel: "রেকর্ড এন্ট্রি নিশ্চিতকারী",
    dateCol: "তারিখ",
    descriptionCol: "বিবরণ ও বিবরণী",
    plyPageCol: "পৃষ্ঠা",
    weightCol: "ওজন (kg)",
    rateCol: "দর (৳)",
    totalCol: "মোট বিল (৳)",
    receivedCol: "জমা টাকা (৳)",
    actionCol: "অ্যাকশন",
    totalCalculationLabel: "মোট হিসাব টাকাঃ",
    totalReceivedLabel: "মোট প্রাপ্তি টাকাঃ",
    remainingDueLabel: "অবশিষ্ট পাওনা (Total Remaining Dues) :",
    noClientSelected: "কোনো খাতা সিলেক্ট করা নেই",
    selectClientPrompt: "বাম পাশের খাতা তালিকা থেকে যেকোনো একটি ক্লায়েন্টের খাতা সিলেক্ট করুন।",
    addEntryHeader: "নতুন ট্রানজেকশন রেকর্ড যুক্ত করুন",
    datePlaceholder: "তারিখ",
    descriptionPlaceholder: "বিবরণ (উদাঃ হাফ স্লিভ নিটিং চার্জ)",
    plyPagePlaceholder: "ফালি/পৃষ্ঠা নং",
    weightPlaceholder: "ওজন কেজি",
    ratePlaceholder: "দর টাকা",
    receivedPlaceholder: "জমা টাকা (যদি থাকে)",
    savingRecord: "সংরক্ষণ হচ্ছে...",
    addRecordBtn: "খাতায় তুলুন ✨",
    deleteRecordTitle: "রেকর্ড ডিলিট নিশ্চিতকরণ",
    deleteRecordBody: "আপনি কি নিশ্চিতভাবে এই ট্রানজেকশন খাতা রেকর্ডটি ডিলিট করতে চান?",
    printReceiptBtn: "প্রিন্ট মেমো (Print Bill)",
    printMemoTitle: "Tasnim & Jannat Knit",
    mrsName: "তাসনিম এন্ড জান্নাত নীট",
    factorySubtitle: "নিটিং ফ্যাক্টরি, হোসিয়ারি ও গার্মেন্টস সリューション, বাংলাদেশ",
    reportDate: "রিপোর্ট জেনারেট তারিখ",
    managerLabel: "ম্যানেজার",
    paymentVerificationSeal: "পেমেন্ট ভেরিফাইড সিল রেকর্ড",
    authorizedSignature: "অনুমোদিত স্বাক্ষর",
    
    settingsTitle: "অ্যাপ্লিকেশন সেটিংস পোর্টাল",
    settingsSubtitle: "ক্রাফট অপশন এবং ইউজার প্রিফারেন্সেস",
    editManagerName: "ম্যানেজার নাম পরিবর্তন করুন",
    editManagerNamePlaceholder: "ম্যানেজারের পুরো নাম লিখুন",
    addManagerPhoto: "ম্যানেজারের প্রোফাইল ফটো যোগ করুন",
    photoDropHelp: "ফটো ফাইল ড্রপ করুন এখানে",
    photoClickHelp: "অথবা ব্রাউজ করতে এখানে ক্লিক করুন (PNG/JPG)",
    languageSelect: "স্থানীয় ভাষা নির্বাচন (Bilingual Option)",
    themeSelect: "ডিসপ্লে থিম নির্বাচন",
    themeLight: "ব্রাইট সোনালী লাইট (Classic Book)",
    themeDark: "কসমিক ডার্ক মোড (Dynamic Slate)",
    themeNight: "মিডনাইট জেট ব্ল্যাক (True Pitch Dark)",
    profileUpdatedSuccess: "প্রোফাইল সেটিংস সফলভাবে আপডেট করা হয়েছে!",
    profileSaveError: "প্রোফাইল আপডেট ব্যর্থ হয়েছে।"
  },
  en: {
    appTitle: "Tasnim & Jannat Knit",
    appSubtitle: "Online Ledger & Hosiery Accounting System",
    refreshTooltip: "Refresh Data",
    logoutTooltip: "Logout",
    clientRegister: "Client Register",
    totalLedger: "Total Ledgers",
    close: "Close",
    newLedger: "New Ledger",
    openNewClientHeader: "Open New Client Ledger",
    clientNamePlaceholder: "Client Name (e.g. Rahim Textile Ltd)*",
    contactPlaceholder: "Phone / Contact",
    notesPlaceholder: "Address / Notes",
    cancel: "Cancel",
    save: "Save",
    searchClients: "Search clients...",
    noClients: "No clients found.",
    deleteClientConfirmHeading: "Confirm Client Deletion",
    deleteClientConfirmSubtitle: "Client Account Permanent Removal",
    clientNameLabel: "Client Name",
    deleteWarningBody: "⚠️ Are you sure you want to delete this client? Doing so will permanently wipe all of their knitting ledgers, bills, receipts, and historical data! This action cannot be undone.",
    dontDelete: "No, Keep Client",
    confirmDelete: "Yes, Delete Client 🗑️",
    deleting: "Removing...",
    logoutTitle: "Confirm Sign Out",
    logoutDesc: "Are you sure you want to log out of this session? You will need to re-enter your credentials to access the ledger again.",
    goBack: "No, Go Back",
    confirmLogout: "Yes, Log Out",
    
    ledgerTitle: "Transaction History & Ledger Bills",
    activeManagerLabel: "Verified Entry Manager",
    dateCol: "Date",
    descriptionCol: "Description & Details",
    plyPageCol: "Page",
    weightCol: "Weight (kg)",
    rateCol: "Rate (৳)",
    totalCol: "Total Bill (৳)",
    receivedCol: "Received (৳)",
    actionCol: "Action",
    totalCalculationLabel: "Total Bill amount:",
    totalReceivedLabel: "Total Received payment:",
    remainingDueLabel: "Total Remaining Outstanding Dues:",
    noClientSelected: "No Client Selected",
    selectClientPrompt: "Please select a client account from the sidebar ledger register to manage billing transaction entries.",
    addEntryHeader: "Add New Transaction Record",
    datePlaceholder: "Date",
    descriptionPlaceholder: "Description (e.g. Half-Sleeve Knitting charge)",
    plyPagePlaceholder: "Ply / Page No",
    weightPlaceholder: "Weight in kg",
    ratePlaceholder: "Rate in Taka",
    receivedPlaceholder: "Received Amount (if any)",
    savingRecord: "Saving record...",
    addRecordBtn: "Post to Ledger ✨",
    deleteRecordTitle: "Confirm Record Deletion",
    deleteRecordBody: "Are you sure you want to permanently delete this transaction record?",
    printReceiptBtn: "Print Memo (Bill Invoice)",
    printMemoTitle: "Tasnim & Jannat Knit",
    mrsName: "M/S Tasnim & Jannat Knit Co.",
    factorySubtitle: "Knitting Factory, Hosiery & Garments Solution, Bangladesh",
    reportDate: "Report Generation Date",
    managerLabel: "Manager",
    paymentVerificationSeal: "Payment Verified Official Record",
    authorizedSignature: "Authorized Sign Signature",
    
    settingsTitle: "Application Settings Portal",
    settingsSubtitle: "Craft Options & User Theme Settings",
    editManagerName: "Update Manager Name",
    editManagerNamePlaceholder: "Enter manager fully qualified name",
    addManagerPhoto: "Add Manager Profile Photo",
    photoDropHelp: "Drop profile image file here",
    photoClickHelp: "Or click to upload from folder (PNG/JPG)",
    languageSelect: "Local Language Select (Bilingual Option)",
    themeSelect: "Display Theme Selection",
    themeLight: "Golden Bright Light (Classic Book)",
    themeDark: "Cosmic Dark Mode (Slate Grey)",
    themeNight: "Midnight Elegant (True Pitch Dark)",
    profileUpdatedSuccess: "Profile settings updated successfully!",
    profileSaveError: "Failed to save profile settings."
  }
};
