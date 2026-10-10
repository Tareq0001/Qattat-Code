/**
 * Comprehensive Unit Test Suite for Qattat Code Platform
 * Tests Data, Deep Equality, JS Runner, Python Runner, SVG Generator, and Badges
 * 
 * Author: 🏛️ أ. طارق ابوعشي
 */

import { strict as assert } from 'assert';
import { CHALLENGES } from '../src/data/challenges.js';
import { RANKS, BADGES } from '../src/data/badges.js';
import { CodeRunner, isDeepEqual } from '../src/engine/runner.js';
import { QattGenerator, ASIRI_COLORS } from '../src/engine/qatt-generator.js';

async function runTests() {
  console.log('🧪 Starting Qattat Code Platform Test Suite...\n');

  // Test 1: Challenges Data Integrity
  console.log('▶ Test 1: Verifying Challenges Data Integrity...');
  assert.ok(CHALLENGES.length >= 6, 'Must have at least 6 challenges');
  for (const c of CHALLENGES) {
    assert.ok(c.id, 'Challenge must have an id');
    assert.ok(c.titleAr, 'Challenge must have titleAr');
    assert.ok(['python', 'javascript', 'algorithms'].includes(c.track), `Invalid track: ${c.track}`);
    assert.ok(['beginner', 'intermediate', 'advanced'].includes(c.difficulty), `Invalid difficulty: ${c.difficulty}`);
    assert.ok(c.starterCode.javascript, 'Must have JS starter code');
    assert.ok(c.starterCode.python, 'Must have Python starter code');
    assert.ok(c.testCases.length >= 3, 'Must have at least 3 test cases');
    assert.ok(c.hints.length === 3, 'Must have 3 progressive hints');
    assert.ok(c.solution.javascript, 'Must have JS solution');
    assert.ok(c.solution.python, 'Must have Python solution');
    assert.ok(c.analysis.timeComplexity, 'Must have time complexity');
  }
  console.log(`  ✔ Verified ${CHALLENGES.length} challenges with complete multi-language specs`);

  // Test 2: Deep Equality Check
  console.log('\n▶ Test 2: Verifying Deep Equality Algorithm...');
  assert.equal(isDeepEqual([1, 2, [3, 4]], [1, 2, [3, 4]]), true);
  assert.equal(isDeepEqual([1, 2], [1, 3]), false);
  assert.equal(isDeepEqual({ a: 1, b: [2] }, { a: 1, b: [2] }), true);
  assert.equal(isDeepEqual({ a: 1 }, { a: 2 }), false);
  console.log('  ✔ Deep equality correctly handles nested arrays and objects');

  // Test 3: Safe JavaScript Runner against Official Solutions
  console.log('\n▶ Test 3: Testing JavaScript Runner against official solutions...');
  const runner = new CodeRunner();

  for (const c of CHALLENGES) {
    const res = await runner.runJavaScript(c.solution.javascript, c.functionName, c.testCases);
    assert.equal(res.success, true, `JS Solution for '${c.id}' should pass all test cases! Error: ${res.compileError}`);
    for (const r of res.results) {
      assert.equal(r.passed, true, `Test case ${r.id} for ${c.id} failed in JS`);
    }
  }
  console.log(`  ✔ All ${CHALLENGES.length} official JavaScript solutions passed 100% of test cases`);

  // Test 4: In-Browser Python Runner against Official Solutions
  console.log('\n▶ Test 4: Testing Python Runner against official solutions...');
  for (const c of CHALLENGES) {
    const res = await runner.runPython(c.solution.python, c.functionName, c.testCases);
    assert.equal(res.success, true, `Python Solution for '${c.id}' should pass all test cases! Error: ${res.compileError}`);
    for (const r of res.results) {
      assert.equal(r.passed, true, `Test case ${r.id} for ${c.id} failed in Python`);
    }
  }
  console.log(`  ✔ All ${CHALLENGES.length} official Python solutions passed 100% of test cases`);

  // Test 5: Asiri Qatt Generative Engine
  console.log('\n▶ Test 5: Verifying Qatt Generative Vector Engine...');
  const gen = new QattGenerator();
  const svg = gen.generateSvg({
    patternType: 'grand-mural',
    rows: 4,
    cols: 8
  });
  assert.ok(svg.startsWith('<svg'), 'Generated output must be an SVG element');
  assert.ok(svg.includes(ASIRI_COLORS.crimson), 'SVG must include Asiri crimson color');
  assert.ok(svg.includes(ASIRI_COLORS.ochre), 'SVG must include Asiri ochre gold color');
  assert.ok(svg.includes(ASIRI_COLORS.green), 'SVG must include Asiri green color');
  console.log('  ✔ Vector SVG mural generator produces valid geometric Asiri artwork');

  // Test 6: Badges and Ranks Progression
  console.log('\n▶ Test 6: Verifying Ranks and Badges progression logic...');
  assert.equal(RANKS.length, 6, 'Must have 6 distinct ranks');
  assert.equal(BADGES.length, 6, 'Must have 6 distinct badges');

  const mockProgress = {
    completedChallenges: ['py-01-reverse-words', 'js-02-two-sum-palette', 'algo-01-max-subarray'],
    totalXp: 350,
    labExported: true
  };

  const unlocked = BADGES.filter(b => b.conditionCheck(mockProgress, CHALLENGES));
  assert.ok(unlocked.length >= 4, 'Mock progress should unlock at least 4 badges');
  console.log('  ✔ Badges and ranks unlock logic successfully verified');

  console.log('\n🎉 ALL QATTAT CODE PLATFORM TESTS (JS & PYTHON) PASSED 100%!\n');
}

runTests().catch(err => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
