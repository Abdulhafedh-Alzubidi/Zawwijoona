import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Circle,
  Users,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  AlertTriangle,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function CommitteePortalView({
  committee,
  weddingTitle = 'العرس الجماعي الخيري',
  weddingDate = '',
  organizer = 'اللجنة العليا المنظمة',
  emergencyPhone = '',
  onBack = null,
  isStandalone = false,
  isRtl = true,
}) {
  const [memberSearch, setMemberSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [localTasks, setLocalTasks] = useState(() => {
    if (committee?.tasks && committee.tasks.length > 0) {
      return committee.tasks;
    }
    return (committee?.responsibilities || []).map((resp, i) => ({
      id: `task-${i}`,
      text: resp,
      completed: false,
    }));
  });

  if (!committee) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black">
            !
          </div>
          <h2 className="text-lg font-black text-gray-800">لم يتم العثور على اللجنة</h2>
          <p className="text-xs text-gray-500">
            تأكد من صحة الرابط أو تواصل مع المشرف أو اللجنة العليا للتزويد بالرابط الصحيح.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              العودة
            </button>
          )}
        </div>
      </div>
    );
  }

  const cleanPhone = (phone) => (phone ? phone.replace(/[^0-9]/g, '') : '');

  const toggleTask = (taskId) => {
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const members = committee.members || [];
  const filteredMembers = members.filter((m) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.phone && m.phone.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q))
    );
  });

  const completedCount = localTasks.filter((t) => t.completed).length;
  const progressPct = localTasks.length > 0 ? Math.round((completedCount / localTasks.length) * 100) : 0;

  const supervisorPhoneClean = cleanPhone(committee.phone);
  const supervisorCallLink = committee.phone ? `tel:${committee.phone}` : '#';
  const supervisorWaLink = supervisorPhoneClean
    ? `https://wa.me/${supervisorPhoneClean}?text=${encodeURIComponent(
        `السلام عليكم أخي المشرف ${committee.leader || ''}، أنا عضو في لجنتكم (${committee.name}) في الميدان.`
      )}`
    : '#';

  const sharePortalWaLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `السلام عليكم زملائي في ${committee.name}، هذا رابط بوابتنا الميدانية لمعرفة المشرف والمهام وأرقام التواصل:\n${window.location.href}`
  )}`;

  return (
    <div
      className="min-h-screen bg-slate-900/5 text-slate-800 pb-16 antialiased"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Navbar / Branding */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="العودة"
              >
                <ArrowRight size={18} className="rtl:rotate-0 ltr:rotate-180" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              م
            </div>
            <div>
              <h1 className="text-xs font-black text-slate-900 leading-tight">
                {weddingTitle || 'العرس الجماعي'}
              </h1>
              <p className="text-[10px] text-slate-500 font-bold">{organizer || 'بوابة اللجان الميدانية'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200/60"
          >
            {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* --- 1. HERO BANNER: COMMITTEE IDENTITY --- */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white p-5 shadow-lg border border-blue-600/30">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black border border-white/20 text-blue-100">
              <ShieldCheck size={13} className="text-amber-300" />
              <span>بوابة العضو الميداني الرسمية</span>
            </div>

            <h2 className="text-xl font-black text-white leading-tight">
              {committee.name}
            </h2>

            {committee.location && (
              <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium pt-1">
                <MapPin size={14} className="text-amber-300 shrink-0" />
                <span>موقع التمركز: </span>
                <strong className="text-white">{committee.location}</strong>
              </div>
            )}

            {weddingDate && (
              <div className="flex items-center gap-1.5 text-[11px] text-blue-200 font-medium">
                <Clock size={13} className="shrink-0" />
                <span>تاريخ الفعالية: </span>
                <strong>{weddingDate}</strong>
              </div>
            )}
          </div>
        </div>

        {/* --- 2. SUPERVISOR HERO CARD (بطاقة المشرف المباشر - الأهم) --- */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-300/80 shadow-md space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-amber-400 text-amber-950 font-black text-[10px] px-3 py-1 rounded-br-2xl shadow-xs">
            ⭐ المشرف المباشر للجنة
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              {committee.leader ? committee.leader.charAt(0) : 'م'}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-[11px] font-bold text-amber-700">مسؤول ومشرف الفريق</p>
              <h3 className="text-base font-black text-gray-900 truncate">
                {committee.leader || 'لم يُحدد اسم المشرف'}
              </h3>
              {committee.phone && (
                <p className="text-xs text-gray-600 font-bold" dir="ltr">
                  {committee.phone}
                </p>
              )}
            </div>
          </div>

          {/* Supervisor Call & WhatsApp Big Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <a
              href={supervisorCallLink}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm text-white shadow-sm transition active:scale-95 ${
                committee.phone
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-gray-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              <Phone size={17} />
              <span>اتصال مباشر</span>
            </a>

            <a
              href={supervisorWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm text-white shadow-sm transition active:scale-95 ${
                committee.phone
                  ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                  : 'bg-gray-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              <MessageCircle size={17} />
              <span>واتساب فوري</span>
            </a>
          </div>

          <p className="text-[10px] text-gray-400 text-center font-medium">
            تواصل فوراً مع مشرفك عند وصولك للميدان أو في حال واجهت أي استفسار
          </p>
        </div>

        {/* --- 3. DIGITAL VOLUNTEER BADGE (بطاقة التعريف الرقمية) --- */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowBadge(!showBadge)}
            className="w-full p-4 flex items-center justify-between text-right hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">
                  {showBadge ? 'إخفاء البطاقة التعريفية الرقمية' : 'إظهار بطاقة المتطوع الرقمية'}
                </h4>
                <p className="text-[10px] text-gray-500">لإبرازها عند نقاط الدخول ونقاط التفتيش الميدانية</p>
              </div>
            </div>
            {showBadge ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          {showBadge && (
            <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white border-t border-slate-200/40 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xs">
                    م
                  </div>
                  <div>
                    <p className="text-[10px] text-amber-300 font-bold">{weddingTitle}</p>
                    <p className="text-xs font-black text-white">{organizer}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                  معتمد ميدانياً
                </span>
              </div>

              <div className="space-y-2 py-1 text-center">
                <p className="text-[11px] text-gray-300">عضو رسمي في</p>
                <h3 className="text-lg font-black text-amber-300">{committee.name}</h3>
                {committee.location && (
                  <p className="text-xs text-blue-200">📍 {committee.location}</p>
                )}
                <div className="pt-2 text-xs text-gray-300">
                  <span>المشرف المسؤول: </span>
                  <strong className="text-white">{committee.leader}</strong>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[10px] text-gray-400">
                <span>كود التحقق: {committee.id || 'MAR-VOL-01'}</span>
                <span>صالحة طوال أيام الفعالية</span>
              </div>
            </div>
          )}
        </div>

        {/* --- 4. TASKS CHECKLIST (مهام اللجنة الميدانية) --- */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">مهام وتكليفات اللجنة</h4>
                <p className="text-[10px] text-gray-500">
                  {completedCount} من {localTasks.length} مهام مكتملة
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
              {progressPct}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>

          {localTasks.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">
              لم تُضف مهام خاصة بعد لهذه اللجنة.
            </p>
          ) : (
            <div className="space-y-2 pt-1">
              {localTasks.map((t, idx) => (
                <div
                  key={t.id || idx}
                  onClick={() => toggleTask(t.id)}
                  className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 cursor-pointer transition select-none ${
                    t.completed
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 line-through opacity-85'
                      : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 text-emerald-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(t.id);
                    }}
                  >
                    {t.completed ? <CheckCircle2 size={16} /> : <Circle size={16} className="text-gray-400" />}
                  </button>
                  <span className="leading-relaxed font-bold">{t.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- 5. TEAM ROSTER (زملاء الفريق في نفس اللجنة) --- */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">زملاء اللجنة الميدانيين</h4>
                <p className="text-[10px] text-gray-500">
                  {members.length} متطوع وعضو مسجل
                </p>
              </div>
            </div>

            <span className="text-[11px] font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl">
              {members.length} عضو
            </span>
          </div>

          {members.length > 3 && (
            <div className="relative">
              <Search size={14} className="absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="ابحث عن زميل في اللجنة..."
                className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
          )}

          {filteredMembers.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              {members.length === 0 ? 'لم يتم إضافة أعضاء بعد في هذه اللجنة.' : 'لا توجد نتائج تطابق بحثك.'}
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
              {filteredMembers.map((m, idx) => {
                const memberPhoneClean = cleanPhone(m.phone);
                return (
                  <div
                    key={m.id || idx}
                    className="p-3 bg-slate-50/70 hover:bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {m.name ? m.name.charAt(0) : 'ع'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-gray-900 truncate">{m.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold truncate">
                          {m.role || 'عضو ميداني'}
                        </p>
                        {m.phone && (
                          <p className="text-[10px] text-gray-400 font-mono" dir="ltr">
                            {m.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {m.phone && (
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={`tel:${m.phone}`}
                          className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs transition"
                          title="اتصال بالزميل"
                        >
                          <Phone size={13} />
                        </a>
                        <a
                          href={`https://wa.me/${memberPhoneClean}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white hover:bg-green-50 text-green-700 border border-green-200 shadow-2xs transition"
                          title="محادثة واتساب"
                        >
                          <MessageCircle size={13} />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- 6. EMERGENCY / SUPREME OPS CONTACT --- */}
        {emergencyPhone && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-950">غرفة العمليات المركزية (طوارئ)</p>
                <p className="text-[10px] text-amber-800">في حال تعذر الوصول للمشرف أو وجود طارئ ميداني</p>
              </div>
            </div>
            <a
              href={`tel:${emergencyPhone}`}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shrink-0 transition"
            >
              اتصال بالطوارئ
            </a>
          </div>
        )}

        {/* --- 7. SHARE & HELP ACTIONS --- */}
        <div className="pt-2 text-center space-y-2">
          <a
            href={sharePortalWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold shadow-2xs transition"
          >
            <Share2 size={14} className="text-green-600" />
            <span>مشاركة الرابط مع أعضاء اللجنة عبر واتساب</span>
          </a>

          <p className="text-[10px] text-gray-400">
            منظومة مراسيم الذكية لإدارة الأعراس الجماعية الميدانية
          </p>
        </div>

      </main>
    </div>
  );
}
