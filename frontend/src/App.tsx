import { useState, useEffect } from 'react';
import { Page } from './types';
import { useI18n } from './lib/i18n';
import Sidebar from './components/Sidebar';
import Objectives from '@/pages/Objectives';
import Ledger from '@/pages/Ledger';
import Allocation from '@/pages/Allocation';
import NewEntry from '@/pages/NewEntry';
import SmartInput from '@/pages/SmartInput';
import About from '@/pages/About';
import Limits from '@/pages/Limits';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('SmartInput');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const { t } = useI18n();

  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/income').then(r => r.json()),
      fetch('http://127.0.0.1:8000/api/expenses').then(r => r.json())
    ]).then(([incomes, expenses]) => {
      const incTotal = (incomes || []).reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0);
      const expTotal = (expenses || []).reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
      setBalance(incTotal - expTotal);
    }).catch(() => {});
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'SmartInput': return <SmartInput onPageChange={setCurrentPage} />;
      case 'MyGoals': return <Objectives onPageChange={setCurrentPage} />;
      case 'Transactions': return <Ledger />;
      case 'Allocation': return <Allocation onPageChange={setCurrentPage} />;
      case 'NewEntry': return <NewEntry onPageChange={setCurrentPage} />;
      case 'About': return <About />;
      case 'Limits': return <Limits />;
      default: return <SmartInput onPageChange={setCurrentPage} />;
    }
  };

  const getPageTitle = (page: Page) => {
    switch (page) {
      case 'SmartInput': return t('nav.smartInput');
      case 'Allocation': return t('nav.allocation');
      case 'MyGoals': return t('nav.myGoals');
      case 'Transactions': return t('nav.transactions');
      case 'NewEntry': return t('nav.newExpense');
      case 'About': return t('nav.about');
      case 'Limits': return t('nav.limits');
      default: return 'Dashboard';
    }
  };

  const getPageDescription = (page: Page) => {
    switch (page) {
      case 'SmartInput': return t('desc.smartInput');
      case 'Allocation': return t('desc.allocation');
      case 'MyGoals': return t('desc.myGoals');
      case 'Transactions': return t('desc.transactions');
      case 'NewEntry': return t('desc.newExpense');
      case 'About': return t('desc.about');
      case 'Limits': return t('desc.limits');
      default: return '';
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[60px] flex items-center justify-between border-b bg-card px-8 shrink-0">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight leading-none">{getPageTitle(currentPage)}</h1>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{getPageDescription(currentPage)}</p>
          </div>
          {balance !== null && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t('header.balance')}</span>
              <span className={`text-lg font-bold tracking-tight ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ${balance.toLocaleString()}
              </span>
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
