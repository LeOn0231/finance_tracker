import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { researchService } from '@/lib/research/research-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dream = await db.dreamPurchase.findUnique({
      where: { id },
      include: {
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
    }

    const previousPrice = dream.finalPrice;

    // Run research service on the dream's url or name
    const researchResult = await researchService.research({
      query: dream.name,
      url: dream.sourceUrl || undefined,
      locationState: dream.locationState || undefined,
      locationCity: dream.locationCity || undefined,
    });

    if (!researchResult.success || !researchResult.product) {
      return NextResponse.json(
        {
          error: researchResult.error || 'Unable to verify current market price at this time.',
          dream,
        },
        { status: 422 }
      );
    }

    const product = researchResult.product;
    const newFinalPrice = product.finalPrice;
    const diff = newFinalPrice - previousPrice;

    // 1. Record historical price entry
    await db.priceHistory.create({
      data: {
        dreamId: dream.id,
        price: previousPrice,
        currency: dream.currency,
        source: dream.sourceName || 'Previous Log',
        priceType: 'FINAL',
        confidence: dream.priceConfidence,
        breakdown: dream.priceBreakdown,
        notes: `Recorded prior to market price refresh (${diff >= 0 ? '+' : ''}${diff.toLocaleString()})`,
      },
    });

    // 2. Update the dream record
    const updatedDream = await db.dreamPurchase.update({
      where: { id: dream.id },
      data: {
        listedPrice: product.listedPrice,
        finalPrice: newFinalPrice,
        priceConfidence: product.priceConfidence,
        priceBreakdown: product.priceBreakdown ? JSON.stringify(product.priceBreakdown) : dream.priceBreakdown,
        locationState: product.locationState || dream.locationState,
        locationCity: product.locationCity || dream.locationCity,
        checkedAt: new Date(),
        isManualOverride: false,
        specs: product.specs || dream.specs,
        image: dream.image || product.image,
      },
      include: {
        priceHistory: {
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      dream: updatedDream,
      previousPrice,
      currentPrice: newFinalPrice,
      diff,
      priceConfidence: product.priceConfidence,
      checkedAt: updatedDream.checkedAt,
    });
  } catch (error) {
    console.error('Refresh price error:', error);
    return NextResponse.json({ error: 'Failed to refresh price' }, { status: 500 });
  }
}
