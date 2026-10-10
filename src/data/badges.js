/**
 * قطّاط البرمجة - نظام الرتب والأوسمة التراثية
 * Heritage Badges & Ranks Definition
 * Author: 🏛️ أ. طارق ابوعشي
 */

export const RANKS = [
  {
    id: 'rank-1',
    titleAr: 'مبتدئ النقش',
    titleEn: 'Novice Painter',
    minXp: 0,
    maxXp: 99,
    symbol: 'بَنَة أولى',
    badgeColor: '#94a3b8',
    descriptionAr: 'خطوتك الأولى في محراب فن القط والبرمجة. تتعلم الأنماط البسيطة والمفاهيم الأولية.'
  },
  {
    id: 'rank-2',
    titleAr: 'ممارس البَنَة',
    titleEn: 'Bana Apprentice',
    minXp: 100,
    maxXp: 249,
    symbol: 'بَنَة متقابلة',
    badgeColor: '#15803d',
    descriptionAr: 'أتقنت رسم المثلثات الأساسية وبناء الدوال الخوارزمية المتوازنة.'
  },
  {
    id: 'rank-3',
    titleAr: 'حِرفي المشط',
    titleEn: 'Misht Craftsman',
    minXp: 250,
    maxXp: 449,
    symbol: 'مشط متناوب',
    badgeColor: '#1d4ed8',
    descriptionAr: 'تحكمت في التكرارات المتتابعة والمصفوفات بدقة متناهية تشبه تسنينات المشط.'
  },
  {
    id: 'rank-4',
    titleAr: 'فنان السكرانة',
    titleEn: 'Sakranah Artisan',
    minXp: 450,
    maxXp: 699,
    symbol: 'سكرانة متدفقة',
    badgeColor: '#d97706',
    descriptionAr: 'امتلكت مهارة التناوب المنطقي والتعامل مع الخوارزميات الديناميكية المعقدة.'
  },
  {
    id: 'rank-5',
    titleAr: 'مهندس المحاريب',
    titleEn: 'Mihrab Architect',
    minXp: 700,
    maxXp: 999,
    symbol: 'محراب متوج',
    badgeColor: '#c22b26',
    descriptionAr: 'بنيت هياكل بيانات متقدمة وأقواس برمجية شامخة كأبواب وقلاع عسير التاريخية.'
  },
  {
    id: 'rank-6',
    titleAr: 'معلم القط البرمجي',
    titleEn: 'Grand Qatt Master',
    minXp: 1000,
    maxXp: Infinity,
    symbol: 'جدارية الختام الكبرى',
    badgeColor: '#eab308',
    descriptionAr: 'الرتبة الأسمى! جمعت بين عبقرية هندسة الخوارزميات وعراقة الفن العسيري الخالد.'
  }
];

export const BADGES = [
  {
    id: 'badge-first-blood',
    titleAr: 'وسام البَنَة الأولي',
    titleEn: 'First Bana Badge',
    descriptionAr: 'يُمنح لحل أول تحدٍّ برمجي بنجاح على منصة قطّاط.',
    iconSvg: `<svg viewBox="0 0 40 40" class="badge-icon"><polygon points="20,6 34,34 6,34" fill="#c22b26"/><polygon points="20,16 28,32 12,32" fill="#eab308"/></svg>`,
    conditionCheck: (progress) => (progress.completedChallenges || []).length >= 1
  },
  {
    id: 'badge-misht-master',
    titleAr: 'وسام المشط المتناسق',
    titleEn: 'Harmonic Misht Badge',
    descriptionAr: 'يُمنح لحل 3 تحديات برمجية واكتمال التناسق المنطقي.',
    iconSvg: `<svg viewBox="0 0 40 40" class="badge-icon"><rect x="6" y="8" width="28" height="6" fill="#1d4ed8" rx="2"/><rect x="8" y="16" width="4" height="18" fill="#15803d"/><rect x="15" y="16" width="4" height="18" fill="#eab308"/><rect x="22" y="16" width="4" height="18" fill="#c22b26"/><rect x="29" y="16" width="4" height="18" fill="#15803d"/></svg>`,
    conditionCheck: (progress) => (progress.completedChallenges || []).length >= 3
  },
  {
    id: 'badge-sakranah-zen',
    titleAr: 'وسام السكرانة المتقنة',
    titleEn: 'Sakranah Precision',
    descriptionAr: 'يُمنح لاجتياز تحدٍّ من المستوى المتوسط أو المتقدم بنجاح تام.',
    iconSvg: `<svg viewBox="0 0 40 40" class="badge-icon"><polygon points="8,10 20,28 32,10" fill="#eab308"/><circle cx="20" cy="20" r="5" fill="#c22b26"/><polygon points="14,14 26,14 20,24" fill="#15803d"/></svg>`,
    conditionCheck: (progress, challenges) => {
      const completed = progress.completedChallenges || [];
      return challenges.some(c => completed.includes(c.id) && (c.difficulty === 'intermediate' || c.difficulty === 'advanced'));
    }
  },
  {
    id: 'badge-lab-artisan',
    titleAr: 'وسام محراب الكود',
    titleEn: 'Mihrab Lab Creator',
    descriptionAr: 'يُمنح لتوليد وتصدير جدارية تراثية من "مختبر القط البرمجي".',
    iconSvg: `<svg viewBox="0 0 40 40" class="badge-icon"><path d="M8,34 L8,18 Q20,6 32,18 L32,34 Z" fill="none" stroke="#c22b26" stroke-width="3"/><path d="M14,34 L14,22 Q20,14 26,22 L26,34 Z" fill="#15803d"/><circle cx="20" cy="18" r="3" fill="#eab308"/></svg>`,
    conditionCheck: (progress) => !!progress.labExported
  },
  {
    id: 'badge-sarawat-peaks',
    titleAr: 'وسام قمم السراة',
    titleEn: 'Sarawat Peaks Badge',
    descriptionAr: 'يُمنح لحل تحدٍّ خوارزمي متقدم في مسار الخوارزميات.',
    iconSvg: `<svg viewBox="0 0 40 40" class="badge-icon"><polygon points="6,34 20,10 34,34" fill="#1d4ed8"/><polygon points="12,34 20,20 28,34" fill="#eab308"/><polygon points="17,34 20,28 23,34" fill="#c22b26"/></svg>`,
    conditionCheck: (progress, challenges) => {
      const completed = progress.completedChallenges || [];
      return challenges.some(c => completed.includes(c.id) && c.track === 'algorithms' && c.difficulty === 'advanced');
    }
  },
  {
    id: 'badge-grand-mural',
    titleAr: 'وسام الجدارية الكبرى',
    titleEn: 'Grand Mural Master',
    descriptionAr: 'يُمنح عند تجميع 300 نقطة قط (XP) أو أكثر في سجل إنجازاتك.',
    iconSvg: `<svg viewBox="0 0 40 40" class="badge-icon"><circle cx="20" cy="20" r="16" fill="#18181b" stroke="#eab308" stroke-width="2"/><polygon points="20,8 24,16 32,16 26,22 28,30 20,25 12,30 14,22 8,16 16,16" fill="#eab308"/></svg>`,
    conditionCheck: (progress) => (progress.totalXp || 0) >= 300
  }
];
