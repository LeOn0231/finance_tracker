import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

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

    const newPinnedState = !dream.isCurrentQuest;

    if (newPinnedState) {
      // Unset any previous current quest
      await db.dreamPurchase.updateMany({
        where: { isCurrentQuest: true },
        data: { isCurrentQuest: false },
      });
    }

    const updated = await db.dreamPurchase.update({
      where: { id },
      data: { isCurrentQuest: newPinnedState },
    });

    return NextResponse.json({
      success: true,
      isCurrentQuest: updated.isCurrentQuest,
      message: newPinnedState
        ? `"${dream.name}" is now your active Main Quest!`
        : `Active quest unpinned.`,
    });
  } catch (error) {
    console.error('Pin dream error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
