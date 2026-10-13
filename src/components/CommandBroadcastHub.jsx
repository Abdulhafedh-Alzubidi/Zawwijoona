import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageCircle,
  Phone,
  Radio,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
  QrCode as QrIcon,
  ExternalLink,
  Users,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { generateCommitteePortalUrl } from '../utils/portalHelpers';

const DEFAULT_TEMPLATES = [
  {
    id: 'gather-call',
    title: '📢 نداء تجمع وانطلاق اللجان',
    category: 'بداية الفعالية',
    text: `السلام عليكم ورحمة الله وبركاته،
الإخوة الكرام مشرفي اللجان الميدانية في {weddingTitle}،
نرجو التواجد الآن في نقاط التمركز المحددة وتفقد أعضاء الفريق والتأكد من الجاهزية الكاملة لبدء الاستقبال.
بارك الله بجهودكم وسدد خطاكم.
- اللجنة العليا للمراسيم`,
  },
  {
    id: 'guests-movement',
    title: '🚗 بدء حركة وتفويج الضيوف والسيارات',
    category: 'الحركة والاستقبال',
    text: `توجيه عاجل للإخوة في لجنة الاستقبال والحركة والمواقف في {weddingTitle}:
بدأت الآن وفود الضيوف بالوصول، نرجو تفعيل مسارات الدخول وتنظيم حركة المواقف وتسهيل دخول ضيوف الشرف وكبار السن.
- اللجنة العليا للمراسيم`,
  },
  {
    id: 'meal-time',
    title: '🍱 موعد فتح صالات الطعام والوجبات',
    category: 'الضيافة والوليمة',
    text: `تنبيه للإخوة في لجنة الضيافة والتغذية والشاي:
سيتم البدء بفتح صالات الطعام والوليمة الكبرى بعد 15 دقيقة بإذن الله.
يرجى التأكد من اكتمال وجبات الموائد وتوجيه المرشدين لمداخل الصالات لتفادي أي تكدس.
- اللجنة العليا للمراسيم`,
  },
  {
    id: 'urgent-alert',
    title: '⚠️ تنبيه عاجل / توجيه ميداني طارئ',
    category: 'طوارئ وتنظيم',
    text: `تنبيه عاجل من غرفة العمليات المركزية في {weddingTitle}:
يرجى من جميع المشرفين الميدانيين متابعة مواقعهم بدقة ومنع التزاحم، والتواصل الفوري مع غرفة العمليات في حال وجود أي نقص أو طلب دعم.
- اللجنة العليا للمراسيم`,
  },
  {
    id: 'send-portal-link',
    title: '🔗 إرسال رابط بوابة اللجنة للمشرف وفريقه',
    category: 'الروابط الميدانية',
    text: `السلام عليكم ورحمة الله،
أخي المشرف الكريم / {supervisor}،
هذا هو الرابط الرقمي المخصص للجنتكم الميدانية ({committee}) في {weddingTitle}:
{portalUrl}

يرجى مشاركة الرابط مع أعضاء فريقك للاطلاع على المهام الموكلة وأرقام التواصل المباشرة والتنسيق في الميدان.
- اللجنة العليا للمراسيم`,
  },
];

