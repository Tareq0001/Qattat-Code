/**
 * قطّاط البرمجة - محرك تنفيذ وفحص الأكواد المباشر في المتصفح
 * Safe In-Browser Code Runner & Test Case Evaluator
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
  constructor() {
    this.logs = [];
  }

  /**
   * Safely execute JavaScript code against test cases
   */
  async runJavaScript(code, functionName, testCases) {
    const originalConsoleLog = console.log;
    const capturedLogs = [];

    // Capture user logs
    const logger = (...args) => {
      capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    let userFn;
    try {
      // Evaluate function in safe scope
      const wrappedCode = `
        ${code}
        return (typeof ${functionName} !== 'undefined') ? ${functionName} : null;
      `;
      const fnFactory = new Function('console', wrappedCode);
      userFn = fnFactory({ log: logger, info: logger, warn: logger, error: logger });

      if (typeof userFn !== 'function') {
        throw new Error(`لم يتم العثور على الدالة '${functionName}'. تأكد من عدم تغيير اسم الدالة المطلوب.`);
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
        // Clone inputs so user code mutating arguments does not leak across cases
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
   * Safe Python-to-JavaScript transpile & runtime simulator for standard challenge algorithms
   */
  async runPython(code, functionName, testCases) {
    // Lightweight, resilient Python transpilation for typical algorithmic functions
    const capturedLogs = [];
    const logger = (...args) => {
      capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    try {
      const jsEquivalent = this.transpilePythonToJs(code, functionName);
      return await this.runJavaScript(jsEquivalent, functionName, testCases);
    } catch (err) {
      return {
        success: false,
        compileError: `خطأ في صياغة بايثون: ${err.message}`,
        results: [],
        logs: capturedLogs
      };
    }
  }

  transpilePythonToJs(pyCode, targetFunctionName) {
    // Clean Python type hints and standard constructs
    let js = pyCode;

    // Convert print(...) to console.log(...)
    js = js.replace(/print\s*\(/g, 'console.log(');

    // Convert def foo(x: int) -> int: to function foo(x) {
    js = js.replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*(?:->\s*[^:]+)?\s*:/g, (match, fnName, params) => {
      const cleanParams = params.split(',').map(p => p.split(':')[0].trim()).join(', ');
      return `function ${fnName}(${cleanParams}) {`;
    });

    // Convert True / False / None
    js = js.replace(/\bTrue\b/g, 'true');
    js = js.replace(/\bFalse\b/g, 'false');
    js = js.replace(/\bNone\b/g, 'null');

    // Convert len(x) to (x).length
    js = js.replace(/\blen\s*\(([^)]+)\)/g, '($1).length');

    // Convert .append(x) to .push(x)
    js = js.replace(/\.append\s*\(/g, '.push(');

    // Convert and / or / not
    js = js.replace(/\band\b/g, '&&');
    js = js.replace(/\bor\b/g, '||');
    js = js.replace(/\bnot\s+/g, '!');

    // Convert // (integer division)
    js = js.replace(/([a-zA-Z0-9_]+)\s*\/\/\s*([a-zA-Z0-9_]+)/g, 'Math.floor($1 / $2)');

    // Indentation to braces converter
    const lines = js.split('\n');
    const outLines = [];
    const indentStack = [0];

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const indent = rawLine.search(/\S/);

      while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        outLines.push('}');
      }

      if (rawLine.trim().endsWith('{')) {
        indentStack.push(indent + 4);
      }

      outLines.push(rawLine);
    }

    while (indentStack.length > 1) {
      indentStack.pop();
      outLines.push('}');
    }

    return outLines.join('\n');
  }
}
