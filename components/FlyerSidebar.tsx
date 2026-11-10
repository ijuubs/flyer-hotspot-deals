'use client';

import React, { useState } from 'react';
import { 
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
  flyer: Flyer | null;
  selectedProductId?: string;
  onSelectProduct: (product: ProductDetail) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onAddToCart: (product: ProductDetail) => void;
  cartProductIds: Set<string>;
  onOpenCropModal?: (product: ProductDetail) => void;
  onCloseMobile?: () => void;
  onEditProduct?: (product: ProductDetail) => void;
  isAdminMode?: boolean;
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
  onEditProduct,
}: FlyerSidebarProps) {
  const [sortBy, setSortBy] = useState<'savings' | 'price_low' | 'price_high' | 'score'>('score');

  if (!flyer) {
    return (
      <div className="w-full h-full bg-slate-900/60 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center">
        <div className="text-slate-500 text-xs font-semibold">No active flyer selected</div>
        <div className="text-slate-600 text-[11px] mt-1">Upload a flyer or load a catalog sample to browse deals</div>
      </div>
    );
  }

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
    <aside className="w-full md:w-80 lg:w-96 bg-slate-950/90 border-l border-slate-800/80 flex flex-col h-full shrink-0 text-slate-100 z-20 backdrop-blur-md">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800/80 space-y-3 shrink-0 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight">
              Hotspot Catalog ({sortedProducts.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Controls */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

        {/* Category Segmented Controls (Functional Filter Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-slate-950 p-1 rounded-2xl border border-slate-800/80">
          {flyer.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[30px] ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 pb-20 md:pb-4">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 px-4 text-slate-400">
            <Search className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-300">No matching products found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try switching category filter or search term</p>
          </div>
        ) : (
          sortedProducts.map((p, idx) => {
            const isSelected = selectedProductId === p.id;
            const isInCart = cartProductIds.has(p.id);

            return (
              <div
                key={`sidebar-${flyer.id}-${p.id}-${idx}`}
                onClick={() => onSelectProduct(p)}
                className={`group p-3 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.croppedImageUrl || p.imageUrl || ''}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {p.discountPercent > 0 && (
                      <span className="absolute top-0.5 right-0.5 text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 shadow">
                        -{p.discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    {/* Clean unboxed metadata with bullet separators */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                      <span className="text-emerald-400 font-bold truncate max-w-[65%]">
                        {p.brand}
                      </span>
                      <span className="font-mono text-amber-400 shrink-0">
                        Score {p.dealScore}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-white truncate leading-snug">
                      {p.title}
                    </h4>

                    {/* Price & Unit */}
                    <div className="flex items-baseline gap-2 mt-1 font-mono">
                      <span className="text-base font-black text-white tabular-nums">
                        ${p.dealPrice.toFixed(2)}
                      </span>
                      {p.originalPrice > p.dealPrice && (
                        <span className="text-xs text-slate-500 line-through tabular-nums">
                          ${p.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-sans truncate">
                        {p.unit}
                      </span>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
                      <div className="flex items-center gap-2">
                        {onEditProduct && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProduct(p);
                            }}
                            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
                            title="Edit product meta & box"
                          >
                            <Crop className="w-3 h-3" /> Edit Box
                          </button>
                        )}
                        {onOpenCropModal && !onEditProduct && (
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
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(p);
                        }}
                        className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition flex items-center gap-1 min-h-[28px] ${
                          isInCart
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" /> Added
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
