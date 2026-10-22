// src/data/massWeddingTemplates.js
// بيانات ونماذج وحسابات الأعراس الجماعية (Maraseem Mass Wedding Architecture)

// --- الإعدادات والمعدلات الافتراضية للحاسبة الذكية (قابلة للتعديل من المنظمين) ---
export const DEFAULT_CALCULATOR_RATES = {
  // الحضور
  guestsPerCouple: 35, // متوسط عدد المعازيم لكل عريس
  vipGuests: 0, // ضيوف الشرف واللجان والوجهاء (فارغة وتبدأ من 0)

  // 1. الوليمة واللحوم
  sheepMode: 'ratio', // 'ratio' | 'fixed'
  guestsPerSheep: 16, // عدد الأشخاص لكل رأس غنم / ذبيحة
  fixedSheepCount: '', // كمية مقطوعة ثابتة

  meatMode: 'ratio',
  meatKilosPerSheep: 13, // صافي اللحم المقدر لكل ذبيحة (كجم)
  fixedMeatKilos: '',

  riceMode: 'ratio',
  guestsPerRiceBag40kg: 150, // عدد الأشخاص لكل كيس أرز بسمتي 40 كجم
  fixedRiceBags: '',

  oilMode: 'ratio',
  cookingOilPerRiceBag: 1.5, // كراتين الزيت والسمن لكل كيس أرز
  fixedOilCartons: '',

  spicesMode: 'ratio',
  spicesPerSheepKg: 1.2, // كجم بهارات مشكلة لكل ذبيحة
  fixedSpicesKg: '',

  // 2. ضيافة الشاهي وفريق عدة الشاي والسموار
  teaTeamMode: 'ratio',
  guestsPerTeaMember: 70, // عدد الضيوف لكل فرد في فريق عدة الشاي (صبابين ومعدين)
  fixedTeaTeamSize: '',

  samovarsMode: 'ratio',
  guestsPerSamovar: 250, // عدد الضيوف لكل سموار تخدير كبير
  fixedSamovarsCount: '',

  servingKettlesMode: 'ratio',
  guestsPerServingKettle: 60, // عدد الضيوف لكل دلة / براد صب متنقل
  fixedServingKettles: '',

  sugarMode: 'ratio',
  guestsPerSugarBag50kg: 400, // عدد الضيوف لكل كيس سكر 50 كجم
  fixedSugarBags: '',

  teaLeavesMode: 'ratio',
  teaKgPerGuest: 0.025, // كجم شاي سيلاني فاخر لكل ضيف
  fixedTeaLeavesKg: '',

  teaCupsMode: 'ratio',
  teaCupsMultiplier: 1.5, // فناجين واستكانات الشاي لكل ضيف
  fixedTeaCups: '',

  teaTraysMode: 'ratio',
  guestsPerTeaTray: 50, // عدد الضيوف لكل صينية توزيع الشاي
  fixedTeaTrays: '',

  charcoalMode: 'ratio',
  charcoalBagsPerSamovar: 2.5, // أكياس الفحم الطبيعي لكل سموار
  fixedCharcoalBags: '',

  // 3. سقيا الماء البارد
  waterDispensersMode: 'ratio',
  guestsPerWaterDispenser: 75, // عدد الضيوف لكل براد / ترمس ماء كبير سعة 60-80 لتر
  fixedWaterDispensers: '',

  iceBlocksMode: 'ratio',
  iceBlocksPerDispenser: 3, // عدد قوالب الثلج المقررة لكل براد طوال اليوم
  fixedIceBlocks: '',

  bottledWaterMode: 'ratio',
  guestsPerBottledCarton: 25, // عدد الضيوف لكل كرتون مياه شرب معبأة مبردة
  fixedBottledWaterCartons: '',

  cupsMode: 'ratio',
  cupsPerGuestMultiplier: 2.0, // عدد أكواب الشرب لكل ضيف
  fixedCups: '',

  // 4. المخادر والخيام والفرش
  carpetsMode: 'ratio',
  guestsPerCarpet: 11, // عدد الضيوف لكل سجادة تقليدية (4×3 م)
  fixedCarpets: '',

  tentsMode: 'ratio',
  tentsSqMetersPerGuest: 1.4, // مساحة المظلات والخيام بالمتر المربع لكل ضيف
  fixedTentsArea: '',

  fansMode: 'ratio',
  guestsPerCoolerFan: 50, // عدد الضيوف لكل مروحة رذاذ وتبريد
  fixedFans: ''
};

