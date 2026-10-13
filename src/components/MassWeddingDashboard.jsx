import * as XLSX from 'xlsx';
import React, { useState, useMemo } from 'react';
import {
  Printer, ArrowRight, FileSpreadsheet, UserPlus, UploadCloud, Download,
  Users2, HeartHandshake, Utensils, Calendar, Clock, MapPin,
  Sparkles, CheckCircle2, AlertCircle, Plus, Trash2, Search,
  Phone, Share2, Copy, Check, Filter, ArrowUpRight, ShieldCheck,
  Building2, Coins, Droplets, Coffee, Flame, Tent, Award,
  FileText, MessageSquare, ChevronRight, Edit3, Send, Loader2,
  Sliders, RotateCcw, X, Edit2, Radio, QrCode as QrIcon, Eye
} from 'lucide-react';
import {
  calculateMassWeddingLogistics,
  DEFAULT_CALCULATOR_RATES,
  DEFAULT_CUSTOM_LOGISTICS_ITEMS
} from '../data/massWeddingTemplates';
import CommandBroadcastHub from './CommandBroadcastHub';
import CommitteeQrModal from './CommitteeQrModal';
import CommitteePortalView from './CommitteePortalView';
import { generateCommitteePortalUrl } from '../utils/portalHelpers';

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
  const [editingCouple, setEditingCouple] = useState(null);
  const [showAddCommitteeModal, setShowAddCommitteeModal] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState(null);
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState(null);
  const [showAddSupplyModal, setShowAddSupplyModal] = useState(false);
  const [editingSupplyItem, setEditingSupplyItem] = useState(null);
  const [supplyCategoryFilter, setSupplyCategoryFilter] = useState('all');
  const [supplySearchQuery, setSupplySearchQuery] = useState('');

  // --- Committee Detailed Page & Members States ---
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showImportExcelModal, setShowImportExcelModal] = useState(false);
  const [showPdfReportModal, setShowPdfReportModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [excelPreviewMembers, setExcelPreviewMembers] = useState([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [excelError, setExcelError] = useState('');
  const [newInlineTaskText, setNewInlineTaskText] = useState('');
  const [formDynamicTasks, setFormDynamicTasks] = useState(['']);

  // --- Broadcast Hub, QR & Mobile Portal States ---
  const [committeesSectionView, setCommitteesSectionView] = useState('list'); // 'list' | 'broadcast'
  const [qrModalData, setQrModalData] = useState(null); // { committee, portalUrl }
  const [portalPreviewCommittee, setPortalPreviewCommittee] = useState(null);
  const [copiedPortalFor, setCopiedPortalFor] = useState(null);

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

  const coupleStats = useMemo(() => {
    let medicalReady = 0;
    let contractsApproved = 0;
    let fullyCompleted = 0;

    for (let i = 0; i < couples.length; i++) {
      const c = couples[i];
      const isMedicalCompleted = c.medicalStatus === 'completed';
      const isContractCompleted = c.contractStatus === 'completed';

      if (isMedicalCompleted) medicalReady++;
      if (isContractCompleted) contractsApproved++;
      if (isMedicalCompleted && isContractCompleted) fullyCompleted++;
    }

    return { medicalReady, contractsApproved, fullyCompleted };
  }, [couples]);

  const completedCouplesCount = coupleStats.fullyCompleted;

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
      couples,
      weddingInfo,
      calculatorRates,
      customItems
    );
  }, [couples, weddingInfo, calculatorRates, customItems]);

  const filteredSupplies = useMemo(() => {
    return (logistics.customSupplies || []).filter((item) => {
      const matchesCategory = supplyCategoryFilter === 'all' || item.category === supplyCategoryFilter;
      const matchesSearch = !supplySearchQuery.trim() ||
        item.name.toLowerCase().includes(supplySearchQuery.toLowerCase()) ||
        (item.note && item.note.toLowerCase().includes(supplySearchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [logistics.customSupplies, supplyCategoryFilter, supplySearchQuery]);

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
  const handleSaveCouple = (coupleData) => {
    let updated;
    if (coupleData.id && couples.some((c) => c.id === coupleData.id)) {
      updated = couples.map((c) => (c.id === coupleData.id ? { ...c, ...coupleData } : c));
    } else {
      updated = [{ ...coupleData, id: coupleData.id || `c-${Date.now()}` }, ...couples];
    }
    onUpdateData({ ...data, couples: updated });
    setShowAddCoupleModal(false);
    setEditingCouple(null);
  };

  const handleEditCouple = (couple) => {
    setEditingCouple(couple);
    setShowAddCoupleModal(true);
  };

  const handleDeleteCouple = (coupleId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا العريس من السجل؟' : 'Remove this couple from the roster?')) {
      const updated = couples.filter((c) => c.id !== coupleId);
      onUpdateData({ ...data, couples: updated });
      if (editingCouple?.id === coupleId) {
        setEditingCouple(null);
        setShowAddCoupleModal(false);
      }
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
  const handleSaveCommittee = (comData) => {
    let updated;
    if (comData.id && committees.some((com) => com.id === comData.id)) {
      updated = committees.map((com) => (com.id === comData.id ? { ...com, ...comData } : com));
    } else {
      updated = [...committees, { ...comData, id: comData.id || `com-${Date.now()}` }];
    }
    onUpdateData({ ...data, committees: updated });
    setShowAddCommitteeModal(false);
    setEditingCommittee(null);
  };

  const handleEditCommittee = (committee) => {
    setEditingCommittee(committee);
    const existingTasks = (committee.tasks && committee.tasks.length > 0)
      ? committee.tasks.map(t => typeof t === 'string' ? t : t.text)
      : (committee.responsibilities || ['']);
    setFormDynamicTasks(existingTasks.length > 0 ? existingTasks : ['']);
    setShowAddCommitteeModal(true);
  };

  // --- Handlers: Committee Members & Tasks ---
  const handleSaveMember = (committeeId, memberData) => {
    const updatedCommittees = committees.map((com) => {
      if (com.id === committeeId) {
        const currentMembers = com.members || [];
        let updatedMembers;
        if (memberData.id && currentMembers.some((m) => m.id === memberData.id)) {
          updatedMembers = currentMembers.map((m) => (m.id === memberData.id ? { ...m, ...memberData } : m));
        } else {
          updatedMembers = [...currentMembers, { ...memberData, id: memberData.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }];
        }
        return {
          ...com,
          members: updatedMembers,
          volunteersCount: Math.max(com.volunteersCount || 0, updatedMembers.length)
        };
      }
      return com;
    });
    onUpdateData({ ...data, committees: updatedCommittees });
    setShowAddMemberModal(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (committeeId, memberId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا العضو من اللجنة؟' : 'Remove this member?')) {
      const updatedCommittees = committees.map((com) => {
        if (com.id === committeeId) {
          const updatedMembers = (com.members || []).filter((m) => m.id !== memberId);
          return { ...com, members: updatedMembers };
        }
        return com;
      });
      onUpdateData({ ...data, committees: updatedCommittees });
    }
  };

  const handleToggleCommitteeTask = (committeeId, taskId) => {
    const updatedCommittees = committees.map((com) => {
      if (com.id === committeeId) {
        // Normalize tasks
        const currentTasks = (com.tasks && com.tasks.length > 0)
          ? com.tasks
          : (com.responsibilities || []).map((r, i) => ({ id: `task-${i}`, text: r, completed: false }));
        
        const updatedTasks = currentTasks.map((t, idx) => {
          const tid = t.id || `task-${idx}`;
          if (tid === taskId || idx === taskId) {
            return { ...t, completed: !t.completed };
          }
          return t;
        });
        return { ...com, tasks: updatedTasks };
      }
      return com;
    });
    onUpdateData({ ...data, committees: updatedCommittees });
  };

  const handleAddCommitteeTask = (committeeId, taskText) => {
    if (!taskText || !taskText.trim()) return;
    const updatedCommittees = committees.map((com) => {
      if (com.id === committeeId) {
        const currentTasks = (com.tasks && com.tasks.length > 0)
          ? com.tasks
          : (com.responsibilities || []).map((r, i) => ({ id: `task-${i}`, text: r, completed: false }));
        const newTask = {
          id: `task-${Date.now()}`,
          text: taskText.trim(),
          completed: false
        };
        return {
          ...com,
          tasks: [...currentTasks, newTask],
          responsibilities: [...(com.responsibilities || []), taskText.trim()]
        };
      }
      return com;
    });
    onUpdateData({ ...data, committees: updatedCommittees });
    setNewInlineTaskText('');
  };

  const handleDeleteCommitteeTask = (committeeId, taskId) => {
    const updatedCommittees = committees.map((com) => {
      if (com.id === committeeId) {
        const currentTasks = (com.tasks && com.tasks.length > 0)
          ? com.tasks
          : (com.responsibilities || []).map((r, i) => ({ id: `task-${i}`, text: r, completed: false }));
        const updatedTasks = currentTasks.filter((t, idx) => (t.id || `task-${idx}`) !== taskId && idx !== taskId);
        return { ...com, tasks: updatedTasks, responsibilities: updatedTasks.map(t => t.text) };
      }
      return com;
    });
    onUpdateData({ ...data, committees: updatedCommittees });
  };

  // Excel / CSV File Parsing Handler
  const handleExcelFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);
    setExcelError('');
    setExcelPreviewMembers([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const dataRows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!dataRows || dataRows.length < 2) {
          setExcelError(isRtl ? 'الملف فارغ أو لا يحتوي على صفوف كافية.' : 'File is empty or missing rows.');
          return;
        }

        // Detect headers in row 0
        const headers = dataRows[0].map(h => String(h || '').trim().toLowerCase());
        let nameIdx = headers.findIndex(h => h.includes('اسم') || h.includes('name'));
        let phoneIdx = headers.findIndex(h => h.includes('هاتف') || h.includes('جوال') || h.includes('phone') || h.includes('mobile'));
        let roleIdx = headers.findIndex(h => h.includes('دور') || h.includes('صفة') || h.includes('مهمة') || h.includes('role'));

        // Fallback default indexes if not matched
        if (nameIdx === -1) nameIdx = 0;
        if (phoneIdx === -1) phoneIdx = 1 < headers.length ? 1 : -1;
        if (roleIdx === -1) roleIdx = 2 < headers.length ? 2 : -1;

        const parsed = [];
        for (let i = 1; i < dataRows.length; i++) {
          const row = dataRows[i];
          if (!row || row.length === 0) continue;
          const name = String(row[nameIdx] || '').trim();
          if (!name) continue;
          const phone = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '';
          const role = roleIdx !== -1 ? String(row[roleIdx] || '').trim() : (isRtl ? 'عضو ميداني' : 'Field Member');

          parsed.push({
            id: `mem-import-${Date.now()}-${i}`,
            name,
            phone,
            role: role || (isRtl ? 'عضو ميداني' : 'Field Member')
          });
        }

        if (parsed.length === 0) {
          setExcelError(isRtl ? 'لم يتم العثور على أي أسماء صالحة في الملف.' : 'No valid names found in file.');
        } else {
          setExcelPreviewMembers(parsed);
        }
      } catch (err) {
        console.error('Error parsing excel file:', err);
        setExcelError(isRtl ? 'تعذر قراءة الملف. يرجى التأكد من صيغة الملف (.xlsx أو .csv).' : 'Failed to parse file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImportExcel = (committeeId) => {
    if (!excelPreviewMembers || excelPreviewMembers.length === 0) return;
    const updatedCommittees = committees.map((com) => {
      if (com.id === committeeId) {
        const currentMembers = com.members || [];
        const merged = [...currentMembers, ...excelPreviewMembers];
        return {
          ...com,
          members: merged,
          volunteersCount: Math.max(com.volunteersCount || 0, merged.length)
        };
      }
      return com;
    });
    onUpdateData({ ...data, committees: updatedCommittees });
    setShowImportExcelModal(false);
    setExcelPreviewMembers([]);
    setExcelFileName('');
    alert(isRtl ? `تم استيراد ${excelPreviewMembers.length} عضو بنجاح! ✓` : `Imported ${excelPreviewMembers.length} members! ✓`);
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = "\uFEFFالاسم,رقم الهاتف,الدور أو المهمة\nمحمد سالم باحميد,777123456,مسؤول ضيافة الساموار\nعمر خالد الكثيري,771987654,تنظيم ساحة العرس\nسعيد أحمد باوزير,770555444,عضو لجنة الاستقبال\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'نموذج_أعضاء_اللجنة_مراسيم.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteCommittee = (comId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذه اللجنة؟' : 'Delete this committee?')) {
      const updated = committees.filter((com) => com.id !== comId);
      onUpdateData({ ...data, committees: updated });
      if (editingCommittee?.id === comId) {
        setEditingCommittee(null);
        setShowAddCommitteeModal(false);
      }
    }
  };

  const handleCopyCommitteePortal = async (committee) => {
    const url = generateCommitteePortalUrl(committee, weddingInfo);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPortalFor(committee.id);
      setTimeout(() => setCopiedPortalFor(null), 2500);
    } catch {
      setCopiedPortalFor(committee.id);
      setTimeout(() => setCopiedPortalFor(null), 2500);
    }
  };

  const handleOpenQrModal = (committee) => {
    const url = generateCommitteePortalUrl(committee, weddingInfo);
    setQrModalData({ committee, portalUrl: url });
  };

  // --- Handlers: Sponsors & Expenses ---
  const handleSaveSponsor = (spData) => {
    let updated;
    if (spData.id && sponsorships.some((sp) => sp.id === spData.id)) {
      updated = sponsorships.map((sp) => (sp.id === spData.id ? { ...sp, ...spData } : sp));
    } else {
      updated = [{ ...spData, id: spData.id || `sp-${Date.now()}` }, ...sponsorships];
    }
    onUpdateData({ ...data, sponsorships: updated });
    setShowAddSponsorModal(false);
    setEditingSponsor(null);
  };

  const handleEditSponsor = (sponsor) => {
    setEditingSponsor(sponsor);
    setShowAddSponsorModal(true);
  };

  const handleDeleteSponsor = (spId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا الراعي؟' : 'Delete this sponsor?')) {
      const updated = sponsorships.filter((sp) => sp.id !== spId);
      onUpdateData({ ...data, sponsorships: updated });
      if (editingSponsor?.id === spId) {
        setEditingSponsor(null);
        setShowAddSponsorModal(false);
      }
    }
  };

  const handleSaveExpense = (expData) => {
    let updated;
    if (expData.id && expenses.some((exp) => exp.id === expData.id)) {
      updated = expenses.map((exp) => (exp.id === expData.id ? { ...exp, ...expData } : exp));
    } else {
      updated = [{ ...expData, id: expData.id || `exp-${Date.now()}` }, ...expenses];
    }
    onUpdateData({ ...data, expenses: updated });
    setShowAddExpenseModal(false);
    setEditingExpense(null);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowAddExpenseModal(true);
  };

  const handleDeleteExpense = (expId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا المصروف؟' : 'Delete this expense?')) {
      const updated = expenses.filter((exp) => exp.id !== expId);
      onUpdateData({ ...data, expenses: updated });
      if (editingExpense?.id === expId) {
        setEditingExpense(null);
        setShowAddExpenseModal(false);
      }
    }
  };

  // --- Handlers: Supplies & Logistics Customization ---

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
  const handleSaveSchedule = (schData) => {
    let updated;
    if (schData.id && schedule.some((item) => item.id === schData.id)) {
      updated = schedule.map((item) => (item.id === schData.id ? { ...item, ...schData } : item));
    } else {
      updated = [...schedule, { ...schData, id: schData.id || `sch-${Date.now()}` }];
    }
    onUpdateData({ ...data, schedule: updated });
    setShowScheduleModal(false);
    setEditingScheduleItem(null);
  };

  const handleEditScheduleItem = (item) => {
    setEditingScheduleItem(item);
    setShowScheduleModal(true);
  };

  const handleDeleteScheduleItem = (schId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذه الفعالية من الجدول؟' : 'Delete this schedule event?')) {
      const updated = schedule.filter((item) => item.id !== schId);
      onUpdateData({ ...data, schedule: updated });
      if (editingScheduleItem?.id === schId) {
        setEditingScheduleItem(null);
        setShowScheduleModal(false);
      }
    }
  };

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

      {/* --- SUB-TAB CONTENT SECTIONS --- */}

      {/* === SUB-TAB 1: OVERVIEW === */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">

          {/* --- 1. HERO BANNER --- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-amber-800 to-orange-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Small Edit Event Button in Top Corner */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="absolute top-4 sm:top-6 ltr:right-4 ltr:sm:right-6 rtl:left-4 rtl:sm:left-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition border border-white/20 hover:border-white/40 shadow-sm"
            title={isRtl ? 'تعديل بيانات العرس الجماعي' : 'Edit Event Info'}
          >
            <Edit3 size={13} className="text-amber-300" />
            <span>{isRtl ? 'تعديل الفعالية' : 'Edit Event'}</span>
          </button>
        )}

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
            {logistics.customSupplies.length > 0
              ? (isRtl ? `${logistics.customSupplies.length} مواد تموين مضافة` : `${logistics.customSupplies.length} supplies listed`)
              : (isRtl ? 'حاسبة التموين تبدأ من الصفر' : 'Supplies start from zero')}
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

        {/* Metric 5: Custom Logistics & Supplies */}
        <div
          onClick={() => setActiveSubTab('logistics')}
          className="col-span-2 lg:col-span-1 bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:border-amber-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900">
              {isRtl ? 'مواد ومؤن التموين' : 'Catering & Supplies'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center group-hover:scale-110 transition">
              <Utensils size={18} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-950">
            {logistics.customSupplies.length}{' '}
            <span className="text-xs text-amber-800 font-normal">{isRtl ? 'مواد مضافة' : 'items'}</span>
          </div>
          <div className="text-[11px] text-amber-800 font-bold mt-1">
            {logistics.customSupplies.length > 0
              ? (isRtl ? 'محسوبة حسب الضيوف' : 'Calculated by guests')
              : (isRtl ? 'حساب مخصص من الصفر' : 'Custom calculated from scratch')}
          </div>
        </div>

      </div>


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
                    onClick={() => { setEditingCouple(null); setShowAddCoupleModal(true); }}
                    className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex flex-col items-center justify-center gap-2 border border-amber-200 transition"
                  >
                    <Users2 size={20} className="text-amber-700" />
                    <span>{isRtl ? 'إضافة عريس جديد' : 'Add Couple'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setEditingSponsor(null); setShowAddSponsorModal(true); }}
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
                  {schedule.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-gray-400">
                      <p className="text-xs font-semibold">{isRtl ? 'لا توجد فعاليات مجدولة حتى الآن' : 'No schedule items yet'}</p>
                    </div>
                  ) : (
                    schedule.slice(0, 4).map((item) => (
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
                  ))
                  )}
                </div>
              </div>

            </div>

            {/* Right: Summary Highlights & Key Highlights */}
            <div className="space-y-6">

              {/* Traditional Hospitality Card */}
              {/* Supplies & Catering Card */}
              <div className="bg-gradient-to-br from-amber-900 to-orange-950 text-white p-6 rounded-3xl shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Utensils size={24} className="text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">{isRtl ? 'حاسبة الوليمة والتموين' : 'Catering & Provisions'}</h4>
                    <p className="text-xs text-amber-200">{isRtl ? 'حساب مواد ومؤن العرس من الصفر' : 'Custom calculated provisions'}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs border-t border-white/10 pt-3">
                  {logistics.customSupplies.length > 0 ? (
                    logistics.customSupplies.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-amber-200 truncate max-w-[170px]">{item.name}:</span>
                        <span className="font-bold text-amber-100">
                          {item.computedQuantity !== null && item.computedQuantity > 0 ? item.computedQuantity.toLocaleString() : '0'} {item.unit}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-2 text-center text-amber-200/80 text-xs">
                      {isRtl ? 'لم تُضف مواد بعد. تبدأ الحاسبة من الصفر حسب رغبة المنظمين.' : 'No supplies added yet. Starts from zero.'}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('logistics')}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs transition"
                >
                  {isRtl ? 'فتح حاسبة التموين وإضافة المواد 📋' : 'Open Catering Calculator 📋'}
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
        <div className="space-y-6">

          {/* Couples Specialized Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 text-white p-6 sm:p-7 shadow-lg">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20 text-amber-100">
                  <Users2 size={14} />
                  <span>{isRtl ? 'سجل العرسان والتوثيق الميداني' : 'Couples Roster & Verification'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{isRtl ? 'سجل العرسان واعتماد العقود والفحوصات' : 'Registered Couples & Approvals'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                  {isRtl
                    ? `إدارة بيانات العرسان المشاركين (${couples.length} عريس مسجل من أصل ${weddingInfo.targetCouples || 24} مستهدف)، ومتابعة الفحوصات الطبية واعتماد عقود القران وتوزيع بطاقات الدعوة.`
                    : `Manage registered couples (${couples.length} of ${weddingInfo.targetCouples || 24} target), medical test progress, legal contracts, and invitation quotas.`}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => { setEditingCouple(null); setShowAddCoupleModal(true); }}
                  className="flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition"
                >
                  <Plus size={18} />
                  <span>{isRtl ? '➕ تسجيل عريس جديد' : 'Register New Couple'}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2.5 text-xs font-bold text-amber-100">
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                💍 <span>{isRtl ? 'إجمالي العرسان:' : 'Total Couples:'}</span>
                <strong className="text-white font-black">{couples.length} / {weddingInfo.targetCouples || 24}</strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                🩺 <span>{isRtl ? 'مكتمل الفحص الطبي:' : 'Medical Ready:'}</span>
                <strong className="text-emerald-300 font-black">{coupleStats.medicalReady}</strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                📜 <span>{isRtl ? 'معتمد عقد القران:' : 'Contracts Approved:'}</span>
                <strong className="text-amber-200 font-black">{coupleStats.contractsApproved}</strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                👥 <span>{isRtl ? 'معازيم العرسان المقدرين:' : 'Couples Guests:'}</span>
                <strong className="text-white font-black">{(logistics.couplesGuests || 0).toLocaleString()}</strong>
              </span>
            </div>
          </div>

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
              onClick={() => { setEditingCouple(null); setShowAddCoupleModal(true); }}
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

                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => handleEditCouple(c)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
                      title={isRtl ? 'تعديل بيانات العريس' : 'Edit Couple'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCouple(c.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title={isRtl ? 'حذف العريس' : 'Delete'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center text-gray-500 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Users2 size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-gray-800 text-base">
                  {couples.length === 0
                    ? (isRtl ? 'لم يتم تسجيل أي عرسان بعد في السجل' : 'No couples registered yet')
                    : (isRtl ? 'لم يتم العثور على عرسان مطابقين للبحث' : 'No couples matched your search')}
                </h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {couples.length === 0
                    ? (isRtl ? 'ابدأ بإضافة العرسان ومتابعة فحوصاتهم الطبية وعقودهم الشرعية وكوتة بطاقات الدعوة.' : 'Start adding couples to track their medical checks, contracts, and invitation quotas.')
                    : (isRtl ? 'جرب البحث بكلمات أخرى أو أعد ضبط تصنيف التصفية.' : 'Try different search keywords or reset filter.')}
                </p>
              </div>
              {couples.length === 0 && (
                <button
                  type="button"
                  onClick={() => { setEditingCouple(null); setShowAddCoupleModal(true); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
                >
                  <Plus size={16} />
                  <span>{isRtl ? 'تسجيل أول عريس في السجل' : 'Register First Couple'}</span>
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* === SUB-TAB 3: COMMITTEES & TEAMS === */}
      {activeSubTab === 'committees' && (() => {
        const activeCommittee = committees.find((c) => c.id === selectedCommitteeId);

        // --- VIEW 1: DEDICATED COMMITTEE DETAIL PAGE ---
        if (selectedCommitteeId && activeCommittee) {
          const comTasks = (activeCommittee.tasks && activeCommittee.tasks.length > 0)
            ? activeCommittee.tasks
            : (activeCommittee.responsibilities || []).map((r, i) => ({ id: `task-${i}`, text: r, completed: false }));
          const completedTasksCount = comTasks.filter((t) => t.completed).length;
          const taskCompletionPct = comTasks.length > 0 ? Math.round((completedTasksCount / comTasks.length) * 100) : 0;
          const comMembers = activeCommittee.members || [];
          const filteredMembers = comMembers.filter((m) => {
            if (!memberSearchQuery.trim()) return true;
            const q = memberSearchQuery.toLowerCase();
            return (
              (m.name && m.name.toLowerCase().includes(q)) ||
              (m.phone && m.phone.toLowerCase().includes(q)) ||
              (m.role && m.role.toLowerCase().includes(q))
            );
          });

          return (
            <div className="space-y-6">

              {/* Breadcrumb Navigation & Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCommitteeId(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs transition border border-amber-200/60 w-fit"
                >
                  <ArrowRight size={16} className="rtl:rotate-0 ltr:rotate-180" />
                  <span>{isRtl ? '← العودة لكافة اللجان التنظيمية' : 'Back to All Committees'}</span>
                </button>

                <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  <span>{isRtl ? 'اللجان الميدانية' : 'Committees'}</span>
                  <span>/</span>
                  <span className="text-amber-800 font-black">{activeCommittee.name}</span>
                </div>
              </div>

              {/* Committee Dedicated Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 shadow-lg">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20 text-blue-100">
                      <HeartHandshake size={14} />
                      <span>{isRtl ? 'الصفحة التفصيلية للجنة الميدانية' : 'Committee Detail Workspace'}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                      <span>{activeCommittee.name}</span>
                    </h2>
                    {activeCommittee.nameEn && (
                      <p className="text-xs text-blue-200 font-medium">{activeCommittee.nameEn}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                      <div className="bg-white/15 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                        <span className="text-blue-200">{isRtl ? 'المشرف المسؤول:' : 'Lead:'}</span>
                        <strong className="text-white font-black">{activeCommittee.leader}</strong>
                      </div>

                      {activeCommittee.phone && (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${activeCommittee.phone}`}
                            className="bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-400/30 font-bold flex items-center gap-1.5 transition"
                          >
                            <Phone size={13} />
                            <span dir="ltr">{activeCommittee.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${activeCommittee.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shadow-sm"
                          >
                            <Share2 size={13} />
                            <span>واتساب</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Strip in Hero */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenQrModal(activeCommittee)}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-black text-xs transition shadow-sm"
                      title={isRtl ? 'توليد وعرض رمز QR لبوابة اللجنة' : 'Generate QR Code'}
                    >
                      <QrIcon size={15} />
                      <span>{isRtl ? '🏁 رمز QR والبوابة' : 'QR & Portal'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPortalPreviewCommittee(activeCommittee)}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs backdrop-blur-md border border-white/25 transition shadow-sm"
                      title={isRtl ? 'معاينة شكل البوابة في هاتف العضو' : 'Mobile Preview'}
                    >
                      <Eye size={15} />
                      <span>{isRtl ? '📱 معاينة الجوال' : 'Mobile View'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyCommitteePortal(activeCommittee)}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs backdrop-blur-md border border-white/20 transition shadow-sm"
                      title={isRtl ? 'نسخ رابط البوابة الميدانية المباشر' : 'Copy Portal Link'}
                    >
                      {copiedPortalFor === activeCommittee.id ? (
                        <Check size={15} className="text-emerald-300" />
                      ) : (
                        <Copy size={15} />
                      )}
                      <span>
                        {copiedPortalFor === activeCommittee.id
                          ? (isRtl ? 'تم النسخ!' : 'Copied!')
                          : (isRtl ? '🔗 نسخ الرابط' : 'Copy Link')}
                      </span>
                    </button>

                    {activeCommittee.phone && (() => {
                      const portalUrl = generateCommitteePortalUrl(activeCommittee, weddingInfo);
                      const cleanP = activeCommittee.phone.replace(/[^0-9]/g, '');
                      const msg = encodeURIComponent(
                        `السلام عليكم أخي المشرف ${activeCommittee.leader || ''}،\nإليك رابط بوابة لجنتكم الميدانية (${activeCommittee.name}) في ${weddingInfo.title || 'العرس الجماعي'}:\n${portalUrl}\n\nيرجى مشاركته مع أعضاء فريقك للاطلاع على المهام وتفاصيل التواصل الميداني.`
                      );
                      return (
                        <a
                          href={`https://wa.me/${cleanP}?text=${msg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition shadow-sm"
                          title={isRtl ? 'إرسال الرابط للمشرف مباشرة عبر واتساب' : 'Send via WhatsApp'}
                        >
                          <Share2 size={15} />
                          <span>{isRtl ? '💬 إرسال للمشرف' : 'Send to Lead'}</span>
                        </a>
                      );
                    })()}

                    <button
                      type="button"
                      onClick={() => setShowPdfReportModal(true)}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs backdrop-blur-md border border-white/20 transition shadow-sm"
                    >
                      <Printer size={15} />
                      <span>{isRtl ? '📄 تقرير PDF' : 'Export PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExcelError('');
                        setExcelPreviewMembers([]);
                        setExcelFileName('');
                        setShowImportExcelModal(true);
                      }}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-500/80 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition border border-emerald-400/40 shadow-sm"
                    >
                      <FileSpreadsheet size={15} />
                      <span>{isRtl ? '📊 إكسل' : 'Excel'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(null);
                        setShowAddMemberModal(true);
                      }}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-black text-xs transition shadow-sm"
                    >
                      <UserPlus size={15} />
                      <span>{isRtl ? '➕ عضو' : 'Member'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditCommittee(activeCommittee)}
                      className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                      title={isRtl ? 'تعديل بيانات اللجنة' : 'Edit Committee'}
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>

                {/* KPI Strip */}
                <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2.5 text-xs font-bold text-blue-100">
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    👥 <span>{isRtl ? 'الأعضاء المسجلين بالاسم:' : 'Registered Members:'}</span>
                    <strong className="text-amber-300 font-black">{comMembers.length}</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    📋 <span>{isRtl ? 'إجمالي المهام الموكلة:' : 'Total Tasks:'}</span>
                    <strong className="text-white font-black">{comTasks.length}</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    ✅ <span>{isRtl ? 'المهام المنجزة:' : 'Completed:'}</span>
                    <strong className="text-emerald-300 font-black">{completedTasksCount} / {comTasks.length} ({taskCompletionPct}%)</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    🤝 <span>{isRtl ? 'المتطوعين المقدرين:' : 'Target Volunteers:'}</span>
                    <strong className="text-white font-black">{activeCommittee.volunteersCount || comMembers.length}</strong>
                  </span>
                </div>
              </div>

              {/* Two Column Grid: Left Members, Right Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Section A: Members Roster (7 Cols) */}
                <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                        <Users2 size={18} className="text-blue-600" />
                        <span>{isRtl ? 'سجل أعضاء اللجنة وفريق العمل' : 'Committee Members Roster'}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                          {comMembers.length}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        {isRtl ? 'إدارة أسماء الأعضاء، أرقام هواتفهم، والمهام الميدانية الموكلة لكل عضو' : 'Manage members, phone numbers, and designated field roles'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setExcelError('');
                          setExcelPreviewMembers([]);
                          setExcelFileName('');
                          setShowImportExcelModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-emerald-200 transition"
                      >
                        <FileSpreadsheet size={14} />
                        <span>{isRtl ? 'استيراد إكسل' : 'Import'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMember(null);
                          setShowAddMemberModal(true);
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Plus size={14} />
                        <span>{isRtl ? 'إضافة عضو' : 'Add'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Search input for members */}
                  {comMembers.length > 3 && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={isRtl ? 'بحث باسم العضو، الهاتف، أو الدور...' : 'Search member, phone, role...'}
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-semibold pl-9 rtl:pr-9 rtl:pl-4"
                      />
                      <Search size={14} className="absolute top-3 ltr:left-3 rtl:right-3 text-gray-400" />
                    </div>
                  )}

                  {/* Members List */}
                  {filteredMembers.length === 0 ? (
                    <div className="p-8 sm:p-10 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Users2 size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-800 text-sm">
                          {isRtl ? 'لا يوجد أعضاء مسجلون في هذه اللجنة بعد' : 'No members registered yet'}
                        </h4>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto">
                          {isRtl
                            ? 'أضف الأعضاء يدوياً مع أرقام هواتفهم، أو ارفع ملف إكسل لإضافتهم بالجملة دفعة واحدة.'
                            : 'Add members manually with phone numbers or upload an Excel file for bulk addition.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMember(null);
                            setShowAddMemberModal(true);
                          }}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition shadow-sm"
                        >
                          {isRtl ? '➕ إضافة عضو يدوياً' : 'Add Member'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setExcelError('');
                            setExcelPreviewMembers([]);
                            setExcelFileName('');
                            setShowImportExcelModal(true);
                          }}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-200 transition"
                        >
                          {isRtl ? '📊 رفع ملف إكسل' : 'Upload Excel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 border border-gray-200/80 rounded-2xl overflow-hidden max-h-[500px] overflow-y-auto">
                      {filteredMembers.map((member, idx) => (
                        <div
                          key={member.id || idx}
                          className="p-3.5 sm:p-4 bg-white hover:bg-blue-50/40 transition flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black shrink-0 text-xs">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-black text-gray-900 text-sm truncate">{member.name}</h5>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                                  {member.role || (isRtl ? 'عضو ميداني' : 'Field Member')}
                                </span>
                                {member.phone && (
                                  <span className="font-mono text-gray-600" dir="ltr">{member.phone}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {member.phone && (
                              <>
                                <a
                                  href={`tel:${member.phone}`}
                                  className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                                  title={isRtl ? 'اتصال هاتف' : 'Call'}
                                >
                                  <Phone size={14} />
                                </a>
                                <a
                                  href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition"
                                  title={isRtl ? 'مراسلة واتساب' : 'WhatsApp'}
                                >
                                  <Share2 size={14} />
                                </a>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMember(member);
                                setShowAddMemberModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title={isRtl ? 'تعديل' : 'Edit'}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(activeCommittee.id, member.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title={isRtl ? 'حذف' : 'Delete'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Tasks & Responsibilities Checklist (5 Cols) */}
                <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
                  <div className="pb-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-amber-600" />
                        <span>{isRtl ? 'قائمة المهام والمسؤوليات' : 'Tasks & Checklist'}</span>
                      </h3>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        {completedTasksCount} / {comTasks.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isRtl ? 'اضغط على مربع المهمة لتبديل حالتها بين مكتملة وقيد التنفيذ' : 'Click checkbox to mark task completion'}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${taskCompletionPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Inline Add Task Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddCommitteeTask(activeCommittee.id, newInlineTaskText);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder={isRtl ? 'أضف مهمة جديدة واضغط Enter...' : 'Add task and press Enter...'}
                      value={newInlineTaskText}
                      onChange={(e) => setNewInlineTaskText(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!newInlineTaskText.trim()}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition shrink-0"
                    >
                      {isRtl ? 'إضافة' : 'Add'}
                    </button>
                  </form>

                  {/* Tasks Checklist Items */}
                  <div className="space-y-2 max-h-[420px] overflow-y-auto">
                    {comTasks.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-gray-400 text-xs">
                        {isRtl ? 'لم تسجل أي مهام لهذه اللجنة بعد. اكتب مهمة في الحقل أعلاه وأضفها.' : 'No tasks assigned yet. Add one above.'}
                      </div>
                    ) : (
                      comTasks.map((task, idx) => {
                        const taskId = task.id || `task-${idx}`;
                        const isDone = Boolean(task.completed);
                        return (
                          <div
                            key={taskId}
                            className={`p-3 rounded-2xl border transition flex items-start justify-between gap-3 text-xs ${
                              isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-gray-50/80 border-gray-200 hover:bg-white'
                            }`}
                          >
                            <label className="flex items-start gap-2.5 cursor-pointer flex-1 select-none">
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleToggleCommitteeTask(activeCommittee.id, taskId)}
                                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                              />
                              <span className={`font-bold leading-snug ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {task.text || task}
                              </span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleDeleteCommitteeTask(activeCommittee.id, taskId)}
                              className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition shrink-0"
                              title={isRtl ? 'حذف المهمة' : 'Delete Task'}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </div>
          );
        }

        // --- VIEW 2: ALL COMMITTEES GRID VIEW ---
        return (
          <div className="space-y-5">

            {/* Sub-tab Switcher: Committees Management vs Command Broadcast Hub */}
            <div className="bg-white p-2 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCommitteesSectionView('list')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                  committeesSectionView === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <HeartHandshake size={16} />
                <span>{isRtl ? `إدارة اللجان والفرق (${committees.length})` : `Committees Management (${committees.length})`}</span>
              </button>

              <button
                type="button"
                onClick={() => setCommitteesSectionView('broadcast')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
                  committeesSectionView === 'broadcast'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100/70'
                }`}
              >
                <Radio size={16} className={committeesSectionView === 'broadcast' ? 'animate-pulse' : ''} />
                <span>{isRtl ? '📡 مركز البث والتوجيهات الميدانية (Command Hub)' : 'Field Broadcast Hub'}</span>
              </button>
            </div>

            {committeesSectionView === 'broadcast' ? (
              <CommandBroadcastHub
                committees={committees}
                weddingTitle={weddingInfo.title}
                weddingDate={weddingInfo.date}
                onOpenQrModal={(com, url) => setQrModalData({ committee: com, portalUrl: url })}
                onOpenPortalPreview={(com) => setPortalPreviewCommittee(com)}
                isRtl={isRtl}
              />
            ) : (
              <div className="space-y-4">

            {/* Committees Specialized Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-6 sm:p-7 shadow-lg">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20 text-blue-100">
                    <HeartHandshake size={14} />
                    <span>{isRtl ? 'اللجان التنظيمية والفرق الميدانية' : 'Field Committees & Teams'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <span>{isRtl ? 'إدارة اللجان والفرق الميدانية والمتطوعين' : 'Committees, Leads & Volunteers'}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                    {isRtl
                      ? `توزيع المهام والمسؤولين والفرق الميدانية (${committees.length} لجان، و ${totalVolunteers} متطوع ميداني) لتنظيم استقبال الضيوف، إعداد الوليمة والشاهي، وتأمين ساحات الحفل. انقر على أي لجنة للدخول إلى صفحتها التفصيلية لإدارة الأعضاء وتصدير التقارير.`
                      : `Organize field teams (${committees.length} committees, ${totalVolunteers} volunteers) to supervise guest reception, feast logistics, and venue order. Click any committee to manage details.`}
                  </p>
                </div>

                {/* Action Button */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommittee(null);
                      setFormDynamicTasks(['', '']);
                      setShowAddCommitteeModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition"
                  >
                    <Plus size={18} />
                    <span>{isRtl ? '➕ إضافة لجنة تنظيمية' : 'Add Committee'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats Strip */}
              <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2.5 text-xs font-bold text-blue-100">
                <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  👥 <span>{isRtl ? 'إجمالي اللجان:' : 'Total Committees:'}</span>
                  <strong className="text-white font-black">{committees.length}</strong>
                </span>
                <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  🤝 <span>{isRtl ? 'المتطوعين الميدانيين:' : 'Volunteers:'}</span>
                  <strong className="text-amber-300 font-black">{totalVolunteers}</strong>
                </span>
                <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  📋 <span>{isRtl ? 'مشرفي اللجان المعينين:' : 'Assigned Leads:'}</span>
                  <strong className="text-white font-black">{committees.filter((c) => c.leader).length}</strong>
                </span>
              </div>
            </div>

            {committees.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center text-gray-500 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <HeartHandshake size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-800 text-base">
                    {isRtl ? 'لا توجد لجان ميدانية مسجلة حتى الآن' : 'No committees registered yet'}
                  </h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    {isRtl
                      ? 'أنشئ فرق العمل (كاللجنة الإعلامية، لجنة الضيافة والوليمة، ولجنة الاستقبال) لتوزيع المتطوعين والمهام.'
                      : 'Create working teams to assign responsibilities, leads, and volunteers.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommittee(null);
                    setFormDynamicTasks(['', '']);
                    setShowAddCommitteeModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
                >
                  <Plus size={16} />
                  <span>{isRtl ? 'إضافة أول لجنة تنظيمية' : 'Add First Committee'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {committees.map((com) => {
                  const comMembersCount = (com.members || []).length;
                  const comTasks = (com.tasks && com.tasks.length > 0)
                    ? com.tasks
                    : (com.responsibilities || []).map((r, i) => ({ id: `task-${i}`, text: r, completed: false }));
                  const comCompletedTasks = comTasks.filter((t) => t.completed).length;

                  return (
                    <div
                      key={com.id}
                      onClick={() => setSelectedCommitteeId(com.id)}
                      className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-blue-400 transition space-y-4 relative group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-black text-base text-gray-900 group-hover:text-blue-700 transition">
                            {com.name}
                          </h4>
                          <p className="text-xs text-gray-500">{com.nameEn}</p>
                        </div>

                        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleEditCommittee(com)}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
                            title={isRtl ? 'تعديل بيانات اللجنة' : 'Edit Committee'}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCommittee(com.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title={isRtl ? 'حذف اللجنة' : 'Delete'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Head & Contact */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl font-bold">
                          <span>{isRtl ? 'المشرف:' : 'Head:'}</span>
                          <span>{com.leader}</span>
                        </div>

                        {com.phone && (
                          <a
                            href={`tel:${com.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-xl font-bold transition"
                          >
                            <Phone size={13} />
                            <span dir="ltr">{com.phone}</span>
                          </a>
                        )}

                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl font-bold">
                          <span>{comMembersCount > 0 ? `${comMembersCount} ${isRtl ? 'أعضاء مسجلين' : 'members'}` : `${com.volunteersCount || 0} ${isRtl ? 'متطوع' : 'volunteers'}`}</span>
                        </div>
                      </div>

                      {/* Tasks Summary */}
                      {comTasks.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold">
                            <span>{isRtl ? 'المهام الرئيسية:' : 'Key Tasks:'} ({comCompletedTasks}/{comTasks.length})</span>
                            <span className="text-blue-600 group-hover:underline">
                              {isRtl ? 'فتح صفحة اللجنة التفصيلية ←' : 'Open Workspace →'}
                            </span>
                          </div>
                          <ul className="space-y-1 text-xs text-gray-600">
                            {comTasks.slice(0, 2).map((t, i) => (
                              <li key={i} className="flex items-start gap-2 truncate">
                                <CheckCircle2 size={13} className={`shrink-0 mt-0.5 ${t.completed ? 'text-emerald-600' : 'text-gray-400'}`} />
                                <span className={`truncate ${t.completed ? 'line-through text-gray-400' : ''}`}>
                                  {t.text || t}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quick Portal & QR Action Strip */}
                      <div
                        className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1 text-[11px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleCopyCommitteePortal(com)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition"
                          title="نسخ رابط البوابة الميدانية"
                        >
                          {copiedPortalFor === com.id ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                          <span>{copiedPortalFor === com.id ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ الرابط' : 'Copy Link')}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenQrModal(com)}
                            className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition"
                            title={isRtl ? 'رمز QR وبوابة اللجنة' : 'QR Code'}
                          >
                            <QrIcon size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setPortalPreviewCommittee(com)}
                            className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 transition"
                            title={isRtl ? 'معاينة بوابة الجوال' : 'Mobile Preview'}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Click invitation button */}
                      <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs font-black text-blue-700 group-hover:text-blue-900">
                        <span>{isRtl ? 'إدارة الأعضاء وتصدير التقارير 📋' : 'Manage Members & Reports 📋'}</span>
                        <ArrowRight size={14} className="rtl:rotate-180 transition transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

              </div>
            )}

          </div>
        );
      })()}

      {/* === SUB-TAB 4: BUDGET & SPONSORS === */}
      {activeSubTab === 'budget' && (
        <div className="space-y-6">

          {/* Budget Specialized Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-7 shadow-lg">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20 text-emerald-100">
                  <Coins size={14} />
                  <span>{isRtl ? 'الميزانية والرعايات' : 'Budget & Sponsorships'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{isRtl ? 'الموقف المالي وسجل الرعايات والمصروفات' : 'Financial Status, Sponsors & Costs'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  {isRtl
                    ? `متابعة إجمالي التبرعات والرعايات المجتمعية (${(totalSponsorships / 1000000).toFixed(2)} مليون ر.ي) مقابل المصروفات التقديرية (${(totalExpenses / 1000000).toFixed(2)} مليون ر.ي) وضبط الفائض والعجز.`
                    : `Track total sponsorships and donations (${(totalSponsorships / 1000000).toFixed(2)}M YER) against estimated expenses (${(totalExpenses / 1000000).toFixed(2)}M YER).`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => { setEditingSponsor(null); setShowAddSponsorModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition"
                >
                  <Plus size={16} />
                  <span>{isRtl ? 'تسجيل راعي / داعم' : 'Add Sponsor'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingExpense(null); setShowAddExpenseModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition border border-rose-400/40"
                >
                  <Plus size={16} />
                  <span>{isRtl ? 'إضافة بند مصروف' : 'Add Expense'}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2.5 text-xs font-bold text-emerald-100">
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                💰 <span>{isRtl ? 'إجمالي الرعايات:' : 'Total Raised:'}</span>
                <strong className="text-emerald-300 font-black">{totalSponsorships.toLocaleString()} ر.ي</strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                📉 <span>{isRtl ? 'إجمالي المصروفات:' : 'Total Costs:'}</span>
                <strong className="text-rose-300 font-black">{totalExpenses.toLocaleString()} ر.ي</strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                ⚖️ <span>{isRtl ? 'الفائض / العجز:' : 'Balance:'}</span>
                <strong className={`${totalSponsorships >= totalExpenses ? 'text-emerald-300' : 'text-rose-300'} font-black`}>
                  {(totalSponsorships - totalExpenses).toLocaleString()} ر.ي
                </strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                📊 <span>{isRtl ? 'نسبة التغطية:' : 'Budget Coverage:'}</span>
                <strong className="text-white font-black">{budgetProgress}%</strong>
              </span>
            </div>
          </div>

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
                  onClick={() => { setEditingSponsor(null); setShowAddSponsorModal(true); }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus size={15} />
                  <span>{isRtl ? 'إضافة راعي' : 'Add Sponsor'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {sponsorships.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-gray-400 space-y-2">
                    <p className="text-xs font-semibold">{isRtl ? 'لا يوجد رعاة أو مساهمات مسجلة حالياً' : 'No sponsors or contributions recorded yet'}</p>
                    <button
                      type="button"
                      onClick={() => { setEditingSponsor(null); setShowAddSponsorModal(true); }}
                      className="text-xs text-emerald-700 font-bold hover:underline"
                    >
                      {isRtl ? '+ تسجيل راعي أو داعم' : '+ Add Sponsor'}
                    </button>
                  </div>
                ) : (
                  sponsorships.map((sp) => (
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

                    <div className="text-left rtl:text-right shrink-0 flex flex-col items-end">
                      <div className="font-black text-emerald-700 text-sm">
                        {sp.amount?.toLocaleString()} ر.ي
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => handleEditSponsor(sp)}
                          className="text-gray-500 hover:text-emerald-700 text-[11px] font-bold transition flex items-center gap-0.5"
                        >
                          <Edit2 size={12} />
                          <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSponsor(sp.id)}
                          className="text-gray-400 hover:text-rose-600 text-[11px] transition"
                        >
                          {isRtl ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
                )}
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
                  onClick={() => { setEditingExpense(null); setShowAddExpenseModal(true); }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus size={15} />
                  <span>{isRtl ? 'إضافة بند' : 'Add Cost'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-gray-400 space-y-2">
                    <p className="text-xs font-semibold">{isRtl ? 'لا توجد بنود مصروفات مسجلة حالياً' : 'No cost items recorded yet'}</p>
                    <button
                      type="button"
                      onClick={() => { setEditingExpense(null); setShowAddExpenseModal(true); }}
                      className="text-xs text-rose-700 font-bold hover:underline"
                    >
                      {isRtl ? '+ إضافة بند مصروفات' : '+ Add Expense'}
                    </button>
                  </div>
                ) : (
                  expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{exp.item}</div>
                      <span className="text-[11px] text-gray-400 font-semibold">{exp.category}</span>
                    </div>

                    <div className="text-left rtl:text-right shrink-0 flex flex-col items-end">
                      <div className="font-black text-rose-700 text-sm">
                        {exp.amount?.toLocaleString()} ر.ي
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => handleEditExpense(exp)}
                          className="text-gray-500 hover:text-rose-700 text-[11px] font-bold transition flex items-center gap-0.5"
                        >
                          <Edit2 size={12} />
                          <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-gray-400 hover:text-rose-600 text-[11px] transition"
                        >
                          {isRtl ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* === SUB-TAB 5: UNIFIED CEREMONIES SCHEDULE === */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-6">

          {/* Schedule Specialized Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-800 via-orange-900 to-stone-900 text-white p-6 sm:p-7 shadow-lg">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20 text-orange-100">
                  <Calendar size={14} />
                  <span>{isRtl ? 'برنامج وفعاليات الزفاف' : 'Ceremony Timeline'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{isRtl ? 'جدول برنامج ومراحل الفعاليات المشتركة' : 'Unified Ceremonies Timeline'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed">
                  {isRtl
                    ? `تنظيم التسلسل الزمني لفعاليات يوم الزفاف من استقبال الوفود حتى السمرة الجماعية، وتحديث حالات الفقرات الميدانية أولاً بأول.`
                    : `Manage chronological event sequence from arrival to night celebrations, updating status on the go.`}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => { setEditingScheduleItem(null); setShowScheduleModal(true); }}
                  className="flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition"
                >
                  <Plus size={18} />
                  <span>{isRtl ? '➕ إضافة فعالية للبرنامج' : 'Add Event Item'}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2.5 text-xs font-bold text-orange-100">
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                ⏱️ <span>{isRtl ? 'إجمالي الفقرات:' : 'Total Items:'}</span>
                <strong className="text-white font-black">{schedule.length}</strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                ✅ <span>{isRtl ? 'المكتملة:' : 'Completed:'}</span>
                <strong className="text-emerald-300 font-black">{schedule.filter(s => s.status === 'completed').length}</strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                ⏳ <span>{isRtl ? 'الجارية حالياً:' : 'Ongoing:'}</span>
                <strong className="text-amber-300 font-black">{schedule.filter(s => s.status === 'ongoing').length}</strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                🕒 <span>{isRtl ? 'القادمة:' : 'Upcoming:'}</span>
                <strong className="text-white font-black">{schedule.filter(s => s.status === 'upcoming').length}</strong>
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">

          {schedule.length === 0 ? (
            <div className="p-10 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-gray-400 space-y-3">
              <Calendar size={36} className="mx-auto text-gray-300" />
              <p className="text-xs font-semibold">{isRtl ? 'لم تتم جدولة أي فعاليات مشتركة بعد' : 'No timeline events scheduled yet'}</p>
              <button
                type="button"
                onClick={() => { setEditingScheduleItem(null); setShowScheduleModal(true); }}
                className="text-xs text-amber-700 font-bold hover:underline"
              >
                {isRtl ? '+ إضافة أول فعالية في الجدول' : '+ Add First Event'}
              </button>
            </div>
          ) : (
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

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-amber-200 transition space-y-2 relative group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-black text-amber-800 text-xs sm:text-sm bg-amber-100 px-3 py-1 rounded-xl w-fit">
                      {item.time}
                    </span>
                    <div className="flex items-center gap-2">
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

                      <button
                        type="button"
                        onClick={() => handleEditScheduleItem(item)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title={isRtl ? 'تعديل الفعالية' : 'Edit Event'}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduleItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title={isRtl ? 'حذف الفعالية' : 'Delete Event'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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
          )}

        </div>
        </div>
      )}

      {/* === SUB-TAB 6: PROVISIONS & BANQUET CALCULATOR (CUSTOM FROM ZERO) === */}
      {activeSubTab === 'logistics' && (
        <div className="space-y-6">

          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-700 to-amber-800 text-white p-6 sm:p-7 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20 text-orange-100">
                  <Utensils size={14} />
                  <span>{isRtl ? 'حاسبة التموين والوليمة' : 'Catering & Logistics Calculator'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{isRtl ? 'حاسبة الوليمة والتموين والمؤن' : 'Banquet & Provisions Calculator'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed">
                  {isRtl
                    ? `إضافة واحتساب مواد ومؤن العرس الجماعي من الصفر بدقة بناءً على (${couples.length}) عريس مسجل و(${logistics.totalGuests.toLocaleString()}) ضيف متوقع، أو ككميات مقطوعة محددة.`
                    : `Add and calculate mass wedding banquet & catering provisions from scratch based on (${couples.length}) couples and (${logistics.totalGuests.toLocaleString()}) expected guests.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSupplyItem(null);
                    setShowAddSupplyModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition"
                >
                  <Plus size={18} />
                  <span>{isRtl ? '➕ إضافة مادة أو مؤونة جديدة' : 'Add Supply Item'}</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2.5 text-xs font-bold text-orange-100">
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                👥 <span>{isRtl ? 'إجمالي الضيوف:' : 'Total Guests:'}</span>
                <strong className="text-white font-black">{logistics.totalGuests.toLocaleString()}</strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                💍 <span>{isRtl ? 'العرسان المسجلين:' : 'Couples:'}</span>
                <strong className="text-white font-black">{couples.length}</strong>
              </span>
              <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                📦 <span>{isRtl ? 'المواد المضافة:' : 'Added Items:'}</span>
                <strong className="text-white font-black">{logistics.customSupplies.length}</strong>
              </span>
            </div>
          </div>

          {/* Section: Custom Provisions & Materials */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: isRtl ? 'الكل' : 'All', count: logistics.customSupplies.length },
                  { id: 'food', label: isRtl ? 'وليمة وإطعام' : 'Food & Feast', count: logistics.customSupplies.filter((i) => i.category === 'food').length },
                  { id: 'teaHospitality', label: isRtl ? 'عدة الشاي والسموار' : 'Tea & Hospitality', count: logistics.customSupplies.filter((i) => i.category === 'teaHospitality').length },
                  { id: 'hydration', label: isRtl ? 'سقيا الماء' : 'Water & Ice', count: logistics.customSupplies.filter((i) => i.category === 'hydration').length },
                  { id: 'venue', label: isRtl ? 'الساحة والمخادر' : 'Venue & Setup', count: logistics.customSupplies.filter((i) => i.category === 'venue').length },
                  { id: 'general', label: isRtl ? 'عامة' : 'General', count: logistics.customSupplies.filter((i) => i.category === 'general').length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSupplyCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      supplyCategoryFilter === tab.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      supplyCategoryFilter === tab.id ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search & Add Button */}
              <div className="flex items-center gap-2">
                {logistics.customSupplies.length > 2 && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isRtl ? 'بحث في المواد...' : 'Search supplies...'}
                      value={supplySearchQuery}
                      onChange={(e) => setSupplySearchQuery(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold pr-8"
                    />
                    <Search size={14} className="absolute right-2.5 top-2.5 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingSupplyItem(null);
                    setShowAddSupplyModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition shrink-0"
                >
                  <Plus size={15} />
                  <span>{isRtl ? 'إضافة مادة' : 'Add Item'}</span>
                </button>
              </div>
            </div>

            {/* Empty State: Zero Supplies */}
            {logistics.customSupplies.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-amber-50/40 border-2 border-dashed border-amber-200/90 flex flex-col justify-center items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Utensils size={28} />
                </div>
                <div className="max-w-md space-y-1">
                  <h5 className="font-black text-base text-gray-900">
                    {isRtl ? 'لا توجد أي بيانات أو مواد مضافة بعد' : 'No Supplies Added Yet'}
                  </h5>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {isRtl
                      ? 'تم حذف كافة الحسابات الافتراضية بنجاح للبدء من الصفر. يمكنك الآن إضافة الذبائح، الأرز، برادات الماء، عدة الشاي، أو أي مستلزمات أخرى وسيتم احتسابها تلقائياً حسب عدد المعازيم أو ككميات مقطوعة.'
                      : 'All default calculations have been reset to start from scratch. Add livestock, rice, water dispensers, tea kits, or any custom supplies to calculate automatically.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSupplyItem(null);
                    setShowAddSupplyModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition"
                >
                  <Plus size={16} />
                  <span>{isRtl ? '➕ إضافة أول مادة أو مؤونة الآن' : 'Add First Supply Item'}</span>
                </button>
              </div>
            ) : filteredSupplies.length === 0 ? (
              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200 text-center text-gray-500 text-xs">
                {isRtl ? 'لا توجد مواد مطابقة للتصفية أو البحث المحدد.' : 'No items match your filter.'}
              </div>
            ) : (
              /* Custom Items Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                {filteredSupplies.map((item) => {
                  const categoryBadge =
                    item.category === 'teaHospitality'
                      ? { label: isRtl ? 'عدة الشاي والسموار' : 'Tea Hospitality', color: 'bg-amber-100 text-amber-800 border-amber-200' }
                      : item.category === 'food'
                        ? { label: isRtl ? 'وليمة وإطعام' : 'Food & Feast', color: 'bg-orange-100 text-orange-800 border-orange-200' }
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
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border ${categoryBadge.color}`}>
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
                        <span className="text-amber-700">{item.computedQuantity !== null && item.computedQuantity > 0 ? item.computedQuantity : '—'}</span>{' '}
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
            )}
          </div>

        </div>
      )}

      {/* === SUB-TAB 7: AI MASS WEDDING ASSISTANT === */}
      {activeSubTab === 'ai' && (
        <div className="space-y-6">

          {/* AI Specialized Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-amber-950 text-white p-6 sm:p-7 shadow-lg">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20 text-purple-200">
                  <Sparkles size={14} className="text-amber-300" />
                  <span>{isRtl ? 'الذكاء الاصطناعي لمراسيم' : 'Maraseem AI Assistant'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{isRtl ? 'المساعد الذكي للأعراس الجماعية (الخطب والبيانات والتعاميم)' : 'AI Mass Wedding Assistant'}</span>
                </h3>
                <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                  {isRtl
                    ? `صياغة احترافية باللغة الحضرمية والفصحى لكلمة افتتاح الحفل، وبيان الدعوة العامة، وتعاميم اللجان الميدانية.`
                    : `Generate speeches, public announcements, and field directives using AI.`}
                </p>
              </div>

              {/* Action Prompt Selector in Banner */}
              <div className="flex items-center gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/10 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setAiPromptType('invitation')}
                  className={`px-3 py-1.5 rounded-xl transition ${aiPromptType === 'invitation' ? 'bg-amber-500 text-amber-950 shadow-sm font-black' : 'text-gray-300 hover:text-white'}`}
                >
                  {isRtl ? 'بيان الدعوة العامة' : 'Public Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => setAiPromptType('speech')}
                  className={`px-3 py-1.5 rounded-xl transition ${aiPromptType === 'speech' ? 'bg-amber-500 text-amber-950 shadow-sm font-black' : 'text-gray-300 hover:text-white'}`}
                >
                  {isRtl ? 'كلمة حفل اللجنة' : 'Keynote Speech'}
                </button>
                <button
                  type="button"
                  onClick={() => setAiPromptType('directives')}
                  className={`px-3 py-1.5 rounded-xl transition ${aiPromptType === 'directives' ? 'bg-amber-500 text-amber-950 shadow-sm font-black' : 'text-gray-300 hover:text-white'}`}
                >
                  {isRtl ? 'تعميم اللجان' : 'Directives'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">

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
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Modal 1: Add / Edit Couple */}
      {showAddCoupleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">
                {editingCouple
                  ? (isRtl ? 'تعديل بيانات العريس' : 'Edit Couple')
                  : (isRtl ? 'تسجيل عريس جديد في العرس الجماعي' : 'Add New Couple')}
              </h3>
              <button
                type="button"
                onClick={() => { setShowAddCoupleModal(false); setEditingCouple(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>
            <form
              key={editingCouple ? editingCouple.id : 'new-couple'}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleSaveCouple({
                  id: editingCouple?.id,
                  groomName: fd.get('groomName'),
                  brideName: fd.get('brideName'),
                  tribe: fd.get('tribe') || 'آل...',
                  area: fd.get('area') || weddingInfo.city,
                  phone: fd.get('phone') || '',
                  medicalStatus: fd.get('medicalStatus'),
                  contractStatus: fd.get('contractStatus'),
                  aidStatus: editingCouple?.aidStatus || 'processing',
                  guestQuota: Number(fd.get('guestQuota')) || 35,
                  notes: fd.get('notes') || ''
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم العريس الرباعي' : 'Groom Name'}</label>
                <input type="text" name="groomName" defaultValue={editingCouple?.groomName || ''} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم العروس / العائلة' : 'Bride Family'}</label>
                <input type="text" name="brideName" defaultValue={editingCouple?.brideName || ''} required placeholder="كريمة..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'القبيلة / العائلة' : 'Tribe / Family'}</label>
                  <input type="text" name="tribe" defaultValue={editingCouple?.tribe || ''} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'المنطقة / الحي' : 'Area'}</label>
                  <input type="text" name="area" defaultValue={editingCouple?.area || weddingInfo.city || ''} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'رقم الهاتف' : 'Phone'}</label>
                  <input type="text" name="phone" defaultValue={editingCouple?.phone || ''} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5" dir="ltr" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'بطاقات الدعوة' : 'Invitations'}</label>
                  <input type="number" name="guestQuota" defaultValue={editingCouple?.guestQuota || 35} min="5" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الفحص الطبي' : 'Medical'}</label>
                  <select name="medicalStatus" defaultValue={editingCouple?.medicalStatus || 'completed'} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold">
                    <option value="completed">{isRtl ? 'مكتمل ✓' : 'Completed'}</option>
                    <option value="pending">{isRtl ? 'قيد الإجراء' : 'Pending'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'عقد القران' : 'Contract'}</label>
                  <select name="contractStatus" defaultValue={editingCouple?.contractStatus || 'completed'} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold">
                    <option value="completed">{isRtl ? 'موثق ✓' : 'Completed'}</option>
                    <option value="in_progress">{isRtl ? 'قيد التوثيق' : 'In Progress'}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setShowAddCoupleModal(false); setEditingCouple(null); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition">
                  {editingCouple ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : (isRtl ? 'حفظ العريس' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add / Edit Committee */}
      {showAddCommitteeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">
                {editingCommittee
                  ? (isRtl ? 'تعديل بيانات اللجنة' : 'Edit Committee')
                  : (isRtl ? 'إضافة لجنة تنظيمية جديدة' : 'Add Committee')}
              </h3>
              <button
                type="button"
                onClick={() => { setShowAddCommitteeModal(false); setEditingCommittee(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>
            <form
              key={editingCommittee ? editingCommittee.id : 'new-committee'}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const cleanedTasks = formDynamicTasks.map((t) => t.trim()).filter(Boolean);
                handleSaveCommittee({
                  id: editingCommittee?.id,
                  name: fd.get('name'),
                  nameEn: fd.get('nameEn') || fd.get('name'),
                  leader: fd.get('leader'),
                  phone: fd.get('phone') || '',
                  volunteersCount: Number(fd.get('volunteersCount')) || Math.max(10, editingCommittee?.members?.length || 0),
                  responsibilities: cleanedTasks,
                  tasks: cleanedTasks.map((t, idx) => {
                    const existing = editingCommittee?.tasks?.[idx];
                    return {
                      id: existing?.id || `task-${Date.now()}-${idx}`,
                      text: t,
                      completed: Boolean(existing?.completed)
                    };
                  }),
                  members: editingCommittee?.members || [],
                  status: editingCommittee?.status || 'ready'
                });
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم اللجنة (بالعربية)' : 'Committee Name'}</label>
                  <input type="text" name="name" defaultValue={editingCommittee?.name || ''} required placeholder={isRtl ? 'لجنة الضيافة والوليمة...' : 'Committee...'} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الاسم بالإنجليزية (اختياري)' : 'English Name'}</label>
                  <input type="text" name="nameEn" defaultValue={editingCommittee?.nameEn || ''} placeholder="Catering Committee" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'مشرف اللجنة المسؤول' : 'Head / Leader'}</label>
                  <input type="text" name="leader" defaultValue={editingCommittee?.leader || ''} required placeholder={isRtl ? 'الاسم الرباعي' : 'Leader Name'} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'المتطوعين التقديري' : 'Target Volunteers'}</label>
                  <input type="number" name="volunteersCount" defaultValue={editingCommittee?.volunteersCount || 15} min="1" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'رقم هاتف المشرف (للاتصال وواتساب)' : 'Leader Phone'}</label>
                <input type="text" name="phone" defaultValue={editingCommittee?.phone || ''} placeholder="777123456" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5" dir="ltr" />
              </div>

              {/* Dynamic Multiple Tasks Input */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-gray-900">{isRtl ? 'مهام ومسؤوليات اللجنة:' : 'Committee Responsibilities & Tasks:'}</label>
                  <button
                    type="button"
                    onClick={() => setFormDynamicTasks([...formDynamicTasks, ''])}
                    className="text-blue-700 hover:text-blue-900 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>{isRtl ? 'إضافة مهمة أخرى' : 'Add another task'}</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formDynamicTasks.map((taskStr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={taskStr}
                        onChange={(e) => {
                          const updated = [...formDynamicTasks];
                          updated[idx] = e.target.value;
                          setFormDynamicTasks(updated);
                        }}
                        placeholder={isRtl ? `بيان المهمة ${idx + 1}...` : `Task ${idx + 1}...`}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-semibold"
                      />
                      {formDynamicTasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formDynamicTasks.filter((_, i) => i !== idx);
                            setFormDynamicTasks(updated.length ? updated : ['']);
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0"
                          title={isRtl ? 'حذف هذه المهمة' : 'Remove task'}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => { setShowAddCommitteeModal(false); setEditingCommittee(null); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition">
                  {editingCommittee ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : (isRtl ? 'حفظ اللجنة' : 'Save Committee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Committee Member */}
      {showAddMemberModal && selectedCommitteeId && (() => {
        const activeCom = committees.find((c) => c.id === selectedCommitteeId);
        if (!activeCom) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {editingMember ? (isRtl ? 'تعديل بيانات العضو' : 'Edit Member') : (isRtl ? 'إضافة عضو جديد للجنة' : 'Add Committee Member')}
                  </h3>
                  <p className="text-xs text-blue-700 font-bold">{activeCom.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowAddMemberModal(false); setEditingMember(null); }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                key={editingMember ? editingMember.id : 'new-member'}
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  handleSaveMember(activeCom.id, {
                    id: editingMember?.id,
                    name: fd.get('name'),
                    phone: fd.get('phone') || '',
                    role: fd.get('role') || (isRtl ? 'عضو ميداني' : 'Field Member')
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم العضو (الرباعي أو الثلاثي)' : 'Member Name'}</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingMember?.name || ''}
                    required
                    placeholder={isRtl ? 'محمد سالم باحميد' : 'Full Name'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'رقم الهاتف (للاتصال والتنسيق)' : 'Phone'}</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingMember?.phone || ''}
                    placeholder="770123456"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الدور أو المهمة الميدانية' : 'Role / Duty'}</label>
                  <input
                    type="text"
                    name="role"
                    defaultValue={editingMember?.role || ''}
                    placeholder={isRtl ? 'مسؤول السموار، منسق الساحة، تنظيم الضيوف...' : 'Role in committee...'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { setShowAddMemberModal(false); setEditingMember(null); }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
                  >
                    {editingMember ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : (isRtl ? 'حفظ وإضافة العضو' : 'Save Member')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Modal: Bulk Import Committee Members via Excel / CSV */}
      {showImportExcelModal && selectedCommitteeId && (() => {
        const activeCom = committees.find((c) => c.id === selectedCommitteeId);
        if (!activeCom) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 space-y-4 my-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <FileSpreadsheet size={20} className="text-emerald-600" />
                    <span>{isRtl ? 'استيراد أعضاء اللجنة من ملف إكسل أو CSV' : 'Import Members from Excel / CSV'}</span>
                  </h3>
                  <p className="text-xs text-emerald-800 font-bold">{activeCom.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportExcelModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 bg-emerald-50/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 mb-1">
                    {isRtl ? 'اختر ملف إكسل (.xlsx, .xls) أو ملف (.csv)' : 'Select Excel (.xlsx, .xls) or .csv file'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {isRtl ? 'يتعرف النظام تلقائياً على أعمدة: الاسم، رقم الهاتف، والدور' : 'Auto-detects columns: Name, Phone, and Role'}
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm transition">
                  <FileSpreadsheet size={15} />
                  <span>{excelFileName ? excelFileName : (isRtl ? 'تحديد الملف من جهازك' : 'Choose File')}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelFileUpload}
                    className="hidden"
                  />
                </label>

                {excelFileName && (
                  <p className="text-xs text-emerald-700 font-bold">
                    ✓ {isRtl ? 'تم تحميل الملف:' : 'Selected:'} {excelFileName}
                  </p>
                )}
              </div>

              {/* Sample Template Download */}
              <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-gray-600 font-bold">{isRtl ? 'بحاجة لنموذج منظم جاهز للتعبئة؟' : 'Need a pre-formatted template?'}</span>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="text-emerald-700 hover:text-emerald-800 font-black flex items-center gap-1 hover:underline"
                >
                  <Download size={13} />
                  <span>{isRtl ? 'تحميل نموذج تجريبي' : 'Download Template'}</span>
                </button>
              </div>

              {excelError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{excelError}</span>
                </div>
              )}

              {/* Preview Table */}
              {excelPreviewMembers.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-gray-900">
                    <span>{isRtl ? 'معاينة الأعضاء المستخرجين:' : 'Extracted Members Preview:'}</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                      {isRtl ? `تم العثور على (${excelPreviewMembers.length}) عضو` : `${excelPreviewMembers.length} members found`}
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 text-xs">
                    {excelPreviewMembers.map((m, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between gap-2 bg-white">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gray-400 font-mono text-[10px] w-5">{idx + 1}.</span>
                          <strong className="text-gray-900 truncate">{m.name}</strong>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{m.role}</span>
                        </div>
                        {m.phone && <span className="font-mono text-gray-500 text-[11px]" dir="ltr">{m.phone}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowImportExcelModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={excelPreviewMembers.length === 0}
                  onClick={() => handleConfirmImportExcel(activeCom.id)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold transition shadow-sm"
                >
                  {isRtl ? `تأكيد واستيراد (${excelPreviewMembers.length}) عضو ✓` : `Import (${excelPreviewMembers.length}) Members ✓`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: PDF Report & Printable Document */}
      {showPdfReportModal && selectedCommitteeId && (() => {
        const activeCom = committees.find((c) => c.id === selectedCommitteeId);
        if (!activeCom) return null;

        const comTasks = (activeCom.tasks && activeCom.tasks.length > 0)
          ? activeCom.tasks
          : (activeCom.responsibilities || []).map((r, i) => ({ id: `task-${i}`, text: r, completed: false }));
        const comMembers = activeCom.members || [];
        const completedTasksCount = comTasks.filter((t) => t.completed).length;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
              
              {/* Header Action Bar */}
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-200 print:hidden">
                <div className="flex items-center gap-2">
                  <Printer size={20} className="text-blue-700" />
                  <h3 className="text-base font-black text-gray-900">
                    {isRtl ? 'معاينة وثيقة وتكليف تقرير اللجنة (جاهز للطباعة وتصدير PDF)' : 'Printable Committee Report'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-md transition"
                  >
                    <Printer size={15} />
                    <span>{isRtl ? '🖨️ طباعة / حفظ كملف PDF' : 'Print / Save as PDF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPdfReportModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-700 rounded-xl transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* The Formal Document Paper Layout */}
              <div id="printable-committee-report" className="space-y-6 p-6 sm:p-8 bg-gray-50/50 rounded-2xl border border-gray-200 print:bg-white print:p-0 print:border-none print:shadow-none font-sans">
                {/* Official Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-gray-800 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                      {isRtl ? 'نظام إدارة الأعراس الجماعية - مراسيم' : 'Maraseem Mass Wedding Architecture'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                      {weddingInfo.title || (isRtl ? 'العرس الجماعي المشترك' : 'Mass Wedding')}
                    </h2>
                    <p className="text-xs text-gray-600 font-bold mt-0.5">
                      {weddingInfo.organizer} • {weddingInfo.location} • {weddingInfo.date}
                    </p>
                  </div>

                  <div className="text-left rtl:text-left ltr:text-right font-mono text-xs text-gray-500">
                    <div>{isRtl ? 'تاريخ التقرير:' : 'Date:'} {new Date().toLocaleDateString('ar-EG')}</div>
                    <div>{isRtl ? 'رقم اللجنة:' : 'Code:'} #{activeCom.id}</div>
                  </div>
                </div>

                {/* Committee Info Banner */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-blue-800 font-extrabold uppercase">{isRtl ? 'وثيقة تكليف وقائمة أعضاء:' : 'Committee:'}</span>
                    <h3 className="text-lg font-black text-blue-950">{activeCom.name}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 font-bold text-gray-700">
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-100">
                      <span>{isRtl ? 'مشرف اللجنة: ' : 'Lead: '}</span>
                      <strong className="text-gray-900">{activeCom.leader}</strong>
                      {activeCom.phone && <span className="text-gray-500 ms-1 font-mono">({activeCom.phone})</span>}
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-100">
                      <span>{isRtl ? 'إجمالي الأعضاء: ' : 'Members: '}</span>
                      <strong className="text-blue-900">{comMembers.length}</strong>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-100">
                      <span>{isRtl ? 'إنجاز المهام: ' : 'Tasks: '}</span>
                      <strong className="text-emerald-700">{completedTasksCount} / {comTasks.length}</strong>
                    </div>
                  </div>
                </div>

                {/* Table 1: Committee Members */}
                <div className="space-y-2">
                  <h4 className="font-black text-sm text-gray-900 flex items-center gap-2">
                    <span>👥</span>
                    <span>{isRtl ? 'أولاً: قائمة أسماء أعضاء اللجنة الميدانية' : '1. Committee Members Roster'}</span>
                  </h4>

                  {comMembers.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-3 bg-white rounded-xl border border-gray-200">
                      {isRtl ? 'لا يوجد أعضاء مسجلين بالاسم حتى الآن في هذه اللجنة.' : 'No members registered yet.'}
                    </p>
                  ) : (
                    <table className="w-full text-right rtl:text-right ltr:text-left text-xs border border-gray-300 rounded-xl overflow-hidden">
                      <thead className="bg-gray-100 font-black text-gray-800 border-b border-gray-300">
                        <tr>
                          <th className="p-2.5 w-12 text-center">#</th>
                          <th className="p-2.5">{isRtl ? 'اسم العضو الرباعي' : 'Member Name'}</th>
                          <th className="p-2.5">{isRtl ? 'رقم الهاتف' : 'Phone'}</th>
                          <th className="p-2.5">{isRtl ? 'الدور / المهمة الميدانية' : 'Role'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {comMembers.map((m, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                            <td className="p-2.5 text-center font-bold text-gray-500">{idx + 1}</td>
                            <td className="p-2.5 font-black text-gray-900">{m.name}</td>
                            <td className="p-2.5 font-mono text-gray-700" dir="ltr">{m.phone || '—'}</td>
                            <td className="p-2.5 text-gray-800 font-semibold">{m.role || (isRtl ? 'عضو ميداني' : 'Field Member')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Table 2: Tasks Checklist */}
                <div className="space-y-2">
                  <h4 className="font-black text-sm text-gray-900 flex items-center gap-2">
                    <span>📋</span>
                    <span>{isRtl ? 'ثانياً: بيان المهام والمسؤوليات الميدانية' : '2. Responsibilities & Operational Tasks'}</span>
                  </h4>

                  {comTasks.length === 0 ? (
                    <p className="text-xs text-gray-400 italic p-3 bg-white rounded-xl border border-gray-200">
                      {isRtl ? 'لم تسجل أي مهام محددة لهذه اللجنة.' : 'No tasks recorded.'}
                    </p>
                  ) : (
                    <table className="w-full text-right rtl:text-right ltr:text-left text-xs border border-gray-300 rounded-xl overflow-hidden">
                      <thead className="bg-gray-100 font-black text-gray-800 border-b border-gray-300">
                        <tr>
                          <th className="p-2.5 w-12 text-center">#</th>
                          <th className="p-2.5">{isRtl ? 'بيان المهمة الموكلة' : 'Task Description'}</th>
                          <th className="p-2.5 w-28 text-center">{isRtl ? 'حالة الإنجاز' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {comTasks.map((t, idx) => (
                          <tr key={idx} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                            <td className="p-2.5 text-center font-bold text-gray-500">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-gray-900">{t.text || t}</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                                t.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {t.completed ? (isRtl ? 'مكتملة ✓' : 'Done ✓') : (isRtl ? 'قيد التنفيذ' : 'Pending')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Signatures Strip */}
                <div className="pt-8 border-t-2 border-gray-200 grid grid-cols-2 gap-8 text-center text-xs">
                  <div className="space-y-8">
                    <p className="font-black text-gray-800">{isRtl ? 'مشرف اللجنة الميدانية' : 'Committee Lead'}</p>
                    <p className="text-gray-400 font-mono">...........................................</p>
                  </div>
                  <div className="space-y-8">
                    <p className="font-black text-gray-800">{isRtl ? 'اعتماد رئيس اللجنة المنظمة العليا' : 'Approved by Head of Organizer'}</p>
                    <p className="text-gray-400 font-mono">...........................................</p>
                  </div>
                </div>

              </div>

              {/* Footer Close Button */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 print:hidden">
                <button
                  type="button"
                  onClick={() => setShowPdfReportModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 transition"
                >
                  {isRtl ? 'إغلاق المعاينة' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs shadow-md transition flex items-center gap-2"
                >
                  <Printer size={16} />
                  <span>{isRtl ? 'طباعة / تصدير PDF' : 'Print / Export'}</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Modal: Committee QR Code & Sharing */}
      {qrModalData && (
        <CommitteeQrModal
          isOpen={!!qrModalData}
          onClose={() => setQrModalData(null)}
          committee={qrModalData.committee}
          weddingTitle={weddingInfo.title}
          portalUrl={qrModalData.portalUrl}
          isRtl={isRtl}
        />
      )}

      {/* Modal: Mobile Portal In-App Preview (محاكاة هاتف العضو الميداني) */}
      {portalPreviewCommittee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 rounded-[36px] sm:rounded-[44px] shadow-2xl max-w-sm w-full overflow-hidden border-4 border-slate-700 max-h-[92vh] flex flex-col relative">
            {/* Phone Top Notch / Header */}
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between text-white border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-bold text-gray-300">معاينة هاتف العضو الميداني</span>
              </div>
              <button
                type="button"
                onClick={() => setPortalPreviewCommittee(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                title="إغلاق المعاينة"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable View */}
            <div className="flex-1 overflow-y-auto bg-slate-100">
              <CommitteePortalView
                committee={portalPreviewCommittee}
                weddingTitle={weddingInfo.title}
                weddingDate={weddingInfo.date}
                organizer={weddingInfo.organizer}
                onBack={() => setPortalPreviewCommittee(null)}
                isStandalone={false}
                isRtl={isRtl}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Add / Edit Sponsor */}
      {showAddSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">
                {editingSponsor
                  ? (isRtl ? 'تعديل بيانات الراعي' : 'Edit Sponsor')
                  : (isRtl ? 'تسجيل راعي أو داعم' : 'Add Sponsor')}
              </h3>
              <button
                type="button"
                onClick={() => { setShowAddSponsorModal(false); setEditingSponsor(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>
            <form
              key={editingSponsor ? editingSponsor.id : 'new-sponsor'}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleSaveSponsor({
                  id: editingSponsor?.id,
                  sponsorName: fd.get('sponsorName'),
                  type: fd.get('type') || 'تبرع نقدي',
                  typeEn: 'Sponsor',
                  amount: Number(fd.get('amount')) || 1000000,
                  currency: 'ريال يمني',
                  status: editingSponsor?.status || 'confirmed',
                  contact: fd.get('contact') || '',
                  notes: fd.get('notes') || ''
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم الداعم أو المؤسسة' : 'Sponsor Name'}</label>
                <input type="text" name="sponsorName" defaultValue={editingSponsor?.sponsorName || ''} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'نوع المساهمة' : 'Type'}</label>
                  <select name="type" defaultValue={editingSponsor?.type || 'تبرع نقدي'} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold">
                    <option value="رعاية ماسية">{isRtl ? 'رعاية ماسية' : 'Diamond'}</option>
                    <option value="رعاية ذهبية">{isRtl ? 'رعاية ذهبية' : 'Gold'}</option>
                    <option value="تبرع نقدي">{isRtl ? 'تبرع نقدي' : 'Cash'}</option>
                    <option value="مساهمة عينية">{isRtl ? 'مساهمة عينية (ذبائح/أرز)' : 'In-Kind'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'المبلغ أو القيمة (ر.ي)' : 'Amount (YER)'}</label>
                  <input type="number" name="amount" defaultValue={editingSponsor?.amount || ''} min="1000" step="50000" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'شخص الاتصال / المنسق' : 'Contact Person'}</label>
                <input type="text" name="contact" defaultValue={editingSponsor?.contact || ''} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'ملاحظات' : 'Notes'}</label>
                <input type="text" name="notes" defaultValue={editingSponsor?.notes || ''} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setShowAddSponsorModal(false); setEditingSponsor(null); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition">
                  {editingSponsor ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : (isRtl ? 'حفظ الراعي' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Add / Edit Expense */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">
                {editingExpense
                  ? (isRtl ? 'تعديل بند المصروف' : 'Edit Expense')
                  : (isRtl ? 'إضافة بند مصروفات' : 'Add Expense')}
              </h3>
              <button
                type="button"
                onClick={() => { setShowAddExpenseModal(false); setEditingExpense(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>
            <form
              key={editingExpense ? editingExpense.id : 'new-expense'}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleSaveExpense({
                  id: editingExpense?.id,
                  item: fd.get('item'),
                  itemEn: fd.get('item'),
                  amount: Number(fd.get('amount')) || 100000,
                  category: fd.get('category') || 'general',
                  status: editingExpense?.status || 'approved'
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم بند المصروف' : 'Item'}</label>
                <input type="text" name="item" defaultValue={editingExpense?.item || ''} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'المبلغ (ر.ي)' : 'Amount'}</label>
                  <input type="number" name="amount" defaultValue={editingExpense?.amount || ''} min="1000" step="10000" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الفئة' : 'Category'}</label>
                  <select name="category" defaultValue={editingExpense?.category || 'banquet'} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold">
                    <option value="banquet">{isRtl ? 'الوليمة والذبائح' : 'Banquet'}</option>
                    <option value="tea">{isRtl ? 'الشاهي والسقيا' : 'Tea & Water'}</option>
                    <option value="venue">{isRtl ? 'الساحة والمخادر' : 'Venue'}</option>
                    <option value="gifts">{isRtl ? 'الكسوة والمنح' : 'Groom Grants'}</option>
                    <option value="media">{isRtl ? 'الإعلام والتصوير' : 'Media'}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setShowAddExpenseModal(false); setEditingExpense(null); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition">
                  {editingExpense ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : (isRtl ? 'حفظ المصروف' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4b: Add / Edit Schedule Event */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">
                {editingScheduleItem
                  ? (isRtl ? 'تعديل الفعالية / المرحلة' : 'Edit Schedule Event')
                  : (isRtl ? 'إضافة فعالية / مرحلة جديدة' : 'Add Schedule Event')}
              </h3>
              <button
                type="button"
                onClick={() => { setShowScheduleModal(false); setEditingScheduleItem(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>
            <form
              key={editingScheduleItem ? editingScheduleItem.id : 'new-schedule'}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleSaveSchedule({
                  id: editingScheduleItem?.id,
                  time: fd.get('time'),
                  title: fd.get('title'),
                  titleEn: fd.get('title'),
                  location: fd.get('location'),
                  coordinator: fd.get('coordinator'),
                  status: editingScheduleItem?.status || 'upcoming'
                });
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الوقت / الموعد' : 'Time'}</label>
                  <input type="text" name="time" defaultValue={editingScheduleItem?.time || ''} placeholder="04:00 عصراً" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اللجنة المنسقة' : 'Coordinator'}</label>
                  <input type="text" name="coordinator" defaultValue={editingScheduleItem?.coordinator || ''} placeholder={isRtl ? 'لجنة الاستقبال...' : 'Coordinator...'} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'عنوان الفعالية أو المرحلة' : 'Event Title'}</label>
                <input type="text" name="title" defaultValue={editingScheduleItem?.title || ''} placeholder={isRtl ? 'عقد القران ومراسم الزفاف' : 'Event Title'} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'المكان / الساحة' : 'Location'}</label>
                <input type="text" name="location" defaultValue={editingScheduleItem?.location || ''} placeholder={isRtl ? 'ساحة الجامع الكبير' : 'Location'} required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setShowScheduleModal(false); setEditingScheduleItem(null); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold">{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition">
                  {editingScheduleItem ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : (isRtl ? 'حفظ الفعالية' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Supply Item Modal */}
      {showAddSupplyModal && (
        <SupplyItemModal
          isOpen={showAddSupplyModal}
          onClose={() => {
            setShowAddSupplyModal(false);
            setEditingSupplyItem(null);
          }}
          editingItem={editingSupplyItem}
          onSave={handleSaveSupplyItem}
          totalGuests={logistics.totalGuests}
          isRtl={isRtl}
        />
      )}

    </div>
  );
}



// ==========================================
// MODAL: ADD / EDIT CUSTOM SUPPLY ITEM
// ==========================================
function SupplyItemModal({ isOpen, onClose, editingItem, onSave, totalGuests = 0, isRtl }) {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    category: editingItem?.category || 'food',
    unit: editingItem?.unit || (isRtl ? 'كرتون' : 'carton'),
    rateType: editingItem?.rateType || 'ratio',
    ratio: editingItem?.ratio || 50,
    fixedAmount: editingItem?.fixedAmount || 10,
    note: editingItem?.note || ''
  });

  const previewQuantity = useMemo(() => {
    if (formData.rateType === 'ratio') {
      const r = Number(formData.ratio) || 1;
      return totalGuests > 0 ? Math.ceil(totalGuests / r) : 0;
    }
    return Number(formData.fixedAmount) || 0;
  }, [formData.rateType, formData.ratio, formData.fixedAmount, totalGuests]);

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

        {/* Live Calculation Preview Banner */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-900 block">
              {isRtl ? 'الكمية المحسوبة حالياً:' : 'Current Calculated Quantity:'}
            </span>
            <span className="text-[10px] text-gray-500">
              {formData.rateType === 'ratio'
                ? (isRtl ? `بناءً على ${totalGuests.toLocaleString()} ضيف` : `Based on ${totalGuests.toLocaleString()} guests`)
                : (isRtl ? 'كمية مقطوعة ثابتة' : 'Fixed quantity')}
            </span>
          </div>
          <div className="text-sm sm:text-base font-black text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-200 shadow-2xs">
            {previewQuantity.toLocaleString()} <span className="text-xs text-gray-600 font-bold">{formData.unit || (isRtl ? 'وحدة' : 'units')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">

          {/* Quick Preset Item Pills */}
          {!editingItem && (
            <div>
              <span className="text-[10px] text-gray-400 block mb-1 font-bold">
                {isRtl ? 'أو اختر اقتراحاً سريعاً لملء البيانات:' : 'Quick Select:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: isRtl ? 'ذبائح غنم للوليمة' : 'Feast Sheep', category: 'food', unit: isRtl ? 'رأس' : 'head', rateType: 'ratio', ratio: 16 },
                  { name: isRtl ? 'أرز بسمتي (40 كجم)' : 'Rice Sacks', category: 'food', unit: isRtl ? 'كيس' : 'sack', rateType: 'ratio', ratio: 150 },
                  { name: isRtl ? 'فريق عدة الشاي' : 'Tea Crew', category: 'teaHospitality', unit: isRtl ? 'فرد' : 'crew', rateType: 'ratio', ratio: 70 },
                  { name: isRtl ? 'برادات مياه كبيرة' : 'Water Dispensers', category: 'hydration', unit: isRtl ? 'براد' : 'dispenser', rateType: 'ratio', ratio: 75 },
                  { name: isRtl ? 'قوالب ثلج' : 'Ice Blocks', category: 'hydration', unit: isRtl ? 'قالب' : 'block', rateType: 'ratio', ratio: 25 },
                  { name: isRtl ? 'سجاد ومفارش' : 'Carpets', category: 'venue', unit: isRtl ? 'سجادة' : 'carpet', rateType: 'ratio', ratio: 11 },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      name: preset.name,
                      category: preset.category,
                      unit: preset.unit,
                      rateType: preset.rateType,
                      ratio: preset.ratio
                    }))}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-amber-100 hover:text-amber-900 text-gray-600 transition font-bold border border-gray-200"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              {isRtl ? 'اسم المادة أو المؤونة' : 'Material / Item Name'}
            </label>
            <input
              type="text"
              required
              placeholder={isRtl ? 'مثال: ذبائح غنم، كراتين زيت، برادات ماء...' : 'e.g. Feast sheep, Cooking oil...'}
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
                <option value="food">{isRtl ? 'وليمة وإطعام' : 'Food & Feast'}</option>
                <option value="teaHospitality">{isRtl ? 'عدة الشاي والسموار' : 'Tea Hospitality'}</option>
                <option value="hydration">{isRtl ? 'سقيا الماء' : 'Water & Hydration'}</option>
                <option value="venue">{isRtl ? 'الساحة والمخادر' : 'Venue & Setup'}</option>
                <option value="general">{isRtl ? 'عامة' : 'General'}</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-gray-700">{isRtl ? 'وحدة القياس' : 'Unit'}</label>
                <div className="flex flex-wrap gap-1">
                  {['رأس', 'كيس', 'كرتون', 'براد', 'سجادة', 'كجم'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, unit: u }))}
                      className="text-[9px] px-1 py-0.2 rounded bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-800 transition font-bold"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                required
                placeholder={isRtl ? 'كرتون / رأس / كيس / براد...' : 'carton / head / sack...'}
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
