import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, Share2, QrCode as QrIcon, ExternalLink } from 'lucide-react';

export default function CommitteeQrModal({
  isOpen,
  onClose,
  committee,
  weddingTitle = 'العرس الجماعي',
  portalUrl = '',
  isRtl = true,
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen || !portalUrl) return;

    let isMounted = true;
    setGenerating(true);

    QRCode.toDataURL(portalUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        if (isMounted) setGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, portalUrl]);

  if (!isOpen || !committee) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR-${committee.name || 'committee'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cleanPhone = (committee.phone || '').replace(/[^0-9]/g, '');
  const whatsAppMessage = encodeURIComponent(
    `السلام عليكم ورحمة الله،\nأخي المشرف الكريم / ${committee.leader || ''}\n\nإليك رابط بوابة لجنتكم الميدانية (${committee.name}) في ${weddingTitle}:\n${portalUrl}\n\nيرجى مشاركة الرابط مع أعضاء لجنتك للاطلاع على التوجيهات والمهام والتواصل المباشر.`
  );
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${whatsAppMessage}`
    : `https://api.whatsapp.com/send?text=${whatsAppMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 flex flex-col"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
              <QrIcon size={22} />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">
                {isRtl ? 'رمز QR وبوابة اللجنة الميدانية' : 'Committee Portal QR Code'}
              </h3>
              <p className="text-xs text-blue-200">{committee.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          {/* Info pill */}
          <div className="bg-amber-50 text-amber-900 border border-amber-200/80 rounded-2xl p-3 text-xs leading-relaxed text-right">
            <span className="font-bold">💡 مسح سريع بالكاميرا:</span> يمكن للمشرف وأعضاء اللجنة مسح هذا الرمز بكاميرا الهاتف لفتح بوابة اللجنة ومهامها وأرقام التواصل فوراً دون تسجيل دخول.
          </div>

          {/* QR Display */}
          <div className="bg-slate-50 p-4 rounded-3xl border border-gray-200 inline-block mx-auto shadow-inner">
            {generating ? (
              <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">
                جاري توليد الرمز...
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${committee.name}`}
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl mx-auto shadow-sm"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-red-500 text-xs">
                تعذر توليد الرمز
              </div>
            )}
          </div>

          {/* Committee Info details */}
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-bold text-gray-800 text-sm">{committee.name}</p>
            {committee.leader && (
              <p>
                <span className="text-gray-400">المشرف المسؤول: </span>
                <strong className="text-gray-900">{committee.leader}</strong>
                {committee.phone && <span className="text-gray-500"> ({committee.phone})</span>}
              </p>
            )}
          </div>

          {/* Direct link input */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-xl border border-gray-200 text-xs">
            <input
              type="text"
              readOnly
              value={portalUrl}
              className="bg-transparent text-gray-600 text-xs flex-1 outline-none px-2 font-mono truncate"
              dir="ltr"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-300 font-bold transition flex items-center gap-1 shrink-0"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
            >
              <Download size={15} />
              <span>{isRtl ? 'تحميل الرمز كصورة (PNG)' : 'Download QR'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
            >
              <Share2 size={15} />
              <span>{isRtl ? 'إرسال للمشرف بواتساب' : 'Send via WhatsApp'}</span>
            </a>
          </div>

          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold pt-1"
          >
            <ExternalLink size={13} />
            <span>{isRtl ? 'فتح الرابط في نافذة جديدة للمعاينة' : 'Open in new tab'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
