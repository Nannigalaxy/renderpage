import { getBaseStyles } from './styles/defaultCss';

// 1. Validation Regex Test
const marginRegex = /^\s*(?:(?:\d+(?:\.\d+)?(?:mm|cm|in|px|pt|em|rem)|0)\s*){1,4}$/i;

const testCases = [
  { input: '15mm', expected: true },
  { input: '0.5in', expected: true },
  { input: '20px', expected: true },
  { input: '20mm 15mm', expected: true },
  { input: '25mm 10mm 25mm 10mm', expected: true },
  { input: '0', expected: true },
  { input: '0 10mm', expected: true },
  { input: '15', expected: false }, // no unit
  { input: '15abc', expected: false }, // invalid unit
  { input: '15mm 10mm 5mm 5mm 5mm', expected: false }, // 5 values (max 4)
  { input: '', expected: false },
  { input: '   ', expected: false }
];

console.log('--- Running Margin Validation Unit Tests ---');
let failures = 0;
for (const tc of testCases) {
  const actual = marginRegex.test(tc.input.trim());
  if (actual === tc.expected) {
    console.log(`✅ Passed: "${tc.input}" -> ${actual}`);
  } else {
    console.error(`❌ Failed: "${tc.input}" expected ${tc.expected}, got ${actual}`);
    failures++;
  }
}

// 2. Margin CSS Compilation Test
console.log('\n--- Running CSS Margin Rule Compilation Tests ---');

const singleMargin = getBaseStyles({
  margin: '15mm',
  paperSize: 'A4',
  enableHeader: false,
  enableFooter: false
});

const multiMargin = getBaseStyles({
  margin: '25mm 10mm 25mm 10mm',
  paperSize: 'A4',
  enableHeader: false,
  enableFooter: false
});

const containsSingleRule = singleMargin.includes('margin: 20mm 15mm 20mm 15mm;');
const containsMultiRule = multiMargin.includes('margin: 25mm 10mm 25mm 10mm;');

if (containsSingleRule) {
  console.log('✅ Passed: Single margin input correctly generates top/bottom safe clearance (20mm side 20mm side).');
} else {
  console.error('❌ Failed: Single margin style was not compiled correctly.');
  failures++;
}

if (containsMultiRule) {
  console.log('✅ Passed: Multi-value custom margin input is injected directly as-is.');
} else {
  console.error('❌ Failed: Multi-value margin style was not compiled correctly.');
  failures++;
}

if (failures === 0) {
  console.log('\n🌟 ALL TESTS PASSED SUCCESSFULLY! 🌟');
} else {
  console.error(`\n🚨 TEST SUITE FAILED WITH ${failures} FAILURE(S) 🚨`);
  process.exit(1);
}
