import { db } from '@/lib/db';

export interface AchievementDefinition {
  code: string;
  title: string;
  description: string;
  category: 'QUEST' | 'TRIUMPH' | 'SAVINGS' | 'LEGEND';
  icon: string; // Lucide icon name or emoji
  maxProgress: number;
}

export const ACHIEVEMENTS_LIST: AchievementDefinition[] = [
  {
    code: 'FIRST_DREAM',
    title: 'Grimoire Inscription',
    description: 'Inscribe your first dream quest into the Grimoire.',
    category: 'QUEST',
    icon: 'Sparkles',
    maxProgress: 1,
  },
  {
    code: 'FIRST_ACQUISITION',
    title: 'First Blood: Reality Claimed',
    description: 'Acquire and record your first completed dream purchase in the Hall of Fame.',
    category: 'TRIUMPH',
    icon: 'Trophy',
    maxProgress: 1,
  },
  {
    code: 'BIG_DREAM_COMPLETE',
    title: 'Colossus Conquered',
    description: 'Fully fund and acquire a major flagship Big Dream.',
    category: 'TRIUMPH',
    icon: 'Flame',
    maxProgress: 1,
  },
  {
    code: 'COLLECTOR',
    title: 'Master of Treasures',
    description: 'Acquire 10 dream milestones across your questing journey.',
    category: 'LEGEND',
    icon: 'Layers',
    maxProgress: 10,
  },
  {
    code: 'S_TIER_COMPLETE',
    title: 'Crown of Asta: S-Tier Master',
    description: 'Target, fund, and conquer an ultimate S-Tier dream milestone.',
    category: 'LEGEND',
    icon: 'Crown',
    maxProgress: 1,
  },
  {
    code: 'SAVER',
    title: 'Iron Discipline Cushion',
    description: 'Accumulate a dedicated savings buffer of at least 50,000 (or $1,000 equivalent).',
    category: 'SAVINGS',
    icon: 'Shield',
    maxProgress: 50000,
  },
];

export interface EvaluatedAchievement {
  code: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
}

/**
 * Evaluates all user achievements against the database
 */
export async function evaluateAchievements(): Promise<{
  achievements: EvaluatedAchievement[];
  newlyUnlocked: EvaluatedAchievement[];
}> {
  const [dreams, financialMonths, existingDbAchievements] = await Promise.all([
    db.dreamPurchase.findMany(),
    db.financialMonth.findMany({
      include: {
        allocations: true,
        incomes: true,
        expenses: true,
      },
    }),
    db.achievement.findMany(),
  ]);

  const dbMap = new Map(existingDbAchievements.map((a) => [a.code, a]));

  const totalDreamsCount = dreams.length;
  const purchasedDreams = dreams.filter((d) => d.status === 'PURCHASED');
  const purchasedCount = purchasedDreams.length;
  const purchasedBigDreams = purchasedDreams.filter((d) => d.type === 'BIG_DREAM');
  const purchasedSTier = purchasedDreams.filter((d) => d.priority === 'S_TIER');

  // Total savings across all dreams + financial allocations
  const totalDreamSavings = dreams.reduce((acc, d) => acc + (d.amountSaved || 0), 0);
  const totalAllocations = financialMonths.reduce(
    (acc, m) => acc + m.allocations.reduce((sum, a) => sum + (a.amount || 0), 0),
    0
  );
  const totalAccumulatedSavings = Math.max(totalDreamSavings, totalAllocations);

  const evaluated: EvaluatedAchievement[] = [];
  const newlyUnlocked: EvaluatedAchievement[] = [];

  for (const def of ACHIEVEMENTS_LIST) {
    let progress = 0;
    let isUnlocked = false;

    switch (def.code) {
      case 'FIRST_DREAM':
        progress = totalDreamsCount >= 1 ? 1 : 0;
        isUnlocked = totalDreamsCount >= 1;
        break;

      case 'FIRST_ACQUISITION':
        progress = purchasedCount >= 1 ? 1 : 0;
        isUnlocked = purchasedCount >= 1;
        break;

      case 'BIG_DREAM_COMPLETE':
        progress = purchasedBigDreams.length >= 1 ? 1 : 0;
        isUnlocked = purchasedBigDreams.length >= 1;
        break;

      case 'COLLECTOR':
        progress = Math.min(def.maxProgress, purchasedCount);
        isUnlocked = purchasedCount >= 10;
        break;

      case 'S_TIER_COMPLETE':
        progress = purchasedSTier.length >= 1 ? 1 : 0;
        isUnlocked = purchasedSTier.length >= 1;
        break;

      case 'SAVER':
        progress = Math.min(def.maxProgress, totalAccumulatedSavings);
        isUnlocked = totalAccumulatedSavings >= 50000;
        break;
    }

    const existing = dbMap.get(def.code);
    const wasAlreadyUnlocked = Boolean(existing?.unlockedAt);
    let unlockedAt = existing?.unlockedAt ? existing.unlockedAt.toISOString() : null;

    if (isUnlocked && !wasAlreadyUnlocked) {
      const now = new Date();
      unlockedAt = now.toISOString();

      await db.achievement.upsert({
        where: { code: def.code },
        create: {
          code: def.code,
          title: def.title,
          description: def.description,
          category: def.category,
          icon: def.icon,
          unlockedAt: now,
          progress,
        },
        update: {
          unlockedAt: now,
          progress,
        },
      });

      newlyUnlocked.push({
        code: def.code,
        title: def.title,
        description: def.description,
        category: def.category,
        icon: def.icon,
        unlocked: true,
        unlockedAt,
        progress,
        maxProgress: def.maxProgress,
      });
    } else if (existing) {
      if (existing.progress !== progress) {
        await db.achievement.update({
          where: { code: def.code },
          data: { progress },
        });
      }
    } else {
      await db.achievement.create({
        data: {
          code: def.code,
          title: def.title,
          description: def.description,
          category: def.category,
          icon: def.icon,
          unlockedAt: isUnlocked ? new Date() : null,
          progress,
        },
      });
    }

    evaluated.push({
      code: def.code,
      title: def.title,
      description: def.description,
      category: def.category,
      icon: def.icon,
      unlocked: isUnlocked || wasAlreadyUnlocked,
      unlockedAt,
      progress,
      maxProgress: def.maxProgress,
    });
  }

  return {
    achievements: evaluated,
    newlyUnlocked,
  };
}
