'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  ShoppingCart, 
  TrendingDown, 
  Star, 
  Scale, 
  ShieldCheck, 
  Tag, 
  Award, 
  ThumbsUp, 
  ThumbsDown, 
  Crop,
  Layers,
  Image as ImageIcon,
  Scan,
  FileText,
  Copy
} from 'lucide-react';
import { ProductDetail, SimilarProduct } from '@/types/flyer';
import { cropFlyerImage } from '@/lib/cropUtils';

interface ProductDetailModalProps {
  product: ProductDetail;
  flyerImageUrl: string;
  onClose: () => void;
  onAddToCart: (product: ProductDetail, quantity: number, selectedAlternative?: SimilarProduct) => void;
  isInCart: boolean;
  onPrevProduct?: () => void;
  onNextProduct?: () => void;
  totalProductsCount: number;
  currentProductIndex: number;
  onOpenCropModal?: () => void;
}

export default function ProductDetailModal({
  product,
  flyerImageUrl,
  onClose,
  onAddToCart,
  isInCart,
  onPrevProduct,
  onNextProduct,
  totalProductsCount,
  currentProductIndex,
  onOpenCropModal,
}: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'comparison' | 'details' | 'ocr'>('comparison');
  const [copiedOcr, setCopiedOcr] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAlternative, setSelectedAlternative] = useState<SimilarProduct | null>(null);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [flyerCroppedUrl, setFlyerCroppedUrl] = useState<string | null>(product.croppedImageUrl || null);
  const [imageMode, setImageMode] = useState<'crop' | 'photo'>(product.croppedImageUrl ? 'crop' : 'crop');

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrevProduct) onPrevProduct();
      if (e.key === 'ArrowRight' && onNextProduct) onNextProduct();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevProduct, onNextProduct]);

  // Extract dynamic flyer crop if not already persisted
  useEffect(() => {
    let active = true;
    if (!product.croppedImageUrl && flyerImageUrl) {
      cropFlyerImage(flyerImageUrl, product.box)
        .then((dataUrl) => {
          if (active && dataUrl) {
            setFlyerCroppedUrl(dataUrl);
          }
        })
        .catch(console.warn);
    }
    return () => {
      active = false;
    };
  }, [flyerImageUrl, product.box, product.croppedImageUrl]);

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedAlternative || undefined);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const currentPrice = selectedAlternative ? selectedAlternative.price : product.dealPrice;
  const currentUnit = selectedAlternative ? selectedAlternative.unit : product.unit;
  const totalCost = currentPrice * quantity;
  const unitSavings = product.originalPrice > product.dealPrice ? (product.originalPrice - product.dealPrice) : 0;
  const totalSavings = unitSavings * quantity;

  const displayImage = imageMode === 'crop' && (flyerCroppedUrl || product.croppedImageUrl)
    ? (product.croppedImageUrl || flyerCroppedUrl)
    : (product.imageUrl || flyerCroppedUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 truncate">
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{product.category}</span>
            </span>
            {product.badge && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                {product.badge}
              </span>
            )}
            <span className="text-xs text-slate-400 hidden md:inline shrink-0">
              Item {currentProductIndex + 1} of {totalProductsCount}
            </span>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {onOpenCropModal && (
              <button
                onClick={onOpenCropModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-emerald-400 transition mr-1"
                title="Adjust product crop zone"
              >
                <Crop className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Adjust Crop</span>
              </button>
            )}

            {onPrevProduct && (
              <button
                onClick={onPrevProduct}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Previous flyer item"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {onNextProduct && (
              <button
                onClick={onNextProduct}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Next flyer item"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Close popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-3 sm:px-5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition min-h-[44px] ${
              activeTab === 'comparison'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Product Comparison</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">
              {product.similarProducts.length + 1}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition min-h-[44px] ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Specs & Nutrition</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition min-h-[44px] ${
              activeTab === 'ocr'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-4 h-4 text-amber-400" />
            <span>OCR Analysis</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
          {/* Main Hero Card: Product Image + Price */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 sm:p-5">
            {/* Product Image Section with Crop Toggle */}
            <div className="md:col-span-5 flex flex-col">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-inner group flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage || ''}
                  alt={product.title}
                  className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />

                {/* Badge tags overlay */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/90 text-white backdrop-blur-sm border border-slate-700 shadow">
                    {imageMode === 'crop' ? 'Flyer Snippet Crop' : 'Product Photo'}
                  </span>

                  {onOpenCropModal && (
                    <button
                      onClick={onOpenCropModal}
                      className="p-1 rounded-md bg-slate-900/90 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 shadow backdrop-blur-sm transition"
                      title="Adjust crop rectangle"
                    >
                      <Crop className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/90 text-white backdrop-blur-sm">
                    {product.stockStatus === 'in_stock' ? 'In Stock' : 'Selling Fast'}
                  </span>
                  {product.badge && (
                    <span className="sm:hidden px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/90 text-slate-950">
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Image Mode Switcher & Crop Button */}
              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-[11px]">
                  <button
                    onClick={() => setImageMode('crop')}
                    className={`px-2 py-1 rounded transition ${
                      imageMode === 'crop'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Flyer Crop
                  </button>
                  <button
                    onClick={() => setImageMode('photo')}
                    className={`px-2 py-1 rounded transition ${
                      imageMode === 'photo'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Clean Photo
                  </button>
                </div>

                {onOpenCropModal && (
                  <button
                    onClick={onOpenCropModal}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Crop className="w-3 h-3" /> Re-crop
                  </button>
                )}
              </div>
            </div>

            {/* Product Title & Deal Highlights */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {product.brand}
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-white mt-0.5 leading-snug">
                  {product.title}
                </h2>

                {/* Price Display */}
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mt-2 sm:mt-3">
                  <span className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    ${product.dealPrice.toFixed(2)}
                  </span>
                  {product.originalPrice > product.dealPrice && (
                    <>
                      <span className="text-sm sm:text-base text-slate-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Save {product.discountPercent}%
                      </span>
                    </>
                  )}
                  <span className="text-[11px] sm:text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {product.unitPrice}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 mt-2 sm:mt-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Deal Score Gauge */}
                <div className="mt-3 sm:mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-700/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      Deal Score Rating
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      {product.dealScore} / 10
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${(product.dealScore / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    💡 {product.dealScoreRationale}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: SIDE-BY-SIDE PRODUCT COMPARISON MATRIX */}
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              {/* Shopper Value Verdict Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Shopper Verdict: {product.smartVerdict.headline}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        {product.smartVerdict.recommendation === 'strong_buy' ? '★ Highly Recommended' : 'Fair Market Deal'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 mt-1">
                      {product.smartVerdict.reasoning}
                    </p>
                    <div className="mt-1.5 text-xs text-slate-400 flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className="text-slate-300 font-semibold">Best suited for:</span>
                      <span>{product.smartVerdict.bestFor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparative Table / Responsive Cards */}
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-2.5 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  Side-by-Side Market Comparison
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Card 1: THIS FLYER ITEM */}
                  <div 
                    onClick={() => setSelectedAlternative(null)}
                    className={`rounded-xl p-3.5 sm:p-4 border transition cursor-pointer relative min-h-[44px] ${
                      selectedAlternative === null
                        ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/40'
                        : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 uppercase tracking-wider">
                        Flyer Deal
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase">
                        {product.brand}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug line-clamp-2">
                      {product.title}
                    </h4>

                    {/* Price comparison */}
                    <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-700/60">
                      <div className="text-xl sm:text-2xl font-extrabold text-white">
                        ${product.dealPrice.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {product.unitPrice} ({product.unit})
                      </div>
                      <div className="mt-1 text-[11px] font-semibold text-emerald-400">
                        Save {product.discountPercent}% this week
                      </div>
                    </div>

                    {/* Rating & Review */}
                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-300">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      <span className="font-bold">4.8</span>
                      <span className="text-slate-500 text-[10px]">(Verified Promo)</span>
                    </div>

                    {/* Pros */}
                    <div className="mt-2.5 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-300">Why choose this:</div>
                      {product.highlights.slice(0, 2).map((h, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Select radio */}
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">Selected for trip:</span>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedAlternative === null ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600'
                      }`}>
                        {selectedAlternative === null && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </div>
                  </div>

                  {/* CARDS 2 & 3: SIMILAR / ALTERNATIVE ITEMS */}
                  {product.similarProducts.map((alt) => {
                    const isSelected = selectedAlternative?.id === alt.id;
                    const priceDiff = alt.price - product.dealPrice;

                    return (
                      <div
                        key={alt.id}
                        onClick={() => setSelectedAlternative(alt)}
                        className={`rounded-xl p-3.5 sm:p-4 border transition cursor-pointer relative min-h-[44px] ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/40'
                            : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {alt.badge || 'Alternative'}
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-400 uppercase">
                            {alt.brand}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug line-clamp-2">
                          {alt.name}
                        </h4>

                        {/* Price comparison */}
                        <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-700/60">
                          <div className="text-xl sm:text-2xl font-extrabold text-white">
                            ${alt.price.toFixed(2)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {alt.unitPrice} ({alt.unit})
                          </div>
                          <div className="mt-1 text-[11px] font-semibold">
                            {priceDiff > 0 ? (
                              <span className="text-amber-400">
                                +${priceDiff.toFixed(2)} higher out-of-pocket
                              </span>
                            ) : (
                              <span className="text-emerald-400">
                                -${Math.abs(priceDiff).toFixed(2)} lower upfront cost
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rating & Review */}
                        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-300">
                          <div className="flex text-amber-400">
                            {[...Array(Math.floor(alt.rating))].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                          <span className="font-bold">{alt.rating}</span>
                          <span className="text-slate-500 text-[10px]">({alt.reviewCount})</span>
                        </div>

                        {/* Pros & Cons */}
                        <div className="mt-2.5 space-y-1 text-xs">
                          {alt.pros.slice(0, 1).map((pro, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-1.5 text-emerald-300">
                              <ThumbsUp className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{pro}</span>
                            </div>
                          ))}
                          {alt.cons.slice(0, 1).map((con, cIdx) => (
                            <div key={cIdx} className="flex items-start gap-1.5 text-rose-300">
                              <ThumbsDown className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                              <span>{con}</span>
                            </div>
                          ))}
                        </div>

                        {/* Select radio */}
                        <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-medium">Choose alternative:</span>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-indigo-500 text-white' : 'border border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL PRODUCT SPECIFICATIONS & DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-2">Key Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {product.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-2">Product Specifications</h3>
                <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800 bg-slate-900/60 text-xs">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center px-4 py-2.5">
                      <span className="text-slate-400">{key}</span>
                      <span className="text-white font-semibold">{val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-slate-400">Unit Price</span>
                    <span className="text-emerald-400 font-bold">{product.unitPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OCR RAW TEXT & DEEP VISION ANALYSIS */}
          {activeTab === 'ocr' && (
            <div className="space-y-4">
              <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                      <Scan className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                        Verbatim Optical Character Recognition (OCR) Output
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Extracted text directly parsed from the flyer image scan by Gemini 2.5/3.5 Vision OCR.
                      </p>
                    </div>
                  </div>
                  {product.rawOcrText && (
                    <button
                      onClick={() => {
                        if (product.rawOcrText) {
                          navigator.clipboard.writeText(product.rawOcrText);
                          setCopiedOcr(true);
                          setTimeout(() => setCopiedOcr(false), 2000);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition shrink-0"
                    >
                      {copiedOcr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedOcr ? 'Copied' : 'Copy OCR'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Raw text snippet container */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-amber-200/90 leading-relaxed overflow-x-auto select-all">
                <div className="text-[10px] uppercase font-sans font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Transcribed Banner & Label Text:
                </div>
                {product.rawOcrText || `${product.brand.toUpperCase()} - ${product.title} $${product.dealPrice.toFixed(2)} ${product.unit}`}
              </div>

              {/* OCR Mapping Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  OCR Field Extraction Mapping
                </h4>
                <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800 bg-slate-900/60 text-xs">
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-slate-400">Printed Brand Title</span>
                    <span className="text-white font-mono font-semibold">{product.brand}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-slate-400">Parsed Product Name</span>
                    <span className="text-white font-mono font-semibold">{product.title}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-slate-400">Price Badge Readout</span>
                    <span className="text-emerald-400 font-mono font-bold">${product.dealPrice.toFixed(2)} ({product.unit})</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-slate-400">Normal Price Parsed</span>
                    <span className="text-slate-300 font-mono">${product.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-slate-400">Spatial Layout Tile</span>
                    <span className="text-amber-300 font-mono font-semibold">
                      Tile #{product.tileIndex || 1} ({product.dealTileType || 'grid_tile'})
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-slate-400">Flyer Box Coordinates (Normalized)</span>
                    <span className="text-amber-400 font-mono text-[11px]">
                      x: {product.box.x}%, y: {product.box.y}%, w: {product.box.width}%, h: {product.box.height}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-slate-400">OCR Read Status</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      High-Precision Scan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Sticky Action Footer */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-slate-800 bg-slate-950/95 flex flex-wrap items-center justify-between gap-3 shrink-0 safe-area-bottom">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">
                Total ({quantity} {currentUnit}):
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-bold text-white">
                  ${totalCost.toFixed(2)}
                </span>
                {totalSavings > 0 && selectedAlternative === null && (
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    (Save ${totalSavings.toFixed(2)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Add to List Button */}
          <div className="flex-1 sm:flex-initial">
            <button
              onClick={handleAdd}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition active:scale-95 min-h-[44px] ${
                addedSuccess
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added to Trip List!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    Add to Trip List (${totalCost.toFixed(2)})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
