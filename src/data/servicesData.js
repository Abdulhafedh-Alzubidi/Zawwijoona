// src/data/servicesData.js
// بيانات فئات وقوالب خدمات وموردي الأعراس

export const SERVICE_CATEGORIES = [
  { id: 'all', icon: 'Sparkles', labelAr: 'كل الخدمات', labelEn: 'All Services' },
  { id: 'venues', icon: 'Building2', labelAr: 'صالات وقاعات ومخادر', labelEn: 'Halls & Venues' },
  { id: 'decor', icon: 'Flower2', labelAr: 'كوش ومداخل وتنسيق', labelEn: 'Koshat & Decor' },
  { id: 'sound_media', icon: 'Music', labelAr: 'صوتيات وإضاءة وشرح', labelEn: 'Sound & Media' },
  { id: 'photography', icon: 'Camera', labelAr: 'تصوير وتوثيق فيديو', labelEn: 'Photography' },
  { id: 'catering', icon: 'UtensilsCrossed', labelAr: 'ضيافة وولائم وبوفيه', labelEn: 'Catering & Banquets' },
  { id: 'beauty', icon: 'Sparkles', labelAr: 'كوافير ومكياج ونقش', labelEn: 'Beauty & Henna' },
];

export const SERVICE_TEMPLATES = [
  // 1. صالات وقاعات
  {
    id: 'venue_1',
    category: 'venues',
    nameAr: 'قاعة اللؤلؤة الملكية للمناسبات',
    nameEn: 'Royal Pearl Grand Hall',
    cityAr: 'المكلا - فوه',
    cityEn: 'Mukalla - Fuwa',
    descriptionAr: 'قاعة فخمة مكيفة بالكامل تتسع لـ 600 شخص، مجهزة بمدرج عرائس ملكي، أنظمة إضاءة ليزرية حديثة، غرف VIP منفصلة ومواقف واسعة للسيارات.',
    descriptionEn: 'Grand air-conditioned hall with 600 guest capacity, royal bridal catwalk, advanced laser lighting, VIP dressing suites, and private parking.',
    phone: '+967771234567',
    whatsapp: '967771234567',
    priceEstimateAr: 'تبدأ من 800,000 ريال يمني',
    priceEstimateEn: 'Starting from 800,000 YER',
    rating: 4.9,
    badgeAr: 'الأكثر طلباً ⭐',
    badgeEn: 'Popular ⭐',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545232979-fbf68fe9ec40?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['مولد كهربائي مركزي 24/7', 'طاقم ضيافة نسائي متخصص', 'شاشات عرض LED عملاقة'],
    featuresEn: ['24/7 Central generator', 'Dedicated hospitality team', 'Giant LED screens']
  },
  {
    id: 'venue_2',
    category: 'venues',
    nameAr: 'مخدرة وقاعة الف ليلة التراثية',
    nameEn: 'Alf Leila Heritage Pavilion & Hall',
    cityAr: 'سيئون - القرن',
    cityEn: 'Seiyun - Al-Qarn',
    descriptionAr: 'مخدرة تراثية مجهزة بطراز حضرمي أصيل مع جلسات عربية مريحة ومكيفات صحراوية وسقف تراثي مزخرف، مثالية لحراوة الزفاف وجلسات الشرح والسمرات.',
    descriptionEn: 'Authentic Hadhrami style pavilion with traditional majlis seating, festive lighting, ideal for groom celebrations and heritage nights.',
    phone: '+967772345678',
    whatsapp: '967772345678',
    priceEstimateAr: 'تبدأ من 450,000 ريال يمني',
    priceEstimateEn: 'Starting from 450,000 YER',
    rating: 4.8,
    badgeAr: 'طابع تراثي حضرمي',
    badgeEn: 'Heritage Pick',
    images: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['جلسات ومساند حضرمية فاخرة', 'تجهيزات صوتية متكاملة للدان', 'مساحة خارجية للوليمة'],
    featuresEn: ['Luxury traditional floor seating', 'Full sound setup for Daan music', 'Outdoor banquet area']
  },

  // 2. كوش ومداخل وتنسيق
  {
    id: 'decor_1',
    category: 'decor',
    nameAr: 'استوديو إكليل لتصميم الكوش والمداخل',
    nameEn: 'Ikleel Kosha & Floral Arch Studio',
    cityAr: 'المكلا - الديس',
    cityEn: 'Mukalla - Al-Dis',
    descriptionAr: 'تصميم وتنفيذ أحدث كوش الأعراس العصرية والكلاسيكية، أقواس الورود الطبيعية، ممرات العروس المضيئة، وطاولات استقبال ضيوف بتنسيقات ملكية مذهلة.',
    descriptionEn: 'Bespoke bridal stages (koshas), fresh flower arches, lighted catwalk runways, and luxury entrance reception setups tailored to your theme.',
    phone: '+967773456789',
    whatsapp: '967773456789',
    priceEstimateAr: 'تبدأ من 350,000 ريال يمني',
    priceEstimateEn: 'Starting from 350,000 YER',
    rating: 4.95,
    badgeAr: 'تصاميم حصرية 2026',
    badgeEn: 'Exclusive Designs',
    images: [
      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['ورود طبيعية مستوردة وصناعية فاخرة', 'إضاءات نيون وهيدروليك مخصصة', 'معاينة 3D قبل التنفيذ'],
    featuresEn: ['Imported fresh & luxury silk flowers', 'Custom neon & LED effects', '3D design preview']
  },
  {
    id: 'decor_2',
    category: 'decor',
    nameAr: 'لمسات بيسان لتنسيق طاولات وقاعات الأفراح',
    nameEn: 'Bisan Wedding Decor & Table Styling',
    cityAr: 'عدن - المنصورة',
    cityEn: 'Aden - Mansoura',
    descriptionAr: 'تنسيق متكامل لطاولات المعازيم والمداخل، مفارش مخملية مطرزة، شمعدانات كريستالية، وبطاقات ترحيب فاخرة لكل طاولة.',
    descriptionEn: 'Full guest table decoration, crystal candelabras, embroidered linens, custom centerpieces, and welcoming setups.',
    phone: '+967735123456',
    whatsapp: '967735123456',
    priceEstimateAr: 'تبدأ من 250,000 ريال يمني',
    priceEstimateEn: 'Starting from 250,000 YER',
    rating: 4.7,
    badgeAr: 'أناقة وتناسق ألوان',
    badgeEn: 'Elegant Styling',
    images: [
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['تنسيق ثيم كامل وموحد', 'سنتربيس كريستال وورد', 'توزيعات ضيوف راقية'],
    featuresEn: ['Complete color theme coordination', 'Crystal floral centerpieces', 'Luxury guest favors']
  },

  // 3. صوتيات وإضاءة وفرق شرح
  {
    id: 'sound_1',
    category: 'sound_media',
    nameAr: 'فرقة أنغام الدان والشرح الحضرمي',
    nameEn: 'Angham Al-Daan & Hadhrami Sharh Band',
    cityAr: 'حضرموت - تريم / المكلا',
    cityEn: 'Hadhramout - Tarim / Mukalla',
    descriptionAr: 'فرقة تراثية أصيلة لإحياء ليالي الحراوة والشرح والسمرة، تضم أمهر عازفي الهاجر والمرواس والعود والمغنين لإسعاد ضيوفكم بأجمل ألحان الدان الحضرمي.',
    descriptionEn: 'Renowned traditional Hadhrami musical band performing live wedding Sharh, Hajer, Marwas, Oud, and folklore chants for your special night.',
    phone: '+967774567890',
    whatsapp: '967774567890',
    priceEstimateAr: 'تبدأ من 300,000 ريال يمني',
    priceEstimateEn: 'Starting from 300,000 YER',
    rating: 4.9,
    badgeAr: 'طرب وتراث أصيل 🥁',
    badgeEn: 'Traditional Beats 🥁',
    images: [
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['طاقم كامل 8-12 عازف ومؤدي', 'ألحان الدان والغيّة والشرح اليافعي والحضرمي', 'هندسة صوت خارجية مجانية'],
    featuresEn: ['8-12 performers & percussionists', 'Full heritage repertoire', 'Sound mixing included']
  },
  {
    id: 'sound_2',
    category: 'sound_media',
    nameAr: 'مؤسسة صدى النغم للصوتيات وهندسة الإضاءة',
    nameEn: 'Sada Al-Nagham Pro Audio & Stage Lighting',
    cityAr: 'المكلا - الشرج',
    cityEn: 'Mukalla - Sharj',
    descriptionAr: 'تجهيزات صوتية متطورة بنظام Line Array نقي، ميكروفونات لاسلكية احترافية، إضاءات Moving Heads ومؤثرات دخان وشرار بارد لحظة دخول العريس والعروس.',
    descriptionEn: 'High-end Line Array sound systems, wireless mics, moving head stage beams, haze and cold spark machine special effects for wedding entrances.',
    phone: '+967775678901',
    whatsapp: '967775678901',
    priceEstimateAr: 'تبدأ من 220,000 ريال يمني',
    priceEstimateEn: 'Starting from 220,000 YER',
    rating: 4.85,
    badgeAr: 'هندسة صوت نقية',
    badgeEn: 'Crystal Clear Audio',
    images: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['أجهزة شرار بارد آمنة داخلياً', 'مكبرات صوت عالية النقاء', 'دي جي مهني مع فلاتر صوت'],
    featuresEn: ['Indoor-safe cold spark machines', 'Studio clarity sound arrays', 'Pro DJ & sound technician']
  },

  // 4. تصوير وتوثيق فيديو
  {
    id: 'photo_1',
    category: 'photography',
    nameAr: 'استوديو عدسة الذكريات للإنتاج والتصوير',
    nameEn: 'Memories Lens Wedding Cinema & Photo',
    cityAr: 'المكلا - المكلا القديمة',
    cityEn: 'Mukalla - Old Town',
    descriptionAr: 'توثيق سينمائي كامل لليلة العمر، كاميرات بدقة 4K مع تصوير طيران درون، ألبوم حراري فاخر إيطالي، وجلسة تصوير خارجية (Pre-wedding).',
    descriptionEn: 'Cinematic 4K wedding documentary, aerial drone coverage, luxury Italian thermal photo album, and romantic pre-wedding outdoor session.',
    phone: '+967776789012',
    whatsapp: '967776789012',
    priceEstimateAr: 'تبدأ من 400,000 ريال يمني',
    priceEstimateEn: 'Starting from 400,000 YER',
    rating: 4.96,
    badgeAr: 'تصوير سينمائي 4K 🎥',
    badgeEn: '4K Cinematic 🎥',
    images: [
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583939411023-14783179e581?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['فريق تصوير نسائي متكامل وموثوق', 'مونتاج فيديو تشويقي Highlight خلال 48 ساعة', 'ألبوم خشبي حراري مطبوع'],
    featuresEn: ['Dedicated female photo crew for women hall', 'Teaser highlight film in 48h', 'Luxury thermal printed album']
  },
  {
    id: 'photo_2',
    category: 'photography',
    nameAr: 'فوكاس ميديا للتصوير الفوتوغرافي',
    nameEn: 'Focus Media Photography',
    cityAr: 'سيئون - السحيل',
    cityEn: 'Seiyun - Suhayl',
    descriptionAr: 'تغطية فوتوغرافية احترافية لمراسم عقد القران ويوم الحراوة، التقاط أدق اللحظات التلقائية والمشاعر الصادقة بدقة وجودة ألوان استثنائية.',
    descriptionEn: 'Candid and portrait wedding photography for contract signing and celebration day with exceptional color grading and prompt delivery.',
    phone: '+967777890123',
    whatsapp: '967777890123',
    priceEstimateAr: 'تبدأ من 250,000 ريال يمني',
    priceEstimateEn: 'Starting from 250,000 YER',
    rating: 4.75,
    badgeAr: 'سرعة في التسليم',
    badgeEn: 'Fast Delivery',
    images: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['تسليم كافة الصور الرقمية بجودة عالية', 'جلسة تصوير خاصة للعريس مع الأهل والأصدقاء', 'إضاءات تصوير Softbox بورتريه'],
    featuresEn: ['Full high-res digital gallery', 'Exclusive groom & family portraits', 'Studio lighting setup']
  },

  // 5. ضيافة وولائم وبوفيه
  {
    id: 'catering_1',
    category: 'catering',
    nameAr: 'مطابخ ومضياف الأصالة للولائم الحضرمية',
    nameEn: 'Al-Asala Traditional Feast & Mandi Catering',
    cityAr: 'المكلا / سيئون',
    cityEn: 'Mukalla / Seiyun',
    descriptionAr: 'إعداد ولائم الزفاف الحضرمية الأصيلة (مندي، كبسة حضرمية، زربيان، ولحم بلدي طازج) مع طاقم سفرجية وخدمة ضيوف متميزة تبيّض الوجه.',
    descriptionEn: 'Traditional wedding feasts featuring genuine Hadhrami Mandi, Zurbian, fresh local meat, accompanied by experienced servers and servers.',
    phone: '+967778901234',
    whatsapp: '967778901234',
    priceEstimateAr: 'حسب عدد الذبائح والضيوف',
    priceEstimateEn: 'Per guest / meat headcount',
    rating: 4.9,
    badgeAr: 'ولائم تبيّض الوجه 🥩',
    badgeEn: 'Grand Banquets 🥩',
    images: [
      'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['ذبائح بلدية طازجة ومفحوصة', 'مقبلات، سلطات وحلوى حضرمية ومشروبات', 'طاقم توزيع مباشر وسريع'],
    featuresEn: ['Fresh local meat carefully prepared', 'Salads, appetisers, desserts and drinks', 'Fast on-site catering staff']
  },
  {
    id: 'catering_2',
    category: 'catering',
    nameAr: 'حلويات وضيافة النخبة للمناسبات',
    nameEn: 'Elite Sweets & Coffee Hospitality',
    cityAr: 'المكلا - 40 شقة',
    cityEn: 'Mukalla - 40 Flats',
    descriptionAr: 'تقديم بوفيه حلويات فاخرة، معجنات ميني راقية، ركن قهوة عربي وبخوري متكامل مع صبابات بزي تراثي لاستقبال ضيوف العرس بحفاوة وكرم.',
    descriptionEn: 'Luxury wedding dessert tables, savory mini pastries, specialty Arabic coffee & tea stations with servers in traditional attire.',
    phone: '+967779012345',
    whatsapp: '967779012345',
    priceEstimateAr: 'تبدأ من 180,000 ريال يمني',
    priceEstimateEn: 'Starting from 180,000 YER',
    rating: 4.8,
    badgeAr: 'ضيافة فندقية راقية',
    badgeEn: 'Premium Hospitality',
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['ركن قهوة وبخور دائم طوال الحفل', 'كيكة زفاف متعددة الأدوار حسب الطلب', 'عصائر طبيعية منعشة وتقديم راقٍ'],
    featuresEn: ['Live coffee & incense booth', 'Multi-tier custom wedding cake', 'Fresh juices & elegant service']
  },

  // 6. كوافير ومكياج ونقش
  {
    id: 'beauty_1',
    category: 'beauty',
    nameAr: 'صالون ليدي كوين للعرائس ونقش الحناء',
    nameEn: 'Lady Queen Bridal Salon & Henna Art',
    cityAr: 'المكلا - الشرج',
    cityEn: 'Mukalla - Sharj',
    descriptionAr: 'باقة عناية وتجميل متكاملة للعروس تشمل مكياج سينمائي مقاوم، تسريحة شعر ملكية، حمام ملكي ومغربي، ونقش حناء حضرمي وخليجي ناعم ومميز.',
    descriptionEn: 'Full bridal beauty package including long-lasting cinema makeup, royal hair styling, Moroccan bath, and intricate Hadhrami henna art.',
    phone: '+967770123456',
    whatsapp: '967770123456',
    priceEstimateAr: 'تبدأ من 150,000 ريال يمني',
    priceEstimateEn: 'Starting from 150,000 YER',
    rating: 4.95,
    badgeAr: 'إطلالة عروس ساحرة 👑',
    badgeEn: 'Royal Bridal Glow 👑',
    images: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    featuresAr: ['منتجات تجميل عالمية أصلية 100%', 'نقاشة حناء متخصصة بنقوش تراثية وعصرية', 'خدمة خاصة في القاعة أو الصالون'],
    featuresEn: ['100% original top international makeup brands', 'Master henna artist', 'At-venue or salon VIP service']
  }
];

// دالة توليد رابط واتساب مع رسالة استفسار ذكية ومجهزة
export const createWhatsAppInquiryLink = (whatsappNumber, serviceName, weddingDate = '', coupleNames = '') => {
  const cleanNumber = (whatsappNumber || '').replace(/[^0-9]/g, '');
  const dateMention = weddingDate ? `المقرر بتاريخ: ${weddingDate}` : 'القريب بإذن الله';
  const coupleMention = coupleNames ? ` (حفل زفاف: ${coupleNames})` : '';

  const message = `السلام عليكم ورحمة الله وبركاته،
أتواصل معكم بخصوص خدمة (${serviceName}) عبر تطبيق مراسيم${coupleMention}.
نود الاستفسار عن التوفر والأسعار لموعد الزفاف ${dateMention}.
شاكرين لكم حسن تعاونكم!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};
