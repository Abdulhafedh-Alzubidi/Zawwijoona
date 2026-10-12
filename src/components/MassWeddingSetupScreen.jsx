import React, { useState } from 'react';
import {
  Users2, Calendar, MapPin, Building2, Coins, FileText,
  Sparkles, ArrowRight, ArrowLeft, Globe, HeartHandshake, CheckCircle2
} from 'lucide-react';

export default function MassWeddingSetupScreen({
  initialData,
  onSave,
  onSwitchToIndividual,
  onSwitchMode,
  isRtl,
  lang,
  onToggleLang
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    organizer: initialData?.organizer || '',
    city: initialData?.city || '',
    location: initialData?.location || '',
    date: initialData?.date || '',
    targetCouples: initialData?.targetCouples !== undefined ? initialData.targetCouples : '',
    estimatedTotalBudget: initialData?.estimatedTotalBudget !== undefined ? initialData.estimatedTotalBudget : '',
    guestQuotaPerCouple: initialData?.guestQuotaPerCouple !== undefined ? initialData.guestQuotaPerCouple : '',
    notes: initialData?.notes || ''
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-gradient-to-b from-[#fdfbf7] via-amber-50/40 to-[#fdfbf7] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans ${isRtl ? 'font-arabic' : ''}`}
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-100/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-0 left-1/4 w-36 h-36 bg-amber-300/20 rounded-full blur-xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold border border-white/25">
                <Users2 size={15} />
                <span>{isRtl ? 'تهيئة عرس جماعي جديد' : 'New Mass Wedding Setup'}</span>
              </div>

              <button
                type="button"
                onClick={onToggleLang}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition backdrop-blur-sm border border-white/20"
                title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
              >
                <Globe size={13} />
                <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2.5">
              <span>{isRtl ? 'تنظيم زواج جماعي جديد' : 'Plan a New Mass Wedding'}</span>
              <Sparkles size={24} className="text-amber-200 shrink-0" />
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
              {isRtl
                ? 'ابدأ بصفحة بيضاء نظيفة. أدخل البيانات الأساسية لبدء تسجيل العرسان، تشكيل اللجان، حساب لوجستيات الضيافة، وإدارة الرعايات.'
                : 'Start with a fresh, clean slate. Enter the core event parameters to begin registering couples, organizing committees, and managing sponsorships.'}
            </p>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          {/* 1. Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {isRtl ? 'اسم أو عنوان العرس الجماعي' : 'Mass Wedding Title'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={isRtl ? 'مثال: العرس الجماعي الخيري لشباب تريم' : 'e.g., Community Charitable Mass Wedding'}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* 2. Organizer & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Building2 size={14} className="text-amber-600" />
                <span>{isRtl ? 'الجهة أو الجمعية المنظمة' : 'Organizing Entity'} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                name="organizer"
                required
                value={formData.organizer}
                onChange={handleChange}
                placeholder={isRtl ? 'مثال: لجنة تيسير الزواج' : 'e.g., Marriage Facilitation Committee'}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-600" />
                <span>{isRtl ? 'المحافظة أو المدينة' : 'City / Governorate'} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder={isRtl ? 'مثال: حضرموت - تريم / المكلا' : 'e.g., Hadhramaut - Tarim'}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* 3. Venue & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-600" />
                <span>{isRtl ? 'مكان أو ساحة الاحتفال' : 'Celebration Venue'} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder={isRtl ? 'مثال: ساحة قصر الرند / مجمع المخادر' : 'e.g., Palace Grounds / Central Plaza'}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-600" />
                <span>{isRtl ? 'تاريخ الفعالية' : 'Event Date'} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                name="date"
                min={todayStr}
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* 4. Target Couples, Estimated Budget, Guest Quota */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Users2 size={14} className="text-amber-600" />
                <span>{isRtl ? 'عدد العرسان المستهدف' : 'Target Couples'} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="number"
                name="targetCouples"
                min="2"
                max="1000"
                required
                value={formData.targetCouples}
                onChange={handleChange}
                placeholder={isRtl ? 'مثال: 24' : 'e.g., 24'}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Coins size={14} className="text-amber-600" />
                <span>{isRtl ? 'الميزانية التقديرية (ر.ي)' : 'Budget (YER)'} <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="number"
                name="estimatedTotalBudget"
                min="0"
                step="50000"
                required
                value={formData.estimatedTotalBudget}
                onChange={handleChange}
                placeholder={isRtl ? 'مثال: 15000000' : 'e.g., 15000000'}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isRtl ? 'كوتة دعوات كل عريس' : 'Guest Quota / Couple'}
              </label>
              <input
                type="number"
                name="guestQuotaPerCouple"
                min="0"
                max="500"
                value={formData.guestQuotaPerCouple}
                onChange={handleChange}
                placeholder={isRtl ? 'مثال: 35' : 'e.g., 35'}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* 5. Notes / Motto */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-amber-600" />
              <span>{isRtl ? 'شعار الفعالية أو توجيهات عامة (اختياري)' : 'Event Motto / Notes (Optional)'}</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder={isRtl ? 'اكتب شعار الفعالية أو أي ملاحظات توجيهية...' : 'Write event motto or special guidelines...'}
              className="w-full bg-gray-50/80 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition resize-none placeholder:text-gray-400"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-base shadow-lg shadow-amber-300/40 hover:shadow-xl transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>{isRtl ? 'بدء تنظيم العرس الجماعي 🚀' : 'Start Mass Wedding Planning 🚀'}</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
            {onSwitchToIndividual && (
              <button
                type="button"
                onClick={onSwitchToIndividual}
                className="text-rose-600 hover:text-rose-700 font-bold hover:underline flex items-center gap-1"
              >
                {isRtl ? '← التبديل إلى زواج فردي' : '← Switch to Individual Wedding'}
              </button>
            )}

            {onSwitchMode && (
              <button
                type="button"
                onClick={onSwitchMode}
                className="text-amber-700 hover:text-amber-800 font-bold hover:underline"
              >
                {isRtl ? 'تغيير نوع الزواج' : 'Change Mode'}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
