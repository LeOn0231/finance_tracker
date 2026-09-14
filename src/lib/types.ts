export type DreamType = 'BIG_DREAM' | 'SMALL_DREAM';

export type PriorityTier = 'S_TIER' | 'A_TIER' | 'B_TIER' | 'C_TIER' | 'D_TIER';

export type DreamStatus =
  | 'DREAMING'
  | 'PLANNING'
  | 'SAVING'
  | 'READY_TO_BUY'
  | 'PURCHASED'
  | 'ARCHIVED';

export interface PriorityInfo {
  code: PriorityTier;
  label: string;
  sublabel: string;
  color: string;
  badgeClass: string;
  glowClass: string;
  borderClass: string;
}

export const PRIORITY_TIERS: Record<PriorityTier, PriorityInfo> = {
  S_TIER: {
    code: 'S_TIER',
    label: 'S-Tier',
    sublabel: 'Ultimate Dream',
    color: '#fbbf24',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-glow-gold',
    glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    borderClass: 'border-amber-500/50',
  },
  A_TIER: {
    code: 'A_TIER',
    label: 'A-Tier',
    sublabel: 'Major Goal',
    color: '#c084fc',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-glow-violet',
    glowClass: 'shadow-[0_0_20px_rgba(168,85,247,0.35)]',
    borderClass: 'border-purple-500/50',
  },
  B_TIER: {
    code: 'B_TIER',
    label: 'B-Tier',
    sublabel: 'Important',
    color: '#34d399',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-glow-emerald',
    glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    borderClass: 'border-emerald-500/50',
  },
  C_TIER: {
    code: 'C_TIER',
    label: 'C-Tier',
    sublabel: 'Nice to Have',
    color: '#38bdf8',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-glow-cyan',
    glowClass: 'shadow-[0_0_20px_rgba(14,165,233,0.35)]',
    borderClass: 'border-sky-500/50',
  },
  D_TIER: {
    code: 'D_TIER',
    label: 'D-Tier',
    sublabel: 'Maybe Someday',
    color: '#94a3b8',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
    glowClass: 'shadow-none',
    borderClass: 'border-slate-500/30',
  },
};

export interface StatusInfo {
  code: DreamStatus;
  label: string;
  iconName: string;
  badgeClass: string;
  color: string;
}

export const DREAM_STATUSES: Record<DreamStatus, StatusInfo> = {
  DREAMING: {
    code: 'DREAMING',
    label: 'Dreaming',
    iconName: 'Sparkles',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    color: '#818cf8',
  },
  PLANNING: {
    code: 'PLANNING',
    label: 'Planning',
    iconName: 'Compass',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    color: '#60a5fa',
  },
  SAVING: {
    code: 'SAVING',
    label: 'Saving',
    iconName: 'Coins',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    color: '#fbbf24',
  },
  READY_TO_BUY: {
    code: 'READY_TO_BUY',
    label: 'Ready to Buy',
    iconName: 'Zap',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse',
    color: '#34d399',
  },
  PURCHASED: {
    code: 'PURCHASED',
    label: 'Purchased',
    iconName: 'CheckCircle2',
    badgeClass: 'bg-teal-500/20 text-teal-200 border-teal-400/40 shadow-glow-emerald',
    color: '#2dd4bf',
  },
  ARCHIVED: {
    code: 'ARCHIVED',
    label: 'Archived',
    iconName: 'Archive',
    badgeClass: 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30',
    color: '#71717a',
  },
};

export const DREAM_CATEGORIES = [
  'Vehicles',
  'Electronics & PC',
  'Audio & Tech',
  'Anime & Figures',
  'Manga & Books',
  'Gaming',
  'Fashion & Apparel',
  'Watches & Jewelry',
  'Cameras & Gear',
  'Home & Workspace',
  'Other',
] as const;

export type DreamCategory = typeof DREAM_CATEGORIES[number];

