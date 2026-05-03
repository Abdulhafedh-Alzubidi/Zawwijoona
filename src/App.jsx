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
  MessageCircle, Send, Upload, FileSpreadsheet
} from 'lucide-react';

// --- Dictionary for Bilingual Support ---
const dict = {
  ar: {
    appName: "زوجونا",
    dashboard: "الرئيسية",
    planning: "خطة الزفاف",
    services: "الخدمات والحجوزات",
    guests: "الضيوف",
    budget: "الميزانية",
    team: "فريق التنظيم",
    switchLang: "English",
    // ... login/signup ...
    loginTitle: "تسجيل الدخول",
    signupTitle: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginBtn: "دخول",
    signupBtn: "تسجيل",
    noAccount: "ليس لديك حساب؟",
    haveAccount: "لديك حساب بالفعل؟",
    
    // Registration
    welcomeSetup: "إعداد ملف الزفاف",
    groomName: "اسم العريس",
    brideName: "اسم العروس",
    weddingDate: "تاريخ الزفاف",
    initialBudget: "الميزانية المبدئية",
    startPlanning: "ابدأ التخطيط",
    // Dashboard
    welcome: "مرحباً بك في تخطيط",
    daysLeft: "يوم متبقي على الزفاف",
    completedTasks: "المهام المنجزة",
    totalBudget: "الميزانية المتاحة",
    // Planning
    events: "الفعاليات والمراسم",
    contract: "عقد القران",
    henna: "جلسة الحناء",
    magyal: "الحراوة (يوم الزفاف)",
    banquet: "الصبحة / الوليمة",
    addEvent: "إضافة فعالية",
    notes: "ملاحظات الفعالية...",
    eventDate: "تاريخ الفعالية",
    eventLocation: "موقع الفعالية",
    eventTitle: "اسم الفعالية",
    // Services
    bookService: "حجز خدمة",
    venues: "القاعات والمخادر",
    photo: "التصوير",
    band: "فرق الشرح والغيّة",
    morning: "صباحية",
    evening: "مسائية",
    bookNow: "احجز الآن",
    available: "متاح",
    // Guests
    guestList: "قائمة الضيوف",
    groomSide: "أهل العريس",
    brideSide: "أهل العروس",
    addGuest: "إضافة ضيف",
    guestName: "اسم ممثل العائلة",
    accompanying: "المرافقين",
    designInvite: "دعوة",
    importCsv: "استيراد من CSV",
    actions: "إجراءات",

    // Budget
    finances: "المالية والمصروفات",
    incomes: "الموارد المالية",
    expenses: "المصروفات",
    totalExpenses: "إجمالي المصروفات",
    remainingBudget: "المتبقي",
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
    memberName: "الاسم",
    role: "المجموعة",
    task: "المهمة",
    // AI Features
    aiAssistant: "✨ المساعد الحضرمي الذكي",
    generateInvite: "✨ إنشاء رسالة دعوة",
    invitePrompt: "جاري صياغة دعوة حضرمية أصيلة...",
    copyText: "نسخ النص",
    copied: "تم النسخ!",
    budgetTips: "✨ نصائح التوزيع (حضرمي)",
    gettingTips: "جاري تحليل الميزانية...",
    aiError: "حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.",
    // Chat
    chatWithAI: "استشر المساعد الذكي",
    typeMessage: "اكتب استفسارك هنا...",
    // Form buttons
    save: "حفظ",
    cancel: "إلغاء",
  },
  en: {
    appName: "Zawwijoona",
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
    // Guests
    guestList: "Guest List",
    groomSide: "Groom Side",
    brideSide: "Bride Side",
    addGuest: "Add Guest",
    guestName: "Family Rep Name",
    accompanying: "Accompanying",
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
  }
};