// مواد ومؤن افتراضية إضافية - فارغة تماماً لتبدأ من الصفر حسب إضافة المنظم
export const DEFAULT_CUSTOM_LOGISTICS_ITEMS = [];

// اللجان الميدانية الافتراضية للعرس الجماعي (14 لجنة تنظيمية ميدانية)
export const DEFAULT_MASS_WEDDING_COMMITTEES = [
  {
    id: "com-hall-women",
    name: "لجنة الصالة (النساء)",
    nameEn: "Women's Hall Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-saman-washing",
    name: "لجنة السامان والتغسيل",
    nameEn: "Supplies & Dishwashing Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-aqd",
    name: "لجنة العقد",
    nameEn: "Marriage Contract (Aqd) Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-dinner-distribution",
    name: "لجنة توزيع العشاء",
    nameEn: "Dinner Distribution Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-order-security",
    name: "لجنة النظام",
    nameEn: "Order & Protocol Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-carpets-venue",
    name: "لجنة الفرش وساحة الزواج",
    nameEn: "Carpets & Venue Setup Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-cold-water",
    name: "لجنة الماء البارد",
    nameEn: "Cold Water & Hydration Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-washbasins",
    name: "لجنة المغاسيل",
    nameEn: "Washing Stations Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-couples-care",
    name: "لجنة العرسان",
    nameEn: "Couples Care Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-slaughter-meat",
    name: "لجنة الذبح واللحوم",
    nameEn: "Slaughter & Meat Preparation Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-feast-cooking",
    name: "لجنة طبخ الوليمة",
    nameEn: "Feast Cooking Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-stage-av",
    name: "لجنة المسرح وتجهيزه",
    nameEn: "Stage & AV Setup Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-media",
    name: "لجنة الاعلام",
    nameEn: "Media & Coverage Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  },
  {
    id: "com-health-firstaid",
    name: "لجنة الصحة والاسعاف",
    nameEn: "Health & First Aid Committee",
    leader: "",
    phone: "",
    volunteersCount: "",
    responsibilities: [],
    tasks: [],
    members: []
  }
];

// قالب العرس الجماعي النظيف الجديد
export const DEFAULT_MASS_WEDDING_DATA = {
  info: {
    title: "",
    titleEn: "",
    organizer: "",
    organizerEn: "",
    location: "",
    locationEn: "",
    city: "",
    cityEn: "",
    date: "",
    targetCouples: "",
    estimatedTotalBudget: "",
    currency: "ريال يمني",
    currencyEn: "YER",
    guestQuotaPerCouple: 35,
    notes: "",
    isConfigured: false
  },
  couples: [],
  grooms: [],
  brides: [],
  committees: DEFAULT_MASS_WEDDING_COMMITTEES.map(c => ({ ...c })),
  sponsorships: [],
  expenses: [],
  schedule: [],
  calculatorSettings: {
    rates: DEFAULT_CALCULATOR_RATES,
    customItems: []
  }
};

// --- حاسبة التموين والوليمة الكبرى واللوجستيات (مبنية بدقة على حاصل جمع ضيوف العرسان والعرائس) ---
export function calculateMassWeddingLogistics(
  couplesOrCount,
  weddingInfo = {},
  customRates = null,
  customItems = []
) {
  // دمج المعدلات المخصصة مع الافتراضية
  const rates = { ...DEFAULT_CALCULATOR_RATES, ...(customRates || {}) };

  // 1. حساب إجمالي عدد الضيوف الفعلي عبر جمع كوتة كل عريس وعروس مسجلين
  let couplesGuests = 0;
  let couplesCount = 0;

  if (Array.isArray(couplesOrCount)) {
    couplesCount = couplesOrCount.length;
    if (couplesCount > 0) {
      couplesGuests = couplesOrCount.reduce((sum, c) => {
        const quota = c.guestQuota !== undefined && c.guestQuota !== '' && c.guestQuota !== null
          ? Number(c.guestQuota)
          : (Number(weddingInfo?.guestQuotaPerCouple) || 0);
        return sum + (Number.isNaN(quota) ? 0 : quota);
      }, 0);
    } else if (weddingInfo?.targetCouples && weddingInfo?.guestQuotaPerCouple) {
      couplesCount = Number(weddingInfo.targetCouples) || 0;
      couplesGuests = (Number(weddingInfo.targetCouples) || 0) * (Number(weddingInfo.guestQuotaPerCouple) || 0);
    }
  } else if (couplesOrCount && typeof couplesOrCount === 'object' && (couplesOrCount.grooms || couplesOrCount.brides || couplesOrCount.couples)) {
    const gList = couplesOrCount.grooms || [];
    const bList = couplesOrCount.brides || [];
    const legacyCouples = couplesOrCount.couples || [];

    if (gList.length > 0 || bList.length > 0) {
      couplesCount = Math.max(gList.length, bList.length);
      const sumList = (list) => list.reduce((sum, item) => {
        const q = item.guestQuota !== undefined && item.guestQuota !== '' && item.guestQuota !== null
          ? Number(item.guestQuota)
          : (Number(weddingInfo?.guestQuotaPerCouple) || 0);
        return sum + (Number.isNaN(q) ? 0 : q);
      }, 0);
      couplesGuests = sumList(gList) + sumList(bList);
    } else if (legacyCouples.length > 0) {
      couplesCount = legacyCouples.length;
      couplesGuests = legacyCouples.reduce((sum, c) => {
        const quota = c.guestQuota !== undefined && c.guestQuota !== '' && c.guestQuota !== null
          ? Number(c.guestQuota)
          : (Number(weddingInfo?.guestQuotaPerCouple) || 0);
        return sum + (Number.isNaN(quota) ? 0 : quota);
      }, 0);
    } else if (weddingInfo?.targetCouples && weddingInfo?.guestQuotaPerCouple) {
      couplesCount = Number(weddingInfo.targetCouples) || 0;
      couplesGuests = (Number(weddingInfo.targetCouples) || 0) * (Number(weddingInfo.guestQuotaPerCouple) || 0);
    }
  } else if (typeof couplesOrCount === 'number' || !Number.isNaN(Number(couplesOrCount))) {
    couplesCount = Number(couplesOrCount) || 0;
    couplesGuests = couplesCount * (Number(weddingInfo?.guestQuotaPerCouple) || Number(rates.guestsPerCouple) || 0);
  }

  const vipGuests = Number(rates.vipGuests) || 0;
  const totalGuests = couplesGuests + vipGuests;

  // إذا كان إجمالي الضيوف 0: تصبح كافة القيم التناسبية صفر / فارغة
  const hasGuests = totalGuests > 0;

  // 1. حساب الذبائح واللحوم والأرز
  const sheepCount = rates.sheepMode === 'fixed'
    ? (rates.fixedSheepCount !== '' ? Number(rates.fixedSheepCount) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerSheep || 16)) : 0);

  const meatKilosApprox = rates.meatMode === 'fixed'
    ? (rates.fixedMeatKilos !== '' ? Number(rates.fixedMeatKilos) : 0)
    : sheepCount * (rates.meatKilosPerSheep || 13);

  const riceBags40kg = rates.riceMode === 'fixed'
    ? (rates.fixedRiceBags !== '' ? Number(rates.fixedRiceBags) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerRiceBag40kg || 150)) : 0);

  const cookingOilCartons = rates.oilMode === 'fixed'
    ? (rates.fixedOilCartons !== '' ? Number(rates.fixedOilCartons) : 0)
    : (riceBags40kg > 0 ? Math.ceil(riceBags40kg * (rates.cookingOilPerRiceBag || 1.5)) : 0);

  const spicesKilos = rates.spicesMode === 'fixed'
    ? (rates.fixedSpicesKg !== '' ? Number(rates.fixedSpicesKg) : 0)
    : (sheepCount > 0 ? Math.ceil(sheepCount * (rates.spicesPerSheepKg || 1.2)) : 0);

  // 2. ضيافة الشاهي الحضرمي وفريق عدة الشاي والسموار
  const teaTeamMembersCount = rates.teaTeamMode === 'fixed'
    ? (rates.fixedTeaTeamSize !== '' ? Number(rates.fixedTeaTeamSize) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerTeaMember || 70)) : 0);

  const samovarsCount = rates.samovarsMode === 'fixed'
    ? (rates.fixedSamovarsCount !== '' ? Number(rates.fixedSamovarsCount) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerSamovar || 250)) : 0);

  const teaServingKettlesCount = rates.servingKettlesMode === 'fixed'
    ? (rates.fixedServingKettles !== '' ? Number(rates.fixedServingKettles) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerServingKettle || 60)) : 0);

  const teaSugarBags50kg = rates.sugarMode === 'fixed'
    ? (rates.fixedSugarBags !== '' ? Number(rates.fixedSugarBags) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerSugarBag50kg || 400)) : 0);

  const teaBoxesKilograms = rates.teaLeavesMode === 'fixed'
    ? (rates.fixedTeaLeavesKg !== '' ? Number(rates.fixedTeaLeavesKg) : 0)
    : (hasGuests ? Math.ceil(totalGuests * (rates.teaKgPerGuest || 0.025)) : 0);

  const teaCupsCount = rates.teaCupsMode === 'fixed'
    ? (rates.fixedTeaCups !== '' ? Number(rates.fixedTeaCups) : 0)
    : (hasGuests ? Math.ceil(totalGuests * (rates.teaCupsMultiplier || 1.5)) : 0);

  const teaTraysCount = rates.teaTraysMode === 'fixed'
    ? (rates.fixedTeaTrays !== '' ? Number(rates.fixedTeaTrays) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerTeaTray || 50)) : 0);

  const charcoalBags = rates.charcoalMode === 'fixed'
    ? (rates.fixedCharcoalBags !== '' ? Number(rates.fixedCharcoalBags) : 0)
    : (samovarsCount > 0 ? Math.ceil(samovarsCount * (rates.charcoalBagsPerSamovar || 2.5)) : 0);

  // 3. برادات وترامس المياه الباردة
  const largeWaterDispensersCount = rates.waterDispensersMode === 'fixed'
    ? (rates.fixedWaterDispensers !== '' ? Number(rates.fixedWaterDispensers) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerWaterDispenser || 75)) : 0);

  const iceBlocksCount = rates.iceBlocksMode === 'fixed'
    ? (rates.fixedIceBlocks !== '' ? Number(rates.fixedIceBlocks) : 0)
    : (largeWaterDispensersCount > 0 ? largeWaterDispensersCount * (rates.iceBlocksPerDispenser || 3) : 0);

  const bottledWaterCartons = rates.bottledWaterMode === 'fixed'
    ? (rates.fixedBottledWaterCartons !== '' ? Number(rates.fixedBottledWaterCartons) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerBottledCarton || 25)) : 0);

  const cupsCount = rates.cupsMode === 'fixed'
    ? (rates.fixedCups !== '' ? Number(rates.fixedCups) : 0)
    : (hasGuests ? Math.ceil(totalGuests * (rates.cupsPerGuestMultiplier || 2.0)) : 0);

  // 4. المخادر والفرش
  const carpetsCount = rates.carpetsMode === 'fixed'
    ? (rates.fixedCarpets !== '' ? Number(rates.fixedCarpets) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerCarpet || 11)) : 0);

  const tentsAreaSqMeters = rates.tentsMode === 'fixed'
    ? (rates.fixedTentsArea !== '' ? Number(rates.fixedTentsArea) : 0)
    : (hasGuests ? Math.ceil(totalGuests * (rates.tentsSqMetersPerGuest || 1.4)) : 0);

  const fansOrCoolersCount = rates.fansMode === 'fixed'
    ? (rates.fixedFans !== '' ? Number(rates.fixedFans) : 0)
    : (hasGuests ? Math.ceil(totalGuests / (rates.guestsPerCoolerFan || 50)) : 0);

  // 5. حساب المواد الإضافية المخصصة
  // المواد غير المحددة أو غير المرتبطة بضيوف تظل null حتى يتم تحديد نسبتها أو كميتها
  const computedCustomItems = (customItems || []).map((item) => {
    let computedQuantity = null;
    if (item.rateType === "ratio") {
      if (Number(item.ratio) > 0 && hasGuests) {
        computedQuantity = Math.ceil(totalGuests / Number(item.ratio));
      } else {
        computedQuantity = null;
      }
    } else {
      if (item.fixedAmount !== undefined && item.fixedAmount !== '' && item.fixedAmount !== null) {
        computedQuantity = Number(item.fixedAmount);
      } else {
        computedQuantity = null;
      }
    }
    return {
      ...item,
      computedQuantity
    };
  });

  return {
    totalGuests,
    couplesGuests,
    couplesCount,
    vipGuests,
    rates,
    food: {
      sheepCount,
      meatKilosApprox,
      riceBags40kg,
      cookingOilCartons,
      spicesKilos
    },
    teaHospitality: {
      teamSize: teaTeamMembersCount,
      samovarsCount,
      brewingPots: samovarsCount,
      servingKettles: teaServingKettlesCount,
      teaTraysCount,
      teaCupsCount,
      glassesCount: teaCupsCount,
      sugarBags50kg: teaSugarBags50kg,
      teaLeavesKg: teaBoxesKilograms,
      charcoalBags
    },
    hydration: {
      largeDispensers: largeWaterDispensersCount,
      iceBlocks: iceBlocksCount,
      bottledWaterCartons,
      cupsCount
    },
    venueLogistics: {
      carpetsCount,
      tentsAreaSqMeters,
      fansOrCoolersCount
    },
    customSupplies: computedCustomItems
  };
}
