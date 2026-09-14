'use client';

import React, { useState } from 'react';
import { ExpenseItem, FIXED_EXPENSE_CATEGORIES } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Trash2, Edit, Lock, CheckCircle2, Circle, RefreshCw } from 'lucide-react';

interface FixedExpenseManagerProps {
  financialMonthId: string;
  expenses: ExpenseItem[];
  currency?: string;
  onRefresh: () => Promise<void>;
}

export const FixedExpenseManager: React.FC<FixedExpenseManagerProps> = ({
  financialMonthId,
  expenses,
  currency = 'INR',
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Rent/EMI');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fixedExpenses = expenses.filter((e) => e.type === 'FIXED');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDescription('');
    setCategory('Rent/EMI');
    setCustomCategory('');
    setAmount('');
    setIsRecurring(true);
    setIsPaid(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ExpenseItem) => {
    setEditingItem(item);
    setDescription(item.description);
    if (FIXED_EXPENSE_CATEGORIES.includes(item.category as typeof FIXED_EXPENSE_CATEGORIES[number])) {
      setCategory(item.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(item.category);
    }
    setAmount(String(item.amount));
    setIsRecurring(item.isRecurring);
    setIsPaid(item.isPaid);
    setIsModalOpen(true);
  };

  const handleTogglePaid = async (item: ExpenseItem) => {
    try {
      await fetch('/api/finance/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          isPaid: !item.isPaid,
        }),
      });
      await onRefresh();
    } catch (error) {
      console.error('Toggle paid failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fixed expense?')) return;
    try {
      await fetch(`/api/finance/expenses?id=${id}`, { method: 'DELETE' });
      await onRefresh();
    } catch (error) {
      console.error('Delete expense failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const finalCategory = category === 'Custom' ? customCategory.trim() || 'Other' : category;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await fetch('/api/finance/expenses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            description,
            category: finalCategory,
            amount: parsedAmount,
            type: 'FIXED',
            isRecurring,
            isPaid,
          }),
        });
      } else {
        await fetch('/api/finance/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            financialMonthId,
            description,
            category: finalCategory,
            amount: parsedAmount,
            type: 'FIXED',
            isRecurring,
            isPaid,
          }),
        });
      }
      setIsModalOpen(false);
      await onRefresh();
    } catch (error) {
      console.error('Save fixed expense failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = fixedExpenses.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="rounded-3xl bg-[#121624]/90 border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-400" />
            <span>Fixed Monthly Commitments</span>
          </h3>
          <p className="text-xs text-slate-400">
            Rent, utilities, food, insurance, transport, and subscriptions.
          </p>
        </div>

        <Button onClick={handleOpenAdd} variant="secondary" size="sm">
          <Plus className="w-4 h-4 mr-1 text-rose-400" />
          Add Fixed Expense
        </Button>
      </div>

      {fixedExpenses.length === 0 ? (
        <div className="p-6 rounded-2xl bg-[#0a0d16] border border-white/5 text-center text-xs text-slate-400">
          No recurring fixed expenses recorded for this month.
        </div>
      ) : (
        <div className="space-y-2">
          {fixedExpenses.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                item.isPaid
                  ? 'bg-[#0c0f18]/60 border-white/5 opacity-80'
                  : 'bg-[#0e121f] border-white/10 hover:border-rose-500/40'
              }`}
            >
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTogglePaid(item)}
                  className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
                  title={item.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                >
                  {item.isPaid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400" />
                  )}
                </button>

                <div className="min-w-0">
                  <h4 className={`text-sm font-bold truncate ${item.isPaid ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {item.description}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-rose-300 font-medium">
                      {item.category}
                    </span>
                    {item.isRecurring && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <RefreshCw className="w-2.5 h-2.5" /> Recurring
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-base font-extrabold text-rose-300 font-mono">
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
          ))}

          {/* Subtotal */}
          <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-white/5 px-2">
            <span>Total Fixed Obligations:</span>
            <span className="text-sm font-black text-rose-300 font-mono">
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Fixed Expense' : 'Add Fixed Monthly Expense'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Expense Description *
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Apartment Rent, Fiber Internet, Health Insurance"
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
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500/60"
              >
                {FIXED_EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
                <option value="Custom" className="bg-slate-900 text-white">+ Custom Category</option>
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

          {category === 'Custom' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Custom Category Name
              </label>
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Pet Care, Gym Membership"
                required
              />
            </div>
          )}

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-white/20 bg-slate-800 text-amber-500 focus:ring-0"
              />
              <span>Auto-carry over each month</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="rounded border-white/20 bg-slate-800 text-amber-500 focus:ring-0"
              />
              <span>Already Paid for this month</span>
            </label>
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
              {editingItem ? 'Save Updates' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
