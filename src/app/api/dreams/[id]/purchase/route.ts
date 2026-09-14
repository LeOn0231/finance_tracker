import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const purchaseActionSchema = z.object({
  action: z.enum(['PURCHASE', 'CANCEL_PURCHASE']).default('PURCHASE'),
  finalPrice: z.number().min(0).optional(),
  purchaseDate: z.string().optional(),
  notes: z.string().optional(),
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

    const { action, finalPrice, purchaseDate, notes } = result.data;

    if (action === 'PURCHASE') {
      const actualPaid = finalPrice !== undefined ? finalPrice : dream.finalPrice;
      const boughtDate = purchaseDate ? new Date(purchaseDate) : new Date();

      const [updatedDream, transaction] = await db.$transaction([
        db.dreamPurchase.update({
          where: { id },
          data: {
            status: 'PURCHASED',
            finalPrice: actualPaid,
            amountSaved: actualPaid,
            datePurchased: boughtDate,
            isCurrentQuest: false,
            notes: notes ? `${dream.notes ? `${dream.notes}\n` : ''}[Purchased]: ${notes}` : dream.notes,
          },
        }),
        db.purchaseTransaction.create({
          data: {
            date: boughtDate,
            description: `Acquired: ${dream.name}`,
            category: dream.category,
            amount: actualPaid,
            linkedDreamId: id,
            notes: notes || 'Quest completed and verified.',
          },
        }),
      ]);

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

      // Remove any linked transaction
      await db.purchaseTransaction.deleteMany({
        where: { linkedDreamId: id },
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
