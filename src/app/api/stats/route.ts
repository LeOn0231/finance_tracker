import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { computeFinancialMonth } from '@/lib/finance-calculator';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dreams = await db.dreamPurchase.findMany({
      orderBy: [{ isCurrentQuest: 'desc' }, { dateAdded: 'desc' }],
    });

    const totalDreams = dreams.length;
    let bigDreamsCount = 0;
    let smallDreamsCount = 0;
    let purchasedCount = 0;
    let totalDreamValue = 0;
    let purchasedValue = 0;

    let currentQuest = dreams.find((d) => d.isCurrentQuest && d.status !== 'PURCHASED') || null;

    if (!currentQuest) {
      currentQuest = dreams.find((d) => d.status !== 'PURCHASED' && d.priority === 'S_TIER') ||
        dreams.find((d) => d.status !== 'PURCHASED') ||
        null;
    }

    for (const d of dreams) {
      const price = d.finalPrice || d.listedPrice || 0;
      totalDreamValue += price;

      if (d.type === 'BIG_DREAM') {
        bigDreamsCount++;
      } else {
        smallDreamsCount++;
      }

      if (d.status === 'PURCHASED') {
        purchasedCount++;
        purchasedValue += price;
      }
    }

    const remainingValue = Math.max(0, totalDreamValue - purchasedValue);

    // Fetch Current Month Financial Summary for Dashboard
    const now = new Date();
    const currentMonthNum = now.getMonth() + 1;
    const currentYearNum = now.getFullYear();

    const currentMonth = await db.financialMonth.findUnique({
      where: {
        month_year: { month: currentMonthNum, year: currentYearNum },
      },
      include: {
        incomes: true,
        expenses: true,
        transactions: true,
      },
    });

    let currentMonthFinance = null;
    if (currentMonth) {
      const calc = computeFinancialMonth(
        currentMonth.incomes,
        currentMonth.expenses,
        currentMonth.savingsTarget,
        currentMonth.safetyBuffer,
        currentMonth.dreamBudget,
        currentMonth.transactions
      );

      currentMonthFinance = {
        month: currentMonth.month,
        year: currentMonth.year,
        totalIncome: calc.totalIncome,
        fixedExpenses: calc.fixedExpenses,
        savingsTarget: calc.savingsTarget,
        actualSpending: calc.actualSpending,
        availableMoney: calc.availableMoney,
        safetyBuffer: calc.safetyBuffer,
        safeToSpend: calc.safeToSpend,
        savingsRate: calc.savingsRate,
        isDeficit: calc.isDeficit,
      };
    }

    return NextResponse.json({
      stats: {
        totalDreams,
        bigDreamsCount,
        smallDreamsCount,
        purchasedCount,
        totalDreamValue,
        purchasedValue,
        remainingValue,
        currentQuest,
        currentMonthFinance,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
