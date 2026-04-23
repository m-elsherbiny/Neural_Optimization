import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Plus, Trash2, Pencil, PiggyBank, Check, X, CheckCircle, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Page } from '../types';
import { useI18n } from '../lib/i18n';
import { GOAL_ICONS, GOAL_COLORS, getGoalColor } from '../lib/categories';
import { getGoalIcon } from '../lib/goalIcons';
import { DatePickerSimple } from '@/components/ui/date-picker';
import { format } from 'date-fns';

interface Goal {
  id: number; name: string; target_amount: number; current_amount: number;
  deadline: string | null; is_favourite: boolean; icon: string; priority: number;
}
interface ObjectivesProps { onPageChange: (page: Page) => void; }

function setGoalColorLS(id: number, colorName: string) { localStorage.setItem(`goal_color_${id}`, colorName); }

export default function Objectives({ onPageChange }: ObjectivesProps) {
  const { t } = useI18n();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState(''); const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState(''); const [deadline, setDeadline] = useState<Date | undefined>();
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0].name);
  const [selectedIcon, setSelectedIcon] = useState('target');
  const [saving, setSaving] = useState(false); const [success, setSuccess] = useState(false); const [error, setError] = useState('');
  const [addMoneyId, setAddMoneyId] = useState<number | null>(null); const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editName, setEditName] = useState(''); const [editTarget, setEditTarget] = useState(''); const [editDeadline, setEditDeadline] = useState<Date | undefined>();
  const [colorPickerId, setColorPickerId] = useState<number | null>(null);

  const fetchGoals = () => {
    fetch('http://127.0.0.1:8000/api/goals').then(r => r.json()).then(d => { setGoals(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchGoals(); }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) { setError(t('goals.fillFields')); return; }
    setError(''); setSaving(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/goals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, target_amount: parseFloat(targetAmount),
          current_amount: parseFloat(currentAmount || '0'),
          deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null,
          priority: 1, is_favourite: false, icon: selectedIcon
        })
      });
      if (res.ok) {
        const created = await res.json(); setGoalColorLS(created.id, selectedColor);
        setSuccess(true); setName(''); setTargetAmount(''); setCurrentAmount(''); setDeadline(undefined); setSelectedIcon('target');
        setTimeout(() => { setSuccess(false); setShowForm(false); fetchGoals(); }, 800);
      } else { setError('Failed to create goal.'); }
    } catch { setError(t('smart.backendError')); }
    finally { setSaving(false); }
  };

  const handleAddMoney = async (goal: Goal) => {
    const amt = parseFloat(addMoneyAmount); if (!amt || amt <= 0) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/goals/${goal.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...goal, current_amount: goal.current_amount + amt })
      });
      setAddMoneyId(null); setAddMoneyAmount(''); fetchGoals();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try { await fetch(`http://127.0.0.1:8000/api/goals/${id}`, { method: 'DELETE' }); fetchGoals(); } catch {}
  };

  const handleToggleFavourite = async (goal: Goal) => {
    try {
      // If this goal is being set as favourite, unfavourite all others first
      if (!goal.is_favourite) {
        for (const g of goals) {
          if (g.is_favourite && g.id !== goal.id) {
            await fetch(`http://127.0.0.1:8000/api/goals/${g.id}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...g, is_favourite: false })
            });
          }
        }
      }
      await fetch(`http://127.0.0.1:8000/api/goals/${goal.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...goal, is_favourite: !goal.is_favourite })
      });
      fetchGoals();
    } catch {}
  };

  const openEdit = (goal: Goal) => { setEditingGoal(goal); setEditName(goal.name); setEditTarget(String(goal.target_amount)); setEditDeadline(goal.deadline ? new Date(goal.deadline) : undefined); };
  const handleSaveEdit = async () => {
    if (!editingGoal) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/goals/${editingGoal.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName, target_amount: parseFloat(editTarget),
          current_amount: editingGoal.current_amount,
          deadline: editDeadline ? format(editDeadline, 'yyyy-MM-dd') : null,
          priority: editingGoal.priority, is_favourite: editingGoal.is_favourite,
          icon: editingGoal.icon
        })
      });
      setEditingGoal(null); fetchGoals();
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('goals.tracking')} {goals.length} {goals.length !== 1 ? t('goals.activeGoals') : t('goals.activeGoal')}.
        </p>
        <Button size="sm" className="gap-1" onClick={() => setShowForm(true)}><Plus className="w-3.5 h-3.5" /> {t('goals.newGoal')}</Button>
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('goals.createNew')}</DialogTitle>
            <DialogDescription>{t('goals.createDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('goals.goalName')}</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Emergency Fund" /></div>
              <div className="space-y-2"><Label>{t('goals.deadline')}</Label><DatePickerSimple date={deadline} setDate={setDeadline} className="w-full" /></div>
              <div className="space-y-2"><Label>{t('goals.targetAmount')}</Label><Input type="number" step="0.01" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="10000" /></div>
              <div className="space-y-2"><Label>{t('goals.currentlySaved')}</Label><Input type="number" step="0.01" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="0" /></div>
            </div>
            {/* Icon selection */}
            <div className="space-y-2">
              <Label>{t('goals.icon')}</Label>
              <div className="flex gap-2 flex-wrap">
                {GOAL_ICONS.map(gi => {
                  const GI = getGoalIcon(gi.id);
                  return (
                    <button key={gi.id} type="button" onClick={() => setSelectedIcon(gi.id)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${selectedIcon === gi.id ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : 'bg-muted text-muted-foreground'}`}
                      title={gi.label}>
                      <GI className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('goals.color')}</Label>
              <div className="flex gap-2">
                {GOAL_COLORS.map(c => (
                  <button key={c.name} type="button" onClick={() => setSelectedColor(c.name)}
                    className="w-7 h-7 rounded-full transition-all hover:scale-110 relative"
                    style={{ background: c.hex, boxShadow: selectedColor === c.name ? `0 0 0 2px white, 0 0 0 4px ${c.hex}` : 'none' }}>
                    {selectedColor === c.name && <Check className="w-3 h-3 text-white absolute inset-0 m-auto" />}
                  </button>
                ))}
              </div>
            </div>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('goals.cancel')}</Button>
              <Button type="submit" disabled={saving}>{success ? <><CheckCircle className="w-4 h-4 mr-1" />{t('goals.created')}</> : saving ? t('goals.creating') : t('goals.create')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => { if (!open) setEditingGoal(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('goals.editGoal')}</DialogTitle><DialogDescription>{t('goals.updateDesc')}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{t('goals.name')}</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('goals.target')}</Label><Input type="number" step="0.01" value={editTarget} onChange={e => setEditTarget(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('goals.deadline')}</Label><DatePickerSimple date={editDeadline} setDate={setEditDeadline} className="w-full" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGoal(null)}>{t('goals.cancel')}</Button>
            <Button onClick={handleSaveEdit}>{t('goals.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goals grid */}
      {loading ? <p className="text-center text-muted-foreground py-10">{t('common.loading')}</p> :
       goals.length === 0 ? <Card className="py-16 text-center"><CardContent><p className="text-muted-foreground">{t('goals.noGoals')}</p></CardContent></Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(obj => {
            const progress = obj.target_amount > 0 ? Math.min(Math.round((obj.current_amount / obj.target_amount) * 100), 100) : 0;
            const isDark = document.documentElement.classList.contains('dark');
            const color = getGoalColor(obj.id, isDark);
            const GoalIcon = getGoalIcon(obj.icon || 'target');
            return (
              <Card key={obj.id} className={`relative group overflow-visible hover:shadow-md transition-shadow ${obj.is_favourite ? 'md:col-span-2' : ''}`}>
                {/* Favourite indicator */}
                {obj.is_favourite && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                      <Star className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </div>
                )}

                {/* Color picker popup */}
                {colorPickerId === obj.id && (
                  <div className="absolute top-2 right-2 bg-popover rounded-lg shadow-lg border p-2.5 flex gap-1.5 z-20 flex-wrap w-[160px]">
                    {GOAL_COLORS.map(c => (
                      <button key={c.name} onClick={() => { setGoalColorLS(obj.id, c.name); setColorPickerId(null); setGoals([...goals]); }}
                        className="w-6 h-6 rounded-full hover:scale-110 transition-transform relative" style={{ background: c.hex }}>
                        {color.name === c.name && <Check className="w-3 h-3 text-white absolute inset-0 m-auto" />}
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: color.bg }}>
                      <GoalIcon className="w-5 h-5" style={{ color: color.hex }} />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${obj.current_amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{t('goals.of')} ${obj.target_amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{obj.name}</CardTitle>
                    <span className="text-xs font-bold" style={{ color: color.hex }}>{progress}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: color.hex }} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" /> {obj.deadline || t('goals.ongoing')}
                    </div>
                    {addMoneyId === obj.id ? (
                      <div className="flex items-center gap-1.5">
                        <Input type="number" step="0.01" value={addMoneyAmount} onChange={e => setAddMoneyAmount(e.target.value)} placeholder="100" className="w-20 h-7 text-xs" autoFocus />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => handleAddMoney(obj)}><Check className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setAddMoneyId(null); setAddMoneyAmount(''); }}><X className="w-3.5 h-3.5" /></Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => setAddMoneyId(obj.id)}>
                        <PiggyBank className="w-3.5 h-3.5" /> {t('goals.addFunds')}
                      </Button>
                    )}
                  </div>

                  {/* Action row */}
                  <div className="flex items-center justify-end gap-1 pt-1 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => handleToggleFavourite(obj)}>
                      <Star className={`w-3 h-3 ${obj.is_favourite ? 'fill-amber-400 text-amber-400' : ''}`} /> {t('goals.favourite')}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => setColorPickerId(colorPickerId === obj.id ? null : obj.id)}>
                      <div className="w-3 h-3 rounded-full" style={{ background: color.hex }} /> {t('goals.color')}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => openEdit(obj)}>
                      <Pencil className="w-3 h-3" /> {t('goals.edit')}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive" onClick={() => handleDelete(obj.id)}>
                      <Trash2 className="w-3 h-3" /> {t('goals.delete')}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