// --- Gemini API Helper (Replace with your actual key) ---
const apiKey = "AIzaSyBwwxUPnYV_Me6fkvQMFguPWyB2FyZrm6g";
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
  setProfileInfo({
    username: '',
    email: '',
    phone: '',
    bio: ''
  });

  // مهم جداً: إذا في شي ينحفظ في الlocalStorage لازم امسحه هنا عشان ما يعلق بيانات الحساب القديم
  localStorage.clear();

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

  const handleProfileSave = async () => {
  console.log("1. تم الضغط على زر الحفظ!"); // إذا ما طلعت هذي، يعني الزر مفصول
  
  if (user) {
    console.log("2. المستخدم موجود، جاري الحفظ في فايربيس...");
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        profile: profileInfo
      }, { merge: true });
      
      console.log("3. تم الحفظ في فايربيس بنجاح! 👤", profileInfo);
      setIsProfileEditMode(false); 
      
    } catch (error) {
      console.error("خطأ في حفظ بيانات الحساب:", error);
    }
  } else {
    console.log("❌ خطأ: المتغير user غير موجود أو لم يتم تسجيل الدخول!");
  }
};
  // 1. ALL HOOKS DECLARED AT THE TOP LEVEL
  const [lang, setLang] = useState('ar');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [couple, setCouple] = useState({ groom: "", bride: "", date: "", initialBudget: "", });
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

  // --- كود الاسترجاع العظيم (Fetch Data) ---
  useEffect(() => {
    const fetchUserData = async () => {
      // إذا كان المستخدم مسجل دخوله، روح جيب بياناته
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef); // سحب الملف بالكامل

         if (docSnap.exists()) {
            const data = docSnap.data(); // تفريغ محتوى الملف في متغير data

            // 1. استرجاع بيانات العرسان وإخفاء شاشة الإعداد إذا كانت مكتملة
            if (data.setup) {
              setCouple(data.setup);
              setIsSetupComplete(true); 
            } else {
              setIsSetupComplete(false);
            } 

            // 2. استرجاع باقي الأقسام (إن وُجدت)
            if (data.guests) setGuests(data.guests);
            if (data.expenses) setExpenses(data.expenses);
            if (data.events) setEvents(data.events);
            if (data.teams) setTeams(data.teams);
            if (data.profile) setProfileInfo(data.profile);

            // --- 🌟 التعديل السحري للميزانية المبدئية 🌟 ---
            // نجيب الموارد من الفايربيس (وإذا مافيه نخليها مصفوفة فاضية عشان نقدر نضيف عليها)
            let fetchedIncomes = data.incomes || []; 

            // إذا كان المستخدم عنده ميزانية مبدئية مسجلة في الإعدادات
            if (data.setup && data.setup.initialBudget) {
              // نفحص: هل الميزانية المبدئية موجودة أصلاً داخل القائمة اللي جات من فايربيس؟
              const hasInitialBudget = fetchedIncomes.some(inc => inc.type === 'شخصي' || inc.type === 'Personal');
              
              // إذا مو موجودة (بسبب التحديث)، نزرعها غصب كأول عنصر!
              if (!hasInitialBudget) {
                fetchedIncomes = [
                  {
                    id: 'initial_budget_fixed', // آي دي ثابت عشان ما تتكرر
                    source: isRtl ? 'الميزانية المبدئية' : 'Initial Budget',
                    type: isRtl ? 'شخصي' : 'Personal',
                    amount: data.setup.initialBudget // سحبنا الرقم من بيانات العريس
                  },
                  ...fetchedIncomes // ونحط تحتها باقي الموارد الإضافية
                ];
              }
            }
            
            // أخيراً: نعتمد القائمة المدمجة ونرسلها للشاشة
            setIncomes(fetchedIncomes);
            // ----------------------------------------------

            console.log("تم استرجاع جميع البيانات بنجاح! 📥🎯", data);
          } else {
            console.log("المستخدم جديد، لا توجد بيانات سابقة.");
          }
        } catch (error) {
          console.error("خطأ في استرجاع البيانات:", error);
        }
      }
    };

    fetchUserData();
  }, [user]); // هذا القوس يعني: "شغّل هذا الكود كلما تغيرت حالة المستخدم (تسجيل دخول/خروج)"

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
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
    setCouple(newCouple);
    setIncomes([{ id: Date.now(), source: isRtl ? 'الميزانية المبدئية' : 'Initial Budget', type: isRtl ? 'شخصي' : 'Personal', amount: newCouple.initialBudget }]);
    setIsSetupComplete(true);

    // 2. الحفظ في قاعدة البيانات (Firestore)
    if (user) {
      try {
        // إنشاء مرجع لملف المستخدم في مجلد 'users' باستخدام الـ UID الخاص به
        const userDocRef = doc(db, 'users', user.uid);

        // حفظ البيانات في الملف (استخدمنا merge: true عشان ما يمسح البيانات القديمة لو كانت موجودة)
        await setDoc(userDocRef, {
          setup: newCouple,
          isSetupComplete: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log("تم حفظ بيانات الزفاف بنجاح في السيرفر!");
      } catch (error) {
        console.error("خطأ في حفظ البيانات:", error);
        // هنا ممكن تضيف تنبيه للمستخدم إن الحفظ فشل إذا حبيت
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


  // 5. INNER COMPONENTS RENDERING LOGIC
  const DashboardTab = () => {
    const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0);
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
            <div className="inline-block bg-black/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-bold tracking-widest">
              {couple.date || 'TBD'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center space-x-4 space-x-reverse">
            <div className="bg-amber-100 p-4 rounded-full text-amber-600 mr-4">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{t.daysLeft}</p>
              <p className="text-3xl font-bold text-gray-800">{daysLeft > 0 ? daysLeft : 0}</p>
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
          <button onClick={() => setShowEventModal(true)} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 transition shadow-sm">
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
                    onChange={(e) => setEvents(events.map(ev => ev.id === eventInfo.id ? { ...ev, completed: e.target.checked } : ev))}
                    className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                  />
                  <h3 className={`text-lg font-bold ${eventInfo.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {eventInfo.titleKey ? t[eventInfo.titleKey] : eventInfo.title}
                  </h3>
                </div>
                <button onClick={() => setEvents(events.filter(e => e.id !== eventInfo.id))} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
              </div>

              <div className="space-y-3 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarHeart size={16} className="text-amber-500" />
                  <input
                    type="date"
                    min={todayStr}
                    className="bg-transparent border-b border-gray-100 focus:border-amber-400 outline-none w-full pb-1"
                    value={eventInfo.date}
                    onChange={(e) => setEvents(events.map(ev => ev.id === eventInfo.id ? { ...ev, date: e.target.value } : ev))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-amber-500" />
                  <input
                    type="text"
                    placeholder={t.eventLocation}
                    className="bg-transparent border-b border-gray-100 focus:border-amber-400 outline-none w-full pb-1"
                    value={eventInfo.location}
                    onChange={(e) => setEvents(events.map(ev => ev.id === eventInfo.id ? { ...ev, location: e.target.value } : ev))}
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
                  onChange={(e) => setEvents(events.map(ev => ev.id === eventInfo.id ? { ...ev, notes: e.target.value } : ev))}
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
          <button onClick={() => setShowTeamModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition shadow-sm">
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
                  <button onClick={() => setTeams(teams.filter(t => t.id !== team.id))} className="text-blue-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
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
                      <button onClick={() => setTeams(teams.map(t => t.id === team.id ? { ...t, members: t.members.filter(m => m.id !== member.id) } : t))} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
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

            // Fallback to second column if accompanying key is missing
            let rawAcc = accKey ? row[accKey] : currentLine[1];
            let parsedAcc = parseInt(rawAcc, 10);
            if (isNaN(parsedAcc)) parsedAcc = 0; // Prevent NaN errors

            parsedGuests.push({
              id: Date.now() + i,
              name: guestName,
              side: mappedSide,
              accompanying: parsedAcc,
              status: 'pending'
            });
          }
          setGuests(prev => [...prev, ...parsedGuests]);
          // Clear the input so the same file can be selected again
          event.target.value = null;
        };
        reader.readAsText(file);
      }
    };

    const totalGroomSide = guests.filter(g => g.side === 'groomSide').reduce((sum, g) => sum + 1 + (g.accompanying || 0), 0);
    const totalBrideSide = guests.filter(g => g.side === 'brideSide').reduce((sum, g) => sum + 1 + (g.accompanying || 0), 0);
    const totalAllGuests = totalGroomSide + totalBrideSide;

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
            <button onClick={() => setShowGuestModal(true)} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2 transition shadow-sm">
              <Plus size={18} /> {t.addGuest}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
            <p className="text-amber-800 font-bold mb-1">{lang === 'ar' ? 'إجمالي الضيوف' : 'Total Guests'}</p>
            <p className="text-2xl font-black text-amber-900">{totalAllGuests}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
            <p className="text-blue-800 font-bold mb-1">{t.groomSide}</p>
            <p className="text-2xl font-black text-blue-900">{totalGroomSide}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
            <p className="text-rose-800 font-bold mb-1">{t.brideSide}</p>
            <p className="text-2xl font-black text-rose-900">{totalBrideSide}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-amber-50/50 border-b border-amber-100 text-amber-800">
                <tr>
                  <th className={`p-4 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{t.guestName}</th>
                  <th className={`p-4 font-bold text-center`}>{t.accompanying}</th>
                  <th className="p-4 font-bold text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {guests.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-500">لا يوجد ضيوف مضافين بعد.</td>
                  </tr>
                ) : (
                  guests.map((guest, idx) => (
                    <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">{guest.name}</td>
                      <td className="p-4 text-center font-bold text-amber-600 bg-amber-50/30">+{guest.accompanying}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => setGuests(guests.filter(g => g.id !== guest.id))} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))
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
            <button onClick={() => setShowIncomeModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition shadow-sm">
              <Plus size={18} /> <span className="hidden sm:inline">{t.addIncome}</span>
            </button>
            <button onClick={() => setShowExpenseModal(true)} className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 flex items-center gap-2 transition shadow-sm">
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

                  <div className="flex items-center gap-4">

                    <span className="text-green-600 font-black">+{inc.amount.toLocaleString()}</span>

                    {inc.type !== (isRtl ? 'شخصي' : 'Personal') && ( // Prevent deleting initial budget easily

                      <button onClick={() => setIncomes(incomes.filter(e => e.id !== inc.id))} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>

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
                  <div className="flex items-center gap-4">
                    <span className="text-rose-600 font-black">-{exp.amount.toLocaleString()}</span>
                    <button onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };
  // -- التحقق قبل عرض التطبيق --

  // 1. إذا كان التطبيق لسه يتأكد من حالة المستخدم، نعرض شاشة تحميل بسيطة
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="text-amber-600 font-bold text-2xl animate-pulse">جاري التحميل... ⏳</div>
      </div>
    );
  }

  // 2. إذا لم يكن هناك مستخدم مسجل، نعرض صفحة تسجيل الدخول
  if (!user) {
    return <Auth onLoginSuccess={() => console.log('تم تسجيل الدخول بنجاح')} 
    toggleLang={toggleLang}
    isRtl={isRtl} />;
  }
  // 4. EARLY RETURNS
  if (!isSetupComplete) {
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
              <input type="text" name="groom" required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50" placeholder="عمر" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.brideName}</label>
              <input type="text" name="bride" required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50" placeholder="فاطمة" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.weddingDate}</label>
              <input type="date" name="date" min={todayStr} required className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">{t.initialBudget} ({t.currency})</label>
              <input type="number" name="budget" required min="0" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-gray-50" placeholder="2500000" />
            </div>
            <button type="submit" className="w-full bg-amber-600 text-white font-bold text-lg py-3 rounded-xl hover:bg-amber-700 transition shadow-lg mt-4">
              {t.startPlanning}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={toggleLang} className="text-sm text-gray-500 hover:text-amber-600 underline decoration-dotted">
              {lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. MAIN RENDER
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`min-h-screen bg-[#fdfbf7] font-sans ${isRtl ? 'font-arabic' : ''}`}>

      {/* Navigation */}
      <nav className="relative bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          {/* Left: Profile Menu */}
          <div className="relative profile-menu-container">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-2 py-1 hover:shadow-sm transition"
            >
              <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center">
                {profileInfo.username ? profileInfo.username[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold text-gray-800">{profileInfo.username || 'ضيفنا'}</span>
                <span className="text-xs text-gray-500 truncate">{profileInfo.email || t.appName}</span>
              </div>
            </button>
          </div>

          {/* Center: App Logo & Name */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-amber-700 font-extrabold text-2xl">
            <CalendarHeart size={28} className="text-amber-500 hidden sm:block" />
            <span>{t.appName}</span>
          </div>

          {/* Right: Burger Menu */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-amber-700 p-1 hover:bg-amber-50 rounded-lg transition">
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
        {isProfileMenuOpen && (
          <div className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-full mt-2 w-80 rounded-3xl bg-white border border-gray-200 shadow-2xl z-40 overflow-hidden`} onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            {!isProfileEditMode ? (
              <div>
                <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center">
                      {profileInfo.username ? profileInfo.username[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{profileInfo.username || 'ضيفنا'}</p>
                      <p className="text-xs text-gray-500 truncate">{profileInfo.email || 'لا يوجد بريد إلكتروني'}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsProfileEditMode(true)} className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full hover:bg-amber-200 transition">
                    {isRtl ? 'تعديل' : 'Edit'}
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">{isRtl ? 'الهاتف' : 'Phone'}</p>
                    <p className="text-sm text-gray-800">{profileInfo.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">{isRtl ? 'معلومات إضافية' : 'Bio'}</p>
                    <p className="text-sm text-gray-800">{profileInfo.bio || '-'}</p>
                  </div>
                  {/* Language Switch in Profile Menu */}
                  <div className="pt-2 border-t border-gray-100">
                    <button onClick={toggleLang} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-600 hover:text-amber-700 bg-gray-100 px-4 py-2 rounded-full transition">
                      <Globe size={16} /> {t.switchLang}
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-100 p-4">
                  <button onClick={handleLogout} className="w-full px-3 py-2 text-sm font-semibold text-red-600 rounded-2xl border border-red-100 hover:bg-red-50 transition">
                    {isRtl ? 'تسجيل الخروج' : 'Logout'}
                  </button>
                </div>
              </div>
            ) : (
              <form className="p-4 space-y-3">
                <h3 className="font-bold text-gray-800 text-sm mb-3">{isRtl ? 'تعديل البيانات' : 'Edit Profile'}</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">{isRtl ? 'اسم المستخدم' : 'Username'}</label>
                  <input
                    type="text"
                    value={profileInfo.username}
                    onChange={(e) => handleProfileInfoChange('username', e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">{isRtl ? 'الهاتف' : 'Phone'}</label>
                  <input
                    type="text"
                    value={profileInfo.phone}
                    onChange={(e) => handleProfileInfoChange('phone', e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">{isRtl ? 'معلومات إضافية' : 'Bio'}</label>
                  <textarea
                    value={profileInfo.bio}
                    onChange={(e) => handleProfileInfoChange('bio', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button type="button" onClick={() => setIsProfileEditMode(false)} className="flex-1 px-3 py-2 text-sm font-semibold text-gray-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition">
                    {t.cancel}
                  </button>
                  <button type="button" onClick={handleProfileSave} className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-2xl bg-amber-600 hover:bg-amber-700 transition">
                    {isRtl ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </nav>

      {/* القائمة المنسدلة للجوال */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" style={{ top: '64px' }} onClick={() => setIsMobileMenuOpen(false)}>
          <div className={`bg-white h-full w-64 shadow-2xl p-5 ${isRtl ? 'float-right' : 'float-left'} overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
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
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
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
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'planning' && PlanningTab()}
          {activeTab === 'guests' && <GuestsTab />}
          {activeTab === 'budget' && <BudgetTab />}
          {activeTab === 'team' && <TeamTab />}
          {activeTab === 'services' && <div className="p-8 text-center text-gray-500">قسم الخدمات (قريباً)</div>}
        </main>
      </div>

      {/* --- MODALS SECTION --- */}
      {showGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{t.addGuest}</h3>
            <form onSubmit={async (e) => { // 👈 أضفنا async هنا
              e.preventDefault();
              const formData = new FormData(e.target);

              // 1. تجهيز بيانات الضيف الجديد
              const newGuest = {
                id: Date.now(),
                name: formData.get('name'),
                side: formData.get('side'),
                accompanying: Number(formData.get('accompanying')),
                status: 'pending'
              };

              // 2. إنشاء قائمة الضيوف الجديدة (القدامى + الجديد)
              const updatedGuests = [...guests, newGuest];

              // 3. تحديث الواجهة فوراً (حفظ محلي)
              setGuests(updatedGuests);
              setShowGuestModal(false);

              // 4. إرسال القائمة الجديدة إلى قاعدة البيانات (Firestore)
              if (user) {
                try {
                  const userDocRef = doc(db, 'users', user.uid);
                  // نحدث حقل "الضيوف" فقط، واستخدمنا merge عشان ما نمسح بيانات العرسان
                  await setDoc(userDocRef, {
                    guests: updatedGuests
                  }, { merge: true });
                  console.log("تم حفظ الضيف في السيرفر بنجاح! 🚀");
                } catch (error) {
                  console.error("خطأ في حفظ الضيف:", error);
                }
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.guestName}</label>
                <input type="text" name="name" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">{isRtl ? 'الجهة' : 'Side'}</label>
                  <select name="side" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                    <option value="groomSide">{t.groomSide}</option>
                    <option value="brideSide">{t.brideSide}</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.accompanying}</label>
                  <input type="number" name="accompanying" defaultValue="0" min="0" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowGuestModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{t.addExpense}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              // 1. تجهيز بيانات المصروف الجديد
              const newExpense = {
                id: Date.now(),
                item: formData.get('item'),
                amount: Number(formData.get('amount'))
              };

              // 2. إنشاء قائمة المصروفات الجديدة (القديمة + الجديد)
              const updatedExpenses = [...expenses, newExpense];

              // 3. تحديث الواجهة فوراً (حفظ محلي)
              setExpenses(updatedExpenses);
              setShowExpenseModal(false);

              // 4. إرسال القائمة الجديدة إلى قاعدة البيانات (Firestore)
              if (user) {
                try {
                  const userDocRef = doc(db, 'users', user.uid);
                  // نحدث حقل المصروفات فقط، مع استخدام merge
                  await setDoc(userDocRef, {
                    expenses: updatedExpenses
                  }, { merge: true });
                  console.log("تم حفظ المصروف في السيرفر بنجاح! 💸");
                } catch (error) {
                  console.error("خطأ في حفظ المصروف:", error);
                }
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.itemName}</label>
                <input type="text" name="item" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.cost} ({t.currency})</label>
                <input type="number" name="amount" required min="0" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{t.addIncome}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              // 1. تجهيز بيانات المدخول الجديد
              const newIncome = {
                id: Date.now(),
                source: formData.get('source'),
                type: formData.get('type'),
                amount: Number(formData.get('amount'))
              };

              // 2. إنشاء قائمة المداخيل الجديدة (القديمة + الجديد)
              const updatedIncomes = [...incomes, newIncome];

              // 3. تحديث الواجهة فوراً (حفظ محلي)
              setIncomes(updatedIncomes);
              setShowIncomeModal(false);

              // 4. إرسال القائمة الجديدة إلى قاعدة البيانات (Firestore)
              if (user) {
                try {
                  const userDocRef = doc(db, 'users', user.uid);
                  // نحدث حقل المداخيل فقط، مع استخدام merge
                  await setDoc(userDocRef, {
                    incomes: updatedIncomes
                  }, { merge: true });
                  console.log("تم حفظ المدخول في السيرفر بنجاح! 💰");
                } catch (error) {
                  console.error("خطأ في حفظ المدخول:", error);
                }
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.incomeSource}</label>
                <input type="text" name="source" placeholder="مثال: عانية من الأصدقاء" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.incomeType}</label>
                <input type="text" name="type" placeholder="مثال: هدية، سلف، ادخار" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.cost} ({t.currency})</label>
                <input type="number" name="amount" required min="0" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowIncomeModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{t.addEvent}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              // 1. تجهيز بيانات الحدث/الخطة
              const newEvent = {
                id: Date.now(),
                title: formData.get('title'), // تأكد من اسم الحقل عندك
                date: formData.get('date'),
                location: formData.get('location'),
                notes: formData.get('notes'),
                completed: false // افتراضياً المهمة غير منجزة
              };

              // 2. دمج الخطة الجديدة مع الخطط السابقة
              const updatedEvents = [...events, newEvent];

              // 3. تحديث الشاشة
              setEvents(updatedEvents);
              setShowEventModal(false);

              // 4. الحفظ في فايربيس
              if (user) {
                try {
                  const userDocRef = doc(db, 'users', user.uid);
                  await setDoc(userDocRef, {
                    events: updatedEvents
                  }, { merge: true });
                  console.log("تم حفظ خطة الزفاف في السيرفر بنجاح! 📅");
                } catch (error) {
                  console.error("خطأ في حفظ الخطة:", error);
                }
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.eventTitle}</label>
                <input type="text" name="title" placeholder="مثال: سمرة العريس، غسلة العروس" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.eventDate}</label>
                <input type="date" name="date" min={todayStr} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.eventLocation}</label>
                <input type="text" name="location" placeholder="مكان إقامة الفعالية" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.notes}</label>
                <textarea name="notes" rows="2" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{t.addTeam}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);

              // 1. تجهيز بيانات الفريق
              const newTeam = {
                id: Date.now(),
                name: formData.get('name'), // تأكد من اسم الحقل عندك
                leader: formData.get('leader'),
                phone: formData.get('phone'),
                tasks: formData.get('tasks'),
                members: [] // مصفوفة فارغة لأعضاء الفريق
              };

              // 2. دمج الفريق الجديد مع الفرق السابقة
              const updatedTeams = [...teams, newTeam];

              // 3. تحديث الشاشة
              setTeams(updatedTeams);
              setShowTeamModal(false);

              // 4. الحفظ في فايربيس
              if (user) {
                try {
                  const userDocRef = doc(db, 'users', user.uid);
                  await setDoc(userDocRef, {
                    teams: updatedTeams
                  }, { merge: true });
                  console.log("تم حفظ الفريق في السيرفر بنجاح! 🤝");
                } catch (error) {
                  console.error("خطأ في حفظ الفريق:", error);
                }
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.teamName}</label>
                <input type="text" name="name" placeholder="مثال: فريق الشرح" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.teamLeader}</label>
                <input type="text" name="leader" placeholder="اسم مسؤول الفريق" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{isRtl ? 'رقم الهاتف' : 'Phone Number'}</label>
                <input type="tel" name="phone" placeholder="رقم هاتف مسؤول الفريق" required className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.teamTasks}</label>
                <textarea name="tasks" placeholder="المهام المنوطة بالفريق..." required rows="2" className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowTeamModal(false)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">{t.save}</button>
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

              // 3. تحديث الواجهة فوراً (حفظ محلي)
              setTeams(updatedTeams);
              setShowTeamMemberModal(null);

              // 4. إرسال القائمة المحدثة إلى قاعدة البيانات (Firestore)
              if (user) {
                try {
                  const userDocRef = doc(db, 'users', user.uid);
                  // نحدث حقل الفرق بالكامل
                  await setDoc(userDocRef, {
                    teams: updatedTeams
                  }, { merge: true });
                  console.log("تم إضافة الفرد للفريق بنجاح! 👤");
                } catch (error) {
                  console.error("خطأ في حفظ الفرد:", error);
                }
              }
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