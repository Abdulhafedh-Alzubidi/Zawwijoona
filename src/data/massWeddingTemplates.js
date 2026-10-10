// src/data/massWeddingTemplates.js
// بيانات ونماذج وحسابات الأعراس الجماعية (Maraseem Mass Wedding Templates)

export const DEFAULT_MASS_WEDDING_DATA = {
  info: {
    title: "العرس الجماعي الخيري العاشر",
    titleEn: "10th Community Charitable Mass Wedding",
    organizer: "لجنة تيسير الزواج والعمل الخيري",
    organizerEn: "Marriage Facilitation & Charity Committee",
    location: "ساحة قصر الرند - تريم، حضرموت",
    locationEn: "Al-Rund Palace Grounds - Tarim, Hadhramaut",
    city: "حضرموت",
    cityEn: "Hadhramaut",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    targetCouples: 24,
    estimatedTotalBudget: 18000000, // 18,000,000 YER
    currency: "ريال يمني",
    currencyEn: "YER",
    guestQuotaPerCouple: 35, // متوسط بطاقات الدعوة لكل عريس
    notes: "زواج جماعي تيسيراً للشباب وحفظاً للأعراف والتقاليد الأصيلة."
  },

  // سجل العرسان المشاركين
  couples: [
    {
      id: "c-101",
      groomName: "سالم أحمد بن عبيدالله",
      brideName: "كريمة الشيخ سعيد باوزير",
      tribe: "آل بن عبيدالله",
      area: "تريم - الغرفة",
      phone: "+967 771 234 567",
      medicalStatus: "completed", // 'completed' | 'pending' | 'missing'
      contractStatus: "completed", // 'completed' | 'in_progress' | 'scheduled'
      aidStatus: "delivered", // 'delivered' | 'processing' | 'pending'
      guestQuota: 35,
      notes: "تم استلام الفحص الطبي والبطاقة الشخصية واكتمال الملف."
    },
    {
      id: "c-102",
      groomName: "عبدالله عمر الحداد",
      brideName: "كريمة صالح مسعود",
      tribe: "آل الحداد",
      area: "سيئون - السحيل",
      phone: "+967 772 345 678",
      medicalStatus: "completed",
      contractStatus: "in_progress",
      aidStatus: "delivered",
      guestQuota: 35,
      notes: "بانتظار توثيق عقد القران لدى مأذون الأنكحة."
    },
    {
      id: "c-103",
      groomName: "محمد عبد القادر الكاف",
      brideName: "كريمة علوي بن شهاب",
      tribe: "آل الكاف",
      area: "تريم - الخليف",
      phone: "+967 773 456 789",
      medicalStatus: "completed",
      contractStatus: "completed",
      aidStatus: "processing",
      guestQuota: 40,
      notes: "جاهز للتسليم في الدفعة الثانية من الكسوة."
    },
    {
      id: "c-104",
      groomName: "ياسر فرج باصويطين",
      brideName: "كريمة محفوظ باحميد",
      tribe: "آل باصويطين",
      area: "شبام - الحوطة",
      phone: "+967 774 567 890",
      medicalStatus: "pending",
      contractStatus: "scheduled",
      aidStatus: "processing",
      guestQuota: 30,
      notes: "الفحص الطبي مجدول يوم الأربعاء القادم."
    },
    {
      id: "c-105",
      groomName: "أحمد ربيع التميمي",
      brideName: "كريمة مبارك بن عبدات",
      tribe: "بني تميم",
      area: "تريم - قسم",
      phone: "+967 775 678 901",
      medicalStatus: "completed",
      contractStatus: "completed",
      aidStatus: "delivered",
      guestQuota: 35,
      notes: "الملف مكتمل بنسبة 100%."
    }
  ],

  // اللجان التنظيمية والفرق الميدانية
  committees: [
    {
      id: "com-1",
      name: "لجنة الاستقبال والمراسيم والتشريفات",
      nameEn: "Reception & Protocol Committee",
      leader: "الشيخ فهد بن يماني",
      phone: "+967 770 111 222",
      volunteersCount: 22,
      responsibilities: [
        "استقبال وفود القبائل والوجهاء والضيوف القادمين من خارج المنطقة",
        "تطييب الضيوف بالبخور الحضرمي الفاخر ورش ماء الورد",
        "تنظيم صعود العرسان إلى منصة الشرف الرسمية",
        "توزيع بطاقات الشرف والجلوس في الصفوف الأولى"
      ],
      status: "ready" // 'ready' | 'active' | 'in_progress'
    },
    {
      id: "com-2",
      name: "لجنة الوليمة الكبرى والإطعام",
      nameEn: "Grand Banquet & Catering Committee",
      leader: "المعلم عوض باسليمان (مقدم الولائم)",
      phone: "+967 770 333 444",
      volunteersCount: 45,
      responsibilities: [
        "الإشراف على الذبائح والمسلخ والتقطيع وفق الحصص المقررة",
        "متابعة طهاة الأرز (المندي والكبسة الحضرمية المعتادة في الأعراس)",
        "تجهيز الصواني وتنسيق فرق توزيع الغداء على الضيوف",
        "إدارة مخزن المواد الغذائية والبهارات والسمن"
      ],
      status: "active"
    },
    {
      id: "com-3",
      name: "لجنة الشاهي الحضرمي وفريق الشاهوجية",
      nameEn: "Hadhrami Tea & Hospitality Team",
      leader: "الأستاذ رشيد بن سنكر (كبير الشاهوجية)",
      phone: "+967 770 555 666",
      volunteersCount: 28,
      responsibilities: [
        "تجهيز عدة الشاهي الحضرمي (الكوافير، مواقد الجمر، أواني التخدير)",
        "إعداد الشاهي الأحمر المخدر بالنعناع والشاهي العدني بالحليب طوال اليوم",
        "توزيع دلال وبرادات الشاهي واستكانات الشرب في أرجاء الساحة",
        "متابعة إمدادات السكر والنعناع والفحم الطبيعي"
      ],
      status: "ready"
    },
    {
      id: "com-4",
      name: "لجنة السقيا وبرادات المياه الباردة",
      nameEn: "Cold Water & Hydration Committee",
      leader: "عمر بارجاء",
      phone: "+967 770 777 888",
      volunteersCount: 18,
      responsibilities: [
        "توزيع برادات وترامس المياه الباردة الكبرى في كافة أرجاء الساحة والمخادر",
        "توفير وتعبئة قوالب الثلج بانتظام للحفاظ على برودة الماء",
        "توزيع كراتين عبوات المياه المبردة للمنصة والمخادر المغلقة",
        "مراقبة نظافة نقاط الشرب والأكواب باستمرار"
      ],
      status: "ready"
    },
    {
      id: "com-5",
      name: "لجنة الشرح والتراث والزفة الجماعية",
      nameEn: "Traditional Heritage & Zaffah Committee",
      leader: "عقيل بن حيدرة",
      phone: "+967 770 999 000",
      volunteersCount: 20,
      responsibilities: [
        "التنسيق مع فرق الشرح الحضرمي وشعراء الزوامل والغيّة",
        "تنظيم مسيرة الزفة الجماعية للعرسان بزي الزفاف الموحد",
        "ضبط إيقاع الحفل الفلكلوري ومسار حركة العرسان بين الساحات",
        "تجهيز السيوف والشالات التقليدية للرقصات التراثية"
      ],
      status: "in_progress"
    },
    {
      id: "com-6",
      name: "لجنة النظام وحركة السير واللوجستيات",
      nameEn: "Security, Traffic & Logistics Committee",
      leader: "الكابتن طارق بن طالب",
      phone: "+967 771 000 111",
      volunteersCount: 35,
      responsibilities: [
        "تنظيم مواقف سيارات الوفود والضيوف في الساحات الخارجية",
        "تأمين بوابات الدخول والخروج ومنع الازدحام",
        "فرش الساحات والمخادر بالسجاد والكراسي والتظليل",
        "التنسيق مع شرطة السير المحلية لفتح المسارات"
      ],
      status: "active"
    },
    {
      id: "com-7",
      name: "لجنة الإعلام والتوثيق والبث",
      nameEn: "Media, Streaming & Press Committee",
      leader: "الإعلامي هشام بن حاتم",
      phone: "+967 772 111 222",
      volunteersCount: 14,
      responsibilities: [
        "التصوير الفوتوغرافي والفيديو الاحترافي لكل عريس",
        "البث المباشر لفقرات المهرجان الخطابي والزفة عبر منصات التواصل",
        "التقاط الصور التذكارية الجماعية لكافة العرسان مع اللجان",
        "إعداد التقرير الختامي وتوزيع الأفلام التوثيقية"
      ],
      status: "ready"
    },
    {
      id: "com-8",
      name: "لجنة المالية وكسوة العرسان والهدايا",
      nameEn: "Finance & Groom Gifting Committee",
      leader: "الأمين المالي م. ماجد بن سميط",
      phone: "+967 773 222 333",
      volunteersCount: 8,
      responsibilities: [
        "صرف المنحة المالية المخصصة لكل عريس والمقدمة من الرعاة",
        "تسليم حقيبة كسوة العريس (الزي التقليدي، العطور، المستلزمات)",
        "تسجيل وتوثيق مساهمات وتبرعات أهل الخير والرعاة",
        "إغلاق وتدقيق فواتير الوليمة والتجهيزات"
      ],
      status: "active"
    }
  ],

  // الرعايات والمساهمات والتبرعات
  sponsorships: [
    {
      id: "sp-1",
      sponsorName: "مؤسسة صلة للتنمية",
      type: "رعاية ماسية", // 'رعاية ماسية' | 'رعاية ذهبية' | 'تبرع نقدي' | 'مساهمة عينية'
      typeEn: "Diamond Sponsor",
      amount: 6000000,
      currency: "ريال يمني",
      status: "confirmed", // 'confirmed' | 'pledged'
      contact: "د. عمر بن دحمان",
      notes: "تغطية منحة العرسان النقدية (250,000 ر.ي لكل عريس)."
    },
    {
      id: "sp-2",
      sponsorName: "فاعل خير من آل الكاف (جدة)",
      type: "رعاية ذهبية",
      typeEn: "Gold Sponsor",
      amount: 4000000,
      currency: "ريال يمني",
      status: "confirmed",
      contact: "عبر الشيخ أحمد بافضل",
      notes: "مساهمة مخصصة لكامل مصاريف الذبائح والوليمة الكبرى."
    },
    {
      id: "sp-3",
      sponsorName: "مجموعة بن محفوظ التجارية",
      type: "مساهمة عينية ونقدية",
      typeEn: "In-Kind & Cash",
      amount: 3500000,
      currency: "ريال يمني",
      status: "confirmed",
      contact: "مكتب المكلا",
      notes: "توفير 40 كيس أرز بسمتي فاخر + كسوة العرسان."
    },
    {
      id: "sp-4",
      sponsorName: "جمعية رعاية الأيتام والأسر الكريمة",
      type: "تبرع نقدي",
      typeEn: "Cash Donation",
      amount: 1500000,
      currency: "ريال يمني",
      status: "confirmed",
      contact: "أ. ياسين التميمي",
      notes: "دعم مخصص لحفل الزفة الجماعية وتجهيز المسرح."
    },
    {
      id: "sp-5",
      sponsorName: "تجار وأعيان مدينة تريم",
      type: "تبرعات أهلية",
      typeEn: "Community Contributions",
      amount: 1800000,
      currency: "ريال يمني",
      status: "pledged",
      contact: "مجلس أعيان المدينة",
      notes: "تغطية نفقات الشاهي، الترامس، الثلج، والمخادر والفرش."
    }
  ],

  // المصروفات العامة للعرس الجماعي
  expenses: [
    {
      id: "exp-1",
      item: "الوليمة الكبرى (ذبائح الماشية + البهارات ومصنعية الطهاة)",
      itemEn: "Grand Banquet (Livestock, spices & chefs)",
      amount: 5200000,
      category: "banquet",
      status: "approved"
    },
    {
      id: "exp-2",
      item: "المنح النقدية المباشرة للعرسان (24 عريس × 250,000)",
      itemEn: "Direct Cash Grants for Couples",
      amount: 6000000,
      category: "aid",
      status: "approved"
    },
    {
      id: "exp-3",
      item: "كسوة العرسان وحقائب الزفاف والهدايا العينية",
      itemEn: "Groom Wedding Attire & Gift Packages",
      amount: 2100000,
      category: "gifts",
      status: "approved"
    },
    {
      id: "exp-4",
      item: "تجهيز ساحة الاحتفال (المسرح، الإضاءة، مكبرات الصوت، المظلات والمخادر)",
      itemEn: "Venue Pavilions, Stage, Lighting & Sound System",
      amount: 1800000,
      category: "venue",
      status: "approved"
    },
    {
      id: "exp-5",
      item: "ضيافة الشاهي الحضرمي وفريق الشاهوجية والمستلزمات",
      itemEn: "Hadhrami Tea Hospitality & Tea Team Supplies",
      amount: 650000,
      category: "tea",
      status: "approved"
    },
    {
      id: "exp-6",
      item: "سقيا الماء (برادات وترامس المياه الباردة، قوالب الثلج، كراتين المياه المبردة)",
      itemEn: "Water Dispensers, Ice Blocks & Bottled Water",
      amount: 450000,
      category: "water",
      status: "approved"
    },
    {
      id: "exp-7",
      item: "التصوير الاحترافي والتوثيق والبث المباشر واللوحات وبطاقات الدعوة",
      itemEn: "Media Coverage, Streaming, Printing & Invitations",
      amount: 900000,
      category: "media",
      status: "approved"
    }
  ],

  // جدول برنامج الفعاليات المشتركة
  schedule: [
    {
      id: "sch-1",
      time: "08:00 ص - 10:30 ص",
      title: "استقبال وفود الضيوف والقبائل وتطييبهم بالبخور",
      titleEn: "Welcoming Guest Delegations & Traditional Incense Reception",
      location: "المدخل الرئيسي لساحة قصر الرند",
      coordinator: "لجنة الاستقبال والمراسيم",
      status: "upcoming" // 'upcoming' | 'ongoing' | 'completed'
    },
    {
      id: "sch-2",
      time: "10:45 ص - 12:15 م",
      title: "مراسم عقد القران الجماعي وتوثيق الأنكحة رسمياً",
      titleEn: "Mass Marriage Contracts (Aqd Nikah) Ceremony",
      location: "القاعة المركزية الكبرى",
      coordinator: "لجنة التوثيق الشرعي ومأذونو الأنكحة",
      status: "upcoming"
    },
    {
      id: "sch-3",
      time: "12:30 م - 02:30 م",
      title: "الوليمة الكبرى (الغداء والصبحة العامة لجميع الضيوف)",
      titleEn: "The Grand Community Wedding Feast (Lunch Banquet)",
      location: "مخادر الساحة الشرقية والغربية",
      coordinator: "لجنة الإطعام + فريق الشاهي وسقيا الماء",
      status: "upcoming"
    },
    {
      id: "sch-4",
      time: "03:30 م - 05:00 م",
      title: "الزفة الجماعية الكبرى وفنون الشرح التراثي والزوامل",
      titleEn: "Grand Collective Zaffah & Traditional Folk Performances",
      location: "الميدان العام للاحتفالات",
      coordinator: "لجنة الشرح والتراث + فرق الفلكلور",
      status: "upcoming"
    },
    {
      id: "sch-5",
      time: "05:15 م - 06:45 م",
      title: "المهرجان الخطابي وتكريم الرعاة وتوزيع المنح للعرسان",
      titleEn: "Official Ceremony, Honoring Sponsors & Aid Distribution",
      location: "مسرح الفعالية الرئيسي",
      coordinator: "اللجنة المنظمة العليا ولجنة الإعلام",
      status: "upcoming"
    },
    {
      id: "sch-6",
      time: "08:00 م - 11:00 م",
      title: "جلسة السمرة الفنية والتهاني الخاصة والتقاط الصور التذكارية",
      titleEn: "Evening Heritage Samrah, Warm Congratulations & Group Photos",
      location: "قاعة الضيافة والمخدرة التراثية",
      coordinator: "لجنة التوثيق والإعلام",
      status: "upcoming"
    }
  ]
};

