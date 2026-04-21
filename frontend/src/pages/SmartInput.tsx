import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, CheckCircle, X, ShoppingBag, Briefcase, Target, Loader2, Star } from 'lucide-react';
import { useState } from 'react';
import { Page } from '../types';
import { useI18n } from '../lib/i18n';
import { GOAL_ICONS } from '../lib/categories';
import { getGoalIcon } from '../lib/goalIcons';

interface ParsedExpense {
  amount: number; category: string; date: string; note: string;
  is_essential: boolean; is_recurring: boolean;
}
interface ParsedIncome {
  source: string; amount: number; frequency: string; type: string;
}
interface ParsedGoal {
  name: string; target_amount: number; current_amount: number;
  deadline: string | null; priority: number; is_favourite: boolean; icon: string;
}
interface ParseResult {
  expenses: ParsedExpense[]; incomes: ParsedIncome[]; goals: ParsedGoal[]; raw_text: string;
}

interface SmartInputProps { onPageChange: (page: Page) => void; }

const EXAMPLE_TEXT = `I earn $5000 monthly from my job. Yesterday I spent $120 on groceries at Walmart. I paid $45 for an Uber ride today. My rent is $1200. I want to save $10000 for an emergency fund by December 2026.`;

export default function SmartInput({ onPageChange }: SmartInputProps) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleParse = async () => {
    if (!text.trim()) { setError(t('smart.enterText')); return; }
    setError(''); setParsing(true); setResult(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/smart-parse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) { setResult(await res.json()); }
      else { const d = await res.json(); setError(d.detail || 'Failed to parse.'); }
    } catch { setError(t('smart.backendError')); }
    finally { setParsing(false); }
  };

  const removeExpense = (idx: number) => { if (result) setResult({ ...result, expenses: result.expenses.filter((_, i) => i !== idx) }); };
  const removeIncome = (idx: number) => { if (result) setResult({ ...result, incomes: result.incomes.filter((_, i) => i !== idx) }); };
  const removeGoal = (idx: number) => { if (result) setResult({ ...result, goals: result.goals.filter((_, i) => i !== idx) }); };

  const updateGoalIcon = (idx: number, icon: string) => {
    if (!result) return;
    const updatedGoals = [...result.goals];
    updatedGoals[idx] = { ...updatedGoals[idx], icon };
    setResult({ ...result, goals: updatedGoals });
  };

  const toggleGoalFavourite = (idx: number) => {
    if (!result) return;
    const updatedGoals = result.goals.map((g, i) => ({
      ...g,
      is_favourite: i === idx ? !g.is_favourite : false
    }));
    setResult({ ...result, goals: updatedGoals });
  };

  const handleSaveAll = async () => {
    if (!result) return; setSaving(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/smart-parse/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses: result.expenses, incomes: result.incomes, goals: result.goals })
      });
      if (res.ok) { setSaved(true); setTimeout(() => onPageChange('Transactions'), 1500); }
      else { setError('Failed to save items.'); }
    } catch { setError(t('smart.backendError')); }
    finally { setSaving(false); }
  };

  const totalParsed = result ? result.expenses.length + result.incomes.length + result.goals.length : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Input phase */}
      {!result && (
        <Card>
          <CardHeader>
            <CardTitle>{t('smart.describe')}</CardTitle>
            <CardDescription>{t('smart.describeHint')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={EXAMPLE_TEXT}
              rows={7}
              className="resize-none text-base"
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setText(EXAMPLE_TEXT)}>{t('smart.useExample')}</Button>
              <Button className="flex-1 gap-2" onClick={handleParse} disabled={parsing}>
                {parsing ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('smart.analyzing')}</> : <><Sparkles className="w-4 h-4" /> {t('smart.analyze')}</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results phase */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{totalParsed} {t('smart.itemsDetected')}</Badge>
            <Button variant="link" size="sm" className="text-muted-foreground" onClick={() => { setResult(null); setSaved(false); }}>{t('smart.editText')}</Button>
          </div>

          {/* Incomes */}
          {result.incomes.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Briefcase className="w-4 h-4" /> {t('smart.incomeSources')} ({result.incomes.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.incomes.map((inc, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{inc.source}</p>
                      <p className="text-xs text-muted-foreground">{inc.type} · {inc.frequency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${inc.amount.toLocaleString()}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeIncome(idx)}><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Expenses */}
          {result.expenses.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> {t('smart.expenses')} ({result.expenses.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.expenses.map((exp, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{exp.note}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{exp.date}</span>
                        <Badge variant="outline" className="text-[10px]">{exp.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-lg font-bold">${exp.amount.toLocaleString()}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeExpense(idx)}><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Goals */}
          {result.goals.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4" /> {t('smart.savingsGoals')} ({result.goals.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.goals.map((goal, idx) => {
                  const GoalIcon = getGoalIcon(goal.icon);
                  return (
                    <div key={idx} className="rounded-lg border bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                            <GoalIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{goal.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {goal.deadline ? `${t('smart.deadline')}: ${goal.deadline}` : t('smart.noDeadline')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => toggleGoalFavourite(idx)}
                            title={t('goals.favourite')}
                          >
                            <Star className={`w-3.5 h-3.5 ${goal.is_favourite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                          </Button>
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">${goal.target_amount.toLocaleString()}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeGoal(idx)}><X className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                      {/* Icon selection */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-muted-foreground font-medium mr-1">{t('smart.goalIcon')}:</span>
                        {GOAL_ICONS.map((gi) => {
                          const GI = getGoalIcon(gi.id);
                          return (
                            <button
                              key={gi.id}
                              onClick={() => updateGoalIcon(idx, gi.id)}
                              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all hover:scale-110 ${goal.icon === gi.id ? 'bg-purple-200 dark:bg-purple-800 ring-2 ring-purple-400' : 'bg-muted hover:bg-muted/80'}`}
                              title={gi.label}
                            >
                              <GI className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {totalParsed === 0 && <p className="text-center text-muted-foreground py-8">{t('smart.noData')}</p>}

          {totalParsed > 0 && (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setResult(null); setSaved(false); }}>{t('smart.cancel')}</Button>
              <Button className="flex-[2] gap-2" onClick={handleSaveAll} disabled={saving || saved}>
                {saved ? <><CheckCircle className="w-4 h-4" /> {t('smart.saved')}</> : saving ? t('smart.saving') : `${t('smart.saveAll')} ${totalParsed} ${t('common.items')}`}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Powered by — at the bottom */}
      <div className="flex items-center justify-center gap-2 pt-4 pb-2">
        <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-[11px] text-muted-foreground">{t('smart.poweredBy')}</p>
      </div>
    </div>
  );
}
