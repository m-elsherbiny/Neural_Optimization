import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, Target, ReceiptText, Plus, Sparkles, Moon, Sun, Info, Languages
} from 'lucide-react';
import { Page } from '../types';
import { useI18n } from '../lib/i18n';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Sidebar({ currentPage, onPageChange, darkMode, onToggleDark }: SidebarProps) {
  const { t, lang, setLang } = useI18n();

  const navItems = [
    { id: 'SmartInput' as Page, label: t('nav.smartInput'), icon: Sparkles },
    { id: 'Allocation' as Page, label: t('nav.allocation'), icon: Wallet },
    { id: 'MyGoals' as Page, label: t('nav.myGoals'), icon: Target },
    { id: 'Transactions' as Page, label: t('nav.transactions'), icon: ReceiptText },
    { id: 'About' as Page, label: t('nav.about'), icon: Info },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card h-full rtl:border-r-0 rtl:border-l">
      {/* Header */}
      <div className="h-[60px] flex items-center px-6 shrink-0">
        <h1 className="text-lg font-bold tracking-tight leading-none">{t('sidebar.smartBudget')}</h1>
      </div>

      <Separator />

      <nav className="flex-1 flex flex-col gap-1 p-3 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={`justify-start gap-3 h-10 ${isActive ? '' : 'text-muted-foreground'}`}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto space-y-2">
        {/* Language toggle */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
        >
          <Languages className="w-4 h-4" />
          {t('sidebar.language')}
        </Button>

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={onToggleDark}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {darkMode ? t('sidebar.lightMode') : t('sidebar.darkMode')}
        </Button>

        <Button 
          onClick={() => onPageChange('NewEntry')}
          className="w-full gap-2"
          size="lg"
        >
          <Plus className="w-4 h-4" />
          {t('nav.newExpense')}
        </Button>
      </div>
    </aside>
  );
}
