import { FinancialMonthCalculations } from './types';

/**
 * Currency precision helper: rounds to 2 decimal places to avoid IEEE-754 floating point issues.
 */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a currency amount with symbol and locale separators.
 * Supports INR (₹), USD ($), EUR (€), GBP (£), JPY (¥).
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const rounded = roundMoney(amount);
  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'JPY' ? '¥' : '$';
  
  // Format with commas
  const parts = Math.abs(rounded).toLocaleString('en-US', {
    minimumFractionDigits: rounded % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  });

  if (rounded < 0) {
    return `-${symbol}${parts}`;
  }
  return `${symbol}${parts}`;
}

/**
 * Computes all derived financial values for a month according to the strict Life Quest formula:
 * 
 * Total Income
 * − Fixed Expenses
 * − Savings
 * − Actual Additional Spending
 * ============================
 * Available Money
 * 
 * And:
 * Available Money − Safety Buffer = Safe To Spend
 */
export function computeFinancialMonth(
  incomes: { amount: number }[],
  expenses: { amount: number; type: string }[],
  savingsTarget: number,
  safetyBuffer: number,
  dreamBudget: number = 0,
  transactions: { amount: number }[] = []
): FinancialMonthCalculations {
  // 1. Total Income
  const totalIncome = roundMoney(
    incomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  );

  // 2. Fixed Expenses
  const fixedExpenses = roundMoney(
    expenses
      .filter((e) => e.type === 'FIXED')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  );

  // 3. Savings Target
  const savings = roundMoney(Number(savingsTarget) || 0);

  // 4. Actual Additional Discretionary Spending
  const actualSpending = roundMoney(
    expenses
      .filter((e) => e.type === 'ADDITIONAL_SPENDING')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  );

  // 5. Dream Transactions Spending
  const dreamSpending = roundMoney(
    transactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  );

  // 6. Available Money = Total Income - Fixed Expenses - Savings - Actual Spending
  const availableMoney = roundMoney(totalIncome - fixedExpenses - savings - actualSpending);

  // 7. Safety Buffer
  const buffer = roundMoney(Number(safetyBuffer) || 0);

  // 8. Safe to Spend = Available Money - Safety Buffer
  const safeToSpend = roundMoney(availableMoney - buffer);

  // 9. Savings Rate = (Savings / Total Income) * 100
  const savingsRate = totalIncome > 0 ? roundMoney((savings / totalIncome) * 100) : 0;

  // 10. Dream Budget metrics
  const budget = roundMoney(Number(dreamBudget) || 0);
  const dreamBudgetUsed = dreamSpending;
  const dreamBudgetRemaining = Math.max(0, roundMoney(budget - dreamBudgetUsed));

  const isDeficit = availableMoney < 0 || safeToSpend < 0;

  return {
    totalIncome,
    fixedExpenses,
    savingsTarget: savings,
    savingsAllocated: 0, // set by caller if allocations passed
    actualSpending,
    dreamSpending,
    availableMoney,
    safetyBuffer: buffer,
    safeToSpend,
    savingsRate,
    dreamBudget: budget,
    dreamBudgetUsed,
    dreamBudgetRemaining,
    isDeficit,
  };
}

/**
 * Evaluates whether a dream purchase is affordable within current Safe-To-Spend limits.
 */
export interface AffordabilityAssessment {
  isAffordable: boolean;
  itemPrice: number;
  currentSafeToSpend: number;
  remainingAfterPurchase: number;
  shortfall: number;
  statusText: 'AFFORDABLE' | 'ABOVE CURRENT SAFE-TO-SPEND';
  badgeColor: string;
}

export function evaluateAffordability(
  itemPrice: number,
  safeToSpend: number
): AffordabilityAssessment {
  const price = roundMoney(itemPrice);
  const safe = roundMoney(safeToSpend);
  const isAffordable = price <= safe && safe > 0;
  const remaining = roundMoney(safe - price);
  const shortfall = !isAffordable ? roundMoney(price - safe) : 0;

  return {
    isAffordable,
    itemPrice: price,
    currentSafeToSpend: safe,
    remainingAfterPurchase: remaining,
    shortfall,
    statusText: isAffordable ? 'AFFORDABLE' : 'ABOVE CURRENT SAFE-TO-SPEND',
    badgeColor: isAffordable
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-emerald'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
