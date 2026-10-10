/**
 * قطّاط البرمجة - محرك تنفيذ وفحص الأكواد المتقدم في المتصفح
 * Production-Grade In-Browser Code Runner & Test Evaluator
 * Supports Native JavaScript & Full In-Browser Python 3 (via Skulpt + Driver Harness)
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
  constructor() {
    this.isSkulptReady = typeof window !== 'undefined' && typeof window.Sk !== 'undefined';
  }

  /**
   * Execute JavaScript safely in browser with console interception & benchmarking
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
   * Uses Skulpt engine when available with Python test harness
   */
  async runPython(code, functionName, testCases) {
    // If Skulpt is available in the browser window
    if (typeof window !== 'undefined' && window.Sk) {
      return this._runPythonWithSkulpt(code, functionName, testCases);
    }

    // Fallback: Transpile/Execute via simulated JS runner
    return this._runPythonFallback(code, functionName, testCases);
  }

  async _runPythonWithSkulpt(code, functionName, testCases) {
    const logs = [];
    const outf = (text) => {
      // Don't log driver sentinel lines
      if (!text.includes('__TEST_OUTPUT_') && text.trim().length > 0) {
        logs.push(text.trimEnd());
      }
    };

    const builtinRead = (x) => {
      if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined) {
        throw new Error("File not found: '" + x + "'");
      }
      return window.Sk.builtinFiles["files"][x];
    };

    window.Sk.configure({
      output: outf,
      read: builtinRead,
      __future__: window.Sk.python3
    });

    // Prepare driver script
    const safeInputs = JSON.stringify(testCases.map(tc => ({ id: tc.id, input: tc.input })));

    const driverCode = `
import json

${code}

_inputs = json.loads('''${safeInputs}''')
_raw_results = []

for _item in _inputs:
    try:
        _out = ${functionName}(*_item['input'])
        _raw_results.append({'id': _item['id'], 'actual': _out, 'error': None})
    except Exception as _e:
        _raw_results.append({'id': _item['id'], 'actual': None, 'error': str(_e)})

print("__TEST_OUTPUT_START__")
print(json.dumps(_raw_results))
print("__TEST_OUTPUT_END__")
`;

    let allOutput = '';
    const captureAll = (t) => {
      allOutput += t;
      outf(t);
    };

    window.Sk.configure({
      output: captureAll,
      read: builtinRead,
      __future__: window.Sk.python3
    });

    try {
      const startTime = performance.now();
      await window.Sk.misceval.asyncToPromise(() => {
        return window.Sk.importMainWithBody('<stdin>', false, driverCode, true);
      });
      const totalDuration = Math.round(performance.now() - startTime);

      // Extract JSON results from output
      const startMarker = '__TEST_OUTPUT_START__';
      const endMarker = '__TEST_OUTPUT_END__';
      const startIdx = allOutput.indexOf(startMarker);
      const endIdx = allOutput.indexOf(endMarker);

      if (startIdx === -1 || endIdx === -1) {
        throw new Error('لم يتم إرجاع نتائج الفحص بصيغة صالحة.');
      }

      const jsonStr = allOutput.substring(startIdx + startMarker.length, endIdx).trim();
      const rawResults = JSON.parse(jsonStr);

      const results = [];
      let allPassed = true;

      for (const tc of testCases) {
        const found = rawResults.find(r => r.id === tc.id);
        if (!found) {
          allPassed = false;
          results.push({
            id: tc.id,
            displayInput: tc.displayInput,
            expected: tc.expected,
            actual: null,
            passed: false,
            error: 'لم يتم تنفيذ الحالة',
            durationMs: 0,
            isHidden: tc.isHidden
          });
          continue;
        }

        const passed = !found.error && isDeepEqual(found.actual, tc.expected);
        if (!passed) allPassed = false;

        results.push({
          id: tc.id,
          displayInput: tc.displayInput,
          expected: tc.expected,
          actual: found.actual,
          passed,
          error: found.error,
          durationMs: Math.round(totalDuration / testCases.length),
          isHidden: tc.isHidden
        });
      }

      return {
        success: allPassed,
        results,
        logs: logs.filter(l => !l.includes('__TEST_OUTPUT_'))
      };

    } catch (pyErr) {
      return {
        success: false,
        compileError: pyErr.toString(),
        results: [],
        logs
      };
    }
  }

  async _runPythonFallback(code, functionName, testCases) {
    // Resilient fallback when Skulpt is offline
    const capturedLogs = [];
    try {
      const jsEquivalent = this._transpilePythonToJs(code, functionName);
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

  _transpilePythonToJs(pyCode, targetFunctionName) {
    let js = pyCode;
    js = js.replace(/print\s*\(/g, 'console.log(');

    // Convert def foo(x: int) -> int: to function foo(x) {
    js = js.replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*(?:->\s*[^:]+)?\s*:/g, (match, fnName, params) => {
      const cleanParams = params.split(',').map(p => p.split(':')[0].trim()).join(', ');
      return `function ${fnName}(${cleanParams}) {`;
    });

    js = js.replace(/\bTrue\b/g, 'true');
    js = js.replace(/\bFalse\b/g, 'false');
    js = js.replace(/\bNone\b/g, 'null');
    js = js.replace(/\blen\s*\(([^)]+)\)/g, '($1).length');
    js = js.replace(/\.append\s*\(/g, '.push(');
    js = js.replace(/\band\b/g, '&&');
    js = js.replace(/\bor\b/g, '||');
    js = js.replace(/\bnot\s+/g, '!');
    js = js.replace(/([a-zA-Z0-9_]+)\s*\/\/\s*([a-zA-Z0-9_]+)/g, 'Math.floor($1 / $2)');

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