export default function CommandBroadcastHub({
  committees = [],
  weddingTitle = 'العرس الجماعي الخيري',
  weddingDate = '',
  onOpenQrModal,
  onOpenPortalPreview,
  isRtl = true,
}) {
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('maraseem_broadcast_templates');
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState('gather-call');
  const [messageBody, setMessageBody] = useState('');
  const [targetMode, setTargetMode] = useState('all'); // 'all' | 'specific'
  const [selectedCommitteeId, setSelectedCommitteeId] = useState('');
  const [sentLog, setSentLog] = useState({}); // { [committeeId]: timestamp }
  const [copiedLinkFor, setCopiedLinkFor] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // New Custom Template Form
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('');
  const [newTemplateText, setNewTemplateText] = useState('');

  // Save custom templates to localStorage
  const saveTemplates = (newTemplatesList) => {
    setTemplates(newTemplatesList);
    try {
      localStorage.setItem('maraseem_broadcast_templates', JSON.stringify(newTemplatesList));
    } catch (e) {
      console.error('Failed to save templates to localStorage:', e);
    }
  };

  // Sync initial message body when template changes
  useEffect(() => {
    const tpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (tpl) {
      setMessageBody(tpl.text);
    }
  }, [selectedTemplateId, templates]);

  const cleanPhone = (phone) => (phone ? phone.replace(/[^0-9]/g, '') : '');

  // Helper to build portal URL for a committee
  const getCommitteePortalUrl = (com) => {
    return generateCommitteePortalUrl(com, {
      title: weddingTitle,
      date: weddingDate,
    });
  };

  // Format message text with placeholder replacements
  const formatMessageForCommittee = (text, committee) => {
    if (!committee) {
      return text
        .replace(/{weddingTitle}/g, weddingTitle || 'العرس الجماعي')
        .replace(/{weddingDate}/g, weddingDate || '')
        .replace(/{supervisor}/g, 'مشرف اللجنة')
        .replace(/{committee}/g, 'اللجنة الميدانية')
        .replace(/{portalUrl}/g, '[رابط اللجنة الميدانية]');
    }

    const portalUrl = getCommitteePortalUrl(committee);
    return text
      .replace(/{weddingTitle}/g, weddingTitle || 'العرس الجماعي')
      .replace(/{weddingDate}/g, weddingDate || '')
      .replace(/{supervisor}/g, committee.leader || 'مشرف اللجنة')
      .replace(/{committee}/g, committee.name || 'اللجنة الميدانية')
      .replace(/{portalUrl}/g, portalUrl);
  };

  // One-click send via WhatsApp to a supervisor
  const handleSendToSupervisor = (com) => {
    const phoneClean = cleanPhone(com.phone);
    if (!phoneClean) {
      alert(isRtl ? 'لا يوجد رقم هاتف مسجل لمشرف هذه اللجنة.' : 'No phone number for this supervisor.');
      return;
    }

    const text = formatMessageForCommittee(messageBody, com);
    const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');

    // Mark as sent
    setSentLog((prev) => ({
      ...prev,
      [com.id]: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    }));
  };

  const handleCopyLink = async (com) => {
    const url = getCommitteePortalUrl(com);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkFor(com.id);
      setTimeout(() => setCopiedLinkFor(null), 2500);
    } catch {
      setCopiedLinkFor(com.id);
      setTimeout(() => setCopiedLinkFor(null), 2500);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageBody);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  const handleCreateCustomTemplate = (e) => {
    e.preventDefault();
    if (!newTemplateTitle.trim() || !newTemplateText.trim()) return;

    const newTpl = {
      id: `custom-${Date.now()}`,
      title: newTemplateTitle.trim(),
      category: newTemplateCategory.trim() || 'قوالب مخصصة',
      text: newTemplateText.trim(),
    };

    const updated = [...templates, newTpl];
    saveTemplates(updated);
    setSelectedTemplateId(newTpl.id);
    setShowAddTemplateModal(false);
    setNewTemplateTitle('');
    setNewTemplateCategory('');
    setNewTemplateText('');
  };

  const handleDeleteTemplate = (tplId, e) => {
    e.stopPropagation();
    if (window.confirm(isRtl ? 'هل تريد حذف هذا القالب؟' : 'Delete this template?')) {
      const updated = templates.filter((t) => t.id !== tplId);
      saveTemplates(updated);
      if (selectedTemplateId === tplId && updated.length > 0) {
        setSelectedTemplateId(updated[0].id);
      }
    }
  };

  const totalVolunteers = committees.reduce((sum, c) => sum + (c.members ? c.members.length : 0), 0);
  const assignedLeadsCount = committees.filter((c) => c.leader && c.phone).length;

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* --- HERO BANNER: COMMAND & BROADCAST HUB --- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-emerald-700/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-xs font-bold border border-emerald-400/30 text-emerald-200">
              <Radio size={14} className="animate-pulse text-emerald-300" />
              <span>غرفة العمليات المركزية وبث التوجيهات الميدانية</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>مركز البث والتوجيهات الموحدة للجان الميدانية</span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              إدارة تواصل اللجان الميدانية بنقرة زر واحدة عبر واتساب، بث التوجيهات الفورية لكافة المشرفين، ومشاركة الروابط ورموز QR دون الحاجة لاجتماعات أو اتصالات معطلة في زحام يوم الزفاف.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-center min-w-[90px]">
              <span className="block text-2xl font-black text-white">{committees.length}</span>
              <span className="text-[11px] text-emerald-200 font-bold">لجان ميدانية</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-center min-w-[90px]">
              <span className="block text-2xl font-black text-amber-300">{assignedLeadsCount}</span>
              <span className="text-[11px] text-emerald-200 font-bold">مشرف جاهز</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-center min-w-[90px]">
              <span className="block text-2xl font-black text-emerald-300">{totalVolunteers}</span>
              <span className="text-[11px] text-emerald-200 font-bold">متطوع مسجل</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION 1: BROADCAST GENERATOR & SENDER --- */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Send size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">
                محرك بث التوجيهات والرسائل الموحدة (WhatsApp Broadcast)
              </h3>
              <p className="text-xs text-gray-500">اختر قالباً أو اكتب رسالة التوجيه وأرسلها فوراً للمشرفين</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddTemplateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>إضافة قالب توجيه جديد</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Templates Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              اختر قالب التوجيه الميداني:
            </label>
            <div className="flex flex-wrap gap-2">
              {templates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                const isCustom = tpl.id.startsWith('custom-');
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tpl.title}</span>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                        className={`p-0.5 rounded-full hover:bg-red-500 hover:text-white transition ${
                          isSelected ? 'text-emerald-200' : 'text-gray-400'
                        }`}
                        title="حذف القالب"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Editable Text Area & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700">
                  نص الرسالة والتوجيه (قابل للتعديل الفوري):
                </label>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                >
                  {copiedMessage ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedMessage ? 'تم نسخ النص!' : 'نسخ النص'}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none leading-relaxed text-gray-800 transition"
                dir="rtl"
                placeholder="اكتب التوجيه هنا..."
              />

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                <span>المتغيرات التلقائية المتاحة: </span>
                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                  {'{supervisor}'}
                </code>
                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                  {'{committee}'}
                </code>
                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                  {'{portalUrl}'}
                </code>
                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                  {'{weddingTitle}'}
                </code>
              </div>
            </div>

            {/* Live WhatsApp Preview Bubble */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                معاينة شكل الرسالة كما ستصل للمشرف على واتساب:
              </label>

              <div className="bg-[#e5ddd5] p-4 rounded-2xl border border-emerald-900/10 min-h-[160px] flex flex-col justify-end relative shadow-inner">
                <div className="bg-white rounded-2xl rounded-tr-xs p-3.5 shadow-sm text-xs text-gray-800 space-y-1.5 max-w-sm ml-auto border border-black/5 leading-relaxed whitespace-pre-wrap">
                  <p>{formatMessageForCommittee(messageBody, null)}</p>
                  <div className="text-[10px] text-gray-400 text-left pt-1 flex items-center justify-end gap-1">
                    <span>الآن</span>
                    <span className="text-blue-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Dispatch Table / Direct Send Strip */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-gray-900">
                  إرسال فوري إلى مشرفي اللجان الميدانية:
                </h4>
                <p className="text-[11px] text-gray-500">
                  انقر على زر "إرسال لواتساب" أمام أي مشرف لفتح المحادثة بالنص المخصص فوراً
                </p>
              </div>

              <div className="text-xs font-bold text-gray-500">
                تم الإرسال لـ <strong className="text-emerald-700">{Object.keys(sentLog).length}</strong> من{' '}
                <strong>{assignedLeadsCount}</strong> مشرف
              </div>
            </div>

            {committees.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                لا توجد لجان مسجلة حالياً لبث التوجيهات.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {committees.map((com) => {
                  const hasPhone = !!com.phone;
                  const phoneClean = cleanPhone(com.phone);
                  const isSent = !!sentLog[com.id];

                  return (
                    <div
                      key={com.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                        isSent
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-black text-gray-900 truncate">{com.name}</h5>
                          {isSent && (
                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold">
                              تم الإرسال ({sentLog[com.id]})
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-600 font-bold truncate">
                          المشرف: {com.leader || <span className="text-red-500">لم يعين مشرف</span>}
                        </p>
                        {com.phone ? (
                          <p className="text-[10px] text-gray-400 font-mono" dir="ltr">
                            {com.phone}
                          </p>
                        ) : (
                          <p className="text-[10px] text-red-400 font-bold">لا يوجد رقم هاتف</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSendToSupervisor(com)}
                          disabled={!hasPhone}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                            hasPhone
                              ? isSent
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <MessageCircle size={14} />
                          <span>{isSent ? 'إرسال مجدداً' : 'إرسال لواتساب'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SECTION 2: SUPERVISORS QUICK DIRECTORY & PORTALS --- */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-gray-200 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">
                دليل اتصال المشرفين والروابط الميدانية
              </h3>
              <p className="text-xs text-gray-500">
                وصول سريع لبوابات اللجان، رموز QR، والاتصال المباشر بمشرف كل موقع
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {committees.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">لا توجد لجان مسجلة حتى الآن.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold">
                    <th className="pb-3 pr-2">اللجنة وموقع التمركز</th>
                    <th className="pb-3">المشرف المسؤول</th>
                    <th className="pb-3 text-center">أعضاء الفريق</th>
                    <th className="pb-3 text-center">البوابة الميدانية & QR</th>
                    <th className="pb-3 pl-2 text-center">الاتصال السريع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {committees.map((com) => {
                    const portalUrl = getCommitteePortalUrl(com);
                    const isCopied = copiedLinkFor === com.id;
                    const membersCount = (com.members || []).length;

                    return (
                      <tr key={com.id} className="hover:bg-slate-50/80 transition">
                        {/* Committee & Location */}
                        <td className="py-3.5 pr-2">
                          <p className="font-black text-gray-900 text-xs sm:text-sm">{com.name}</p>
                          {com.location && (
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 pt-0.5">
                              <MapPin size={12} className="text-amber-500 shrink-0" />
                              <span>{com.location}</span>
                            </p>
                          )}
                        </td>

                        {/* Supervisor */}
                        <td className="py-3.5">
                          <p className="font-bold text-gray-800">{com.leader || '—'}</p>
                          {com.phone && (
                            <p className="text-[11px] text-gray-500 font-mono" dir="ltr">
                              {com.phone}
                            </p>
                          )}
                        </td>

                        {/* Members count */}
                        <td className="py-3.5 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-black text-xs">
                            {membersCount} عضو
                          </span>
                        </td>

                        {/* Portal & QR actions */}
                        <td className="py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(com)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-1 text-[11px]"
                              title="نسخ رابط البوابة الميدانية"
                            >
                              {isCopied ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                              <span>{isCopied ? 'تم!' : 'نسخ الرابط'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onOpenQrModal && onOpenQrModal(com, portalUrl)}
                              className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition"
                              title="عرض وتحميل رمز QR"
                            >
                              <QrIcon size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => onOpenPortalPreview && onOpenPortalPreview(com)}
                              className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 transition"
                              title="معاينة بوابة الجوال"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        </td>

                        {/* Direct Call & WhatsApp */}
                        <td className="py-3.5 pl-2 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            {com.phone ? (
                              <>
                                <a
                                  href={`tel:${com.phone}`}
                                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition"
                                  title="اتصال هاتفي بالمشرف"
                                >
                                  <Phone size={14} />
                                </a>
                                <a
                                  href={`https://wa.me/${cleanPhone(com.phone)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 transition"
                                  title="محادثة واتساب مباشرة"
                                >
                                  <MessageCircle size={14} />
                                </a>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400">لا يوجد هاتف</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL: CREATE CUSTOM TEMPLATE --- */}
      {showAddTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
              <h3 className="font-black text-sm">إضافة قالب توجيه وبث جديد</h3>
              <button
                type="button"
                onClick={() => setShowAddTemplateModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomTemplate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  عنوان القالب (مثال: 🚗 تنبيه تحريك سيارات العرسان)
                </label>
                <input
                  type="text"
                  required
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  placeholder="عنوان القالب..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  تصنيف القالب (اختياري)
                </label>
                <input
                  type="text"
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  placeholder="مثال: الضيافة / الاستقبال / الطوارئ"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  نص التوجيه الميداني
                </label>
                <textarea
                  rows={5}
                  required
                  value={newTemplateText}
                  onChange={(e) => setNewTemplateText(e.target.value)}
                  placeholder="اكتب التوجيه هنا... يمكنك استخدام {supervisor} أو {committee} أو {portalUrl}"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTemplateModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition"
                >
                  حفظ القالب واستخدامه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
