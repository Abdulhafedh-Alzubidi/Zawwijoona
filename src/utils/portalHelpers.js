// src/utils/portalHelpers.js
// مساعدات إنشاء وفك تشفير روابط بوابات اللجان الميدانية والمزامنة السحابية العامة
import { doc, setDoc, getDoc } from 'firebase/firestore';

// رابط نقي وموجز جداً لضمان رمز QR سريع المسح وواضح على أي كاميرا هاتف
export function getCleanCommitteePortalUrl(committee) {
  const baseUrl = window.location.origin + window.location.pathname;
  if (!committee) return baseUrl;
  return `${baseUrl}?portal=committee&committeeId=${encodeURIComponent(committee.id)}`;
}

// رابط مع كود بيانات مضغوط ذاتي التشغيل (يعمل بدون حساب وبدون إنترنت)
export function getEncodedCommitteePortalUrl(committee, weddingInfo = {}) {
  const baseUrl = window.location.origin + window.location.pathname;
  if (!committee) return baseUrl;

  try {
    const compactData = {
      id: committee.id,
      name: committee.name || '',
      leader: committee.leader || '',
      phone: committee.phone || '',
      location: committee.location || '',
      tasks: (committee.tasks && committee.tasks.length > 0)
        ? committee.tasks.map((t) => ({ id: t.id, text: t.text, completed: !!t.completed }))
        : (committee.responsibilities || []).map((r, i) => ({ id: `t-${i}`, text: r, completed: false })),
      members: (committee.members || []).map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role || '',
        phone: m.phone || '',
      })),
      weddingTitle: weddingInfo?.title || 'العرس الجماعي الخيري',
      weddingDate: weddingInfo?.date || '',
      organizer: weddingInfo?.organizer || 'اللجنة العليا المنظمة',
    };

    const jsonStr = JSON.stringify(compactData);
    const b64 = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );

    return `${baseUrl}?portal=committee&committeeId=${encodeURIComponent(committee.id)}&cdata=${encodeURIComponent(b64)}`;
  } catch (err) {
    console.error('Failed to encode committee data for URL:', err);
    return getCleanCommitteePortalUrl(committee);
  }
}

// الرابط الرئيسي المستخدم للمشاركة والمزامنة
export function generateCommitteePortalUrl(committee, weddingInfo = {}) {
  // تخزين محلي فوري
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

  // إرجاع الرابط مع الكود المشفر الذاتي لضمان العمل 100% بدون حساب
  return getEncodedCommitteePortalUrl(committee, weddingInfo);
}

// فك تشفير البيانات المشفرة ذاتياً داخل الرابط
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

// نشر بيانات اللجنة إلى قاعدة البيانات السحابية العامة للقراءة المفتوحة
export async function syncCommitteeToPublicFirestore(db, committee, weddingInfo = {}) {
  if (!db || !committee || !committee.id) return;
  try {
    const publicDocRef = doc(db, 'public_committees', committee.id);
    const payload = {
      id: committee.id,
      name: committee.name || '',
      nameEn: committee.nameEn || '',
      leader: committee.leader || '',
      phone: committee.phone || '',
      location: committee.location || '',
      tasks: (committee.tasks && committee.tasks.length > 0)
        ? committee.tasks
        : (committee.responsibilities || []).map((r, i) => ({ id: `t-${i}`, text: r, completed: false })),
      members: committee.members || [],
      weddingTitle: weddingInfo?.title || 'العرس الجماعي الخيري',
      weddingDate: weddingInfo?.date || '',
      organizer: weddingInfo?.organizer || 'اللجنة العليا المنظمة',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(publicDocRef, payload, { merge: true });
  } catch (err) {
    console.warn('Could not sync to public_committees in Firestore:', err);
  }
}

// جلب بيانات اللجنة من السحاب العام للقراءة بدون حساب
export async function fetchCommitteeFromPublicFirestore(db, committeeId) {
  if (!db || !committeeId) return null;
  try {
    const publicDocRef = doc(db, 'public_committees', committeeId);
    const snapshot = await getDoc(publicDocRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
  } catch (err) {
    console.warn('Could not fetch from public_committees:', err);
  }
  return null;
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
