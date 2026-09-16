import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    const [dreams, priceHistory, months, incomes, expenses, allocations, transactions, achievements] =
      await Promise.all([
        db.dreamPurchase.findMany({
          include: { priceHistory: true },
        }),
        db.priceHistory.findMany(),
        db.financialMonth.findMany(),
        db.incomeEntry.findMany(),
        db.expense.findMany(),
        db.savingsAllocation.findMany(),
        db.purchaseTransaction.findMany(),
        db.achievement.findMany(),
      ]);

    if (format === 'csv') {
      // Generate CSV for Dreams
      const headers = [
        'ID',
        'Name',
        'Brand',
        'Model',
        'Variant',
        'Category',
        'Type',
        'Priority',
        'Status',
        'Listed Price',
        'Final Price',
        'Shipping Cost',
        'Mandatory Fees',
        'Currency',
        'Amount Saved',
        'Verified Source',
        'Source Type',
        'Source Name',
        'Source URL',
        'Official URL',
        'Marketplace URL',
        'Confidence',
        'Manually Edited',
        'Location State',
        'Last Checked',
        'Date Added',
        'Date Purchased',
      ];

      const rows = dreams.map((d) => [
        `"${d.id}"`,
        `"${(d.name || '').replace(/"/g, '""')}"`,
        `"${(d.brand || '').replace(/"/g, '""')}"`,
        `"${(d.model || '').replace(/"/g, '""')}"`,
        `"${(d.variant || '').replace(/"/g, '""')}"`,
        `"${d.category}"`,
        `"${d.type}"`,
        `"${d.priority}"`,
        `"${d.status}"`,
        d.listedPrice,
        d.finalPrice,
        d.shippingCost,
        d.mandatoryFees,
        `"${d.currency}"`,
        d.amountSaved,
        `"${(d.verifiedSource || '').replace(/"/g, '""')}"`,
        `"${(d.sourceType || '').replace(/"/g, '""')}"`,
        `"${(d.sourceName || '').replace(/"/g, '""')}"`,
        `"${(d.sourceUrl || '').replace(/"/g, '""')}"`,
        `"${(d.officialUrl || '').replace(/"/g, '""')}"`,
        `"${(d.marketplaceUrl || '').replace(/"/g, '""')}"`,
        `"${d.priceConfidence}"`,
        d.manualOverride || d.isManualOverride ? 'YES' : 'NO',
        `"${(d.locationState || '').replace(/"/g, '""')}"`,
        `"${d.lastChecked ? d.lastChecked.toISOString() : ''}"`,
        `"${d.dateAdded.toISOString()}"`,
        `"${d.datePurchased ? d.datePurchased.toISOString() : ''}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="life-quest-dreams-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default: Complete JSON database backup
    const exportPayload = {
      app: 'Life Quest',
      version: '1.3.0',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalDreams: dreams.length,
        totalMonths: months.length,
        totalTransactions: transactions.length,
      },
      data: {
        dreams,
        priceHistory,
        financialMonths: months,
        incomeEntries: incomes,
        expenses,
        savingsAllocations: allocations,
        purchaseTransactions: transactions,
        achievements,
      },
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="life-quest-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Export data error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
