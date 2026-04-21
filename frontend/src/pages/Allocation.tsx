import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Briefcase, Plus, Trash2, Target, TrendingUp, AlertTriangle, CheckCircle, Wallet, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Page } from '../types';
import { useI18n } from '../lib/i18n';
import { getIncomeTypeConfig } from '../lib/categories';
import { getGoalIcon } from '../lib/goalIcons';

interface GoalAllocation {
  goal_id: number; goal_name: string; allocated_monthly: number;
  allocated_daily: number; months_to_target: number; is_favourite: boolean; icon: string;
}
interface OptimizeData {
  safe_daily_spend: number; daily_savings_target: number;
  goal_allocations: GoalAllocation[]; alerts: string[];
}
interface Income {
  id: number; source: string; amount: number; frequency: string; type: string;
}
interface AllocationProps { onPageChange: (page: Page) => void; }

const INCOME_TYPES = ['Salary', 'Freelance', 'Dividends', 'Rental', 'Side Business', 'Other'];
const FREQUENCIES = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Annually', 'Occasionally'];

export default function Allocation({ onPageChange }: AllocationProps) {
  const { t } = useI18n();
  const [data, setData] = useState<OptimizeData | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [source, setSource] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [incType, setIncType] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/optimize/dashboard').then(r => r.json()),
      fetch('http://127.0.0.1:8000/api/income').then(r => r.json()),
    ]).then(([optData, incData]) => {
      setData(optData); setIncomes(incData); setLoading(false);
    }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !incAmount || !incType) { setError(t('alloc.fillFields')); return; }
    setError(''); setSaving(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/income', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, amount: parseFloat(incAmount), frequency, type: incType })
      });
      if (res.ok) {
        setSuccess(true); setSource(''); setIncAmount(''); setIncType(''); setFrequency('Monthly');
        setTimeout(() => { setSuccess(false); setShowIncomeForm(false); fetchData(); }, 800);
      } else { setError('Failed to add income.'); }
    } catch { setError(t('smart.backendError')); }
    finally { setSaving(false); }
  };

  const handleDeleteIncome = async (id: number) => {
    try { const res = await fetch(`http://127.0.0.1:8000/api/income/${id}`, { method: 'DELETE' }); if (res.ok) fetchData(); } catch {}
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto">
      {/* Left column */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Income Sources */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> {t('alloc.incomeSources')}</CardTitle>
              <CardDescription>
                {incomes.length} {incomes.length !== 1 ? t('alloc.sourcesConfigured') : t('alloc.sourceConfigured')}
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1" onClick={() => setShowIncomeForm(!showIncomeForm)}>
              <Plus className="w-3.5 h-3.5" /> {t('alloc.add')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomes.length === 0 && !showIncomeForm && <p className="text-sm text-muted-foreground text-center py-4">{t('alloc.noIncome')}</p>}
            {incomes.map(inc => {
              const typeConfig = getIncomeTypeConfig(inc.type);
              const TypeIcon = typeConfig.icon;
              return (
                <div key={inc.id} className="flex items-center justify-between rounded-lg border px-4 py-3 group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: typeConfig.bgColor }}>
                      <TypeIcon className="w-4 h-4" style={{ color: typeConfig.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{inc.source}</p>
                      <p className="text-xs text-muted-foreground">{inc.type} · {inc.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${inc.amount.toLocaleString()}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteIncome(inc.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </div>
              );
            })}

            {showIncomeForm && (
              <>
                <Separator />
                <form onSubmit={handleAddIncome} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('alloc.sourceName')}</Label>
                      <Input value={source} onChange={e => setSource(e.target.value)} placeholder="e.g., Google LLC" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('alloc.amount')}</Label>
                      <Input type="number" step="0.01" value={incAmount} onChange={e => setIncAmount(e.target.value)} placeholder="5000" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('alloc.type')}</Label>
                      <Select value={incType} onValueChange={setIncType}>
                        <SelectTrigger><SelectValue placeholder={t('alloc.selectType')} /></SelectTrigger>
                        <SelectContent>
                          {INCOME_TYPES.map(tp => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('alloc.frequency')}</Label>
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowIncomeForm(false); setError(''); }}>{t('alloc.cancel')}</Button>
                    <Button type="submit" className="flex-[2] gap-1" disabled={saving}>
                      {success ? <><CheckCircle className="w-4 h-4" /> {t('alloc.added')}</> : saving ? t('smart.saving') : t('alloc.addIncome')}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        {/* Optimization Results */}
        {!loading && data?.goal_allocations && data.goal_allocations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> {t('alloc.optimResults')}</CardTitle>
              <CardDescription>{t('alloc.optimDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.goal_allocations.map(alloc => {
                const GoalIcon = getGoalIcon(alloc.icon || 'target');
                return (
                  <div key={alloc.goal_id} className="flex items-center justify-between rounded-lg border bg-primary/5 border-primary/20 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GoalIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-sm">{alloc.goal_name}</p>
                          {alloc.is_favourite && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('alloc.savePerDay')} <span className="font-semibold text-primary">${alloc.allocated_daily}{t('alloc.perDay')}</span> · ~{alloc.months_to_target} {t('alloc.monthsToTarget')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">${alloc.allocated_monthly}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('alloc.perMonth')}</p>
                    </div>
                  </div>
                );
              })}
              {data.daily_savings_target > 0 && (
                <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted">
                  <span className="text-sm font-medium">{t('alloc.totalDaily')}</span>
                  <span className="text-lg font-bold">${data.daily_savings_target}{t('alloc.perDay')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick action */}
        <Card className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-3"><Wallet className="w-5 h-5" /><span className="text-sm font-medium">{t('alloc.logExpense')}</span></div>
          <Button variant="secondary" size="sm" className="gap-1" onClick={() => onPageChange('NewEntry')}><Plus className="w-3.5 h-3.5" /> {t('nav.newExpense')}</Button>
        </Card>
      </div>

      {/* Right sidebar */}
      <div className="w-full xl:w-[380px] shrink-0 space-y-4">
        <Card className="text-center py-10">
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('alloc.safeDailySpend')}</p>
            <h2 className="text-5xl font-bold tracking-tight">{loading ? '...' : `$${data?.safe_daily_spend?.toFixed(2) || '0.00'}`}</h2>
          </CardContent>
        </Card>

        {!loading && data?.alerts?.map((alert, idx) => {
          const isPositive = alert.startsWith('✅');
          const isInfo = alert.startsWith('💡');
          return (
            <Alert key={idx} variant={isPositive || isInfo ? 'default' : 'destructive'}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <AlertDescription className="text-sm">{alert}</AlertDescription>
            </Alert>
          );
        })}
      </div>
    </div>
  );
}
