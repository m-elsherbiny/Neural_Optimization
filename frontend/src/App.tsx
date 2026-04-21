import { useState, useEffect } from 'react';
import { Page } from './types';
import { useI18n } from './lib/i18n';
import Sidebar from './components/Sidebar';
import Objectives from './pages/Objectives';
import Ledger from './pages/Ledger';
import Allocation from './pages/Allocation';
import NewEntry from './pages/NewEntry';
import SmartInput from './pages/SmartInput';
import About from './pages/About';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('SmartInput');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const { t } = useI18n();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const renderPage = () => {
    switch (currentPage) {
      case 'SmartInput': return <SmartInput onPageChange={setCurrentPage} />;
      case 'MyGoals': return <Objectives onPageChange={setCurrentPage} />;
      case 'Transactions': return <Ledger />;
      case 'Allocation': return <Allocation onPageChange={setCurrentPage} />;
      case 'NewEntry': return <NewEntry onPageChange={setCurrentPage} />;
      case 'About': return <About />;
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
      default: return '';
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[60px] flex items-center border-b bg-card px-8 shrink-0">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight leading-none">{getPageTitle(currentPage)}</h1>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{getPageDescription(currentPage)}</p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
