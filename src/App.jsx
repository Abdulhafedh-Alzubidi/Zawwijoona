import React, { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Auth from './Auth'; // استدعاء صفحة تسجيل الدخول
import { auth, db } from './firebase'; // استدعاء إعدادات قاعدة البيانات
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // أدوات تسجيل الدخول والخروج
import {
  Home, CalendarHeart, Users, Wallet, Store,
  Globe, Plus, Trash2, CheckCircle, Clock, MapPin,
  Menu, X, Sparkles, Loader2, Copy, HeartHandshake, Image as ImageIcon, FileText,
  MessageCircle, Send, Upload, FileSpreadsheet,
  Phone, ExternalLink, Camera, Music, Flower2, UtensilsCrossed, Utensils, Coins, Calendar, Users2, Search,
  Building2, Eye, BookmarkCheck, BookmarkPlus, Check, Star, AlertCircle, Edit2,
  Scissors, Mail, Car, Bed, Tent
} from 'lucide-react';
import { SERVICE_CATEGORIES, SERVICE_TEMPLATES, createWhatsAppInquiryLink } from './data/servicesData';
import WeddingModeSelector from './components/WeddingModeSelector';
import MassWeddingDashboard from './components/MassWeddingDashboard';
import MassWeddingSetupModal from './components/MassWeddingSetupModal';
import MassWeddingSetupScreen from './components/MassWeddingSetupScreen';
import { DEFAULT_MASS_WEDDING_DATA } from './data/massWeddingTemplates';
import CommitteePortalView from './components/CommitteePortalView';
import {
  decodeCommitteePortalData,
  fetchCommitteeFromPublicFirestore,
  syncCommitteeToPublicFirestore,
} from './utils/portalHelpers';

// --- Dictionary for Bilingual Support ---
const dict = {
  ar: {
    appName: "مراسيم",
    dashboard: "الرئيسية",
    planning: "خطة الزفاف",
    services: "الخدمات والحجوزات",
    guests: "قائمة الضيوف",
    budget: "الميزانية والمالية",
    team: "فريق التنظيم",
    switchLang: "English",
    // ... login/signup ...
    loginTitle: "تسجيل الدخول",
    signupTitle: "إنشاء حساب جديد",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginBtn: "دخول",
    signupBtn: "إنشاء حساب",
    noAccount: "ليس لديك حساب؟",
    haveAccount: "لديك حساب بالفعل؟",

    // Registration
    welcomeSetup: "إعداد ملف الزفاف",
    groomName: "اسم العريس",
    brideName: "اسم العروس",
    weddingDate: "تاريخ الزفاف",
    initialBudget: "الميزانية المبدئية",
    startPlanning: "ابدأ التخطيط الآن",
    // Dashboard
    welcome: "مرحباً بك في لوحة تخطيط",
    daysLeft: "يوماً متبقياً على الزفاف",
    completedTasks: "المهام المنجزة",
    totalBudget: "الميزانية المتاحة",
    // Planning
    events: "الفعاليات والمراسم",
    contract: "عقد القران",
    henna: "جلسة الحناء",
    magyal: "الحراوة (يوم الزفاف)",
    banquet: "الصبحة / الوليمة",
    addEvent: "إضافة فعالية",
    notes: "ملاحظات وتجهيزات الفعالية...",
    eventDate: "تاريخ الفعالية",
    eventLocation: "موقع الفعالية",
    eventTitle: "اسم الفعالية",
    // Services
    bookService: "حجز خدمة",
    venues: "القاعات والمخادر",
    photo: "التصوير والتوثيق",
    band: "فرق الشرح والغيّة",
    morning: "الفترة الصباحية",
    evening: "الفترة المسائية",
    bookNow: "احجز الآن",
    available: "متاح للحجز",
    servicesDirectory: "دليل الخدمات والموردين",
    myBookings: "حجوزاتي المعتمدة",
    searchServices: "ابحث عن خدمة، مورد، أو مدينة...",
    allCategories: "جميع الفئات",
    priceEstimate: "التقدير التقريبي",
    contactWhatsApp: "مراسلة عبر واتساب",
    callPhone: "اتصال هاتفي",
    addToBookings: "إضافة إلى حجوزاتي",
    inBookings: "مضاف للحجوزات ✓",
    removeFromBookings: "إزالة من الحجوزات",
    viewPhotos: "معاينة الصور",
    features: "المميزات والخدمات",
    cityLocation: "المدينة / الموقع",
    statusConfirmed: "مؤكد",
    statusNegotiating: "قيد التفاوض",
    statusInquiry: "استفسار مبدئي",
    bookingStatus: "حالة الحجز",
    agreedCost: "المبلغ المتفق عليه (ر.ي)",
    addCustomService: "إضافة مزود خدمة مخصص",
    serviceProviderName: "اسم مزود الخدمة",
    serviceCategory: "فئة الخدمة",
    phoneNumber: "رقم الهاتف / الواتساب",
    noServicesFound: "لم يتم العثور على خدمات مطابقة للبحث",
    noBookingsYet: "لم تقم بإضافة أي خدمات إلى قائمة حجوزاتك بعد",
    startBrowsing: "استعرض دليل الخدمات وأضف ما يناسب زفافك",
    venueTemplatesCount: "مزود خدمة جاهز",
    myBookingsCount: "خدمات محجوزة",
    // Guests
    guestList: "قائمة الضيوف",
    groomSide: "أهل العريس",
    brideSide: "أهل العروس",
    addGuest: "إضافة ضيف",
    guestName: "اسم ممثل العائلة",
    accompanying: "المرافقين",
    menGuests: "إجمالي الرجال",
    womenGuests: "إجمالي النساء",
    menAccompanying: "مرافقين رجال",
    womenAccompanying: "مرافقات نساء",
    designInvite: "دعوة",
    importCsv: "استيراد من CSV",
    actions: "إجراءات",

    // Budget
    finances: "المالية والمصروفات",
    incomes: "الموارد والإيرادات",
    expenses: "المصروفات",
    totalExpenses: "إجمالي المصروفات",
    remainingBudget: "المتبقي من الميزانية",
    addIncome: "إضافة مورد مالي",
    addExpense: "إضافة مصروف",
    itemName: "البند / المصدر",
    cost: "المبلغ",
    type: "النوع",
    currency: "ريال يمني",
    incomeSource: "مصدر المبلغ",
    incomeType: "نوع المبلغ (مثال: هدية، سلف، شخصي)",
    // Team
    volunteerTeam: "فريق الخدمات التطوعي",
    addMember: "إضافة فرد",
    addTeam: "إضافة فريق تنظيم",
    teamName: "اسم الفريق",
    teamLeader: "المسؤول (القائد)",
    teamTasks: "المهام الرئيسية",
    memberName: "الاسم الكامل",
    role: "المجموعة / الدور",
    task: "المهمة",
    // AI Features
    aiAssistant: "✨ المساعد الحضرمي الذكي",
    generateInvite: "✨ إنشاء رسالة دعوة",
    invitePrompt: "جاري صياغة دعوة حضرمية أصيلة...",
    copyText: "نسخ النص",
    copied: "تم النسخ بنجاح!",
    budgetTips: "✨ نصائح توزيع الميزانية",
    gettingTips: "جاري تحليل الميزانية...",
    aiError: "حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.",
    // Chat
    chatWithAI: "استشر المساعد الذكي",
    typeMessage: "اكتب استفسارك هنا...",
    // Form buttons
    save: "حفظ",
    cancel: "إلغاء",
    massWedding: "عرس جماعي",
    individualWedding: "زواج فردي",
    switchMode: "تبديل الوضع",
  },
  en: {
    appName: "Maraseem",
    dashboard: "Dashboard",
    planning: "Planning",
    services: "Services",
    guests: "Guests",
    budget: "Budget",
    team: "Organizers",
    switchLang: "العربية",
    // ... login/signup ...
    loginTitle: "Sign In",
    signupTitle: "Sign Up",
    email: "Email Address",
    password: "Password",
    loginBtn: "Sign In",
    signupBtn: "Sign Up",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    // Registration
    welcomeSetup: "Wedding Setup",
    groomName: "Groom's Name",
    brideName: "Bride's Name",
    weddingDate: "Wedding Date",
    initialBudget: "Initial Budget",
    startPlanning: "Start Planning",
    // Dashboard
    welcome: "Welcome to the planning of",
    daysLeft: "Days left",
    completedTasks: "Completed Tasks",
    totalBudget: "Available Budget",
    // Planning
    events: "Events & Ceremonies",
    contract: "Marriage Contract",
    henna: "Henna Day",
    magyal: "Hraawa (Wedding Day)",
    banquet: "Subha / Banquet",
    addEvent: "Add Event",
    notes: "Event notes...",
    eventDate: "Event Date",
    eventLocation: "Location",
    eventTitle: "Event Title",
    // Services
    bookService: "Book Service",
    venues: "Venues",
    photo: "Photography",
    band: "Traditional Bands",
    morning: "Morning",
    evening: "Evening",
    bookNow: "Book Now",
    available: "Available",
    servicesDirectory: "Vendors & Services Directory",
    myBookings: "My Confirmed Bookings",
    searchServices: "Search service, vendor, or city...",
    allCategories: "All Categories",
    priceEstimate: "Price Estimate",
    contactWhatsApp: "WhatsApp Chat",
    callPhone: "Call Vendor",
    addToBookings: "Add to My Bookings",
    inBookings: "In Bookings ✓",
    removeFromBookings: "Remove Booking",
    viewPhotos: "View Photos",
    features: "Features & Amenities",
    cityLocation: "City / Location",
    statusConfirmed: "Confirmed",
    statusNegotiating: "Negotiating",
    statusInquiry: "Inquiry",
    bookingStatus: "Booking Status",
    agreedCost: "Agreed Amount (YER)",
    addCustomService: "Add Custom Vendor",
    serviceProviderName: "Service Provider Name",
    serviceCategory: "Service Category",
    phoneNumber: "Phone / WhatsApp Number",
    noServicesFound: "No services match your criteria",
    noBookingsYet: "No booked services recorded yet",
    startBrowsing: "Explore directory and add services to your wedding",
    venueTemplatesCount: "Ready Vendors",
    myBookingsCount: "Booked Services",
    // Guests
    guestList: "Guest List",
    groomSide: "Groom Side",
    brideSide: "Bride Side",
    addGuest: "Add Guest",
    guestName: "Family Rep Name",
    accompanying: "Accompanying",
    menGuests: "Total Men",
    womenGuests: "Total Women",
    menAccompanying: "Men Companions",
    womenAccompanying: "Women Companions",
    designInvite: "Invite",
    importCsv: "Import CSV",
    actions: "Actions",
    // Budget
    finances: "Finances",
    incomes: "Incomes / Funds",
    expenses: "Expenses",
    totalExpenses: "Total Expenses",
    remainingBudget: "Remaining",
    addIncome: "Add Income",
    addExpense: "Add Expense",
    itemName: "Item / Source",
    cost: "Amount",
    type: "Type",
    currency: "YER",
    incomeSource: "Income Source",
    incomeType: "Type (Gift, Loan, Personal)",
    // Team
    volunteerTeam: "Volunteer Support Team",
    addMember: "Add Member",
    addTeam: "Add Team",
    teamName: "Team Name",
    teamLeader: "Leader",
    teamTasks: "Tasks",
    memberName: "Name",
    role: "Group",
    task: "Task",
    // AI Features
    aiAssistant: "✨ Smart Hadhrami Assistant",
    generateInvite: "✨ Generate Invitation",
    invitePrompt: "Crafting a traditional invitation...",
    copyText: "Copy",
    copied: "Copied!",
    budgetTips: "✨ Allocation Tips",
    gettingTips: "Analyzing...",
    aiError: "Connection error. Please try again.",
    // Chat
    chatWithAI: "Consult Smart Assistant",
    typeMessage: "Type your message...",
    // Form buttons
    save: "Save",
    cancel: "Cancel",
    massWedding: "Mass Wedding",
    individualWedding: "Individual Wedding",
    switchMode: "Switch Mode",
  }
};

// --- Gemini API Helper (Replace with your actual key) ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; // تأكد من إضافة مفتاح API في ملف .env
const generateWithGemini = async (prompt) => {
  if (!apiKey) {
    console.warn("Gemini API key is missing. Simulating response.");
    return new Promise(resolve => setTimeout(() => resolve("Simulated AI response. Please add your API key to src/App.jsx."), 1500));
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  let retries = 5;
  let delay = 1000;
  while (retries > 0) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.candidates && data.candidates[0]) {
        return data.candidates[0].content.parts[0].text;
      }
      throw new Error("Invalid response");
    } catch (err) {
      retries--;
      if (retries === 0) return null;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
};

export default function App() {
  // -- الأكواد الجديدة الخاصة بالمصادقة --
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // هذا الكود يشتغل أول ما يفتح التطبيق عشان يتأكد إذا المستخدم مسجل دخول من قبل
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // دالة تسجيل الخروج
  const handleLogout = async () => {
    try {
      await signOut(auth); // تسجيل الخروج من Firebase

      // تصفير كل الذاكرة عشان الحساب الجديد يبدأ من الصفر
      setIsSetupComplete(false);
      setCouple({ groom: "", bride: "", date: "", initialBudget: "" });
      setEvents([]);
      setGuests([]);
      setIncomes([]);
      setExpenses([]);
      setBookedServices([]);
      setWeddingMode(null);
      setMassWeddingData(DEFAULT_MASS_WEDDING_DATA);
      setShowModeSelectorModal(false);
      setShowMassSetupModal(false);
      setProfileInfo({
        username: '',
        email: '',
        phone: '',
        bio: ''
      });

      // مسح حالة الجلسة دون مسح ذاكرة التخزين المحلية للحساب
      sessionStorage.clear();

    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const [profileInfo, setProfileInfo] = useState({
    username: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileInfo((prev) => ({
        username: user.displayName || user.email?.split('@')[0] || 'ضيفنا',
        email: user.email || '',
        phone: prev.phone,
        bio: prev.bio
      }));
    }
  }, [user]);

  // Click outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleProfileInfoChange = (field, value) => {
    setProfileInfo((prev) => ({ ...prev, [field]: value }));
  };

  // 1. ALL HOOKS DECLARED AT THE TOP LEVEL
  const [lang, setLang] = useState('ar');
  const [weddingMode, setWeddingMode] = useState(null); // 'individual' | 'mass' | null
  const [massWeddingData, setMassWeddingData] = useState(DEFAULT_MASS_WEDDING_DATA);
  const [showModeSelectorModal, setShowModeSelectorModal] = useState(false);
  const [showMassSetupModal, setShowMassSetupModal] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [showEditWeddingModal, setShowEditWeddingModal] = useState(false);
  const [firestorePermissionError, setFirestorePermissionError] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [massActiveTab, setMassActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [couple, setCouple] = useState({ groom: "", bride: "", date: "", initialBudget: "" });
  const [events, setEvents] = useState([
    { id: 'contract', titleKey: 'contract', title: "", date: "", location: "", notes: "", completed: false },
    { id: 'henna', titleKey: 'henna', title: "", date: "", location: "", notes: "", completed: false },
    { id: 'magyal', titleKey: 'magyal', title: "", date: "", location: "", notes: "", completed: false },
    { id: 'banquet', titleKey: 'banquet', title: "", date: "", location: "", notes: "", completed: false },
  ]);
  const [guests, setGuests] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  // Teams structure: id, name, leader, phone, tasks, members[]
  const [teams, setTeams] = useState([
    { id: 1, name: "فريق الاستقبال", leader: "", phone: "", tasks: "استقبال الضيوف وتطييبهم بالبخور", members: [] },
    { id: 2, name: "فريق الضيافة", leader: "", phone: "", tasks: "الإشراف على توزيع القهوة والمديد", members: [] }
  ]);

  // --- Services & Vendors State ---
  const [bookedServices, setBookedServices] = useState([]);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('all');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [servicesSubTab, setServicesSubTab] = useState('templates'); // 'templates' | 'myBookings'
  const [activePhotoGallery, setActivePhotoGallery] = useState(null);
  const [showAddCustomServiceModal, setShowAddCustomServiceModal] = useState(false);

  // --- Public Committee Portal State (الوصول المباشر بدون حساب) ---
  const [publicPortalCommittee, setPublicPortalCommittee] = useState(null);
  const [isPublicPortalLoading, setIsPublicPortalLoading] = useState(false);

  // --- دوال التخزين المحلي الآمن لضمان عدم اختفاء البيانات ---
  const getCacheKey = (uid) => `zawwijoona_wedding_cache_${uid}`;

  const loadLocalCache = (uid) => {
    try {
      const cached = localStorage.getItem(getCacheKey(uid));
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.warn("فشل قراءة النسخة الاحتياطية المحلية:", e);
      return null;
    }
  };

  const updateLocalCache = (uid, patch) => {
    try {
      const existing = loadLocalCache(uid) || {};
      const updated = { ...existing, ...patch, lastSavedAt: new Date().toISOString() };
      localStorage.setItem(getCacheKey(uid), JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn("فشل تحديث النسخة الاحتياطية المحلية:", e);
    }
  };

  // --- مراقب جلب بيانات اللجنة العامة سحابياً لتمكين الفتح المباشر بدون حساب ---
  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const req = params && (params.get('portal') === 'committee' || !!params.get('committeeId'));
    const comId = params ? params.get('committeeId') : null;
    const cdata = params ? params.get('cdata') : null;

    if (!req || !comId) return;

    // 1. فك التشفير الذاتي إن وُجد
    if (cdata) {
      const decoded = decodeCommitteePortalData(cdata);
      if (decoded) {
        setPublicPortalCommittee(decoded);
        return;
      }
    }

    // 2. التحقق من التخزين المحلي إن وُجد
    try {
      const directCached = localStorage.getItem(`maraseem_com_${comId}`);
      if (directCached) {
        setPublicPortalCommittee(JSON.parse(directCached));
        return;
      }
    } catch (e) { }

    // 3. الجلب السحابي المباشر من مسار اللجان العامة
    let isMounted = true;
    setIsPublicPortalLoading(true);

    fetchCommitteeFromPublicFirestore(db, comId)
      .then((data) => {
        if (isMounted) {
          if (data) {
            setPublicPortalCommittee(data);
            try {
              localStorage.setItem(`maraseem_com_${comId}`, JSON.stringify(data));
            } catch (e) { }
          }
          setIsPublicPortalLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch public committee:', err);
        if (isMounted) setIsPublicPortalLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // --- دالة موحدة لتطبيق بيانات المستخدم على واجهة التطبيق ---
  const applyUserData = (data) => {
    if (!data) return;

    if (data.setup) {
      setCouple(data.setup);
      setIsSetupComplete(true);
    } else if (data.isSetupComplete) {
      setIsSetupComplete(true);
    } else {
      setIsSetupComplete(false);
    }

    if (data.massWeddingData) {
      setMassWeddingData(data.massWeddingData);
      try {
        localStorage.setItem('maraseem_latest_mass_wedding_data', JSON.stringify(data.massWeddingData));
        (data.massWeddingData.committees || []).forEach((com) => {
          syncCommitteeToPublicFirestore(db, com, data.massWeddingData.info);
        });
      } catch (e) { }
    }
    if (data.guests) setGuests(data.guests);
    if (data.expenses) setExpenses(data.expenses);
    if (data.events) setEvents(data.events);
    if (data.teams) setTeams(data.teams);
    if (data.profile) setProfileInfo(data.profile);
    if (data.bookedServices) setBookedServices(data.bookedServices);

    let fetchedIncomes = data.incomes || [];
    if (data.setup && data.setup.initialBudget) {
      const hasInitialBudget = fetchedIncomes.some(inc => inc.type === 'شخصي' || inc.type === 'Personal');
      if (!hasInitialBudget) {
        fetchedIncomes = [
          {
            id: 'initial_budget_fixed',
            source: lang === 'ar' ? 'الميزانية المبدئية' : 'Initial Budget',
            type: lang === 'ar' ? 'شخصي' : 'Personal',
            amount: data.setup.initialBudget
          },
          ...fetchedIncomes
        ];
      }
    }
    setIncomes(fetchedIncomes);
  };

  // --- دالة حفظ الحقول المشتركة مع مزامنة فورية محلياً وسحابياً ---
  const saveUserField = async (field, value) => {
    if (!user) return;
    // 1. الحفظ المحلي الفوري (يضمن عدم ضياع أي تغيير إطلاقاً حتى لو حدث خطأ بالسيرفر)
    updateLocalCache(user.uid, { [field]: value });

    // 2. المحاولة مع فايربيس
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { [field]: value }, { merge: true });
      setFirestorePermissionError(false);
    } catch (error) {
      console.error(`خطأ في حفظ ${field} في فايربيس:`, error);
      if (error?.code === 'permission-denied') {
        setFirestorePermissionError(true);
      }
    }
  };

  const handleProfileSave = async () => {
    if (user) {
      await saveUserField('profile', profileInfo);
      setIsProfileEditMode(false);
    }
  };

  // --- كود الاسترجاع العظيم (Fetch Data) مع حماية ضد فقدان البيانات ---
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // خطوة أ: قراءة النسخة المحلية فوراً لمنع وميض الواجهة أو فقدان البيانات
        const cached = loadLocalCache(user.uid);
        if (cached) {
          applyUserData(cached);
        }

        // خطوة ب: استرجاع البيانات من Firebase ومزامنتها
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            applyUserData(data);
            updateLocalCache(user.uid, data);
            setFirestorePermissionError(false);
            console.log("تم استرجاع جميع البيانات بنجاح من فايربيس! 📥🎯", data);
          } else {
            console.log("المستخدم جديد على السيرفر.");
            // إذا كان المستخدم جديد على السيرفر لكنه يملك بيانات محلياً (مثلاً فشل الحفظ سابقاً)، ارفعها الآن
            if (cached) {
              try {
                await setDoc(userDocRef, cached, { merge: true });
                setFirestorePermissionError(false);
              } catch (err) {
                if (err?.code === 'permission-denied') setFirestorePermissionError(true);
              }
            }
          }
        } catch (error) {
          console.error("خطأ في استرجاع البيانات من فايربيس:", error);
          if (error?.code === 'permission-denied') {
            setFirestorePermissionError(true);
          }
          // التأكد من استمرار العمل بالنسخة المحلية في حالة حدوث خطأ بالسيرفر
          if (cached) {
            applyUserData(cached);
          }
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleSelectMode = async (mode) => {
    setWeddingMode(mode);
    setShowModeSelectorModal(false);
    await saveUserField('weddingMode', mode);
  };

  const handleSaveMassWeddingSetup = async (setupFormData) => {
    const updated = {
      ...massWeddingData,
      info: {
        ...massWeddingData.info,
        ...setupFormData,
        isConfigured: true
      }
    };
    setMassWeddingData(updated);
    setShowMassSetupModal(false);
    await saveUserField('massWeddingData', updated);
  };

  const handleUpdateMassWeddingData = async (newMassData) => {
    setMassWeddingData(newMassData);
    try {
      localStorage.setItem('maraseem_latest_mass_wedding_data', JSON.stringify(newMassData));
      // نشر ومزامنة كل لجنة سحابياً للقراءة العامة ومحلياً
      (newMassData.committees || []).forEach((com) => {
        try {
          localStorage.setItem(`maraseem_com_${com.id}`, JSON.stringify({
            ...com,
            weddingTitle: newMassData.info?.title,
            weddingDate: newMassData.info?.date,
            organizer: newMassData.info?.organizer,
          }));
          syncCommitteeToPublicFirestore(db, com, newMassData.info);
        } catch (err) {
          console.warn(err);
        }
      });
    } catch (e) {
      console.warn("فشل حفظ نسخة العرس الجماعي للبوابات:", e);
    }
    await saveUserField('massWeddingData', newMassData);
  };

  const handleDeleteIndividualWedding = async () => {
    const confirmMsg = isRtl
      ? "هل أنت متأكد من رغبتك في حذف ملف هذا الزواج الفردي بالكامل؟ سيتم مسح بيانات العروسين والميزانية لتتمكن من إنشاء ملف زفاف جديد."
      : "Are you sure you want to delete this individual wedding file? Groom, bride, and budget will be cleared to start anew.";
    if (!window.confirm(confirmMsg)) return;

    const clearedCouple = { groom: "", bride: "", date: "", initialBudget: "" };
    setCouple(clearedCouple);
    setIsSetupComplete(false);
    setShowEditWeddingModal(false);
    setWeddingMode(null);

    const patch = {
      setup: clearedCouple,
      isSetupComplete: false,
      weddingMode: null
    };

    if (user) {
      updateLocalCache(user.uid, patch);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, patch, { merge: true });
      } catch (err) {
        console.error("Error clearing individual wedding:", err);
      }
    }
  };

  const handleDeleteMassWedding = async () => {
    const confirmMsg = isRtl
      ? "هل أنت متأكد من رغبتك في حذف ملف هذا العرس الجماعي بالكامل؟ سيتم مسح بيانات الفعالية واللجان والعرسان للبدء في تنظيم عرس جديد."
      : "Are you sure you want to delete this mass wedding file? All event details, committees, and couples will be cleared to start anew.";
    if (!window.confirm(confirmMsg)) return;

    setMassWeddingData(DEFAULT_MASS_WEDDING_DATA);
    setShowMassSetupModal(false);
    setWeddingMode(null);

    const patch = {
      massWeddingData: DEFAULT_MASS_WEDDING_DATA,
      weddingMode: null
    };

    if (user) {
      updateLocalCache(user.uid, patch);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, patch, { merge: true });
      } catch (err) {
        console.error("Error clearing mass wedding:", err);
      }
    }
  };

  const handleDeleteGuest = async (guestId) => {
    const updatedGuests = guests.filter((g) => g.id !== guestId);
    setGuests(updatedGuests);
    await saveUserField('guests', updatedGuests);
  };

  const handleDeleteExpense = async (expenseId) => {
    const updatedExpenses = expenses.filter((e) => e.id !== expenseId);
    setExpenses(updatedExpenses);
    await saveUserField('expenses', updatedExpenses);
  };

  const handleDeleteIncome = async (incomeId) => {
    const updatedIncomes = incomes.filter((e) => e.id !== incomeId);
    setIncomes(updatedIncomes);
    await saveUserField('incomes', updatedIncomes);
  };

  const handleDeleteEvent = async (eventId) => {
    const updatedEvents = events.filter((e) => e.id !== eventId);
    setEvents(updatedEvents);
    await saveUserField('events', updatedEvents);
  };

  const handleDeleteTeam = async (teamId) => {
    const updatedTeams = teams.filter((t) => t.id !== teamId);
    setTeams(updatedTeams);
    await saveUserField('teams', updatedTeams);
  };

  const handleDeleteTeamMember = async (teamId, memberId) => {
    const updatedTeams = teams.map((t) =>
      t.id === teamId ? { ...t, members: t.members.filter((m) => m.id !== memberId) } : t
    );
    setTeams(updatedTeams);
    await saveUserField('teams', updatedTeams);
  };

  const updateEvents = async (updatedEvents) => {
    setEvents(updatedEvents);
    await saveUserField('events', updatedEvents);
  };

  // --- دوال إدارة وتخزين الخدمات والموردين ---
  const handleToggleBooking = async (service) => {
    const isAlreadyBooked = bookedServices.some(b => b.templateId === service.id);
    let updated;
    if (isAlreadyBooked) {
      updated = bookedServices.filter(b => b.templateId !== service.id);
    } else {
      const newBooking = {
        id: Date.now(),
        templateId: service.id,
        category: service.category,
        nameAr: service.nameAr,
        nameEn: service.nameEn,
        name: isRtl ? service.nameAr : service.nameEn,
        cityAr: service.cityAr,
        cityEn: service.cityEn,
        city: isRtl ? service.cityAr : service.cityEn,
        phone: service.phone,
        whatsapp: service.whatsapp,
        priceEstimate: isRtl ? service.priceEstimateAr : service.priceEstimateEn,
        agreedCost: isRtl ? service.priceEstimateAr : service.priceEstimateEn,
        status: 'confirmed', // 'confirmed' | 'negotiating' | 'inquiry'
        notes: '',
        image: service.images && service.images[0] ? service.images[0] : '',
        addedAt: new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')
      };
      updated = [newBooking, ...bookedServices];
    }
    setBookedServices(updated);
    await saveUserField('bookedServices', updated);
  };

  const handleSaveCustomService = async (customData) => {
    const newService = {
      id: Date.now(),
      templateId: null,
      isCustom: true,
      category: customData.category,
      nameAr: customData.name,
      nameEn: customData.name,
      name: customData.name,
      cityAr: customData.city,
      cityEn: customData.city,
      city: customData.city,
      phone: customData.phone,
      whatsapp: customData.whatsapp || customData.phone,
      agreedCost: customData.agreedCost || '',
      priceEstimate: customData.agreedCost || '',
      status: customData.status || 'confirmed',
      notes: customData.notes || '',
      image: customData.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      addedAt: new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')
    };
    const updated = [newService, ...bookedServices];
    setBookedServices(updated);
    await saveUserField('bookedServices', updated);
    setShowAddCustomServiceModal(false);
  };

  const handleDeleteBookedService = async (bookingId) => {
    const updated = bookedServices.filter(b => b.id !== bookingId);
    setBookedServices(updated);
    await saveUserField('bookedServices', updated);
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const updated = bookedServices.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    setBookedServices(updated);
    await saveUserField('bookedServices', updated);
  };

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showTeamMemberModal, setShowTeamMemberModal] = useState(null);

  // AI Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    setChatMessages([{ role: 'ai', text: lang === 'ar' ? 'حياكم الله وبياكم! أنا مساعدكم الحضرمي.. كيف أقدر أساعدكم اليوم في تجهيزات الزواج؟' : 'Welcome! I am your Hadhrami wedding assistant. How can I help you today?' }]);
  }, [lang]);

  // 2. CONSTANTS AND UTILS
  const t = dict[lang];
  const isRtl = lang === 'ar';
  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar');
  const daysLeft = couple.date ? Math.ceil((new Date(couple.date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const todayStr = new Date().toISOString().split('T')[0];

  // 3. EVENT HANDLERS
  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCouple = {
      groom: formData.get('groom'),
      bride: formData.get('bride'),
      date: formData.get('date'),
      initialBudget: Number(formData.get('budget'))
    };
    const initialIncomes = [{
      id: Date.now(),
      source: isRtl ? 'الميزانية المبدئية' : 'Initial Budget',
      type: isRtl ? 'شخصي' : 'Personal',
      amount: newCouple.initialBudget
    }];

    setCouple(newCouple);
    setIncomes(initialIncomes);
    setWeddingMode('individual');
    setIsSetupComplete(true);

    const setupPayload = {
      setup: newCouple,
      weddingMode: 'individual',
      isSetupComplete: true,
      incomes: initialIncomes,
      updatedAt: new Date().toISOString()
    };

    if (user) {
      updateLocalCache(user.uid, setupPayload);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, setupPayload, { merge: true });
        setFirestorePermissionError(false);
        console.log("تم حفظ بيانات الزفاف بنجاح في السيرفر!");
      } catch (error) {
        console.error("خطأ في حفظ البيانات في فايربيس:", error);
        if (error?.code === 'permission-denied') {
          setFirestorePermissionError(true);
        }
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newUserMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatLoading(true);

    const systemPrompt = lang === 'ar'
      ? "أنت خبير في عادات وتقاليد الزواج في حضرموت (الحراوة، الحناء، المديد، الغية، المخدرة، إلخ). أجب باختصار، ود، وبلهجة حضرمية محببة ومهذبة."
      : "You are an AI expert in Hadhrami Yemeni wedding traditions. Answer briefly, politely, and warmly.";
    const response = await generateWithGemini(`${systemPrompt}\n\nسؤال المستخدم: ${newUserMsg.text}`);
    setChatMessages(prev => [...prev, { role: 'ai', text: response || t.aiError }]);
    setIsChatLoading(false);
  };

  const navItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: t.dashboard },
    { id: 'planning', icon: <CalendarHeart size={20} />, label: t.planning },
    { id: 'services', icon: <Store size={20} />, label: t.services },
    { id: 'guests', icon: <Users size={20} />, label: t.guests },
    { id: 'team', icon: <HeartHandshake size={20} />, label: t.team },
    { id: 'budget', icon: <Wallet size={20} />, label: t.budget },
  ];

  const massNavItems = [
    { id: 'overview', icon: <Sparkles size={20} />, label: isRtl ? 'نظرة عامة' : 'Overview' },
    { id: 'couples', icon: <Users2 size={20} />, label: isRtl ? `سجل العرسان (${massWeddingData.couples?.length || 0})` : `Couples (${massWeddingData.couples?.length || 0})` },
    { id: 'committees', icon: <HeartHandshake size={20} />, label: isRtl ? `اللجان الميدانية (${massWeddingData.committees?.length || 0})` : `Committees (${massWeddingData.committees?.length || 0})` },
    { id: 'logistics', icon: <Utensils size={20} />, label: isRtl ? 'حاسبة الوليمة والتموين' : 'Rations & Logistics' },
    { id: 'budget', icon: <Coins size={20} />, label: isRtl ? 'الميزانية والرعايات' : 'Budget & Sponsors' },
    { id: 'schedule', icon: <Calendar size={20} />, label: isRtl ? 'جدول الفعاليات' : 'Schedule' },
    { id: 'ai', icon: <Sparkles size={20} />, label: isRtl ? '✨ المساعد الذكي' : '✨ AI Assistant' },
  ];


  // 5. INNER COMPONENTS RENDERING LOGIC
  const DashboardTab = () => {
    const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const remainingBudget = totalIncomes - totalExpenses;
    const completedEvents = events.filter(event => event.completed).length;
    const totalEvents = events.length;
    const totalGuests = guests.reduce((sum, guest) => sum + (guest.accompanying || 0) + 1, 0);

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-xl md:text-2xl font-medium mb-1 opacity-90">{t.welcome}</h2>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-wide">
              {lang === 'ar' ? `زفاف ${couple.groom} و ${couple.bride}` : `Wedding of ${couple.groom} & ${couple.bride}`}
            </h1>
            <p className="text-lg font-medium mb-4 text-amber-100">
              {lang === 'ar' ? 'بارك الله لكما وجمع بينكما في خير، بالتمام على خير إن شاء الله 💍' : 'May God bless you both and bring you together in goodness 💍'}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              <div className="inline-block bg-black/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-bold tracking-widest">
                {couple.date || 'TBD'}
              </div>
              <button
                type="button"
                onClick={() => setShowEditWeddingModal(true)}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3.5 py-2 rounded-full backdrop-blur-sm transition cursor-pointer shadow-sm"
                title={isRtl ? 'تعديل بيانات العرسان والميزانية' : 'Edit Wedding Details'}
              >
                <Edit2 size={13} />
                <span>{isRtl ? 'تعديل بيانات الزفاف' : 'Edit Details'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center lg:flex-col lg:items-center lg:justify-center lg:text-center lg:gap-2">
            <div className="bg-amber-100 p-4 rounded-full text-amber-600">
              <Clock size={28} className='md:max-lg:size-6' />
            </div>
            <div className="mb-2 md:max-lg:mx-4">
              <p className="text-gray-500 text-sm font-medium lg:text-nowrap lg:mb-2">{t.daysLeft}</p>
              <p className="text-2xl md:text-lg px-2 font-bold text-gray-800">{daysLeft > 0 ? daysLeft : 0}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center lg:flex-col lg:items-center lg:justify-center lg:text-center lg:gap-2">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <Wallet size={28} className='md:max-lg:size-6' />
            </div>
            <div className="relative md:max-lg:mx-4">
              <p className="text-gray-500 text-sm font-medium lg:mb-2">{isRtl ? 'الميزانية المتبقية' : 'Remaining Budget'}</p>
              <p className="text-2xl md:text-lg px-2 font-bold text-gray-800">
                <span>{remainingBudget.toLocaleString()}</span>
                <span className="text-[0.8rem] absolute top-10 -left-[0.35rem] lg:top-12">{t.currency}</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center lg:flex-col lg:items-center lg:justify-center lg:text-center lg:gap-2">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600">
              <CheckCircle size={28} className='md:max-lg:size-6' />
            </div>
            <div className="md:max-lg:mx-4">
              <p className="text-gray-500 text-sm font-medium lg:mb-2">{isRtl ? 'الفعاليات المكتملة' : 'Events Completed'}</p>
              <p className="text-2xl md:text-lg px-2 font-bold text-gray-800">{completedEvents}/{totalEvents}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center lg:flex-col lg:items-center lg:justify-center lg:text-center lg:gap-2">
            <div className="bg-purple-100 p-4 rounded-full text-purple-600">
              <Users size={28} className='md:max-lg:size-6' />
            </div>
            <div className="md:max-lg:mx-4">
              <p className="text-gray-500 text-sm font-medium lg:mb-2">{isRtl ? 'إجمالي الضيوف' : 'Total Guests'}</p>
              <p className="text-2xl md:text-lg px-2 font-bold text-gray-800">{totalGuests}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PlanningTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{t.events}</h2>
          <button onClick={() => { setEditingEvent(null); setShowEventModal(true); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 transition shadow-sm">
            <Plus size={18} /> {t.addEvent}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((eventInfo) => (
            <div key={eventInfo.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 transition hover:border-amber-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={eventInfo.completed}
                    onChange={(e) => updateEvents(events.map(ev => ev.id === eventInfo.id ? { ...ev, completed: e.target.checked } : ev))}
                    className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                  />
                  <h3 className={`text-lg font-bold ${eventInfo.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {eventInfo.titleKey ? t[eventInfo.titleKey] : eventInfo.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingEvent(eventInfo); setShowEventModal(true); }}
                    className="text-gray-400 hover:text-amber-600 p-1 rounded-lg transition"
                    title={isRtl ? 'تعديل الفعالية' : 'Edit Event'}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(eventInfo.id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition"
                    title={isRtl ? 'حذف الفعالية' : 'Delete Event'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarHeart size={16} className="text-amber-500" />
                  <input
                    type="date"
                    min={todayStr}
                    className="bg-transparent border-b border-gray-100 focus:border-amber-400 outline-none w-full pb-1"
                    value={eventInfo.date}
                    onChange={(e) => updateEvents(events.map(ev => ev.id === eventInfo.id ? { ...ev, date: e.target.value } : ev))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-amber-500" />
                  <input
                    type="text"
                    placeholder={t.eventLocation}
                    className="bg-transparent border-b border-gray-100 focus:border-amber-400 outline-none w-full pb-1"
                    value={eventInfo.location}
                    onChange={(e) => updateEvents(events.map(ev => ev.id === eventInfo.id ? { ...ev, location: e.target.value } : ev))}
                  />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <FileText size={14} /> <span className="text-xs font-bold">{t.notes}</span>
                </div>
                <textarea
                  className="w-full bg-amber-50/50 border border-amber-100 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  rows="2"
                  placeholder="اكتب تجهيزات وملاحظات الفعالية هنا..."
                  value={eventInfo.notes}
                  onChange={(e) => updateEvents(events.map(ev => ev.id === eventInfo.id ? { ...ev, notes: e.target.value } : ev))}
                ></textarea>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  };

  const TeamTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{t.volunteerTeam}</h2>
          <button onClick={() => { setEditingTeam(null); setShowTeamModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition shadow-sm">
            <Plus size={18} /> {t.addTeam}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.length === 0 ? <p className="text-gray-500">لا يوجد فرق مسجلة.</p> : teams.map(team => (
            <div key={team.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="bg-blue-50 px-5 py-4 border-b border-blue-100 flex items-start justify-between relative">
                <div>
                  <h3 className="font-bold text-blue-800 text-lg">{team.name}</h3>
                  <p className="text-xs text-blue-600 mt-1 font-bold">{t.teamLeader}: <span className="text-gray-700">{team.leader}</span></p>
                  {team.phone && <p className="text-xs text-blue-600 font-bold">{isRtl ? 'الهاتف' : 'Phone'}: <span className="text-gray-700">{team.phone}</span></p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingTeam(team); setShowTeamModal(true); }}
                      className="text-blue-500 hover:text-blue-800 transition p-0.5"
                      title={isRtl ? 'تعديل الفريق' : 'Edit Team'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-blue-300 hover:text-red-500 transition p-0.5"
                      title={isRtl ? 'حذف الفريق' : 'Delete Team'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">{team.members.length}</span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600 border-b border-gray-100 pb-3 leading-relaxed">
                  <span className="font-bold text-gray-800">{t.teamTasks}:</span> {team.tasks}
                </p>

                <div className="space-y-2">
                  {team.members.map(member => (
                    <div key={member.id} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex justify-between items-center">
                      <p className="font-bold text-gray-800 text-sm">{member.name}</p>
                      <button onClick={() => handleDeleteTeamMember(team.id, member.id)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>

                <button onClick={() => setShowTeamMemberModal(team.id)} className="w-full text-xs text-blue-600 font-bold border border-dashed border-blue-200 p-2.5 rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-1">
                  <Plus size={14} /> {t.addMember}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const GuestsTab = () => {
    const getGuestStats = (g) => {
      const isFemale = g.gender === 'female';
      const menAcc = Number(g.menAccompanying !== undefined ? g.menAccompanying : (g.accompanying !== undefined ? g.accompanying : 0));
      const womenAcc = Number(g.womenAccompanying || 0);
      const totalAcc = menAcc + womenAcc;
      const men = isFemale ? menAcc : (menAcc + 1);
      const women = isFemale ? (womenAcc + 1) : womenAcc;
      const total = men + women;
      return { isFemale, menAcc, womenAcc, totalAcc, men, women, total };
    };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          if (lines.length <= 1) return; // No data or just header

          // Get headers and normalize them
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          const parsedGuests = [];

          // Smart finding of column indices based on common Arabic/English headers
          const nameKey = headers.find(h => ['name', 'Name', 'الاسم', 'اسم العائلة', 'اسم الضيف'].includes(h));
          const sideKey = headers.find(h => ['side', 'Side', 'الجهة', 'إجراء', 'القرابة'].includes(h));
          const accKey = headers.find(h => ['accompanying', 'Accompanying', 'المرافقين', 'عدد المرافقين', 'المرافقون'].includes(h));
          const menKey = headers.find(h => ['men', 'Men', 'رجال', 'المرافقين رجال', 'مرافقين رجال', 'مرافقين (رجال)', 'عدد الرجال'].includes(h));
          const womenKey = headers.find(h => ['women', 'Women', 'نساء', 'المرافقين نساء', 'مرافقات', 'مرافقات نساء', 'مرافقين (نساء)', 'عدد النساء'].includes(h));
          const genderKey = headers.find(h => ['gender', 'Gender', 'النوع', 'الجنس', 'صفة الممثل'].includes(h));

          for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',').map(val => val.trim().replace(/^"|"$/g, ''));
            if (currentLine.length === 0 || (currentLine.length === 1 && currentLine[0] === '')) continue;

            const row = {};
            headers.forEach((header, index) => {
              row[header] = currentLine[index] !== undefined ? currentLine[index] : '';
            });

            // Fallback to first column if name key is missing
            const guestName = (nameKey ? row[nameKey] : currentLine[0]) || '';

            // Skip if name is empty or it's a "Total" row
            if (!guestName || guestName.includes('الإجمالي') || guestName.includes('Total') || guestName.includes('المجموع')) continue;

            // Fallback to third column if side key is missing
            let rawSide = (sideKey ? row[sideKey] : currentLine[2]) || '';
            let mappedSide = 'groomSide'; // Default to groom side
            if (rawSide.includes('عروس') || rawSide.toLowerCase().includes('bride')) {
              mappedSide = 'brideSide';
            }

            let rawMen = menKey ? row[menKey] : '';
            let rawWomen = womenKey ? row[womenKey] : '';
            let rawAcc = accKey ? row[accKey] : currentLine[1];

            let parsedMen = parseInt(rawMen, 10);
            let parsedWomen = parseInt(rawWomen, 10);
            let parsedAcc = parseInt(rawAcc, 10);
            if (isNaN(parsedAcc)) parsedAcc = 0;

            if (isNaN(parsedMen) && isNaN(parsedWomen)) {
              parsedMen = parsedAcc;
              parsedWomen = 0;
            } else {
              if (isNaN(parsedMen)) parsedMen = 0;
              if (isNaN(parsedWomen)) parsedWomen = 0;
              parsedAcc = parsedMen + parsedWomen;
            }

            let rawGender = (genderKey ? row[genderKey] : '').trim().toLowerCase();
            let mappedGender = 'male';
            if (rawGender.includes('أنثى') || rawGender.includes('انثى') || rawGender.includes('امرأة') || rawGender.includes('سيدة') || rawGender.includes('female')) {
              mappedGender = 'female';
            }

            parsedGuests.push({
              id: Date.now() + i,
              name: guestName,
              side: mappedSide,
              gender: mappedGender,
              menAccompanying: parsedMen,
              womenAccompanying: parsedWomen,
              accompanying: parsedAcc,
              status: 'pending'
            });
          }
          setGuests(prev => {
            const updated = [...prev, ...parsedGuests];
            saveUserField('guests', updated);
            return updated;
          });
          // Clear the input so the same file can be selected again
          event.target.value = null;
        };
        reader.readAsText(file);
      }
    };

    const totalGroomSide = guests.filter(g => g.side === 'groomSide').reduce((sum, g) => sum + getGuestStats(g).total, 0);
    const totalBrideSide = guests.filter(g => g.side === 'brideSide').reduce((sum, g) => sum + getGuestStats(g).total, 0);
    const totalAllGuests = totalGroomSide + totalBrideSide;
    const totalMen = guests.reduce((sum, g) => sum + getGuestStats(g).men, 0);
    const totalWomen = guests.reduce((sum, g) => sum + getGuestStats(g).women, 0);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-gray-800">{t.guestList}</h2>
          <div className="flex gap-2">
            <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 border border-gray-300 transition">
              <FileSpreadsheet size={18} />
              <span className="hidden sm:inline">{t.importCsv}</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={() => { setEditingGuest(null); setShowGuestModal(true); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 transition shadow-sm">
              <Plus size={18} /> {t.addGuest}
            </button>
          </div>
        </div>

        {/* كروت الإحصائيات: حفظ تقسيم أهل العريس والعروس بالكامل + إظهار إجمالي الرجال والنساء */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center col-span-2 sm:col-span-1">
            <p className="text-amber-800 font-bold text-sm mb-1">{lang === 'ar' ? 'إجمالي الضيوف' : 'Total Guests'}</p>
            <p className="text-2xl font-black text-amber-900">{totalAllGuests}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
            <p className="text-blue-800 font-bold text-sm mb-1">{t.groomSide}</p>
            <p className="text-2xl font-black text-blue-900">{totalGroomSide}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
            <p className="text-rose-800 font-bold text-sm mb-1">{t.brideSide}</p>
            <p className="text-2xl font-black text-rose-900">{totalBrideSide}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
            <p className="text-indigo-800 font-bold text-sm mb-1 flex items-center justify-center gap-1">
              <span>👨</span> {t.menGuests}
            </p>
            <p className="text-2xl font-black text-indigo-900">{totalMen}</p>
          </div>
          <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 text-center">
            <p className="text-pink-800 font-bold text-sm mb-1 flex items-center justify-center gap-1">
              <span>👩</span> {t.womenGuests}
            </p>
            <p className="text-2xl font-black text-pink-900">{totalWomen}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-amber-50/50 border-b border-amber-100 text-amber-800">
                <tr>
                  <th className={`p-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{t.guestName}</th>
                  <th className={`p-4 font-bold text-center`}>{t.accompanying} ({isRtl ? 'رجال ونساء' : 'Men & Women'})</th>
                  <th className="p-4 font-bold text-center">{isRtl ? 'إجمالي الأفراد' : 'Total'}</th>
                  <th className="p-4 font-bold text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {guests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">لا يوجد ضيوف مضافين بعد.</td>
                  </tr>
                ) : (
                  guests.map((guest) => {
                    const stats = getGuestStats(guest);
                    return (
                      <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{guest.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${guest.side === 'brideSide' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                              {guest.side === 'brideSide' ? t.brideSide : t.groomSide}
                            </span>
                            {stats.isFemale && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-pink-100 text-pink-700">
                                👩 {isRtl ? 'سيدة' : 'Female'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-2 flex-wrap justify-center text-xs sm:text-sm font-bold">
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100" title={isRtl ? 'مرافقين رجال' : 'Male companions'}>
                              👨 <strong>+{stats.menAcc}</strong>
                              <span className="text-[11px] font-normal text-indigo-600">{isRtl ? 'رجال' : 'men'}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 px-2.5 py-1 rounded-lg border border-pink-100" title={isRtl ? 'مرافقات نساء' : 'Female companions'}>
                              👩 <strong>+{stats.womenAcc}</strong>
                              <span className="text-[11px] font-normal text-pink-600">{isRtl ? 'نساء' : 'women'}</span>
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-center font-black text-amber-700 bg-amber-50/30">
                          {stats.total}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => { setEditingGuest(guest); setShowGuestModal(true); }}
                              className="text-gray-400 hover:text-amber-600 p-1.5 rounded-lg transition"
                              title={isRtl ? 'تعديل بيانات الضيف' : 'Edit Guest'}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition"
                              title={isRtl ? 'حذف الضيف' : 'Delete Guest'}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const BudgetTab = () => {
    const currentinitialBudget = Number(couple?.initialBudget) || 0;
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalIncomes = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
    const remainingBudget = totalIncomes - totalExpenses;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{t.finances}</h2>
          <div className="flex gap-2">
            <button onClick={() => { setEditingIncome(null); setShowIncomeModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition shadow-sm">
              <Plus size={18} /> <span className="hidden sm:inline">{t.addIncome}</span>
            </button>
            <button onClick={() => { setEditingExpense(null); setShowExpenseModal(true); }} className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 flex items-center gap-2 transition shadow-sm">
              <Plus size={18} /> <span className="hidden sm:inline">{t.addExpense}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50"></div>
            <p className="text-blue-800 font-bold mb-2 relative z-10">{t.totalBudget}</p>
            <p className="text-2xl font-black text-blue-900 relative z-10">{totalIncomes.toLocaleString()} <span className="text-sm">{t.currency}</span></p>
          </div>
          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-100 rounded-bl-full opacity-50"></div>
            <p className="text-rose-800 font-bold mb-2 relative z-10">{t.totalExpenses}</p>
            <p className="text-2xl font-black text-rose-900 relative z-10">{totalExpenses.toLocaleString()} <span className="text-sm">{t.currency}</span></p>
          </div>
          <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full opacity-50"></div>
            <p className="text-green-800 font-bold mb-2 relative z-10">{t.remainingBudget}</p>
            <p className="text-2xl font-black text-green-900 relative z-10">{remainingBudget.toLocaleString()} <span className="text-sm">{t.currency}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-100">{t.incomes}</h3>
            <ul className="space-y-3">
              {incomes.length === 0 ? <p className="text-gray-500 text-sm">لا توجد موارد مسجلة.</p> : incomes.map((inc) => (
                <li key={inc.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl border border-gray-50 transition">
                  <div>
                    <span className="font-bold text-gray-800 block">{inc.source}</span>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">{inc.type}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-green-600 font-black">+{inc.amount.toLocaleString()}</span>
                    {inc.type !== (isRtl ? 'شخصي' : 'Personal') && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingIncome(inc); setShowIncomeModal(true); }}
                          className="text-gray-400 hover:text-green-600 transition p-1 rounded-lg"
                          title={isRtl ? 'تعديل الإيراد' : 'Edit Income'}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(inc.id)}
                          className="text-gray-300 hover:text-red-500 transition p-1 rounded-lg"
                          title={isRtl ? 'حذف الإيراد' : 'Delete Income'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-100">{t.expenses}</h3>
            <ul className="space-y-3">
              {expenses.length === 0 ? <p className="text-gray-500 text-sm">لا توجد مصروفات مسجلة.</p> : expenses.map((exp) => (
                <li key={exp.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl border border-gray-50 transition">
                  <span className="font-bold text-gray-800">{exp.item}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-rose-600 font-black">-{exp.amount.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingExpense(exp); setShowExpenseModal(true); }}
                        className="text-gray-400 hover:text-rose-600 transition p-1 rounded-lg"
                        title={isRtl ? 'تعديل المصروف' : 'Edit Expense'}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-gray-300 hover:text-red-500 transition p-1 rounded-lg"
                        title={isRtl ? 'حذف المصروف' : 'Delete Expense'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // --- 🌟 تبويب الخدمات والموردين (Services Tab) ---
  // ==========================================
  const ServicesTab = () => {
    const filteredTemplates = SERVICE_TEMPLATES.filter((item) => {
      const matchesCategory = selectedServiceCategory === 'all' || item.category === selectedServiceCategory;
      const query = serviceSearchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      return (
        matchesCategory &&
        (item.nameAr.toLowerCase().includes(query) ||
          item.nameEn.toLowerCase().includes(query) ||
          item.descriptionAr.toLowerCase().includes(query) ||
          item.descriptionEn.toLowerCase().includes(query) ||
          item.cityAr.toLowerCase().includes(query) ||
          item.cityEn.toLowerCase().includes(query))
      );
    });

    const renderCatIcon = (categoryId, size = 18) => {
      switch (categoryId) {
        case 'venues': return <Building2 size={size} />;
        case 'decor': return <Flower2 size={size} />;
        case 'sound_media': return <Music size={size} />;
        case 'photography': return <Camera size={size} />;
        case 'catering': return <UtensilsCrossed size={size} />;
        case 'rentals': return <Tent size={size} />;
        case 'beauty': return <Sparkles size={size} />;
        case 'groom_care': return <Scissors size={size} />;
        case 'invitations': return <Mail size={size} />;
        case 'car_decor': return <Car size={size} />;
        case 'furniture': return <Bed size={size} />;
        default: return <Sparkles size={size} />;
      }
    };

    const coupleDisplayName = couple.groom && couple.bride ? `${couple.groom} و ${couple.bride}` : (couple.groom || couple.bride || '');

    return (
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-400/20 rounded-full blur-xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold mb-3 border border-white/20">
                <Store size={14} />
                <span>{t.servicesDirectory}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-2">
                {isRtl ? 'دليل خدمات ومراسم الزفاف' : 'Wedding Services & Vendors Hub'}
              </h2>
              <p className="text-amber-100 text-sm sm:text-base max-w-xl font-medium">
                {isRtl
                  ? 'تصفح نخبة من قاعات الزفاف، الكوش، الصوتيات، والتصوير. تواصل فوراً عبر واتساب وأضف ما تختاره إلى خطتك.'
                  : 'Discover vetted wedding venues, koshas, audio bands, and photography. Inquire directly on WhatsApp and add to your bookings.'}
              </p>
            </div>

            {/* Quick Add Custom Vendor Button */}
            <button
              onClick={() => setShowAddCustomServiceModal(true)}
              className="bg-white text-amber-800 hover:bg-amber-50 font-bold px-5 py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2 self-start md:self-auto shrink-0"
            >
              <Plus size={18} />
              <span>{t.addCustomService}</span>
            </button>
          </div>

          {/* Sub-Tabs Switcher */}
          <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/20">
            <button
              onClick={() => setServicesSubTab('templates')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${servicesSubTab === 'templates'
                ? 'bg-white text-amber-800 shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
                }`}
            >
              <Store size={16} />
              <span>{t.servicesDirectory}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${servicesSubTab === 'templates' ? 'bg-amber-100 text-amber-800' : 'bg-white/20 text-white'
                }`}>
                {SERVICE_TEMPLATES.length}
              </span>
            </button>

            <button
              onClick={() => setServicesSubTab('myBookings')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${servicesSubTab === 'myBookings'
                ? 'bg-white text-amber-800 shadow-md'
                : 'bg-white/15 text-white hover:bg-white/25'
                }`}
            >
              <BookmarkCheck size={16} />
              <span>{t.myBookings}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${servicesSubTab === 'myBookings' ? 'bg-amber-100 text-amber-800' : 'bg-white/20 text-white'
                }`}>
                {bookedServices.length}
              </span>
            </button>
          </div>
        </div>

        {/* -------------------- 1. TAB: TEMPLATES DIRECTORY -------------------- */}
        {servicesSubTab === 'templates' && (
          <div className="space-y-6">
            {/* Search and Category Filter Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input
                  type="text"
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  placeholder={t.searchServices}
                  className={`w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
                    }`}
                />
                {serviceSearchQuery && (
                  <button
                    onClick={() => setServiceSearchQuery('')}
                    className={`absolute top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 ${isRtl ? 'left-3' : 'right-3'}`}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Categories Scrollable Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {SERVICE_CATEGORIES.map((cat) => {
                  const isActive = selectedServiceCategory === cat.id;
                  const count = cat.id === 'all'
                    ? SERVICE_TEMPLATES.length
                    : SERVICE_TEMPLATES.filter((s) => s.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedServiceCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all ${isActive
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-200 scale-[1.02]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {renderCatIcon(cat.id, 16)}
                      <span>{isRtl ? cat.labelAr : cat.labelEn}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${isActive ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Services Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                <Store size={48} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-700 text-lg mb-1">{t.noServicesFound}</h3>
                <p className="text-gray-400 text-sm mb-4">جرب البحث بكلمة مختلفة أو تغيير الفئة المحددة</p>
                <button
                  onClick={() => { setSelectedServiceCategory('all'); setServiceSearchQuery(''); }}
                  className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl text-sm font-bold hover:bg-amber-200 transition"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((item) => {
                  const isBooked = bookedServices.some((b) => b.templateId === item.id);
                  const whatsAppLink = createWhatsAppInquiryLink(
                    item.whatsapp,
                    isRtl ? item.nameAr : item.nameEn,
                    couple.date,
                    coupleDisplayName
                  );

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col group"
                    >
                      {/* Image Header with Badges */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <img
                          src={item.images[0]}
                          alt={item.nameAr}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                        {/* Top Badges */}
                        <div className="absolute top-3 inset-x-3 flex justify-between items-center pointer-events-none">
                          <span className="bg-white/90 backdrop-blur-md text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            {renderCatIcon(item.category, 14)}
                            <span>
                              {isRtl
                                ? SERVICE_CATEGORIES.find((c) => c.id === item.category)?.labelAr
                                : SERVICE_CATEGORIES.find((c) => c.id === item.category)?.labelEn}
                            </span>
                          </span>

                          <span className="bg-amber-600/95 backdrop-blur-md text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                            {isRtl ? item.badgeAr : item.badgeEn}
                          </span>
                        </div>

                        {/* Bottom image overlay: Preview button and rating */}
                        <div className="absolute bottom-3 inset-x-3 flex justify-between items-center text-white">
                          <button
                            onClick={() => setActivePhotoGallery(item)}
                            className="bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <Eye size={13} />
                            <span>{t.viewPhotos} ({item.images.length})</span>
                          </button>

                          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span>{item.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-extrabold text-gray-900 text-lg leading-snug group-hover:text-amber-700 transition">
                              {isRtl ? item.nameAr : item.nameEn}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
                            <MapPin size={14} className="text-amber-600 shrink-0" />
                            <span>{isRtl ? item.cityAr : item.cityEn}</span>
                          </div>

                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                            {isRtl ? item.descriptionAr : item.descriptionEn}
                          </p>

                          {/* Price Estimate pill */}
                          <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl px-3 py-2 flex items-center justify-between">
                            <span className="text-xs text-amber-800 font-bold">{t.priceEstimate}:</span>
                            <span className="text-xs font-black text-amber-900">
                              {isRtl ? item.priceEstimateAr : item.priceEstimateEn}
                            </span>
                          </div>

                          {/* Feature tags */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(isRtl ? item.featuresAr : item.featuresEn).slice(0, 2).map((feat, i) => (
                              <span
                                key={i}
                                className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-0.5 rounded-lg"
                              >
                                • {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          {/* Top Row: WhatsApp Chat + Call */}
                          <div className="flex items-center gap-2">
                            <a
                              href={whatsAppLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition"
                            >
                              <MessageCircle size={16} />
                              <span>{t.contactWhatsApp}</span>
                            </a>

                            <a
                              href={`tel:${item.phone}`}
                              className="border border-gray-200 hover:border-amber-500 hover:bg-amber-50 text-gray-700 hover:text-amber-800 p-2.5 rounded-xl transition flex items-center justify-center"
                              title={t.callPhone}
                            >
                              <Phone size={16} />
                            </a>
                          </div>

                          {/* Bottom Row: Add to My Bookings toggle */}
                          <button
                            onClick={() => handleToggleBooking(item)}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${isBooked
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                              : 'bg-gray-50 text-gray-700 hover:bg-amber-50 hover:text-amber-800 border border-gray-200'
                              }`}
                          >
                            {isBooked ? (
                              <>
                                <Check size={14} />
                                <span>{t.inBookings}</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus size={14} />
                                <span>{t.addToBookings}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* -------------------- 2. TAB: MY BOOKINGS -------------------- */}
        {servicesSubTab === 'myBookings' && (
          <div className="space-y-6">
            {bookedServices.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookmarkCheck size={32} />
                </div>
                <h3 className="font-extrabold text-gray-800 text-xl mb-2">{t.noBookingsYet}</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                  {t.startBrowsing}
                </p>
                <button
                  onClick={() => setServicesSubTab('templates')}
                  className="bg-amber-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-amber-700 shadow-md transition inline-flex items-center gap-2"
                >
                  <Store size={18} />
                  <span>{t.servicesDirectory}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bookings Summary Header */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-100 text-amber-800 font-black px-3 py-1 rounded-xl text-sm">
                      {bookedServices.length} {t.myBookingsCount}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {isRtl ? 'قائمتك لمتابعة عقود وحجوزات الزفاف' : 'Track your vendor contracts and reservations'}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowAddCustomServiceModal(true)}
                    className="text-amber-700 hover:text-amber-800 font-bold text-xs sm:text-sm flex items-center gap-1.5"
                  >
                    <Plus size={16} />
                    <span>{t.addCustomService}</span>
                  </button>
                </div>

                {/* Bookings List Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookedServices.map((booking) => {
                    const whatsAppLink = createWhatsAppInquiryLink(
                      booking.whatsapp,
                      booking.name,
                      couple.date,
                      coupleDisplayName
                    );

                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                      >
                        <div className="flex gap-4">
                          {booking.image && (
                            <img
                              src={booking.image}
                              alt={booking.name}
                              className="w-20 h-20 rounded-2xl object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1">
                                {renderCatIcon(booking.category, 12)}
                                <span>
                                  {isRtl
                                    ? SERVICE_CATEGORIES.find((c) => c.id === booking.category)?.labelAr || booking.category
                                    : SERVICE_CATEGORIES.find((c) => c.id === booking.category)?.labelEn || booking.category}
                                </span>
                              </span>

                              <button
                                onClick={() => handleDeleteBookedService(booking.id)}
                                className="text-gray-300 hover:text-rose-600 transition p-1"
                                title="حذف من الحجوزات"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <h4 className="font-extrabold text-gray-900 text-base truncate mb-1">
                              {booking.name}
                            </h4>

                            <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                              <MapPin size={12} className="text-amber-600" />
                              <span>{booking.city || (isRtl ? 'غير محدد' : 'N/A')}</span>
                            </div>

                            {booking.agreedCost && (
                              <div className="text-xs font-bold text-gray-700">
                                <span>{t.agreedCost}: </span>
                                <span className="text-amber-700 font-black">{booking.agreedCost}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status selector + Contact buttons */}
                        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                          {/* Status Pill Dropdown */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-semibold">{t.bookingStatus}:</span>
                            <select
                              value={booking.status || 'confirmed'}
                              onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                              className={`text-xs font-bold rounded-xl px-2.5 py-1 border outline-none cursor-pointer ${booking.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : booking.status === 'negotiating'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}
                            >
                              <option value="confirmed">{t.statusConfirmed}</option>
                              <option value="negotiating">{t.statusNegotiating}</option>
                              <option value="inquiry">{t.statusInquiry}</option>
                            </select>
                          </div>

                          {/* Quick WhatsApp & Call triggers */}
                          <div className="flex items-center gap-2">
                            {booking.whatsapp && (
                              <a
                                href={whatsAppLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-emerald-200"
                              >
                                <MessageCircle size={14} />
                                <span>واتساب</span>
                              </a>
                            )}
                            {booking.phone && (
                              <a
                                href={`tel:${booking.phone}`}
                                className="bg-gray-50 text-gray-700 hover:bg-amber-500 hover:text-white px-2.5 py-1.5 rounded-xl text-xs transition border border-gray-200"
                              >
                                <Phone size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // --- التحقق من طلب بوابة اللجنة الميدانية المستقلة (وصول فوري للأعضاء والمتطوعين بدون حساب) ---
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPortalRequested = urlParams && (urlParams.get('portal') === 'committee' || !!urlParams.get('committeeId'));
  const portalCommitteeId = urlParams ? urlParams.get('committeeId') : null;
  const portalCdata = urlParams ? urlParams.get('cdata') : null;

  if (isPortalRequested) {
    let resolvedCommittee = publicPortalCommittee;
    let weddingTitle = 'العرس الجماعي الخيري';
    let weddingDate = '';
    let organizer = 'اللجنة العليا المنظمة';

    // 1. إذا لم يُجلب بعد، فحص cdata المضمن في الرابط
    if (!resolvedCommittee && portalCdata) {
      resolvedCommittee = decodeCommitteePortalData(portalCdata);
    }

    // 2. فحص ذاكرة اللجان الحالية
    if (!resolvedCommittee && portalCommitteeId) {
      const findInList = (list) => (list || []).find((c) => c.id === portalCommitteeId);
      resolvedCommittee = findInList(massWeddingData?.committees);
    }

    // 3. فحص التخزين المباشر للجنة
    if (!resolvedCommittee && portalCommitteeId) {
      try {
        const directCom = localStorage.getItem(`maraseem_com_${portalCommitteeId}`);
        if (directCom) {
          resolvedCommittee = JSON.parse(directCom);
        }
      } catch (e) { }
    }

    // 4. فحص كاش العرس الجماعي
    if (!resolvedCommittee && portalCommitteeId) {
      try {
        const cached = localStorage.getItem('maraseem_latest_mass_wedding_data');
        if (cached) {
          const parsed = JSON.parse(cached);
          resolvedCommittee = (parsed?.committees || []).find((c) => c.id === portalCommitteeId);
        }
      } catch (e) { }
    }

    if (resolvedCommittee) {
      weddingTitle = resolvedCommittee.weddingTitle || massWeddingData?.info?.title || weddingTitle;
      weddingDate = resolvedCommittee.weddingDate || massWeddingData?.info?.date || weddingDate;
      organizer = resolvedCommittee.organizer || massWeddingData?.info?.organizer || organizer;
    }

    // شاشة تحميل أنيقة أثناء جلب البيانات السحابية العامة
    if (isPublicPortalLoading && !resolvedCommittee) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-black text-2xl shadow-lg">
              م
            </div>
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mt-2"></div>
            <h3 className="font-black text-lg text-white">جاري فتح بوابة اللجنة الميدانية...</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              يتم جلب بيانات وتوجيهات لجنتك مباشرة بدون الحاجة لتسجيل دخول
            </p>
          </div>
        </div>
      );
    }

    // عرض بوابة اللجنة مباشرة (منع الانتقال لصفحة تسجيل الدخول نهائياً)
    return (
      <CommitteePortalView
        committee={resolvedCommittee}
        weddingTitle={weddingTitle}
        weddingDate={weddingDate}
        organizer={organizer}
        isStandalone={true}
        isRtl={isRtl}
      />
    );
  }

  // Auth loading check
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-bold">{isRtl ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Auth check
  const handleAuthSuccess = () => {
    // بعد تسجيل الدخول بنجاح، أعد توجيه المستخدم إلى شاشة اختيار الوضع (عرس فردي أو جماعي)
    console.log('تم تسجيل الدخول بنجاح، جاري إعادة التوجيه...');
    setUser(auth.currentUser);
  };
  if (!user) {
    return (
      <Auth
        onLoginSuccess={handleAuthSuccess}
        isRtl={isRtl}
        lang={lang}
        onToggleLang={toggleLang}
      />
    );
  }

  // 1. Wedding Mode Selector check (إذا لم يتم اختيار نوع الزواج بعد)
  if (!weddingMode) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className={`min-h-screen bg-gradient-to-b from-[#fdfbf7] via-amber-50/40 to-[#fdfbf7] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans ${isRtl ? 'font-arabic' : ''}`}>
        <WeddingModeSelector
          onSelectMode={handleSelectMode}
          currentMode={weddingMode}
          isRtl={isRtl}
        />
      </div>
    );
  }

  // 2. Setup check (فقط إذا كان وضع فردي ولم تكتمل بيانات العروسين)
  if (weddingMode === 'individual' && !isSetupComplete) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className={`min-h-screen bg-amber-50 flex items-center justify-center p-4 font-sans ${isRtl ? 'font-arabic' : ''}`}>
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-amber-100">
          <div className="text-center mb-8">
            <CalendarHeart size={48} className="text-amber-500 mx-auto mb-4" />
            <h1 className="text-3xl font-extrabold text-amber-900 mb-2">{t.appName}</h1>
            <p className="text-gray-500 font-medium">{t.welcomeSetup}</p>
          </div>

          <form onSubmit={handleSetupSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.groomName}</label>
              <input type="text" name="groom" defaultValue={couple.groom} required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50 text-gray-800" placeholder="عمر" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.brideName}</label>
              <input type="text" name="bride" defaultValue={couple.bride} required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50 text-gray-800" placeholder="فاطمة" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.weddingDate}</label>
              <input type="date" name="date" defaultValue={couple.date} min={todayStr} required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50 text-gray-800" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.initialBudget} ({t.currency})</label>
              <input type="number" name="budget" defaultValue={couple.initialBudget} required min="0" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50 text-gray-800" placeholder="2500000" />
            </div>
            <button type="submit" className="w-full bg-amber-600 text-white font-bold text-lg py-3 rounded-xl hover:bg-amber-700 transition shadow-lg mt-4">
              {t.startPlanning}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
            <button
              type="button"
              onClick={() => handleSelectMode(null)}
              className="text-amber-700 hover:text-amber-800 font-bold hover:underline"
            >
              {isRtl ? '← العودة لاختيار نوع الزواج' : '← Change Wedding Mode'}
            </button>
            <button
              type="button"
              onClick={toggleLang}
              className="text-gray-500 hover:text-amber-600 underline decoration-dotted"
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Setup check (إذا كان وضع عرس جماعي ولم يتم إعداد الفعالية بعد)
  if (weddingMode === 'mass' && !massWeddingData?.info?.isConfigured) {
    return (
      <MassWeddingSetupScreen
        initialData={massWeddingData?.info}
        onSave={handleSaveMassWeddingSetup}
        onSwitchToIndividual={() => handleSelectMode('individual')}
        onSwitchMode={() => handleSelectMode(null)}
        isRtl={isRtl}
        lang={lang}
        onToggleLang={toggleLang}
      />
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#fdfbf7] text-gray-800 font-sans antialiased">
      <nav className="relative bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex justify-between h-14 sm:h-16 items-center gap-1 sm:gap-4">

          {/* Left: Profile Menu Button (الزر الوحيد الآن لفتح القائمة) */}
          <div className="relative profile-menu-container shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
              className="flex items-center gap-2 sm:gap-3 rounded-full border border-gray-200 bg-white p-1 sm:px-2 sm:py-1 hover:shadow-sm transition"
            >
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs sm:text-base">
                {profileInfo.username ? profileInfo.username[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold text-gray-800">{profileInfo.username || 'ضيفنا'}</span>
                <span className="text-xs text-gray-500 truncate">{profileInfo.email || t.appName}</span>
              </div>
            </button>
          </div>

          {/* Center: App Logo & Name */}
          <button
            type="button"
            onClick={() => {
              if (weddingMode === 'mass') {
                setMassActiveTab('overview');
              } else {
                setActiveTab('dashboard');
              }
              setIsProfileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label={isRtl ? 'العودة إلى الصفحة الرئيسية' : 'Go to homepage'}
            className="sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 flex items-center gap-1.5 sm:gap-2 text-amber-700 font-extrabold text-lg sm:text-2xl rounded-full px-2 py-1 hover:bg-amber-50 transition focus:outline-none focus:ring-2 focus:ring-amber-300 shrink-0"
          >
            <CalendarHeart size={20} className="text-amber-500 sm:w-6 sm:h-6" />
            <span className="truncate">{t.appName}</span>
          </button>

          {/* Right: Mode Switcher Slider in Top Corner & Language Switch Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {weddingMode && (
              <div className="inline-flex p-0.5 bg-gray-100/90 rounded-full border border-gray-200/80 shadow-inner shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectMode('individual')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black transition-all ${weddingMode === 'individual'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                    }`}
                  title={isRtl ? 'زواج فردي' : 'Individual Wedding'}
                >
                  <CalendarHeart size={12} className={weddingMode === 'individual' ? 'text-rose-600' : 'text-gray-400'} />
                  <span className="hidden xs:inline">{isRtl ? 'فردي' : 'Solo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectMode('mass')}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black transition-all ${weddingMode === 'mass'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                    }`}
                  title={isRtl ? 'عرس جماعي' : 'Mass Wedding'}
                >
                  <Users size={12} className={weddingMode === 'mass' ? 'text-white' : 'text-gray-400'} />
                  <span className="hidden xs:inline">{isRtl ? 'جماعي' : 'Mass'}</span>
                </button>
              </div>
            )}

            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition border border-gray-200 bg-white text-xs sm:text-sm font-medium"
              title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <Globe size={15} />
              <span className="text-xs">
                {lang === 'ar' ? 'EN' : 'عر'}
              </span>
            </button>
          </div>
        </div>

        {/* --- القائمة الجانبية الموحدة (Unified Mobile Drawer) --- */}
        {isProfileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* 1. الخلفية السوداء المعتمة */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsProfileMenuOpen(false)}
            ></div>

            {/* 2. النافذة الجانبية (يمين للعربي، يسار للإنجليزي) */}
            <div
              className={`relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col ${isRtl ? 'left-0 ml-auto' : 'right-0 mr-auto'}`}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Header: Mode Slider in Top Corner & Close Button */}
              <div className="p-3.5 px-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                {weddingMode ? (
                  <div className="inline-flex p-0.5 bg-gray-100/90 rounded-full border border-gray-200/80 shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleSelectMode('individual')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black transition-all ${weddingMode === 'individual'
                        ? 'bg-white text-rose-600 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      <CalendarHeart size={12} className={weddingMode === 'individual' ? 'text-rose-600' : 'text-gray-400'} />
                      <span>{isRtl ? 'زواج فردي' : 'Individual'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectMode('mass')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black transition-all ${weddingMode === 'mass'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      <Users size={12} className={weddingMode === 'mass' ? 'text-white' : 'text-gray-400'} />
                      <span>{isRtl ? 'عرس جماعي' : 'Mass'}</span>
                    </button>
                  </div>
                ) : <div />}

                {/* زر إغلاق القائمة (X) */}
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* --- المنطقة القابلة للتمرير --- */}
              <div className="flex-1 overflow-y-auto pb-6 flex flex-col">

                {/* القسم الأول: بيانات البروفايل */}
                {!isProfileEditMode ? (
                  <div className="p-6 flex flex-col items-center text-center border-b border-gray-100 relative mt-4">
                    <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-3xl mb-3 shadow-inner">
                      {profileInfo.username ? profileInfo.username[0].toUpperCase() : 'U'}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{profileInfo.username || 'ضيفنا'}</h3>
                    <p className="text-sm text-gray-500 mb-2">{profileInfo.email || 'لا يوجد بريد إلكتروني'}</p>
                    <p className="text-sm text-gray-800 font-medium mb-2" dir="ltr">{profileInfo.phone || '-'}</p>

                    {profileInfo.bio && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl w-full mb-4">
                        {profileInfo.bio}
                      </p>
                    )}

                    <button
                      onClick={() => setIsProfileEditMode(true)}
                      className="bg-amber-100 text-amber-700 px-6 py-1.5 rounded-full text-sm font-bold hover:bg-amber-200 transition mt-2"
                    >
                      {isRtl ? 'تعديل البيانات' : 'Edit Profile'}
                    </button>
                  </div>
                ) : (
                  /* نموذج التعديل (نسخة مطابقة لكودك السابق) */
                  <form className="p-6 space-y-4 border-b border-gray-100 mt-4">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 text-center">{isRtl ? 'تعديل البيانات' : 'Edit Profile'}</h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{isRtl ? 'اسم المستخدم' : 'Username'}</label>
                      <input type="text" value={profileInfo.username} onChange={(e) => handleProfileInfoChange('username', e.target.value)} className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{isRtl ? 'الهاتف' : 'Phone'}</label>
                      <input type="text" value={profileInfo.phone} onChange={(e) => handleProfileInfoChange('phone', e.target.value)} className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{isRtl ? 'معلومات إضافية' : 'Bio'}</label>
                      <textarea value={profileInfo.bio} onChange={(e) => handleProfileInfoChange('bio', e.target.value)} rows={3} className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-4">
                      <button type="button" onClick={() => setIsProfileEditMode(false)} className="flex-1 px-3 py-2 text-sm font-semibold text-gray-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition">{t.cancel}</button>
                      <button type="button" onClick={handleProfileSave} className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-2xl bg-amber-600 hover:bg-amber-700 transition">{isRtl ? 'حفظ' : 'Save'}</button>
                    </div>
                  </form>
                )}



                {/* القسم الثاني: تبويبات التنقل (تظهر فقط في الجوال لأن الديسكتوب فيه الشريط الجانبي) */}
                <div className="p-4 md:hidden">
                  <h4 className="text-xs font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">
                    {weddingMode === 'mass'
                      ? (isRtl ? 'أقسام العرس الجماعي' : 'Mass Wedding Sections')
                      : (isRtl ? 'القائمة الرئيسية' : 'Main Menu')}
                  </h4>
                  <ul className="space-y-1">
                    {(weddingMode === 'mass' ? massNavItems : navItems).map((item) => {
                      const isActive = weddingMode === 'mass'
                        ? massActiveTab === item.id
                        : activeTab === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => {
                              if (weddingMode === 'mass') {
                                setMassActiveTab(item.id);
                              } else {
                                setActiveTab(item.id);
                              }
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${isActive
                              ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200/50'
                              : 'text-gray-600 font-medium hover:bg-gray-50'
                              }`}
                          >
                            <div className={isActive ? 'text-amber-600' : 'text-gray-400'}>{item.icon}</div>
                            <span>{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* --- القسم الثالث: اللغة وتسجيل الخروج (ثابت في الأسفل) --- */}
              <div className="p-4 border-t border-gray-100 bg-white flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                <button onClick={toggleLang} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition">
                  <Globe size={18} />
                  <span>{isRtl ? 'English' : 'العربية'}</span>
                </button>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition">
                  {isRtl ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* تنبيه قواعد أمان فايربيس في حال رفض السيرفر */}
      {firestorePermissionError && (
        <div className="bg-amber-500/10 border-b border-amber-300 text-amber-900 px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2 max-w-5xl">
            <AlertCircle className="text-amber-600 shrink-0" size={18} />
            <span>
              {isRtl
                ? 'ملاحظة مزامنة السيرفر: تم حفظ بياناتك محلياً على جهازك ولن تضيع! قاعدة بيانات Firebase ترفض الكتابة حالياً بسبب قيود قواعد الأمان (Missing or insufficient permissions). يُرجى تفعيل القواعد في Firebase Console.'
                : 'Server Sync Notice: Your data is safely saved locally! Firebase is currently rejecting server writes due to security rules. Please update your Firestore Rules in Firebase Console.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFirestorePermissionError(false)}
            className="text-amber-800 hover:text-black font-bold px-2 py-1 rounded bg-amber-200/50 hover:bg-amber-200 transition text-xs shrink-0"
          >
            {isRtl ? 'إغلاق' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {weddingMode === 'mass' ? (
          <div className="flex gap-6 lg:gap-8">
            {/* Mass Wedding Desktop Sidebar */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-5 sticky top-24">
                <div className="text-[11px] font-black text-amber-900/60 uppercase px-3 mb-2 tracking-wider">
                  {isRtl ? 'أقسام العرس الجماعي' : 'Mass Wedding'}
                </div>
                <ul className="space-y-1.5">
                  {massNavItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setMassActiveTab(item.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-xs font-bold ${massActiveTab === item.id
                          ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 font-black shadow-2xs border border-amber-200/60'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        <div className={massActiveTab === item.id ? 'text-amber-600' : 'text-gray-400'}>
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Mass Wedding Main Content */}
            <main className="flex-1 min-w-0 pb-16">
              <MassWeddingDashboard
                data={massWeddingData}
                onUpdateData={handleUpdateMassWeddingData}
                onOpenSettings={() => setShowMassSetupModal(true)}
                onSwitchMode={() => setShowModeSelectorModal(true)}
                isRtl={isRtl}
                lang={lang}
                generateWithGemini={generateWithGemini}
                activeTab={massActiveTab}
                onTabChange={setMassActiveTab}
              />
            </main>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sticky top-24">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 font-black' : 'text-gray-500 font-bold hover:bg-gray-50'
                          }`}
                      >
                        <div className={activeTab === item.id ? 'text-amber-600' : 'text-gray-400'}>{item.icon}</div>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0 pb-12">
              {activeTab === 'dashboard' && DashboardTab()}
              {activeTab === 'planning' && PlanningTab()}
              {activeTab === 'guests' && GuestsTab()}
              {activeTab === 'budget' && BudgetTab()}
              {activeTab === 'team' && TeamTab()}
              {activeTab === 'services' && ServicesTab()}
            </main>
          </div>
        )}
      </div>

      {/* --- MODALS SECTION --- */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editingGuest ? (isRtl ? 'تعديل بيانات الضيف' : 'Edit Guest') : t.addGuest}
            </h3>
            <form key={editingGuest ? editingGuest.id : 'new-guest'} onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              const menAcc = Math.max(0, Number(formData.get('menAccompanying')) || 0);
              const womenAcc = Math.max(0, Number(formData.get('womenAccompanying')) || 0);
              const totalAcc = menAcc + womenAcc;
              const gender = formData.get('gender') || 'male';

              const guestData = {
                id: editingGuest ? editingGuest.id : Date.now(),
                name: formData.get('name'),
                side: formData.get('side'),
                gender: gender,
                menAccompanying: menAcc,
                womenAccompanying: womenAcc,
                accompanying: totalAcc,
                status: editingGuest ? (editingGuest.status || 'pending') : 'pending'
              };

              let updatedGuests;
              if (editingGuest) {
                updatedGuests = guests.map(g => g.id === editingGuest.id ? { ...g, ...guestData } : g);
              } else {
                updatedGuests = [...guests, guestData];
              }

              setGuests(updatedGuests);
              setShowGuestModal(false);
              setEditingGuest(null);
              await saveUserField('guests', updatedGuests);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.guestName}</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingGuest?.name || ''}
                  required
                  placeholder={isRtl ? 'مثال: سالم باوزير أو عائلة فلان' : 'e.g. Salem Bawazir'}
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                />
              </div>

              {/* تقسيم أهل العريس والعروسة كما هو تماماً + صفة الممثل */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{isRtl ? 'الجهة' : 'Side'}</label>
                  <select name="side" defaultValue={editingGuest?.side || 'groomSide'} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold">
                    <option value="groomSide">{t.groomSide}</option>
                    <option value="brideSide">{t.brideSide}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{isRtl ? 'صفة الممثل' : 'Rep. Gender'}</label>
                  <select name="gender" defaultValue={editingGuest?.gender || 'male'} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold">
                    <option value="male">{isRtl ? '👨 رجل' : '👨 Male'}</option>
                    <option value="female">{isRtl ? '👩 سيدة / امرأة' : '👩 Female'}</option>
                  </select>
                </div>
              </div>

              {/* قسم المرافقين مقسوم إلى رجال ونساء */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-black text-amber-900">
                    {t.accompanying} ({isRtl ? 'المرافقين الإضافيين' : 'Plus-Ones'})
                  </label>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {isRtl ? 'رجال ونساء' : 'Men & Women'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 mb-1">
                      {isRtl ? '👨 مرافقين (رجال)' : '👨 Men'}
                    </label>
                    <input
                      type="number"
                      name="menAccompanying"
                      defaultValue={editingGuest?.menAccompanying !== undefined ? editingGuest.menAccompanying : (editingGuest?.accompanying !== undefined ? editingGuest.accompanying : 0)}
                      min="0"
                      className="w-full border border-indigo-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none font-bold bg-white text-indigo-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-pink-900 mb-1">
                      {isRtl ? '👩 مرافقات (نساء)' : '👩 Women'}
                    </label>
                    <input
                      type="number"
                      name="womenAccompanying"
                      defaultValue={editingGuest?.womenAccompanying !== undefined ? editingGuest.womenAccompanying : 0}
                      min="0"
                      className="w-full border border-pink-200 rounded-xl p-2.5 focus:ring-2 focus:ring-pink-500 outline-none font-bold bg-white text-pink-950"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-amber-800/80 font-medium">
                  {isRtl
                    ? '* إجمالي الدعوة = ممثل العائلة (1) + عدد المرافقين (رجال ونساء)'
                    : '* Total invite attendees = Representative (1) + Companions (Men & Women)'}
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setShowGuestModal(false); setEditingGuest(null); }} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition">
                  {editingGuest ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editingExpense ? (isRtl ? 'تعديل المصروف' : 'Edit Expense') : t.addExpense}
            </h3>
            <form key={editingExpense ? editingExpense.id : 'new-exp'} onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              const expenseData = {
                id: editingExpense ? editingExpense.id : Date.now(),
                item: formData.get('item'),
                amount: Number(formData.get('amount')) || 0
              };

              let updatedExpenses;
              if (editingExpense) {
                updatedExpenses = expenses.map(exp => exp.id === editingExpense.id ? { ...exp, ...expenseData } : exp);
              } else {
                updatedExpenses = [...expenses, expenseData];
              }

              setExpenses(updatedExpenses);
              setShowExpenseModal(false);
              setEditingExpense(null);
              await saveUserField('expenses', updatedExpenses);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.itemName}</label>
                <input type="text" name="item" defaultValue={editingExpense?.item || ''} required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.cost} ({t.currency})</label>
                <input type="number" name="amount" defaultValue={editingExpense?.amount || ''} required min="0" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 outline-none font-bold" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setShowExpenseModal(false); setEditingExpense(null); }} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition">
                  {editingExpense ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editingIncome ? (isRtl ? 'تعديل الإيراد' : 'Edit Income') : t.addIncome}
            </h3>
            <form key={editingIncome ? editingIncome.id : 'new-inc'} onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              const incomeData = {
                id: editingIncome ? editingIncome.id : Date.now(),
                source: formData.get('source'),
                type: formData.get('type'),
                amount: Number(formData.get('amount')) || 0
              };

              let updatedIncomes;
              if (editingIncome) {
                updatedIncomes = incomes.map(inc => inc.id === editingIncome.id ? { ...inc, ...incomeData } : inc);
              } else {
                updatedIncomes = [...incomes, incomeData];
              }

              setIncomes(updatedIncomes);
              setShowIncomeModal(false);
              setEditingIncome(null);
              await saveUserField('incomes', updatedIncomes);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.incomeSource}</label>
                <input type="text" name="source" defaultValue={editingIncome?.source || ''} placeholder="مثال: عانية من الأصدقاء" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.incomeType}</label>
                <input type="text" name="type" defaultValue={editingIncome?.type || ''} placeholder="مثال: هدية، سلف، ادخار" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.cost} ({t.currency})</label>
                <input type="number" name="amount" defaultValue={editingIncome?.amount || ''} required min="0" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none font-bold" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setShowIncomeModal(false); setEditingIncome(null); }} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition">
                  {editingIncome ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editingEvent ? (isRtl ? 'تعديل الفعالية' : 'Edit Event') : t.addEvent}
            </h3>
            <form key={editingEvent ? editingEvent.id : 'new-event'} onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              const eventData = {
                id: editingEvent ? editingEvent.id : Date.now(),
                title: formData.get('title'),
                titleKey: editingEvent?.titleKey,
                date: formData.get('date'),
                location: formData.get('location'),
                notes: formData.get('notes'),
                completed: editingEvent ? editingEvent.completed : false
              };

              let updatedEvents;
              if (editingEvent) {
                updatedEvents = events.map(ev => ev.id === editingEvent.id ? { ...ev, ...eventData } : ev);
              } else {
                updatedEvents = [...events, eventData];
              }

              setEvents(updatedEvents);
              setShowEventModal(false);
              setEditingEvent(null);
              await saveUserField('events', updatedEvents);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.eventTitle}</label>
                <input type="text" name="title" defaultValue={editingEvent ? (editingEvent.title || (editingEvent.titleKey ? t[editingEvent.titleKey] : '')) : ''} placeholder="مثال: سمرة العريس، غسلة العروس" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.eventDate}</label>
                <input type="date" name="date" defaultValue={editingEvent?.date || ''} min={todayStr} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.eventLocation}</label>
                <input type="text" name="location" defaultValue={editingEvent?.location || ''} placeholder="مكان إقامة الفعالية" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.notes}</label>
                <textarea name="notes" defaultValue={editingEvent?.notes || ''} rows="2" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none resize-none font-medium"></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setShowEventModal(false); setEditingEvent(null); }} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition">
                  {editingEvent ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editingTeam ? (isRtl ? 'تعديل الفريق' : 'Edit Team') : t.addTeam}
            </h3>
            <form key={editingTeam ? editingTeam.id : 'new-team'} onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              const teamData = {
                id: editingTeam ? editingTeam.id : Date.now(),
                name: formData.get('name'),
                leader: formData.get('leader'),
                phone: formData.get('phone'),
                tasks: formData.get('tasks'),
                members: editingTeam?.members || []
              };

              let updatedTeams;
              if (editingTeam) {
                updatedTeams = teams.map(tm => tm.id === editingTeam.id ? { ...tm, ...teamData } : tm);
              } else {
                updatedTeams = [...teams, teamData];
              }

              setTeams(updatedTeams);
              setShowTeamModal(false);
              setEditingTeam(null);
              await saveUserField('teams', updatedTeams);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.teamName}</label>
                <input type="text" name="name" defaultValue={editingTeam?.name || ''} placeholder="مثال: فريق الشرح" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.teamLeader}</label>
                <input type="text" name="leader" defaultValue={editingTeam?.leader || ''} placeholder="اسم مسؤول الفريق" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{isRtl ? 'رقم الهاتف' : 'Phone Number'}</label>
                <input type="tel" name="phone" defaultValue={editingTeam?.phone || ''} placeholder="رقم هاتف مسؤول الفريق" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.teamTasks}</label>
                <textarea name="tasks" defaultValue={editingTeam?.tasks || ''} placeholder="المهام المنوطة بالفريق..." required rows="2" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium"></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => { setShowTeamModal(false); setEditingTeam(null); }} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
                  {editingTeam ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTeamMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{t.addMember}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              // 1. تجهيز بيانات الفرد الجديد
              const newMember = {
                id: Date.now(),
                name: formData.get('memberName'), // تأكد من اسم حقل الاسم عندك
              };

              // 2. تحديث قائمة الفرق (نبحث عن الفريق ونضيف الفرد داخله)
              const updatedTeams = teams.map(team => {
                if (team.id === showTeamMemberModal) {
                  return { ...team, members: [...team.members, newMember] };
                }
                return team;
              });

              setTeams(updatedTeams);
              setShowTeamMemberModal(null);
              await saveUserField('teams', updatedTeams);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.memberName}</label>
                <input type="text" name="memberName" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowTeamMemberModal(null)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 🖼️ مودال استعراض صور الخدمة (Photo Gallery Modal) --- */}
      {activePhotoGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg sm:text-xl">
                  {isRtl ? activePhotoGallery.nameAr : activePhotoGallery.nameEn}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <MapPin size={12} className="text-amber-600" />
                  <span>{isRtl ? activePhotoGallery.cityAr : activePhotoGallery.cityEn}</span>
                  <span>•</span>
                  <span className="text-amber-700 font-bold">
                    {isRtl ? activePhotoGallery.priceEstimateAr : activePhotoGallery.priceEstimateEn}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActivePhotoGallery(null)}
                className="p-2 text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Image Slider / Gallery Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePhotoGallery.images.map((imgUrl, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video group shadow-sm">
                    <img
                      src={imgUrl}
                      alt={`${activePhotoGallery.nameAr} - ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 mt-4">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {isRtl ? activePhotoGallery.descriptionAr : activePhotoGallery.descriptionEn}
                </p>
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  handleToggleBooking(activePhotoGallery);
                }}
                className="text-xs sm:text-sm font-bold text-gray-700 hover:text-amber-800 px-4 py-2.5 rounded-xl border border-gray-200 bg-white transition flex items-center gap-1.5"
              >
                {bookedServices.some(b => b.templateId === activePhotoGallery.id) ? (
                  <>
                    <Check size={16} className="text-emerald-600" />
                    <span>{t.inBookings}</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={16} />
                    <span>{t.addToBookings}</span>
                  </>
                )}
              </button>

              <a
                href={createWhatsAppInquiryLink(
                  activePhotoGallery.whatsapp,
                  isRtl ? activePhotoGallery.nameAr : activePhotoGallery.nameEn,
                  couple.date,
                  couple.groom && couple.bride ? `${couple.groom} و ${couple.bride}` : ''
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition"
              >
                <MessageCircle size={16} />
                <span>{t.contactWhatsApp}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* --- ➕ مودال إضافة مزود خدمة خاص (Add Custom Service Modal) --- */}
      {showAddCustomServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Store size={22} className="text-amber-600" />
                <h3 className="text-xl font-bold text-gray-900">{t.addCustomService}</h3>
              </div>
              <button
                onClick={() => setShowAddCustomServiceModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSaveCustomService({
                  name: formData.get('name'),
                  category: formData.get('category'),
                  city: formData.get('city'),
                  phone: formData.get('phone'),
                  whatsapp: formData.get('whatsapp') || formData.get('phone'),
                  agreedCost: formData.get('agreedCost'),
                  status: formData.get('status'),
                  notes: formData.get('notes'),
                  image: formData.get('image') || null
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.serviceProviderName} *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="مثال: قاعة ومخدرة التاج"
                  className="w-full border border-gray-300 rounded-2xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t.serviceCategory} *</label>
                  <select
                    name="category"
                    required
                    className="w-full border border-gray-300 rounded-2xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    {SERVICE_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>
                        {isRtl ? c.labelAr : c.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t.cityLocation}</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="مثال: المكلا - فوه"
                    className="w-full border border-gray-300 rounded-2xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t.phoneNumber} *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+967 77X XXX XXX"
                    dir="ltr"
                    className="w-full border border-gray-300 rounded-2xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رقم واتساب (اختياري)</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    placeholder="96777XXXXXXX"
                    dir="ltr"
                    className="w-full border border-gray-300 rounded-2xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t.agreedCost}</label>
                  <input
                    type="text"
                    name="agreedCost"
                    placeholder="مثال: 450,000"
                    className="w-full border border-gray-300 rounded-2xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{t.bookingStatus}</label>
                  <select
                    name="status"
                    className="w-full border border-gray-300 rounded-2xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                  >
                    <option value="confirmed">{t.statusConfirmed}</option>
                    <option value="negotiating">{t.statusNegotiating}</option>
                    <option value="inquiry">{t.statusInquiry}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رابط صورة (اختياري)</label>
                <input
                  type="url"
                  name="image"
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-2xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.notes}</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="أي تفاصيل خاصة بالاتفاق أو الشروط..."
                  className="w-full border border-gray-300 rounded-2xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomServiceModal(false)}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition text-sm"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition text-sm shadow-md"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Wedding Modal for Individual Wedding */}
      {showEditWeddingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <CalendarHeart size={22} className="text-amber-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  {isRtl ? 'تعديل بيانات الزفاف' : 'Edit Wedding Details'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditWeddingModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedCouple = {
                  groom: formData.get('groom'),
                  bride: formData.get('bride'),
                  date: formData.get('date'),
                  initialBudget: Number(formData.get('budget'))
                };

                setCouple(updatedCouple);

                // Update incomes list with the new initial budget
                let updatedIncomes = [...incomes];
                const initialIndex = updatedIncomes.findIndex(
                  inc => inc.id === 'initial_budget_fixed' || inc.type === 'شخصي' || inc.type === 'Personal'
                );
                if (initialIndex >= 0) {
                  updatedIncomes[initialIndex] = {
                    ...updatedIncomes[initialIndex],
                    amount: updatedCouple.initialBudget
                  };
                } else {
                  updatedIncomes.unshift({
                    id: 'initial_budget_fixed',
                    source: isRtl ? 'الميزانية المبدئية' : 'Initial Budget',
                    type: isRtl ? 'شخصي' : 'Personal',
                    amount: updatedCouple.initialBudget
                  });
                }

                setIncomes(updatedIncomes);
                setShowEditWeddingModal(false);

                await saveUserField('setup', updatedCouple);
                await saveUserField('incomes', updatedIncomes);
              }}
              className="space-y-4 text-sm"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.groomName}</label>
                <input
                  type="text"
                  name="groom"
                  defaultValue={couple.groom}
                  required
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.brideName}</label>
                <input
                  type="text"
                  name="bride"
                  defaultValue={couple.bride}
                  required
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.weddingDate}</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={couple.date}
                  min={todayStr}
                  required
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t.initialBudget} ({t.currency})
                </label>
                <input
                  type="number"
                  name="budget"
                  defaultValue={couple.initialBudget}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={handleDeleteIndividualWedding}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition text-xs font-bold flex items-center gap-1.5"
                  title={isRtl ? 'حذف ملف هذا الزواج والبدء من جديد' : 'Reset & Create New'}
                >
                  <Trash2 size={14} />
                  <span>{isRtl ? 'حذف ملف الزواج وإنشاء جديد' : 'Reset & Create New'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditWeddingModal(false)}
                    className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition text-xs"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition text-xs shadow-md"
                  >
                    {isRtl ? 'حفظ التعديلات ✓' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mass Wedding Modals */}
      {showModeSelectorModal && (
        <WeddingModeSelector
          onSelectMode={handleSelectMode}
          currentMode={weddingMode}
          isRtl={isRtl}
          onClose={() => setShowModeSelectorModal(false)}
        />
      )}

      {showMassSetupModal && (
        <MassWeddingSetupModal
          initialData={massWeddingData.info}
          onSave={handleSaveMassWeddingSetup}
          onCancel={() => setShowMassSetupModal(false)}
          onDeleteWedding={handleDeleteMassWedding}
          isRtl={isRtl}
        />
      )}

      {/* Floating AI Chat Button & Window */}
      <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 flex flex-col items-end`}>
        {isChatOpen && (
          <div className={`bg-white rounded-3xl shadow-2xl border border-amber-200 w-80 sm:w-96 mb-4 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-${isRtl ? 'left' : 'right'}`}>
            <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-amber-200" />
                <h3 className="font-bold">{t.chatWithAI}</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-amber-200 hover:text-white transition"><X size={20} /></button>
            </div>

            <div className="flex-1 p-4 h-[350px] overflow-y-auto bg-amber-50/30 flex flex-col gap-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-amber-600 text-white rounded-tl-sm' : 'bg-white border border-amber-100 text-gray-800 rounded-tr-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-white border border-amber-100 text-amber-600 rounded-tr-sm shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> ...
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-amber-100 flex gap-2 items-center">
              <input
                type="text"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                placeholder={t.typeMessage}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="bg-amber-600 text-white p-2.5 rounded-xl hover:bg-amber-700 disabled:opacity-50 transition flex items-center justify-center shrink-0"
              >
                <Send size={18} className={isRtl ? 'transform rotate-180' : ''} />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`${isChatOpen ? 'bg-gray-800' : 'bg-gradient-to-r from-amber-600 to-rose-600'} text-white p-4 rounded-full shadow-xl hover:scale-110 hover:shadow-2xl transition-all flex items-center justify-center`}
        >
          {isChatOpen ? <X size={26} /> : <MessageCircle size={26} />}
        </button>
      </div>
      {/* أداة قياس السرعة من فيرسيل */}
      <SpeedInsights />
    </div>
  );
}