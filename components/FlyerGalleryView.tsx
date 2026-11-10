'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  Search, 
  Calendar, 
  Store, 
  ArrowRight, 
  Eye, 
  Filter
} from 'lucide-react';
import { Flyer } from '@/types/flyer';

interface FlyerGalleryViewProps {
  flyers: Flyer[];
  onOpenFlyerPopUp: (flyer: Flyer) => void;
  onOpenUpload: () => void;
}

export default function FlyerGalleryView({
  flyers,
  onOpenFlyerPopUp,
  onOpenUpload,
}: FlyerGalleryViewProps) {
  const [filterStore, setFilterStore] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique stores
  const stores = ['All', ...Array.from(new Set(flyers.map((f) => f.store)))];

  // Filter flyers
  const filteredFlyers = flyers.filter((flyer) => {
    const matchesStore = filterStore === 'All' || flyer.store === filterStore;
    const matchesQuery =
      searchQuery.trim() === '' ||
      flyer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flyer.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flyer.products.some((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStore && matchesQuery;
  });

  const totalHotspots = flyers.reduce((acc, f) => acc + f.products.length, 0);

  return (
    <div className="w-full h-full bg-slate-950 overflow-y-auto p-4 sm:p-6 md:p-8 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-24 lg:pb-12">
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-6 sm:p-8 shadow-2xl overflow-hidden glass-panel">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              {/* Clean unboxed metadata kicker */}
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI Vision Catalog Gallery</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-normal lowercase">{totalHotspots} total hotspots mapped</span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Promotional Flyer Gallery
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Explore converted retail flyers with interactive hotspot zones. Select any flyer page to inspect spatial deal tiles, test prices, and run competitor market comparisons.
              </p>
            </div>

            {/* Quick Stats & Upload CTA */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 backdrop-blur-md">
                <div className="text-xl sm:text-2xl font-black text-white tabular-nums">{flyers.length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Flyers
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 backdrop-blur-md">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">{totalHotspots}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Hotspot Zones
                </div>
              </div>

              <button
                onClick={onOpenUpload}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-600/25 transition active:scale-95 border border-emerald-400/30 min-h-[44px]"
              >
                <Upload className="w-4 h-4" />
                <span>+ Convert New Flyer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 backdrop-blur-md">
          {/* Store Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-emerald-400" /> Store:
            </span>
            {stores.map((store) => (
              <button
                key={store}
                onClick={() => setFilterStore(store)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap min-h-[32px] ${
                  filterStore === store
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {store}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search catalog, brands, deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[36px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Flyer Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlyers.map((flyer, fIdx) => {
            const topProducts = flyer.products.slice(0, 3);

            return (
              <div
                key={`gallery-card-${flyer.id}-${fIdx}`}
                onClick={() => onOpenFlyerPopUp(flyer)}
                className="group relative bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col glass-panel-hover"
              >
                {/* Image Cover Container */}
                <div className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flyer.imageUrl}
                    alt={flyer.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-950/90 text-emerald-400 border border-emerald-500/40 shadow-lg backdrop-blur-md flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      {flyer.products.length} Hotspots
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900/90 text-slate-300 border border-slate-700/80 shadow-lg backdrop-blur-md">
                      {flyer.bannerTag}
                    </span>
                  </div>

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-slate-950/50 backdrop-blur-[2px]">
                    <span className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-2xl flex items-center gap-2 transform group-hover:scale-105 transition-all">
                      <Eye className="w-4 h-4" />
                      <span>Open Interactive Flyer</span>
                    </span>
                  </div>

                  {/* Bottom Store & Title */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{flyer.store}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug truncate mt-0.5">
                      {flyer.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content & Featured Deals */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-slate-900/40">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 border-b border-slate-800/80 pb-2.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{flyer.validity}</span>
                  </div>

                  {/* Top Deal Callouts */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Featured Hotspot Deals:
                    </div>
                    <div className="space-y-1">
                      {topProducts.map((prod, pIdx) => (
                        <div
                          key={`gallery-top-${flyer.id}-${prod.id}-${pIdx}`}
                          className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80"
                        >
                          <span className="text-slate-200 truncate font-semibold max-w-[65%] text-[11px]">
                            {prod.title}
                          </span>
                          <span className="font-extrabold text-emerald-400 font-mono tabular-nums text-xs">
                            ${prod.dealPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/80">
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Inspect flyer <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {flyer.categories.length - 1} Categories
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Convert New Flyer Tile */}
          <div
            onClick={onOpenUpload}
            className="group relative bg-slate-900/30 border-2 border-dashed border-slate-800 hover:border-emerald-500/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 transition-all duration-300 cursor-pointer min-h-[360px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 transition-transform group-hover:scale-110">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">Convert New Flyer</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Upload any grocery circular image to extract spatial hotspot zones and compare store prices automatically.
              </p>
            </div>
            <span className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-600/20">
              + Convert Flyer Image
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
