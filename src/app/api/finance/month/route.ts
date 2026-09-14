import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { computeFinancialMonth, roundMoney } from '@/lib/finance-calculator';

const updateMonthSchema = z.object({
  savingsTarget: z.number().min(0).optional(),
  safetyBuffer: z.number().min(0).optional(),
  dreamBudget: z.number().min(0).optional(),
  currency: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1), 10);
    const year = parseInt(searchParams.get('year') || String(now.getFullYear()), 10);

    // Find or create month record
    let monthRecord = await db.financialMonth.findUnique({
      where: {
        month_year: { month, year },
      },
      include: {
        incomes: { orderBy: { date: 'asc' } },
        expenses: { orderBy: { date: 'asc' } },
        allocations: { include: { linkedDream: true }, orderBy: { amount: 'desc' } },
        transactions: { include: { linkedDream: true }, orderBy: { date: 'desc' } },
      },
    });

    if (!monthRecord) {
      // Find previous month to optionally inherit default recurring fixed expenses, savings target & buffer
      const prevMonthNum = month === 1 ? 12 : month - 1;
      const prevYearNum = month === 1 ? year - 1 : year;
      const prevMonth = await db.financialMonth.findUnique({
        where: {
          month_year: { month: prevMonthNum, year: prevYearNum },
        },
        include: {
          expenses: { where: { type: 'FIXED', isRecurring: true } },
        },
      });

      monthRecord = await db.financialMonth.create({
        data: {
          month,
          year,
          savingsTarget: prevMonth ? prevMonth.savingsTarget : 1500,
          safetyBuffer: prevMonth ? prevMonth.safetyBuffer : 800,
          dreamBudget: prevMonth ? prevMonth.dreamBudget : 500,
          currency: prevMonth ? prevMonth.currency : 'INR',
          notes: `Ledger initialized for ${month}/${year}.`,
        },
        include: {
          incomes: true,
          expenses: true,
          allocations: { include: { linkedDream: true } },
          transactions: { include: { linkedDream: true } },
        },
      });

      // If previous month had recurring fixed expenses, copy them over
      if (prevMonth && prevMonth.expenses.length > 0) {
        for (const fixedExp of prevMonth.expenses) {
          await db.expense.create({
            data: {
              financialMonthId: monthRecord.id,
              description: fixedExp.description,
              category: fixedExp.category,
              amount: fixedExp.amount,
              type: 'FIXED',
              isRecurring: true,
              isPaid: false,
              date: new Date(year, month - 1, 1),
            },
          });
        }

        // Reload updated expenses
        monthRecord = await db.financialMonth.findUnique({
          where: { id: monthRecord.id },
          include: {
            incomes: { orderBy: { date: 'asc' } },
            expenses: { orderBy: { date: 'asc' } },
            allocations: { include: { linkedDream: true }, orderBy: { amount: 'desc' } },
            transactions: { include: { linkedDream: true }, orderBy: { date: 'desc' } },
          },
        }) || monthRecord;
      }
    }

    // Compute financial formulas
    const calculated = computeFinancialMonth(
      monthRecord.incomes,
      monthRecord.expenses,
      monthRecord.savingsTarget,
      monthRecord.safetyBuffer,
      monthRecord.dreamBudget,
      monthRecord.transactions
    );

    const totalAllocated = roundMoney(
      monthRecord.allocations.reduce((acc, curr) => acc + curr.amount, 0)
    );
    calculated.savingsAllocated = totalAllocated;

    return NextResponse.json({
      monthData: {
        ...monthRecord,
        calculated,
      },
    });
  } catch (error) {
    console.error('Fetch financial month error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || '', 10);
    const year = parseInt(searchParams.get('year') || '', 10);

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    const body = await req.json();
    const result = updateMonthSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const updated = await db.financialMonth.update({
      where: {
        month_year: { month, year },
      },
      data: result.data,
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Update financial month error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
