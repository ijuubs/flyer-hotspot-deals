'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  ShoppingCart, 
  Search, 
  Layers, 
  Eye, 
  EyeOff, 
  ChevronDown,
  X,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { Flyer } from '@/types/flyer';

interface NavbarProps {
  flyers: Flyer[];
  currentFlyer: Flyer;
  onSelectFlyer: (flyer: Flyer) => void;
  onOpenUpload: () => void;
  onOpenShoppingList: () => void;
  cartCount: number;
  totalSavings: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  hotspotStyle: 'pins' | 'boxes' | 'minimal' | 'ocr';
  onHotspotStyleChange: (style: 'pins' | 'boxes' | 'minimal' | 'ocr') => void;
  showHotspots: boolean;
  onToggleShowHotspots: () => void;
}

export default function Navbar({
  flyers,
  currentFlyer,
  onSelectFlyer,
  onOpenUpload,
  onOpenShoppingList,
  cartCount,
  totalSavings,
  searchQuery,
  onSearchChange,
  hotspotStyle,
  onHotspotStyleChange,
  showHotspots,
  onToggleShowHotspots,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-500 p-0.5 shadow-md shadow-rose-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  FlyerSpot
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  AI Hotspots
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden md:block">
                Interactive Ads & Product Comparisons
              </p>
            </div>
          </div>

          {/* Flyer Selector Dropdown */}
          <div className="relative min-w-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-xs sm:text-sm font-medium transition text-slate-200 hover:text-white max-w-[140px] sm:max-w-[240px] md:max-w-[320px] min-h-[38px]"
              title="Switch flyer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate text-left">{currentFlyer.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
            </button>

            {dropdownOpen && (
              <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto top-16 sm:top-auto sm:left-0 sm:mt-2 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[75vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Promotional Flyers ({flyers.length})
                  </span>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenUpload();
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Upload New
                  </button>
                </div>
                <div className="space-y-1.5 overflow-y-auto mt-2 pr-1 flex-1">
                  {flyers.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onSelectFlyer(f);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition ${
                        f.id === currentFlyer.id
                          ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40 shadow-sm'
                          : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="w-12 h-14 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-700/80 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={f.imageUrl}
                          alt={f.title}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate text-white">{f.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{f.store}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {f.products.length} Hotspots
                          </span>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            {f.bannerTag}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Search Input */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Button Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Search items"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Hotspot Toggle */}
            <button
              onClick={onToggleShowHotspots}
              className={`p-2 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 min-h-[38px] ${
                showHotspots
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
              title={showHotspots ? 'Hide Hotspots' : 'Show Hotspots'}
            >
              {showHotspots ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="hidden sm:inline">Hotspots</span>
            </button>

            {/* Hotspot Style Selector (Tablet & Desktop) */}
            <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => onHotspotStyleChange('pins')}
                className={`px-2.5 py-1 rounded-lg transition text-xs ${
                  hotspotStyle === 'pins'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Pulsing Price Pin Markers"
              >
                Pins
              </button>
              <button
                onClick={() => onHotspotStyleChange('boxes')}
                className={`px-2.5 py-1 rounded-lg transition text-xs ${
                  hotspotStyle === 'boxes'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Zone Bounding Boxes"
              >
                Zones
              </button>
              <button
                onClick={() => onHotspotStyleChange('minimal')}
                className={`px-2.5 py-1 rounded-lg transition text-xs ${
                  hotspotStyle === 'minimal'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Subtle Glowing Dots"
              >
                Dots
              </button>
              <button
                onClick={() => onHotspotStyleChange('ocr')}
                className={`px-2.5 py-1 rounded-lg transition text-xs ${
                  hotspotStyle === 'ocr'
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
                title="Show Verbatim Transcribed OCR Text"
              >
                OCR Text
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border border-indigo-400/30 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95 min-h-[38px]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Flyer</span>
              <span className="sm:hidden">Upload</span>
            </button>

            {/* Shopping List Button (Desktop / Tablet) */}
            <button
              onClick={onOpenShoppingList}
              className="hidden sm:flex relative items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border border-emerald-400/30 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition active:scale-95 min-h-[38px]"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Trip List</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Bar (Dropdown) */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-3 pt-1 border-t border-slate-800 animate-in slide-in-from-top duration-150 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, brands, prices..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                onSearchChange('');
              }}
              className="p-2 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
