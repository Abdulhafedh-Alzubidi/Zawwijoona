const { performance } = require('perf_hooks');

const SERVICE_CATEGORIES = [
  { id: 'all', icon: 'Sparkles', labelAr: 'كل الخدمات', labelEn: 'All Services' },
  { id: 'venues', icon: 'Building2', labelAr: 'صالات وقاعات ومخادر', labelEn: 'Halls & Venues' },
  { id: 'decor', icon: 'Flower2', labelAr: 'كوش ومداخل وتنسيق', labelEn: 'Koshat & Decor' },
  { id: 'sound_media', icon: 'Music', labelAr: 'صوتيات وإضاءة وشرح', labelEn: 'Sound & Media' },
  { id: 'photography', icon: 'Camera', labelAr: 'تصوير وتوثيق فيديو', labelEn: 'Photography' },
  { id: 'catering', icon: 'UtensilsCrossed', labelAr: 'ضيافة وولائم وبوفيه', labelEn: 'Catering & Banquets' },
  { id: 'beauty', icon: 'Sparkles', labelAr: 'كوافير ومكياج ونقش', labelEn: 'Beauty & Henna' },
];

const items = Array(10000).fill(null).map((_, i) => ({
  id: i,
  category: SERVICE_CATEGORIES[i % SERVICE_CATEGORIES.length].id,
}));

// Baseline
const start1 = performance.now();
let result1 = 0;
for (let j = 0; j < 100; j++) {
  items.forEach(item => {
    const labelAr = SERVICE_CATEGORIES.find((c) => c.id === item.category)?.labelAr;
    if (labelAr) result1++;
  });
}
const end1 = performance.now();
const baselineTime = end1 - start1;

// Optimized
const start2 = performance.now();
const categoriesMap = SERVICE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {});
let result2 = 0;
for (let j = 0; j < 100; j++) {
  items.forEach(item => {
    const labelAr = categoriesMap[item.category]?.labelAr;
    if (labelAr) result2++;
  });
}
const end2 = performance.now();
const optimizedTime = end2 - start2;

console.log(`Baseline time: ${baselineTime.toFixed(2)}ms`);
console.log(`Optimized time: ${optimizedTime.toFixed(2)}ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);
