'use client';

import React from 'react';
import { 
  Layers, 
  ShoppingBag, 
  Upload, 
  SlidersHorizontal,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'canvas' | 'products' | 'gallery' | 'cart';
  onChangeTab: (tab: 'canvas' | 'products' | 'gallery' | 'cart') => void;
  onOpenUpload: () => void;
  onOpenCart: () => void;
  cartCount: number;
  totalSavings: number;
  showHotspots: boolean;
  onToggleHotspots: () => void;
  onOpenSearch: () => void;
}

export default function MobileBottomNav({
  activeTab,
  onChangeTab,
  onOpenUpload,
  onOpenCart,
  cartCount,
  showHotspots,
  onToggleHotspots,
}: MobileBottomNavProps) {
  return (
    <nav 
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
      className="lg:hidden fixed bottom-2 left-2 right-2 sm:bottom-3 sm:left-4 sm:right-4 z-40 bg-slate-900/95 backdrop-blur-xl border border-slate-800 text-slate-400 px-2 pt-1.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.7)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Flyer Canvas Tab */}
        <button
          onClick={() => onChangeTab('canvas')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition min-h-[44px] ${
            activeTab === 'canvas'
              ? 'text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Canvas</span>
        </button>

        {/* Gallery Tab */}
        <button
          onClick={() => onChangeTab('gallery')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition min-h-[44px] ${
            activeTab === 'gallery'
              ? 'text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Flyers</span>
        </button>

        {/* Upload Button (Center floating action) */}
        <button
          onClick={onOpenUpload}
          className="flex flex-col items-center justify-center -mt-5 py-1 px-2 transition"
          title="Upload or Scan Flyer"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 border-2 border-slate-950 font-black">
            <Upload className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-extrabold text-slate-300 mt-0.5">Upload</span>
        </button>

        {/* Products Directory Tab */}
        <button
          onClick={() => onChangeTab('products')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition min-h-[44px] ${
            activeTab === 'products'
              ? 'text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Deals</span>
        </button>

        {/* Shopping Trip List */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-full transition min-h-[44px] relative text-slate-400 hover:text-white"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] shadow">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </button>
      </div>
    </nav>
  );
}
