import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const updateDreamSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().optional().nullable(),
  category: z.string().optional(),
  type: z.enum(['BIG_DREAM', 'SMALL_DREAM']).optional(),
  image: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  sourceName: z.string().optional().nullable(),
  listedPrice: z.number().min(0).optional(),
  finalPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  priority: z.enum(['S_TIER', 'A_TIER', 'B_TIER', 'C_TIER', 'D_TIER']).optional(),
  status: z.enum(['DREAMING', 'PLANNING', 'SAVING', 'READY_TO_BUY', 'PURCHASED', 'ARCHIVED']).optional(),
  amountSaved: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  specs: z.string().optional().nullable(),
  isCurrentQuest: z.boolean().optional(),
  datePurchased: z.string().datetime().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dream = await db.dreamPurchase.findUnique({
      where: { id },
      include: {
        transactions: true,
        priceHistory: { orderBy: { recordedAt: 'desc' } },
      },
    });

    if (!dream) {
      return NextResponse.json({ error: 'Dream purchase not found' }, { status: 404 });
    }

    return NextResponse.json({ dream });
  } catch (error) {
    console.error('Get dream error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = updateDreamSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = result.data;

    // If marked as current quest, unset others
    if (data.isCurrentQuest) {
      await db.dreamPurchase.updateMany({
        where: { id: { not: id }, isCurrentQuest: true },
        data: { isCurrentQuest: false },
      });
    }

    const updatedDream = await db.dreamPurchase.update({
      where: { id },
      data: {
        ...data,
        datePurchased: data.datePurchased ? new Date(data.datePurchased) : undefined,
      },
    });

    return NextResponse.json({ dream: updatedDream });
  } catch (error) {
    console.error('Update dream error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.dreamPurchase.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Quest removed from Grimoire' });
  } catch (error) {
    console.error('Delete dream error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
