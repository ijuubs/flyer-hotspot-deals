'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  TrendingDown, 
  Star, 
  Filter, 
  ArrowUpDown,
  Tag,
  Check,
  Search,
  ShoppingCart,
  Crop,
  X
} from 'lucide-react';
import { Flyer, ProductDetail } from '@/types/flyer';

interface FlyerSidebarProps {
  flyer: Flyer;
  selectedProductId?: string;
  onSelectProduct: (product: ProductDetail) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onAddToCart: (product: ProductDetail) => void;
  cartProductIds: Set<string>;
  onOpenCropModal?: (product: ProductDetail) => void;
  onCloseMobile?: () => void;
}

export default function FlyerSidebar({
  flyer,
  selectedProductId,
  onSelectProduct,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onAddToCart,
  cartProductIds,
  onOpenCropModal,
  onCloseMobile,
}: FlyerSidebarProps) {
  const [sortBy, setSortBy] = useState<'savings' | 'price_low' | 'price_high' | 'score'>('score');

  // Filter products
  const filteredProducts = flyer.products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.dealPrice.toString().includes(q)
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'savings') return b.discountPercent - a.discountPercent;
    if (sortBy === 'price_low') return a.dealPrice - b.dealPrice;
    if (sortBy === 'price_high') return b.dealPrice - a.dealPrice;
    if (sortBy === 'score') return b.dealScore - a.dealScore;
    return 0;
  });

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 text-slate-100 z-20">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-800 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Flyer Products ({sortedProducts.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="score">Value Score</option>
                <option value="savings">Savings %</option>
                <option value="price_low">Price: Low</option>
                <option value="price_high">Price: High</option>
              </select>
            </div>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll) */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {flyer.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition min-h-[32px] ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 pb-20 md:pb-4">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-400">
            <Search className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">No items match your criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or search terms</p>
          </div>
        ) : (
          sortedProducts.map((p) => {
            const isSelected = selectedProductId === p.id;
            const isInCart = cartProductIds.has(p.id);

            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className={`group p-3 rounded-xl border transition-all duration-150 cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail (Cropped flyer image or stock photo) */}
                  <div className="w-14 h-14 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-700/80 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.croppedImageUrl || p.imageUrl || ''}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {p.discountPercent > 0 && (
                      <span className="absolute top-0.5 right-0.5 text-[9px] font-bold px-1 py-0.2 rounded bg-rose-500 text-white">
                        -{p.discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide truncate">
                        {p.brand}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 shrink-0">
                        ★ {p.dealScore}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate leading-snug mt-0.5">
                      {p.title}
                    </h4>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-extrabold text-white">
                        ${p.dealPrice.toFixed(2)}
                      </span>
                      {p.originalPrice > p.dealPrice && (
                        <span className="text-xs text-slate-500 line-through">
                          ${p.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 truncate">
                        {p.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
                      {onOpenCropModal ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCropModal(p);
                          }}
                          className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
                          title="Crop product zone"
                        >
                          <Crop className="w-3 h-3" /> Crop Zone
                        </button>
                      ) : (
                        <span className="text-slate-400">
                          {p.similarProducts.length} compared
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(p);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 min-h-[28px] ${
                          isInCart
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white'
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <Check className="w-3 h-3" /> Added
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3" /> + List
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
