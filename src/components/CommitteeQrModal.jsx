import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  QrCode as QrIcon,
  ExternalLink,
  Printer,
  Sparkles,
  FileImage,
} from 'lucide-react';
import {
  getCleanCommitteePortalUrl,
  downloadDataUrlAsBlob,
} from '../utils/portalHelpers';

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

  // Always use the clean short URL so the QR code is crisp and instant to scan
  const targetUrl = committee ? getCleanCommitteePortalUrl(committee) : portalUrl;

  useEffect(() => {
    if (!isOpen || !targetUrl) return;

    let isMounted = true;
    setGenerating(true);

    // Using Medium error correction with 360px creates a clean, large-block QR code
    QRCode.toDataURL(targetUrl, {
      width: 360,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
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
  }, [isOpen, targetUrl]);

  if (!isOpen || !committee) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Download raw QR Code PNG
  const handleDownloadQrOnly = () => {
    if (!qrDataUrl) return;
    downloadDataUrlAsBlob(qrDataUrl, `QR-${committee.name || 'committee'}.png`);
  };

  // Download printable / savable branded badge card
  const handleDownloadCard = () => {
    if (!qrDataUrl || !committee) return;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 760);

    // Top header banner
    const gradient = ctx.createLinearGradient(0, 0, 600, 0);
    gradient.addColorStop(0, '#1d4ed8');
    gradient.addColorStop(0.5, '#312e81');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 135);

    // Header text
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(weddingTitle || 'العرس الجماعي الخيري', 300, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.fillText(committee.name || 'اللجنة الميدانية', 300, 96);

    // Instruction Subtitle
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText('امسح بكاميرا الهاتف للوصول إلى بوابة اللجنة والمهام', 300, 172);

    // QR Image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 130, 195, 340, 340);

      // Frame around QR
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.strokeRect(125, 190, 350, 350);

      // Supervisor info box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(50, 565, 500, 110);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(50, 565, 500, 110);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('المشرف الميداني المسؤول', 300, 598);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      const leaderStr = `${committee.leader || 'مشرف اللجنة'}${committee.phone ? ' (' + committee.phone + ')' : ''}`;
      ctx.fillText(leaderStr, 300, 638);

      if (committee.location) {
        ctx.fillStyle = '#64748b';
        ctx.font = '13px system-ui, -apple-system, sans-serif';
        ctx.fillText(`موقع التمركز: ${committee.location}`, 300, 662);
      }

      // Footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillText('منظومة مراسيم الذكية لإدارة وتنظيم الأعراس الجماعية', 300, 725);

      const cardDataUrl = canvas.toDataURL('image/png');
      downloadDataUrlAsBlob(cardDataUrl, `بطاقة_باركود_${committee.name || 'committee'}.png`);
    };
    img.src = qrDataUrl;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=700,height=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>طباعة رمز وبطاقة: ${committee.name}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 30px; background: #fff; }
            .card { max-width: 450px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 20px; overflow: hidden; }
            .header { background: #0f172a; color: white; padding: 20px; }
            .title { color: #f59e0b; font-size: 16px; font-weight: bold; }
            .name { font-size: 24px; font-weight: 900; margin-top: 5px; }
            .qr-wrap { padding: 25px; background: white; }
            .qr-wrap img { width: 260px; height: 260px; }
            .meta { background: #f8fafc; padding: 15px; border-top: 1px solid #e2e8f0; }
            .meta p { margin: 5px 0; font-size: 14px; }
            .lead { font-weight: bold; color: #0f172a; font-size: 16px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="title">${weddingTitle}</div>
              <div class="name">${committee.name}</div>
            </div>
            <div class="qr-wrap">
              <img src="${qrDataUrl}" alt="QR Code" />
              <p style="font-size: 12px; color: #64748b; margin-top: 10px;">امسح بكاميرا الجوال للدخول المباشر إلى بوابة اللجنة</p>
            </div>
            <div class="meta">
              <p style="color: #b45309; font-weight: bold; font-size: 12px;">المشرف المسؤول:</p>
              <p class="lead">${committee.leader || '—'} ${committee.phone ? '(' + committee.phone + ')' : ''}</p>
              ${committee.location ? `<p style="color: #64748b;">📍 ${committee.location}</p>` : ''}
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const cleanPhone = (committee.phone || '').replace(/[^0-9]/g, '');
  const whatsAppMessage = encodeURIComponent(
    `السلام عليكم ورحمة الله،\nأخي المشرف الكريم / ${committee.leader || ''}\n\nإليك رابط بوابة لجنتكم الميدانية (${committee.name}) في ${weddingTitle}:\n${targetUrl}\n\nيرجى مشاركة الرابط مع أعضاء لجنتك للاطلاع على التوجيهات والمهام والتواصل المباشر.`
  );
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${whatsAppMessage}`
    : `https://api.whatsapp.com/send?text=${whatsAppMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 flex flex-col max-h-[95vh] overflow-y-auto"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
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
        <div className="p-6 space-y-4 text-center">
          {/* Info pill */}
          <div className="bg-amber-50 text-amber-900 border border-amber-200/80 rounded-2xl p-3 text-xs leading-relaxed text-right">
            <span className="font-bold">💡 مسح فوري بالكاميرا:</span> تم ضبط الرمز برابط نقي ومباشر ليمسحه أي هاتف خلال أجزاء من الثانية دون تسجيل دخول.
          </div>

          {/* QR Display */}
          <div className="bg-white p-3 rounded-3xl border-2 border-slate-200 inline-block mx-auto shadow-md">
            {generating ? (
              <div className="w-56 h-56 flex items-center justify-center text-gray-400 text-sm">
                جاري توليد الرمز...
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${committee.name}`}
                className="w-52 h-52 sm:w-60 sm:h-60 object-contain mx-auto"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-red-500 text-xs">
                تعذر توليد الرمز
              </div>
            )}
          </div>

          {/* Committee Info details */}
          <div className="text-xs text-gray-600 space-y-0.5">
            <p className="font-black text-gray-900 text-sm">{committee.name}</p>
            {committee.leader && (
              <p>
                <span className="text-gray-400">المشرف المسؤول: </span>
                <strong className="text-gray-900">{committee.leader}</strong>
                {committee.phone && <span className="text-gray-500"> ({committee.phone})</span>}
              </p>
            )}
            {committee.location && (
              <p className="text-[11px] text-gray-500">📍 موقع التمركز: {committee.location}</p>
            )}
          </div>

          {/* Direct link input */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-xl border border-gray-200 text-xs">
            <input
              type="text"
              readOnly
              value={targetUrl}
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

          {/* Download & Print Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadCard}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
              title="تحميل بطاقة تعريفية كاملة تحتوي الشعار والاسم والباركود جاهزة للطباعة"
            >
              <FileImage size={15} />
              <span>{isRtl ? 'تحميل بطاقة الباركود' : 'Download Card'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQrOnly}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
              title="تحميل ملف الرمز المربع فقط"
            >
              <Download size={15} />
              <span>{isRtl ? 'تحميل الرمز فقط (PNG)' : 'Download QR'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm transition"
            >
              <Printer size={15} />
              <span>{isRtl ? 'طباعة مباشرة' : 'Print Badge'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition"
            >
              <Share2 size={15} />
              <span>{isRtl ? 'إرسال لواتساب' : 'WhatsApp'}</span>
            </a>
          </div>

          <a
            href={targetUrl}
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
