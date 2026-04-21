import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Pencil, X, Check, CalendarDays } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../lib/i18n';
import { getCategoryConfig, ALL_CATEGORIES } from '../lib/categories';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid,
} from 'recharts';

interface Expense { id: number; note: string | null; amount: number; date: string; category: string; }

export default function Ledger() {
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNote, setEditNote] = useState(''); const [editAmount, setEditAmount] = useState(''); const [editCategory, setEditCategory] = useState('');

  const fetchTransactions = () => {
    fetch('http://127.0.0.1:8000/api/expenses').then(r => r.json()).then(d => { setTransactions(d.reverse()); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchTransactions(); }, []);

  const categories = useMemo(() => { const cats = new Set(transactions.map(tx => tx.category)); return ['All', ...Array.from(cats)]; }, [transactions]);
  const filtered = useMemo(() => {
    let result = transactions;
    if (filterCategory !== 'All') result = result.filter(tx => tx.category === filterCategory);
    if (dateFrom) result = result.filter(tx => tx.date >= dateFrom);
    if (dateTo) result = result.filter(tx => tx.date <= dateTo);
    return result;
  }, [transactions, filterCategory, dateFrom, dateTo]);

  const totalSpent = filtered.reduce((s, tx) => s + tx.amount, 0);
  const hasDateFilter = dateFrom || dateTo;

  // Chart data: category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(tx => { map[tx.category] = (map[tx.category] || 0) + tx.amount; });
    return Object.entries(map)
      .map(([cat, amount]) => ({
        name: cat,
        amount: Math.round(amount * 100) / 100,
        pct: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
        fill: getCategoryConfig(cat).chartColor,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered, totalSpent]);

  // Area chart data: spending over time by category
  const areaData = useMemo(() => {
    const dateMap: Record<string, Record<string, number>> = {};
    filtered.forEach(tx => {
      if (!dateMap[tx.date]) dateMap[tx.date] = {};
      dateMap[tx.date][tx.category] = (dateMap[tx.date][tx.category] || 0) + tx.amount;
    });
    const allCats: string[] = Array.from(new Set(filtered.map(tx => tx.category)));
    return Object.keys(dateMap).sort().map(d => {
      const entry: Record<string, number | string> = { date: d };
      allCats.forEach((cat: string) => { entry[cat] = Math.round((dateMap[d][cat] || 0) * 100) / 100; });
      return entry;
    });
  }, [filtered]);

  const areaCats: string[] = useMemo(() => Array.from(new Set(filtered.map(tx => tx.category))), [filtered]);

  const handleDelete = async (id: number) => {
    try { const res = await fetch(`http://127.0.0.1:8000/api/expenses/${id}`, { method: 'DELETE' }); if (res.ok) setTransactions(prev => prev.filter(tx => tx.id !== id)); } catch {}
  };
  const startEdit = (tx: Expense) => { setEditingId(tx.id); setEditNote(tx.note || ''); setEditAmount(String(tx.amount)); setEditCategory(tx.category); };
  const handleSaveEdit = async (tx: Expense) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/expenses/${tx.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(editAmount), category: editCategory, date: tx.date, note: editNote, is_essential: ['Housing', 'Utilities', 'Food', 'Healthcare'].includes(editCategory), is_recurring: editCategory === 'Subscription' })
      });
      if (res.ok) { setEditingId(null); fetchTransactions(); }
    } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-2">{t('ledger.entries')}</p>
            <p className="text-4xl font-extrabold tracking-tight">{filtered.length}</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary/10" />
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-2">{t('ledger.totalSpent')}</p>
            <p className="text-4xl font-extrabold tracking-tight text-primary">${totalSpent.toLocaleString()}</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/30" />
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5 pb-4">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-2">{t('ledger.categories')}</p>
            <p className="text-4xl font-extrabold tracking-tight">{categories.length - 1}</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/40 to-purple-500/10" />
        </Card>
      </div>

      {/* Charts */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar chart: percentage breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('ledger.expenseBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryBreakdown} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number | string) => [`$${value}`, '']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--popover)', color: 'var(--popover-foreground)' }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Area chart: spending over time */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('ledger.spendingOverTime')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--popover)', color: 'var(--popover-foreground)' }} />
                  {areaCats.map(cat => (
                    <Area
                      key={cat} type="monotone" dataKey={cat}
                      stackId="1"
                      stroke={getCategoryConfig(cat).chartColor}
                      fill={getCategoryConfig(cat).chartColor}
                      fillOpacity={0.4}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const config = cat !== 'All' ? getCategoryConfig(cat) : null;
            const CatIcon = config?.icon;
            return (
              <Badge key={cat} variant={filterCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/10 transition-colors gap-1.5"
                style={filterCategory === cat && config ? { backgroundColor: config.color, borderColor: config.color } : undefined}
                onClick={() => setFilterCategory(cat)}>
                {CatIcon && <CatIcon className="w-3 h-3" />}
                {cat === 'All' ? t('ledger.all') : cat}
                {filterCategory === cat && cat !== 'All' && <X className="w-3 h-3 ml-1" onClick={(e) => { e.stopPropagation(); setFilterCategory('All'); }} />}
              </Badge>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-40 h-8 text-xs" />
          <span className="text-muted-foreground text-xs">→</span>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-40 h-8 text-xs" />
          {hasDateFilter && <Button variant="ghost" size="sm" className="text-destructive text-xs h-7" onClick={() => { setFilterCategory('All'); setDateFrom(''); setDateTo(''); }}>{t('ledger.clear')}</Button>}
        </div>
      </div>

      {/* Transactions */}
      <div className="space-y-2">
        {loading ? <p className="text-center text-muted-foreground py-10">{t('common.loading')}</p> :
         filtered.length === 0 ? <Card className="py-12"><CardContent className="text-center text-muted-foreground">{transactions.length === 0 ? t('ledger.noTransactions') : t('ledger.noMatch')}</CardContent></Card> :
         filtered.map(tx => {
          const catConfig = getCategoryConfig(tx.category);
          const CatIcon = catConfig.icon;
          return (
           <Card key={tx.id} className="group hover:shadow-md transition-shadow">
             <CardContent className="flex items-center justify-between py-4 px-5">
               {editingId === tx.id ? (
                 <div className="flex items-center gap-2 w-full">
                   <Input value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Description" className="flex-1 h-8 text-sm" />
                   <Input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="Category" className="w-28 h-8 text-sm" />
                   <Input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} className="w-24 h-8 text-sm" />
                   <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => handleSaveEdit(tx)}><Check className="w-3.5 h-3.5" /></Button>
                   <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="w-3.5 h-3.5" /></Button>
                 </div>
               ) : (
                 <>
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: catConfig.bgColor }}>
                       <CatIcon className="w-5 h-5" style={{ color: catConfig.color }} />
                     </div>
                     <div>
                       <p className="font-semibold text-sm">{tx.note || t('ledger.noDescription')}</p>
                       <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-xs text-muted-foreground">{tx.date}</span>
                         <Badge variant="outline" className="text-[10px] h-4 gap-1" style={{ borderColor: catConfig.borderColor, color: catConfig.color }}>
                           {tx.category}
                         </Badge>
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-2xl font-extrabold tracking-tight" style={{ color: catConfig.color }}>${tx.amount.toLocaleString()}</span>
                     <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(tx)}><Pencil className="w-3 h-3" /></Button>
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(tx.id)}><Trash2 className="w-3 h-3" /></Button>
                     </div>
                   </div>
                 </>
               )}
             </CardContent>
           </Card>
          );
        })}
      </div>
    </div>
  );
}
