const lines = [];
for (let i = 0; i < 100000; i++) {
  lines.push('"hello", "world", "foo", "bar"');
}

function runWithoutOptimization() {
  const start = performance.now();
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i].split(',').map(val => val.trim().replace(/^"|"$/g, ''));
  }
  const end = performance.now();
  return end - start;
}

function runWithOptimization() {
  const start = performance.now();
  const quoteRegex = /^"|"$/g;
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i].split(',').map(val => val.trim().replace(quoteRegex, ''));
  }
  const end = performance.now();
  return end - start;
}

let sumUnopt = 0;
let sumOpt = 0;
const runs = 10;
for (let i = 0; i < runs; i++) {
  sumUnopt += runWithoutOptimization();
  sumOpt += runWithOptimization();
}
console.log(`Unoptimized average: ${(sumUnopt / runs).toFixed(2)}ms`);
console.log(`Optimized average: ${(sumOpt / runs).toFixed(2)}ms`);
