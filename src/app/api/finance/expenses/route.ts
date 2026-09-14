import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const expenseSchema = z.object({
  financialMonthId: z.string().min(1, 'Financial Month ID is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().default('General'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['FIXED', 'ADDITIONAL_SPENDING']).default('FIXED'),
  isRecurring: z.boolean().default(true),
  isPaid: z.boolean().default(false),
  linkedDreamId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  date: z.string().optional(),
});

const updateExpenseSchema = z.object({
  id: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  amount: z.number().min(0).optional(),
  type: z.enum(['FIXED', 'ADDITIONAL_SPENDING']).optional(),
  isRecurring: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  linkedDreamId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  date: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = result.data;

    const expense = await db.expense.create({
      data: {
        financialMonthId: data.financialMonthId,
        description: data.description,
        category: data.category,
        amount: data.amount,
        type: data.type,
        isRecurring: data.isRecurring,
        isPaid: data.isPaid,
        linkedDreamId: data.linkedDreamId || null,
        notes: data.notes || null,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('Create expense error:', error);
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
    const result = updateExpenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = result.data;

    const updated = await db.expense.update({
      where: { id: data.id },
      data: {
        description: data.description,
        category: data.category,
        amount: data.amount,
        type: data.type,
        isRecurring: data.isRecurring,
        isPaid: data.isPaid,
        linkedDreamId: data.linkedDreamId,
        notes: data.notes,
        date: data.date ? new Date(data.date) : undefined,
      },
    });

    return NextResponse.json({ expense: updated });
  } catch (error) {
    console.error('Update expense error:', error);
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

    await db.expense.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
