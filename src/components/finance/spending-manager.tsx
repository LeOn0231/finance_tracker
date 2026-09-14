'use client';

import React, { useState } from 'react';
import { ExpenseItem, SPENDING_CATEGORIES, DreamPurchaseItem } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Trash2, Edit, ShoppingBag, Calendar, Tag, Sparkles } from 'lucide-react';

interface SpendingManagerProps {
  financialMonthId: string;
  expenses: ExpenseItem[];
  dreams?: DreamPurchaseItem[];
  currency?: string;
  onRefresh: () => Promise<void>;
}

export const SpendingManager: React.FC<SpendingManagerProps> = ({
  financialMonthId,
  expenses,
  dreams = [],
  currency = 'INR',
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Dining');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [linkedDreamId, setLinkedDreamId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const spendingList = expenses.filter((e) => e.type === 'ADDITIONAL_SPENDING');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDescription('');
    setCategory('Dining');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setLinkedDreamId('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setDescription(item.description);
    setCategory(item.category);
    setAmount(String(item.amount));
    setDate(new Date(item.date).toISOString().split('T')[0]);
    setLinkedDreamId(item.linkedDreamId || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this spending record?')) return;
    try {
      await fetch(`/api/finance/expenses?id=${id}`, { method: 'DELETE' });
      await onRefresh();
    } catch (error) {
      console.error('Delete spending failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await fetch('/api/finance/expenses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            description,
            category,
            amount: parsedAmount,
            type: 'ADDITIONAL_SPENDING',
            isRecurring: false,
            isPaid: true,
            linkedDreamId: linkedDreamId || null,
            notes: notes || null,
            date,
          }),
        });
      } else {
        await fetch('/api/finance/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            financialMonthId,
            description,
            category,
            amount: parsedAmount,
            type: 'ADDITIONAL_SPENDING',
            isRecurring: false,
            isPaid: true,
            linkedDreamId: linkedDreamId || null,
            notes: notes || null,
            date,
          }),
        });
      }
      setIsModalOpen(false);
      await onRefresh();
    } catch (error) {
      console.error('Save spending failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = spendingList.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="rounded-3xl bg-[#121624]/90 border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Actual Additional Spending</span>
          </h3>
          <p className="text-xs text-slate-400">
            Ad-hoc purchases, dining, hobby gear, and small treats deducted from Safe-to-Spend.
          </p>
        </div>

        <Button onClick={handleOpenAdd} variant="secondary" size="sm">
          <Plus className="w-4 h-4 mr-1 text-amber-400" />
          Record Spending
        </Button>
      </div>

      {spendingList.length === 0 ? (
        <div className="p-6 rounded-2xl bg-[#0a0d16] border border-white/5 text-center text-xs text-slate-400">
          No additional spending recorded this month. Your safe-to-spend balance is fully intact.
        </div>
      ) : (
        <div className="space-y-2">
          {spendingList.map((item) => {
            const linked = dreams.find((d) => d.id === item.linkedDreamId);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#0c0f18] border border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-200 truncate">
                      {item.description}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-amber-300">
                      {item.category}
                    </span>
                    {linked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        Linked Dream: {linked.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    {item.notes && (
                      <>
                        <span>•</span>
                        <span className="italic text-slate-500 truncate">{item.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-base font-extrabold text-amber-300 font-mono">
                    {formatCurrency(item.amount, currency)}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Subtotal */}
          <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-white/5 px-2">
            <span>Total Discretionary Spending:</span>
            <span className="text-sm font-black text-amber-300 font-mono">
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Spending Entry' : 'Record Transaction'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Item / Description *
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Amazon Order, Izakaya Dinner, Audio Cable"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
              >
                {SPENDING_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Amount ({currency}) *
              </label>
              <Input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Transaction Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Optional Linked Dream
              </label>
              <select
                value={linkedDreamId}
                onChange={(e) => setLinkedDreamId(e.target.value)}
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60"
              >
                <option value="">None (General Spending)</option>
                {dreams.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes / Receipt Details
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bought with discount coupon"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              isLoading={isSubmitting}
            >
              {editingItem ? 'Save Updates' : 'Record Spending'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
