const ITERATIONS = 10000;

function generateCouples(n) {
  const arr = [];
  const statuses = ['completed', 'pending', 'in_progress'];
  for (let i = 0; i < n; i++) {
    arr.push({
      medicalStatus: statuses[Math.floor(Math.random() * statuses.length)],
      contractStatus: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  return arr;
}

const couples = generateCouples(1000);

function baseline() {
  let medReady = 0;
  let contractsApp = 0;
  let fullyComp = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    medReady = couples.filter(c => c.medicalStatus === 'completed').length;
    contractsApp = couples.filter(c => c.contractStatus === 'completed').length;
    fullyComp = couples.filter(c => c.medicalStatus === 'completed' && c.contractStatus === 'completed').length;
  }
  return { medReady, contractsApp, fullyComp };
}

function optimized() {
  let medReady = 0;
  let contractsApp = 0;
  let fullyComp = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    let m = 0;
    let c = 0;
    let f = 0;
    for (let j = 0; j < couples.length; j++) {
        const isM = couples[j].medicalStatus === 'completed';
        const isC = couples[j].contractStatus === 'completed';
        if (isM) m++;
        if (isC) c++;
        if (isM && isC) f++;
    }
    medReady = m;
    contractsApp = c;
    fullyComp = f;
  }
  return { medReady, contractsApp, fullyComp };
}

console.time('Baseline (array.filter.length)');
baseline();
console.timeEnd('Baseline (array.filter.length)');

console.time('Optimized (single pass loop)');
optimized();
console.timeEnd('Optimized (single pass loop)');
