import { performance } from 'perf_hooks';

// Simulate the imports
const SERVICE_CATEGORIES = Array.from({ length: 10 }, (_, i) => ({ id: `cat_${i}` }));
SERVICE_CATEGORIES.unshift({ id: 'all' });

const SERVICE_TEMPLATES = Array.from({ length: 1000 }, (_, i) => ({
  id: `temp_${i}`,
  category: `cat_${i % 10}`
}));

function baseline() {
  const result = [];
  for (const cat of SERVICE_CATEGORIES) {
    const count = cat.id === 'all'
      ? SERVICE_TEMPLATES.length
      : SERVICE_TEMPLATES.filter((s) => s.category === cat.id).length;
    result.push({ id: cat.id, count });
  }
  return result;
}

function optimized() {
  const result = [];
  // Precompute
  const categoryCounts = { 'all': SERVICE_TEMPLATES.length };
  for (let i = 0; i < SERVICE_TEMPLATES.length; i++) {
    const cat = SERVICE_TEMPLATES[i].category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  for (const cat of SERVICE_CATEGORIES) {
    const count = categoryCounts[cat.id] || 0;
    result.push({ id: cat.id, count });
  }
  return result;
}

const ITERATIONS = 10000;

const startBaseline = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  baseline();
}
const endBaseline = performance.now();
const timeBaseline = endBaseline - startBaseline;
console.log(`Baseline time: ${timeBaseline.toFixed(2)} ms`);

const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  optimized();
}
const endOptimized = performance.now();
const timeOptimized = endOptimized - startOptimized;
console.log(`Optimized time: ${timeOptimized.toFixed(2)} ms`);

console.log(`Improvement: ${((timeBaseline - timeOptimized) / timeBaseline * 100).toFixed(2)}%`);
