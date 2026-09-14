'use client';

import React, { useState } from 'react';
import { IncomeEntryItem, INCOME_SOURCES } from '@/lib/types';
import { formatCurrency } from '@/lib/finance-calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Trash2, Edit, TrendingUp, Calendar, DollarSign, Tag, Briefcase } from 'lucide-react';

interface IncomeManagerProps {
  financialMonthId: string;
  incomes: IncomeEntryItem[];
  currency?: string;
  onRefresh: () => Promise<void>;
}

export const IncomeManager: React.FC<IncomeManagerProps> = ({
  financialMonthId,
  incomes,
  currency = 'INR',
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeEntryItem | null>(null);

  const [source, setSource] = useState('Salary');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setSource('Salary');
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IncomeEntryItem) => {
    setEditingItem(item);
    setSource(item.source);
    setDescription(item.description);
    setAmount(String(item.amount));
    setDate(new Date(item.date).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this income entry?')) return;
    try {
      await fetch(`/api/finance/incomes?id=${id}`, { method: 'DELETE' });
      await onRefresh();
    } catch (error) {
      console.error('Delete income failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await fetch('/api/finance/incomes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            source,
            description,
            amount: parsedAmount,
            date,
          }),
        });
      } else {
        await fetch('/api/finance/incomes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            financialMonthId,
            source,
            description,
            amount: parsedAmount,
            date,
          }),
        });
      }
      setIsModalOpen(false);
      await onRefresh();
    } catch (error) {
      console.error('Save income failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = incomes.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="rounded-3xl bg-[#121624]/90 border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Monthly Income Streams</span>
          </h3>
          <p className="text-xs text-slate-400">
            Salary, freelance projects, bonuses, and investment yields.
          </p>
        </div>

        <Button onClick={handleOpenAdd} variant="secondary" size="sm">
          <Plus className="w-4 h-4 mr-1 text-emerald-400" />
          Add Income
        </Button>
      </div>

      {incomes.length === 0 ? (
        <div className="p-6 rounded-2xl bg-[#0a0d16] border border-white/5 text-center text-xs text-slate-400">
          No income streams recorded for this month. Click &quot;Add Income&quot; to register earnings.
        </div>
      ) : (
        <div className="space-y-2">
          {incomes.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-[#0c0f18] border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex-shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-200 truncate">
                    {item.description}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-emerald-300 font-medium">
                      {item.source}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-base font-extrabold text-emerald-300 font-mono">
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
            <span>Total Monthly Inflow:</span>
            <span className="text-sm font-black text-emerald-300 font-mono">
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Income Stream' : 'Record New Income'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Income Description *
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Primary Tech Salary, Mobile App Project"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Source Category
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-[#0d101a]/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/60"
              >
                {INCOME_SOURCES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Received Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
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
              {editingItem ? 'Save Updates' : 'Add Income'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
