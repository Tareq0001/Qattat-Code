/**
 * قطّاط البرمجة - منسق الواجهة التفاعلية وتجربة المستخدم
 * Master UI Coordinator & State Management with Ace Editor & Skulpt Integration
 * 
 * Author: 🏛️ أ. طارق ابوعشي
 */

import { CHALLENGES } from '../data/challenges.js?v=2.2.0';
import { RANKS, BADGES } from '../data/badges.js?v=2.2.0';
import { CodeRunner } from '../engine/runner.js?v=2.2.0';
import { QattGenerator } from '../engine/qatt-generator.js?v=2.2.0';

class QattatApp {
  constructor() {
    this.runner = new CodeRunner();
    this.generator = new QattGenerator();

    this.state = this.loadState();
    this.currentTab = 'challenges';
    this.selectedChallenge = CHALLENGES[0];
    this.activeLanguage = this.selectedChallenge.track === 'python' ? 'python' : 'javascript';
    this.filterTrack = 'all';
    this.filterDiff = 'all';
    this.searchQuery = '';
    this.consoleOutput = null;
    this.testResults = null;
    this.compileError = null;
    this.aceEditor = null;

    // Lab state
    this.labParams = {
      patternType: 'grand-mural',
      rows: 4,
      cols: 10,
      strokeWidth: 1.5,
      symmetry: 'horizontal'
    };
  }

  loadState() {
    const defaultState = {
      completedChallenges: [],
      totalXp: 0,
      unlockedBadges: [],
      savedCode: {},
      theme: 'dark',
      labExported: false
    };

    try {
      const raw = localStorage.getItem('qattat_code_state');
      return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
    } catch (e) {
      return defaultState;
    }
  }

