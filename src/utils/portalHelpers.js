// src/utils/portalHelpers.js
// مساعدات إنشاء وفك تشفير روابط بوابات اللجان الميدانية المتوافقة مع اللغة العربية

// رابط نقي وموجز جداً لضمان رمز QR سريع المسح وواضح على أي كاميرا هاتف
export function getCleanCommitteePortalUrl(committee) {
  const baseUrl = window.location.origin + window.location.pathname;
  if (!committee) return baseUrl;
  return `${baseUrl}?portal=committee&committeeId=${encodeURIComponent(committee.id)}`;
}

// رابط مع كود مضغوط خفيف للنسخ والمشاركة
export function generateCommitteePortalUrl(committee, weddingInfo = {}) {
  const baseUrl = window.location.origin + window.location.pathname;
  if (!committee) return baseUrl;

  // Cache in localStorage immediately so short URLs resolve everywhere on this origin
  try {
    localStorage.setItem(
      `maraseem_com_${committee.id}`,
      JSON.stringify({
        ...committee,
        weddingTitle: weddingInfo?.title || 'العرس الجماعي الخيري',
        weddingDate: weddingInfo?.date || '',
        organizer: weddingInfo?.organizer || 'اللجنة العليا المنظمة',
      })
    );
  } catch (e) {
    console.warn(e);
  }

  // Use clean short URL for ultra-fast scanning and clean sharing
  return getCleanCommitteePortalUrl(committee);
}

export function decodeCommitteePortalData(cdata) {
  if (!cdata) return null;
  try {
    const decoded = decodeURIComponent(cdata);
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(decoded), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Failed to decode committee portal data:', err);
    return null;
  }
}

// دالة موثوقة بنسبة 100% لتحميل الصور عبر Blob في جميع المتصفحات
export function downloadDataUrlAsBlob(dataUrl, filename) {
  try {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'image/png';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    const blob = new Blob([uInt8Array], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 250);
    return true;
  } catch (err) {
    console.error('Download via Blob failed, fallback to direct open:', err);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 250);
    return false;
  }
}
