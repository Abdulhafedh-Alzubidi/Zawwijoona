import React from 'react';
import { Heart, Users2, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Flame, CalendarHeart } from 'lucide-react';

export default function WeddingModeSelector({ onSelectMode, currentMode, isRtl, onClose }) {
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const isModal = Boolean(onClose);

  const cardContent = (
    <div className={`relative w-full max-w-4xl bg-white rounded-3xl ${isModal ? 'shadow-2xl my-auto' : 'shadow-xl'} border border-amber-100 p-6 sm:p-10 transition-all animate-in fade-in zoom-in-95 duration-200`}>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 pt-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-bold mb-4 shadow-sm">
          <Sparkles size={16} className="text-amber-600 animate-pulse" />
          <span>{isRtl ? 'اختر مسار التخطيط المناسب لك' : 'Choose Your Planning Path'}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          {isRtl ? 'كيف ترغب في استخدام تطبيق مراسيم؟' : 'How Would You Like to Use Maraseem?'}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          {isRtl
            ? 'صممنا المنصة لتخدم الأفراد في زفافهم الخاص، وكذلك اللجان والجمعيات في إدارة وتنظيم الأعراس الجماعية الكبرى.'
            : 'Our platform is tailored to empower both individual couples for personal weddings and community committees for grand mass weddings.'}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">

        {/* Card 1: Individual Wedding */}
        <div
          onClick={() => onSelectMode('individual')}
          className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl border-2 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${currentMode === 'individual'
            ? 'border-rose-500 bg-rose-50/40 ring-4 ring-rose-100'
            : 'border-gray-200 bg-white hover:border-rose-300 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/20'
            }`}
        >
          <div>
            {/* Icon & Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
                <Heart size={28} className="fill-white/20 stroke-white" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-700">
                {isRtl ? 'للعرسان والعائلات' : 'Couples & Families'}
              </span>
            </div>

            {/* Title & Desc */}
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 group-hover:text-rose-700 transition-colors">
              {isRtl ? '👰 زواج فردي (شخصي)' : '👰 Individual Wedding'}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {isRtl
                ? 'تخطيط زفاف شخصي لعريس وعروسة، ومتابعة قائمة الضيوف العائليين، والميزانية الخاصة، وتفاصيل الفعاليات كالحناء والمخدرة والصبحة.'
                : 'Complete personal wedding planning for one couple: track your guest list, personal budget, ceremony timeline, and local vendors.'}
            </p>

            {/* Features List */}
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-rose-500 shrink-0" />
                <span>{isRtl ? 'ملف خاص للعريس والعروس وتاريخ الزفاف' : 'Dedicated Groom & Bride Profile & Countdown'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-rose-500 shrink-0" />
                <span>{isRtl ? 'إدارة قائمة المعازيم وأهل العريس والعروس' : 'Family Guest List & Digital Invitations'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-rose-500 shrink-0" />
                <span>{isRtl ? 'الميزانية والمصاريف الشخصية والمساعد المالي' : 'Personal Budget & Expense Tracking'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-rose-500 shrink-0" />
                <span>{isRtl ? 'دليل قاعات ومخادر ومصوري حضرموت واليمن' : 'Local Vendors & Wedding Venues Directory'}</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm sm:text-base shadow-md shadow-rose-200 transition-all group-hover:shadow-lg"
          >
            <span>{isRtl ? 'متابعة الزواج الفردي' : 'Continue with Individual'}</span>
            <Arrow size={18} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Mass Wedding */}
        <div
          onClick={() => onSelectMode('mass')}
          className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl border-2 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${currentMode === 'mass'
            ? 'border-amber-500 bg-amber-50/40 ring-4 ring-amber-100'
            : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-gradient-to-b hover:from-white hover:to-amber-50/20'
            }`}
        >
          <div>
            {/* Highlight ribbon */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[11px] font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-md flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>{isRtl ? 'جديد ومخصص للمجتمع' : 'NEW & COMMUNITY DRIVEN'}</span>
            </div>

            {/* Icon & Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                <Users2 size={28} />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                {isRtl ? 'للجان والجمعيات والقبائل' : 'Committees & Organizers'}
              </span>
            </div>

            {/* Title & Desc */}
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
              {isRtl ? '👥 عرس جماعي (خيري / مجتمعي)' : '👥 Community Mass Wedding'}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {isRtl
                ? 'تنظيم حفل زواج جماعي يضم عشرات العرسان، إدارة سجلاتهم، اللجان الميدانية، الرعايات، الوليمة الكبرى، حاسبة التموين، وبرنامج الفعاليات.'
                : 'Manage a large-scale mass wedding: multiple couples roster, organizing committees, sponsors & funds, grand feast rations, and collective ceremonies.'}
            </p>

            {/* Features List */}
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
                <span>{isRtl ? 'سجل العرسان ومتابعة الفحص الطبي والكسوة والمنح' : 'Couples Roster & Medical / Grants Tracking'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
                <span>{isRtl ? 'إدارة اللجان: الاستقبال، الوليمة، النظام، والشرح' : 'Field Committees: Reception, Banquet, Media, Crowd'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
                <span>{isRtl ? 'حاسبة التموين الذكية (ذبائح، عدة الشاهي، وبرادات الماء)' : 'Logistics: Livestock, Tea Kits & Water Dispensers'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
                <span>{isRtl ? 'تتبع الرعايات والتبرعات ومساعد الذكاء الاصطناعي للخطب' : 'Sponsors, Collective Budget & AI Speech Assistant'}</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base shadow-md shadow-amber-200 transition-all group-hover:shadow-lg"
          >
            <span>{isRtl ? 'الدخول للزواج الجماعي' : 'Launch Mass Wedding Plan'}</span>
            <Arrow size={18} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer info & close if modal */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
        <p className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>{isRtl ? 'يمكنك التبديل بين الزواج الفردي والجماعي في أي وقت من الشريط العلوي دون فقدان بياناتك.' : 'You can switch between modes at any time from the top bar without losing data.'}</span>
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition font-bold"
          >
            {isRtl ? 'إغلاق ومتابعة الوضع الحالي' : 'Close & Keep Current'}
          </button>
        )}
      </div>

    </div>
  );

  // If used as a modal popup
  if (isModal) {
    return (
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md p-4 sm:p-6 flex justify-center items-start py-8 sm:py-12"
      >
        {cardContent}
      </div>
    );
  }

  // If used as the main page on initial setup
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="w-full max-w-4xl mx-auto py-2 sm:py-6">
      {cardContent}
    </div>
  );
}
