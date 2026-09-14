import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { INITIAL_SAMPLE_DREAMS } from '../src/lib/sample-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Life Quest database seeding...');

  // 1. Seed or update Single Admin Account
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@lifequest.local';
  const password = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMeQuest2025!';

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
    });
    console.log(`✅ Admin user created: ${admin.username} (${admin.email})`);
  } else {
    console.log(`ℹ️ Admin user already exists: ${existingAdmin.username}`);
  }

  // 2. Seed Sample Dream Purchases
  const existingDreamsCount = await prisma.dreamPurchase.count();
  if (existingDreamsCount === 0) {
    console.log('✨ Seeding initial dream purchases & starter quests...');
    for (const dream of INITIAL_SAMPLE_DREAMS) {
      await prisma.dreamPurchase.create({
        data: {
          name: dream.name,
          brand: dream.brand,
          category: dream.category,
          type: dream.type,
          image: dream.image,
          sourceUrl: dream.sourceUrl,
          sourceName: dream.sourceName,
          listedPrice: dream.listedPrice,
          finalPrice: dream.finalPrice,
          currency: dream.currency,
          priority: dream.priority,
          status: dream.status,
          amountSaved: dream.amountSaved,
          notes: dream.notes,
          specs: dream.specs,
          isCurrentQuest: dream.isCurrentQuest,
          datePurchased: dream.datePurchased ? new Date(dream.datePurchased) : null,
        },
      });
    }
    console.log(`✅ Created ${INITIAL_SAMPLE_DREAMS.length} starter dream purchases.`);
  } else {
    console.log(`ℹ️ Found ${existingDreamsCount} existing dream purchases, skipping dream seed.`);
  }

  // 3. Seed Current Financial Month baseline
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const existingMonth = await prisma.financialMonth.findUnique({
    where: {
      month_year: {
        month: currentMonth,
        year: currentYear,
      },
    },
  });

  if (!existingMonth) {
    await prisma.financialMonth.create({
      data: {
        month: currentMonth,
        year: currentYear,
        income: 5000,
        savingsTarget: 1500,
        safetyBuffer: 800,
        notes: 'Monthly financial baseline configured for Quest progression.',
      },
    });
    console.log(`✅ Seeded financial month: ${currentMonth}/${currentYear}`);
  }

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
