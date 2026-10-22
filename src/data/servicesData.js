// src/data/servicesData.js
// بيانات فئات وقوالب خدمات وموردي الأعراس

export const SERVICE_CATEGORIES = [
  { id: 'all', icon: 'Sparkles', labelAr: 'كل الخدمات', labelEn: 'All Services' },
  { id: 'venues', icon: 'Building2', labelAr: 'صالات وقاعات ومسارح', labelEn: 'Halls, Venues & Theatres' },
  { id: 'decor', icon: 'Flower2', labelAr: 'كوش ومداخل وتنسيق', labelEn: 'Koshat & Decor' },
  { id: 'sound_media', icon: 'Music', labelAr: 'فرق شعبيّة، فنانين وصوتيات', labelEn: 'Folk Bands, Artists & Audio' },
  { id: 'photography', icon: 'Camera', labelAr: 'استوديوهات تصوير ومصورات', labelEn: 'Photo Studios & Photographers' },
  { id: 'catering', icon: 'UtensilsCrossed', labelAr: 'مطابخ ولائم وبوفيه ضيافة', labelEn: 'Banquets & Hospitality Buffets' },
  { id: 'rentals', icon: 'Tent', labelAr: 'تأجير مستلزمات أفراح', labelEn: 'Wedding Rentals & Supplies' },
  { id: 'beauty', icon: 'Sparkles', labelAr: 'كوافير ومكياج ونقش', labelEn: 'Beauty & Henna' },
  { id: 'groom_care', icon: 'Scissors', labelAr: 'حلاقة وتجهيز عرسان', labelEn: 'Groom Salons & Care' },
  { id: 'invitations', icon: 'Mail', labelAr: 'بطاقات دعوة وطباعة', labelEn: 'Invitations & Print' },
  { id: 'car_decor', icon: 'Car', labelAr: 'زينة سيارات ومواكب', labelEn: 'Car Decor' },
  { id: 'furniture', icon: 'Bed', labelAr: 'أثاث وغرف نوم عرسان', labelEn: 'Wedding Furniture' },
];

export const SERVICE_TEMPLATES = [
  // 1. صالات وقاعات ومسارح
  {
    id: 'venue_grand_palace_tarim',
    category: 'venues',
    nameAr: 'قصر المناسبات الكبرى',
    nameEn: 'Grand Events Palace',
    cityAr: 'تريم - منطقة حاي',
    cityEn: 'Tarim - Hay Area',
    descriptionAr: 'قصر فخم متكامل يضم قاعتين منفصلتين (قاعة للنساء وأخرى للرجال)، صالة طعام مستقلة، وجناحاً مكيفاً خاصاً بالعروس. مجهز بنظام تكييف مركزي متكامل، مولد كهربائي، ومواقف سيارات واسعة مع مرونة تامة لتجهيز الديكور الخاص وخدمات كادر الضيافة المباشرة.',
    descriptionEn: 'A grand premier palace featuring dual separate halls for men and women, private banquet dining hall, and an air-conditioned bridal suite. Equipped with central AC, 24/7 backup power generator, vast parking, customizable decor setup, and full hospitality staffing.',
    phone: '+967771012023',
    whatsapp: '967771012023',
    priceEstimateAr: '900,000 ريال يمني',
    priceEstimateEn: '900,000 YER',
    rating: 4.95,
    badgeAr: 'سعة 1200 شخص 👑',
    badgeEn: '1200 Capacity 👑',
    images: [
      '/services/venues/Palace1.jpeg',
      '/services/venues/Palace2.jpeg',
      '/services/venues/Palace3.jpeg',
      '/services/venues/Palace4.jpeg',
      '/services/venues/Palace5.jpeg',
      '/services/venues/Palace6.jpeg',
      '/services/venues/Palace7.jpeg',
      '/services/venues/Palace8.jpeg'
    ],
    featuresAr: [
      'سعة استيعابية ضخمة تصل إلى 1200 شخص (رجال ونساء)',
      'تكييف مركزي متكامل + مولد كهربائي 24/7',
      'قاعة للرجال + قاعة للنساء + صالة طعام مستقلة + غرفة مكيفة للعروس',
      'مواقف سيارات واسعة وإمكانية تجهيز القاعة بديكورك الخاص',
      'خدمات إضافية: كادر عمال وعاملات + ماء بارد + شاي بأنواعه للضيافة'
    ],
    featuresEn: [
      'Massive 1,200 guest total capacity (men & women)',
      'Integrated central AC + 24/7 backup power generator',
      'Men hall + Women hall + Dining banquet hall + Bridal suite',
      'Spacious parking lots & full decor customization',
      'Hospitality staff, cold water & traditional tea catering services'
    ]
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
