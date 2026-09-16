import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { INITIAL_SAMPLE_DREAMS } from '../src/lib/sample-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Life Quest database seeding with Phase 3 Finance models...');

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
          monthlyContribution: dream.type === 'BIG_DREAM' ? 250 : 0,
          datePurchased: dream.datePurchased ? new Date(dream.datePurchased) : null,
        },
      });
    }
    console.log(`✅ Created ${INITIAL_SAMPLE_DREAMS.length} starter dream purchases.`);
  }

  // 3. Seed Current & Historical Financial Months (July 2026, August 2026, September 2026)
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Find sample bike dream for savings allocation
  const meteorDream = await prisma.dreamPurchase.findFirst({
    where: { name: { contains: 'Meteor' } },
  });

  // Helper to seed a financial month
  async function seedMonth(
    m: number,
    y: number,
    incomesData: { source: string; desc: string; amount: number }[],
    fixedExpensesData: { desc: string; category: string; amount: number }[],
    savingsTarget: number,
    safetyBuffer: number,
    dreamBudget: number,
    actualSpendData: { desc: string; category: string; amount: number; date: Date }[],
    notes: string
  ) {
    let monthRecord = await prisma.financialMonth.findUnique({
      where: {
        month_year: {
          month: m,
          year: y,
        },
      },
    });

    if (!monthRecord) {
      monthRecord = await prisma.financialMonth.create({
        data: {
          month: m,
          year: y,
          savingsTarget,
          safetyBuffer,
          dreamBudget,
          currency: 'INR',
          notes,
        },
      });

      // Incomes
      for (const inc of incomesData) {
        await prisma.incomeEntry.create({
          data: {
            financialMonthId: monthRecord.id,
            source: inc.source,
            description: inc.desc,
            amount: inc.amount,
            date: new Date(y, m - 1, 1),
          },
        });
      }

      // Fixed Expenses
      for (const exp of fixedExpensesData) {
        await prisma.expense.create({
          data: {
            financialMonthId: monthRecord.id,
            type: 'FIXED',
            description: exp.desc,
            category: exp.category,
            amount: exp.amount,
            isRecurring: true,
            isPaid: true,
            date: new Date(y, m - 1, 5),
          },
        });
      }

      // Actual Additional Spending
      for (const sp of actualSpendData) {
        await prisma.expense.create({
          data: {
            financialMonthId: monthRecord.id,
            type: 'ADDITIONAL_SPENDING',
            description: sp.desc,
            category: sp.category,
            amount: sp.amount,
            isRecurring: false,
            isPaid: true,
            date: sp.date,
          },
        });
      }

      // Savings Allocations
      if (meteorDream) {
        await prisma.savingsAllocation.create({
          data: {
            financialMonthId: monthRecord.id,
            title: 'Royal Enfield Meteor Fund',
            amount: Math.round(savingsTarget * 0.6),
            linkedDreamId: meteorDream.id,
            notes: 'Allocated toward S-Tier Highway Cruiser.',
          },
        });
      }
      await prisma.savingsAllocation.create({
        data: {
          financialMonthId: monthRecord.id,
          title: 'General Emergency Cushion',
          amount: Math.round(savingsTarget * 0.4),
          notes: 'High-yield rainy day reserve.',
        },
      });

      console.log(`✅ Seeded full financial ledger for ${m}/${y}`);
    }
  }

  // Seed current month (INR Ledgers)
  await seedMonth(
    currentMonth,
    currentYear,
    [
      { source: 'Salary', desc: 'Primary Tech Engineering Salary', amount: 120000 },
      { source: 'Freelance', desc: 'Anime UI Client Project', amount: 35000 },
    ],
    [
      { desc: 'Apartment Rent / EMI', category: 'Rent/EMI', amount: 35000 },
      { desc: 'Food & Groceries', category: 'Food', amount: 15000 },
      { desc: 'High-speed Fiber Internet & 5G', category: 'Internet', amount: 1500 },
      { desc: 'Electricity & Utilities', category: 'Electricity', amount: 3500 },
      { desc: 'Health & Term Insurance', category: 'Insurance', amount: 5000 },
      { desc: 'Streaming & Software Subscriptions', category: 'Subscriptions', amount: 2000 },
    ],
    45000, // Savings target (₹45,000)
    15000, // Safety buffer (₹15,000)
    12000, // Monthly Dream purchase budget (₹12,000)
    [
      { desc: 'Weekend Izakaya Dining', category: 'Dining', amount: 3200, date: new Date(currentYear, currentMonth - 1, 4) },
      { desc: 'Mechanical Keyboard Switches & Lube', category: 'Tech & Hobbies', amount: 2400, date: new Date(currentYear, currentMonth - 1, 8) },
      { desc: 'Artbook Import from Tokyo', category: 'Manga & Books', amount: 3500, date: new Date(currentYear, currentMonth - 1, 12) },
    ],
    'September Quest: Maintain high savings rate for Super Meteor 650 while allowing small dream rewards.'
  );

  // Seed previous month (August 2026) for trend charts
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  await seedMonth(
    prevMonth,
    prevYear,
    [
      { source: 'Salary', desc: 'Primary Tech Engineering Salary', amount: 120000 },
      { source: 'Freelance', desc: 'Design Consulting', amount: 25000 },
    ],
    [
      { desc: 'Apartment Rent / EMI', category: 'Rent/EMI', amount: 35000 },
      { desc: 'Food & Groceries', category: 'Food', amount: 14500 },
      { desc: 'High-speed Fiber Internet & 5G', category: 'Internet', amount: 1500 },
      { desc: 'Electricity & Utilities', category: 'Electricity', amount: 3200 },
      { desc: 'Health & Term Insurance', category: 'Insurance', amount: 5000 },
      { desc: 'Streaming & Software Subscriptions', category: 'Subscriptions', amount: 2000 },
    ],
    40000,
    15000,
    10000,
    [
      { desc: 'Anime Expo Tickets & Merch', category: 'Events', amount: 5500, date: new Date(prevYear, prevMonth - 1, 14) },
      { desc: 'Specialty Coffee Beans', category: 'Food', amount: 1200, date: new Date(prevYear, prevMonth - 1, 20) },
    ],
    'August Quest: Solid discipline and achieved savings goals.'
  );

  console.log('🎉 Finance database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