export const FIXED_EXPENSE_CATEGORIES = [
  'Rent/EMI',
  'Household',
  'Food & Groceries',
  'Electricity',
  'Internet',
  'Mobile',
  'Transportation',
  'Insurance',
  'Family',
  'Subscriptions',
  'Other',
] as const;

export const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Bonus',
  'Investment',
  'Other',
] as const;

export const SPENDING_CATEGORIES = [
  'Dining',
  'Groceries',
  'Shopping',
  'Tech & Hobbies',
  'Manga & Books',
  'Anime & Merch',
  'Entertainment',
  'Travel & Transport',
  'Personal Care',
  'Other',
] as const;

export interface DreamPurchaseItem {
  id: string;
  name: string;
  brand?: string | null;
  category: string;
  type: DreamType;
  image?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  listedPrice: number;
  finalPrice: number;
  currency: string;
  priority: PriorityTier;
  status: DreamStatus;
  amountSaved: number;
  monthlyContribution?: number;
  targetDate?: string | Date | null;
  notes?: string | null;
  specs?: string | null;
  isCurrentQuest: boolean;
  dateAdded: string | Date;
  datePurchased?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ----------------------------------------------------------------------------
// PHASE 3: FINANCE SYSTEM DOMAIN TYPES
// ----------------------------------------------------------------------------

export interface IncomeEntryItem {
  id: string;
  date: string | Date;
  source: string;
  description: string;
  amount: number;
  financialMonthId: string;
  createdAt?: string | Date;
}

export interface ExpenseItem {
  id: string;
  date: string | Date;
  description: string;
  category: string;
  amount: number;
  type: 'FIXED' | 'ADDITIONAL_SPENDING';
  isRecurring: boolean;
  isPaid: boolean;
  linkedDreamId?: string | null;
  financialMonthId?: string | null;
  notes?: string | null;
  createdAt?: string | Date;
}

export interface SavingsAllocationItem {
  id: string;
  title: string;
  amount: number;
  linkedDreamId?: string | null;
  financialMonthId: string;
  notes?: string | null;
  linkedDream?: DreamPurchaseItem | null;
  createdAt?: string | Date;
}

export interface PurchaseTransactionItem {
  id: string;
  date: string | Date;
  description: string;
  category: string;
  amount: number;
  linkedDreamId?: string | null;
  financialMonthId?: string | null;
  notes?: string | null;
  linkedDream?: DreamPurchaseItem | null;
  createdAt?: string | Date;
}

export interface FinancialMonthCalculations {
  totalIncome: number;
  fixedExpenses: number;
  savingsTarget: number;
  savingsAllocated: number;
  actualSpending: number;
  dreamSpending: number;
  availableMoney: number;
  safetyBuffer: number;
  safeToSpend: number;
  savingsRate: number; // percentage
  dreamBudget: number;
  dreamBudgetUsed: number;
  dreamBudgetRemaining: number;
  isDeficit: boolean;
}

export interface FinancialMonthData {
  id: string;
  month: number;
  year: number;
  baseIncome: number;
  savingsTarget: number;
  safetyBuffer: number;
  dreamBudget: number;
  currency: string;
  notes?: string | null;
  incomes: IncomeEntryItem[];
  expenses: ExpenseItem[];
  allocations: SavingsAllocationItem[];
  transactions: PurchaseTransactionItem[];
  calculated: FinancialMonthCalculations;
}

export interface MonthSummaryMini {
  month: number;
  year: number;
  totalIncome: number;
  fixedExpenses: number;
  savingsTarget: number;
  actualSpending: number;
  availableMoney: number;
  safetyBuffer: number;
  safeToSpend: number;
  savingsRate: number;
  isDeficit: boolean;
}

export interface DashboardStats {
  totalDreams: number;
  bigDreamsCount: number;
  smallDreamsCount: number;
  purchasedCount: number;
  totalDreamValue: number;
  purchasedValue: number;
  remainingValue: number;
  currentQuest: DreamPurchaseItem | null;
  currentMonthFinance?: MonthSummaryMini | null;
}
