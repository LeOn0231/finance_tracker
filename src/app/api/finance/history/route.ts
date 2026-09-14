import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { computeFinancialMonth, MONTH_NAMES } from '@/lib/finance-calculator';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '6m';

    // Retrieve all recorded financial months ordered chronologically
    const allMonths = await db.financialMonth.findMany({
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      include: {
        incomes: true,
        expenses: true,
        transactions: true,
      },
    });

    let filtered = allMonths;
    if (range === '1m') {
      filtered = allMonths.slice(-1);
    } else if (range === '3m') {
      filtered = allMonths.slice(-3);
    } else if (range === '6m') {
      filtered = allMonths.slice(-6);
    } else if (range === '12m') {
      filtered = allMonths.slice(-12);
    }

    const history = filtered.map((m) => {
      const calc = computeFinancialMonth(
        m.incomes,
        m.expenses,
        m.savingsTarget,
        m.safetyBuffer,
        m.dreamBudget,
        m.transactions
      );

      return {
        id: m.id,
        month: m.month,
        year: m.year,
        label: `${MONTH_NAMES[m.month - 1].slice(0, 3)} ${m.year}`,
        income: calc.totalIncome,
        fixedExpenses: calc.fixedExpenses,
        savings: calc.savingsTarget,
        discretionarySpending: calc.actualSpending,
        dreamSpending: calc.dreamSpending,
        available: calc.availableMoney,
        safeToSpend: calc.safeToSpend,
        savingsRate: calc.savingsRate,
      };
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Fetch finance history error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
