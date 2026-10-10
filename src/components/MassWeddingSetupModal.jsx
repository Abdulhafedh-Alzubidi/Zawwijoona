import React, { useState } from 'react';
import { Users2, Calendar, MapPin, Building2, Coins, FileText, X } from 'lucide-react';

export default function MassWeddingSetupModal({ initialData, onSave, onCancel, isRtl }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || 'العرس الجماعي الخيري العاشر',
    titleEn: initialData?.titleEn || '10th Community Charitable Mass Wedding',
    organizer: initialData?.organizer || 'لجنة تيسير الزواج والعمل الخيري',
    organizerEn: initialData?.organizerEn || 'Marriage Facilitation & Charity Committee',
    city: initialData?.city || 'حضرموت',
    cityEn: initialData?.cityEn || 'Hadhramaut',
    location: initialData?.location || 'ساحة قصر الرند - تريم',
    locationEn: initialData?.locationEn || 'Al-Rund Palace Grounds - Tarim',
    date: initialData?.date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetCouples: initialData?.targetCouples || 24,
    estimatedTotalBudget: initialData?.estimatedTotalBudget || 18000000,
    guestQuotaPerCouple: initialData?.guestQuotaPerCouple || 35,
    notes: initialData?.notes || 'زواج جماعي تيسيراً للشباب وحفظاً للأعراف والتقاليد الأصيلة.'
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-amber-100 p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in-95">

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`absolute top-5 ${isRtl ? 'left-5' : 'right-5'} p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition`}
          >
            <X size={20} />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-200">
            <Users2 size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            {isRtl ? 'إعداد ملف العرس الجماعي' : 'Mass Wedding Setup'}
          </h2>
          <p className="text-sm text-gray-500">
            {isRtl ? 'أدخل التفاصيل الأساسية للفعالية لبدء إدارة اللجان والعرسان والميزانية' : 'Enter primary event details to start organizing committees, couples, and budget'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {isRtl ? 'عنوان أو اسم العرس الجماعي' : 'Mass Wedding Title'}
            </label>
            <div className="relative">
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={isRtl ? 'مثال: العرس الجماعي الخيري العاشر' : 'e.g., 10th Community Mass Wedding'}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isRtl ? 'الجهة المنظمة / الجمعية' : 'Organizing Entity'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="organizer"
                  required
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder={isRtl ? 'لجنة تيسير الزواج' : 'Organizing Committee'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isRtl ? 'المدينة / المحافظة' : 'City / Governorate'}
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder={isRtl ? 'حضرموت - تريم / المكلا' : 'Hadhramaut'}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {isRtl ? 'مكان وساحة الاحتفال الرئيسية' : 'Celebration Venue / Grounds'}
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder={isRtl ? 'ساحة قصر الرند / مجمع المخادر' : 'Palace Grounds / Central Plaza'}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isRtl ? 'تاريخ الفعالية' : 'Event Date'}
              </label>
              <input
                type="date"
                name="date"
                min={todayStr}
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isRtl ? 'عدد العرسان المستهدف' : 'Target Couples'}
              </label>
              <input
                type="number"
                name="targetCouples"
                min="2"
                max="500"
                required
                value={formData.targetCouples}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isRtl ? 'الميزانية التقديرية (ر.ي)' : 'Budget (YER)'}
              </label>
              <input
                type="number"
                name="estimatedTotalBudget"
                min="100000"
                step="50000"
                required
                value={formData.estimatedTotalBudget}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {isRtl ? 'ملاحظات أو شعار الفعالية' : 'Event Motto / Notes'}
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder={isRtl ? 'شعار العرس الجماعي أو توجيهات عامة...' : 'Event motto or special instructions...'}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div className="flex gap-3 pt-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-100 transition"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm shadow-lg shadow-amber-200 transition"
            >
              {isRtl ? 'حفظ والبدء بالتخطيط 🚀' : 'Save & Start Planning 🚀'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
