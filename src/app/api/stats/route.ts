import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dreams = await db.dreamPurchase.findMany({
      orderBy: [{ isCurrentQuest: 'desc' }, { dateAdded: 'desc' }],
    });

    const totalDreams = dreams.length;
    let bigDreamsCount = 0;
    let smallDreamsCount = 0;
    let purchasedCount = 0;
    let totalDreamValue = 0;
    let purchasedValue = 0;

    let currentQuest = dreams.find((d) => d.isCurrentQuest && d.status !== 'PURCHASED') || null;

    // If no explicit pinned quest, pick the highest priority non-purchased dream
    if (!currentQuest) {
      currentQuest = dreams.find((d) => d.status !== 'PURCHASED' && d.priority === 'S_TIER') ||
        dreams.find((d) => d.status !== 'PURCHASED') ||
        null;
    }

    for (const d of dreams) {
      const price = d.finalPrice || d.listedPrice || 0;
      totalDreamValue += price;

      if (d.type === 'BIG_DREAM') {
        bigDreamsCount++;
      } else {
        smallDreamsCount++;
      }

      if (d.status === 'PURCHASED') {
        purchasedCount++;
        purchasedValue += price;
      }
    }

    const remainingValue = Math.max(0, totalDreamValue - purchasedValue);

    return NextResponse.json({
      stats: {
        totalDreams,
        bigDreamsCount,
        smallDreamsCount,
        purchasedCount,
        totalDreamValue,
        purchasedValue,
        remainingValue,
        currentQuest,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
