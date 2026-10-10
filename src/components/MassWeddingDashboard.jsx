import React, { useState, useMemo } from 'react';
import {
  Users2, HeartHandshake, Utensils, Calendar, Clock, MapPin,
  Sparkles, CheckCircle2, AlertCircle, Plus, Trash2, Search,
  Phone, Share2, Copy, Check, Filter, ArrowUpRight, ShieldCheck,
  Building2, Coins, Droplets, Coffee, Flame, Tent, Award,
  FileText, MessageSquare, ChevronRight, Edit3, Send, Loader2,
  Sliders, RotateCcw, X, Edit2
} from 'lucide-react';
import {
  calculateMassWeddingLogistics,
  DEFAULT_CALCULATOR_RATES,
  DEFAULT_CUSTOM_LOGISTICS_ITEMS
} from '../data/massWeddingTemplates';

export default function MassWeddingDashboard({
  data,
  onUpdateData,
  onOpenSettings,
  onSwitchMode,
  isRtl,
  lang,
  generateWithGemini,
  activeTab: controlledActiveTab,
  onTabChange
}) {
  // Tabs: 'overview' | 'couples' | 'committees' | 'budget' | 'schedule' | 'logistics' | 'ai'
  const [internalActiveSubTab, setInternalActiveSubTab] = useState('overview');
  const activeSubTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveSubTab;
  const setActiveSubTab = (tab) => {
    setInternalActiveSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // --- Modals State ---
  const [showAddCoupleModal, setShowAddCoupleModal] = useState(false);
  const [showAddCommitteeModal, setShowAddCommitteeModal] = useState(false);
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showEditRatesModal, setShowEditRatesModal] = useState(false);
  const [showAddSupplyModal, setShowAddSupplyModal] = useState(false);
  const [editingSupplyItem, setEditingSupplyItem] = useState(null);

  // --- Search & Filters ---
  const [coupleSearch, setCoupleSearch] = useState('');
  const [coupleFilter, setCoupleFilter] = useState('all'); // 'all' | 'ready' | 'pending'

  // --- AI State ---
  const [aiPromptType, setAiPromptType] = useState('invitation'); // 'invitation' | 'speech' | 'directives'
  const [aiOutput, setAiOutput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);

  // Safe Fallback Data
  const weddingInfo = data.info || {};
  const couples = data.couples || [];
  const committees = data.committees || [];
  const sponsorships = data.sponsorships || [];
  const expenses = data.expenses || [];
  const schedule = data.schedule || [];

  // --- Calculations ---
  const daysLeft = weddingInfo.date
    ? Math.ceil((new Date(weddingInfo.date) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalSponsorships = useMemo(() => {
    return sponsorships.reduce((sum, sp) => sum + (Number(sp.amount) || 0), 0);
  }, [sponsorships]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [expenses]);

  const budgetProgress = Math.min(
    100,
    Math.round((totalSponsorships / (weddingInfo.estimatedTotalBudget || 1)) * 100)
  );

  const completedCouplesCount = useMemo(() => {
    return couples.filter(
      (c) => c.medicalStatus === 'completed' && c.contractStatus === 'completed'
    ).length;
  }, [couples]);

  const totalVolunteers = useMemo(() => {
    return committees.reduce((sum, com) => sum + (Number(com.volunteersCount) || 0), 0);
  }, [committees]);

  // Dynamic Logistics & Custom Rates Calculation
  const calculatorRates = useMemo(() => {
    return { ...DEFAULT_CALCULATOR_RATES, ...(data.calculatorSettings?.rates || {}) };
  }, [data.calculatorSettings?.rates]);

  const customItems = useMemo(() => {
    return data.calculatorSettings?.customItems || DEFAULT_CUSTOM_LOGISTICS_ITEMS;
  }, [data.calculatorSettings?.customItems]);

  const logistics = useMemo(() => {
    return calculateMassWeddingLogistics(
      couples.length || weddingInfo.targetCouples || 20,
      null,
      calculatorRates,
      customItems
    );
  }, [couples.length, weddingInfo.targetCouples, calculatorRates, customItems]);

  // Overall Readiness Score
  const readinessScore = useMemo(() => {
    let score = 20; // Base score for having an organized event
    if (couples.length > 0) {
      score += Math.round((completedCouplesCount / couples.length) * 35);
    }
    if (totalSponsorships >= totalExpenses && totalExpenses > 0) score += 25;
    else if (totalSponsorships > 0) score += 15;
    if (committees.length >= 4) score += 20;
    return Math.min(100, score);
  }, [couples, completedCouplesCount, totalSponsorships, totalExpenses, committees]);

  // --- Handlers: Couples ---
  const handleAddCouple = (newCouple) => {
    const updated = [newCouple, ...couples];
    onUpdateData({ ...data, couples: updated });
    setShowAddCoupleModal(false);
  };

  const handleDeleteCouple = (coupleId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا العريس من السجل؟' : 'Remove this couple from the roster?')) {
      const updated = couples.filter((c) => c.id !== coupleId);
      onUpdateData({ ...data, couples: updated });
    }
  };

  const handleToggleCoupleStatus = (coupleId, field) => {
    const updated = couples.map((c) => {
      if (c.id === coupleId) {
        if (field === 'medicalStatus') {
          return { ...c, medicalStatus: c.medicalStatus === 'completed' ? 'pending' : 'completed' };
        }
        if (field === 'contractStatus') {
          return { ...c, contractStatus: c.contractStatus === 'completed' ? 'in_progress' : 'completed' };
        }
        if (field === 'aidStatus') {
          return { ...c, aidStatus: c.aidStatus === 'delivered' ? 'processing' : 'delivered' };
        }
      }
      return c;
    });
    onUpdateData({ ...data, couples: updated });
  };

  // --- Handlers: Committees ---
  const handleAddCommittee = (newCom) => {
    const updated = [...committees, newCom];
    onUpdateData({ ...data, committees: updated });
    setShowAddCommitteeModal(false);
  };

  const handleDeleteCommittee = (comId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذه اللجنة؟' : 'Delete this committee?')) {
      const updated = committees.filter((com) => com.id !== comId);
      onUpdateData({ ...data, committees: updated });
    }
  };

  // --- Handlers: Sponsors & Expenses ---
  const handleAddSponsor = (newSp) => {
    const updated = [newSp, ...sponsorships];
    onUpdateData({ ...data, sponsorships: updated });
    setShowAddSponsorModal(false);
  };

  const handleDeleteSponsor = (spId) => {
    const updated = sponsorships.filter((sp) => sp.id !== spId);
    onUpdateData({ ...data, sponsorships: updated });
  };

  const handleAddExpense = (newExp) => {
    const updated = [newExp, ...expenses];
    onUpdateData({ ...data, expenses: updated });
    setShowAddExpenseModal(false);
  };

  const handleDeleteExpense = (expId) => {
    const updated = expenses.filter((exp) => exp.id !== expId);
    onUpdateData({ ...data, expenses: updated });
  };

  // --- Handlers: Smart Calculator Customization ---
  const handleUpdateRates = (newRates) => {
    const updatedSettings = {
      ...(data.calculatorSettings || {}),
      rates: newRates,
      customItems: customItems
    };
    onUpdateData({ ...data, calculatorSettings: updatedSettings });
    setShowEditRatesModal(false);
  };

  const handleResetRates = () => {
    if (window.confirm(isRtl ? 'هل تريد استعادة كافة معدلات الاستهلاك والمواد إلى القيم الافتراضية؟' : 'Reset all rates and supplies to default values?')) {
      const updatedSettings = {
        rates: { ...DEFAULT_CALCULATOR_RATES },
        customItems: [...DEFAULT_CUSTOM_LOGISTICS_ITEMS]
      };
      onUpdateData({ ...data, calculatorSettings: updatedSettings });
    }
  };

  const handleSaveSupplyItem = (itemToSave) => {
    const existing = customItems;
    let updated;
    if (itemToSave.id && existing.some((i) => i.id === itemToSave.id)) {
      updated = existing.map((i) => (i.id === itemToSave.id ? itemToSave : i));
    } else {
      const newItem = {
        ...itemToSave,
        id: itemToSave.id || `item-${Date.now()}`
      };
      updated = [...existing, newItem];
    }
    const updatedSettings = {
      ...(data.calculatorSettings || {}),
      rates: calculatorRates,
      customItems: updated
    };
    onUpdateData({ ...data, calculatorSettings: updatedSettings });
    setShowAddSupplyModal(false);
    setEditingSupplyItem(null);
  };

  const handleDeleteSupplyItem = (itemId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذه المادة من الحاسبة؟' : 'Delete this supply item from calculator?')) {
      const updated = customItems.filter((i) => i.id !== itemId);
      const updatedSettings = {
        ...(data.calculatorSettings || {}),
        rates: calculatorRates,
        customItems: updated
      };
      onUpdateData({ ...data, calculatorSettings: updatedSettings });
    }
  };

  // --- Handlers: Schedule ---
  const handleToggleScheduleStatus = (schId) => {
    const updated = schedule.map((item) => {
      if (item.id === schId) {
        const nextStatus =
          item.status === 'upcoming'
            ? 'ongoing'
            : item.status === 'ongoing'
              ? 'completed'
              : 'upcoming';
        return { ...item, status: nextStatus };
      }
      return item;
    });
    onUpdateData({ ...data, schedule: updated });
  };

  // --- Handlers: AI Assistant ---
  const handleRunAi = async () => {
    setIsAiLoading(true);
    setAiOutput('');

    let prompt = '';
    if (aiPromptType === 'invitation') {
      prompt = `أنت المنسق الإعلامي للعرس الجماعي في حضرموت، اليمن.
اكتب إعلاناً وبلاغاً رسمياً ودعوة عامة لحضور "${weddingInfo.title}" المقام بتنظيم "${weddingInfo.organizer}" في "${weddingInfo.location}" بتاريخ "${weddingInfo.date}".
عدد العرسان المحتفى بهم: ${couples.length} عريس وعروسة.
اجعل الأسلوب فصيحاً، محبباً، يعكس التكافل الاجتماعي والتراث الحضرمي اليمني الأصيل، متضمناً جدول الفعاليات وأوقات الاستقبال والوليمة.`;
    } else if (aiPromptType === 'speech') {
      prompt = `أنت خطيب الحفل واللجنة المنظمة العليا للعرس الجماعي.
اكتب الكلمة الافتتاحية الرسمية للجنة المنظمة لـ "${weddingInfo.title}" في ${weddingInfo.city}.
تتضمن: الترحيب بالضيوف والشيوخ والوجهاء، شكر الرعاة والداعمين وفاعلي الخير، التهنئة الصادقة لـ ${couples.length} عريس وعروسة، وحث الشباب على تيسير المهور والتعاون المجتمعي. أسلوب بليغ ومؤثر.`;
    } else {
      prompt = `أنت رئيس العمليات الميدانية لـ "${weddingInfo.title}".
اكتب تعميماً وتوجيهاً تنظيمياً وإدارياً شاملاً موجهاً للجان الميدانية الثمانية (${committees.map(c => c.name).join('، ')}) يتضمن:
توزيع خطة الطوارئ، موعد التواجد، إدارة الحشود، جاهزية ضيافة الشاهي الحضرمي وفريق عدة الشاي ومعدات السموار، وتوزيع برادات وترامس المياه الباردة، وتنظيم صعود العرسان للمنصة. بأسلوب تنظيمي حازم وواضح.`;
    }

    try {
      if (generateWithGemini) {
        const result = await generateWithGemini(prompt);
        setAiOutput(result || (isRtl ? 'تعذر إنشاء النص، يرجى المحاولة ثانية.' : 'Failed to generate text.'));
      } else {
        // Fallback simulation
        setTimeout(() => {
          setAiOutput(
            isRtl
              ? `بسم الله الرحمن الرحيم\n\nتتشرف "${weddingInfo.organizer}" بدعوتكم لحضور فعاليات "${weddingInfo.title}" لزفاف (${couples.length}) عريساً وعروسة من أبناء منطقتنا الكرام.\n\nالمكان: ${weddingInfo.location}\nالتاريخ: ${weddingInfo.date}\n\nحضوركم شرف لنا ودعم لمسيرة التيسير والتكافل الاجتماعي، وأهلاً وسهلاً بكم في داركم العامرة!`
              : `Official Announcement: You are cordially invited to attend the ${weddingInfo.title} celebrating ${couples.length} couples at ${weddingInfo.location} on ${weddingInfo.date}. Organized by ${weddingInfo.organizer}.`
          );
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setAiOutput(isRtl ? 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.' : 'AI generation error.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyAi = () => {
    if (!aiOutput) return;
    navigator.clipboard.writeText(aiOutput);
    setCopiedAi(true);
    setTimeout(() => setCopiedAi(false), 2000);
  };

  // Filtered Couples
  const filteredCouples = useMemo(() => {
    return couples.filter((c) => {
      const matchesSearch =
        c.groomName.toLowerCase().includes(coupleSearch.toLowerCase()) ||
        c.tribe.toLowerCase().includes(coupleSearch.toLowerCase()) ||
        c.area.toLowerCase().includes(coupleSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (coupleFilter === 'ready') {
        return c.medicalStatus === 'completed' && c.contractStatus === 'completed';
      }
      if (coupleFilter === 'pending') {
        return c.medicalStatus !== 'completed' || c.contractStatus !== 'completed';
      }
      return true;
    });
  }, [couples, coupleSearch, coupleFilter]);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6">

      {/* --- 1. HERO BANNER --- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-amber-800 to-orange-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide flex items-center gap-1.5 border border-white/20">
                <Users2 size={14} className="text-amber-200" />
                <span>{isRtl ? 'نظام إدارة الأعراس الجماعية' : 'Mass Wedding Management'}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1">
                <Building2 size={13} />
                <span>{weddingInfo.organizer}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{weddingInfo.title}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-amber-100/90 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-amber-300 shrink-0" />
                <span>{weddingInfo.location}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={16} className="text-amber-300 shrink-0" />
                <span>{weddingInfo.date}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-amber-900/60 px-2.5 py-0.5 rounded-lg border border-amber-600/40">
                <Clock size={14} className="text-amber-300" />
                <span>
                  {daysLeft > 0
                    ? isRtl ? `${daysLeft} يوم متبقي على الفعالية` : `${daysLeft} days until event`
                    : isRtl ? 'اليوم يوم الفعالية الكبرى! 🎉' : 'Event Day! 🎉'}
                </span>
              </span>
            </div>
          </div>

          {/* Action Buttons in Hero */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-stretch sm:self-auto justify-start sm:justify-end">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-sm transition border border-white/20"
                title={isRtl ? 'تعديل بيانات العرس الجماعي' : 'Edit Event Info'}
              >
                <Edit3 size={16} />
                <span>{isRtl ? 'تعديل الفعالية' : 'Edit Event'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSwitchMode}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs sm:text-sm shadow-md transition"
              title={isRtl ? 'التبديل إلى تخطيط زفاف فردي' : 'Switch to Individual Wedding'}
            >
              <span>{isRtl ? '👰 التبديل لزواج فردي' : '👰 Switch to Individual'}</span>
            </button>
          </div>
        </div>

        {/* Readiness Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-300" />
            <span className="font-bold text-white">
              {isRtl ? 'مؤشر الجاهزية العامة للفعالية:' : 'Overall Event Readiness:'}
            </span>
            <span className="font-black text-amber-300 text-sm">{readinessScore}%</span>
          </div>

          <div className="flex-1 max-w-md bg-black/30 rounded-full h-2.5 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${readinessScore}%` }}
            ></div>
          </div>

          <span className="text-amber-200 text-xs">
            {readinessScore > 75
              ? isRtl ? 'جاهزية عالية جداً وممتازة ✨' : 'High Readiness ✨'
              : isRtl ? 'التجهيزات جارية على قدم وساق ⚙️' : 'In Progress ⚙️'}
          </span>
        </div>
      </div>

      {/* --- 2. KPI METRIC CARDS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">

        {/* Metric 1: Registered Couples */}
        <div
          onClick={() => setActiveSubTab('couples')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:border-amber-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">
              {isRtl ? 'العرسان المسجلون' : 'Registered Couples'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition">
              <Users2 size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            {couples.length} <span className="text-xs text-gray-400 font-normal">/ {weddingInfo.targetCouples || 24}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            {completedCouplesCount} {isRtl ? 'عريس مكتمل الفحص والعقد ✓' : 'Fully verified ✓'}
          </div>
        </div>

        {/* Metric 2: Total Budget & Sponsorships */}
        <div
          onClick={() => setActiveSubTab('budget')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:border-emerald-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">
              {isRtl ? 'إجمالي الرعايات والتبرعات' : 'Total Funds Raised'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition">
              <Coins size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            {(totalSponsorships / 1000000).toFixed(1)} <span className="text-xs text-gray-400 font-normal">{isRtl ? 'مليون ر.ي' : 'M YER'}</span>
          </div>
          <div className="text-[11px] text-gray-500 font-semibold mt-1">
            {budgetProgress}% {isRtl ? 'من الميزانية التقديرية' : 'of target budget'}
          </div>
        </div>

        {/* Metric 3: Total Guests & Capacity */}
        <div
          onClick={() => setActiveSubTab('logistics')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:border-orange-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">
              {isRtl ? 'الضيوف المتوقعين' : 'Expected Guests'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center group-hover:scale-110 transition">
              <Utensils size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            {logistics.totalGuests.toLocaleString()}{' '}
            <span className="text-xs text-gray-400 font-normal">{isRtl ? 'ضيف' : 'guests'}</span>
          </div>
          <div className="text-[11px] text-amber-700 font-bold mt-1">
            {logistics.food.sheepCount} {isRtl ? 'ذبيحة مقدرة للوليمة' : 'sheep estimated'}
          </div>
        </div>

        {/* Metric 4: Organizing Committees & Volunteers */}
        <div
          onClick={() => setActiveSubTab('committees')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:border-blue-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">
              {isRtl ? 'اللجان والمتطوعين' : 'Committees & Teams'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition">
              <HeartHandshake size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            {committees.length}{' '}
            <span className="text-xs text-gray-400 font-normal">{isRtl ? 'لجان' : 'committees'}</span>
          </div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">
            {totalVolunteers} {isRtl ? 'متطوع ميداني' : 'volunteers'}
          </div>
        </div>

        {/* Metric 5: Tea & Hospitality Ready */}
        <div
          onClick={() => setActiveSubTab('logistics')}
          className="col-span-2 lg:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:border-amber-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900">
              {isRtl ? 'فريق عدة الشاي والسقيا' : 'Tea Kit & Water Team'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center group-hover:scale-110 transition">
              <Coffee size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-950">
            {logistics.teaHospitality.teamSize}{' '}
            <span className="text-xs text-amber-800 font-normal">{isRtl ? 'أفراد بعدة الشاي' : 'tea crew'}</span>
          </div>
          <div className="text-[11px] text-amber-800 font-bold mt-1">
            {logistics.hydration.largeDispensers} {isRtl ? 'برادات مياه باردة' : 'water dispensers'}
          </div>
        </div>

      </div>

      {/* --- SUB-TAB CONTENT SECTIONS --- */}

      {/* === SUB-TAB 1: OVERVIEW === */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Quick Actions & Checklist */}
            <div className="lg:col-span-2 space-y-6">

              {/* Quick Actions Panel */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-600" />
                  <span>{isRtl ? 'إجراءات سريعة لتنظيم العرس الجماعي' : 'Quick Actions'}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCoupleModal(true)}
                    className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex flex-col items-center justify-center gap-2 border border-amber-200 transition"
                  >
                    <Users2 size={20} className="text-amber-700" />
                    <span>{isRtl ? 'إضافة عريس جديد' : 'Add Couple'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddSponsorModal(true)}
                    className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex flex-col items-center justify-center gap-2 border border-emerald-200 transition"
                  >
                    <Coins size={20} className="text-emerald-700" />
                    <span>{isRtl ? 'تسجيل داعم / راعي' : 'Add Sponsor'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab('logistics')}
                    className="p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs flex flex-col items-center justify-center gap-2 border border-orange-200 transition"
                  >
                    <Utensils size={20} className="text-orange-700" />
                    <span>{isRtl ? 'حاسبة التموين والوليمة' : 'Rations Calc'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveSubTab('ai'); handleRunAi(); }}
                    className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs flex flex-col items-center justify-center gap-2 border border-purple-200 transition"
                  >
                    <Sparkles size={20} className="text-purple-700" />
                    <span>{isRtl ? 'صياغة بيان الدعوة' : 'Generate Invite'}</span>
                  </button>
                </div>
              </div>

              {/* Major Milestone Timeline Preview */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Calendar size={18} className="text-amber-600" />
                    <span>{isRtl ? 'البرنامج العام ليوم العرس الجماعي' : 'Celebration Day Highlights'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('schedule')}
                    className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                  >
                    <span>{isRtl ? 'عرض البرنامج كاملاً' : 'Full Schedule'}</span>
                    <ChevronRight size={14} className="rtl:rotate-180" />
                  </button>
                </div>

                <div className="space-y-3">
                  {schedule.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-xl shrink-0">
                          {item.time}
                        </span>
                        <div>
                          <div className="font-extrabold text-gray-900 text-sm">{item.title}</div>
                          <div className="text-gray-500 text-xs flex items-center gap-2 mt-0.5">
                            <span>{item.location}</span>
                            <span>•</span>
                            <span>{item.coordinator}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${item.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'ongoing'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-gray-200 text-gray-700'
                          }`}
                      >
                        {item.status === 'completed'
                          ? isRtl ? 'مكتمل ✓' : 'Done ✓'
                          : item.status === 'ongoing'
                            ? isRtl ? 'جاري الآن ⏳' : 'Ongoing'
                            : isRtl ? 'قادم' : 'Upcoming'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Summary Highlights & Key Highlights */}
            <div className="space-y-6">

              {/* Traditional Hospitality Card */}
              <div className="bg-gradient-to-br from-amber-900 to-orange-950 text-white p-6 rounded-3xl shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Coffee size={24} className="text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">{isRtl ? 'ضيافة الشاهي والسقيا' : 'Traditional Tea & Water'}</h4>
                    <p className="text-xs text-amber-200">{isRtl ? 'جاهزية عدة الشاهي الحضرمي وفريق الشاهوجية' : 'Hadhrami Tea Kit & Hydration'}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs border-t border-white/10 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-200">{isRtl ? 'فريق الشاهوجية المتفرغين:' : 'Tea Crew Size:'}</span>
                    <span className="font-bold text-amber-100">{logistics.teaHospitality.teamSize} {isRtl ? 'شاهوجي' : 'members'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-200">{isRtl ? 'قدور التخدير ودلال الصب:' : 'Brewing Pots & Kettles:'}</span>
                    <span className="font-bold text-amber-100">{logistics.teaHospitality.brewingPots} {isRtl ? 'قدور كبرى' : 'pots'} / {logistics.teaHospitality.servingKettles} {isRtl ? 'دلال' : 'kettles'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-200">{isRtl ? 'برادات وترامس المياه الباردة:' : 'Cold Water Dispensers:'}</span>
                    <span className="font-bold text-amber-100">{logistics.hydration.largeDispensers} {isRtl ? 'براد/ترمس 80L' : 'large dispensers'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-200">{isRtl ? 'قوالب الثلج المقررة:' : 'Ice Blocks Allocated:'}</span>
                    <span className="font-bold text-amber-100">{logistics.hydration.iceBlocks} {isRtl ? 'قالب ثلج' : 'blocks'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('logistics')}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs transition"
                >
                  {isRtl ? 'فتح تفاصيل حاسبة التموين 📋' : 'View Full Logistics 📋'}
                </button>
              </div>

              {/* Financial Snapshot */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
                <h4 className="font-black text-base text-gray-900 flex items-center gap-2">
                  <Coins size={18} className="text-emerald-600" />
                  <span>{isRtl ? 'الموقف المالي العام' : 'Financial Snapshot'}</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRtl ? 'الميزانية المستهدفة:' : 'Target Budget:'}</span>
                    <span className="font-bold text-gray-900">{weddingInfo.estimatedTotalBudget?.toLocaleString()} ر.ي</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRtl ? 'إجمالي الرعايات والتبرعات:' : 'Total Raised:'}</span>
                    <span className="font-bold text-emerald-600">{totalSponsorships.toLocaleString()} ر.ي</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRtl ? 'المصروفات المقدرة:' : 'Estimated Expenses:'}</span>
                    <span className="font-bold text-rose-600">{totalExpenses.toLocaleString()} ر.ي</span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between font-black text-sm">
                    <span>{isRtl ? 'الفائض / العجز المالي:' : 'Balance:'}</span>
                    <span className={totalSponsorships >= totalExpenses ? 'text-emerald-600' : 'text-rose-600'}>
                      {(totalSponsorships - totalExpenses).toLocaleString()} ر.ي
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* === SUB-TAB 2: COUPLES ROSTER === */}
      {activeSubTab === 'couples' && (
        <div className="space-y-4">

          {/* Header Controls */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={coupleSearch}
                  onChange={(e) => setCoupleSearch(e.target.value)}
                  placeholder={isRtl ? 'ابحث باسم العريس، القبيلة، أو المنطقة...' : 'Search couple, tribe, area...'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
                <Search size={16} className={`absolute top-3.5 ${isRtl ? 'left-3' : 'right-3'} text-gray-400`} />
              </div>

              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCoupleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${coupleFilter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  {isRtl ? 'الكل' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setCoupleFilter('ready')}
                  className={`px-3 py-1.5 rounded-lg transition ${coupleFilter === 'ready' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'}`}
                >
                  {isRtl ? 'المكتملون' : 'Verified'}
                </button>
                <button
                  type="button"
                  onClick={() => setCoupleFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition ${coupleFilter === 'pending' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500'}`}
                >
                  {isRtl ? 'قيد المتابعة' : 'Pending'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCoupleModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-md transition shrink-0"
            >
              <Plus size={18} />
              <span>{isRtl ? 'إضافة عريس للسجل' : 'Register New Couple'}</span>
            </button>
          </div>

          {/* Couples Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCouples.map((c, index) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-base text-gray-900">{c.groomName}</h4>
                      <p className="text-xs text-gray-500">{c.brideName}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCouple(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title={isRtl ? 'حذف العريس' : 'Delete'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-bold">{c.tribe}</span>
                  <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{c.area}</span>
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <Phone size={12} />
                      <span dir="ltr">{c.phone}</span>
                    </a>
                  )}
                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                    {c.guestQuota || 35} {isRtl ? 'بطاقة دعوة' : 'invitations'}
                  </span>
                </div>

                {/* Status Toggles */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-[11px]">

                  {/* Medical status */}
                  <button
                    type="button"
                    onClick={() => handleToggleCoupleStatus(c.id, 'medicalStatus')}
                    className={`p-2 rounded-xl text-center font-bold transition flex flex-col items-center gap-1 ${c.medicalStatus === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                  >
                    <span>{isRtl ? 'الفحص الطبي' : 'Medical Check'}</span>
                    <span className="text-[10px]">
                      {c.medicalStatus === 'completed' ? (isRtl ? 'مكتمل ✓' : 'Done ✓') : (isRtl ? 'قيد الإجراء ⏳' : 'Pending')}
                    </span>
                  </button>

                  {/* Contract status */}
                  <button
                    type="button"
                    onClick={() => handleToggleCoupleStatus(c.id, 'contractStatus')}
                    className={`p-2 rounded-xl text-center font-bold transition flex flex-col items-center gap-1 ${c.contractStatus === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                  >
                    <span>{isRtl ? 'عقد القران' : 'Marriage Contract'}</span>
                    <span className="text-[10px]">
                      {c.contractStatus === 'completed' ? (isRtl ? 'موثق ✓' : 'Signed ✓') : (isRtl ? 'مجدول ⏳' : 'Scheduled')}
                    </span>
                  </button>

                  {/* Aid / Gifting status */}
                  <button
                    type="button"
                    onClick={() => handleToggleCoupleStatus(c.id, 'aidStatus')}
                    className={`p-2 rounded-xl text-center font-bold transition flex flex-col items-center gap-1 ${c.aidStatus === 'delivered'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    <span>{isRtl ? 'الكسوة والمنحة' : 'Groom Aid'}</span>
                    <span className="text-[10px]">
                      {c.aidStatus === 'delivered' ? (isRtl ? 'تم التسليم 🎁' : 'Delivered 🎁') : (isRtl ? 'قيد التجهيز' : 'Processing')}
                    </span>
                  </button>

                </div>

                {c.notes && (
                  <p className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-xl italic">
                    {c.notes}
                  </p>
                )}
              </div>
            ))}
          </div>

          {filteredCouples.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500 space-y-3">
              <Users2 size={40} className="mx-auto text-gray-300" />
              <p className="font-bold">{isRtl ? 'لم يتم العثور على عرسان مطابقين للبحث' : 'No couples matched your search'}</p>
            </div>
          )}

        </div>
      )}

      {/* === SUB-TAB 3: COMMITTEES & TEAMS === */}
      {activeSubTab === 'committees' && (
        <div className="space-y-4">

          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900">
                {isRtl ? 'اللجان التنظيمية والفرق الميدانية' : 'Organizing Committees & Field Teams'}
              </h3>
              <p className="text-xs text-gray-500">
                {isRtl ? 'توزيع المهام والمسؤولين والمتطوعين لإدارة ساحات الحفل والوليمة والشاهي' : 'Assign duties, leads, and volunteers across venue logistics and catering'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCommitteeModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
            >
              <Plus size={16} />
              <span>{isRtl ? 'إضافة لجنة تنظيمية' : 'Add Committee'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {committees.map((com) => (
              <div
                key={com.id}
                className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition space-y-4 relative group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black text-base text-gray-900">{com.name}</h4>
                    <p className="text-xs text-gray-500">{com.nameEn}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCommittee(com.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title={isRtl ? 'حذف اللجنة' : 'Delete'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl font-bold">
                    <span>{isRtl ? 'المشرف:' : 'Head:'}</span>
                    <span>{com.leader}</span>
                  </div>

                  {com.phone && (
                    <a
                      href={`tel:${com.phone}`}
                      className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-bold transition"
                    >
                      <Phone size={13} />
                      <span dir="ltr">{com.phone}</span>
                    </a>
                  )}

                  <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-bold">
                    <span>{com.volunteersCount} {isRtl ? 'متطوع' : 'volunteers'}</span>
                  </div>
                </div>

                {com.responsibilities && com.responsibilities.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {isRtl ? 'المهام والمسؤوليات الرئيسية:' : 'Key Responsibilities:'}
                    </span>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {com.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      )}

      {/* === SUB-TAB 4: BUDGET & SPONSORS === */}
      {activeSubTab === 'budget' && (
        <div className="space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Sponsors & Donors */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Coins size={18} className="text-emerald-600" />
                    <span>{isRtl ? 'سجل الرعاة والداعمين وأهل الخير' : 'Sponsors & Philanthropists'}</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isRtl ? 'إجمالي الدعم:' : 'Total Raised:'} <strong className="text-emerald-600">{totalSponsorships.toLocaleString()} ر.ي</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddSponsorModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus size={15} />
                  <span>{isRtl ? 'إضافة راعي' : 'Add Sponsor'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {sponsorships.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{sp.sponsorName}</div>
                      <div className="text-gray-500 text-xs flex items-center gap-2 mt-0.5">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                          {sp.type}
                        </span>
                        <span>{sp.contact}</span>
                      </div>
                      {sp.notes && <p className="text-[11px] text-gray-400 mt-1 italic">{sp.notes}</p>}
                    </div>

                    <div className="text-left rtl:text-right shrink-0">
                      <div className="font-black text-emerald-700 text-sm">
                        {sp.amount?.toLocaleString()} ر.ي
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSponsor(sp.id)}
                        className="text-gray-400 hover:text-rose-600 text-[11px] mt-1 transition"
                      >
                        {isRtl ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Collective Expenses */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Coins size={18} className="text-rose-600" />
                    <span>{isRtl ? 'مصروفات وتجهيزات العرس الجماعي' : 'Collective Mass Expenses'}</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isRtl ? 'إجمالي المصروفات:' : 'Total Costs:'} <strong className="text-rose-600">{totalExpenses.toLocaleString()} ر.ي</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus size={15} />
                  <span>{isRtl ? 'إضافة بند' : 'Add Cost'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{exp.item}</div>
                      <span className="text-[11px] text-gray-400 font-semibold">{exp.category}</span>
                    </div>

                    <div className="text-left rtl:text-right shrink-0">
                      <div className="font-black text-rose-700 text-sm">
                        {exp.amount?.toLocaleString()} ر.ي
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-gray-400 hover:text-rose-600 text-[11px] mt-1 transition"
                      >
                        {isRtl ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* === SUB-TAB 5: UNIFIED CEREMONIES SCHEDULE === */}
      {activeSubTab === 'schedule' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900">
                {isRtl ? 'جدول برنامج ومراحل الفعاليات المشتركة' : 'Unified Ceremonies Timeline'}
              </h3>
              <p className="text-xs text-gray-500">
                {isRtl ? 'تسلسل فعاليات يوم الزفاف من استقبال الوفود حتى السمرة الجماعية، اضغط على الحالة لتحديثها' : 'Chronological sequence of the day. Click status badge to cycle state.'}
              </p>
            </div>
          </div>

          <div className="relative border-s-2 border-amber-200 ms-4 space-y-6">
            {schedule.map((item, idx) => (
              <div key={item.id} className="relative ms-6 space-y-1">
                <span
                  className={`absolute -start-9 top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${item.status === 'completed'
                    ? 'bg-emerald-600'
                    : item.status === 'ongoing'
                      ? 'bg-amber-600 ring-4 ring-amber-100 animate-pulse'
                      : 'bg-gray-400'
                    }`}
                >
                  {idx + 1}
                </span>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-amber-200 transition space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-black text-amber-800 text-xs sm:text-sm bg-amber-100 px-3 py-1 rounded-xl w-fit">
                      {item.time}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleScheduleStatus(item.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition w-fit ${item.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : item.status === 'ongoing'
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 animate-pulse'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      {item.status === 'completed'
                        ? isRtl ? 'تم بنجاح ✓' : 'Completed ✓'
                        : item.status === 'ongoing'
                          ? isRtl ? 'جاري الآن ⏳' : 'Ongoing ⏳'
                          : isRtl ? 'قادم 🕒' : 'Upcoming 🕒'}
                    </button>
                  </div>

                  <h4 className="font-black text-base text-gray-900">{item.title}</h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-amber-600" />
                      <span>{item.location}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HeartHandshake size={13} className="text-amber-600" />
                      <span>{item.coordinator}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* === SUB-TAB 6: LOGISTICS & BANQUET CALCULATOR (WITH TEA & WATER DISPENSERS) === */}
      {activeSubTab === 'logistics' && (
        <div className="space-y-6">

          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-700 to-amber-800 text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20 text-orange-100">
                  <Utensils size={14} />
                  <span>{isRtl ? 'الحاسبة الذكية للأعراس الجماعية' : 'Smart Logistics Calculator'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{isRtl ? 'حاسبة التموين والوليمة الكبرى وضيافة الشاهي والسقيا' : 'Banquet, Tea & Hydration Logistics'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed">
                  {isRtl
                    ? `حساب دقيق وتفاعلي لمؤن الذبائح والأرز وعدة الشاي والسموار وبرادات المياه بناءً على (${couples.length}) عريس مسجل. جميع المعدلات والمواد قابلة للتعديل والإضافة حسب تفضيل المنظمين.`
                    : `Interactive logistics calculator for livestock, tea kit team, samovars, and cold water hydration based on (${couples.length}) couples. Fully customizable rates and expandable items.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditRatesModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-orange-800 hover:bg-orange-50 rounded-2xl font-black text-xs sm:text-sm shadow-md transition"
                >
                  <Sliders size={16} className="text-orange-600" />
                  <span>{isRtl ? '⚙️ تعديل معدلات الاستهلاك' : 'Tune Rates'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingSupplyItem(null);
                    setShowAddSupplyModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition"
                >
                  <Plus size={16} />
                  <span>{isRtl ? '➕ إضافة مادة أو مؤونة' : 'Add Item'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetRates}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs backdrop-blur-md transition border border-white/20"
                  title={isRtl ? 'استعادة المعدلات الافتراضية' : 'Reset to Defaults'}
                >
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">{isRtl ? 'استعادة الافتراضي' : 'Reset'}</span>
                </button>
              </div>
            </div>

            {/* Quick Rates Strip */}
            <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2 text-[11px] font-bold text-orange-100">
              <span className="text-white/80">{isRtl ? 'المعدلات المطبقة حالياً:' : 'Active Rates:'}</span>
              <span className="bg-black/20 px-2.5 py-1 rounded-xl">
                🐑 {calculatorRates.sheepMode === 'fixed'
                  ? (isRtl ? `كمية ثابتة (${logistics.food.sheepCount} رأس)` : `Fixed (${logistics.food.sheepCount} sheep)`)
                  : (isRtl ? `1 ذبيحة لكل ${calculatorRates.guestsPerSheep} ضيف` : `1 sheep / ${calculatorRates.guestsPerSheep} guests`)}
              </span>
              <span className="bg-black/20 px-2.5 py-1 rounded-xl">
                ☕ {calculatorRates.teaTeamMode === 'fixed'
                  ? (isRtl ? `فريق شاي مقطوع (${logistics.teaHospitality.teamSize} أفراد)` : `Fixed Team (${logistics.teaHospitality.teamSize})`)
                  : (isRtl ? `1 فرد بعدة الشاي لكل ${calculatorRates.guestsPerTeaMember} ضيف` : `1 crew / ${calculatorRates.guestsPerTeaMember} guests`)}
              </span>
              <span className="bg-black/20 px-2.5 py-1 rounded-xl">
                🔥 {calculatorRates.samovarsMode === 'fixed'
                  ? (isRtl ? `سموارات ثابتة (${logistics.teaHospitality.samovarsCount})` : `Fixed Samovars (${logistics.teaHospitality.samovarsCount})`)
                  : (isRtl ? `1 سموار تخدير لكل ${calculatorRates.guestsPerSamovar} ضيف` : `1 samovar / ${calculatorRates.guestsPerSamovar} guests`)}
              </span>
              <span className="bg-black/20 px-2.5 py-1 rounded-xl">
                💧 {calculatorRates.waterDispensersMode === 'fixed'
                  ? (isRtl ? `برادات ثابتة (${logistics.hydration.largeDispensers})` : `Fixed Dispensers (${logistics.hydration.largeDispensers})`)
                  : (isRtl ? `1 براد ماء كبير لكل ${calculatorRates.guestsPerWaterDispenser} ضيف` : `1 dispenser / ${calculatorRates.guestsPerWaterDispenser} guests`)}
              </span>
              <span className="bg-black/20 px-2.5 py-1 rounded-xl">
                🍚 {calculatorRates.riceMode === 'fixed'
                  ? (isRtl ? `أرز ثابت (${logistics.food.riceBags40kg} كيس)` : `Fixed Rice (${logistics.food.riceBags40kg} sacks)`)
                  : (isRtl ? `1 كيس أرز لكل ${calculatorRates.guestsPerRiceBag40kg} ضيف` : `1 sack / ${calculatorRates.guestsPerRiceBag40kg} guests`)}
              </span>
            </div>
          </div>

          {/* 4 Standard Logistics Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Box 1: Grand Feast & Livestock */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                      <Utensils size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{isRtl ? 'الذبائح واللحوم والأرز' : 'Livestock & Banquet'}</h4>
                      <span className="text-[11px] text-gray-500">{isRtl ? 'وليمة الغداء الكبرى' : 'Grand Banquet'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-orange-50 text-orange-700 font-extrabold px-2 py-0.5 rounded-lg border border-orange-200">
                    {calculatorRates.sheepMode === 'fixed'
                      ? (isRtl ? '🔒 كمية مقطوعة' : '🔒 Fixed Quantity')
                      : (isRtl ? `${calculatorRates.guestsPerSheep} ضيف/رأس` : `${calculatorRates.guestsPerSheep} guests/sheep`)}
                  </span>
                </div>

                <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'عدد الذبائح التقديري:' : 'Estimated Sheep:'}</span>
                    <span className="font-extrabold text-orange-700 text-sm">{logistics.food.sheepCount} {isRtl ? 'رأس غنم' : 'sheep'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'صافي اللحم بالكيلو:' : 'Net Meat Approx:'}</span>
                    <span className="font-bold text-gray-800">{logistics.food.meatKilosApprox} كجم</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'أكياس أرز بسمتي (40 كجم):' : 'Rice Sacks (40kg):'}</span>
                    <span className="font-extrabold text-orange-700 text-sm">{logistics.food.riceBags40kg} {isRtl ? 'كيس' : 'sacks'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'كراتين زيت وسمن الطهي:' : 'Cooking Oil Cartons:'}</span>
                    <span className="font-bold text-gray-800">{logistics.food.cookingOilCartons} {isRtl ? 'كرتون' : 'cartons'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'بهارات مشكمة وتوابل:' : 'Spices Approx:'}</span>
                    <span className="font-bold text-gray-800">{logistics.food.spicesKilos} كجم</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-gray-400 border-t border-gray-50 flex items-center justify-between">
                <span>{isRtl ? 'بناءً على المعازيم والوجهاء' : 'Based on attendance'}</span>
                <button
                  type="button"
                  onClick={() => setShowEditRatesModal(true)}
                  className="text-orange-600 font-bold hover:underline"
                >
                  {isRtl ? 'تعديل المعدل ⚙️' : 'Tune ⚙️'}
                </button>
              </div>
            </div>

            {/* Box 2: Hadhrami Tea Kit & Tea Team (فريق عدة الشاي والسموار) */}
            <div className="bg-white p-5 rounded-3xl border-2 border-amber-300 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-200">
                      <Coffee size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{isRtl ? 'ضيافة الشاهي الحضرمي' : 'Hadhrami Tea Kit'}</h4>
                      <span className="text-[11px] text-amber-700 font-bold">{isRtl ? 'فريق عدة الشاي ومعدات السموار' : 'Tea Kit Team & Samovar'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-lg border border-amber-300">
                    {calculatorRates.teaTeamMode === 'fixed'
                      ? (isRtl ? '🔒 كمية مقطوعة' : '🔒 Fixed Crew')
                      : (isRtl ? `${calculatorRates.guestsPerTeaMember} ضيف/فرد` : `${calculatorRates.guestsPerTeaMember} guests/crew`)}
                  </span>
                </div>

                <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">{isRtl ? 'فريق عدة الشاي (صبابين ومعدين):' : 'Tea Kit Crew (Brewers & Pourers):'}</span>
                    <span className="font-extrabold text-amber-800 text-sm">{logistics.teaHospitality.teamSize} {isRtl ? 'أفراد' : 'crew'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">{isRtl ? 'أواني السموار للتخدير (السموارات):' : 'Samovars (السموار):'}</span>
                    <span className="font-extrabold text-amber-800 text-sm">{logistics.teaHospitality.samovarsCount} {isRtl ? 'سموارات كبرى' : 'samovars'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'برادات ودلال الصب المتنقلة:' : 'Serving Kettles (دلال):'}</span>
                    <span className="font-bold text-gray-800">{logistics.teaHospitality.servingKettles} {isRtl ? 'دلال وبرادات' : 'kettles'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'صينيات توزيع الشاي:' : 'Tea Serving Trays:'}</span>
                    <span className="font-extrabold text-amber-800 text-sm">{logistics.teaHospitality.teaTraysCount} {isRtl ? 'صينية تقديم' : 'trays'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'فناجين واستكانات الشاي:' : 'Tea Cups & Glasses:'}</span>
                    <span className="font-extrabold text-amber-800 text-sm">{(logistics.teaHospitality.teaCupsCount || logistics.teaHospitality.glassesCount || 0).toLocaleString()} {isRtl ? 'فنجان' : 'cups'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'أكياس السكر (50 كجم):' : 'Sugar Sacks (50kg):'}</span>
                    <span className="font-bold text-gray-800">{logistics.teaHospitality.sugarBags50kg} {isRtl ? 'كيس' : 'sacks'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'الشاي السيلاني بالكيلو:' : 'Ceylon Tea Leaves:'}</span>
                    <span className="font-bold text-gray-800">{logistics.teaHospitality.teaLeavesKg} كجم</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'فحم طبيعي للسموارات:' : 'Charcoal Sacks:'}</span>
                    <span className="font-bold text-gray-800">{logistics.teaHospitality.charcoalBags} {isRtl ? 'أكياس فحم' : 'sacks'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-amber-700/80 border-t border-amber-50 flex items-center justify-between">
                <span>{isRtl ? 'تجهيز الشاهي الأحمر والعدني طوال اليوم' : 'Continuous brewing'}</span>
                <button
                  type="button"
                  onClick={() => setShowEditRatesModal(true)}
                  className="text-amber-800 font-bold hover:underline"
                >
                  {isRtl ? 'تعديل عدة الشاي ⚙️' : 'Tune ⚙️'}
                </button>
              </div>
            </div>

            {/* Box 3: Cold Water Dispensers & Hydration (سقيا الماء البارد) */}
            <div className="bg-white p-5 rounded-3xl border-2 border-blue-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-200">
                      <Droplets size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{isRtl ? 'سقيا الماء البارد' : 'Cold Water Hydration'}</h4>
                      <span className="text-[11px] text-blue-700 font-bold">{isRtl ? 'برادات وترامس وتبريد' : 'Dispensers & Ice'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-800 font-extrabold px-2 py-0.5 rounded-lg border border-blue-200">
                    {calculatorRates.waterDispensersMode === 'fixed'
                      ? (isRtl ? '🔒 كمية مقطوعة' : '🔒 Fixed Quantity')
                      : (isRtl ? `${calculatorRates.guestsPerWaterDispenser} ضيف/براد` : `${calculatorRates.guestsPerWaterDispenser} guests/dispenser`)}
                  </span>
                </div>

                <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'برادات وترامس كبرى (60-80L):' : 'Large Dispensers (60-80L):'}</span>
                    <span className="font-extrabold text-blue-800 text-sm">{logistics.hydration.largeDispensers} {isRtl ? 'برادات وترامس' : 'units'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'قوالب الثلج المقررة للتبريد:' : 'Ice Blocks Allocated:'}</span>
                    <span className="font-extrabold text-blue-800 text-sm">{logistics.hydration.iceBlocks} {isRtl ? 'قالب ثلج' : 'ice blocks'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'كراتين مياه مبردة معبأة:' : 'Bottled Water Cartons:'}</span>
                    <span className="font-bold text-gray-800">{logistics.hydration.bottledWaterCartons} {isRtl ? 'كرتون' : 'cartons'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'أكواب شرب بلاستيكية/ورقية:' : 'Drinking Cups:'}</span>
                    <span className="font-bold text-gray-800">{logistics.hydration.cupsCount.toLocaleString()} {isRtl ? 'كوب' : 'cups'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-blue-600 border-t border-blue-50 flex items-center justify-between">
                <span>{isRtl ? 'توزيع في الساحات والمخادر' : 'Distributed around venue'}</span>
                <button
                  type="button"
                  onClick={() => setShowEditRatesModal(true)}
                  className="text-blue-700 font-bold hover:underline"
                >
                  {isRtl ? 'تعديل السقيا ⚙️' : 'Tune ⚙️'}
                </button>
              </div>
            </div>

            {/* Box 4: Venue & Pavilion Space (المخادر والخيام والفرش) */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Tent size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{isRtl ? 'المخادر والخيام والفرش' : 'Venue & Carpets'}</h4>
                      <span className="text-[11px] text-gray-500">{isRtl ? 'ساحة الاحتفال الكبرى' : 'Grounds Setup'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-900 font-extrabold px-2 py-0.5 rounded-lg border border-amber-200">
                    {calculatorRates.carpetsMode === 'fixed'
                      ? (isRtl ? '🔒 كمية مقطوعة' : '🔒 Fixed Quantity')
                      : (isRtl ? `${calculatorRates.guestsPerCarpet} ضيف/سجادة` : `${calculatorRates.guestsPerCarpet} guests/carpet`)}
                  </span>
                </div>

                <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'سجاد تقليدي كبير (4×3 م):' : 'Traditional Carpets:'}</span>
                    <span className="font-extrabold text-amber-900 text-sm">{logistics.venueLogistics.carpetsCount} {isRtl ? 'سجادة' : 'carpets'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'مساحة المظلات والخيام:' : 'Tents / Shade Area:'}</span>
                    <span className="font-bold text-gray-800">{logistics.venueLogistics.tentsAreaSqMeters} م²</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">{isRtl ? 'مراوح رذاذ وتبريد الساحة:' : 'Misting Fans / Coolers:'}</span>
                    <span className="font-bold text-gray-800">{logistics.venueLogistics.fansOrCoolersCount} {isRtl ? 'مروحة' : 'coolers'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-gray-400 border-t border-gray-50 flex items-center justify-between">
                <span>{isRtl ? 'تغطية الساحات المفتوحة' : 'Open grounds setup'}</span>
                <button
                  type="button"
                  onClick={() => setShowEditRatesModal(true)}
                  className="text-amber-800 font-bold hover:underline"
                >
                  {isRtl ? 'تعديل الفرش ⚙️' : 'Tune ⚙️'}
                </button>
              </div>
            </div>

          </div>

          {/* Section: Custom Logistics & Extra Provisions (المواد والمؤن المخصصة وإضافات المنظمين) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-base text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-600" />
                  <span>{isRtl ? 'المواد والمؤن المخصصة وإضافات المنظمين' : 'Custom Provisions & Specialized Supplies'}</span>
                  <span className="text-xs bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full">
                    {logistics.customSupplies.length}
                  </span>
                </h4>
                <p className="text-xs text-gray-500">
                  {isRtl
                    ? 'مواد ومستلزمات إضافية قام المنظمون بتخصيصها لحساب كمياتها تلقائياً مع كل زيادة في عدد العرسان والضيوف.'
                    : 'Additional custom materials with dynamic or fixed calculation rules added by event organizers.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingSupplyItem(null);
                  setShowAddSupplyModal(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition shrink-0"
              >
                <Plus size={15} />
                <span>{isRtl ? 'إضافة مادة أو مؤونة جديدة' : 'Add Custom Material'}</span>
              </button>
            </div>

            {/* Custom Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {logistics.customSupplies.map((item) => {
                const categoryBadge =
                  item.category === 'teaHospitality'
                    ? { label: isRtl ? 'عدة الشاي والسموار' : 'Tea Hospitality', color: 'bg-amber-100 text-amber-800 border-amber-200' }
                    : item.category === 'food'
                      ? { label: isRtl ? 'وليمة وطعام' : 'Food & Feast', color: 'bg-orange-100 text-orange-800 border-orange-200' }
                      : item.category === 'hydration'
                        ? { label: isRtl ? 'سقيا الماء' : 'Water & Hydration', color: 'bg-blue-100 text-blue-800 border-blue-200' }
                        : item.category === 'venue'
                          ? { label: isRtl ? 'الساحة والمخادر' : 'Venue & Setup', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
                          : { label: isRtl ? 'عامة' : 'General', color: 'bg-gray-100 text-gray-800 border-gray-200' };

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-amber-400 hover:shadow-sm transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${categoryBadge.color}`}>
                          {categoryBadge.label}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSupplyItem(item);
                              setShowAddSupplyModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                            title={isRtl ? 'تعديل المادة' : 'Edit Item'}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSupplyItem(item.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title={isRtl ? 'حذف المادة' : 'Delete Item'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h5 className="font-black text-sm text-gray-900">{item.name}</h5>

                      {item.note && (
                        <p className="text-[11px] text-gray-500 mt-1 italic leading-snug">{item.note}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                      <div className="text-[11px] text-gray-500">
                        {item.rateType === 'ratio'
                          ? `${isRtl ? '1 لكل' : '1 per'} ${item.ratio} ${isRtl ? 'ضيف' : 'guests'}`
                          : isRtl ? 'كمية مقطوعة ثابتة' : 'Fixed quantity'}
                      </div>
                      <div className="font-black text-sm sm:text-base text-gray-900 bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-2xs">
                        <span className="text-amber-700">{item.computedQuantity}</span>{' '}
                        <span className="text-xs text-gray-600 font-bold">{item.unit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Dotted Quick Add Box */}
              <button
                type="button"
                onClick={() => {
                  setEditingSupplyItem(null);
                  setShowAddSupplyModal(true);
                }}
                className="p-5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 text-gray-400 hover:text-amber-700 transition flex flex-col items-center justify-center gap-2 text-center group min-h-[110px]"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-amber-100 flex items-center justify-center text-gray-500 group-hover:text-amber-700 transition">
                  <Plus size={16} />
                </div>
                <span className="text-xs font-black">{isRtl ? 'إضافة مادة أو مؤونة جديدة' : 'Add New Supply Item'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* === SUB-TAB 7: AI MASS WEDDING ASSISTANT === */}
      {activeSubTab === 'ai' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-amber-600" />
                <span>{isRtl ? 'المساعد الذكي للأعراس الجماعية (الخطب والبيانات والتعاميم)' : 'AI Mass Wedding Assistant'}</span>
              </h3>
              <p className="text-xs text-gray-500">
                {isRtl
                  ? 'صياغة ذكية باللغة الحضرمية والفصحى للدعوات العامة، كلمة الحفل الافتتاحية، وتعاميم اللجان'
                  : 'Generate public declarations, committee speeches, and operational task directives'}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAiPromptType('invitation')}
                className={`px-3 py-1.5 rounded-xl transition ${aiPromptType === 'invitation' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600'}`}
              >
                {isRtl ? 'بيان الدعوة العامة' : 'Public Invite'}
              </button>
              <button
                type="button"
                onClick={() => setAiPromptType('speech')}
                className={`px-3 py-1.5 rounded-xl transition ${aiPromptType === 'speech' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600'}`}
              >
                {isRtl ? 'كلمة حفل اللجنة' : 'Keynote Speech'}
              </button>
              <button
                type="button"
                onClick={() => setAiPromptType('directives')}
                className={`px-3 py-1.5 rounded-xl transition ${aiPromptType === 'directives' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-600'}`}
              >
                {isRtl ? 'تعميم اللجان الميدانية' : 'Directives'}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={isAiLoading}
              onClick={handleRunAi}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {isAiLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{isRtl ? 'جاري الصياغة بالذكاء الاصطناعي...' : 'Generating...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{isRtl ? 'إنشاء النص الآن ✨' : 'Generate Now ✨'}</span>
                </>
              )}
            </button>
          </div>

          {aiOutput && (
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 border-b border-amber-200/60 pb-2">
                <span>{isRtl ? 'النص المقترح:' : 'Generated Content:'}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyAi}
                    className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-amber-100 rounded-lg text-amber-800 transition border border-amber-200"
                  >
                    {copiedAi ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copiedAi ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ' : 'Copy')}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(aiOutput)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white transition shadow-sm"
                  >
                    <Share2 size={14} />
                    <span>{isRtl ? 'مشاركة عبر واتساب' : 'Share WhatsApp'}</span>
                  </a>
                </div>
              </div>

              <div className="whitespace-pre-wrap text-sm text-gray-800 font-medium leading-relaxed font-sans">
                {aiOutput}
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- MODALS --- */}

      {/* Modal 1: Add Couple */}
      {showAddCoupleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4">
            <h3 className="text-lg font-black text-gray-900">{isRtl ? 'تسجيل عريس جديد في العرس الجماعي' : 'Add New Couple'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAddCouple({
                  id: `c-${Date.now()}`,
                  groomName: fd.get('groomName'),
                  brideName: fd.get('brideName'),
                  tribe: fd.get('tribe') || 'آل...',
                  area: fd.get('area') || weddingInfo.city,
                  phone: fd.get('phone') || '',
                  medicalStatus: fd.get('medicalStatus'),
                  contractStatus: fd.get('contractStatus'),
                  aidStatus: 'processing',
                  guestQuota: Number(fd.get('guestQuota')) || 35,
                  notes: fd.get('notes') || ''
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم العريس الرباعي' : 'Groom Name'}</label>
                <input type="text" name="groomName" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم العروس / العائلة' : 'Bride Family'}</label>
                <input type="text" name="brideName" required placeholder="كريمة..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'القبيلة / العائلة' : 'Tribe / Family'}</label>
                  <input type="text" name="tribe" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'المنطقة / الحي' : 'Area'}</label>
                  <input type="text" name="area" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'رقم الهاتف' : 'Phone'}</label>
                  <input type="text" name="phone" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5" dir="ltr" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'بطاقات الدعوة' : 'Invitations'}</label>
                  <input type="number" name="guestQuota" defaultValue="35" min="5" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الفحص الطبي' : 'Medical'}</label>
                  <select name="medicalStatus" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold">
                    <option value="completed">{isRtl ? 'مكتمل ✓' : 'Completed'}</option>
                    <option value="pending">{isRtl ? 'قيد الإجراء' : 'Pending'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'عقد القران' : 'Contract'}</label>
                  <select name="contractStatus" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold">
                    <option value="completed">{isRtl ? 'موثق ✓' : 'Completed'}</option>
                    <option value="in_progress">{isRtl ? 'قيد التوثيق' : 'In Progress'}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddCoupleModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-bold">{isRtl ? 'حفظ العريس' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Committee */}
      {showAddCommitteeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4">
            <h3 className="text-lg font-black text-gray-900">{isRtl ? 'إضافة لجنة تنظيمية' : 'Add Committee'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAddCommittee({
                  id: `com-${Date.now()}`,
                  name: fd.get('name'),
                  nameEn: fd.get('name'),
                  leader: fd.get('leader'),
                  phone: fd.get('phone') || '',
                  volunteersCount: Number(fd.get('volunteersCount')) || 10,
                  responsibilities: [fd.get('task1'), fd.get('task2')].filter(Boolean),
                  status: 'ready'
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم اللجنة' : 'Committee Name'}</label>
                <input type="text" name="name" required placeholder={isRtl ? 'لجنة...' : 'Committee...'} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'مشرف اللجنة' : 'Leader'}</label>
                  <input type="text" name="leader" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'عدد المتطوعين' : 'Volunteers'}</label>
                  <input type="number" name="volunteersCount" defaultValue="15" min="1" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'رقم الهاتف' : 'Phone'}</label>
                <input type="text" name="phone" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5" dir="ltr" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'المهمة الرئيسية الأولى' : 'Task 1'}</label>
                <input type="text" name="task1" placeholder={isRtl ? 'متابعة...' : 'Task...'} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddCommitteeModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-bold">{isRtl ? 'حفظ اللجنة' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Sponsor */}
      {showAddSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4">
            <h3 className="text-lg font-black text-gray-900">{isRtl ? 'تسجيل راعي أو داعم' : 'Add Sponsor'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAddSponsor({
                  id: `sp-${Date.now()}`,
                  sponsorName: fd.get('sponsorName'),
                  type: fd.get('type') || 'تبرع نقدي',
                  typeEn: 'Sponsor',
                  amount: Number(fd.get('amount')) || 1000000,
                  currency: 'ريال يمني',
                  status: 'confirmed',
                  contact: fd.get('contact') || '',
                  notes: fd.get('notes') || ''
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم الداعم أو المؤسسة' : 'Sponsor Name'}</label>
                <input type="text" name="sponsorName" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'نوع المساهمة' : 'Type'}</label>
                  <select name="type" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold">
                    <option value="رعاية ماسية">{isRtl ? 'رعاية ماسية' : 'Diamond'}</option>
                    <option value="رعاية ذهبية">{isRtl ? 'رعاية ذهبية' : 'Gold'}</option>
                    <option value="تبرع نقدي">{isRtl ? 'تبرع نقدي' : 'Cash'}</option>
                    <option value="مساهمة عينية">{isRtl ? 'مساهمة عينية (ذبائح/أرز)' : 'In-Kind'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'المبلغ أو القيمة (ر.ي)' : 'Amount (YER)'}</label>
                  <input type="number" name="amount" min="1000" step="50000" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'شخص الاتصال / المنسق' : 'Contact Person'}</label>
                <input type="text" name="contact" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddSponsorModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold">{isRtl ? 'حفظ الراعي' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Add Expense */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4">
            <h3 className="text-lg font-black text-gray-900">{isRtl ? 'إضافة بند مصروفات' : 'Add Expense'}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleAddExpense({
                  id: `exp-${Date.now()}`,
                  item: fd.get('item'),
                  itemEn: fd.get('item'),
                  amount: Number(fd.get('amount')) || 100000,
                  category: fd.get('category') || 'general',
                  status: 'approved'
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم بند المصروف' : 'Item'}</label>
                <input type="text" name="item" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'المبلغ (ر.ي)' : 'Amount'}</label>
                  <input type="number" name="amount" min="1000" step="10000" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الفئة' : 'Category'}</label>
                  <select name="category" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold">
                    <option value="banquet">{isRtl ? 'الوليمة والذبائح' : 'Banquet'}</option>
                    <option value="tea">{isRtl ? 'الشاهي والسقيا' : 'Tea & Water'}</option>
                    <option value="venue">{isRtl ? 'الساحة والمخادر' : 'Venue'}</option>
                    <option value="gifts">{isRtl ? 'الكسوة والمنح' : 'Groom Grants'}</option>
                    <option value="media">{isRtl ? 'الإعلام والتصوير' : 'Media'}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddExpenseModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold">{isRtl ? 'حفظ المصروف' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Edit Rates Modal */}
      {showEditRatesModal && (
        <EditRatesModal
          isOpen={showEditRatesModal}
          onClose={() => setShowEditRatesModal(false)}
          currentRates={calculatorRates}
          onSave={handleUpdateRates}
          onReset={handleResetRates}
          isRtl={isRtl}
        />
      )}

      {/* Modal 6: Add / Edit Supply Item Modal */}
      {showAddSupplyModal && (
        <SupplyItemModal
          isOpen={showAddSupplyModal}
          onClose={() => {
            setShowAddSupplyModal(false);
            setEditingSupplyItem(null);
          }}
          editingItem={editingSupplyItem}
          onSave={handleSaveSupplyItem}
          isRtl={isRtl}
        />
      )}

    </div>
  );
}

// ==========================================
// HELPER: RATE ITEM WITH RATIO / FIXED TOGGLE
// ==========================================
function RateItemCard({
  title,
  description,
  mode,
  onModeChange,
  ratioValue,
  onRatioChange,
  ratioUnitLabel,
  fixedValue,
  onFixedChange,
  fixedUnitLabel,
  isRtl
}) {
  return (
    <div className="p-2.5 sm:p-3 bg-gray-50/80 hover:bg-white rounded-2xl border border-gray-200/90 hover:border-amber-300 transition space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="min-w-0">
          <span className="font-bold text-xs text-gray-900 block truncate">{title}</span>
          {description && <span className="text-[10px] text-gray-500 leading-tight block truncate">{description}</span>}
        </div>

        {/* Segmented Mode Switcher */}
        <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-gray-200 shadow-2xs self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onModeChange('ratio')}
            className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold transition ${mode === 'ratio'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            {isRtl ? '📊 نسبة' : 'Ratio'}
          </button>
          <button
            type="button"
            onClick={() => onModeChange('fixed')}
            className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold transition ${mode === 'fixed'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            {isRtl ? '🔒 مقطوع' : 'Fixed'}
          </button>
        </div>
      </div>

      {/* Input Field according to active mode */}
      <div>
        {mode === 'ratio' ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              min="0.001"
              value={ratioValue ?? ''}
              onChange={(e) => onRatioChange(e.target.value)}
              className="w-full h-8 bg-white border border-gray-200 rounded-xl px-2.5 py-1 font-bold text-gray-900 text-xs shadow-2xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-gray-500 font-bold text-[10px] shrink-0">{ratioUnitLabel}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="any"
              min="0.1"
              value={fixedValue ?? ''}
              onChange={(e) => onFixedChange(e.target.value)}
              className="w-full h-8 bg-white border border-amber-300 rounded-xl px-2.5 py-1 font-bold text-amber-900 text-xs shadow-2xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-amber-800 font-bold text-[10px] shrink-0">{fixedUnitLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MODAL: EDIT CONSUMPTION & LOGISTICS RATES
// ==========================================
function EditRatesModal({ isOpen, onClose, currentRates, onSave, onReset, isRtl }) {
  const [rates, setRates] = useState({ ...currentRates });
  // Tabs: 'food' | 'tea' | 'water' | 'venue'
  const [activeTab, setActiveTab] = useState('food');

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setRates((prev) => ({
      ...prev,
      [field]: val === '' ? '' : Number(val)
    }));
  };

  const handleModeChange = (modeField, newMode) => {
    setRates((prev) => ({
      ...prev,
      [modeField]: newMode
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(rates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-100 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">

        {/* Pinned Sticky Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold shrink-0">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-gray-900">
                {isRtl ? 'تعديل معدلات الاستهلاك والتموين' : 'Edit Consumption & Logistics Rates'}
              </h3>
              <p className="text-[11px] text-gray-500 line-clamp-1">
                {isRtl ? 'تخصيص الحصص إما بنسبة وتناسب مع الحضور أو كميات مقطوعة ثابتة' : 'Tune items by guest ratio or fixed amounts'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pinned Category Tabs */}
        <div className="shrink-0 px-3 sm:px-5 py-2.5 bg-gray-50/70 border-b border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-none z-10">
          <button
            type="button"
            onClick={() => setActiveTab('food')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-xs whitespace-nowrap ${activeTab === 'food' ? 'bg-orange-100 text-orange-900 font-black shadow-2xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Utensils size={14} />
            <span>{isRtl ? 'الوليمة واللحوم والأرز' : 'Feast & Livestock'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tea')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-xs whitespace-nowrap ${activeTab === 'tea' ? 'bg-amber-100 text-amber-900 font-black shadow-2xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Coffee size={14} />
            <span>{isRtl ? 'عدة الشاي والسموار' : 'Tea Kit & Samovars'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('water')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-xs whitespace-nowrap ${activeTab === 'water' ? 'bg-blue-100 text-blue-900 font-black shadow-2xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Droplets size={14} />
            <span>{isRtl ? 'سقيا الماء البارد' : 'Cold Water'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('venue')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 text-xs whitespace-nowrap ${activeTab === 'venue' ? 'bg-amber-100 text-amber-950 font-black shadow-2xs border border-amber-300/60' : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Tent size={14} />
            <span>{isRtl ? 'المخادر والخيام والفرش' : 'Venue & Carpets'}</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} id="edit-rates-form" className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 custom-scrollbar min-h-0">

          {/* TAB 1: FEAST & LIVESTOCK (الوليمة واللحوم والأرز) */}
          {activeTab === 'food' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl text-[11px] text-orange-900 leading-relaxed flex items-center justify-between">
                <span>{isRtl ? '🍖 حدد لكل مادة إما حسابها تلقائياً بحسب عدد الضيوف أو تحديد كمية مقطوعة ثابتة.' : 'Set each item as ratio per guests or fixed quantity.'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RateItemCard
                  title={isRtl ? 'عدد الذبائح التقديري' : 'Estimated Sheep'}
                  description={isRtl ? 'وليمة الغداء الكبرى' : 'Banquet feast'}
                  mode={rates.sheepMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('sheepMode', m)}
                  ratioValue={rates.guestsPerSheep || 16}
                  onRatioChange={(v) => handleChange('guestsPerSheep', v)}
                  ratioUnitLabel={isRtl ? 'ضيف لكل رأس' : 'guests/sheep'}
                  fixedValue={rates.fixedSheepCount || 24}
                  onFixedChange={(v) => handleChange('fixedSheepCount', v)}
                  fixedUnitLabel={isRtl ? 'رأس غنم ثابت' : 'fixed sheep'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'صافي اللحم بالكيلو' : 'Net Meat Approx'}
                  description={isRtl ? 'اللحم الصافي المقدر للطهي' : 'Cooked meat kg'}
                  mode={rates.meatMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('meatMode', m)}
                  ratioValue={rates.meatKilosPerSheep || 13}
                  onRatioChange={(v) => handleChange('meatKilosPerSheep', v)}
                  ratioUnitLabel={isRtl ? 'كجم لكل ذبيحة' : 'kg/sheep'}
                  fixedValue={rates.fixedMeatKilos || 312}
                  onFixedChange={(v) => handleChange('fixedMeatKilos', v)}
                  fixedUnitLabel={isRtl ? 'كجم لحم ثابت' : 'fixed kg meat'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'أكياس أرز بسمتي (40 كجم)' : 'Rice Bags (40kg)'}
                  description={isRtl ? 'الأرز الحضرمي للمندي والكبسة' : 'Rice sacks'}
                  mode={rates.riceMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('riceMode', m)}
                  ratioValue={rates.guestsPerRiceBag40kg || 150}
                  onRatioChange={(v) => handleChange('guestsPerRiceBag40kg', v)}
                  ratioUnitLabel={isRtl ? 'ضيف لكل كيس' : 'guests/bag'}
                  fixedValue={rates.fixedRiceBags || 6}
                  onFixedChange={(v) => handleChange('fixedRiceBags', v)}
                  fixedUnitLabel={isRtl ? 'كيس أرز ثابت' : 'fixed bags'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'كراتين زيت وسمن الطهي' : 'Cooking Oil Cartons'}
                  description={isRtl ? 'المصنعية وإعداد قدور الأرز' : 'Cooking oil & ghee'}
                  mode={rates.oilMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('oilMode', m)}
                  ratioValue={rates.cookingOilPerRiceBag || 1.5}
                  onRatioChange={(v) => handleChange('cookingOilPerRiceBag', v)}
                  ratioUnitLabel={isRtl ? 'كرتون لكل كيس أرز' : 'cartons/rice bag'}
                  fixedValue={rates.fixedOilCartons || 9}
                  onFixedChange={(v) => handleChange('fixedOilCartons', v)}
                  fixedUnitLabel={isRtl ? 'كرتون زيت ثابت' : 'fixed oil cartons'}
                  isRtl={isRtl}
                />

                <div className="sm:col-span-2">
                  <RateItemCard
                    title={isRtl ? 'بهارات مشكلة وتوابل' : 'Spices & Seasoning'}
                    description={isRtl ? 'خلطة بهارات اللحم والأرز' : 'Banquet spices'}
                    mode={rates.spicesMode || 'ratio'}
                    onModeChange={(m) => handleModeChange('spicesMode', m)}
                    ratioValue={rates.spicesPerSheepKg || 1.2}
                    onRatioChange={(v) => handleChange('spicesPerSheepKg', v)}
                    ratioUnitLabel={isRtl ? 'كجم لكل ذبيحة' : 'kg/sheep'}
                    fixedValue={rates.fixedSpicesKg || 28}
                    onFixedChange={(v) => handleChange('fixedSpicesKg', v)}
                    fixedUnitLabel={isRtl ? 'كجم بهارات ثابت' : 'fixed kg spices'}
                    isRtl={isRtl}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEA & SAMOVAR (ضيافة الشاهي وفريق عدة الشاي والسموار) */}
          {activeTab === 'tea' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed flex items-center justify-between">
                <span>{isRtl ? '☕ تخصيص عدة الشاي والسموارات وفريق عدة الشاي بنسب الحضور أو كميات مقطوعة.' : 'Configure tea kit team and samovars with ratio or fixed amounts.'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RateItemCard
                  title={isRtl ? 'فريق عدة الشاي (صبابين ومعدين)' : 'Tea Crew (Brewers & Pourers)'}
                  description={isRtl ? 'الفريق المتفرغ لصب وإعداد الشاهي' : 'Tea hospitality crew'}
                  mode={rates.teaTeamMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('teaTeamMode', m)}
                  ratioValue={rates.guestsPerTeaMember || 70}
                  onRatioChange={(v) => handleChange('guestsPerTeaMember', v)}
                  ratioUnitLabel={isRtl ? 'ضيف لكل فرد' : 'guests/crew'}
                  fixedValue={rates.fixedTeaTeamSize || 16}
                  onFixedChange={(v) => handleChange('fixedTeaTeamSize', v)}
                  fixedUnitLabel={isRtl ? 'أفراد بعدة الشاي ثابت' : 'fixed crew'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'أواني السموار للتخدير (السموارات)' : 'Samovars (السموار)'}
                  description={isRtl ? 'أواني وقدور التخدير الكبرى بالفحم' : 'Brewing samovars'}
                  mode={rates.samovarsMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('samovarsMode', m)}
                  ratioValue={rates.guestsPerSamovar || 250}
                  onRatioChange={(v) => handleChange('guestsPerSamovar', v)}
                  ratioUnitLabel={isRtl ? 'ضيف لكل سموار' : 'guests/samovar'}
                  fixedValue={rates.fixedSamovarsCount || 4}
                  onFixedChange={(v) => handleChange('fixedSamovarsCount', v)}
                  fixedUnitLabel={isRtl ? 'سموار تخدير ثابت' : 'fixed samovars'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'برادات ودلال الصب المتنقلة' : 'Serving Kettles'}
                  description={isRtl ? 'دلال التوزيع بين الصفوف والمخادر' : 'Serving kettles'}
                  mode={rates.servingKettlesMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('servingKettlesMode', m)}
                  ratioValue={rates.guestsPerServingKettle || 60}
                  onRatioChange={(v) => handleChange('guestsPerServingKettle', v)}
                  ratioUnitLabel={isRtl ? 'ضيف لكل دلة' : 'guests/kettle'}
                  fixedValue={rates.fixedServingKettles || 14}
                  onFixedChange={(v) => handleChange('fixedServingKettles', v)}
                  fixedUnitLabel={isRtl ? 'دلال وبرادات ثابتة' : 'fixed kettles'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'أكياس السكر (50 كجم)' : 'Sugar Sacks (50kg)'}
                  description={isRtl ? 'سكر الشاهي الأحمر والعدني' : 'Sugar sacks'}
                  mode={rates.sugarMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('sugarMode', m)}
                  ratioValue={rates.guestsPerSugarBag50kg || 400}
                  onRatioChange={(v) => handleChange('guestsPerSugarBag50kg', v)}
                  ratioUnitLabel={isRtl ? 'ضيف لكل كيس' : 'guests/sack'}
                  fixedValue={rates.fixedSugarBags || 3}
                  onFixedChange={(v) => handleChange('fixedSugarBags', v)}
                  fixedUnitLabel={isRtl ? 'كيس سكر 50 كجم ثابت' : 'fixed sugar sacks'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'الشاي السيلاني الفاخر بالكيلو' : 'Ceylon Tea Leaves (Kg)'}
                  description={isRtl ? 'شاي أحمر كبوس أو سيلاني ممتاز' : 'Tea leaves'}
                  mode={rates.teaLeavesMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('teaLeavesMode', m)}
                  ratioValue={rates.teaKgPerGuest || 0.025}
                  onRatioChange={(v) => handleChange('teaKgPerGuest', v)}
                  ratioUnitLabel={isRtl ? 'كجم لكل ضيف' : 'kg/guest'}
                  fixedValue={rates.fixedTeaLeavesKg || 25}
                  onFixedChange={(v) => handleChange('fixedTeaLeavesKg', v)}
                  fixedUnitLabel={isRtl ? 'كجم شاي ثابت' : 'fixed tea kg'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'صينيات توزيع الشاي' : 'Tea Serving Trays'}
                  description={isRtl ? 'صواني حمل الفناجين بين الصفوف والمخادر' : 'Serving trays'}
                  mode={rates.teaTraysMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('teaTraysMode', m)}
                  ratioValue={rates.guestsPerTeaTray || 50}
                  onRatioChange={(v) => handleChange('guestsPerTeaTray', v)}
                  ratioUnitLabel={isRtl ? 'ضيف لكل صينية' : 'guests/tray'}
                  fixedValue={rates.fixedTeaTrays || 18}
                  onFixedChange={(v) => handleChange('fixedTeaTrays', v)}
                  fixedUnitLabel={isRtl ? 'صينية تقديم ثابتة' : 'fixed trays'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'فناجين واستكانات الشاي' : 'Tea Cups & Glasses'}
                  description={isRtl ? 'فناجين واستكانات تقديم الشاهي' : 'Glass tea cups & saucers'}
                  mode={rates.teaCupsMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('teaCupsMode', m)}
                  ratioValue={rates.teaCupsMultiplier || 1.5}
                  onRatioChange={(v) => handleChange('teaCupsMultiplier', v)}
                  ratioUnitLabel={isRtl ? 'فنجان لكل ضيف' : 'cups/guest'}
                  fixedValue={rates.fixedTeaCups || 1200}
                  onFixedChange={(v) => handleChange('fixedTeaCups', v)}
                  fixedUnitLabel={isRtl ? 'فنجان شاي ثابت' : 'fixed tea cups'}
                  isRtl={isRtl}
                />

                <div className="sm:col-span-2">
                  <RateItemCard
                    title={isRtl ? 'أكياس الفحم الطبيعي للسموارات' : 'Charcoal Sacks'}
                    description={isRtl ? 'فحم طبيعي لإشعال السموارات طوال اليوم' : 'Charcoal for samovars'}
                    mode={rates.charcoalMode || 'ratio'}
                    onModeChange={(m) => handleModeChange('charcoalMode', m)}
                    ratioValue={rates.charcoalBagsPerSamovar || 2.5}
                    onRatioChange={(v) => handleChange('charcoalBagsPerSamovar', v)}
                    ratioUnitLabel={isRtl ? 'أكياس فحم لكل سموار' : 'bags/samovar'}
                    fixedValue={rates.fixedCharcoalBags || 10}
                    onFixedChange={(v) => handleChange('fixedCharcoalBags', v)}
                    fixedUnitLabel={isRtl ? 'أكياس فحم ثابتة' : 'fixed charcoal sacks'}
                    isRtl={isRtl}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WATER & HYDRATION (سقيا الماء البارد) */}
          {activeTab === 'water' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-[11px] text-blue-900 leading-relaxed flex items-center justify-between">
                <span>{isRtl ? '💧 ضبط برادات وترامس المياه الباردة، قوالب الثلج، والكراتين بنسب أو كميات مقطوعة.' : 'Water dispensers, ice blocks, and bottled water rations.'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RateItemCard
                  title={isRtl ? 'برادات وترامس كبرى (60-80L)' : 'Large Water Dispensers'}
                  description={isRtl ? 'نقاط الشرب الباردة بالساحة' : 'Coolers & dispensers'}
                  mode={rates.waterDispensersMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('waterDispensersMode', m)}
                  ratioValue={rates.guestsPerWaterDispenser || 75}
                  onRatioChange={(v) => handleChange('guestsPerWaterDispenser', v)}
                  ratioUnitLabel={isRtl ? 'ضيف لكل براد' : 'guests/dispenser'}
                  fixedValue={rates.fixedWaterDispensers || 12}
                  onFixedChange={(v) => handleChange('fixedWaterDispensers', v)}
                  fixedUnitLabel={isRtl ? 'براد وترمس ثابت' : 'fixed dispensers'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'قوالب الثلج المقررة للتبريد' : 'Ice Blocks Allocated'}
                  description={isRtl ? 'ثلج نقي لتبريد البرادات طوال اليوم' : 'Ice blocks'}
                  mode={rates.iceBlocksMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('iceBlocksMode', m)}
                  ratioValue={rates.iceBlocksPerDispenser || 3}
                  onRatioChange={(v) => handleChange('iceBlocksPerDispenser', v)}
                  ratioUnitLabel={isRtl ? 'قوالب ثلج لكل براد' : 'blocks/dispenser'}
                  fixedValue={rates.fixedIceBlocks || 36}
                  onFixedChange={(v) => handleChange('fixedIceBlocks', v)}
                  fixedUnitLabel={isRtl ? 'قالب ثلج ثابت' : 'fixed ice blocks'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'كراتين مياه مبردة معبأة' : 'Bottled Water Cartons'}
                  description={isRtl ? 'عبوات مياه معبأة للمنصة والضيوف' : 'Bottled water'}
                  mode={rates.bottledWaterMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('bottledWaterMode', m)}
                  ratioValue={rates.guestsPerBottledCarton || 25}
                  onRatioChange={(v) => handleChange('guestsPerBottledCarton', v)}
                  ratioUnitLabel={isRtl ? 'ضيف لكل كرتون' : 'guests/carton'}
                  fixedValue={rates.fixedBottledWaterCartons || 40}
                  onFixedChange={(v) => handleChange('fixedBottledWaterCartons', v)}
                  fixedUnitLabel={isRtl ? 'كرتون مياه ثابت' : 'fixed cartons'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'أكواب شرب بلاستيكية/ورقية' : 'Drinking Cups'}
                  description={isRtl ? 'أكواب توزيع الماء' : 'Drinking cups'}
                  mode={rates.cupsMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('cupsMode', m)}
                  ratioValue={rates.cupsPerGuestMultiplier || 2.0}
                  onRatioChange={(v) => handleChange('cupsPerGuestMultiplier', v)}
                  ratioUnitLabel={isRtl ? 'أكواب لكل ضيف' : 'cups/guest'}
                  fixedValue={rates.fixedCups || 2000}
                  onFixedChange={(v) => handleChange('fixedCups', v)}
                  fixedUnitLabel={isRtl ? 'كوب شرب ثابت' : 'fixed cups'}
                  isRtl={isRtl}
                />
              </div>
            </div>
          )}

          {/* TAB 4: VENUE, TENTS & CARPETS (المخادر والخيام والفرش - مخصص مستقل) */}
          {activeTab === 'venue' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-2xl text-[11px] text-amber-950 leading-relaxed flex items-center justify-between">
                <span>{isRtl ? '🎪 قسم فرش الساحات، السجاد التقليدي، مساحة المظلات والخيام، ومراوح التبريد.' : 'Tents, carpets, shaded pavilion area, and cooler misting fans.'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RateItemCard
                  title={isRtl ? 'سجاد تقليدي كبير (4×3 م)' : 'Traditional Carpets'}
                  description={isRtl ? 'فرش مجالس المخادر والساحة' : 'Traditional ground carpets'}
                  mode={rates.carpetsMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('carpetsMode', m)}
                  ratioValue={rates.guestsPerCarpet || 11}
                  onRatioChange={(v) => handleChange('guestsPerCarpet', v)}
                  ratioUnitLabel={isRtl ? 'ضيف لكل سجادة' : 'guests/carpet'}
                  fixedValue={rates.fixedCarpets || 80}
                  onFixedChange={(v) => handleChange('fixedCarpets', v)}
                  fixedUnitLabel={isRtl ? 'سجادة تقليدية ثابتة' : 'fixed carpets'}
                  isRtl={isRtl}
                />

                <RateItemCard
                  title={isRtl ? 'مساحة المظلات والخيام والتظليل' : 'Tents & Shade Area (m²)'}
                  description={isRtl ? 'تغطية الساحة من الشمس' : 'Covered ground area'}
                  mode={rates.tentsMode || 'ratio'}
                  onModeChange={(m) => handleModeChange('tentsMode', m)}
                  ratioValue={rates.tentsSqMetersPerGuest || 1.4}
                  onRatioChange={(v) => handleChange('tentsSqMetersPerGuest', v)}
                  ratioUnitLabel={isRtl ? 'م² تظليل لكل ضيف' : 'sq m/guest'}
                  fixedValue={rates.fixedTentsArea || 1200}
                  onFixedChange={(v) => handleChange('fixedTentsArea', v)}
                  fixedUnitLabel={isRtl ? 'م² مساحة مظلات ثابتة' : 'fixed sq meters'}
                  isRtl={isRtl}
                />

                <div className="sm:col-span-2">
                  <RateItemCard
                    title={isRtl ? 'مراوح رذاذ وتبريد الساحة' : 'Misting Cooler Fans'}
                    description={isRtl ? 'تلطيف الهواء في المخادر والساحات' : 'Outdoor cooling fans'}
                    mode={rates.fansMode || 'ratio'}
                    onModeChange={(m) => handleModeChange('fansMode', m)}
                    ratioValue={rates.guestsPerCoolerFan || 50}
                    onRatioChange={(v) => handleChange('guestsPerCoolerFan', v)}
                    ratioUnitLabel={isRtl ? 'ضيف لكل مروحة' : 'guests/fan'}
                    fixedValue={rates.fixedFans || 16}
                    onFixedChange={(v) => handleChange('fixedFans', v)}
                    fixedUnitLabel={isRtl ? 'مروحة تبريد ثابتة' : 'fixed cooler fans'}
                    isRtl={isRtl}
                  />
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Pinned Sticky Footer */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-gray-100 bg-white flex items-center justify-between gap-2.5 z-10">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs transition"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">{isRtl ? 'استعادة الافتراضي' : 'Reset Defaults'}</span>
            <span className="sm:hidden">{isRtl ? 'الافتراضي' : 'Reset'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 transition"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              form="edit-rates-form"
              className="px-4 sm:px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition"
            >
              {isRtl ? 'حفظ وتطبيق المعدلات ✓' : 'Save & Apply ✓'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// MODAL: ADD / EDIT CUSTOM SUPPLY ITEM
// ==========================================
function SupplyItemModal({ isOpen, onClose, editingItem, onSave, isRtl }) {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    category: editingItem?.category || 'teaHospitality',
    unit: editingItem?.unit || (isRtl ? 'كرتون' : 'carton'),
    rateType: editingItem?.rateType || 'ratio',
    ratio: editingItem?.ratio || 50,
    fixedAmount: editingItem?.fixedAmount || 10,
    note: editingItem?.note || ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...(editingItem || {}),
      id: editingItem?.id || undefined,
      name: formData.name.trim(),
      category: formData.category,
      unit: formData.unit.trim(),
      rateType: formData.rateType,
      ratio: Number(formData.ratio) || 1,
      fixedAmount: Number(formData.fixedAmount) || 0,
      note: formData.note.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4 my-8">

        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base sm:text-lg font-black text-gray-900">
            {editingItem
              ? isRtl ? 'تعديل المادة أو المؤونة' : 'Edit Supply Item'
              : isRtl ? 'إضافة مادة أو مؤونة جديدة للحاسبة' : 'Add Custom Supply Item'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isRtl ? 'اسم المادة أو المؤونة' : 'Material / Item Name'}
            </label>
            <input
              type="text"
              required
              placeholder={isRtl ? 'مثال: كراتين زبادي، مجامر بخور وعود، فناجين خاصة...' : 'e.g. Incense burners, Yogurt cartons...'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الفئة' : 'Category'}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold"
              >
                <option value="teaHospitality">{isRtl ? 'عدة الشاي والسموار' : 'Tea Hospitality'}</option>
                <option value="food">{isRtl ? 'وليمة وإطعام' : 'Food & Feast'}</option>
                <option value="hydration">{isRtl ? 'سقيا الماء' : 'Water & Hydration'}</option>
                <option value="venue">{isRtl ? 'الساحة والمخادر' : 'Venue & Setup'}</option>
                <option value="general">{isRtl ? 'عامة' : 'General'}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'وحدة القياس' : 'Unit'}</label>
              <input
                type="text"
                required
                placeholder={isRtl ? 'كرتون / طقم / حبة...' : 'carton / set...'}
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'طريقة الاحتساب والتقدير' : 'Calculation Rule'}</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${formData.rateType === 'ratio' ? 'bg-amber-50 border-amber-400 font-black text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                <input
                  type="radio"
                  name="rateType"
                  value="ratio"
                  checked={formData.rateType === 'ratio'}
                  onChange={() => setFormData({ ...formData, rateType: 'ratio' })}
                  className="hidden"
                />
                <span>{isRtl ? 'نسبة وتناسب مع الحضور' : 'Ratio per Guests'}</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${formData.rateType === 'fixed' ? 'bg-amber-50 border-amber-400 font-black text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                <input
                  type="radio"
                  name="rateType"
                  value="fixed"
                  checked={formData.rateType === 'fixed'}
                  onChange={() => setFormData({ ...formData, rateType: 'fixed' })}
                  className="hidden"
                />
                <span>{isRtl ? 'كمية مقطوعة ثابتة' : 'Fixed Amount'}</span>
              </label>
            </div>
          </div>

          {formData.rateType === 'ratio' ? (
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {isRtl ? `1 ${formData.unit || 'وحدة'} لكل كم ضيف؟` : `1 ${formData.unit} per how many guests?`}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.ratio}
                  onChange={(e) => setFormData({ ...formData, ratio: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-black"
                />
                <span className="text-gray-500 font-bold shrink-0">{isRtl ? 'ضيف' : 'guests'}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {isRtl ? `الكمية الإجمالية الثابتة (${formData.unit})` : `Fixed Total Amount (${formData.unit})`}
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.fixedAmount}
                onChange={(e) => setFormData({ ...formData, fixedAmount: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-black"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isRtl ? 'ملاحظات أو توجيهات (اختياري)' : 'Notes / Instructions'}
            </label>
            <textarea
              rows="2"
              placeholder={isRtl ? 'ملاحظة للمشرفين على توزيع هذه المادة...' : 'Optional directions...'}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs"
            ></textarea>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black shadow-md"
            >
              {isRtl ? 'حفظ المادة ✓' : 'Save Item ✓'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
