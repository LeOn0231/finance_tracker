import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const updateDreamSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  variant: z.string().optional().nullable(),
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
  monthlyContribution: z.number().min(0).optional(),
  targetDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  specs: z.string().optional().nullable(),
  isCurrentQuest: z.boolean().optional(),
  datePurchased: z.string().datetime().optional().nullable(),
  
  // Phase 4 fields
  priceConfidence: z.enum(['VERIFIED', 'ESTIMATED', 'NEEDS_CONFIRMATION']).optional(),
  priceBreakdown: z.union([z.string(), z.record(z.unknown())]).optional().nullable(),
  locationState: z.string().optional().nullable(),
  locationCity: z.string().optional().nullable(),
  isManualOverride: z.boolean().optional(),
  availability: z.string().optional(),
  researchMetadata: z.union([z.string(), z.record(z.unknown())]).optional().nullable(),
  checkedAt: z.string().datetime().optional().nullable(),
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
        savingsAllocations: true,
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
    const existingDream = await db.dreamPurchase.findUnique({ where: { id } });
    if (!existingDream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    // If marked as current quest, unset others
    if (data.isCurrentQuest) {
      await db.dreamPurchase.updateMany({
        where: { id: { not: id }, isCurrentQuest: true },
        data: { isCurrentQuest: false },
      });
    }

    const breakdownStr = typeof data.priceBreakdown === 'object' && data.priceBreakdown !== null
      ? JSON.stringify(data.priceBreakdown)
      : data.priceBreakdown !== undefined ? data.priceBreakdown : undefined;

    const metadataStr = typeof data.researchMetadata === 'object' && data.researchMetadata !== null
      ? JSON.stringify(data.researchMetadata)
      : data.researchMetadata !== undefined ? data.researchMetadata : undefined;

    // Check if price changed manually
    const priceChanged = data.finalPrice !== undefined && data.finalPrice !== existingDream.finalPrice;
    const isManual = data.isManualOverride !== undefined ? data.isManualOverride : (priceChanged ? true : existingDream.isManualOverride);

    // If price changed, save a history snapshot of the previous price
    if (priceChanged && existingDream.finalPrice > 0) {
      await db.priceHistory.create({
        data: {
          dreamId: id,
          price: existingDream.finalPrice,
          currency: existingDream.currency,
          source: existingDream.sourceName || 'Manual Edit Snapshot',
          priceType: existingDream.priceBreakdown ? 'ON_ROAD' : 'FINAL',
          confidence: existingDream.priceConfidence,
          breakdown: existingDream.priceBreakdown,
          notes: 'Snapshot prior to manual price update',
        },
      });
    }

    const updatedDream = await db.dreamPurchase.update({
      where: { id },
      data: {
        ...data,
        priceBreakdown: breakdownStr,
        researchMetadata: metadataStr,
        isManualOverride: isManual,
        targetDate: data.targetDate ? new Date(data.targetDate) : data.targetDate === null ? null : undefined,
        datePurchased: data.datePurchased ? new Date(data.datePurchased) : data.datePurchased === null ? null : undefined,
        checkedAt: data.checkedAt ? new Date(data.checkedAt) : undefined,
      },
      include: {
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
        },
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
