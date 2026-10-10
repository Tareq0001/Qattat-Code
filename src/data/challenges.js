/**
 * قطّاط البرمجة - بنك التحديات البرمجية المتكامل
 * Curated Coding Challenges Bank
 * Author: 🏛️ أ. طارق ابوعشي
 */

export const CHALLENGES = [
  {
    id: 'py-01-reverse-words',
    titleAr: 'عكس كلمات النقش التراثي',
    titleEn: 'Reverse Sentence Words',
    track: 'python',
    difficulty: 'beginner',
    xp: 50,
    category: 'معالجة النصوص (Strings)',
    qattSymbol: 'bana',
    descriptionAr: `اكتب دالة تقوم بعكس ترتيب الكلمات في الجملة المعطاة مع الحفاظ على ترتيب الأحرف داخل كل كلمة، والتخلص من المسافات الزائدة بين الكلمات. في فن القط العسيري، يبدأ الفنان من طرف الجدارية وينعكس في الطرف المقابل لضمان التناظر البصري.`,
    descriptionEn: `Write a function that reverses the order of words in a given string while preserving single spaces between words and trimming extra edge whitespaces.`,
    constraints: [
      '1 <= len(s) <= 10^4',
      'تحتوي الجملة على أحرف عربية أو إنجليزية ومسافات فقط.',
      'يجب ألا يحتوي الناتج على مسافات زائدة في البداية أو النهاية.'
    ],
    examples: [
      {
        input: `"عسير تهامة السراة"`,
        output: `"السراة تهامة عسير"`,
        explanationAr: 'تم عكس ترتيب الكلمات الثلاث مع الحفاظ على مسافة واحدة فاصلة.',
        explanationEn: 'Words were reversed in sequence with single space separator.'
      },
      {
        input: `"  فن   القط   العسيري  "`,
        output: `"العسيري القط فن"`,
        explanationAr: 'تم التخلص من المسافات المتكررة وعكس ترتيب الكلمات بدقة.',
        explanationEn: 'Extra whitespace stripped and word order reversed.'
      }
    ],
    hints: [
      'ابدأ بتقسيم الجملة (Split) بالاعتماد على الفراغات، حيث تتولى الدالة تلقائياً إزالة المسافات المتعددة.',
      'استخدم تقنية الشرائح في بايثون [::-1] أو دالة reverse() لعكس مصفوفة الكلمات.',
      'ادمج الكلمات المعكوسة مجدداً باستخدام " ".join(...).'
    ],
    starterCode: {
      python: `def reverse_words(s: str) -> str:
    # اكتب حلك الأنيق هنا
    pass`,
      javascript: `function reverse_words(s) {
    // اكتب حلك الأنيق هنا
    return "";
}`
    },
    functionName: 'reverse_words',
    testCases: [
      { id: 1, input: ["عسير تهامة السراة"], expected: "السراة تهامة عسير", isHidden: false, displayInput: '"عسير تهامة السراة"' },
      { id: 2, input: ["  فن   القط   العسيري  "], expected: "العسيري القط فن", isHidden: false, displayInput: '"  فن   القط   العسيري  "' },
      { id: 3, input: ["hello world"], expected: "world hello", isHidden: false, displayInput: '"hello world"' },
      { id: 4, input: ["    ابها   الجنوب    "], expected: "الجنوب ابها", isHidden: true, displayInput: 'حالة خفية 1 (مسافات طرفية)' },
      { id: 5, input: ["سراة"], expected: "سراة", isHidden: true, displayInput: 'حالة خفية 2 (كلمة مفردة)' }
    ],
    solution: {
      python: `def reverse_words(s: str) -> str:
    words = s.split()
    return " ".join(words[::-1])`,
      javascript: `function reverse_words(s) {
    const words = s.trim().split(/\\s+/);
    return words.reverse().join(" ");
}`
    },
    analysis: {
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      explanationAr: 'تقسيم النص يمر على الأحرف في زمن خطي O(N)، وعكس المصفوفة يستغرق O(K) حيث K عدد الكلمات، ثم الدمج يستغرق O(N). الكفاءة الكلية مثالية O(N).',
      approachComparison: 'الحل باستخدام Split و Join هو الأبسط والأنظف بدلاً من استخدام مؤشرين (Two Pointers) لتعديل النصوص غير القابلة للتغيير (Immutable Strings).'
    }
  },
  {
    id: 'py-02-bana-triangle',
    titleAr: 'توليد أرقام مثلثات البَنَة',
    titleEn: 'Generate Bana Number Triangle',
    track: 'python',
    difficulty: 'intermediate',
    xp: 100,
    category: 'الرياضيات والتكرار (Math & Iteration)',
    qattSymbol: 'bana',
    descriptionAr: `نقش "البَنَة" هو العنصر الأساسي في القط العسيري ويمثل المثلثات الهندسية الدقيقة. المطلوب كتابة دالة تستقبل عدداً صحيحاً n وتولد قائمة بمصفوفات الأرقام التي تمثل مثلث باسكال حتى الصف n، حيث كل صف يبدأ وينتهي بالرقم 1، وكل رقم داخلي هو حاصل جمع الرقمين أعلاه مباشرة.`,
    descriptionEn: `Given an integer numRows, return the first numRows of Pascal's triangle representing the iconic Asiri Bana geometric triangle sequence.`,
    constraints: [
      '1 <= numRows <= 25',
      'كل صف يبدأ وينتهي بالرقم 1.'
    ],
    examples: [
      {
        input: `3`,
        output: `[[1], [1, 1], [1, 2, 1]]`,
        explanationAr: 'الصف الأول [1]، الصف الثاني [1, 1]، الصف الثالث [1, 1+1, 1] = [1, 2, 1].',
        explanationEn: 'Triangle built row by row with symmetric bounds.'
      }
    ],
    hints: [
      'الصف الأول دائماً يحتوي على [1].',
      'لكل صف جديد i من 1 إلى n-1، العنصر j يحسب بجمع row[i-1][j-1] + row[i-1][j].',
      'تأكد من إحاطة كل صف جديد بالرقم 1 في البداية والنهاية.'
    ],
    starterCode: {
      python: `def generate_bana_triangle(num_rows: int) -> list:
    # اكتب خوارزمية توليد مثلث البَنَة
    pass`,
      javascript: `function generate_bana_triangle(num_rows) {
    // اكتب خوارزمية توليد مثلث البَنَة
    return [];
}`
    },
    functionName: 'generate_bana_triangle',
    testCases: [
      { id: 1, input: [1], expected: [[1]], isHidden: false, displayInput: '1' },
      { id: 2, input: [3], expected: [[1], [1, 1], [1, 2, 1]], isHidden: false, displayInput: '3' },
      { id: 3, input: [4], expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]], isHidden: false, displayInput: '4' },
      { id: 4, input: [5], expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]], isHidden: true, displayInput: '5 (حالة خفية)' }
    ],
    solution: {
      python: `def generate_bana_triangle(num_rows: int) -> list:
    triangle = []
    for r in range(num_rows):
        row = [1] * (r + 1)
        for c in range(1, r):
            row[c] = triangle[r - 1][c - 1] + triangle[r - 1][c]
        triangle.append(row)
    return triangle`,
      javascript: `function generate_bana_triangle(num_rows) {
    const triangle = [];
    for (let r = 0; r < num_rows; r++) {
        const row = new Array(r + 1).fill(1);
        for (let c = 1; c < r; c++) {
            row[c] = triangle[r - 1][c - 1] + triangle[r - 1][c];
        }
        triangle.push(row);
    }
    return triangle;
}`
    },
    analysis: {
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(N^2)',
      explanationAr: 'عدد العناصر المولدة هو n*(n+1)/2 عنصر، وبالتالي زمن التشغيل ومساحة التخزين تربيعية بالنسبة لعدد الصفوف، وهو الحد الأدنى النظري لتوليد كامل المثلث.',
      approachComparison: 'التوليد الديناميكي التكراري (Dynamic Programming Bottom-up) يتفوق على الحساب الرياضي التوافقي nCr في السرعة وتفادي تجاوز الأعداد الكبيرة.'
    }
  },
  {
    id: 'js-01-palindrome-symmetry',
    titleAr: 'فحص التناظر الهندسي للجدارية',
    titleEn: 'Asiri Mural Symmetry Checker',
    track: 'javascript',
    difficulty: 'beginner',
    xp: 50,
    category: 'الخوارزميات الأساسية (Basic Logic)',
    qattSymbol: 'sakranah',
    descriptionAr: `التناظر هو سر جمال القط العسيري. الدالة المطلوبة تفحص ما إذا كانت سلسلة الرموز المعطاة متناظرة تماماً (Palindrome) مع تجاهل المسافات وعلامات الترقيم وتوحيد حالة الأحرف، بحيث تقرأ من اليمين إلى اليسار تماماً كما تقرأ من اليسار إلى اليمين.`,
    descriptionEn: `Given a string s, return true if it is a palindrome, considering only alphanumeric characters and ignoring cases.`,
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      'تتكون السلسلة من أحرف وأرقام ورموز خاصة.'
    ],
    examples: [
      {
        input: `"قَط، طَق"`,
        output: `true`,
        explanationAr: 'بعد تصفية علامات الترقيم والتنوين، السلسلة هي "قططق" وهي متناظرة تماماً.',
        explanationEn: 'Ignoring punctuation, characters match forward and backward.'
      },
      {
        input: `"A man, a plan, a canal: Panama"`,
        output: `true`,
        explanationAr: 'السلسلة الإنجليزية الشهيرة تقرأ بالمثل من الطرفين بعد إزالة الرموز.',
        explanationEn: 'Classic palindrome phrase with alphanumeric filtering.'
      }
    ],
    hints: [
      'قم بتنظيف السلسلة أولاً بإزالة الرموز والمسافات باستخدام التعبيرات النمطية (Regex) وتحويلها لأحرف صغيرة.',
      'يمكنك مقارنة السلسلة المنظفة بعكسها مباشرة.',
      'أو استخدام تقنية المؤشرين (Two Pointers) أحدهما في البداية والآخر في النهاية للمقارنة دون استهلاك ذاكرة إضافية.'
    ],
    starterCode: {
      javascript: `function is_mural_symmetric(s) {
    // اكتب خوارزمية فحص التناظر
    return false;
}`,
      python: `def is_mural_symmetric(s: str) -> bool:
    # اكتب خوارزمية فحص التناظر
    pass`
    },
    functionName: 'is_mural_symmetric',
    testCases: [
      { id: 1, input: ["A man, a plan, a canal: Panama"], expected: true, isHidden: false, displayInput: '"A man, a plan, a canal: Panama"' },
      { id: 2, input: ["race a car"], expected: false, isHidden: false, displayInput: '"race a car"' },
      { id: 3, input: ["ق ط ط ق"], expected: true, isHidden: false, displayInput: '"ق ط ط ق"' },
      { id: 4, input: ["0P"], expected: false, isHidden: true, displayInput: '"0P" (حالة خفية)' },
      { id: 5, input: [" "], expected: true, isHidden: true, displayInput: '" " (فراغ فقط)' }
    ],
    solution: {
      javascript: `function is_mural_symmetric(s) {
    const clean = s.toLowerCase().replace(/[^a-z0-9\u0621-\u064A]/g, '');
    let left = 0, right = clean.length - 1;
    while (left < right) {
        if (clean[left] !== clean[right]) return false;
        left++;
        right--;
    }
    return true;
}`,
      python: `import re

def is_mural_symmetric(s: str) -> bool:
    clean = re.sub(r'[^a-zA-Z0-9\u0621-\u064A]', '', s).lower()
    return clean == clean[::-1]`
    },
    analysis: {
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      explanationAr: 'المرور على السلسلة لتنظيفها يستغرق O(N)، وفحص المؤشرين يستغرق O(N/2). الكفاءة خطية ومثالية.',
      approachComparison: 'طريقة المؤشرين تسمح بإنهاء الفحص مبكراً عند أول عدم تطابق، مما يوفر وقتاً في الحالات غير المتناظرة مقارنة بعكس السلسلة كاملة.'
    }
  },
  {
    id: 'js-02-two-sum-palette',
    titleAr: 'تطابق ألوان القط المستهدفة (Two Sum)',
    titleEn: 'Two Sum Target Palette',
    track: 'javascript',
    difficulty: 'intermediate',
    xp: 100,
    category: 'المصفوفات وجداول الهاش (Hash Maps)',
    qattSymbol: 'misht',
    descriptionAr: `لدى فنان القط مصفوفة من كميات الطلاء الطبيعي (أرقام صحيحة)، وهدف محدد للكمية الإجمالية (target). اكتب دالة تعيد مؤشري العنصرين (indices) اللذين مجموعهما يساوي القيمة المستهدفة تماماً. افترض دائماً وجود حل وحيد ولا تستخدم العنصر نفسه مرتين.`,
    descriptionEn: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      'يوجد حل وحيد صالح دائماً.'
    ],
    examples: [
      {
        input: `[2, 7, 11, 15], 9`,
        output: `[0, 1]`,
        explanationAr: 'لأن nums[0] + nums[1] = 2 + 7 = 9، تكون النتيجة [0, 1].',
        explanationEn: 'Indices 0 and 1 sum up to target 9.'
      },
      {
        input: `[3, 2, 4], 6`,
        output: `[1, 2]`,
        explanationAr: 'nums[1] + nums[2] = 2 + 4 = 6، النتيجة [1, 2].',
        explanationEn: 'Elements at 1 and 2 sum to 6.'
      }
    ],
    hints: [
      'الحل الساذج بفحص كل زوج بحلقتي تكرار يستغرق O(N^2) وهو بطيء للمصفوفات الكبيرة.',
      'استخدم جدول هاش (Hash Map أو Map في JS / Dict في بايثون) لتخزين العنصر ومؤشره.',
      'عند المرور على كل عنصر num، ابحث في الجدول عما إذا كان المتمم (target - num) موجوداً مسبقاً.'
    ],
    starterCode: {
      javascript: `function two_sum_palette(nums, target) {
    // اكتب خوارزمية البحث عن الزوج في زمن O(n)
    return [];
}`,
      python: `def two_sum_palette(nums: list, target: int) -> list:
    # اكتب خوارزمية البحث عن الزوج في زمن O(n)
    pass`
    },
    functionName: 'two_sum_palette',
    testCases: [
      { id: 1, input: [[2, 7, 11, 15], 9], expected: [0, 1], isHidden: false, displayInput: '[2, 7, 11, 15], target = 9' },
      { id: 2, input: [[3, 2, 4], 6], expected: [1, 2], isHidden: false, displayInput: '[3, 2, 4], target = 6' },
      { id: 3, input: [[3, 3], 6], expected: [0, 1], isHidden: false, displayInput: '[3, 3], target = 6' },
      { id: 4, input: [[1, 5, 7, 12, 19], 20], expected: [0, 4], isHidden: true, displayInput: 'حالة خفية 1 (أطراف المصفوفة)' },
      { id: 5, input: [[-3, 4, 3, 90], 0], expected: [0, 2], isHidden: true, displayInput: 'حالة خفية 2 (أرقام سالبة)' }
    ],
    solution: {
      javascript: `function two_sum_palette(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`,
      python: `def two_sum_palette(nums: list, target: int) -> list:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
    },
    analysis: {
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      explanationAr: 'نقوم بالمرور مرة واحدة فقط على المصفوفة (Single Pass)، وكل عملية بحث وإدراج في الهاش ماب تستغرق O(1) في المتوسط. التعقيد الزمني هو الأفضل O(N).',
      approachComparison: 'خوارزمية الهاش ماب تتفوق بشكل حاسم على خوارزمية القوة الغاشمة Brute Force O(N^2) وعلى خوارزمية الفرز ثم المؤشرين O(N log N).'
    }
  },
  {
    id: 'algo-01-max-subarray',
    titleAr: 'أعظم شريط لوني متصل (Kadane)',
    titleEn: 'Maximum Subarray (Kadane)',
    track: 'algorithms',
    difficulty: 'intermediate',
    xp: 120,
    category: 'البرمجة الديناميكية (Dynamic Programming)',
    qattSymbol: 'mihrab',
    descriptionAr: `لديك مصفوفة تمثل تدرجات لونية (أعداد صحيحة موجبة وسالبة). المطلوب إيجاد المصفوفة الفرعية المتصلة (contiguous subarray) التي تمتلك أكبر مجموع ممكن وإرجاع هذا المجموع. هذه الخوارزمية الشهيرة باسم "خوارزمية كادان" أساسية في تحليل الإشارات ومعالجة الصور الهندسية.`,
    descriptionEn: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    examples: [
      {
        input: `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`,
        output: `6`,
        explanationAr: 'المصفوفة الفرعية المتصلة [4, -1, 2, 1] تمتلك أعظم مجموع وهو 6.',
        explanationEn: 'Subarray [4, -1, 2, 1] has the largest sum = 6.'
      },
      {
        input: `[1]`,
        output: `1`,
        explanationAr: 'عنصر وحيد وقيمته 1.',
        explanationEn: 'Single element array.'
      }
    ],
    hints: [
      'فكر في القرار عند كل عنصر: هل نبدأ مصفوفة فرعية جديدة من هذا العنصر، أم نضمه إلى المجموع المتراكم السابق؟',
      'معادلة كادان: currentMax = max(nums[i], currentMax + nums[i]).',
      'حافظ على متغير globalMax يسجل أعلى قيمة وصل إليها currentMax طوال الرحلة.'
    ],
    starterCode: {
      javascript: `function max_asiri_subarray(nums) {
    // اكتب خوارزمية كادان هنا
    return 0;
}`,
      python: `def max_asiri_subarray(nums: list) -> int:
    # اكتب خوارزمية كادان هنا
    pass`
    },
    functionName: 'max_asiri_subarray',
    testCases: [
      { id: 1, input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6, isHidden: false, displayInput: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]' },
      { id: 2, input: [[1]], expected: 1, isHidden: false, displayInput: '[1]' },
      { id: 3, input: [[5, 4, -1, 7, 8]], expected: 23, isHidden: false, displayInput: '[5, 4, -1, 7, 8]' },
      { id: 4, input: [[-5, -2, -8, -1]], expected: -1, isHidden: true, displayInput: 'حالة خفية 1 (أرقام سالبة بالكامل)' },
      { id: 5, input: [[-1, 10, -2, 15, -30, 20]], expected: 23, isHidden: true, displayInput: 'حالة خفية 2 (تقلبات حادة)' }
    ],
    solution: {
      javascript: `function max_asiri_subarray(nums) {
    let currentMax = nums[0];
    let globalMax = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentMax = Math.max(nums[i], currentMax + nums[i]);
        if (currentMax > globalMax) {
            globalMax = currentMax;
        }
    }
    return globalMax;
}`,
      python: `def max_asiri_subarray(nums: list) -> int:
    current_max = nums[0]
    global_max = nums[0]
    for x in nums[1:]:
        current_max = max(x, current_max + x)
        if current_max > global_max:
            global_max = current_max
    return global_max`
    },
    analysis: {
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      explanationAr: 'خوارزمية كادان تمر على عناصر المصفوفة مرة واحدة فقط O(N) وتستخدم متغيرين اثنين فقط للذاكرة O(1)، مما يجعلها الحل الأسرع والأكثر كفاءة على الإطلاق.',
      approachComparison: 'الحل باستخدام القوة الغاشمة (Brute Force) بفحص جميع المصفوفات الفرعية يستغرق O(N^2) أو O(N^3)، وحل فرق تسد (Divide & Conquer) يستغرق O(N log N).'
    }
  },
  {
    id: 'algo-02-valid-anagrams',
    titleAr: 'تطابق نقوش الجداريات (Valid Anagrams)',
    titleEn: 'Heritage Anagram Matcher',
    track: 'algorithms',
    difficulty: 'beginner',
    xp: 60,
    category: 'التكرارات والتجميع (Frequency Maps)',
    qattSymbol: 'bana',
    descriptionAr: `في القط العسيري، قد تستخدم نفس مجموعة الأشكال والألوان بترتيب مختلف لإنشاء جدارية جديدة متناسقة. اكتب دالة تستقبل سلسلتين s و t، وتحدد ما إذا كانت t تمثل "أناغرام" (Anagram) للسلسلة s (أي تحتوي على نفس الأحرف تماماً بنفس عدد التكرارات لكن بترتيب مختلف).`,
    descriptionEn: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.`,
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      'تتكون السلاسل من أحرف هجائية.'
    ],
    examples: [
      {
        input: `"قطاط", "طاقط"`,
        output: `true`,
        explanationAr: 'كلا السلسلتين تحتويان على نفس الأحرف (ق:1، ط:2، ا:1).',
        explanationEn: 'Both strings have identical character frequency counts.'
      },
      {
        input: `"سراة", "تهامة"`,
        output: `false`,
        explanationAr: 'الأحرف وعددها مختلف تماماً.',
        explanationEn: 'Different character sets.'
      }
    ],
    hints: [
      'إذا كان طول السلسلتين مختلفاً، فهما حتماً ليستا أناغرام.',
      'يمكنك حساب تكرار كل حرف باستخدام جدول هاش أو مصفوفة ترددات.',
      'أو يمكنك فرز السلسلتين ومقارنة الناتج، ولكن الفرز يأخذ O(N log N) بينما جدول التكرارات يأخذ O(N).'
    ],
    starterCode: {
      javascript: `function is_heritage_anagram(s, t) {
    // اكتب خوارزمية فحص تطابق الأحرف
    return false;
}`,
      python: `def is_heritage_anagram(s: str, t: str) -> bool:
    # اكتب خوارزمية فحص تطابق الأحرف
    pass`
    },
    functionName: 'is_heritage_anagram',
    testCases: [
      { id: 1, input: ["قطاط", "طاقط"], expected: true, isHidden: false, displayInput: '"قطاط", "طاقط"' },
      { id: 2, input: ["سراة", "تهامة"], expected: false, isHidden: false, displayInput: '"سراة", "تهامة"' },
      { id: 3, input: ["anagram", "nagaram"], expected: true, isHidden: false, displayInput: '"anagram", "nagaram"' },
      { id: 4, input: ["rat", "car"], expected: false, isHidden: true, displayInput: '"rat", "car"' },
      { id: 5, input: ["أبها", "هاأب"], expected: true, isHidden: true, displayInput: '"أبها", "هاأب"' }
    ],
    solution: {
      javascript: `function is_heritage_anagram(s, t) {
    if (s.length !== t.length) return false;
    const counts = {};
    for (const char of s) {
        counts[char] = (counts[char] || 0) + 1;
    }
    for (const char of t) {
        if (!counts[char]) return false;
        counts[char]--;
    }
    return true;
}`,
      python: `def is_heritage_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    from collections import Counter
    return Counter(s) == Counter(t)`
    },
    analysis: {
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1) أو O(K)',
      explanationAr: 'حساب التكرارات يستغرق زمناً خطياً O(N). مساحة التخزين محصورة بعدد الأحرف الأبجدية المتميزة K، وهي O(1) في حال الأبجدية المحدودة.',
      approachComparison: 'حل جدول التكرارات يتفوق على حل الفرز (Sorting) الذي يستغرق O(N log N).'
    }
  },
  {
    id: 'py-03-pattern-compressor',
    titleAr: 'ضغط سلاسل نقوش القط (Run-Length Encoding)',
    titleEn: 'Qatt Run-Length Compression',
    track: 'python',
    difficulty: 'intermediate',
    xp: 90,
    category: 'خوارزميات الضغط (Compression Algorithms)',
    qattSymbol: 'khetam',
    descriptionAr: `لتخزين جداريات القط العسيري في سجل رقمي مضغوط، نريد تطبيق خوارزمية ضغط الطول المتكرر (RLE). الدالة تستقبل سلسلة من رموز الألوان المتتالية (مثل "RRRGGGB") وتعيد السلسلة المضغوطة بحيث يلي كل حرف عدد تكراراته المتتالية (مثل "R3G3B1"). إذا كان التكرار 1 يكتب الرقم 1 أيضاً.`,
    descriptionEn: `Implement Run-Length Encoding (RLE) to compress a string of repeated color symbols into character and count pairs.`,
    constraints: [
      '1 <= len(s) <= 10^4',
      'تتكون السلسلة من أحرف كبيرة فقط.'
    ],
    examples: [
      {
        input: `"RRRGGGBB"`,
        output: `"R3G3B2"`,
        explanationAr: 'الحرف R تكرر 3 مرات، G تكرر 3 مرات، B تكرر مرتين.',
        explanationEn: 'Run counts compressed into character-count pairs.'
      },
      {
        input: `"A"`,
        output: `"A1"`,
        explanationAr: 'حرف مفرد بتكرار 1.',
        explanationEn: 'Single character output.'
      }
    ],
    hints: [
      'تتبع الحرف الحالي وعدد مرات تكراره (Count).',
      'عندما يتغير الحرف أو تصل لنهاية السلسلة، أضف الحرف وعدده إلى قائمة النتائج ثم صفر العداد.',
      'استخدم قائمة ثم ادمجها بـ join في النهاية بدلاً من تسلسل النصوص في كل خطوة.'
    ],
    starterCode: {
      python: `def compress_qatt_pattern(s: str) -> str:
    # اكتب خوارزمية ضغط النمط
    pass`,
      javascript: `function compress_qatt_pattern(s) {
    // اكتب خوارزمية ضغط النمط
    return "";
}`
    },
    functionName: 'compress_qatt_pattern',
    testCases: [
      { id: 1, input: ["RRRGGGBB"], expected: "R3G3B2", isHidden: false, displayInput: '"RRRGGGBB"' },
      { id: 2, input: ["A"], expected: "A1", isHidden: false, displayInput: '"A"' },
      { id: 3, input: ["WWWWWWWWWW"], expected: "W10", isHidden: false, displayInput: '"WWWWWWWWWW"' },
      { id: 4, input: ["RGB"], expected: "R1G1B1", isHidden: true, displayInput: '"RGB" (حالة بدون تكرار)' },
      { id: 5, input: ["AABBAA"], expected: "A2B2A2", isHidden: true, displayInput: '"AABBAA" (تكرار متقطع)' }
    ],
    solution: {
      python: `def compress_qatt_pattern(s: str) -> str:
    if not s:
        return ""
    result = []
    current_char = s[0]
    count = 1
    for char in s[1:]:
        if char == current_char:
            count += 1
        else:
            result.append(f"{current_char}{count}")
            current_char = char
            count = 1
    result.append(f"{current_char}{count}")
    return "".join(result)`,
      javascript: `function compress_qatt_pattern(s) {
    if (!s) return "";
    const result = [];
    let currentChar = s[0];
    let count = 1;
    for (let i = 1; i < s.length; i++) {
        if (s[i] === currentChar) {
            count++;
        } else {
            result.push(currentChar + count);
            currentChar = s[i];
            count = 1;
        }
    }
    result.push(currentChar + count);
    return result.join("");
}`
    },
    analysis: {
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      explanationAr: 'تمر الخوارزمية مرة واحدة عبر السلسلة في زمن خطي O(N). تجميع الأجزاء في قائمة ثم دمجها يحافظ على كفاءة الذاكرة وتجنب عمليات النسخ المتكرر.',
      approachComparison: 'طريقة المؤشر المفرد والتجميع الخطي هي الأنسب لضغط RLE، وتستخدم في محركات الرسوم المتجهية لتخزين خرائط البكسل المضغوطة.'
    }
  },
  {
    id: 'algo-03-binary-search-peak',
    titleAr: 'قمم جبال السراة (Peak Element Search)',
    titleEn: 'Highland Peak Element (Binary Search)',
    track: 'algorithms',
    difficulty: 'advanced',
    xp: 150,
    category: 'البحث الثنائي (Binary Search)',
    qattSymbol: 'mihrab',
    descriptionAr: `في جبال السراة، "عنصر القمة" هو العنصر الذي يكون أكبر بشكل صارم من جيرانه المجاورين (nums[i] > nums[i-1] و nums[i] > nums[i+1]). بالنظر إلى مصفوفة أرقام nums حيث nums[i] != nums[i+1] لجميع القيم، أوجد مؤشر أي عنصر قمة. يجب كتابة خوارزمية تعمل في زمن O(log N).`,
    descriptionEn: `Find a peak element in an array and return its index. You must write an algorithm that runs in O(log n) time.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-2^31 <= nums[i] <= 2^31 - 1',
      'nums[i] != nums[i + 1] لجميع العناصر.',
      'افترض أن nums[-1] = nums[n] = -∞.'
    ],
    examples: [
      {
        input: `[1, 2, 3, 1]`,
        output: `2`,
        explanationAr: 'الرقم 3 عند المؤشر 2 هو قمة لأن 3 أكبر من 2 وأكبر من 1.',
        explanationEn: 'Index 2 has value 3, strictly greater than its neighbors.'
      },
      {
        input: `[1, 2, 1, 3, 5, 6, 4]`,
        output: `5`,
        explanationAr: 'المؤشر 5 (الرقم 6) يمثل قمة صحيحة، أو المؤشر 1 (الرقم 2). كلاهما إجابة مقبولة.',
        explanationEn: 'Index 5 (value 6) or index 1 (value 2) are valid peaks.'
      }
    ],
    hints: [
      'الشرط الصارم O(log N) يعني وجوب استخدام فكرة البحث الثنائي (Binary Search).',
      'احسب نقطة المنتصف mid وقارنها مع mid + 1.',
      'إذا كان nums[mid] < nums[mid + 1]، فهذا يعني أن المنحنى صاعد للأعلى ويوجد حتماً قمة في النصف الأيمن. وإلا فالقمة في النصف الأيسر أو في mid نفسه.'
    ],
    starterCode: {
      javascript: `function find_sarawat_peak(nums) {
    // اكتب خوارزمية البحث الثنائي في زمن O(log n)
    return 0;
}`,
      python: `def find_sarawat_peak(nums: list) -> int:
    # اكتب خوارزمية البحث الثنائي في زمن O(log n)
    pass`
    },
    functionName: 'find_sarawat_peak',
    testCases: [
      { id: 1, input: [[1, 2, 3, 1]], expected: 2, isHidden: false, displayInput: '[1, 2, 3, 1]' },
      { id: 2, input: [[1, 2]], expected: 1, isHidden: false, displayInput: '[1, 2]' },
      { id: 3, input: [[2, 1]], expected: 0, isHidden: false, displayInput: '[2, 1]' },
      { id: 4, input: [[1, 2, 3, 4, 5]], expected: 4, isHidden: true, displayInput: 'حالة خفية 1 (تصاعدي بالكامل)' },
      { id: 5, input: [[5, 4, 3, 2, 1]], expected: 0, isHidden: true, displayInput: 'حالة خفية 2 (تنازلي بالكامل)' }
    ],
    solution: {
      javascript: `function find_sarawat_peak(nums) {
    let low = 0;
    let high = nums.length - 1;
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (nums[mid] < nums[mid + 1]) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
}`,
      python: `def find_sarawat_peak(nums: list) -> int:
    low = 0
    high = len(nums) - 1
    while low < high:
        mid = (low + high) // 2
        if nums[mid] < nums[mid + 1]:
            low = mid + 1
        else:
            high = mid
    return low`
    },
    analysis: {
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)',
      explanationAr: 'في كل دورة يتم تقليص نطاق البحث إلى النصف، مما يضمن الوصول إلى القمة في زمن لوغاريتمي O(log N) ومساحة ذاكرة ثابتة O(1).',
      approachComparison: 'البحث الخطي O(N) بفحص كل عنصر غير مقبول وفق الشروط؛ استخدام البحث الثنائي على مصفوفة غير مرتبة بالاعتماد على ميل المنحنى هو تقنية عبقرية في الخوارزميات.'
    }
  }
];
