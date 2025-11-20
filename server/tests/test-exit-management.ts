/**
 * Test Script for Employee Exit Management
 * 
 * This script tests:
 * 1. Exit reason constants
 * 2. Validation functions
 * 3. Exit type categorization
 */

import {
  EXIT_TYPES,
  VOLUNTARY_EXIT_REASONS,
  INVOLUNTARY_EXIT_REASONS,
  getExitReasons,
  isValidExitReason,
  ALL_EXIT_REASONS,
} from '../constants/exitReasons';

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

let passCount = 0;
let failCount = 0;

function test(name: string, fn: () => boolean) {
  try {
    const result = fn();
    if (result) {
      console.log(`${colors.green}✓${colors.reset} ${name}`);
      passCount++;
    } else {
      console.log(`${colors.red}✗${colors.reset} ${name}`);
      failCount++;
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name} - Error: ${error}`);
    failCount++;
  }
}

console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.blue}   Employee Exit Management - Test Suite${colors.reset}`);
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

// Test 1: Exit Types
console.log(`${colors.yellow}Test Group: Exit Types${colors.reset}`);
test('EXIT_TYPES.VOLUNTARY should equal "voluntary"', () => {
  return EXIT_TYPES.VOLUNTARY === 'voluntary';
});

test('EXIT_TYPES.INVOLUNTARY should equal "involuntary"', () => {
  return EXIT_TYPES.INVOLUNTARY === 'involuntary';
});

test('EXIT_TYPES.ABSCONDING should equal "absconding"', () => {
  return EXIT_TYPES.ABSCONDING === 'absconding';
});

// Test 2: Voluntary Exit Reasons
console.log(`\n${colors.yellow}Test Group: Voluntary Exit Reasons${colors.reset}`);
test('Should have 15 voluntary exit reasons', () => {
  return VOLUNTARY_EXIT_REASONS.length === 15;
});

test('Should contain "Better Career Opportunity"', () => {
  return VOLUNTARY_EXIT_REASONS.includes('Better Career Opportunity');
});

test('Should contain "Retirement"', () => {
  return VOLUNTARY_EXIT_REASONS.includes('Retirement');
});

test('Should contain "Work-Life Balance"', () => {
  return VOLUNTARY_EXIT_REASONS.includes('Work-Life Balance');
});

// Test 3: Involuntary Exit Reasons
console.log(`\n${colors.yellow}Test Group: Involuntary Exit Reasons${colors.reset}`);
test('Should have 11 involuntary exit reasons', () => {
  return INVOLUNTARY_EXIT_REASONS.length === 11;
});

test('Should contain "Performance Issues"', () => {
  return INVOLUNTARY_EXIT_REASONS.includes('Performance Issues');
});

test('Should contain "ATL - Resign"', () => {
  return INVOLUNTARY_EXIT_REASONS.includes('ATL - Resign');
});

test('Should contain "Misconduct"', () => {
  return INVOLUNTARY_EXIT_REASONS.includes('Misconduct');
});

// Test 4: getExitReasons function
console.log(`\n${colors.yellow}Test Group: getExitReasons Function${colors.reset}`);
test('getExitReasons("voluntary") should return voluntary reasons', () => {
  const reasons = getExitReasons(EXIT_TYPES.VOLUNTARY);
  return reasons.length === 15 && reasons.includes('Better Career Opportunity');
});

test('getExitReasons("involuntary") should return involuntary reasons', () => {
  const reasons = getExitReasons(EXIT_TYPES.INVOLUNTARY);
  return reasons.length === 11 && reasons.includes('Performance Issues');
});

test('getExitReasons("absconding") should return empty array', () => {
  const reasons = getExitReasons(EXIT_TYPES.ABSCONDING);
  return reasons.length === 0;
});

// Test 5: isValidExitReason function
console.log(`\n${colors.yellow}Test Group: isValidExitReason Function${colors.reset}`);
test('Should validate correct voluntary reason', () => {
  return isValidExitReason(EXIT_TYPES.VOLUNTARY, 'Retirement');
});

test('Should validate correct involuntary reason', () => {
  return isValidExitReason(EXIT_TYPES.INVOLUNTARY, 'Performance Issues');
});

test('Should reject invalid voluntary reason', () => {
  return !isValidExitReason(EXIT_TYPES.VOLUNTARY, 'Invalid Reason');
});

test('Should reject invalid involuntary reason', () => {
  return !isValidExitReason(EXIT_TYPES.INVOLUNTARY, 'Invalid Reason');
});

test('Should reject voluntary reason for involuntary type', () => {
  return !isValidExitReason(EXIT_TYPES.INVOLUNTARY, 'Retirement');
});

test('Should reject involuntary reason for voluntary type', () => {
  return !isValidExitReason(EXIT_TYPES.VOLUNTARY, 'Performance Issues');
});

// Test 6: ALL_EXIT_REASONS object
console.log(`\n${colors.yellow}Test Group: ALL_EXIT_REASONS Object${colors.reset}`);
test('ALL_EXIT_REASONS should have voluntary key', () => {
  return ALL_EXIT_REASONS.voluntary !== undefined;
});

test('ALL_EXIT_REASONS should have involuntary key', () => {
  return ALL_EXIT_REASONS.involuntary !== undefined;
});

test('ALL_EXIT_REASONS should have absconding key', () => {
  return ALL_EXIT_REASONS.absconding !== undefined;
});

// Test 7: No duplicate reasons
console.log(`\n${colors.yellow}Test Group: Data Integrity${colors.reset}`);
test('Voluntary reasons should have no duplicates', () => {
  const unique = new Set(VOLUNTARY_EXIT_REASONS);
  return unique.size === VOLUNTARY_EXIT_REASONS.length;
});

test('Involuntary reasons should have no duplicates', () => {
  const unique = new Set(INVOLUNTARY_EXIT_REASONS);
  return unique.size === INVOLUNTARY_EXIT_REASONS.length;
});

test('No overlap between voluntary and involuntary reasons', () => {
  const overlap = VOLUNTARY_EXIT_REASONS.filter(reason =>
    INVOLUNTARY_EXIT_REASONS.includes(reason as any)
  );
  return overlap.length === 0;
});

// Summary
console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.blue}   Test Summary${colors.reset}`);
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.green}✓ Passed: ${passCount}${colors.reset}`);
console.log(`${colors.red}✗ Failed: ${failCount}${colors.reset}`);
console.log(`Total Tests: ${passCount + failCount}`);

if (failCount === 0) {
  console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}❌ Some tests failed!${colors.reset}\n`);
  process.exit(1);
}
