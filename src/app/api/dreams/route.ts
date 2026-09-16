import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

const createDreamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  variant: z.string().optional().nullable(),
  category: z.string().default('General'),
  type: z.enum(['BIG_DREAM', 'SMALL_DREAM']).default('BIG_DREAM'),
  image: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  sourceName: z.string().optional().nullable(),
  listedPrice: z.number().min(0).default(0),
  finalPrice: z.number().min(0).default(0),
  currency: z.string().default('INR'),
  priority: z.enum(['S_TIER', 'A_TIER', 'B_TIER', 'C_TIER', 'D_TIER']).default('A_TIER'),
  status: z.enum(['DREAMING', 'PLANNING', 'SAVING', 'READY_TO_BUY', 'PURCHASED', 'ARCHIVED']).default('DREAMING'),
  amountSaved: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  specs: z.string().optional().nullable(),
  isCurrentQuest: z.boolean().default(false),
  
  // Universal Final Price Engine additions
  verifiedSource: z.string().optional().nullable(),
  sourceType: z.string().optional().nullable(),
  lastChecked: z.string().datetime().optional().nullable(),
  shippingCost: z.number().min(0).default(0),
  mandatoryFees: z.number().min(0).default(0),
  finalCheckoutPrice: z.number().min(0).default(0),
  manualOverride: z.boolean().default(false),
  previousPrice: z.number().optional().nullable(),
  officialUrl: z.string().optional().nullable(),
  marketplaceUrl: z.string().optional().nullable(),

  // Price Engine fields
  priceConfidence: z.enum(['VERIFIED', 'ESTIMATED', 'NEEDS_CONFIRMATION']).default('VERIFIED'),
  priceBreakdown: z.union([z.string(), z.record(z.unknown())]).optional().nullable(),
  locationState: z.string().optional().nullable(),
  locationCity: z.string().optional().nullable(),
  isManualOverride: z.boolean().default(false),
  availability: z.string().default('IN_STOCK'),
  researchMetadata: z.union([z.string(), z.record(z.unknown())]).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.trim();
    const sortBy = searchParams.get('sortBy') || 'recent';

    const where: Prisma.DreamPurchaseWhereInput = {};

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (status && status !== 'ALL') {
      if (status === 'NOT_PURCHASED') {
        where.status = { not: 'PURCHASED' };
      } else {
        where.status = status;
      }
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { category: { contains: search } },
        { notes: { contains: search } },
        { model: { contains: search } },
        { variant: { contains: search } },
      ];
    }

    // Sorting logic
    let orderBy: Prisma.DreamPurchaseOrderByWithRelationInput[] = [{ isCurrentQuest: 'desc' }, { dateAdded: 'desc' }];
    if (sortBy === 'oldest') {
      orderBy = [{ dateAdded: 'asc' }];
    } else if (sortBy === 'price_desc') {
      orderBy = [{ finalPrice: 'desc' }];
    } else if (sortBy === 'price_asc') {
      orderBy = [{ finalPrice: 'asc' }];
    } else if (sortBy === 'purchased_recent') {
      orderBy = [{ datePurchased: 'desc' }];
    }

    const dreams = await db.dreamPurchase.findMany({
      where,
      orderBy,
      include: {
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
      },
    });

    return NextResponse.json({ dreams });
  } catch (error) {
    console.error('Fetch dreams error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = createDreamSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = result.data;
    const breakdownStr = typeof data.priceBreakdown === 'object' && data.priceBreakdown !== null
      ? JSON.stringify(data.priceBreakdown)
      : data.priceBreakdown || null;
      
    const metadataStr = typeof data.researchMetadata === 'object' && data.researchMetadata !== null
      ? JSON.stringify(data.researchMetadata)
      : data.researchMetadata || null;

    // If marked as current quest, unset any other current quest
    if (data.isCurrentQuest) {
      await db.dreamPurchase.updateMany({
        where: { isCurrentQuest: true },
        data: { isCurrentQuest: false },
      });
    }

    const finalPriceVal = data.finalPrice || data.listedPrice || 0;
    const finalCheckoutVal = data.finalCheckoutPrice || finalPriceVal;

    const newDream = await db.dreamPurchase.create({
      data: {
        name: data.name,
        brand: data.brand || null,
        model: data.model || null,
        variant: data.variant || null,
        category: data.category,
        type: data.type,
        image: data.image || null,
        sourceUrl: data.sourceUrl || null,
        sourceName: data.sourceName || null,
        listedPrice: data.listedPrice || finalPriceVal,
        finalPrice: finalPriceVal,
        finalCheckoutPrice: finalCheckoutVal,
        shippingCost: data.shippingCost || 0,
        mandatoryFees: data.mandatoryFees || 0,
        verifiedSource: data.verifiedSource || data.sourceName || null,
        sourceType: data.sourceType || 'OFFICIAL',
        manualOverride: Boolean(data.manualOverride || data.isManualOverride),
        previousPrice: data.previousPrice || null,
        officialUrl: data.officialUrl || null,
        marketplaceUrl: data.marketplaceUrl || null,
        currency: data.currency,
        priority: data.priority,
        status: data.status,
        amountSaved: data.amountSaved,
        notes: data.notes || null,
        specs: data.specs || null,
        isCurrentQuest: data.isCurrentQuest,
        
        priceConfidence: data.priceConfidence,
        priceBreakdown: breakdownStr,
        locationState: data.locationState || null,
        locationCity: data.locationCity || null,
        isManualOverride: Boolean(data.manualOverride || data.isManualOverride),
        availability: data.availability,
        researchMetadata: metadataStr,
        lastChecked: data.lastChecked ? new Date(data.lastChecked) : new Date(),
        checkedAt: new Date(),
      },
    });

    // Automatically record initial price history point
    if (newDream.finalPrice > 0) {
      await db.priceHistory.create({
        data: {
          dreamId: newDream.id,
          price: newDream.finalPrice,
          currency: newDream.currency,
          source: newDream.verifiedSource || newDream.sourceName || 'Initial Grimoire Inscription',
          priceType: newDream.priceBreakdown ? 'ON_ROAD' : 'FINAL',
          confidence: newDream.priceConfidence,
          breakdown: newDream.priceBreakdown,
          notes: 'Initial recorded target price',
        },
      });
    }

    const populated = await db.dreamPurchase.findUnique({
      where: { id: newDream.id },
      include: {
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ dream: populated }, { status: 201 });
  } catch (error) {
    console.error('Create dream error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
