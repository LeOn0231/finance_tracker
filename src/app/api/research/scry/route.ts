import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { researchService } from '@/lib/research/research-service';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { query, url, locationState, locationCity, customAccessories } = body;

    const result = await researchService.research({
      query: typeof query === 'string' ? query.trim() : undefined,
      url: typeof url === 'string' ? url.trim() : undefined,
      locationState: typeof locationState === 'string' ? locationState.trim() : undefined,
      locationCity: typeof locationCity === 'string' ? locationCity.trim() : undefined,
      customAccessories: typeof customAccessories === 'number' ? customAccessories : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Product research scry error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete research scrying' },
      { status: 500 }
    );
  }
}
