import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { evaluateAchievements } from '@/lib/achievements';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { achievements, newlyUnlocked } = await evaluateAchievements();

    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    const totalCount = achievements.length;
    const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

    return NextResponse.json({
      achievements,
      newlyUnlocked,
      stats: {
        unlockedCount,
        totalCount,
        completionPercentage,
      },
    });
  } catch (error) {
    console.error('Fetch achievements error:', error);
    return NextResponse.json({ error: 'Failed to retrieve achievements' }, { status: 500 });
  }
}
