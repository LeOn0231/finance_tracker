import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const incomeSchema = z.object({
  financialMonthId: z.string().min(1, 'Financial Month ID is required'),
  source: z.string().default('Salary'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().optional(),
});

const updateIncomeSchema = z.object({
  id: z.string().min(1),
  source: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().min(0).optional(),
  date: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = incomeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { financialMonthId, source, description, amount, date } = result.data;

    const income = await db.incomeEntry.create({
      data: {
        financialMonthId,
        source,
        description,
        amount,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ income }, { status: 201 });
  } catch (error) {
    console.error('Create income error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = updateIncomeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { id, source, description, amount, date } = result.data;

    const updated = await db.incomeEntry.update({
      where: { id },
      data: {
        source,
        description,
        amount,
        date: date ? new Date(date) : undefined,
      },
    });

    return NextResponse.json({ income: updated });
  } catch (error) {
    console.error('Update income error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.incomeEntry.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Income entry deleted' });
  } catch (error) {
    console.error('Delete income error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
