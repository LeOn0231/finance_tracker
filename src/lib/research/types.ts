import { PriceConfidence, PriceBreakdown } from '@/lib/types';

export interface ResearchInput {
  query?: string;
  url?: string;
  category?: string;
  locationState?: string;
  locationCity?: string;
  customAccessories?: number;
}

export interface ResearchSourceInfo {
  name: string;
  url?: string;
  type: 'OFFICIAL_OEM' | 'OFFICIAL_DEALER' | 'ESTABLISHED_RETAILER' | 'AGGREGATOR' | 'ESTIMATED';
  reliability: 'HIGH' | 'MEDIUM' | 'LOW';
  checkedDate: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingDreamId?: string;
  existingName?: string;
  existingPrice?: number;
  existingStatus?: string;
  existingVariant?: string;
  matchType?: 'EXACT_URL' | 'EXACT_NAME' | 'SIMILAR_MODEL';
}

export interface ProductResearchResult {
  success: boolean;
  product?: {
    name: string;
    brand?: string;
    model?: string;
    variant?: string;
    category: string;
    description?: string;
    image?: string;
    sourceUrl?: string;
    sourceName?: string;
    listedPrice: number;
    finalPrice: number;
    currency: string;
    specs?: string;
    availability?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'UNKNOWN';
    priceConfidence: PriceConfidence;
    priceBreakdown?: PriceBreakdown;
    locationState?: string;
    locationCity?: string;
    checkedAt: string;
    researchMetadata?: Record<string, unknown>;
  };
  sourcesChecked: ResearchSourceInfo[];
  requiresLocation?: boolean;
  suggestedLocations?: string[];
  duplicateWarning?: DuplicateCheckResult | null;
  error?: string;
  isFallback?: boolean;
}

export interface ProductResearchProvider {
  name: string;
  priority: number; // 1 = highest
  canHandle(input: ResearchInput): boolean;
  research(input: ResearchInput): Promise<ProductResearchResult | null>;
}
