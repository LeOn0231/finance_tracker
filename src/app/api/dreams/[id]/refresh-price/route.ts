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

    // Run research service on the dream's url, brand/model, or name
    const researchResult = await researchService.research({
      query: dream.name,
      url: dream.sourceUrl || dream.officialUrl || dream.marketplaceUrl || undefined,
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
    const now = new Date();

    // 1. Record historical price entry
    await db.priceHistory.create({
      data: {
        dreamId: dream.id,
        price: previousPrice,
        currency: dream.currency,
        source: dream.verifiedSource || dream.sourceName || 'Previous Log',
        priceType: 'FINAL',
        confidence: dream.priceConfidence,
        breakdown: dream.priceBreakdown,
        notes: `Recorded prior to trusted price refresh (${diff >= 0 ? '+' : ''}${diff.toLocaleString()})`,
      },
    });

    // 2. Update the dream record with Universal Final Price Engine data
    const updatedDream = await db.dreamPurchase.update({
      where: { id: dream.id },
      data: {
        listedPrice: product.listedPrice,
        finalPrice: newFinalPrice,
        finalCheckoutPrice: product.finalCheckoutPrice || newFinalPrice,
        shippingCost: product.shippingCost || 0,
        mandatoryFees: product.mandatoryFees || 0,
        verifiedSource: product.verifiedSource || dream.verifiedSource,
        sourceType: product.sourceType || dream.sourceType || 'OFFICIAL',
        lastChecked: now,
        previousPrice: previousPrice,
        priceConfidence: product.priceConfidence,
        priceBreakdown: product.priceBreakdown ? JSON.stringify(product.priceBreakdown) : dream.priceBreakdown,
        locationState: product.locationState || dream.locationState,
        locationCity: product.locationCity || dream.locationCity,
        checkedAt: now,
        isManualOverride: false,
        manualOverride: false,
        specs: product.specs || dream.specs,
        image: dream.image || product.image,
        officialUrl: product.officialUrl || dream.officialUrl,
        marketplaceUrl: product.marketplaceUrl || dream.marketplaceUrl,
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
      verifiedSource: updatedDream.verifiedSource,
      lastChecked: updatedDream.lastChecked,
      checkedAt: updatedDream.checkedAt,
    });
  } catch (error) {
    console.error('Refresh price error:', error);
    return NextResponse.json({ error: 'Failed to refresh price' }, { status: 500 });
  }
}