// --- حاسبة التموين والوليمة الكبرى واللوجستيات ---
// دالة حساب المؤن بدقة بناء على عدد العرسان أو إجمالي عدد الضيوف
export function calculateMassWeddingLogistics(couplesCount, guestsOverride = null) {
  // متوسط الحضور الإجمالي = عدد العرسان × 35 إلى 40 ضيفاً لكل عريس + 200 ضيف شرف وشخصيات عامة ولجان
  const totalGuests = guestsOverride || (couplesCount * 38 + 250);

  // 1. حساب الذبائح (خروف/تيس لكل 15-18 شخص، أو رأس عجل لكل 70-80 شخص)
  const sheepCount = Math.ceil(totalGuests / 16);
  const meatKilosApprox = sheepCount * 13; // بالمتوسط 13 كجم لحم صافي

  // 2. حساب الأرز (كيس أرز بسمتي 40 كجم يكفي لـ 140-160 شخص بالولائم)
  const riceBags40kg = Math.ceil(totalGuests / 150);

  // 3. ضيافة الشاهي الحضرمي وفريق الشاهوجية
  // كل 100 ضيف يحتاجون تقريباً 1 براد تخدير كبير + 2 استكانات شرب لكل شخص طوال اليوم
  const teaBrewingPotsCount = Math.max(3, Math.ceil(totalGuests / 250)); // قدور التخدير الكبرى
  const teaServingKettlesCount = Math.max(8, Math.ceil(totalGuests / 60)); // برادات ودلال الصب المتنقلة
  const teaTeamMembersCount = Math.max(6, Math.ceil(totalGuests / 70)); // فريق الشاهوجية وصانعي الشاي
  const teaSugarBags50kg = Math.max(2, Math.ceil(totalGuests / 400)); // أكياس السكر 50 كجم
  const teaBoxesKilograms = Math.ceil(totalGuests * 0.025); // كجم شاي سيلاني فاخر
  const mintBunches = Math.ceil(totalGuests / 10); // حزم النعناع الحضرمي الطازج

  // 4. برادات وترامس المياه الباردة
  // ترمس/براد كبير سعة 60-80 لتر لكل 70-80 شخص موزع في الزوايا
  const largeWaterDispensersCount = Math.max(6, Math.ceil(totalGuests / 75));
  // قوالب الثلج (قالب ثلج كامل لكل ترمس لتبريده طوال ساعات الحفل)
  const iceBlocksCount = largeWaterDispensersCount * 3; // 3 تبديلات ثلج على مدار اليوم
  // كراتين مياه شرب معبأة مبردة (للمنصة وكبار الشخصيات وكبار السن)
  const bottledWaterCartons = Math.ceil(totalGuests / 25);

  // 5. المخادر والفرش
  // سجاد تقليدي مساحته تكفي الضيوف (سجادة 4×3 م تكفي 10-12 جالس)
  const carpetsCount = Math.ceil(totalGuests / 11);
  const tentsAreaSqMeters = Math.ceil(totalGuests * 1.4); // 1.4 م² لكل ضيف مع ممرات الخدمة

  return {
    totalGuests,
    food: {
      sheepCount,
      meatKilosApprox,
      riceBags40kg,
      cookingOilCartons: Math.ceil(riceBags40kg * 1.5),
      spicesKilos: Math.ceil(sheepCount * 1.2)
    },
    teaHospitality: {
      teamSize: teaTeamMembersCount,
      brewingPots: teaBrewingPotsCount,
      servingKettles: teaServingKettlesCount,
      sugarBags50kg: teaSugarBags50kg,
      teaLeavesKg: teaBoxesKilograms,
      mintBunches: mintBunches,
      glassesCount: Math.ceil(totalGuests * 1.3),
      charcoalBags: Math.ceil(teaBrewingPotsCount * 2.5) // أكياس الفحم الطبيعي
    },
    hydration: {
      largeDispensers: largeWaterDispensersCount,
      iceBlocks: iceBlocksCount,
      bottledWaterCartons: bottledWaterCartons
    },
    venueLogistics: {
      carpetsCount,
      tentsAreaSqMeters,
      fansOrCoolersCount: Math.ceil(totalGuests / 50)
    }
  };
}
