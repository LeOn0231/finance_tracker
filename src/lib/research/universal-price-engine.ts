import { PriceBreakdown, PriceComponent, SourceType } from '@/lib/types';
import { calculateIndianOnRoadPrice } from './vehicle-price-engine';

export interface FinalPriceCalculationParams {
  name: string;
  category: string;
  listedPrice: number;
  currency?: string;
  sourceType: SourceType;
  verifiedSourceName: string;
  brand?: string;
  model?: string;
  locationState?: string;
  locationCity?: string;
  engineCc?: number;
  isVehicle?: boolean;
  vehicleType?: 'TWO_WHEELER' | 'FOUR_WHEELER';
  customAccessories?: number;
}

export interface FinalPriceResult {
  listedPrice: number;
  shippingCost: number;
  mandatoryFees: number;
  finalPrice: number;
  finalCheckoutPrice: number;
  sourceType: SourceType;
  verifiedSource: string;
  priceBreakdown: PriceBreakdown;
  lastChecked: string;
}

/**
 * Universal Final Price Engine
 * Computes exact checkout / ownership cost depending on product category & trusted source.
 */
export function calculateUniversalFinalPrice(
  params: FinalPriceCalculationParams
): FinalPriceResult {
  const currency = params.currency || 'INR';
  const listedPrice = Math.max(0, params.listedPrice);
  const nowStr = new Date().toISOString();
  const cat = (params.category || '').toLowerCase();

  // 1. CARS & BIKES (Vehicles) - Full On-Road Calculation
  if (
    params.isVehicle ||
    cat === 'vehicles' ||
    cat.includes('bike') ||
    cat.includes('motorcycle') ||
    cat.includes('car')
  ) {
    const state = params.locationState || 'Karnataka';
    const isBike = params.vehicleType ? params.vehicleType === 'TWO_WHEELER' : true;
    const vehicleRes = calculateIndianOnRoadPrice({
      name: params.name,
      brand: params.brand,
      exShowroomPrice: listedPrice,
      engineCc: params.engineCc || (isBike ? 350 : 1500),
      vehicleType: isBike ? 'TWO_WHEELER' : 'FOUR_WHEELER',
      state,
      city: params.locationCity,
      accessoriesAmount: params.customAccessories || 0,
    });

    const breakdown: PriceBreakdown = {
      ...vehicleRes.breakdown,
      type: 'VEHICLE_ON_ROAD',
      sourceType: params.sourceType,
      verifiedSource: params.verifiedSourceName,
      lastChecked: nowStr,
    };

    const mandatoryFees = Math.max(0, vehicleRes.breakdown.finalPrice - listedPrice);

    return {
      listedPrice,
      shippingCost: 0,
      mandatoryFees,
      finalPrice: vehicleRes.breakdown.finalPrice,
      finalCheckoutPrice: vehicleRes.breakdown.finalPrice,
      sourceType: params.sourceType,
      verifiedSource: params.verifiedSourceName,
      priceBreakdown: breakdown,
      lastChecked: nowStr,
    };
  }

  // 2. ELECTRONICS, PERIPHERALS, PC & AUDIO
  // (Keyboard, Mouse, Monitor, GPU, Laptop, Phone, Headphones)
  if (
    cat.includes('electronic') ||
    cat.includes('audio') ||
    cat.includes('tech') ||
    cat.includes('gaming') ||
    cat.includes('pc') ||
    cat.includes('camera')
  ) {
    // Shipping rules: Free delivery for orders >= ₹499; ₹150 standard delivery if below
    const shippingCost = listedPrice >= 499 ? 0 : 150;
    // Platform / Mandatory handling fees: ₹5-₹9 for Amazon/Flipkart checkout; ₹0 for Official Brand
    const mandatoryFees = params.sourceType === 'AMAZON' || params.sourceType === 'FLIPKART' ? 5 : 0;
    const finalCheckoutPrice = Math.round(listedPrice + shippingCost + mandatoryFees);

    const components: PriceComponent[] = [
      {
        name: 'Product Selling Price (Listed)',
        amount: listedPrice,
        description: 'Base verified merchant or brand selling price',
        isMandatory: true,
      },
    ];

    if (shippingCost > 0) {
      components.push({
        name: 'Standard Insured Shipping',
        amount: shippingCost,
        description: 'Applicable delivery fee for orders below free shipping threshold',
        isMandatory: true,
      });
    } else {
      components.push({
        name: 'Standard Shipping (Eligible for Free Delivery)',
        amount: 0,
        description: 'Free Prime / Official OEM insured delivery',
        isMandatory: false,
      });
    }

    if (mandatoryFees > 0) {
      components.push({
        name: 'Mandatory Platform / Handling Fee',
        amount: mandatoryFees,
        description: `${params.verifiedSourceName} mandatory platform processing charge`,
        isMandatory: true,
      });
    }

    const breakdown: PriceBreakdown = {
      type: 'ELECTRONICS',
      currency,
      listedPrice,
      shippingCost,
      mandatoryFees,
      finalPrice: finalCheckoutPrice,
      components,
      sourceType: params.sourceType,
      verifiedSource: params.verifiedSourceName,
      lastChecked: nowStr,
      notes: `${params.verifiedSourceName} Verified Price to Own`,
    };

    return {
      listedPrice,
      shippingCost,
      mandatoryFees,
      finalPrice: finalCheckoutPrice,
      finalCheckoutPrice,
      sourceType: params.sourceType,
      verifiedSource: params.verifiedSourceName,
      priceBreakdown: breakdown,
      lastChecked: nowStr,
    };
  }

  // 3. SHOES, CLOTHES & APPAREL
  // Return the checkout payable amount only (Product price + Shipping, ignore unapplied coupons)
  if (
    cat.includes('fashion') ||
    cat.includes('apparel') ||
    cat.includes('shoes') ||
    cat.includes('clothing')
  ) {
    // Nike / Official apparel shipping: Free for >= ₹14,000 or ₹1,999 depending on threshold; else ₹250
    const shippingCost = listedPrice >= 1999 ? 0 : 250;
    const mandatoryFees = 0;
    const finalCheckoutPrice = Math.round(listedPrice + shippingCost);

    const components: PriceComponent[] = [
      {
        name: 'Product Listed Price',
        amount: listedPrice,
        description: 'Verified official retail checkout rate',
        isMandatory: true,
      },
    ];

    if (shippingCost > 0) {
      components.push({
        name: 'Standard Doorstep Delivery',
        amount: shippingCost,
        description: 'Courier delivery charge',
        isMandatory: true,
      });
    }

    const breakdown: PriceBreakdown = {
      type: 'APPAREL',
      currency,
      listedPrice,
      shippingCost,
      mandatoryFees,
      finalPrice: finalCheckoutPrice,
      components,
      sourceType: params.sourceType,
      verifiedSource: params.verifiedSourceName,
      lastChecked: nowStr,
      notes: 'Payable checkout total amount',
    };

    return {
      listedPrice,
      shippingCost,
      mandatoryFees,
      finalPrice: finalCheckoutPrice,
      finalCheckoutPrice,
      sourceType: params.sourceType,
      verifiedSource: params.verifiedSourceName,
      priceBreakdown: breakdown,
      lastChecked: nowStr,
    };
  }

  // 4. ANIME FIGURES, MANGA, BOOKS, WATCHES & OTHER
  const shippingCost = listedPrice >= 1000 ? 0 : 100;
  const mandatoryFees = params.sourceType === 'AMAZON' || params.sourceType === 'FLIPKART' ? 5 : 0;
  const finalCheckoutPrice = Math.round(listedPrice + shippingCost + mandatoryFees);

  const components: PriceComponent[] = [
    {
      name: 'Product Listed Price',
      amount: listedPrice,
      description: 'Verified retail selling price',
      isMandatory: true,
    },
  ];

  if (shippingCost > 0) {
    components.push({
      name: 'Standard Courier Shipping',
      amount: shippingCost,
      description: 'Standard delivery fee',
      isMandatory: true,
    });
  }

  if (mandatoryFees > 0) {
    components.push({
      name: 'Platform Processing Fee',
      amount: mandatoryFees,
      description: 'Mandatory marketplace fee',
      isMandatory: true,
    });
  }

  const breakdown: PriceBreakdown = {
    type: 'STANDARD',
    currency,
    listedPrice,
    shippingCost,
    mandatoryFees,
    finalPrice: finalCheckoutPrice,
    components,
    sourceType: params.sourceType,
    verifiedSource: params.verifiedSourceName,
    lastChecked: nowStr,
  };

  return {
    listedPrice,
    shippingCost,
    mandatoryFees,
    finalPrice: finalCheckoutPrice,
    finalCheckoutPrice,
    sourceType: params.sourceType,
    verifiedSource: params.verifiedSourceName,
    priceBreakdown: breakdown,
    lastChecked: nowStr,
  };
}
