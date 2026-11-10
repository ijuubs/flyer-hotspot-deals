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
  ShieldCheck,
  Menu,
  X,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Flyer } from '@/types/flyer';

interface NavbarProps {
  flyers: Flyer[];
  currentFlyer: Flyer | null;
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
  activeView: 'canvas' | 'gallery';
  onViewChange: (view: 'canvas' | 'gallery') => void;
  onOpenFlyerPopUp: (flyer: Flyer) => void;
  onOpenMobileMenu?: () => void;
  isAdminMode?: boolean;
  onToggleAdminMode?: () => void;
  onResetDatabase?: () => void;
  onDeleteAllFlyers?: () => void;
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
  activeView,
  onViewChange,
  onOpenFlyerPopUp,
  onOpenMobileMenu,
  isAdminMode = false,
  onToggleAdminMode,
  onResetDatabase,
  onDeleteAllFlyers,
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
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Top Bar Contract */}
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          
          {/* Zone 1: Single Element Brand Wordmark */}
          <div 
            onClick={() => onViewChange('canvas')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0">
              FlyerSpot <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-0.5 animate-pulse" />
            </span>
          </div>

          {/* Zone 2: Single-Line Text Links & View Selector */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
            <button
              onClick={() => onViewChange('canvas')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
                activeView === 'canvas' ? 'text-emerald-400 font-extrabold border-b-2 border-emerald-400 pb-1 -mb-1' : ''
              }`}
            >
              Interactive Canvas
            </button>

            <button
              onClick={() => onViewChange('gallery')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
                activeView === 'gallery' ? 'text-emerald-400 font-extrabold border-b-2 border-emerald-400 pb-1 -mb-1' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flyer Gallery ({flyers.length})</span>
            </button>

            {/* Flyer Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition whitespace-nowrap shrink-0 max-w-[200px]"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${currentFlyer ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span className="truncate">{currentFlyer ? currentFlyer.title : 'Select Flyer'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[70vh] overflow-y-auto">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1 border-b border-slate-800">
                    Active Catalog Flyers ({flyers.length})
                  </div>

                  {flyers.length === 0 ? (
                    <div className="py-4 text-center px-2">
                      <p className="text-xs text-slate-400">No flyers currently loaded</p>
                      <button
                        onClick={() => {
                          onOpenUpload();
                          setDropdownOpen(false);
                        }}
                        className="mt-2 text-xs text-emerald-400 font-bold hover:underline"
                      >
                        + Upload your first flyer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {flyers.map((f, idx) => (
                        <button
                          key={`nav-flyer-${f.id}-${idx}`}
                          onClick={() => {
                            onSelectFlyer(f);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition text-xs ${
                            f.id === currentFlyer?.id
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold'
                              : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div className="w-9 h-11 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f.imageUrl} alt={f.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold truncate text-white text-xs">{f.title}</div>
                            <div className="text-[10px] text-slate-400 truncate">{f.store} · {f.products.length} Hotspots</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions: Delete All Flyers or Reset Database */}
                  <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                    {onDeleteAllFlyers && (
                      <button
                        onClick={() => {
                          if (confirm('Delete all flyers and mock data from catalog?')) {
                            onDeleteAllFlyers();
                            setDropdownOpen(false);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Delete All Flyers & Mock Data</span>
                      </button>
                    )}

                    {onResetDatabase && (
                      <button
                        onClick={() => {
                          onResetDatabase();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Reset Catalog to Default</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Hotspot Toggle */}
            <button
              onClick={onToggleShowHotspots}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition text-xs font-semibold whitespace-nowrap shrink-0 ${
                showHotspots
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {showHotspots ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Hotspots</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Cart trigger */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Desktop Search Input */}
            <div className="relative hidden lg:block w-48 xl:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className={`lg:hidden p-2 rounded-xl border transition min-h-[38px] min-w-[38px] flex items-center justify-center ${
                mobileSearchOpen || searchQuery
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Search deals"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Admin Mode Switcher */}
            {onToggleAdminMode && (
              <button
                onClick={onToggleAdminMode}
                className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border whitespace-nowrap ${
                  isAdminMode
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAdminMode ? 'Admin On' : 'Admin'}</span>
              </button>
            )}

            {/* Convert / Upload Flyer CTA (Desktop/Tablet) */}
            <button
              onClick={onOpenUpload}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95 whitespace-nowrap shrink-0 min-h-[38px]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Upload Flyer</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenShoppingList}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold transition active:scale-95 whitespace-nowrap shrink-0 min-h-[38px]"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Trip List</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Drawer Trigger */}
            {onOpenMobileMenu && (
              <button
                onClick={onOpenMobileMenu}
                className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 text-emerald-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="lg:hidden px-4 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/98 animate-in slide-in-from-top-2 duration-150">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Search items, brands, discounts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
