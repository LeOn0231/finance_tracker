import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const allocationSchema = z.object({
  financialMonthId: z.string().min(1),
  title: z.string().min(1, 'Title is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  linkedDreamId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = allocationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { financialMonthId, title, amount, linkedDreamId, notes } = result.data;

    // Create allocation
    const allocation = await db.savingsAllocation.create({
      data: {
        financialMonthId,
        title,
        amount,
        linkedDreamId: linkedDreamId || null,
        notes: notes || null,
      },
      include: { linkedDream: true },
    });

    // If linked to a dream, also update that dream's amountSaved
    if (linkedDreamId) {
      await db.dreamPurchase.update({
        where: { id: linkedDreamId },
        data: {
          amountSaved: {
            increment: amount,
          },
        },
      });
    }

    return NextResponse.json({ allocation }, { status: 201 });
  } catch (error) {
    console.error('Create savings allocation error:', error);
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

    const existing = await db.savingsAllocation.findUnique({ where: { id } });
    if (existing && existing.linkedDreamId) {
      // Revert amountSaved on the linked dream
      await db.dreamPurchase.update({
        where: { id: existing.linkedDreamId },
        data: {
          amountSaved: {
            decrement: existing.amount,
          },
        },
      }).catch(() => {});
    }

    await db.savingsAllocation.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Allocation deleted' });
  } catch (error) {
    console.error('Delete allocation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
