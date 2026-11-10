export interface HotspotBox {
  x: number; // percentage from left (0 to 100)
  y: number; // percentage from top (0 to 100)
  width: number; // percentage width (0 to 100)
  height: number; // percentage height (0 to 100)
}

export interface SimilarProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  unit: string;
  unitPrice: string;
  store: string;
  badge?: string; // e.g. "Cheaper Alternative", "Premium Pick", "Bulk Pack"
  rating: number; // 1 to 5
  reviewCount: number;
  image?: string;
  pros: string[];
  cons: string[];
  isCheaper: boolean;
  valueDifferencePct: number; // e.g. -18% (18% cheaper) or +25%
}

export interface ProductDetail {
  id: string;
  flyerId: string;
  title: string;
  brand: string;
  category: string;
  dealPrice: number;
  originalPrice: number;
  unit: string; // e.g. "1kg pack", "750ml bottle", "2L tub"
  unitPrice: string; // e.g. "$19.95 / kg", "$7.00 / L"
  discountPercent: number;
  badge?: string;
  rawOcrText?: string; // Verbatim text block extracted from flyer image OCR
  dealTileType?: 'hero_banner' | 'grid_tile' | 'badge_callout' | 'strip_banner'; // Flyer visual block layout type
  tileIndex?: number; // Spatial reading sequence index (1, 2, 3...)
  isCandidate?: boolean; // True if bounding box is an AI auto-crop candidate suggestion
  dealScore: number; // 0 - 10
  dealScoreRationale: string;
  description: string;
  highlights: string[];
  specs: Record<string, string>;
  stockStatus: 'in_stock' | 'limited' | 'selling_fast';
  box: HotspotBox;
  clusterId?: string; // Optional auto-grouped cluster ID
  imageUrl?: string;
  croppedImageUrl?: string;
  similarProducts: SimilarProduct[];
  smartVerdict: {
    recommendation: 'strong_buy' | 'fair_deal' | 'consider_alternative';
    headline: string;
    reasoning: string;
    bestFor: string;
  };
}

export interface HotspotCluster {
  id: string;
  name: string;
  category: string;
  box: HotspotBox;
  productIds: string[];
  totalDealsCount: number;
  averagePrice: number;
}

export interface Flyer {
  id: string;
  title: string;
  store: string;
  tagline: string;
  validity: string;
  bannerTag: string;
  imageUrl: string;
  themeColor: string;
  rawHeaderOcr?: string; // Verbatim flyer banner header OCR text
  categories: string[];
  products: ProductDetail[];
  clusters?: HotspotCluster[];
}

export interface CartItem {
  product: ProductDetail;
  quantity: number;
  selectedAlternative?: SimilarProduct;
}
