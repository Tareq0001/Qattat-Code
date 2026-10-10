/**
 * قطّاط البرمجة - محرك تنفيذ وفحص الأكواد المتقدم في المتصفح
 * Production-Grade In-Browser Code Runner & Test Evaluator
 * Supports Native JavaScript & Robust In-Browser Python 3 Engine
 * 
 * Author: 🏛️ أ. طارق ابوعشي
 */

export function isDeepEqual(actual, expected) {
  if (actual === expected) return true;
  if (typeof actual !== typeof expected) return false;
  if (actual === null || expected === null) return actual === expected;

  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    for (let i = 0; i < actual.length; i++) {
      if (!isDeepEqual(actual[i], expected[i])) return false;
    }
    return true;
  }

  if (typeof actual === 'object' && typeof expected === 'object') {
    const keysA = Object.keys(actual);
    const keysB = Object.keys(expected);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!expected.hasOwnProperty(key)) return false;
      if (!isDeepEqual(actual[key], expected[key])) return false;
    }
    return true;
  }

  return false;
}

export class CodeRunner {
  constructor() {}

  /**
   * Execute JavaScript code safely against test cases
   */
  async runJavaScript(code, functionName, testCases) {
    const capturedLogs = [];
    const logger = (...args) => {
      capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    let userFn;
    try {
      const wrappedCode = `
        ${code}
        return (typeof ${functionName} !== 'undefined') ? ${functionName} : null;
      `;
      const fnFactory = new Function('console', wrappedCode);
      userFn = fnFactory({ log: logger, info: logger, warn: logger, error: logger });

      if (typeof userFn !== 'function') {
        throw new Error(`لم يتم العثور على الدالة '${functionName}'. تأكد من الحفاظ على اسم الدالة الأصلي المطلوب.`);
      }
    } catch (compileErr) {
      return {
        success: false,
        compileError: compileErr.message,
        results: [],
        logs: capturedLogs
      };
    }

    const results = [];
    let allPassed = true;

    for (const tc of testCases) {
      const startTime = performance.now();
      let actualOutput = null;
      let error = null;
      let passed = false;

      try {
        const clonedInputs = JSON.parse(JSON.stringify(tc.input));
        actualOutput = userFn(...clonedInputs);
        const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
        passed = isDeepEqual(actualOutput, tc.expected);
        if (!passed) allPassed = false;

        results.push({
          id: tc.id,
          displayInput: tc.displayInput,
          expected: tc.expected,
          actual: actualOutput,
          passed,
          durationMs,
          isHidden: tc.isHidden
        });
      } catch (runErr) {
        allPassed = false;
        results.push({
          id: tc.id,
          displayInput: tc.displayInput,
          expected: tc.expected,
          actual: null,
          passed: false,
          error: runErr.message,
          durationMs: 0,
          isHidden: tc.isHidden
        });
      }
    }

    return {
      success: allPassed,
      results,
      logs: capturedLogs
    };
  }

  /**
   * Execute Python code in browser
   * Supports native Python syntax, standard built-ins (range, enumerate, len, Counter, re.sub, max, min, slicing, f-strings)
   */
  async runPython(code, functionName, testCases) {
    const capturedLogs = [];
    try {
      const jsCode = this.transpilePython(code, functionName);
      return await this.runJavaScript(jsCode, functionName, testCases);
    } catch (err) {
      return {
        success: false,
        compileError: `خطأ في صياغة بايثون: ${err.message}`,
        results: [],
        logs: capturedLogs
      };
    }
  }

  transpilePython(pyCode, targetFunctionName) {
    const runtimeHelpers = `
      const range = (start, stop, step = 1) => {
        if (stop === undefined) { stop = start; start = 0; }
        const arr = [];
        for (let i = start; step > 0 ? i < stop : i > stop; i += step) arr.push(i);
        return arr;
      };
      const enumerate = (arr) => (arr || []).map((item, idx) => [idx, item]);
      const max = (...args) => Math.max(...args);
      const min = (...args) => Math.min(...args);
      const Counter = (seq) => {
        const counts = {};
        for (const item of seq) counts[item] = (counts[item] || 0) + 1;
        return {
          _counts: counts,
          equals: function(other) {
            const c2 = other._counts || other;
            const k1 = Object.keys(this._counts);
            const k2 = Object.keys(c2);
            if (k1.length !== k2.length) return false;
            return k1.every(k => this._counts[k] === c2[k]);
          }
        };
      };
      const _py_reverse = (x) => {
        if (typeof x === 'string') return x.split('').reverse().join('');
        if (Array.isArray(x)) return x.slice().reverse();
        return x;
      };
      const _py_slice = (x, start, end) => {
        if (typeof x === 'string' || Array.isArray(x)) {
          if (end === undefined) return x.slice(start);
          return x.slice(start, end);
        }
        return x;
      };
      const re = {
        sub: (pattern, repl, str) => {
          return (str || '').replace(new RegExp(pattern, 'g'), repl);
        }
      };
    `;

    let js = pyCode;

    // Remove comments
    js = js.replace(/#.*$/gm, '');

    // Remove Python imports
    js = js.replace(/from\s+[\w.]+\s+import\s+[\w*]+/g, '');
    js = js.replace(/import\s+[\w.]+/g, '');

    // Convert raw strings r'...' / r"..."
    js = js.replace(/r'([^']*)'/g, "'$1'");
    js = js.replace(/r"([^"]*)"/g, '"$1"');

    // Convert f-strings
    js = js.replace(/f"([^"]*)"/g, (m, c) => '`' + c.replace(/\{([^}]+)\}/g, '${$1}') + '`');
    js = js.replace(/f'([^']*)'/g, (m, c) => '`' + c.replace(/\{([^}]+)\}/g, '${$1}') + '`');

    // Convert Counter equality
    js = js.replace(/Counter\(([^)]+)\)\s*==\s*Counter\(([^)]+)\)/g, 'Counter($1).equals(Counter($2))');

    // String methods
    js = js.replace(/\.lower\(\)/g, '.toLowerCase()');
    js = js.replace(/\.upper\(\)/g, '.toUpperCase()');
    js = js.replace(/\.strip\(\)/g, '.trim()');
    js = js.replace(/\.split\(\s*\)/g, '.trim().split(/\\s+/)');

    // 'sep'.join(seq)
    js = js.replace(/"([^"]*)"\.join\(([^)]+)\)/g, '($2).join("$1")');
    js = js.replace(/'([^']*)'\.join\(([^)]+)\)/g, "($2).join('$1')");

    // Slices
    js = js.replace(/([a-zA-Z0-9_]+)\[\s*::\s*-1\s*\]/g, '_py_reverse($1)');
    js = js.replace(/([a-zA-Z0-9_]+)\[\s*(\d+)\s*:\s*\]/g, '_py_slice($1, $2)');
    js = js.replace(/([a-zA-Z0-9_]+)\[\s*:\s*(\d+)\s*\]/g, '_py_slice($1, 0, $2)');

    // Array multiplication [x] * n
    js = js.replace(/\[([^\]]+)\]\s*\*\s*([^,\n;]+)/g, 'new Array($2).fill($1)');

    // Integer division //
    js = js.replace(/(\([^\)]+\)|[a-zA-Z0-9_]+)\s*\/\/\s*(\([^\)]+\)|[a-zA-Z0-9_]+)/g, 'Math.floor(($1) / ($2))');

    // Booleans & operators
    js = js.replace(/\bTrue\b/g, 'true');
    js = js.replace(/\bFalse\b/g, 'false');
    js = js.replace(/\bNone\b/g, 'null');
    js = js.replace(/\band\b/g, '&&');
    js = js.replace(/\bor\b/g, '||');
    js = js.replace(/\bnot\s+/g, '!');
    js = js.replace(/len\(([^)]+)\)/g, '($1).length');
    js = js.replace(/\.append\(/g, '.push(');

    // def function_name(...)
    js = js.replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*(?:->\s*[^:]+)?\s*:/g, (match, fnName, params) => {
      const cleanParams = params.split(',').map(p => p.split(':')[0].trim()).filter(Boolean).join(', ');
      return `function ${fnName}(${cleanParams}) {`;
    });

    // loops
    js = js.replace(/for\s+([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s+in\s+enumerate\(([^)]+)\)\s*:/g, 'for (const [$1, $2] of enumerate($3)) {');
    js = js.replace(/for\s+([a-zA-Z0-9_]+)\s+in\s+range\(([^)]+)\)\s*:/g, 'for (const $1 of range($2)) {');
    js = js.replace(/for\s+([a-zA-Z0-9_]+)\s+in\s+([^:]+)\s*:/g, 'for (const $1 of ($2)) {');

    // while
    js = js.replace(/while\s+([^:]+):/g, 'while ($1) {');

    // if / elif / else
    js = js.replace(/elif\s+([^:]+):/g, '__ELIF__($1) {');
    js = js.replace(/if\s+([^:]+):/g, 'if ($1) {');
    js = js.replace(/else\s*:/g, '__ELSE__ {');

    // membership
    js = js.replace(/([a-zA-Z0-9_]+)\s+in\s+([a-zA-Z0-9_]+)/g, '($1 in $2)');

    // Indentation to braces
    const rawLines = js.split('\n');
    const outLines = [];
    const indentStack = [0];

    for (let i = 0; i < rawLines.length; i++) {
      const rawLine = rawLines[i];
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      const indent = rawLine.search(/\S/);

      if (trimmed.startsWith('__ELSE__') || trimmed.startsWith('__ELIF__')) {
        while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
          indentStack.pop();
        }
        if (trimmed.startsWith('__ELSE__')) {
          outLines.push('} else {');
        } else {
          const cond = trimmed.replace('__ELIF__(', '').replace(') {', '');
          outLines.push(`} else if (${cond}) {`);
        }
        indentStack.push(indent + 4);
        continue;
      }

      while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        outLines.push('}');
      }

      if (trimmed.endsWith('{')) {
        indentStack.push(indent + 4);
      }

      outLines.push(rawLine);
    }

    while (indentStack.length > 1) {
      indentStack.pop();
      outLines.push('}');
    }

    return runtimeHelpers + '\n' + outLines.join('\n');
  }
}
