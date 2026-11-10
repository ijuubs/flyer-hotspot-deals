'use client';

import React from 'react';
import { 
  Layers, 
  ShoppingBag, 
  Upload, 
  Search, 
  Crop, 
  SlidersHorizontal,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'canvas' | 'products' | 'cart';
  onChangeTab: (tab: 'canvas' | 'products' | 'cart') => void;
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
  totalSavings,
  showHotspots,
  onToggleHotspots,
  onOpenSearch,
}: MobileBottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 text-slate-400 px-3 py-1.5 shadow-[0_-8px_20px_rgba(0,0,0,0.4)] safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Flyer Canvas Tab */}
        <button
          onClick={() => onChangeTab('canvas')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
            activeTab === 'canvas'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Flyer</span>
        </button>

        {/* Products Directory Tab */}
        <button
          onClick={() => onChangeTab('products')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
            activeTab === 'products'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Deals</span>
        </button>

        {/* Upload Button (Center highlighted action) */}
        <button
          onClick={onOpenUpload}
          className="flex flex-col items-center justify-center -mt-4 py-1 px-2 transition min-w-[56px]"
          title="Upload or Scan Flyer"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 border-2 border-slate-900">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-slate-300 mt-0.5">Upload</span>
        </button>

        {/* Hotspots Toggle */}
        <button
          onClick={onToggleHotspots}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] ${
            showHotspots
              ? 'text-emerald-400'
              : 'text-slate-500'
          }`}
          title="Toggle Hotspots"
        >
          {showHotspots ? (
            <Eye className="w-5 h-5 mb-0.5" />
          ) : (
            <EyeOff className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[10px]">Zones</span>
        </button>

        {/* Shopping Trip List */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] min-h-[48px] relative text-slate-400 hover:text-white"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[9px] flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Trip List</span>
        </button>
      </div>
    </nav>
  );
}
