import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Lang = 'en' | 'ar';

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<string, Record<Lang, string>> = {
  // Sidebar
  'nav.smartInput': { en: 'Smart Input', ar: 'الإدخال الذكي' },
  'nav.allocation': { en: 'Allocation', ar: 'توزيع الميزانية' },
  'nav.myGoals': { en: 'My Goals', ar: 'أهدافي' },
  'nav.transactions': { en: 'Transactions', ar: 'المعاملات' },
  'nav.newExpense': { en: 'New Expense', ar: 'مصروف جديد' },
  'nav.about': { en: 'About', ar: 'حول المشروع' },
  'sidebar.smartBudget': { en: 'Smart Budget', ar: 'الميزانية الذكية' },
  'sidebar.darkMode': { en: 'Dark Mode', ar: 'الوضع الداكن' },
  'sidebar.lightMode': { en: 'Light Mode', ar: 'الوضع الفاتح' },
  'sidebar.language': { en: 'العربية', ar: 'English' },

  // Page Descriptions
  'desc.smartInput': { en: 'Describe your finances in plain text — AI does the rest', ar: 'صِف أمورك المالية بنص عادي — الذكاء الاصطناعي يتولى الباقي' },
  'desc.allocation': { en: 'See how your money is optimally distributed across your goals', ar: 'شاهد كيف يتم توزيع أموالك بالشكل الأمثل على أهدافك' },
  'desc.myGoals': { en: 'Track your savings targets and watch your progress grow', ar: 'تابع أهداف التوفير الخاصة بك وراقب تقدمك' },
  'desc.transactions': { en: 'See what you spent your money on and when', ar: 'اطّلع على أين أنفقت أموالك ومتى' },
  'desc.newExpense': { en: 'Quickly log a new expense to keep your budget on track', ar: 'سجّل مصروفاً جديداً بسرعة للحفاظ على ميزانيتك' },
  'desc.about': { en: 'Learn about the project and the team behind it', ar: 'تعرّف على المشروع والفريق الذي يقف وراءه' },

  // Smart Input
  'smart.poweredBy': { en: 'Powered by Neural Network (MLPClassifier) + Linear Programming (PuLP)', ar: 'مدعوم بالشبكة العصبية (MLPClassifier) + البرمجة الخطية (PuLP)' },
  'smart.describe': { en: 'Describe your finances', ar: 'صِف أمورك المالية' },
  'smart.describeHint': { en: 'Mention your income, expenses, and savings goals in plain English. The AI will automatically categorize and extract everything.', ar: 'اذكر دخلك ومصاريفك وأهداف التوفير بنص عادي. سيقوم الذكاء الاصطناعي بتصنيف واستخراج كل شيء تلقائياً.' },
  'smart.useExample': { en: 'Use Example', ar: 'استخدم مثالاً' },
  'smart.analyze': { en: 'Analyze Text', ar: 'تحليل النص' },
  'smart.analyzing': { en: 'Analyzing...', ar: 'جارٍ التحليل...' },
  'smart.itemsDetected': { en: 'items detected', ar: 'عناصر مكتشفة' },
  'smart.editText': { en: '← Edit text', ar: '← تعديل النص' },
  'smart.incomeSources': { en: 'Income Sources', ar: 'مصادر الدخل' },
  'smart.expenses': { en: 'Expenses', ar: 'المصروفات' },
  'smart.savingsGoals': { en: 'Savings Goals', ar: 'أهداف التوفير' },
  'smart.noData': { en: 'No financial data extracted. Try being more specific.', ar: 'لم يتم استخراج أي بيانات مالية. حاول أن تكون أكثر تحديداً.' },
  'smart.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'smart.saveAll': { en: 'Save All', ar: 'حفظ الكل' },
  'smart.saved': { en: 'Saved! Redirecting...', ar: '!تم الحفظ! جارٍ التحويل...' },
  'smart.saving': { en: 'Saving...', ar: 'جارٍ الحفظ...' },
  'smart.enterText': { en: 'Please describe your finances first.', ar: 'يرجى وصف أمورك المالية أولاً.' },
  'smart.backendError': { en: 'Could not connect to backend. Ensure it runs on port 8000.', ar: 'تعذر الاتصال بالخادم. تأكد من تشغيله على المنفذ 8000.' },
  'smart.goalIcon': { en: 'Choose an icon', ar: 'اختر أيقونة' },
  'smart.deadline': { en: 'Deadline', ar: 'الموعد النهائي' },
  'smart.noDeadline': { en: 'No deadline', ar: 'بدون موعد نهائي' },

  // Allocation
  'alloc.incomeSources': { en: 'Income Sources', ar: 'مصادر الدخل' },
  'alloc.sourcesConfigured': { en: 'sources configured', ar: 'مصادر مُعدّة' },
  'alloc.sourceConfigured': { en: 'source configured', ar: 'مصدر مُعدّ' },
  'alloc.add': { en: 'Add', ar: 'إضافة' },
  'alloc.noIncome': { en: 'No income sources yet.', ar: 'لا توجد مصادر دخل بعد.' },
  'alloc.sourceName': { en: 'Source Name', ar: 'اسم المصدر' },
  'alloc.amount': { en: 'Amount ($)', ar: '($) المبلغ' },
  'alloc.type': { en: 'Type', ar: 'النوع' },
  'alloc.selectType': { en: 'Select type...', ar: 'اختر النوع...' },
  'alloc.frequency': { en: 'Frequency', ar: 'التكرار' },
  'alloc.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'alloc.addIncome': { en: 'Add Income', ar: 'إضافة دخل' },
  'alloc.added': { en: 'Added!', ar: 'تمت الإضافة!' },
  'alloc.optimResults': { en: 'Optimization Results', ar: 'نتائج التحسين' },
  'alloc.optimDesc': { en: 'Calculated using Linear Programming (PuLP / CBC Solver)', ar: 'محسوبة باستخدام البرمجة الخطية (PuLP / CBC Solver)' },
  'alloc.savePerDay': { en: 'Save', ar: 'وفّر' },
  'alloc.perDay': { en: '/day', ar: '/يوم' },
  'alloc.monthsToTarget': { en: 'months to target', ar: 'أشهر للهدف' },
  'alloc.perMonth': { en: '/ month', ar: '/ شهر' },
  'alloc.totalDaily': { en: 'Total Daily Savings Target', ar: 'هدف التوفير اليومي الإجمالي' },
  'alloc.logExpense': { en: 'Log a new expense', ar: 'تسجيل مصروف جديد' },
  'alloc.safeDailySpend': { en: 'Your Safe Daily Spend', ar: 'إنفاقك اليومي الآمن' },
  'alloc.fillFields': { en: 'Please fill in all fields.', ar: 'يرجى ملء جميع الحقول.' },

  // Goals
  'goals.tracking': { en: 'Tracking', ar: 'تتبع' },
  'goals.activeGoals': { en: 'active goals', ar: 'أهداف نشطة' },
  'goals.activeGoal': { en: 'active goal', ar: 'هدف نشط' },
  'goals.newGoal': { en: 'New Goal', ar: 'هدف جديد' },
  'goals.createNew': { en: 'Create New Goal', ar: 'إنشاء هدف جديد' },
  'goals.createDesc': { en: 'Set a savings target with a deadline to optimize your budget.', ar: 'حدد هدف توفير مع موعد نهائي لتحسين ميزانيتك.' },
  'goals.goalName': { en: 'Goal Name', ar: 'اسم الهدف' },
  'goals.deadline': { en: 'Deadline (optional)', ar: 'الموعد النهائي (اختياري)' },
  'goals.targetAmount': { en: 'Target Amount ($)', ar: '($) المبلغ المستهدف' },
  'goals.currentlySaved': { en: 'Currently Saved ($)', ar: '($) المبلغ الحالي' },
  'goals.color': { en: 'Color', ar: 'اللون' },
  'goals.icon': { en: 'Icon', ar: 'الأيقونة' },
  'goals.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'goals.create': { en: 'Create Goal', ar: 'إنشاء الهدف' },
  'goals.creating': { en: 'Creating...', ar: 'جارٍ الإنشاء...' },
  'goals.created': { en: 'Created!', ar: 'تم الإنشاء!' },
  'goals.editGoal': { en: 'Edit Goal', ar: 'تعديل الهدف' },
  'goals.updateDesc': { en: 'Update goal details.', ar: 'تحديث تفاصيل الهدف.' },
  'goals.name': { en: 'Name', ar: 'الاسم' },
  'goals.target': { en: 'Target ($)', ar: '($) الهدف' },
  'goals.save': { en: 'Save Changes', ar: 'حفظ التغييرات' },
  'goals.noGoals': { en: 'No goals yet. Create your first one!', ar: 'لا توجد أهداف بعد. أنشئ هدفك الأول!' },
  'goals.ongoing': { en: 'Ongoing', ar: 'مستمر' },
  'goals.addFunds': { en: 'Add Funds', ar: 'إضافة أموال' },
  'goals.edit': { en: 'Edit', ar: 'تعديل' },
  'goals.delete': { en: 'Delete', ar: 'حذف' },
  'goals.of': { en: 'of', ar: 'من' },
  'goals.fillFields': { en: 'Please fill in all fields.', ar: 'يرجى ملء جميع الحقول.' },
  'goals.favourite': { en: 'Main Goal', ar: 'الهدف الرئيسي' },

  // Transactions / Ledger
  'ledger.entries': { en: 'Entries', ar: 'السجلات' },
  'ledger.totalSpent': { en: 'Total Spent', ar: 'إجمالي الإنفاق' },
  'ledger.categories': { en: 'Categories', ar: 'الفئات' },
  'ledger.all': { en: 'All', ar: 'الكل' },
  'ledger.clear': { en: 'Clear', ar: 'مسح' },
  'ledger.noTransactions': { en: 'No transactions yet.', ar: 'لا توجد معاملات بعد.' },
  'ledger.noMatch': { en: 'No transactions match this filter.', ar: 'لا توجد معاملات تطابق هذا الفلتر.' },
  'ledger.noDescription': { en: 'No description', ar: 'بدون وصف' },
  'ledger.expenseBreakdown': { en: 'Expense Breakdown', ar: 'تفصيل المصروفات' },
  'ledger.spendingOverTime': { en: 'Spending Over Time', ar: 'الإنفاق عبر الزمن' },

  // New Entry
  'entry.logExpense': { en: 'Log a New Expense', ar: 'تسجيل مصروف جديد' },
  'entry.amount': { en: 'Amount ($)', ar: '($) المبلغ' },
  'entry.category': { en: 'Category', ar: 'الفئة' },
  'entry.selectCategory': { en: 'Select a category...', ar: 'اختر فئة...' },
  'entry.date': { en: 'Date', ar: 'التاريخ' },
  'entry.note': { en: 'Note (optional)', ar: 'ملاحظة (اختياري)' },
  'entry.notePlaceholder': { en: 'e.g., Groceries at Whole Foods', ar: 'مثال: بقالة من كارفور' },
  'entry.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'entry.log': { en: 'Log Expense', ar: 'تسجيل المصروف' },
  'entry.saved': { en: 'Saved!', ar: 'تم الحفظ!' },
  'entry.saving': { en: 'Saving...', ar: 'جارٍ الحفظ...' },
  'entry.fillFields': { en: 'Please enter an amount and select a category.', ar: 'يرجى إدخال المبلغ واختيار الفئة.' },

  // About
  'about.title': { en: 'About Smart Budget', ar: 'حول الميزانية الذكية' },
  'about.desc': { en: 'An intelligent personal budget management system powered by machine learning and mathematical optimization.', ar: 'نظام إدارة ميزانية شخصية ذكي مدعوم بالتعلم الآلي والتحسين الرياضي.' },
  'about.howItWorks': { en: 'How It Works', ar: 'كيف يعمل' },
  'about.nlp': { en: 'Natural Language Processing', ar: 'معالجة اللغة الطبيعية' },
  'about.nlpDesc': { en: 'Describe your finances in plain text. Our AI extracts income, expenses, and goals automatically.', ar: 'صِف أمورك المالية بنص عادي. يستخرج الذكاء الاصطناعي الدخل والمصاريف والأهداف تلقائياً.' },
  'about.nn': { en: 'Neural Network Classification', ar: 'تصنيف الشبكة العصبية' },
  'about.nnDesc': { en: 'An MLPClassifier neural network automatically categorizes your expenses with high accuracy.', ar: 'شبكة عصبية MLPClassifier تصنّف مصاريفك تلقائياً بدقة عالية.' },
  'about.lp': { en: 'Linear Programming Optimization', ar: 'تحسين البرمجة الخطية' },
  'about.lpDesc': { en: 'PuLP with CBC solver optimally allocates your budget across competing savings goals.', ar: 'محرك PuLP مع حل CBC يوزّع ميزانيتك بالشكل الأمثل على أهداف التوفير المتنافسة.' },
  'about.createdBy': { en: 'Created By', ar: 'صنع بواسطة' },
  'about.techStack': { en: 'Technology Stack', ar: 'التقنيات المستخدمة' },

  // Common
  'common.loading': { en: 'Loading...', ar: 'جارٍ التحميل...' },
  'common.items': { en: 'Items', ar: 'عناصر' },
};

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
  isRTL: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) || 'en';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRTL: lang === 'ar' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
