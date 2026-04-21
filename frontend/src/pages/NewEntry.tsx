import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Page } from '../types';
import { useI18n } from '../lib/i18n';
import { ALL_CATEGORIES, getCategoryConfig } from '../lib/categories';

interface NewEntryProps { onPageChange: (page: Page) => void; }

export default function NewEntry({ onPageChange }: NewEntryProps) {
  const { t } = useI18n();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) { setError(t('entry.fillFields')); return; }
    setError(''); setSaving(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/expenses/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount), category, date, note: note || undefined,
          is_essential: ['Housing', 'Utilities', 'Food', 'Healthcare'].includes(category),
          is_recurring: category === 'Subscription'
        })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => onPageChange('Transactions'), 1200);
      } else { setError('Failed to log expense.'); }
    } catch { setError(t('smart.backendError')); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('entry.logExpense')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>{t('entry.amount')}</Label>
              <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="text-lg" />
            </div>

            <div className="space-y-2">
              <Label>{t('entry.category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder={t('entry.selectCategory')} /></SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map(cat => {
                    const config = getCategoryConfig(cat);
                    const CatIcon = config.icon;
                    return (
                      <SelectItem key={cat} value={cat}>
                        <div className="flex items-center gap-2">
                          <CatIcon className="w-4 h-4" style={{ color: config.color }} />
                          {cat}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('entry.date')}</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>{t('entry.note')}</Label>
              <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder={t('entry.notePlaceholder')} rows={2} />
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onPageChange('Transactions')}>{t('entry.cancel')}</Button>
              <Button type="submit" className="flex-[2] gap-1" disabled={saving || success}>
                {success ? <><CheckCircle className="w-4 h-4" /> {t('entry.saved')}</> : saving ? t('entry.saving') : t('entry.log')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