  saveState() {
    try {
      localStorage.setItem('qattat_code_state', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save state to localStorage:', e);
    }
  }

  getCurrentRank() {
    const xp = this.state.totalXp;
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].minXp) {
        return RANKS[i];
      }
    }
    return RANKS[0];
  }

  getNextRank() {
    const current = this.getCurrentRank();
    const idx = RANKS.findIndex(r => r.id === current.id);
    return (idx < RANKS.length - 1) ? RANKS[idx + 1] : null;
  }

  init() {
    document.documentElement.setAttribute('data-theme', this.state.theme);
    this.checkBadges(false);
    this.render();
  }

  setTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    this.saveState();
    if (this.aceEditor) {
      const aceTheme = theme === 'dark' ? 'ace/theme/tomorrow_night_eighties' : 'ace/theme/chrome';
      this.aceEditor.setTheme(aceTheme);
    }
    this.render();
  }

  switchTab(tab) {
    // If leaving workspace, destroy existing editor instance cleanly
    if (this.currentTab === 'workspace' && tab !== 'workspace' && this.aceEditor) {
      this.saveCurrentCodeFromEditor();
      this.aceEditor.destroy();
      this.aceEditor = null;
    }

    this.currentTab = tab;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openChallenge(challengeId) {
    if (this.aceEditor) {
      this.saveCurrentCodeFromEditor();
      this.aceEditor.destroy();
      this.aceEditor = null;
    }

    const found = CHALLENGES.find(c => c.id === challengeId);
    if (found) {
      this.selectedChallenge = found;
      this.activeLanguage = found.track === 'python' ? 'python' : 'javascript';
      this.consoleOutput = null;
      this.testResults = null;
      this.compileError = null;
      this.currentTab = 'workspace';
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getChallengeCode(challengeId, lang) {
    const key = `${challengeId}_${lang}`;
    if (this.state.savedCode[key]) {
      return this.state.savedCode[key];
    }
    return this.selectedChallenge.starterCode[lang] || '';
  }

  saveChallengeCode(challengeId, lang, code) {
    const key = `${challengeId}_${lang}`;
    this.state.savedCode[key] = code;
    this.saveState();
  }

  saveCurrentCodeFromEditor() {
    if (this.aceEditor) {
      const val = this.aceEditor.getValue();
      this.saveChallengeCode(this.selectedChallenge.id, this.activeLanguage, val);
    }
  }

  resetCurrentCode() {
    const key = `${this.selectedChallenge.id}_${this.activeLanguage}`;
    delete this.state.savedCode[key];
    this.saveState();
    const resetCode = this.selectedChallenge.starterCode[this.activeLanguage] || '';
    if (this.aceEditor) {
      this.aceEditor.setValue(resetCode, -1);
    } else {
      const fallback = document.getElementById('code-editor-fallback');
      if (fallback) fallback.value = resetCode;
    }
  }

  getCurrentCode() {
    if (this.aceEditor) {
      return this.aceEditor.getValue();
    }
    const fallback = document.getElementById('code-editor-fallback');
    return fallback ? fallback.value : this.getChallengeCode(this.selectedChallenge.id, this.activeLanguage);
  }

  async runCode() {
    const code = this.getCurrentCode();
    this.saveChallengeCode(this.selectedChallenge.id, this.activeLanguage, code);

    const firstTestCase = [this.selectedChallenge.testCases[0]];
    const consoleBox = document.getElementById('console-output-box');
    if (consoleBox) {
      consoleBox.innerHTML = '<span style="color:#38bdf8;">⏳ جاري فحص وتشغيل الكود (حالة الاختبار الأولى)...</span>';
    }

    let result;
    if (this.activeLanguage === 'python') {
      result = await this.runner.runPython(code, this.selectedChallenge.functionName, firstTestCase);
    } else {
      result = await this.runner.runJavaScript(code, this.selectedChallenge.functionName, firstTestCase);
    }

    this.testResults = result.results;
    this.consoleOutput = result.logs;
    this.compileError = result.compileError;
    this.renderConsole();
  }

  async submitSolution() {
    const code = this.getCurrentCode();
    this.saveChallengeCode(this.selectedChallenge.id, this.activeLanguage, code);

    const consoleBox = document.getElementById('console-output-box');
    if (consoleBox) {
      consoleBox.innerHTML = '<span style="color:#eab308;">⚡ جاري فحص كافة حالات الاختبار (المعلنة والخفية)...</span>';
    }

    let result;
    if (this.activeLanguage === 'python') {
      result = await this.runner.runPython(code, this.selectedChallenge.functionName, this.selectedChallenge.testCases);
    } else {
      result = await this.runner.runJavaScript(code, this.selectedChallenge.functionName, this.selectedChallenge.testCases);
    }

    this.testResults = result.results;
    this.consoleOutput = result.logs;
    this.compileError = result.compileError;

    if (result.success) {
      const isFirstSolve = !this.state.completedChallenges.includes(this.selectedChallenge.id);
      if (isFirstSolve) {
        this.state.completedChallenges.push(this.selectedChallenge.id);
        this.state.totalXp += this.selectedChallenge.xp;
        this.saveState();
        this.showCelebrationModal(this.selectedChallenge);
      }
      this.checkBadges(true);
    }

    this.renderConsole();
    this.renderHeaderStats();
  }

  checkBadges(notify = true) {
    let newlyUnlocked = false;
    for (const b of BADGES) {
      if (!this.state.unlockedBadges.includes(b.id)) {
        if (b.conditionCheck(this.state, CHALLENGES)) {
          this.state.unlockedBadges.push(b.id);
          newlyUnlocked = true;
          if (notify) {
            this.showToast(`🎉 وسام جديد: ${b.titleAr}`, b.descriptionAr);
          }
        }
      }
    }
    if (newlyUnlocked) {
      this.saveState();
    }
  }

  showToast(title, msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      background: var(--bg-card);
      border: 1px solid var(--qatt-gold);
      border-right: 5px solid var(--qatt-gold);
      padding: 14px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 1000;
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      gap: 4px;
      animation: slideUp 0.3s ease;
    `;
    toast.innerHTML = `<strong style="color:var(--qatt-ochre);">${title}</strong><span style="font-size:0.85rem;color:var(--text-muted);">${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4500);
  }

  showCelebrationModal(challenge) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      animation: fadeIn 0.25s ease;
    `;
    modal.innerHTML = `
      <div style="background:var(--bg-card); border:2px solid var(--qatt-gold); border-radius:18px; padding:32px; max-width:480px; width:90%; text-align:center; box-shadow:0 20px 50px rgba(0,0,0,0.5);">
        <div style="font-size:3rem; margin-bottom:12px;">🎨 🏛️ ✨</div>
        <h2 style="font-size:1.4rem; color:var(--qatt-crimson); margin-bottom:8px;">إتقان مبهر في محراب القط!</h2>
        <p style="font-size:0.95rem; color:var(--text-muted); margin-bottom:20px;">
          اجتزت بنجاح تحدي "<strong>${challenge.titleAr}</strong>" وكسبت <strong>+${challenge.xp} نقطة قط</strong> إلى رصيدك التراثي.
        </p>
        <div style="display:flex; justify-content:center; gap:12px;">
          <button class="btn-primary-crimson" id="close-celebration-btn" style="padding:10px 24px;">متابعة الرحلة</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('close-celebration-btn').onclick = () => modal.remove();
  }

  exportLabMural() {
    const svgMarkup = this.generator.generateSvg(this.labParams);
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qatt_mural_${this.labParams.patternType}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    this.state.labExported = true;
    this.saveState();
    this.checkBadges(true);
    this.showToast('تم تصدير الجدارية بنجاح!', 'تم تنزيل ملف SVG عالي الدقة، ونلت وسام محراب الكود.');
  }

  render() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    appEl.innerHTML = `
      <!-- Header -->
      <header class="asiri-header">
        <div class="header-inner">
          <div class="brand-wrapper" onclick="window.app.switchTab('challenges')">
            <svg class="brand-logo-icon" viewBox="0 0 40 40">
              <polygon points="20,4 36,36 4,36" fill="#c22b26"/>
              <polygon points="20,16 30,34 10,34" fill="#e5a912"/>
              <polygon points="20,24 26,34 14,34" fill="#15803d"/>
            </svg>
            <div class="brand-title">
              <span>قطّاط البرمجة</span>
              <span class="brand-tag">Qattat Code</span>
            </div>
          </div>

          <div class="nav-tabs-wrapper">
            <button class="nav-tab-btn ${this.currentTab === 'challenges' ? 'active' : ''}" onclick="window.app.switchTab('challenges')">
              💻 التحديات
            </button>
            <button class="nav-tab-btn ${this.currentTab === 'workspace' ? 'active' : ''}" onclick="window.app.switchTab('workspace')">
              ⚡ محرر التدريب
            </button>
            <button class="nav-tab-btn ${this.currentTab === 'lab' ? 'active' : ''}" onclick="window.app.switchTab('lab')">
              🎨 مختبر القط
            </button>
            <button class="nav-tab-btn ${this.currentTab === 'badges' ? 'active' : ''}" onclick="window.app.switchTab('badges')">
              🏆 الرتب والأوسمة
            </button>
            <button class="nav-tab-btn ${this.currentTab === 'guide' ? 'active' : ''}" onclick="window.app.switchTab('guide')">
              📖 دليل فن القط
            </button>
          </div>

          <div class="header-actions" id="header-stats-container">
            ${this.renderHeaderStatsMarkup()}
          </div>
        </div>
        <div class="khetam-ribbon"></div>
      </header>

      <!-- Main Body -->
      <main class="main-content">
        ${this.renderActiveTabContent()}
      </main>

      <!-- Footer -->
      <footer style="border-top:1px solid var(--border-hairline); background:var(--bg-card); padding:20px; text-align:center; font-size:0.82rem; color:var(--text-muted);">
        منصة <strong>قطّاط البرمجة (Qattat Code)</strong> — إبداع وتطوير <strong>أ. طارق ابوعشي</strong> &copy; 2026.
        تراث القط العسيري مسجل في قائمة التراث الثقافي غير المادي لليونسكو.
      </footer>
    `;

    this.postRender();
  }

  renderHeaderStatsMarkup() {
    const rank = this.getCurrentRank();
    return `
      <div class="rank-badge-pill" title="رتبتك التراثية الحالية">
        <span>🎗️</span>
        <span>${rank.titleAr}</span>
      </div>
      <div class="xp-counter-pill" title="نقاط القط المكتسبة">
        <span style="color:var(--qatt-ochre);">✦</span>
        <span>${this.state.totalXp} XP</span>
      </div>
      <button class="icon-btn" onclick="window.app.setTheme(window.app.state.theme === 'dark' ? 'light' : 'dark')" title="تبديل الوضع">
        ${this.state.theme === 'dark' ? '☀️' : '🌙'}
      </button>
    `;
  }

  renderHeaderStats() {
    const container = document.getElementById('header-stats-container');
    if (container) {
      container.innerHTML = this.renderHeaderStatsMarkup();
    }
  }

  renderActiveTabContent() {
    switch (this.currentTab) {
      case 'challenges': return this.renderChallengesView();
      case 'workspace': return this.renderWorkspaceView();
      case 'lab': return this.renderLabView();
      case 'badges': return this.renderBadgesView();
      case 'guide': return this.renderGuideView();
      default: return this.renderChallengesView();
    }
  }

  /* 1. Challenges Explorer */
  renderChallengesView() {
    const filtered = CHALLENGES.filter(c => {
      const matchTrack = this.filterTrack === 'all' || c.track === this.filterTrack;
      const matchDiff = this.filterDiff === 'all' || c.difficulty === this.filterDiff;
      const matchSearch = !this.searchQuery || 
        c.titleAr.includes(this.searchQuery) || 
        c.descriptionAr.includes(this.searchQuery) || 
        c.category.includes(this.searchQuery);
      return matchTrack && matchDiff && matchSearch;
    });

    return `
      <div style="display:flex; flex-direction:column; gap:24px;">
        
        <!-- Welcome Hero Banner -->
        <div style="background:var(--bg-card); border:1px solid var(--border-hairline); border-radius:var(--radius-lg); padding:28px 32px; display:flex; justify-content:space-between; align-items:center; position:relative; overflow:hidden;">
          <div style="max-width:680px; position:relative; z-index:2;">
            <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(194,43,38,0.08); color:var(--qatt-crimson); font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:999px; margin-bottom:12px;">
              <span>🏛️</span> فن القط العسيري يلتقي بهندسة البرمجيات
            </div>
            <h1 style="font-size:1.75rem; font-weight:800; color:var(--text-main); margin-bottom:10px; line-height:1.3;">
              انقش كودك بدقة المثلثات وتناغم الألوان العسيرية
            </h1>
            <p style="font-size:0.92rem; color:var(--text-muted); line-height:1.6;">
              تحديات برمجية أصيلة متدرجة في بايثون وجافاسكريبت والخوارزميات، مع محرر تشغيل فوري، وفحص تلقائي، وحلول نموذجية، ونظام رتب تراثي ملهم.
            </p>
          </div>
          <div style="width:140px; height:120px; opacity:0.85;">
            <svg viewBox="0 0 100 90">
              <polygon points="50,5 90,85 10,85" fill="none" stroke="#c22b26" stroke-width="4"/>
              <polygon points="50,25 80,85 20,85" fill="#e5a912"/>
              <polygon points="50,45 70,85 30,85" fill="#15803d"/>
            </svg>
          </div>
        </div>

        <!-- Filters Bar -->
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:14px; background:var(--bg-card); padding:16px 20px; border-radius:var(--radius-md); border:1px solid var(--border-hairline);">
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px;">
            <span style="font-size:0.82rem; font-weight:700; color:var(--text-muted); margin-left:6px;">المسار:</span>
            <button class="btn-secondary ${this.filterTrack === 'all' ? 'active' : ''}" style="${this.filterTrack === 'all' ? 'background:var(--bg-primary); border-color:var(--qatt-blue); color:var(--qatt-blue);' : ''}" onclick="window.app.setFilter('track', 'all')">الكل</button>
            <button class="btn-secondary ${this.filterTrack === 'python' ? 'active' : ''}" style="${this.filterTrack === 'python' ? 'background:var(--bg-primary); border-color:var(--qatt-blue); color:var(--qatt-blue);' : ''}" onclick="window.app.setFilter('track', 'python')">🐍 بايثون</button>
            <button class="btn-secondary ${this.filterTrack === 'javascript' ? 'active' : ''}" style="${this.filterTrack === 'javascript' ? 'background:var(--bg-primary); border-color:var(--qatt-blue); color:var(--qatt-blue);' : ''}" onclick="window.app.setFilter('track', 'javascript')">⚡ جافاسكريبت</button>
            <button class="btn-secondary ${this.filterTrack === 'algorithms' ? 'active' : ''}" style="${this.filterTrack === 'algorithms' ? 'background:var(--bg-primary); border-color:var(--qatt-blue); color:var(--qatt-blue);' : ''}" onclick="window.app.setFilter('track', 'algorithms')">📐 الخوارزميات</button>
          </div>

          <div style="display:flex; align-items:center; gap:12px;">
            <select style="background:var(--bg-secondary); border:1px solid var(--border-hairline); color:var(--text-main); padding:6px 12px; border-radius:var(--radius-md); font-family:inherit; font-size:0.85rem;" onchange="window.app.setFilter('diff', this.value)">
              <option value="all" ${this.filterDiff === 'all' ? 'selected' : ''}>كافة المستويات</option>
              <option value="beginner" ${this.filterDiff === 'beginner' ? 'selected' : ''}>مبتدئ</option>
              <option value="intermediate" ${this.filterDiff === 'intermediate' ? 'selected' : ''}>متوسط</option>
              <option value="advanced" ${this.filterDiff === 'advanced' ? 'selected' : ''}>متقدم</option>
            </select>

            <input type="text" placeholder="بحث في التحديات..." value="${this.searchQuery}" oninput="window.app.searchChallenges(this.value)" style="background:var(--bg-secondary); border:1px solid var(--border-hairline); color:var(--text-main); padding:6px 12px; border-radius:var(--radius-md); font-family:inherit; font-size:0.85rem; width:180px;">
          </div>
        </div>

        <!-- Challenges Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:20px;">
          ${filtered.map(c => this.renderChallengeCard(c)).join('')}
        </div>

      </div>
    `;
  }

  renderChallengeCard(c) {
    const isCompleted = this.state.completedChallenges.includes(c.id);
    const diffClass = `diff-${c.difficulty}`;
    const diffText = c.difficulty === 'beginner' ? 'مبتدئ' : c.difficulty === 'intermediate' ? 'متوسط' : 'متقدم';

    return `
      <div style="background:var(--bg-card); border:1px solid ${isCompleted ? 'rgba(21,128,61,0.35)' : 'var(--border-hairline)'}; border-radius:var(--radius-lg); padding:22px; display:flex; flex-direction:column; justify-content:space-between; gap:16px; box-shadow:var(--shadow-sm); position:relative; transition:all 0.2s;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform='none'">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span class="track-pill">${c.track.toUpperCase()}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="difficulty-badge ${diffClass}">${diffText}</span>
              ${isCompleted ? '<span style="color:var(--qatt-green); font-size:1.1rem;" title="مكتمل">✓</span>' : ''}
            </div>
          </div>
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:6px;">${c.titleAr}</h3>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:8px;">${c.category}</div>
          <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${c.descriptionAr}
          </p>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-hairline); padding-top:14px;">
          <span style="font-size:0.82rem; font-weight:700; color:var(--qatt-ochre); font-family:var(--font-mono);">+${c.xp} XP</span>
          <button class="btn-primary-crimson" style="padding:6px 16px; font-size:0.82rem;" onclick="window.app.openChallenge('${c.id}')">
            ${isCompleted ? 'مراجعة الكود' : 'ابدأ التحدي'} ←
          </button>
        </div>
      </div>
    `;
  }

  setFilter(type, val) {
    if (type === 'track') this.filterTrack = val;
    if (type === 'diff') this.filterDiff = val;
    this.render();
  }

  searchChallenges(val) {
    this.searchQuery = val.trim();
    this.render();
  }

  /* 2. Workspace View (Two-Zone Layout) */
  renderWorkspaceView() {
    const c = this.selectedChallenge;
    const isCompleted = this.state.completedChallenges.includes(c.id);

    return `
      <div class="workspace-grid">
        
        <!-- Right Zone: Problem Description, Constraints, Hints, Solution -->
        <div class="problem-panel">
          <div class="panel-header-row">
            <div>
              <span class="track-pill" style="margin-left:6px;">${c.track.toUpperCase()}</span>
              <span class="difficulty-badge diff-${c.difficulty}">
                ${c.difficulty === 'beginner' ? 'مبتدئ' : c.difficulty === 'intermediate' ? 'متوسط' : 'متقدم'}
              </span>
            </div>
            <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="window.app.switchTab('challenges')">
              ← قائمة التحديات
            </button>
          </div>

          <div>
            <h1 style="font-size:1.35rem; font-weight:800; color:var(--text-main); margin-bottom:8px;">${c.titleAr}</h1>
            <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.7;">${c.descriptionAr}</p>
          </div>

          <!-- Constraints -->
          <div>
            <div class="section-label">📌 القيود والشروط:</div>
            <ul style="padding-right:20px; font-size:0.84rem; color:var(--text-muted); line-height:1.6;">
              ${c.constraints.map(item => `<li><span class="code-inline" dir="ltr">${item}</span></li>`).join('')}
            </ul>
          </div>

          <!-- Examples -->
          <div>
            <div class="section-label">💡 أمثلة المدخلات والمخرجات:</div>
            ${c.examples.map((ex, i) => `
              <div class="example-box">
                <div style="font-weight:700; margin-bottom:4px;">مثال ${i + 1}:</div>
                <div style="margin-top:2px;">المدخل: <span class="code-inline" dir="ltr">${ex.input}</span></div>
                <div style="margin-top:4px;">المخرج: <span class="code-inline" dir="ltr">${ex.output}</span></div>
                <div style="margin-top:6px; color:var(--text-muted); font-size:0.8rem;">${ex.explanationAr}</div>
              </div>
            `).join('')}
          </div>

          <!-- Progressive Hints -->
          <div>
            <div class="section-label">🔍 التلميحات المتدرجة:</div>
            ${c.hints.map((hint, idx) => `
              <div class="hint-accordion">
                <button class="hint-trigger" onclick="this.nextElementSibling.classList.toggle('open')">
                  <span>تلميح ${idx + 1}: ${idx === 0 ? 'الفكرة العامة' : idx === 1 ? 'الخوارزمية المقترحة' : 'الحالات الحدية'}</span>
                  <span>▼</span>
                </button>
                <div class="hint-body">${hint}</div>
              </div>
            `).join('')}
          </div>

          <!-- Official Solution & Complexity Analysis -->
          <div>
            <div class="hint-accordion" style="border-color:rgba(229,169,18,0.3);">
              <button class="hint-trigger" style="background:rgba(229,169,18,0.08); color:var(--qatt-ochre); font-weight:700;" onclick="this.nextElementSibling.classList.toggle('open')">
                <span>📖 الحل النموذجي والتحليل الأكاديمي</span>
                <span>▼</span>
              </button>
              <div class="hint-body">
                <div style="margin-bottom:8px;">
                  <strong>التعقيد الزمني:</strong> <span class="code-inline" dir="ltr">${c.analysis.timeComplexity}</span> | 
                  <strong>المكاني:</strong> <span class="code-inline" dir="ltr">${c.analysis.spaceComplexity}</span>
                </div>
                <p style="font-size:0.84rem; color:var(--text-muted); margin-bottom:12px;">${c.analysis.explanationAr}</p>
                <div style="font-size:0.8rem; background:var(--bg-secondary); padding:10px; border-radius:6px; margin-bottom:12px;">
                  <strong>مقارنة الطرق:</strong> ${c.analysis.approachComparison}
                </div>
                <pre style="background:var(--bg-editor); color:#e2e8f0; padding:12px; border-radius:6px; font-family:var(--font-mono); font-size:0.8rem; direction:ltr; overflow-x:auto;"><code>${c.solution[this.activeLanguage] || c.solution.javascript}</code></pre>
              </div>
            </div>
          </div>

        </div>

        <!-- Left Zone: Code Editor & Runner Console -->
        <div class="editor-panel">
          
          <!-- Editor Toolbar -->
          <div class="editor-toolbar">
            <div class="lang-selector">
              <span style="font-size:0.75rem; color:var(--text-muted);">لغة التدريب:</span>
              <button class="lang-pill-btn ${this.activeLanguage === 'python' ? 'active' : ''}" onclick="window.app.switchLanguage('python')">Python 3</button>
              <button class="lang-pill-btn ${this.activeLanguage === 'javascript' ? 'active' : ''}" onclick="window.app.switchLanguage('javascript')">JavaScript (ES6)</button>
            </div>

            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn-secondary" style="padding:4px 12px; font-size:0.75rem;" onclick="window.app.resetCurrentCode()">
                🔄 استعادة الكود الأولي
              </button>
            </div>
          </div>

          <!-- Code Editor Mount Point (Ace Editor or Fallback) -->
          <div class="editor-core-wrapper">
            <div id="ace-editor-instance"></div>
            <textarea id="code-editor-fallback" class="code-textarea" style="display:none;" spellcheck="false"></textarea>
          </div>

          <!-- Bottom Console & Actions -->
          <div class="editor-bottom-bar">
            <div class="action-buttons-row">
              <div style="font-size:0.8rem; color:var(--text-muted);">
                ${isCompleted ? '✅ هذا التحدي مكتمل بنجاح' : 'اضغط تشغيل لاختبار الكود، أو إرسال لاعتماد التقييم'}
              </div>
              <div style="display:flex; gap:10px;">
                <button class="btn-secondary" onclick="window.app.runCode()">
                  ▶ تشغيل الكود
                </button>
                <button class="btn-primary-crimson" onclick="window.app.submitSolution()">
                  ⚡ إرسال للتقييم (+${c.xp} XP)
                </button>
              </div>
            </div>

            <!-- Console Box -->
            <div class="console-container" id="console-output-box">
              <div style="color:var(--text-muted);">[Ready] Console ready. Click 'Run Code' or 'Submit Solution' to execute.</div>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  switchLanguage(lang) {
    this.saveCurrentCodeFromEditor();
    this.activeLanguage = lang;
    if (this.aceEditor) {
      this.aceEditor.session.setMode(lang === 'python' ? 'ace/mode/python' : 'ace/mode/javascript');
      const newCode = this.getChallengeCode(this.selectedChallenge.id, lang);
      this.aceEditor.setValue(newCode, -1);
    }
    this.render();
  }

  renderConsole() {
    const box = document.getElementById('console-output-box');
    if (!box) return;

    let html = '';

    if (this.compileError) {
      html += `<div style="color:#f87171; margin-bottom:8px; font-weight:700;">[Runtime / Syntax Error]:<br><span style="font-size:0.78rem;">${this.compileError}</span></div>`;
    }

    if (this.consoleOutput && this.consoleOutput.length > 0) {
      html += `<div style="color:#38bdf8; margin-bottom:6px; font-weight:700;">[Standard Output / Print]:</div>`;
      this.consoleOutput.forEach(log => {
        html += `<div style="color:#e2e8f0; margin-left:8px;">&gt; ${log}</div>`;
      });
    }

    if (this.testResults && this.testResults.length > 0) {
      html += `<div style="margin-top:10px; font-weight:700; color:#e2e8f0;">[Test Cases Evaluation]:</div>`;
      this.testResults.forEach(r => {
        const cls = r.passed ? 'test-result-pass' : 'test-result-fail';
        html += `
          <div class="test-result-row ${cls}">
            <div>
              <strong>${r.passed ? '✓ PASSED' : '✗ FAILED'}</strong>: ${r.displayInput}
              ${r.error ? `<br><span style="color:#f87171; font-size:0.75rem;">Error: ${r.error}</span>` : ''}
            </div>
            <div style="font-size:0.75rem; text-align:right;">
              <span>Expected: ${JSON.stringify(r.expected)}</span> | 
              <span>Actual: ${JSON.stringify(r.actual)}</span> | 
              <span>${r.durationMs}ms</span>
            </div>
          </div>
        `;
      });
    }

    box.innerHTML = html || '<div style="color:var(--text-muted);">[Ready] Console ready.</div>';
    box.scrollTop = box.scrollHeight;
  }

  /* 3. Qatt Code Lab */
  renderLabView() {
    const currentSvg = this.generator.generateSvg(this.labParams);
    const codeSnippet = this.generator.generateCodeSnippet(this.labParams);

    return `
      <div class="lab-grid">
        
        <!-- Controls Panel -->
        <div class="lab-canvas-card">
          <div>
            <h2 style="font-size:1.2rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">
              🎨 محراب القط البرمجي
            </h2>
            <p style="font-size:0.84rem; color:var(--text-muted);">
              ولد جداريات القط العسيري الرياضية بالكود والبارامترات الحية، وحملها بصيغة SVG.
            </p>
          </div>

          <div>
            <label style="font-size:0.8rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">النمط التراثي الأساسي:</label>
            <select style="width:100%; background:var(--bg-secondary); border:1px solid var(--border-hairline); color:var(--text-main); padding:8px 12px; border-radius:var(--radius-md); font-family:inherit;" onchange="window.app.updateLabParam('patternType', this.value)">
              <option value="grand-mural" ${this.labParams.patternType === 'grand-mural' ? 'selected' : ''}>الجدارية الكبرى (متعدد الأشرطة)</option>
              <option value="bana" ${this.labParams.patternType === 'bana' ? 'selected' : ''}>نقش البَنَة (المثلثات المتقابلة)</option>
              <option value="misht" ${this.labParams.patternType === 'misht' ? 'selected' : ''}>نقش المشط (الأسنان المتتابعة)</option>
              <option value="sakranah" ${this.labParams.patternType === 'sakranah' ? 'selected' : ''}>نقش السكرانة (المعينات المتدفقة)</option>
              <option value="mihrab" ${this.labParams.patternType === 'mihrab' ? 'selected' : ''}>نقش المحاريب (القباب والأقواس)</option>
            </select>
          </div>

          <div>
            <label style="font-size:0.8rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">
              عدد الصفوف: <span id="lab-rows-val" style="color:var(--qatt-ochre);">${this.labParams.rows}</span>
            </label>
            <input type="range" min="1" max="6" value="${this.labParams.rows}" style="width:100%;" oninput="window.app.updateLabParam('rows', parseInt(this.value)); document.getElementById('lab-rows-val').innerText = this.value;">
          </div>

          <div>
            <label style="font-size:0.8rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">
              عدد الأعمدة: <span id="lab-cols-val" style="color:var(--qatt-ochre);">${this.labParams.cols}</span>
            </label>
            <input type="range" min="4" max="16" value="${this.labParams.cols}" style="width:100%;" oninput="window.app.updateLabParam('cols', parseInt(this.value)); document.getElementById('lab-cols-val').innerText = this.value;">
          </div>

          <div>
            <label style="font-size:0.8rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">سمك الإطار (Stroke):</label>
            <select style="width:100%; background:var(--bg-secondary); border:1px solid var(--border-hairline); color:var(--text-main); padding:8px 12px; border-radius:var(--radius-md); font-family:inherit;" onchange="window.app.updateLabParam('strokeWidth', parseFloat(this.value))">
              <option value="1">دقيق (1px)</option>
              <option value="1.5" selected>معياري (1.5px)</option>
              <option value="2.5">عريض (2.5px)</option>
            </select>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
            <button class="btn-primary-crimson" onclick="window.app.exportLabMural()">
              💾 تصدير الجدارية (تحميل SVG)
            </button>
          </div>
        </div>

        <!-- Canvas View -->
        <div class="lab-canvas-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div class="section-label">معاينة الجدارية الحية:</div>
            <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">Scalable Vector Graphics (SVG)</span>
          </div>

          <div class="mural-render-box" id="lab-mural-viewport">
            ${currentSvg}
          </div>

          <div>
            <div class="section-label" style="margin-top:10px;">كود التوليد البرمجي (Code Generator):</div>
            <pre style="background:var(--bg-editor); color:#e2e8f0; padding:12px; border-radius:8px; font-family:var(--font-mono); font-size:0.78rem; direction:ltr; overflow-x:auto;"><code>${codeSnippet}</code></pre>
          </div>
        </div>

      </div>
    `;
  }

  updateLabParam(key, val) {
    this.labParams[key] = val;
    const viewport = document.getElementById('lab-mural-viewport');
    if (viewport) {
      viewport.innerHTML = this.generator.generateSvg(this.labParams);
    }
  }

  /* 4. Badges & Heritage Ranking */
  renderBadgesView() {
    const currentRank = this.getCurrentRank();
    const nextRank = this.getNextRank();
    const xp = this.state.totalXp;
    const progressPercent = nextRank 
      ? Math.min(100, Math.round(((xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100))
      : 100;

    return `
      <div style="display:flex; flex-direction:column; gap:28px;">
        
        <!-- User Rank Progress Card -->
        <div style="background:var(--bg-card); border:1px solid var(--border-hairline); border-radius:var(--radius-lg); padding:28px 32px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">رتبتك التراثية الحالية في قطّاط</span>
              <h2 style="font-size:1.8rem; font-weight:800; color:${currentRank.badgeColor}; margin-top:4px;">
                ${currentRank.titleAr}
              </h2>
            </div>
            <div style="text-align:left;">
              <span style="font-size:1.8rem; font-weight:800; color:var(--qatt-ochre); font-family:var(--font-mono);">${xp} XP</span>
              <div style="font-size:0.75rem; color:var(--text-muted);">إجمالي نقاط القط</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-bottom:6px;">
              <span>${currentRank.titleAr} (${currentRank.minXp} XP)</span>
              <span>${nextRank ? `الرتبة القادمة: ${nextRank.titleAr} (${nextRank.minXp} XP)` : 'أعلى رتبة تم الوصول إليها!'}</span>
            </div>
            <div style="width:100%; height:10px; background:var(--bg-secondary); border-radius:999px; overflow:hidden;">
              <div style="width:${progressPercent}%; height:100%; background:linear-gradient(90deg, var(--qatt-ochre), var(--qatt-crimson)); border-radius:999px; transition:width 0.4s ease;"></div>
            </div>
          </div>
        </div>

        <!-- Badges Cabinet -->
        <div>
          <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px;">
            🎖️ خزانة الأوسمة التراثية
          </h2>
          <div class="badges-container">
            ${BADGES.map(b => {
              const isUnlocked = this.state.unlockedBadges.includes(b.id);
              return `
                <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
                  <div style="display:flex; align-items:center; gap:14px;">
                    <div class="badge-icon-box">
                      ${b.iconSvg}
                    </div>
                    <div>
                      <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-main);">${b.titleAr}</h4>
                      <span style="font-size:0.75rem; color:${isUnlocked ? 'var(--qatt-green)' : 'var(--text-muted)'}; font-weight:700;">
                        ${isUnlocked ? '✓ مكتسب' : '🔒 مقفل'}
                      </span>
                    </div>
                  </div>
                  <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">${b.descriptionAr}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Ranks Hierarchy Table -->
        <div>
          <h2 style="font-size:1.2rem; font-weight:800; margin-bottom:16px;">
            📜 سلم الرتب التراثية الست
          </h2>
          <div style="background:var(--bg-card); border:1px solid var(--border-hairline); border-radius:var(--radius-lg); overflow:hidden;">
            ${RANKS.map((r, idx) => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-bottom:1px solid var(--border-hairline); background:${r.id === currentRank.id ? 'rgba(229,169,18,0.06)' : 'transparent'};">
                <div style="display:flex; align-items:center; gap:16px;">
                  <span style="font-family:var(--font-mono); font-weight:700; color:var(--text-muted); font-size:0.9rem;">#${idx + 1}</span>
                  <div>
                    <strong style="color:${r.badgeColor}; font-size:1rem;">${r.titleAr}</strong>
                    <div style="font-size:0.78rem; color:var(--text-muted);">${r.descriptionAr}</div>
                  </div>
                </div>
                <div style="text-align:left; font-family:var(--font-mono); font-weight:700; font-size:0.85rem; color:var(--text-muted);">
                  ${r.minXp}+ XP
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  /* 5. Heritage Guide View */
  renderGuideView() {
    return `
      <div style="max-width:920px; margin:0 auto; display:flex; flex-direction:column; gap:28px;">
        
        <div style="background:var(--bg-card); border:1px solid var(--border-hairline); border-radius:var(--radius-lg); padding:32px; box-shadow:var(--shadow-sm);">
          <div style="display:inline-block; font-size:0.8rem; font-weight:700; color:var(--qatt-crimson); background:rgba(194,43,38,0.08); padding:4px 12px; border-radius:999px; margin-bottom:10px;">
            تراث اليونسكو الإنساني (2017)
          </div>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main); margin-bottom:12px;">
            عن فن القط العسيري وعلاقته بالهندسة البرمجية
          </h1>
          <p style="font-size:0.92rem; color:var(--text-muted); line-height:1.7; margin-bottom:16px;">
            "القَطّ" في اللهجة الجنوبية يعني الخط والتحديد والنقش. وهو فن جداري نسائي هندسي متوارث أبدعته سيدات عسير لتزيين بيوتهن الحجرية عبر مثلثات ومربعات وألوان طبيعية مستخلصة من نباتات وصخور جبال السراة وتهامة.
          </p>
          <p style="font-size:0.92rem; color:var(--text-muted); line-height:1.7;">
            في منصة <strong>قطّاط البرمجة</strong>، وجدنا تناغماً مذهلاً بين الدقة الهندسية الرياضية لفن القط وبين المبادئ الخوارزمية الحديثة في هندسة البرمجيات.
          </p>
        </div>

        <!-- 5 Elements & Software Equivalents -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:18px;">
          
          <div style="background:var(--bg-card); border:1px solid var(--border-hairline); border-radius:var(--radius-md); padding:20px;">
            <h3 style="color:var(--qatt-crimson); font-size:1.1rem; margin-bottom:6px;">🔺 البَنَة (Al-Bana)</h3>
            <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.6;">
              <strong>المفهوم التراثي:</strong> مثلثات متقابلة ومتراكبة تمثل قمم الجبال.<br>
              <strong>المعادل البرمجي:</strong> خوارزميات الاستدعاء الذاتي (Recursion)، الشجيرات الثنائية (Binary Trees)، والبرمجة الديناميكية التصاعدية.
            </p>
          </div>

          <div style="background:var(--bg-card); border:1px solid var(--border-hairline); border-radius:var(--radius-md); padding:20px;">
            <h3 style="color:var(--qatt-blue); font-size:1.1rem; margin-bottom:6px;">🪮 المشط (Al-Misht)</h3>
            <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.6;">
              <strong>المفهوم التراثي:</strong> خطوط متوازية رأسية كأسنَان المشط تنظم الإيقاع البصري.<br>
              <strong>المعادل البرمجي:</strong> حلقات التكرار (Loops)، معالجة المصفوفات المتتالية (Arrays)، والتدفقات البرمجية (Streams).
            </p>
          </div>

          <div style="background:var(--bg-card); border:1px solid var(--border-hairline); border-radius:var(--radius-md); padding:20px;">
            <h3 style="color:var(--qatt-ochre); font-size:1.1rem; margin-bottom:6px;">💎 السكرانة (Al-Sakranah)</h3>
            <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.6;">
              <strong>المفهوم التراثي:</strong> مربعات ومعينات متناوبة تتلاعب بالضوء والظل.<br>
              <strong>المعادل البرمجي:</strong> المنطق الثنائي (Bitwise Operations)، جداول الهاش (Hash Maps)، وكشف التناظر (Symmetry & Palindromes).
            </p>
          </div>

          <div style="background:var(--bg-card); border:1px solid var(--border-hairline); border-radius:var(--radius-md); padding:20px;">
            <h3 style="color:var(--qatt-green); font-size:1.1rem; margin-bottom:6px;">🕌 المحاريب (Al-Maharib)</h3>
            <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.6;">
              <strong>المفهوم التراثي:</strong> أقواس علوية تشبه قباب ومحاريب المساجد وقلاع السراة.<br>
              <strong>المعادل البرمجي:</strong> معمارية النطاقات (Domain Architecture)، العزل والكبسلة (Encapsulation)، وتوحيد نقاط الاتصال (API Gateways).
            </p>
          </div>

        </div>

      </div>
    `;
  }

  postRender() {
    if (this.currentTab === 'workspace') {
      this.mountAceEditor();
    }
  }

  mountAceEditor() {
    const editorDom = document.getElementById('ace-editor-instance');
    const fallbackDom = document.getElementById('code-editor-fallback');
    const code = this.getChallengeCode(this.selectedChallenge.id, this.activeLanguage);

    if (typeof window.ace !== 'undefined' && editorDom) {
      try {
        if (this.aceEditor) {
          this.aceEditor.destroy();
        }
        this.aceEditor = window.ace.edit("ace-editor-instance");
        const theme = this.state.theme === 'dark' ? 'ace/theme/tomorrow_night_eighties' : 'ace/theme/chrome';
        this.aceEditor.setTheme(theme);
        this.aceEditor.session.setMode(this.activeLanguage === 'python' ? 'ace/mode/python' : 'ace/mode/javascript');
        this.aceEditor.setValue(code, -1);
        this.aceEditor.setShowPrintMargin(false);
        this.aceEditor.session.setUseWrapMode(true);
        this.aceEditor.setOptions({
          tabSize: 4,
          useSoftTabs: true,
          fontSize: "15px",
          showGutter: true,
          highlightActiveLine: true,
          wrap: true
        });

        this.aceEditor.on('change', () => {
          const val = this.aceEditor.getValue();
          this.saveChallengeCode(this.selectedChallenge.id, this.activeLanguage, val);
        });

        // Hide fallback
        if (fallbackDom) fallbackDom.style.display = 'none';
        return;
      } catch (aceInitErr) {
        console.warn('Ace Editor initialization error, falling back to textarea:', aceInitErr);
      }
    }

    // Fallback if Ace is not loaded
    if (fallbackDom) {
      fallbackDom.style.display = 'block';
      fallbackDom.value = code;
      fallbackDom.oninput = () => {
        this.saveChallengeCode(this.selectedChallenge.id, this.activeLanguage, fallbackDom.value);
      };
      if (editorDom) editorDom.style.display = 'none';
    }
  }
}

// Global App Instance
window.app = new QattatApp();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
