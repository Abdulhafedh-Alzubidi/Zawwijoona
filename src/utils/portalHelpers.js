// src/utils/portalHelpers.js
// مساعدات إنشاء وفك تشفير روابط بوابات اللجان الميدانية المتوافقة مع اللغة العربية

export function generateCommitteePortalUrl(committee, weddingInfo = {}) {
  const baseUrl = window.location.origin + window.location.pathname;
  if (!committee) return baseUrl;

  try {
    const compactData = {
      id: committee.id,
      name: committee.name,
      nameEn: committee.nameEn || '',
      leader: committee.leader || '',
      phone: committee.phone || '',
      location: committee.location || '',
      tasks: (committee.tasks && committee.tasks.length > 0)
        ? committee.tasks
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
    // Safe UTF-8 to Base64
    const b64 = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );

    return `${baseUrl}?portal=committee&committeeId=${encodeURIComponent(committee.id)}&cdata=${encodeURIComponent(b64)}`;
  } catch (err) {
    console.error('Failed to generate portal URL with cdata:', err);
    return `${baseUrl}?portal=committee&committeeId=${encodeURIComponent(committee.id)}`;
  }
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
