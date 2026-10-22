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
  DEFAULT_CUSTOM_LOGISTICS_ITEMS,
  DEFAULT_MASS_WEDDING_COMMITTEES
} from '../data/massWeddingTemplates';
import CommandBroadcastHub from './CommandBroadcastHub';
import CommitteeQrModal from './CommitteeQrModal';
import CommitteePortalView from './CommitteePortalView';
import { generateCommitteePortalUrl, syncCommitteeToPublicFirestore } from '../utils/portalHelpers';
import { db } from '../firebase';

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

  // --- Modals & Roster State ---
  const [rosterSubTab, setRosterSubTab] = useState('grooms'); // 'grooms' | 'brides'

  // Grooms Modals & Search
  const [showAddGroomModal, setShowAddGroomModal] = useState(false);
  const [editingGroom, setEditingGroom] = useState(null);
  const [groomSearch, setGroomSearch] = useState('');
  const [groomFilter, setGroomFilter] = useState('all'); // 'all' | 'ready' | 'pending'
  const [showBulkImportGroomsModal, setShowBulkImportGroomsModal] = useState(false);
  const [bulkExcelGrooms, setBulkExcelGrooms] = useState([]);
  const [bulkExcelGroomsMode, setBulkExcelGroomsMode] = useState('append'); // 'append' | 'replace'
  const [bulkExcelGroomsFileName, setBulkExcelGroomsFileName] = useState('');
  const [bulkExcelGroomsError, setBulkExcelGroomsError] = useState('');

  // Brides Modals & Search
  const [showAddBrideModal, setShowAddBrideModal] = useState(false);
  const [editingBride, setEditingBride] = useState(null);
  const [brideSearch, setBrideSearch] = useState('');
  const [brideFilter, setBrideFilter] = useState('all'); // 'all' | 'ready' | 'pending'
  const [showBulkImportBridesModal, setShowBulkImportBridesModal] = useState(false);
  const [bulkExcelBrides, setBulkExcelBrides] = useState([]);
  const [bulkExcelBridesMode, setBulkExcelBridesMode] = useState('append'); // 'append' | 'replace'
  const [bulkExcelBridesFileName, setBulkExcelBridesFileName] = useState('');
  const [bulkExcelBridesError, setBulkExcelBridesError] = useState('');

  // Backward compatibility aliases
  const showAddCoupleModal = showAddGroomModal;
  const setShowAddCoupleModal = setShowAddGroomModal;
  const editingCouple = editingGroom;
  const setEditingCouple = setEditingGroom;
  const coupleSearch = groomSearch;
  const setCoupleSearch = setGroomSearch;
  const coupleFilter = groomFilter;
  const setCoupleFilter = setGroomFilter;
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
  const [showBulkImportCommitteesModal, setShowBulkImportCommitteesModal] = useState(false);
  const [bulkExcelCommittees, setBulkExcelCommittees] = useState([]);
  const [bulkExcelMode, setBulkExcelMode] = useState('append'); // 'append' | 'replace'
  const [bulkExcelFileName, setBulkExcelFileName] = useState('');
  const [bulkExcelError, setBulkExcelError] = useState('');
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

  // Safe Fallback Data
  const weddingInfo = data.info || {};
  const couples = data.couples || [];
  const committees = data.committees || [];
  const sponsorships = data.sponsorships || [];
  const expenses = data.expenses || [];
  const schedule = data.schedule || [];

  // Normalized Grooms & Brides with graceful fallback to legacy couples
  const grooms = useMemo(() => {
    if (Array.isArray(data.grooms) && data.grooms.length > 0) return data.grooms;
    if (Array.isArray(data.couples) && data.couples.length > 0) {
      return data.couples.map((c, idx) => ({
        id: c.id || `groom-${idx}`,
        name: c.groomName || c.name || `عريس ${idx + 1}`,
        phone: c.groomPhone || c.phone || '',
        nationalId: c.nationalId || '',
        tribe: c.tribe || '',
        area: c.area || '',
        guestQuota: c.guestQuota !== undefined && c.guestQuota !== '' ? c.guestQuota : 35,
        medicalStatus: c.medicalStatus || 'pending',
        contractStatus: c.contractStatus || 'in_progress',
        aidStatus: c.aidStatus || 'processing',
        partnerBrideId: c.brideName ? `bride-legacy-${idx}` : '',
        partnerBrideName: c.brideName || '',
        notes: c.notes || ''
      }));
    }
    return [];
  }, [data.grooms, data.couples]);

  const brides = useMemo(() => {
    if (Array.isArray(data.brides) && data.brides.length > 0) return data.brides;
    if (Array.isArray(data.couples) && data.couples.length > 0) {
      return data.couples
        .filter((c) => c.brideName)
        .map((c, idx) => ({
          id: `bride-legacy-${idx}`,
          name: c.brideName || `عروس ${idx + 1}`,
          phone: c.bridePhone || '',
          guardianName: c.guardianName || '',
          guardianPhone: c.guardianPhone || '',
          guardianRelation: c.guardianRelation || 'أب',
          nationalId: '',
          tribe: c.tribe || '',
          area: c.area || '',
          guestQuota: c.guestQuota !== undefined && c.guestQuota !== '' ? c.guestQuota : 25,
          medicalStatus: c.medicalStatus || 'pending',
          contractStatus: c.contractStatus || 'in_progress',
          partnerGroomId: c.id || `groom-${idx}`,
          partnerGroomName: c.groomName || '',
          notes: ''
        }));
    }
    return [];
  }, [data.brides, data.couples]);

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

  const completedGroomsCount = useMemo(() => {
    return grooms.filter((g) => g.medicalStatus === 'completed' && g.contractStatus === 'completed').length;
  }, [grooms]);

  const completedBridesCount = useMemo(() => {
    return brides.filter((b) => b.medicalStatus === 'completed' && b.contractStatus === 'completed').length;
  }, [brides]);

  const completedCouplesCount = completedGroomsCount || useMemo(() => {
    return couples.filter(
      (c) => c.medicalStatus === 'completed' && c.contractStatus === 'completed'
    ).length;
  }, [couples]);

  const totalVolunteers = useMemo(() => {
    return committees.reduce((sum, com) => sum + (Number(com.volunteersCount) || 0), 0);
  }, [committees]);

  // --- Committee Detailed Memoized Computations ---
  const activeCommittee = useMemo(() => {
    return committees.find((c) => c.id === selectedCommitteeId);
  }, [committees, selectedCommitteeId]);

  const { comTasks, completedTasksCount, taskCompletionPct, comMembers } = useMemo(() => {
    if (!selectedCommitteeId || !activeCommittee) {
      return { comTasks: [], completedTasksCount: 0, taskCompletionPct: 0, comMembers: [] };
    }
    const tasks = (activeCommittee.tasks && activeCommittee.tasks.length > 0)
      ? activeCommittee.tasks
      : (activeCommittee.responsibilities || []).map((r, i) => ({ id: `task-${i}`, text: r, completed: false }));
    const completed = tasks.filter((t) => t.completed).length;
    const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    const members = activeCommittee.members || [];
    return { comTasks: tasks, completedTasksCount: completed, taskCompletionPct: pct, comMembers: members };
  }, [selectedCommitteeId, activeCommittee]);

  const filteredMembers = useMemo(() => {
    return comMembers.filter((m) => {
      if (!memberSearchQuery.trim()) return true;
      const q = memberSearchQuery.toLowerCase();
      return (
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.phone && m.phone.toLowerCase().includes(q)) ||
        (m.role && m.role.toLowerCase().includes(q))
      );
    });
  }, [comMembers, memberSearchQuery]);

  // Dynamic Logistics & Custom Rates Calculation
  const calculatorRates = useMemo(() => {
    return { ...DEFAULT_CALCULATOR_RATES, ...(data.calculatorSettings?.rates || {}) };
  }, [data.calculatorSettings?.rates]);

  const customItems = useMemo(() => {
    return data.calculatorSettings?.customItems || DEFAULT_CUSTOM_LOGISTICS_ITEMS;
  }, [data.calculatorSettings?.customItems]);

  const logistics = useMemo(() => {
    return calculateMassWeddingLogistics(
      { grooms, brides, couples },
      weddingInfo,
      calculatorRates,
      customItems
    );
  }, [grooms, brides, couples, weddingInfo, calculatorRates, customItems]);

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
    const participantsTotal = Math.max(grooms.length, brides.length, couples.length);
    if (participantsTotal > 0) {
      score += Math.round((completedCouplesCount / participantsTotal) * 35);
    }
    if (totalSponsorships >= totalExpenses && totalExpenses > 0) score += 25;
    else if (totalSponsorships > 0) score += 15;
    if (committees.length >= 4) score += 20;
    return Math.min(100, score);
  }, [couples, grooms, brides, completedCouplesCount, totalSponsorships, totalExpenses, committees]);

  // --- Handlers: Grooms ---
  const handleSaveGroom = (groomData) => {
    let updated;
    const finalGroom = { ...groomData, id: groomData.id || `groom-${Date.now()}` };
    if (groomData.id && grooms.some((g) => g.id === groomData.id)) {
      updated = grooms.map((g) => (g.id === groomData.id ? { ...g, ...groomData } : g));
    } else {
      updated = [finalGroom, ...grooms];
    }
    // Sync to legacy couples array as well for complete compatibility
    const updatedCouples = updated.map((g, idx) => ({
      id: g.id,
      groomName: g.name,
      groomPhone: g.phone,
      brideName: g.partnerBrideName || (brides[idx]?.name || ''),
      tribe: g.tribe,
      area: g.area,
      phone: g.phone,
      guestQuota: g.guestQuota,
      medicalStatus: g.medicalStatus,
      contractStatus: g.contractStatus,
      aidStatus: g.aidStatus,
      notes: g.notes
    }));
    onUpdateData({ ...data, grooms: updated, couples: updatedCouples });
    setShowAddGroomModal(false);
    setEditingGroom(null);
  };

  const handleEditGroom = (groom) => {
    setEditingGroom(groom);
    setShowAddGroomModal(true);
  };

  const handleDeleteGroom = (groomId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذا العريس من السجل؟' : 'Remove this groom from the roster?')) {
      const updated = grooms.filter((g) => g.id !== groomId);
      const updatedCouples = couples.filter((c) => c.id !== groomId);
      onUpdateData({ ...data, grooms: updated, couples: updatedCouples });
      if (editingGroom?.id === groomId) {
        setEditingGroom(null);
        setShowAddGroomModal(false);
      }
    }
  };

  const handleToggleGroomStatus = (groomId, field) => {
    const updated = grooms.map((g) => {
      if (g.id === groomId) {
        if (field === 'medicalStatus') {
          return { ...g, medicalStatus: g.medicalStatus === 'completed' ? 'pending' : 'completed' };
        }
        if (field === 'contractStatus') {
          return { ...g, contractStatus: g.contractStatus === 'completed' ? 'in_progress' : 'completed' };
        }
        if (field === 'aidStatus') {
          return { ...g, aidStatus: g.aidStatus === 'delivered' ? 'processing' : 'delivered' };
        }
      }
      return g;
    });
    onUpdateData({ ...data, grooms: updated });
  };

  const handleDownloadGroomsSampleCsv = () => {
    const headers = ['اسم العريس', 'رقم الهاتف', 'الرقم الوطني', 'القبيلة واللقب', 'المنطقة السكنية', 'عدد المعازيم', 'الفحص الطبي', 'عقد القران', 'استلام المساعدة', 'اسم العروس المقترنة', 'ملاحظات'];
    const sampleRows = [
      ['محمد عبدالله باوزير', '771234567', '08010023451', 'باوزير', 'حي الروضة - المكلا', '35', 'مكتمل', 'موثق', 'تم الاستلام', 'فاطمة أحمد', 'مستوفي جميع الوثائق الرسمية'],
      ['صالح علي بن محفوظ', '773456789', '08010045612', 'بن محفوظ', 'فوة القديمة', '40', 'مكتمل', 'قيد التوثيق', 'قيد التجهيز', 'مريم سالم', 'يحتاج متابعة توثيق العقد الشرعي']
    ];
    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نموذج_استيراد_العرسان.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkGroomsFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkExcelGroomsFileName(file.name);
    setBulkExcelGroomsError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const dataRows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!dataRows || dataRows.length < 1) {
          setBulkExcelGroomsError(isRtl ? 'الملف فارغ.' : 'File is empty.');
          return;
        }

        const firstRow = dataRows[0].map(h => String(h || '').trim().toLowerCase());
        const findColIdx = (aliases) => firstRow.findIndex(h => aliases.some(a => h.includes(a)));

        const nameIdx = findColIdx(['اسم العريس', 'الاسم', 'العريس', 'عريس', 'اسم', 'name', 'groom']);
        const phoneIdx = findColIdx(['رقم الهاتف', 'الهاتف', 'الجوال', 'تلفون', 'phone', 'mobile']);
        const nationalIdIdx = findColIdx(['الرقم الوطني', 'السجل المدني', 'رقم الهوية', 'الهوية', 'national_id', 'nationalid']);
        const tribeIdx = findColIdx(['القبيلة', 'اللقب', 'العائلة', 'tribe', 'family']);
        const areaIdx = findColIdx(['المنطقة', 'السكن', 'الحي', 'المدينة', 'area', 'residence']);
        const quotaIdx = findColIdx(['كوتة المعازيم', 'عدد المعازيم', 'المعازيم', 'دعوات', 'quota', 'guests']);
        const medicalIdx = findColIdx(['الفحص الطبي', 'فحص طبي', 'medical']);
        const contractIdx = findColIdx(['عقد القران', 'عقد', 'contract']);
        const aidIdx = findColIdx(['المساعدة', 'المنحة', 'الكسوة', 'aid', 'grant']);
        const partnerBrideIdx = findColIdx(['اسم العروس', 'العروس', 'الزوجة', 'bride']);
        const notesIdx = findColIdx(['ملاحظات', 'ملاحظة', 'notes', 'note']);

        const hasHeader = nameIdx !== -1 || phoneIdx !== -1;
        const startRowIdx = hasHeader ? 1 : 0;
        const actualNameIdx = nameIdx !== -1 ? nameIdx : 0;

        const parsedGrooms = [];
        for (let i = startRowIdx; i < dataRows.length; i++) {
          const row = dataRows[i];
          if (!row || row.length === 0) continue;
          const nameVal = String(row[actualNameIdx] || '').trim();
          if (!nameVal) continue;

          const phoneVal = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '';
          const nationalIdVal = nationalIdIdx !== -1 ? String(row[nationalIdIdx] || '').trim() : '';
          const tribeVal = tribeIdx !== -1 ? String(row[tribeIdx] || '').trim() : '';
          const areaVal = areaIdx !== -1 ? String(row[areaIdx] || '').trim() : (weddingInfo.city || '');
          const quotaVal = quotaIdx !== -1 ? (Number(row[quotaIdx]) || 35) : 35;

          const medStr = medicalIdx !== -1 ? String(row[medicalIdx] || '').trim().toLowerCase() : '';
          const isMedicalDone = medStr.includes('مكتمل') || medStr.includes('نعم') || medStr.includes('done') || medStr.includes('completed') || medStr.includes('1') || medStr.includes('جاهز');

          const conStr = contractIdx !== -1 ? String(row[contractIdx] || '').trim().toLowerCase() : '';
          const isContractDone = conStr.includes('موثق') || conStr.includes('مكتمل') || conStr.includes('نعم') || conStr.includes('done') || conStr.includes('completed') || conStr.includes('1');

          const aidStr = aidIdx !== -1 ? String(row[aidIdx] || '').trim().toLowerCase() : '';
          const isAidDelivered = aidStr.includes('مستلم') || aidStr.includes('تم') || aidStr.includes('delivered') || aidStr.includes('1');

          const partnerBrideVal = partnerBrideIdx !== -1 ? String(row[partnerBrideIdx] || '').trim() : '';
          const notesVal = notesIdx !== -1 ? String(row[notesIdx] || '').trim() : '';

          parsedGrooms.push({
            id: `groom-import-${Date.now()}-${i}`,
            name: nameVal,
            phone: phoneVal,
            nationalId: nationalIdVal,
            tribe: tribeVal,
            area: areaVal,
            guestQuota: quotaVal,
            medicalStatus: isMedicalDone ? 'completed' : 'pending',
            contractStatus: isContractDone ? 'completed' : 'in_progress',
            aidStatus: isAidDelivered ? 'delivered' : 'processing',
            partnerBrideName: partnerBrideVal,
            notes: notesVal
          });
        }

        if (parsedGrooms.length === 0) {
          setBulkExcelGroomsError(isRtl ? 'لم يتم العثور على بيانات عرسان صالحة في الملف.' : 'No valid groom records found.');
        } else {
          setBulkExcelGrooms(parsedGrooms);
        }
      } catch (err) {
        console.error('Error parsing grooms excel:', err);
        setBulkExcelGroomsError(isRtl ? 'حدث خطأ أثناء قراءة الملف. تأكد من الصيغة الصحيحة.' : 'Error reading file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmBulkImportGrooms = () => {
    if (!bulkExcelGrooms || bulkExcelGrooms.length === 0) return;
    const finalGrooms = bulkExcelGroomsMode === 'replace' ? [...bulkExcelGrooms] : [...grooms, ...bulkExcelGrooms];
    onUpdateData({ ...data, grooms: finalGrooms });
    setBulkExcelGrooms([]);
    setBulkExcelGroomsFileName('');
    setBulkExcelGroomsError('');
    setShowBulkImportGroomsModal(false);
  };

  // --- Handlers: Brides ---
  const handleSaveBride = (brideData) => {
    let updated;
    const finalBride = { ...brideData, id: brideData.id || `bride-${Date.now()}` };
    if (brideData.id && brides.some((b) => b.id === brideData.id)) {
      updated = brides.map((b) => (b.id === brideData.id ? { ...b, ...brideData } : b));
    } else {
      updated = [finalBride, ...brides];
    }
    onUpdateData({ ...data, brides: updated });
    setShowAddBrideModal(false);
    setEditingBride(null);
  };

  const handleEditBride = (bride) => {
    setEditingBride(bride);
    setShowAddBrideModal(true);
  };

  const handleDeleteBride = (brideId) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف هذه العروس من السجل؟' : 'Remove this bride from the roster?')) {
      const updated = brides.filter((b) => b.id !== brideId);
      onUpdateData({ ...data, brides: updated });
      if (editingBride?.id === brideId) {
        setEditingBride(null);
        setShowAddBrideModal(false);
      }
    }
  };

  const handleToggleBrideStatus = (brideId, field) => {
    const updated = brides.map((b) => {
      if (b.id === brideId) {
        if (field === 'medicalStatus') {
          return { ...b, medicalStatus: b.medicalStatus === 'completed' ? 'pending' : 'completed' };
        }
        if (field === 'contractStatus') {
          return { ...b, contractStatus: b.contractStatus === 'completed' ? 'in_progress' : 'completed' };
        }
      }
      return b;
    });
    onUpdateData({ ...data, brides: updated });
  };

  const handleDownloadBridesSampleCsv = () => {
    const headers = ['اسم العروس', 'اسم ولي الأمر', 'صلة القرابة', 'هاتف ولي الأمر', 'هاتف العروس', 'الرقم الوطني', 'القبيلة واللقب', 'المنطقة السكنية', 'كوتة صالة النساء', 'الفحص الطبي', 'عقد القران', 'اسم العريس المقترن', 'ملاحظات'];
    const sampleRows = [
      ['فاطمة أحمد باوزير', 'أحمد سعيد باوزير', 'أب', '770987654', '771122334', '08010078901', 'باوزير', 'حي الروضة - المكلا', '30', 'مكتمل', 'موثق', 'محمد عبدالله باوزير', 'تأكيد حجز صالة النساء مسبقاً'],
      ['مريم سالم الكندي', 'سالم عمر الكندي', 'أب', '772334455', '', '08010099881', 'الكندي', 'الديس', '25', 'مكتمل', 'قيد التوثيق', 'صالح علي بن محفوظ', '']
    ];
    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نموذج_استيراد_العرائس.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkBridesFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkExcelBridesFileName(file.name);
    setBulkExcelBridesError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const dataRows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!dataRows || dataRows.length < 1) {
          setBulkExcelBridesError(isRtl ? 'الملف فارغ.' : 'File is empty.');
          return;
        }

        const firstRow = dataRows[0].map(h => String(h || '').trim().toLowerCase());
        const findColIdx = (aliases) => firstRow.findIndex(h => aliases.some(a => h.includes(a)));

        const nameIdx = findColIdx(['اسم العروس', 'العروس', 'الاسم', 'عروس', 'name', 'bride']);
        const guardianNameIdx = findColIdx(['اسم ولي الأمر', 'ولي الأمر', 'الولي', 'اسم الولي', 'guardian', 'guardian_name']);
        const guardianRelationIdx = findColIdx(['صلة القرابة', 'القرابة', 'صلة', 'relation']);
        const guardianPhoneIdx = findColIdx(['هاتف ولي الأمر', 'جوال ولي الأمر', 'رقم ولي الأمر', 'guardian_phone']);
        const phoneIdx = findColIdx(['هاتف العروس', 'جوال العروس', 'رقم الهاتف', 'الهاتف', 'phone', 'mobile']);
        const nationalIdIdx = findColIdx(['الرقم الوطني', 'السجل المدني', 'الهوية', 'national_id']);
        const tribeIdx = findColIdx(['القبيلة', 'اللقب', 'العائلة', 'tribe', 'family']);
        const areaIdx = findColIdx(['المنطقة', 'السكن', 'الحي', 'المدينة', 'area', 'residence']);
        const quotaIdx = findColIdx(['كوتة صالة النساء', 'صالة النساء', 'عدد المعازيم', 'المعازيم', 'quota', 'guests']);
        const medicalIdx = findColIdx(['الفحص الطبي', 'فحص طبي', 'medical']);
        const contractIdx = findColIdx(['عقد القران', 'عقد', 'contract']);
        const partnerGroomIdx = findColIdx(['اسم العريس', 'العريس', 'الزوج', 'groom']);
        const notesIdx = findColIdx(['ملاحظات', 'ملاحظة', 'notes']);

        const hasHeader = nameIdx !== -1 || guardianNameIdx !== -1;
        const startRowIdx = hasHeader ? 1 : 0;
        const actualNameIdx = nameIdx !== -1 ? nameIdx : 0;

        const parsedBrides = [];
        for (let i = startRowIdx; i < dataRows.length; i++) {
          const row = dataRows[i];
          if (!row || row.length === 0) continue;
          const nameVal = String(row[actualNameIdx] || '').trim();
          if (!nameVal) continue;

          const guardianNameVal = guardianNameIdx !== -1 ? String(row[guardianNameIdx] || '').trim() : '';
          const guardianRelationVal = guardianRelationIdx !== -1 ? String(row[guardianRelationIdx] || '').trim() : 'أب';
          const guardianPhoneVal = guardianPhoneIdx !== -1 ? String(row[guardianPhoneIdx] || '').trim() : '';
          const phoneVal = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '';
          const nationalIdVal = nationalIdIdx !== -1 ? String(row[nationalIdIdx] || '').trim() : '';
          const tribeVal = tribeIdx !== -1 ? String(row[tribeIdx] || '').trim() : '';
          const areaVal = areaIdx !== -1 ? String(row[areaIdx] || '').trim() : (weddingInfo.city || '');
          const quotaVal = quotaIdx !== -1 ? (Number(row[quotaIdx]) || 25) : 25;

          const medStr = medicalIdx !== -1 ? String(row[medicalIdx] || '').trim().toLowerCase() : '';
          const isMedicalDone = medStr.includes('مكتمل') || medStr.includes('نعم') || medStr.includes('done') || medStr.includes('completed') || medStr.includes('1') || medStr.includes('جاهز');

          const conStr = contractIdx !== -1 ? String(row[contractIdx] || '').trim().toLowerCase() : '';
          const isContractDone = conStr.includes('موثق') || conStr.includes('مكتمل') || conStr.includes('نعم') || conStr.includes('done') || conStr.includes('completed') || conStr.includes('1');

          const partnerGroomVal = partnerGroomIdx !== -1 ? String(row[partnerGroomIdx] || '').trim() : '';
          const notesVal = notesIdx !== -1 ? String(row[notesIdx] || '').trim() : '';

          parsedBrides.push({
            id: `bride-import-${Date.now()}-${i}`,
            name: nameVal,
            guardianName: guardianNameVal,
            guardianRelation: guardianRelationVal,
            guardianPhone: guardianPhoneVal,
            phone: phoneVal,
            nationalId: nationalIdVal,
            tribe: tribeVal,
            area: areaVal,
            guestQuota: quotaVal,
            medicalStatus: isMedicalDone ? 'completed' : 'pending',
            contractStatus: isContractDone ? 'completed' : 'in_progress',
            partnerGroomName: partnerGroomVal,
            notes: notesVal
          });
        }

        if (parsedBrides.length === 0) {
          setBulkExcelBridesError(isRtl ? 'لم يتم العثور على بيانات عرائس صالحة في الملف.' : 'No valid bride records found.');
        } else {
          setBulkExcelBrides(parsedBrides);
        }
      } catch (err) {
        console.error('Error parsing brides excel:', err);
        setBulkExcelBridesError(isRtl ? 'حدث خطأ أثناء قراءة الملف. تأكد من الصيغة الصحيحة.' : 'Error reading file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmBulkImportBrides = () => {
    if (!bulkExcelBrides || bulkExcelBrides.length === 0) return;
    const finalBrides = bulkExcelBridesMode === 'replace' ? [...bulkExcelBrides] : [...brides, ...bulkExcelBrides];
    onUpdateData({ ...data, brides: finalBrides });
    setBulkExcelBrides([]);
    setBulkExcelBridesFileName('');
    setBulkExcelBridesError('');
    setShowBulkImportBridesModal(false);
  };

  // Legacy couple compatibility handlers
  const handleSaveCouple = handleSaveGroom;
  const handleEditCouple = handleEditGroom;
  const handleDeleteCouple = handleDeleteGroom;
  const handleToggleCoupleStatus = handleToggleGroomStatus;

  // --- Handlers: Committees ---
  const handleSaveCommittee = (comData) => {
    let updated;
    const finalCom = { ...comData, id: comData.id || `com-${Date.now()}` };
    if (comData.id && committees.some((com) => com.id === comData.id)) {
      updated = committees.map((com) => (com.id === comData.id ? { ...com, ...comData } : com));
    } else {
      updated = [...committees, finalCom];
    }
    syncCommitteeToPublicFirestore(db, finalCom, weddingInfo);
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

  // إدراج اللجان الميدانية الافتراضية الـ 14 (لجنة الصالة، العقد، السامان، العشاء، النظام، الفرش، الماء البارد، المغاسيل، العرسان، الذبح، الطبخ، المسرح، الإعلام، الصحة)
  const handleLoadDefaultCommittees = (replace = false) => {
    const freshDefaults = DEFAULT_MASS_WEDDING_COMMITTEES.map((c, idx) => ({
      ...c,
      id: `com-${c.id.replace('com-', '')}-${Date.now().toString(36)}-${idx}`
    }));

    let updated;
    if (replace || committees.length === 0) {
      updated = freshDefaults;
    } else {
      const existingNames = new Set(committees.map(c => c.name.trim().toLowerCase()));
      const toAdd = freshDefaults.filter(c => !existingNames.has(c.name.trim().toLowerCase()));
      if (toAdd.length === 0) {
        alert(isRtl ? 'كافة اللجان الافتراضية مضافة بالفعل!' : 'All default committees are already added!');
        return;
      }
      updated = [...committees, ...toAdd];
    }

    onUpdateData({ ...data, committees: updated });
    updated.forEach((com) => {
      syncCommitteeToPublicFirestore(db, com, weddingInfo);
    });
    alert(isRtl ? `تم إدراج ${freshDefaults.length} لجنة ميدانية بنجاح! ✓` : `Loaded ${freshDefaults.length} default committees! ✓`);
  };

  // استيراد اللجان دفعة واحدة من ملف إكسل أو CSV
  const handleBulkExcelFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkExcelFileName(file.name);
    setBulkExcelError('');
    setBulkExcelCommittees([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const dataRows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!dataRows || dataRows.length < 1) {
          setBulkExcelError(isRtl ? 'الملف فارغ.' : 'File is empty.');
          return;
        }

        const firstRow = dataRows[0].map(h => String(h || '').trim().toLowerCase());
        const hasHeader = firstRow.some(h =>
          h.includes('لجنة') || h.includes('اسم') || h.includes('name') || h.includes('committee')
        );

        let startRow = 0;
        let nameIdx = 0;
        let leaderIdx = -1;
        let phoneIdx = -1;
        let volunteersIdx = -1;

        if (hasHeader && dataRows.length > 1) {
          startRow = 1;
          nameIdx = firstRow.findIndex(h => h.includes('لجنة') || h.includes('اسم') || h.includes('name') || h.includes('committee'));
          if (nameIdx === -1) nameIdx = 0;
          leaderIdx = firstRow.findIndex(h => h.includes('مشرف') || h.includes('مسؤول') || h.includes('رئيس') || h.includes('leader'));
          phoneIdx = firstRow.findIndex(h => h.includes('هاتف') || h.includes('جوال') || h.includes('تلفون') || h.includes('phone') || h.includes('mobile'));
          volunteersIdx = firstRow.findIndex(h => h.includes('متطوع') || h.includes('عدد') || h.includes('volunteers') || h.includes('count'));
        }

        const parsed = [];
        for (let i = startRow; i < dataRows.length; i++) {
          const row = dataRows[i];
          if (!row || row.length === 0) continue;
          const name = String(row[nameIdx] || '').trim();
          if (!name) continue;

          const leader = leaderIdx !== -1 ? String(row[leaderIdx] || '').trim() : '';
          const phone = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '';
          const volunteers = volunteersIdx !== -1 ? (Number(row[volunteersIdx]) || '') : '';

          parsed.push({
            id: `com-import-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
            name,
            nameEn: '',
            leader,
            phone,
            volunteersCount: volunteers,
            responsibilities: [],
            tasks: [],
            members: []
          });
        }

        if (parsed.length === 0) {
          setBulkExcelError(isRtl ? 'لم يتم العثور على أي أسماء لجان صالحة في الملف.' : 'No valid committee names found in file.');
        } else {
          setBulkExcelCommittees(parsed);
        }
      } catch (err) {
        console.error('Error parsing committees excel file:', err);
        setBulkExcelError(isRtl ? 'تعذر قراءة الملف. يرجى التأكد من صيغة الملف (.xlsx أو .csv).' : 'Failed to parse file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmBulkImport = () => {
    if (!bulkExcelCommittees || bulkExcelCommittees.length === 0) return;
    let updated;
    if (bulkExcelMode === 'replace') {
      updated = bulkExcelCommittees;
    } else {
      updated = [...committees, ...bulkExcelCommittees];
    }

    onUpdateData({ ...data, committees: updated });
    updated.forEach(c => syncCommitteeToPublicFirestore(db, c, weddingInfo));
    setShowBulkImportCommitteesModal(false);
    setBulkExcelCommittees([]);
    setBulkExcelFileName('');
    alert(isRtl ? `تم استيراد ${bulkExcelCommittees.length} لجنة بنجاح! ✓` : `Imported ${bulkExcelCommittees.length} committees! ✓`);
  };

  const handleDownloadBulkCommitteesSampleCsv = () => {
    const csvContent = "\uFEFFاسم اللجنة,مشرف اللجنة,رقم الهاتف,عدد المتطوعين\nلجنة الصالة (النساء),,,15\nلجنة السامان والتغسيل,,,20\nلجنة العقد,,,10\nلجنة توزيع العشاء,,,25\nلجنة النظام,,,30\nلجنة الفرش وساحة الزواج,,,20\nلجنة الماء البارد,,,12\nلجنة المغاسيل,,,8\nلجنة العرسان,,,10\nلجنة الذبح واللحوم,,,15\nلجنة طبخ الوليمة,,,18\nلجنة المسرح وتجهيزه,,,10\nلجنة الاعلام,,,8\nلجنة الصحة والاسعاف,,,6\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'نموذج_استيراد_اللجان_مراسيم.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    syncCommitteeToPublicFirestore(db, committee, weddingInfo);
    const url = generateCommitteePortalUrl(committee, weddingInfo);
    setQrModalData({ committee, portalUrl: url });
  };

  // مزامنة سحابية عامة لكافة اللجان لضمان فتح الروابط ورموز QR فوراً بدون حساب
  React.useEffect(() => {
    if (!committees || committees.length === 0) return;
    committees.forEach((com) => {
      syncCommitteeToPublicFirestore(db, com, weddingInfo);
    });
  }, [committees.length]);

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

  // Filtered Grooms
  const filteredGrooms = useMemo(() => {
    return grooms.filter((g) => {
      const q = groomSearch.trim().toLowerCase();
      const matchesSearch = !q ||
        (g.name && g.name.toLowerCase().includes(q)) ||
        (g.phone && g.phone.toLowerCase().includes(q)) ||
        (g.nationalId && g.nationalId.toLowerCase().includes(q)) ||
        (g.tribe && g.tribe.toLowerCase().includes(q)) ||
        (g.area && g.area.toLowerCase().includes(q)) ||
        (g.partnerBrideName && g.partnerBrideName.toLowerCase().includes(q));

      const isReady = g.medicalStatus === 'completed' && g.contractStatus === 'completed';
      const matchesFilter =
        groomFilter === 'all' ||
        (groomFilter === 'ready' && isReady) ||
        (groomFilter === 'pending' && !isReady);

      return matchesSearch && matchesFilter;
    });
  }, [grooms, groomSearch, groomFilter]);

  // Filtered Brides
  const filteredBrides = useMemo(() => {
    return brides.filter((b) => {
      const q = brideSearch.trim().toLowerCase();
      const matchesSearch = !q ||
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.guardianName && b.guardianName.toLowerCase().includes(q)) ||
        (b.guardianPhone && b.guardianPhone.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.nationalId && b.nationalId.toLowerCase().includes(q)) ||
        (b.tribe && b.tribe.toLowerCase().includes(q)) ||
        (b.area && b.area.toLowerCase().includes(q)) ||
        (b.partnerGroomName && b.partnerGroomName.toLowerCase().includes(q));

      const isReady = b.medicalStatus === 'completed' && b.contractStatus === 'completed';
      const matchesFilter =
        brideFilter === 'all' ||
        (brideFilter === 'ready' && isReady) ||
        (brideFilter === 'pending' && !isReady);

      return matchesSearch && matchesFilter;
    });
  }, [brides, brideSearch, brideFilter]);

  // Legacy Filtered Couples
  const filteredCouples = useMemo(() => {
    return couples.filter((c) => {
      const matchesSearch =
        (c.groomName && c.groomName.toLowerCase().includes(coupleSearch.toLowerCase())) ||
        (c.tribe && c.tribe.toLowerCase().includes(coupleSearch.toLowerCase())) ||
        (c.area && c.area.toLowerCase().includes(coupleSearch.toLowerCase()));
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

      {/* === SUB-TAB 2: GROOMS & BRIDES ROSTER === */}
      {activeSubTab === 'couples' && (
        <div className="space-y-6">

          {/* Sub-Tab Navigation Switcher */}
          <div className="flex items-center justify-between bg-white p-2 sm:p-2.5 rounded-3xl border border-gray-200/80 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRosterSubTab('grooms')}
                className={`flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition ${rosterSubTab === 'grooms'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <span>🤵 {isRtl ? 'سجل العرسان' : 'Grooms Roster'}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rosterSubTab === 'grooms' ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                  {grooms.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRosterSubTab('brides')}
                className={`flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition ${rosterSubTab === 'brides'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <span>👰 {isRtl ? 'سجل العرائس' : 'Brides Roster'}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rosterSubTab === 'brides' ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                  {brides.length}
                </span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-500">
              <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1 rounded-xl">
                💍 {isRtl ? 'إجمالي المشاركين:' : 'Total:'} <strong>{grooms.length + brides.length}</strong>
              </span>
            </div>
          </div>

          {/* --- VIEW 1: GROOMS ROSTER --- */}
          {rosterSubTab === 'grooms' && (
            <div className="space-y-6">
              {/* Grooms Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 text-white p-6 sm:p-7 shadow-lg">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20 text-amber-100">
                      <Users2 size={14} />
                      <span>{isRtl ? 'سجل العرسان والتوثيق الميداني' : 'Grooms Roster & Verification'}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <span>{isRtl ? 'سجل العرسان واعتماد العقود والفحوصات' : 'Registered Grooms & Approvals'}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                      {isRtl
                        ? `إدارة بيانات العرسان المشاركين (${grooms.length} عريس مسجل من أصل ${weddingInfo.targetCouples || 24} مستهدف)، ومتابعة الفحوصات الطبية واعتماد عقود القران والكسوة وتوزيع بطاقات الدعوة.`
                        : `Manage registered grooms (${grooms.length} of ${weddingInfo.targetCouples || 24} target), medical tests, contracts, grants, and invitation quotas.`}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowBulkImportGroomsModal(true)}
                      className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-2xl font-bold text-xs sm:text-sm shadow-sm backdrop-blur-sm transition"
                    >
                      <FileSpreadsheet size={16} className="text-amber-200" />
                      <span>{isRtl ? '📊 استيراد عرسان من إكسل' : 'Import Grooms'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingGroom(null); setShowAddGroomModal(true); }}
                      className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition"
                    >
                      <Plus size={16} />
                      <span>{isRtl ? '➕ تسجيل عريس جديد' : 'Register Groom'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Stats Strip */}
                <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2.5 text-xs font-bold text-amber-100">
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    🤵 <span>{isRtl ? 'إجمالي العرسان:' : 'Total Grooms:'}</span>
                    <strong className="text-white font-black">{grooms.length} / {weddingInfo.targetCouples || 24}</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    🩺 <span>{isRtl ? 'مكتمل الفحص الطبي:' : 'Medical Ready:'}</span>
                    <strong className="text-emerald-300 font-black">{grooms.filter(g => g.medicalStatus === 'completed').length}</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    📜 <span>{isRtl ? 'معتمد عقد القران:' : 'Contracts Signed:'}</span>
                    <strong className="text-amber-200 font-black">{grooms.filter(g => g.contractStatus === 'completed').length}</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    🎁 <span>{isRtl ? 'استلم الكسوة/المنحة:' : 'Aid Delivered:'}</span>
                    <strong className="text-purple-300 font-black">{grooms.filter(g => g.aidStatus === 'delivered').length}</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    👥 <span>{isRtl ? 'معازيم العرسان:' : 'Grooms Guests:'}</span>
                    <strong className="text-white font-black">{grooms.reduce((s, g) => s + (Number(g.guestQuota) || 35), 0).toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              {/* Header Controls */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={groomSearch}
                      onChange={(e) => setGroomSearch(e.target.value)}
                      placeholder={isRtl ? 'ابحث باسم العريس، القبيلة، السكن، أو رقم الهاتف...' : 'Search groom, tribe, area, phone...'}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                    />
                    <Search size={16} className={`absolute top-3.5 ${isRtl ? 'left-3' : 'right-3'} text-gray-400`} />
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setGroomFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition ${groomFilter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                    >
                      {isRtl ? 'الكل' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroomFilter('ready')}
                      className={`px-3 py-1.5 rounded-lg transition ${groomFilter === 'ready' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'}`}
                    >
                      {isRtl ? 'المكتملون' : 'Verified'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroomFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg transition ${groomFilter === 'pending' ? 'bg-white shadow-sm text-amber-700' : 'text-gray-500'}`}
                    >
                      {isRtl ? 'قيد المتابعة' : 'Pending'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowBulkImportGroomsModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm transition"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                    <span>{isRtl ? 'استيراد إكسل' : 'Import'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingGroom(null); setShowAddGroomModal(true); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-md transition"
                  >
                    <Plus size={16} />
                    <span>{isRtl ? 'إضافة عريس للسجل' : 'Register Groom'}</span>
                  </button>
                </div>
              </div>

              {/* Grooms Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGrooms.map((g, index) => (
                  <div
                    key={g.id}
                    className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-black text-base text-gray-900">{g.name}</h4>
                          {g.partnerBrideName ? (
                            <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                              <span>👰 {isRtl ? 'العروس المقترنة:' : 'Bride:'}</span>
                              <span>{g.partnerBrideName}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400">{isRtl ? 'لم تقترن عروس بعد' : 'No bride linked yet'}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => handleEditGroom(g)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
                          title={isRtl ? 'تعديل بيانات العريس' : 'Edit Groom'}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGroom(g.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title={isRtl ? 'حذف العريس' : 'Delete'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      {g.tribe && <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-bold">{g.tribe}</span>}
                      {g.area && <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{g.area}</span>}
                      {g.nationalId && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded-lg text-[11px] font-mono text-gray-500">
                          🪪 {g.nationalId}
                        </span>
                      )}
                      {g.phone && (
                        <a
                          href={`tel:${g.phone}`}
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <Phone size={12} />
                          <span dir="ltr">{g.phone}</span>
                        </a>
                      )}
                      <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                        👥 {g.guestQuota || 35} {isRtl ? 'بطاقة دعوة' : 'invitations'}
                      </span>
                    </div>

                    {/* Status Toggles */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                      {/* Medical Status */}
                      <button
                        type="button"
                        onClick={() => handleToggleGroomStatus(g.id, 'medicalStatus')}
                        className={`p-2 rounded-xl text-center font-bold transition flex flex-col items-center gap-1 ${g.medicalStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                      >
                        <span>{isRtl ? 'الفحص الطبي' : 'Medical Check'}</span>
                        <span className="text-[10px]">
                          {g.medicalStatus === 'completed' ? (isRtl ? 'مكتمل ✓' : 'Done ✓') : (isRtl ? 'قيد الإجراء ⏳' : 'Pending')}
                        </span>
                      </button>

                      {/* Contract Status */}
                      <button
                        type="button"
                        onClick={() => handleToggleGroomStatus(g.id, 'contractStatus')}
                        className={`p-2 rounded-xl text-center font-bold transition flex flex-col items-center gap-1 ${g.contractStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                      >
                        <span>{isRtl ? 'عقد القران' : 'Marriage Contract'}</span>
                        <span className="text-[10px]">
                          {g.contractStatus === 'completed' ? (isRtl ? 'موثق ✓' : 'Signed ✓') : (isRtl ? 'مجدول ⏳' : 'Scheduled')}
                        </span>
                      </button>

                      {/* Aid Status */}
                      <button
                        type="button"
                        onClick={() => handleToggleGroomStatus(g.id, 'aidStatus')}
                        className={`p-2 rounded-xl text-center font-bold transition flex flex-col items-center gap-1 ${g.aidStatus === 'delivered'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        <span>{isRtl ? 'الكسوة والمنحة' : 'Groom Aid'}</span>
                        <span className="text-[10px]">
                          {g.aidStatus === 'delivered' ? (isRtl ? 'تم التسليم 🎁' : 'Delivered 🎁') : (isRtl ? 'قيد التجهيز' : 'Processing')}
                        </span>
                      </button>
                    </div>

                    {g.notes && (
                      <p className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-xl italic">
                        {g.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {filteredGrooms.length === 0 && (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center text-gray-500 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Users2 size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-base">
                      {grooms.length === 0
                        ? (isRtl ? 'لم يتم تسجيل أي عرسان بعد في السجل' : 'No grooms registered yet')
                        : (isRtl ? 'لم يتم العثور على عرسان مطابقين للبحث' : 'No grooms matched your search')}
                    </h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      {grooms.length === 0
                        ? (isRtl ? 'ابدأ بإضافة العرسان يدوياً أو استيراد كشف كامل من ملف إكسل مباشرة.' : 'Start adding grooms manually or import a full list from Excel.')
                        : (isRtl ? 'جرب البحث بكلمات أخرى أو أعد ضبط تصنيف التصفية.' : 'Try different search keywords or reset filter.')}
                    </p>
                  </div>
                  {grooms.length === 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkImportGroomsModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm transition"
                      >
                        <FileSpreadsheet size={16} className="text-emerald-600" />
                        <span>{isRtl ? 'استيراد من إكسل' : 'Import Excel'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingGroom(null); setShowAddGroomModal(true); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
                      >
                        <Plus size={16} />
                        <span>{isRtl ? 'تسجيل أول عريس في السجل' : 'Register First Groom'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- VIEW 2: BRIDES ROSTER --- */}
          {rosterSubTab === 'brides' && (
            <div className="space-y-6">
              {/* Brides Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-700 via-pink-800 to-rose-950 text-white p-6 sm:p-7 shadow-lg">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20 text-rose-100">
                      <Users2 size={14} />
                      <span>{isRtl ? 'سجل العرائس وشؤون صالة النساء' : 'Brides Roster & Women Hall Coordination'}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <span>{isRtl ? 'سجل العرائس وأولياء الأمور والتوثيق' : 'Registered Brides & Guardians'}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                      {isRtl
                        ? `إدارة بيانات العرائس المشاركات (${brides.length} عروس مسجلة)، وأولياء أمورهن، والفحوصات الطبية، وكوتة صالة النساء والتنسيق الميداني المستقل.`
                        : `Manage registered brides (${brides.length} brides), guardians, medical checks, women hall invitation quotas, and coordination.`}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowBulkImportBridesModal(true)}
                      className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-2xl font-bold text-xs sm:text-sm shadow-sm backdrop-blur-sm transition"
                    >
                      <FileSpreadsheet size={16} className="text-rose-200" />
                      <span>{isRtl ? '📊 استيراد عرائس من إكسل' : 'Import Brides'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingBride(null); setShowAddBrideModal(true); }}
                      className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-rose-400 hover:bg-rose-300 text-rose-950 rounded-2xl font-black text-xs sm:text-sm shadow-md transition"
                    >
                      <Plus size={16} />
                      <span>{isRtl ? '➕ تسجيل عروس جديدة' : 'Register Bride'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Stats Strip */}
                <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-2.5 text-xs font-bold text-rose-100">
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    👰 <span>{isRtl ? 'إجمالي العرائس:' : 'Total Brides:'}</span>
                    <strong className="text-white font-black">{brides.length} / {weddingInfo.targetCouples || 24}</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    🩺 <span>{isRtl ? 'مكتمل الفحص الطبي:' : 'Medical Ready:'}</span>
                    <strong className="text-emerald-300 font-black">{brides.filter(b => b.medicalStatus === 'completed').length}</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    📜 <span>{isRtl ? 'معتمد عقد القران:' : 'Contracts Signed:'}</span>
                    <strong className="text-amber-200 font-black">{brides.filter(b => b.contractStatus === 'completed').length}</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    👨‍👧 <span>{isRtl ? 'أولياء أمور موثقين:' : 'Guardians:'}</span>
                    <strong className="text-white font-black">{brides.filter(b => b.guardianName).length}</strong>
                  </span>
                  <span className="bg-black/25 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    🌸 <span>{isRtl ? 'كوتة صالة النساء:' : 'Women Hall Guests:'}</span>
                    <strong className="text-white font-black">{brides.reduce((s, b) => s + (Number(b.guestQuota) || 25), 0).toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              {/* Header Controls */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={brideSearch}
                      onChange={(e) => setBrideSearch(e.target.value)}
                      placeholder={isRtl ? 'ابحث باسم العروس، اسم ولي الأمر، القبيلة، السكن...' : 'Search bride, guardian, tribe, area...'}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                    />
                    <Search size={16} className={`absolute top-3.5 ${isRtl ? 'left-3' : 'right-3'} text-gray-400`} />
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setBrideFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition ${brideFilter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                    >
                      {isRtl ? 'الكل' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrideFilter('ready')}
                      className={`px-3 py-1.5 rounded-lg transition ${brideFilter === 'ready' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500'}`}
                    >
                      {isRtl ? 'المكتملات' : 'Verified'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrideFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg transition ${brideFilter === 'pending' ? 'bg-white shadow-sm text-rose-700' : 'text-gray-500'}`}
                    >
                      {isRtl ? 'قيد المتابعة' : 'Pending'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowBulkImportBridesModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm transition"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                    <span>{isRtl ? 'استيراد إكسل' : 'Import'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingBride(null); setShowAddBrideModal(true); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md transition"
                  >
                    <Plus size={16} />
                    <span>{isRtl ? 'إضافة عروس للسجل' : 'Register Bride'}</span>
                  </button>
                </div>
              </div>

              {/* Brides Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBrides.map((b, index) => (
                  <div
                    key={b.id}
                    className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 font-black text-sm flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-black text-base text-gray-900">{b.name}</h4>
                          {b.partnerGroomName ? (
                            <p className="text-xs text-amber-700 font-bold flex items-center gap-1">
                              <span>🤵 {isRtl ? 'العريس المقترن:' : 'Groom:'}</span>
                              <span>{b.partnerGroomName}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400">{isRtl ? 'لم يقترن عريس بعد' : 'No groom linked yet'}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => handleEditBride(b)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title={isRtl ? 'تعديل بيانات العروس' : 'Edit Bride'}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBride(b.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title={isRtl ? 'حذف العروس' : 'Delete'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Guardian Box */}
                    {b.guardianName && (
                      <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-900">
                            👨‍👧 {isRtl ? 'ولي الأمر:' : 'Guardian:'} {b.guardianName}
                          </span>
                          {b.guardianRelation && (
                            <span className="bg-rose-200/70 text-rose-800 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              {b.guardianRelation}
                            </span>
                          )}
                        </div>
                        {b.guardianPhone && (
                          <a
                            href={`tel:${b.guardianPhone}`}
                            className="bg-white text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-50 transition"
                          >
                            <Phone size={11} />
                            <span dir="ltr">{b.guardianPhone}</span>
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      {b.tribe && <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-bold">{b.tribe}</span>}
                      {b.area && <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{b.area}</span>}
                      {b.nationalId && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded-lg text-[11px] font-mono text-gray-500">
                          🪪 {b.nationalId}
                        </span>
                      )}
                      {b.phone && (
                        <a
                          href={`tel:${b.phone}`}
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                        >
                          <Phone size={12} />
                          <span dir="ltr">{b.phone}</span>
                        </a>
                      )}
                      <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                        🌸 {b.guestQuota || 25} {isRtl ? 'كوتة صالة النساء' : 'hall guests'}
                      </span>
                    </div>

                    {/* Status Toggles */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                      {/* Medical Status */}
                      <button
                        type="button"
                        onClick={() => handleToggleBrideStatus(b.id, 'medicalStatus')}
                        className={`p-2 rounded-xl text-center font-bold transition flex flex-col items-center gap-1 ${b.medicalStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                      >
                        <span>{isRtl ? 'الفحص الطبي' : 'Medical Check'}</span>
                        <span className="text-[10px]">
                          {b.medicalStatus === 'completed' ? (isRtl ? 'مكتمل ✓' : 'Done ✓') : (isRtl ? 'قيد الإجراء ⏳' : 'Pending')}
                        </span>
                      </button>

                      {/* Contract Status */}
                      <button
                        type="button"
                        onClick={() => handleToggleBrideStatus(b.id, 'contractStatus')}
                        className={`p-2 rounded-xl text-center font-bold transition flex flex-col items-center gap-1 ${b.contractStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                      >
                        <span>{isRtl ? 'عقد القران' : 'Marriage Contract'}</span>
                        <span className="text-[10px]">
                          {b.contractStatus === 'completed' ? (isRtl ? 'موثق ✓' : 'Signed ✓') : (isRtl ? 'مجدول ⏳' : 'Scheduled')}
                        </span>
                      </button>
                    </div>

                    {b.notes && (
                      <p className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-xl italic">
                        {b.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {filteredBrides.length === 0 && (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center text-gray-500 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <Users2 size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 text-base">
                      {brides.length === 0
                        ? (isRtl ? 'لم يتم تسجيل أي عرائس بعد في السجل' : 'No brides registered yet')
                        : (isRtl ? 'لم يتم العثور على عرائس مطابقات للبحث' : 'No brides matched your search')}
                    </h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      {brides.length === 0
                        ? (isRtl ? 'ابدأي أو ابدأ بإضافة العرائس وأولياء أمورهن أو استيراد كشف كامل من ملف إكسل مباشرة.' : 'Start adding brides and guardians or import a list from Excel.')
                        : (isRtl ? 'جرب البحث بكلمات أخرى أو أعد ضبط تصنيف التصفية.' : 'Try different search keywords or reset filter.')}
                    </p>
                  </div>
                  {brides.length === 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkImportBridesModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm transition"
                      >
                        <FileSpreadsheet size={16} className="text-emerald-600" />
                        <span>{isRtl ? 'استيراد من إكسل' : 'Import Excel'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingBride(null); setShowAddBrideModal(true); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
                      >
                        <Plus size={16} />
                        <span>{isRtl ? 'تسجيل أول عروس في السجل' : 'Register First Bride'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* === SUB-TAB 3: COMMITTEES & TEAMS === */}
      {activeSubTab === 'committees' && (() => {
        // --- VIEW 1: DEDICATED COMMITTEE DETAIL PAGE ---
        if (selectedCommitteeId && activeCommittee) {
          return (
            <div className="space-y-6">

              {/* Breadcrumb Navigation & Back Button */}
              <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-gray-200/80 shadow-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCommitteeId(null)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs transition border border-amber-200/60 shrink-0"
                >
                  <ArrowRight size={15} className="rtl:rotate-0 ltr:rotate-180" />
                  <span>{isRtl ? 'العودة لكافة اللجان التنظيمية' : 'Back to All Committees'}</span>
                </button>

                <div className="text-xs font-bold text-gray-500 flex items-center gap-2 truncate">
                  <span>{isRtl ? 'اللجان الميدانية' : 'Committees'}</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-amber-800 font-black truncate">{activeCommittee.name}</span>
                </div>
              </div>

              {/* Committee Dedicated Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-5 sm:p-7 shadow-lg">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left (in RTL right): Title, badges, and lead info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold border border-white/20 text-blue-100">
                      <HeartHandshake size={14} className="text-amber-300" />
                      <span>{isRtl ? 'الصفحة التفصيلية للجنة الميدانية' : 'Committee Detail Workspace'}</span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-2.5">
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {activeCommittee.name}
                      </h2>
                      {activeCommittee.nameEn && (
                        <span className="text-xs text-blue-200 font-medium">({activeCommittee.nameEn})</span>
                      )}
                    </div>

                    {/* Lead & Contact Details Strip */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <div className="bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                        <span className="text-blue-200">{isRtl ? 'المشرف المسؤول:' : 'Lead:'}</span>
                        <strong className="text-white font-black">{activeCommittee.leader || (isRtl ? 'لم يعيّن بعد' : 'Unassigned')}</strong>
                      </div>

                      {activeCommittee.phone && (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${activeCommittee.phone}`}
                            className="bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-400/30 font-bold flex items-center gap-1 transition"
                          >
                            <Phone size={12} />
                            <span dir="ltr">{activeCommittee.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${activeCommittee.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition shadow-sm"
                          >
                            <Share2 size={12} />
                            <span>واتساب</span>
                          </a>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEditCommittee(activeCommittee)}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-blue-100 rounded-xl transition flex items-center gap-1 text-[11px] font-bold border border-white/10"
                        title={isRtl ? 'تعديل بيانات اللجنة' : 'Edit Committee'}
                      >
                        <Edit2 size={12} />
                        <span>{isRtl ? 'تعديل البيانات' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right (in RTL left): Compact, well-organized action toolbar */}
                  <div className="flex flex-wrap items-center justify-start lg:justify-end gap-1.5 shrink-0 max-w-md">
                    {/* Primary Action: Add Member */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(null);
                        setShowAddMemberModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-black text-xs transition shadow-md whitespace-nowrap"
                    >
                      <UserPlus size={14} />
                      <span>{isRtl ? '➕ إضافة عضو' : 'Add Member'}</span>
                    </button>

                    {/* QR Code & Portal */}
                    <button
                      type="button"
                      onClick={() => handleOpenQrModal(activeCommittee)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs backdrop-blur-md border border-white/25 transition shadow-sm whitespace-nowrap"
                      title={isRtl ? 'توليد وعرض رمز QR لبوابة اللجنة' : 'Generate QR Code'}
                    >
                      <QrIcon size={14} />
                      <span>{isRtl ? '🏁 رمز QR والبوابة' : 'QR & Portal'}</span>
                    </button>

                    {/* Mobile Preview */}
                    <button
                      type="button"
                      onClick={() => setPortalPreviewCommittee(activeCommittee)}
                      className="flex items-center gap-1.5 px-2.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs backdrop-blur-md border border-white/20 transition shadow-sm whitespace-nowrap"
                      title={isRtl ? 'معاينة شكل البوابة في هاتف العضو' : 'Mobile Preview'}
                    >
                      <Eye size={14} />
                      <span>{isRtl ? '📱 معاينة' : 'Mobile'}</span>
                    </button>

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={() => handleCopyCommitteePortal(activeCommittee)}
                      className="flex items-center gap-1.5 px-2.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs backdrop-blur-md border border-white/20 transition shadow-sm whitespace-nowrap"
                      title={isRtl ? 'نسخ رابط البوابة الميدانية المباشر' : 'Copy Portal Link'}
                    >
                      {copiedPortalFor === activeCommittee.id ? (
                        <Check size={14} className="text-emerald-300" />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span>
                        {copiedPortalFor === activeCommittee.id
                          ? (isRtl ? 'تم النسخ!' : 'Copied!')
                          : (isRtl ? '🔗 نسخ الرابط' : 'Copy Link')}
                      </span>
                    </button>

                    {/* WhatsApp Lead Quick Share (if phone exists) */}
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
                          className="flex items-center gap-1.5 px-2.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition shadow-sm whitespace-nowrap"
                          title={isRtl ? 'إرسال الرابط للمشرف مباشرة عبر واتساب' : 'Send via WhatsApp'}
                        >
                          <Share2 size={14} />
                          <span>{isRtl ? '💬 للمشرف' : 'To Lead'}</span>
                        </a>
                      );
                    })()}

                    {/* Export PDF */}
                    <button
                      type="button"
                      onClick={() => setShowPdfReportModal(true)}
                      className="flex items-center gap-1.5 px-2.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs backdrop-blur-md border border-white/20 transition shadow-sm whitespace-nowrap"
                    >
                      <Printer size={14} />
                      <span>{isRtl ? '📄 تقرير PDF' : 'PDF'}</span>
                    </button>

                    {/* Import Members Excel */}
                    <button
                      type="button"
                      onClick={() => {
                        setExcelError('');
                        setExcelPreviewMembers([]);
                        setExcelFileName('');
                        setShowImportExcelModal(true);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition border border-emerald-400/40 shadow-sm whitespace-nowrap"
                    >
                      <FileSpreadsheet size={14} />
                      <span>{isRtl ? '📊 إكسل' : 'Excel'}</span>
                    </button>
                  </div>
                </div>

                {/* KPI Strip */}
                <div className="mt-5 pt-3.5 border-t border-white/15 flex flex-wrap items-center gap-2 text-xs font-bold text-blue-100">
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
                            className={`p-3 rounded-2xl border transition flex items-start justify-between gap-3 text-xs ${isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-gray-50/80 border-gray-200 hover:bg-white'
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
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${committeesSectionView === 'list'
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
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${committeesSectionView === 'broadcast'
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
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-5 sm:p-7 shadow-lg">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Text section: spacious, full natural width */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold border border-white/20 text-blue-100">
                        <HeartHandshake size={14} className="text-amber-300" />
                        <span>{isRtl ? 'اللجان التنظيمية والفرق الميدانية' : 'Field Committees & Teams'}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                        <span>{isRtl ? 'إدارة اللجان والفرق الميدانية والمتطوعين' : 'Committees, Leads & Volunteers'}</span>
                      </h3>

                      <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-3xl">
                        {isRtl
                          ? `توزيع المهام والمسؤولين والفرق الميدانية (${committees.length} لجان، و ${totalVolunteers} متطوع ميداني) لتنظيم استقبال الضيوف، إعداد الوليمة والشاهي، وتأمين ساحات الحفل. انقر على أي لجنة للدخول إلى صفحتها التفصيلية لإدارة الأعضاء وتصدير التقارير.`
                          : `Organize field teams (${committees.length} committees, ${totalVolunteers} volunteers) to supervise guest reception, feast logistics, and venue order. Click any committee to manage details.`}
                      </p>
                    </div>

                    {/* Action Buttons: Compact, sleek, to the side */}
                    <div className="flex flex-wrap sm:flex-nowrap lg:flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommittee(null);
                          setFormDynamicTasks(['', '']);
                          setShowAddCommitteeModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-black text-xs sm:text-sm shadow-md transition whitespace-nowrap"
                      >
                        <Plus size={16} />
                        <span>{isRtl ? '➕ إضافة لجنة' : 'Add Committee'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBulkExcelError('');
                          setBulkExcelCommittees([]);
                          setBulkExcelFileName('');
                          setBulkExcelMode('append');
                          setShowBulkImportCommitteesModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition border border-emerald-400/30 whitespace-nowrap"
                      >
                        <FileSpreadsheet size={15} />
                        <span>{isRtl ? '📊 استيراد إكسل' : 'Import Excel'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadDefaultCommittees(false)}
                        className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs backdrop-blur-md border border-white/20 transition shadow-sm whitespace-nowrap"
                        title={isRtl ? 'إدراج اللجان الـ 14 الافتراضية' : 'Load Default 14 Committees'}
                      >
                        <Sparkles size={15} className="text-amber-300" />
                        <span>{isRtl ? '⚡ اللجان الافتراضية' : 'Defaults (14)'}</span>
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
                  <div className="bg-white p-10 sm:p-12 rounded-3xl border border-dashed border-gray-300 text-center text-gray-500 space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                      <HeartHandshake size={32} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-black text-gray-800 text-lg">
                        {isRtl ? 'لا توجد لجان ميدانية مسجلة حتى الآن' : 'No committees registered yet'}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                        {isRtl
                          ? 'يمكنك بنقرة واحدة إدراج اللجان الميدانية الافتراضية الـ 14 (لجنة الصالة، العقد، السامان، توزيع العشاء، النظام، الفرش، الذبح، والمزيد) أو استيرادها مباشرة من ملف إكسل.'
                          : 'Load the 14 default operational committees with one click, import them from an Excel sheet, or add them manually.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleLoadDefaultCommittees(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition"
                      >
                        <Sparkles size={18} />
                        <span>{isRtl ? '⚡ إدراج اللجان الافتراضية الـ 14 الآن' : 'Load 14 Default Committees'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBulkExcelError('');
                          setBulkExcelCommittees([]);
                          setBulkExcelFileName('');
                          setBulkExcelMode('append');
                          setShowBulkImportCommitteesModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition"
                      >
                        <FileSpreadsheet size={18} />
                        <span>{isRtl ? '📊 استيراد اللجان من إكسل / CSV' : 'Import from Excel / CSV'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommittee(null);
                          setFormDynamicTasks(['', '']);
                          setShowAddCommitteeModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm transition border border-gray-200"
                      >
                        <Plus size={16} />
                        <span>{isRtl ? '➕ إضافة لجنة يدوياً' : 'Add Committee Manually'}</span>
                      </button>
                    </div>
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${supplyCategoryFilter === tab.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${supplyCategoryFilter === tab.id ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-700'
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

      {/* Modal 1: Add / Edit Groom */}
      {showAddGroomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  🤵
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">
                    {editingGroom
                      ? (isRtl ? 'تعديل بيانات العريس' : 'Edit Groom')
                      : (isRtl ? 'تسجيل عريس جديد في العرس الجماعي' : 'Register New Groom')}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isRtl ? 'توثيق بيانات العريس وكوتة المعازيم والجاهزية الشرعية والطبية' : 'Groom details, guests quota and status'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowAddGroomModal(false); setEditingGroom(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            <form
              key={editingGroom ? editingGroom.id : 'new-groom'}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleSaveGroom({
                  id: editingGroom?.id,
                  name: fd.get('name'),
                  phone: fd.get('phone') || '',
                  nationalId: fd.get('nationalId') || '',
                  tribe: fd.get('tribe') || '',
                  area: fd.get('area') || weddingInfo.city || '',
                  guestQuota: Number(fd.get('guestQuota')) || 35,
                  medicalStatus: fd.get('medicalStatus'),
                  contractStatus: fd.get('contractStatus'),
                  aidStatus: fd.get('aidStatus'),
                  partnerBrideName: fd.get('partnerBrideName') || '',
                  notes: fd.get('notes') || ''
                });
              }}
              className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto px-1"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {isRtl ? 'اسم العريس الرباعي *' : 'Groom Full Name *'}
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingGroom?.name || ''}
                  required
                  placeholder={isRtl ? 'مثال: محمد عبدالله سالم باوزير' : 'e.g. Mohammed Abdullah'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingGroom?.phone || ''}
                    placeholder="77xxxxxxx"
                    dir="ltr"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'الرقم الوطني / السجل المدني' : 'National ID'}
                  </label>
                  <input
                    type="text"
                    name="nationalId"
                    defaultValue={editingGroom?.nationalId || ''}
                    placeholder="080100xxxxx"
                    dir="ltr"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'القبيلة / اللقب' : 'Tribe / Family'}
                  </label>
                  <input
                    type="text"
                    name="tribe"
                    defaultValue={editingGroom?.tribe || ''}
                    placeholder={isRtl ? 'مثال: باوزير' : 'Tribe'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'المنطقة / الحي السكني' : 'Area / Residence'}
                  </label>
                  <input
                    type="text"
                    name="area"
                    defaultValue={editingGroom?.area || weddingInfo.city || ''}
                    placeholder={isRtl ? 'مثال: حي الروضة' : 'Area'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'كوتة بطاقات الدعوة المقررة' : 'Invitations Quota'}
                  </label>
                  <input
                    type="number"
                    name="guestQuota"
                    defaultValue={editingGroom?.guestQuota !== undefined ? editingGroom.guestQuota : 35}
                    min="1"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'العروس المقترنة (اختياري)' : 'Partner Bride (Optional)'}
                  </label>
                  <input
                    type="text"
                    name="partnerBrideName"
                    list="available-brides-list"
                    defaultValue={editingGroom?.partnerBrideName || ''}
                    placeholder={isRtl ? 'اختر أو اكتب اسم العروس...' : 'Bride name...'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <datalist id="available-brides-list">
                    {brides.map(b => (
                      <option key={b.id} value={b.name}>{b.name} ({b.tribe || b.area})</option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الفحص الطبي' : 'Medical'}</label>
                  <select
                    name="medicalStatus"
                    defaultValue={editingGroom?.medicalStatus || 'completed'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-xs"
                  >
                    <option value="completed">{isRtl ? 'مكتمل ✓' : 'Done ✓'}</option>
                    <option value="pending">{isRtl ? 'قيد الإجراء ⏳' : 'Pending'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'عقد القران' : 'Contract'}</label>
                  <select
                    name="contractStatus"
                    defaultValue={editingGroom?.contractStatus || 'completed'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-xs"
                  >
                    <option value="completed">{isRtl ? 'موثق ✓' : 'Signed ✓'}</option>
                    <option value="in_progress">{isRtl ? 'قيد التوثيق ⏳' : 'In Progress'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الكسوة والمنحة' : 'Grant/Aid'}</label>
                  <select
                    name="aidStatus"
                    defaultValue={editingGroom?.aidStatus || 'processing'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-xs"
                  >
                    <option value="delivered">{isRtl ? 'مستلم 🎁' : 'Delivered'}</option>
                    <option value="processing">{isRtl ? 'قيد التجهيز' : 'Processing'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'ملاحظات إضافية' : 'Notes'}</label>
                <textarea
                  name="notes"
                  defaultValue={editingGroom?.notes || ''}
                  rows="2"
                  placeholder={isRtl ? 'أي متطلبات أو بيانات خاصة بالعريس...' : 'Any additional notes...'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowAddGroomModal(false); setEditingGroom(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 font-bold transition"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-md"
                >
                  {editingGroom ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : (isRtl ? 'حفظ العريس في السجل' : 'Save Groom')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 1.5: Add / Edit Bride */}
      {showAddBrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-black">
                  👰
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">
                    {editingBride
                      ? (isRtl ? 'تعديل بيانات العروس' : 'Edit Bride')
                      : (isRtl ? 'تسجيل عروس جديدة في العرس الجماعي' : 'Register New Bride')}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isRtl ? 'توثيق بيانات العروس وولي الأمر وكوتة صالة النساء' : 'Bride & guardian details, women hall quota'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowAddBrideModal(false); setEditingBride(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            <form
              key={editingBride ? editingBride.id : 'new-bride'}
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handleSaveBride({
                  id: editingBride?.id,
                  name: fd.get('name'),
                  guardianName: fd.get('guardianName') || '',
                  guardianRelation: fd.get('guardianRelation') || 'أب',
                  guardianPhone: fd.get('guardianPhone') || '',
                  phone: fd.get('phone') || '',
                  nationalId: fd.get('nationalId') || '',
                  tribe: fd.get('tribe') || '',
                  area: fd.get('area') || weddingInfo.city || '',
                  guestQuota: Number(fd.get('guestQuota')) || 25,
                  medicalStatus: fd.get('medicalStatus'),
                  contractStatus: fd.get('contractStatus'),
                  partnerGroomName: fd.get('partnerGroomName') || '',
                  notes: fd.get('notes') || ''
                });
              }}
              className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto px-1"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {isRtl ? 'اسم العروس الرباعي *' : 'Bride Full Name *'}
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingBride?.name || ''}
                  required
                  placeholder={isRtl ? 'مثال: فاطمة أحمد سعيد باوزير' : 'e.g. Fatima Ahmed'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Guardian Info Box */}
              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2.5">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  👨‍👧 {isRtl ? 'بيانات ولي الأمر الشرعي' : 'Legal Guardian Details'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'اسم ولي الأمر *' : 'Guardian Name *'}</label>
                    <input
                      type="text"
                      name="guardianName"
                      defaultValue={editingBride?.guardianName || ''}
                      required
                      placeholder={isRtl ? 'مثال: أحمد سعيد باوزير' : 'Guardian Name'}
                      className="w-full bg-white border border-rose-200 rounded-xl p-2 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'صلة القرابة' : 'Relation'}</label>
                    <select
                      name="guardianRelation"
                      defaultValue={editingBride?.guardianRelation || 'أب'}
                      className="w-full bg-white border border-rose-200 rounded-xl p-2 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="أب">{isRtl ? 'أب' : 'Father'}</option>
                      <option value="أخ">{isRtl ? 'أخ' : 'Brother'}</option>
                      <option value="عم">{isRtl ? 'عم' : 'Uncle (Paternal)'}</option>
                      <option value="خال">{isRtl ? 'خال' : 'Uncle (Maternal)'}</option>
                      <option value="جد">{isRtl ? 'جد' : 'Grandfather'}</option>
                      <option value="وكيل شرعي">{isRtl ? 'وكيل شرعي' : 'Legal Attorney'}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'رقم هاتف ولي الأمر' : 'Guardian Phone'}</label>
                  <input
                    type="text"
                    name="guardianPhone"
                    defaultValue={editingBride?.guardianPhone || ''}
                    placeholder="77xxxxxxx"
                    dir="ltr"
                    className="w-full bg-white border border-rose-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'رقم هاتف العروس (اختياري)' : 'Bride Phone (Optional)'}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingBride?.phone || ''}
                    placeholder="77xxxxxxx"
                    dir="ltr"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'الرقم الوطني / السجل المدني' : 'National ID'}
                  </label>
                  <input
                    type="text"
                    name="nationalId"
                    defaultValue={editingBride?.nationalId || ''}
                    placeholder="080100xxxxx"
                    dir="ltr"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'القبيلة / اللقب' : 'Tribe / Family'}
                  </label>
                  <input
                    type="text"
                    name="tribe"
                    defaultValue={editingBride?.tribe || ''}
                    placeholder={isRtl ? 'مثال: باوزير' : 'Tribe'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'المنطقة / الحي السكني' : 'Area / Residence'}
                  </label>
                  <input
                    type="text"
                    name="area"
                    defaultValue={editingBride?.area || weddingInfo.city || ''}
                    placeholder={isRtl ? 'مثال: حي الروضة' : 'Area'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'كوتة صالة النساء المقررة' : 'Women Hall Quota'}
                  </label>
                  <input
                    type="number"
                    name="guestQuota"
                    defaultValue={editingBride?.guestQuota !== undefined ? editingBride.guestQuota : 25}
                    min="1"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {isRtl ? 'العريس المقترن (اختياري)' : 'Partner Groom (Optional)'}
                  </label>
                  <input
                    type="text"
                    name="partnerGroomName"
                    list="available-grooms-list"
                    defaultValue={editingBride?.partnerGroomName || ''}
                    placeholder={isRtl ? 'اختر أو اكتب اسم العريس...' : 'Groom name...'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <datalist id="available-grooms-list">
                    {grooms.map(g => (
                      <option key={g.id} value={g.name}>{g.name} ({g.tribe || g.area})</option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'الفحص الطبي' : 'Medical'}</label>
                  <select
                    name="medicalStatus"
                    defaultValue={editingBride?.medicalStatus || 'completed'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-xs"
                  >
                    <option value="completed">{isRtl ? 'مكتمل ✓' : 'Done ✓'}</option>
                    <option value="pending">{isRtl ? 'قيد الإجراء ⏳' : 'Pending'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'عقد القران' : 'Contract'}</label>
                  <select
                    name="contractStatus"
                    defaultValue={editingBride?.contractStatus || 'completed'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 font-bold text-xs"
                  >
                    <option value="completed">{isRtl ? 'موثق ✓' : 'Signed ✓'}</option>
                    <option value="in_progress">{isRtl ? 'قيد التوثيق ⏳' : 'In Progress'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{isRtl ? 'ملاحظات إضافية' : 'Notes'}</label>
                <textarea
                  name="notes"
                  defaultValue={editingBride?.notes || ''}
                  rows="2"
                  placeholder={isRtl ? 'أي متطلبات أو ترتيبات خاصة بصالة النساء...' : 'Any additional notes...'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowAddBrideModal(false); setEditingBride(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 font-bold transition"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md"
                >
                  {editingBride ? (isRtl ? 'حفظ التعديلات ✓' : 'Save Changes') : (isRtl ? 'حفظ العروس في السجل' : 'Save Bride')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 1.6: Bulk Import Grooms from Excel */}
      {showBulkImportGroomsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-amber-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">
                    {isRtl ? '📊 استيراد كشف العرسان من ملف إكسل / CSV' : 'Import Grooms from Excel / CSV'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isRtl ? 'يتعرف النظام تلقائياً على الأعمدة: الاسم، الهاتف، السجل المدني، كوتة المعازيم، الحالة' : 'Auto detects columns: name, phone, national ID, quota, statuses'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBulkImportGroomsModal(false);
                  setBulkExcelGrooms([]);
                  setBulkExcelGroomsFileName('');
                  setBulkExcelGroomsError('');
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Template Download Card */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <FileSpreadsheet size={15} />
                  <span>{isRtl ? 'نموذج إكسل القياسي المجهز للعرسان' : 'Standard Grooms Excel Template'}</span>
                </span>
                <p className="text-[11px] text-amber-800/80">
                  {isRtl ? 'حمل النموذج معبأ بأمثلة توضيحية لملء بيانات العرسان بكل سهولة' : 'Download sample CSV formatted for instant import'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadGroomsSampleCsv}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition shrink-0"
              >
                <Download size={14} />
                <span>{isRtl ? 'تحميل النموذج (.csv)' : 'Download Sample'}</span>
              </button>
            </div>

            {/* File Upload Drop Area */}
            <div className="border-2 border-dashed border-amber-300/80 rounded-2xl p-6 text-center hover:bg-amber-50/30 transition">
              <input
                type="file"
                id="groomsExcelUpload"
                accept=".xlsx, .xls, .csv"
                onChange={handleBulkGroomsFileUpload}
                className="hidden"
              />
              <label htmlFor="groomsExcelUpload" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                  <UploadCloud size={24} />
                </div>
                <div className="text-xs font-bold text-gray-800">
                  {bulkExcelGroomsFileName ? (
                    <span className="text-amber-700">📄 {bulkExcelGroomsFileName}</span>
                  ) : (
                    <span>{isRtl ? 'انقر لاختيار ملف إكسل أو اسحبه إلى هنا' : 'Click to select or drag and drop Excel file'}</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  {isRtl ? 'يدعم ملفات (.xlsx, .xls, .csv)' : 'Supports .xlsx, .xls, .csv'}
                </p>
              </label>
            </div>

            {bulkExcelGroomsError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{bulkExcelGroomsError}</span>
              </div>
            )}

            {/* Preview Section */}
            {bulkExcelGrooms.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={16} />
                    <span>{isRtl ? `تم العثور على (${bulkExcelGrooms.length}) عريس جاهز للاستيراد:` : `Found (${bulkExcelGrooms.length}) grooms:`}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-gray-600">{isRtl ? 'طريقة الإدراج:' : 'Import Mode:'}</label>
                    <select
                      value={bulkExcelGroomsMode}
                      onChange={(e) => setBulkExcelGroomsMode(e.target.value)}
                      className="bg-gray-100 border border-gray-300 rounded-lg px-2 py-1 text-[11px] font-bold"
                    >
                      <option value="append">{isRtl ? 'إلحاق بالسجل الحالي' : 'Append to existing'}</option>
                      <option value="replace">{isRtl ? 'استبدال السجل بالكامل' : 'Replace all'}</option>
                    </select>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 text-xs">
                  {bulkExcelGrooms.slice(0, 10).map((g, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between bg-white hover:bg-gray-50">
                      <div>
                        <span className="font-bold text-gray-900">{idx + 1}. {g.name}</span>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2">
                          {g.phone && <span>📞 {g.phone}</span>}
                          {g.tribe && <span>🏷️ {g.tribe}</span>}
                          {g.area && <span>📍 {g.area}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-bold ${g.medicalStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                          {g.medicalStatus === 'completed' ? 'فحص ✓' : 'فحص ⏳'}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${g.contractStatus === 'completed' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                          {g.contractStatus === 'completed' ? 'عقد ✓' : 'عقد ⏳'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bulkExcelGrooms.length > 10 && (
                    <div className="p-2 text-center text-[11px] text-gray-400 font-bold bg-gray-50">
                      + {bulkExcelGrooms.length - 10} {isRtl ? 'عريس إضافي في الملف' : 'more grooms'}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowBulkImportGroomsModal(false);
                  setBulkExcelGrooms([]);
                  setBulkExcelGroomsFileName('');
                  setBulkExcelGroomsError('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 font-bold text-xs transition"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={bulkExcelGrooms.length === 0}
                onClick={handleConfirmBulkImportGrooms}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 ${bulkExcelGrooms.length > 0
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <Check size={16} />
                <span>
                  {bulkExcelGrooms.length > 0
                    ? (isRtl ? `تأكيد استيراد (${bulkExcelGrooms.length}) عريس` : `Confirm Import (${bulkExcelGrooms.length})`)
                    : (isRtl ? 'اختر ملفاً أولاً' : 'Select a file')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1.7: Bulk Import Brides from Excel */}
      {showBulkImportBridesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-rose-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
                  <FileSpreadsheet size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900">
                    {isRtl ? '📊 استيراد كشف العرائس من ملف إكسل / CSV' : 'Import Brides from Excel / CSV'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isRtl ? 'يتعرف النظام تلقائياً على: اسم العروس، ولي الأمر، صلة القرابة، الهاتف، كوتة الصالة' : 'Auto detects: bride name, guardian, relation, phone, hall quota'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBulkImportBridesModal(false);
                  setBulkExcelBrides([]);
                  setBulkExcelBridesFileName('');
                  setBulkExcelBridesError('');
                }}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Template Download Card */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <FileSpreadsheet size={15} />
                  <span>{isRtl ? 'نموذج إكسل القياسي المجهز للعرائس' : 'Standard Brides Excel Template'}</span>
                </span>
                <p className="text-[11px] text-rose-800/80">
                  {isRtl ? 'حمل النموذج معبأ بأمثلة توضيحية لملء بيانات العرائس وأولياء الأمور' : 'Download sample CSV formatted for instant import'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadBridesSampleCsv}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition shrink-0"
              >
                <Download size={14} />
                <span>{isRtl ? 'تحميل النموذج (.csv)' : 'Download Sample'}</span>
              </button>
            </div>

            {/* File Upload Drop Area */}
            <div className="border-2 border-dashed border-rose-300/80 rounded-2xl p-6 text-center hover:bg-rose-50/30 transition">
              <input
                type="file"
                id="bridesExcelUpload"
                accept=".xlsx, .xls, .csv"
                onChange={handleBulkBridesFileUpload}
                className="hidden"
              />
              <label htmlFor="bridesExcelUpload" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto">
                  <UploadCloud size={24} />
                </div>
                <div className="text-xs font-bold text-gray-800">
                  {bulkExcelBridesFileName ? (
                    <span className="text-rose-700">📄 {bulkExcelBridesFileName}</span>
                  ) : (
                    <span>{isRtl ? 'انقر لاختيار ملف إكسل أو اسحبه إلى هنا' : 'Click to select or drag and drop Excel file'}</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">
                  {isRtl ? 'يدعم ملفات (.xlsx, .xls, .csv)' : 'Supports .xlsx, .xls, .csv'}
                </p>
              </label>
            </div>

            {bulkExcelBridesError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{bulkExcelBridesError}</span>
              </div>
            )}

            {/* Preview Section */}
            {bulkExcelBrides.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={16} />
                    <span>{isRtl ? `تم العثور على (${bulkExcelBrides.length}) عروس جاهزة للاستيراد:` : `Found (${bulkExcelBrides.length}) brides:`}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-gray-600">{isRtl ? 'طريقة الإدراج:' : 'Import Mode:'}</label>
                    <select
                      value={bulkExcelBridesMode}
                      onChange={(e) => setBulkExcelBridesMode(e.target.value)}
                      className="bg-gray-100 border border-gray-300 rounded-lg px-2 py-1 text-[11px] font-bold"
                    >
                      <option value="append">{isRtl ? 'إلحاق بالسجل الحالي' : 'Append to existing'}</option>
                      <option value="replace">{isRtl ? 'استبدال السجل بالكامل' : 'Replace all'}</option>
                    </select>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 text-xs">
                  {bulkExcelBrides.slice(0, 10).map((b, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between bg-white hover:bg-gray-50">
                      <div>
                        <span className="font-bold text-gray-900">{idx + 1}. {b.name}</span>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2">
                          {b.guardianName && <span>👨‍👧 {b.guardianName} ({b.guardianRelation})</span>}
                          {b.guardianPhone && <span>📞 {b.guardianPhone}</span>}
                          {b.area && <span>📍 {b.area}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-bold ${b.medicalStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                          {b.medicalStatus === 'completed' ? 'فحص ✓' : 'فحص ⏳'}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold ${b.contractStatus === 'completed' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-600'}`}>
                          {b.contractStatus === 'completed' ? 'عقد ✓' : 'عقد ⏳'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {bulkExcelBrides.length > 10 && (
                    <div className="p-2 text-center text-[11px] text-gray-400 font-bold bg-gray-50">
                      + {bulkExcelBrides.length - 10} {isRtl ? 'عروس إضافية في الملف' : 'more brides'}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowBulkImportBridesModal(false);
                  setBulkExcelBrides([]);
                  setBulkExcelBridesFileName('');
                  setBulkExcelBridesError('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 font-bold text-xs transition"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={bulkExcelBrides.length === 0}
                onClick={handleConfirmBulkImportBrides}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 ${bulkExcelBrides.length > 0
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <Check size={16} />
                <span>
                  {bulkExcelBrides.length > 0
                    ? (isRtl ? `تأكيد استيراد (${bulkExcelBrides.length}) عروس` : `Confirm Import (${bulkExcelBrides.length})`)
                    : (isRtl ? 'اختر ملفاً أولاً' : 'Select a file')}
                </span>
              </button>
            </div>
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

      {/* Modal: Bulk Import Committees from Excel / CSV */}
      {showBulkImportCommitteesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-100 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet size={22} className="text-emerald-600" />
                  <span>{isRtl ? 'استيراد اللجان الميدانية من ملف إكسل أو CSV' : 'Import Committees from Excel / CSV'}</span>
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-0.5">
                  {isRtl ? 'استيراد قائمة اللجان دفعة واحدة وإنشاء بطاقاتها في العرس الجماعي' : 'Bulk import committees list and create cards'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkImportCommitteesModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Selector: Append vs Replace */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-2">
              <label className="text-xs font-black text-gray-700 block">
                {isRtl ? 'طريقة الاستيراد والتعامل مع اللجان الحالية:' : 'Import Mode:'}
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${bulkExcelMode === 'append' ? 'bg-emerald-50 border-emerald-300 font-black text-emerald-900' : 'bg-white border-gray-200 text-gray-600'
                  }`}>
                  <input
                    type="radio"
                    name="bulkExcelMode"
                    value="append"
                    checked={bulkExcelMode === 'append'}
                    onChange={() => setBulkExcelMode('append')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{isRtl ? `إلحاق وإضافة (+${committees.length})` : 'Append (Keep existing)'}</span>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${bulkExcelMode === 'replace' ? 'bg-amber-50 border-amber-300 font-black text-amber-900' : 'bg-white border-gray-200 text-gray-600'
                  }`}>
                  <input
                    type="radio"
                    name="bulkExcelMode"
                    value="replace"
                    checked={bulkExcelMode === 'replace'}
                    onChange={() => setBulkExcelMode('replace')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>{isRtl ? 'استبدال الكل (Replace)' : 'Replace All'}</span>
                </label>
              </div>
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
                  {isRtl ? 'يتعرف النظام تلقائياً على أعمدة: اسم اللجنة، المشرف، الهاتف، وعدد المتطوعين' : 'Auto-detects: Committee Name, Leader, Phone, and Volunteers'}
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm transition">
                <FileSpreadsheet size={15} />
                <span>{bulkExcelFileName ? bulkExcelFileName : (isRtl ? 'تحديد الملف من جهازك' : 'Choose File')}</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleBulkExcelFileUpload}
                  className="hidden"
                />
              </label>

              {bulkExcelFileName && (
                <p className="text-xs text-emerald-700 font-bold">
                  ✓ {isRtl ? 'تم تحميل الملف:' : 'Selected:'} {bulkExcelFileName}
                </p>
              )}
            </div>

            {/* Sample Template Download */}
            <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-gray-600 font-bold">{isRtl ? 'بحاجة لنموذج جاهز للتعبئة؟' : 'Need a template file?'}</span>
              <button
                type="button"
                onClick={handleDownloadBulkCommitteesSampleCsv}
                className="text-emerald-700 hover:text-emerald-800 font-black flex items-center gap-1 hover:underline"
              >
                <Download size={13} />
                <span>{isRtl ? 'تحميل نموذج اللجان (CSV)' : 'Download Template'}</span>
              </button>
            </div>

            {bulkExcelError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{bulkExcelError}</span>
              </div>
            )}

            {/* Preview Table */}
            {bulkExcelCommittees.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-gray-900">
                  <span>{isRtl ? 'معاينة اللجان المستخرجة:' : 'Extracted Committees Preview:'}</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                    {isRtl ? `تم العثور على (${bulkExcelCommittees.length}) لجنة` : `${bulkExcelCommittees.length} committees found`}
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 text-xs">
                  {bulkExcelCommittees.map((com, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-2 bg-white">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-400 font-mono text-[10px] w-5">{idx + 1}.</span>
                        <strong className="text-gray-900 truncate">{com.name}</strong>
                        {com.leader && <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{com.leader}</span>}
                      </div>
                      {com.phone && <span className="font-mono text-gray-500 text-[11px]" dir="ltr">{com.phone}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowBulkImportCommitteesModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={bulkExcelCommittees.length === 0}
                onClick={handleConfirmBulkImport}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold transition shadow-sm"
              >
                {isRtl ? `تأكيد واستيراد (${bulkExcelCommittees.length}) لجنة ✓` : `Import (${bulkExcelCommittees.length}) Committees ✓`}
              </button>
            </div>
          </div>
        </div>
      )}

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
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] ${t.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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
