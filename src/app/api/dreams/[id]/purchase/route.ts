import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const purchaseActionSchema = z.object({
  action: z.enum(['PURCHASE', 'CANCEL_PURCHASE']).default('PURCHASE'),
  finalPrice: z.number().min(0).optional(),
  purchaseDate: z.string().optional(),
  notes: z.string().optional(),
  recordInSpending: z.boolean().default(true),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dream = await db.dreamPurchase.findUnique({ where: { id } });

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const result = purchaseActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    const { action, finalPrice, purchaseDate, notes, recordInSpending } = result.data;

    if (action === 'PURCHASE') {
      const actualPaid = finalPrice !== undefined ? finalPrice : dream.finalPrice;
      const boughtDate = purchaseDate ? new Date(purchaseDate) : new Date();

      const month = boughtDate.getMonth() + 1;
      const year = boughtDate.getFullYear();

      // Find or create current financial month
      let financialMonth = await db.financialMonth.findUnique({
        where: { month_year: { month, year } },
      });

      if (!financialMonth) {
        financialMonth = await db.financialMonth.create({
          data: {
            month,
            year,
            savingsTarget: 1500,
            safetyBuffer: 800,
            dreamBudget: 500,
            currency: 'INR',
          },
        });
      }

      const updatedDream = await db.dreamPurchase.update({
        where: { id },
        data: {
          status: 'PURCHASED',
          finalPrice: actualPaid,
          amountSaved: actualPaid,
          datePurchased: boughtDate,
          isCurrentQuest: false,
          notes: notes ? `${dream.notes ? `${dream.notes}\n` : ''}[Purchased]: ${notes}` : dream.notes,
        },
      });

      // Record in purchase transaction log
      const transaction = await db.purchaseTransaction.create({
        data: {
          date: boughtDate,
          description: `Acquired: ${dream.name}`,
          category: dream.category,
          amount: actualPaid,
          linkedDreamId: id,
          financialMonthId: financialMonth.id,
          notes: notes || 'Quest completed and verified.',
        },
      });

      // If requested, record in monthly spending ledger
      if (recordInSpending) {
        await db.expense.create({
          data: {
            financialMonthId: financialMonth.id,
            description: `[Dream Acquisition] ${dream.name}`,
            category: dream.category,
            amount: actualPaid,
            type: 'ADDITIONAL_SPENDING',
            isRecurring: false,
            isPaid: true,
            linkedDreamId: id,
            notes: notes || 'Dream purchase deducted from safe-to-spend.',
            date: boughtDate,
          },
        });
      }

      return NextResponse.json({
        success: true,
        dream: updatedDream,
        transaction,
        message: 'Quest Completed! Dream Acquired!',
      });
    } else {
      // Revert purchase
      const updatedDream = await db.dreamPurchase.update({
        where: { id },
        data: {
          status: 'SAVING',
          datePurchased: null,
        },
      });

      // Remove linked transactions and spending records
      await db.purchaseTransaction.deleteMany({
        where: { linkedDreamId: id },
      });

      await db.expense.deleteMany({
        where: { linkedDreamId: id, type: 'ADDITIONAL_SPENDING' },
      });

      return NextResponse.json({
        success: true,
        dream: updatedDream,
        message: 'Purchase status reverted.',
      });
    }
  } catch (error) {
    console.error('Purchase action error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
