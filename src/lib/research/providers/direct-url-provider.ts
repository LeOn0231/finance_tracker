import { ProductResearchProvider, ResearchInput, ProductResearchResult, ResearchSourceInfo } from '../types';

export class DirectUrlProvider implements ProductResearchProvider {
  name = 'Direct Web Scraper (OpenGraph & JSON-LD)';
  priority = 1;

  canHandle(input: ResearchInput): boolean {
    if (!input.url) return false;
    const url = input.url.trim();
    return url.startsWith('http://') || url.startsWith('https://');
  }

  async research(input: ResearchInput): Promise<ProductResearchResult | null> {
    if (!input.url) return null;
    const rawUrl = input.url.trim();

    try {
      const parsedUrl = new URL(rawUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(rawUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      return this.parseHtml(html, parsedUrl, rawUrl);
    } catch {
      // Network error, timeout, or blocked
      return null;
    }
  }

  private parseHtml(html: string, url: URL, rawUrl: string): ProductResearchResult | null {
    // 1. Extract JSON-LD product data if available
    const jsonLdData = this.extractJsonLd(html);

    // 2. Extract OpenGraph & Meta tags
    const ogTitle = this.extractMetaContent(html, 'og:title') || this.extractTagContent(html, 'title');
    const ogImage = this.extractMetaContent(html, 'og:image') || this.extractMetaContent(html, 'twitter:image');
    const ogDesc = this.extractMetaContent(html, 'og:description') || this.extractMetaContent(html, 'description');
    const ogSiteName = this.extractMetaContent(html, 'og:site_name') || url.hostname.replace('www.', '');
    const ogPrice = this.extractMetaContent(html, 'og:price:amount') || this.extractMetaContent(html, 'product:price:amount');
    const ogCurrency = this.extractMetaContent(html, 'og:price:currency') || this.extractMetaContent(html, 'product:price:currency') || 'INR';

    // Consolidate data
    const title = jsonLdData?.name || ogTitle || this.guessTitleFromUrl(url);
    if (!title || title.trim().length < 2) return null;

    const image = jsonLdData?.image || ogImage || undefined;
    const description = jsonLdData?.description || ogDesc || undefined;
    const brand = jsonLdData?.brand || this.guessBrand(title, url.hostname);
    const priceNumber = jsonLdData?.price || (ogPrice ? parseFloat(ogPrice.replace(/[^0-9.]/g, '')) : 0);
    const currency = jsonLdData?.currency || ogCurrency;

    // Guess category from title & description
    const category = this.guessCategory(title, description);

    const sourcesChecked: ResearchSourceInfo[] = [
      {
        name: ogSiteName || url.hostname,
        url: rawUrl,
        type: 'ESTABLISHED_RETAILER',
        reliability: priceNumber > 0 ? 'HIGH' : 'MEDIUM',
        checkedDate: new Date().toISOString(),
      },
    ];

    return {
      success: true,
      product: {
        name: title.trim(),
        brand: brand || undefined,
        category,
        description: description?.trim() || undefined,
        image: image || undefined,
        sourceUrl: rawUrl,
        sourceName: ogSiteName,
        listedPrice: priceNumber,
        finalPrice: priceNumber,
        currency,
        priceConfidence: priceNumber > 0 ? 'VERIFIED' : 'NEEDS_CONFIRMATION',
        availability: 'IN_STOCK',
        checkedAt: new Date().toISOString(),
        researchMetadata: {
          provider: this.name,
          extractedVia: jsonLdData ? 'JSON_LD' : 'OPEN_GRAPH',
        },
      },
      sourcesChecked,
    };
  }

  private extractMetaContent(html: string, nameOrProp: string): string | null {
    const regex1 = new RegExp(`<meta\\s+property=["']${nameOrProp}["']\\s+content=["']([^"']+)["']`, 'i');
    const match1 = html.match(regex1);
    if (match1 && match1[1]) return this.cleanHtmlEntities(match1[1]);

    const regex2 = new RegExp(`<meta\\s+name=["']${nameOrProp}["']\\s+content=["']([^"']+)["']`, 'i');
    const match2 = html.match(regex2);
    if (match2 && match2[1]) return this.cleanHtmlEntities(match2[1]);

    const regex3 = new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+property=["']${nameOrProp}["']`, 'i');
    const match3 = html.match(regex3);
    if (match3 && match3[1]) return this.cleanHtmlEntities(match3[1]);

    return null;
  }

  private extractTagContent(html: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\\/${tag}>`, 'i');
    const match = html.match(regex);
    return match && match[1] ? this.cleanHtmlEntities(match[1].trim()) : null;
  }

  private extractJsonLd(html: string): { name?: string; price?: number; currency?: string; image?: string; description?: string; brand?: string } | null {
    try {
      const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let match;
      while ((match = scriptRegex.exec(html)) !== null) {
        try {
          const data = JSON.parse(match[1]);
          const item = Array.isArray(data) ? data.find((d) => d['@type'] === 'Product') : data;
          if (item && (item['@type'] === 'Product' || item['@type'] === 'IndividualProduct')) {
            let price = 0;
            let currency = 'INR';

            if (item.offers) {
              const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              if (offer.price) price = parseFloat(String(offer.price));
              if (offer.priceCurrency) currency = String(offer.priceCurrency);
            }

            const img = typeof item.image === 'string' ? item.image : Array.isArray(item.image) ? item.image[0] : item.image?.url;
            const brand = typeof item.brand === 'string' ? item.brand : item.brand?.name;

            return {
              name: item.name,
              description: item.description,
              image: img,
              price,
              currency,
              brand,
            };
          }
        } catch {
          // Continue searching scripts
        }
      }
    } catch {
      // Ignore json-ld parse errors
    }
    return null;
  }

  private guessTitleFromUrl(url: URL): string {
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return url.hostname;
    const last = parts[parts.length - 1];
    return decodeURIComponent(last).replace(/[-_]/g, ' ').replace(/\.html?$/i, '');
  }

  private guessBrand(title: string, hostname: string): string | undefined {
    const lowerTitle = title.toLowerCase();
    const commonBrands = [
      'Sony', 'Apple', 'Royal Enfield', 'Samsung', 'Porsche', 'Nikon', 'Canon',
      'Bose', 'Sennheiser', 'Nintendo', 'PlayStation', 'Xbox', 'Logitech', 'Razer',
      'Anker', 'ASUS', 'MSI', 'Dell', 'LG', 'Yamaha', 'Honda', 'Kawasaki', 'Triumph'
    ];
    for (const b of commonBrands) {
      if (lowerTitle.includes(b.toLowerCase()) || hostname.includes(b.toLowerCase())) {
        return b;
      }
    }
    return undefined;
  }

  private guessCategory(title: string, description?: string): string {
    const text = `${title} ${description || ''}`.toLowerCase();
    if (text.includes('bike') || text.includes('motorcycle') || text.includes('car') || text.includes('super meteor') || text.includes('porsche') || text.includes('vehicle')) {
      return 'Vehicles';
    }
    if (text.includes('headphone') || text.includes('earphone') || text.includes('audio') || text.includes('speaker') || text.includes('mic')) {
      return 'Audio & Tech';
    }
    if (text.includes('laptop') || text.includes('macbook') || text.includes('pc') || text.includes('gpu') || text.includes('monitor') || text.includes('keyboard')) {
      return 'Electronics & PC';
    }
    if (text.includes('manga') || text.includes('book') || text.includes('novel')) {
      return 'Manga & Books';
    }
    if (text.includes('figure') || text.includes('statue') || text.includes('nendoroid') || text.includes('anime')) {
      return 'Anime & Figures';
    }
    if (text.includes('game') || text.includes('playstation') || text.includes('ps5') || text.includes('nintendo') || text.includes('xbox')) {
      return 'Gaming';
    }
    if (text.includes('camera') || text.includes('lens') || text.includes('tripod')) {
      return 'Cameras & Gear';
    }
    if (text.includes('watch') || text.includes('chronograph')) {
      return 'Watches & Jewelry';
    }
    return 'General';
  }

  private cleanHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
  }
}
