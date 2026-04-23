import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, CheckCircle, PieChart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { ALL_CATEGORIES, getCategoryConfig } from '../lib/categories';
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Tooltip
} from 'recharts';

interface Limit {
  id: number;
  category: string;
  amount: number;
}

interface Expense {
  category: string;
  amount: number;
}

export default function Limits() {
  const { t } = useI18n();
  const [limits, setLimits] = useState<Limit[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = () => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/limits').then(r => r.json()),
      fetch('http://127.0.0.1:8000/api/expenses').then(r => r.json()),
    ]).then(([limData, expData]) => {
      setLimits(limData);
      setExpenses(expData);
      setLoading(false);
    }).catch(() => setLoading(false));
  };
  
  useEffect(() => { fetchData(); }, []);

  const handleAddLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) { setError(t('alloc.fillFields')); return; }
    setError(''); setSaving(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/limits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount: parseFloat(amount) })
      });
      if (res.ok) {
        setCategory(''); setAmount(''); setShowForm(false);
        fetchData();
      } else { setError('Failed to add limit.'); }
    } catch { setError(t('smart.backendError')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { 
      const res = await fetch(`http://127.0.0.1:8000/api/limits/${id}`, { method: 'DELETE' }); 
      if (res.ok) fetchData(); 
    } catch {}
  };

  const getSpent = (cat: string) => {
    return expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('limits.tracking')} {limits.length} {t('limits.activeLimits')}.
        </p>
        <Button size="sm" className="gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5" /> {t('limits.newLimit')}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('limits.addLimit')}</CardTitle>
            <CardDescription>{t('limits.addLimitDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLimit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label>{t('entry.category')}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder={t('entry.selectCategory')} /></SelectTrigger>
                  <SelectContent>
                    {ALL_CATEGORIES.map(cat => {
                      const config = getCategoryConfig(cat);
                      const CatIcon = config.icon;
                      return (
                        <SelectItem key={cat} value={cat} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CatIcon className="w-4 h-4" style={{ color: config.color }} />
                            {t('cat.' + cat)}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1">
                <Label>{t('limits.limitAmount')}</Label>
                <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500" />
              </div>
              <Button type="submit" disabled={saving} className="mb-0.5">
                {saving ? t('entry.saving') : t('limits.saveLimit')}
              </Button>
            </form>
            {error && <Alert variant="destructive" className="mt-4"><AlertDescription>{error}</AlertDescription></Alert>}
          </CardContent>
        </Card>
      )}

      {loading ? <p className="text-center text-muted-foreground py-10">{t('common.loading')}</p> :
       limits.length === 0 ? <Card className="py-16 text-center"><CardContent><p className="text-muted-foreground">{t('limits.noLimits')}</p></CardContent></Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {limits.map(limit => {
            const spent = getSpent(limit.category);
            const remaining = limit.amount - spent;
            const percentage = Math.min((spent / limit.amount) * 100, 100);
            const config = getCategoryConfig(limit.category);
            const CatIcon = config.icon;
            
            const chartData = [{ name: limit.category, value: percentage, fill: config.chartColor }];

            return (
              <Card key={limit.id} className="relative group overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgClass}`}>
                      <CatIcon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(limit.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{t('cat.' + limit.category)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {remaining >= 0 
                        ? <><span className="font-medium text-emerald-500">${remaining.toLocaleString()}</span> {t('limits.leftOf')} ${limit.amount.toLocaleString()}</>
                        : <><span className="font-medium text-red-500">${Math.abs(remaining).toLocaleString()}</span> {t('limits.overLimit')} ${limit.amount.toLocaleString()}</>
                      }
                    </p>
                  </div>

                  <div className="h-32 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        cx="50%" cy="50%" 
                        innerRadius="70%" outerRadius="100%" 
                        barSize={10} 
                        data={chartData} 
                        startAngle={90} endAngle={-270}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background clockWise dataKey="value" cornerRadius={5} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
