'use client';

import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Store, 
  Calendar,
  Tag,
  Maximize2
} from 'lucide-react';
import { Flyer, ProductDetail } from '@/types/flyer';
import FlyerCanvas from './FlyerCanvas';

interface FlyerPopUpViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  flyers: Flyer[];
  initialFlyerId: string;
  onSelectProduct: (product: ProductDetail) => void;
  selectedProductId?: string;
  searchQuery: string;
  selectedCategory: string;
  hotspotStyle: 'pins' | 'boxes' | 'minimal' | 'ocr';
  onHotspotStyleChange: (style: 'pins' | 'boxes' | 'minimal' | 'ocr') => void;
  showHotspots: boolean;
  onToggleShowHotspots: () => void;
  onAddToCart: (product: ProductDetail) => void;
  cartProductIds: Set<string>;
  onOpenCropModal?: (product: ProductDetail) => void;
  onAddProductHotspot?: (box: { x: number; y: number; width: number; height: number }) => void;
  onDeleteProductHotspot?: (productId: string) => void;
  onAcceptAutoCropCandidate?: (productId: string) => void;
  onAcceptAllAutoCropCandidates?: () => void;
}

export default function FlyerPopUpViewerModal({
  isOpen,
  onClose,
  flyers,
  initialFlyerId,
  onSelectProduct,
  selectedProductId,
  searchQuery,
  selectedCategory,
  hotspotStyle,
  onHotspotStyleChange,
  showHotspots,
  onToggleShowHotspots,
  onAddToCart,
  cartProductIds,
  onOpenCropModal,
  onAddProductHotspot,
  onDeleteProductHotspot,
  onAcceptAutoCropCandidate,
  onAcceptAllAutoCropCandidates,
}: FlyerPopUpViewerModalProps) {
  // Find current index based on initialFlyerId
  const initialIndex = Math.max(
    0,
    flyers.findIndex((f) => f.id === initialFlyerId)
  );

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

  if (!isOpen || flyers.length === 0) return null;

  const currentFlyer = flyers[currentIndex] || flyers[0];

  const handlePrevPage = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flyers.length - 1));
  };

  const handleNextPage = () => {
    setCurrentIndex((prev) => (prev < flyers.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Pagination & Header Navigation Bar */}
      <div className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 z-30 shrink-0 shadow-lg">
        {/* Left Store & Flyer Info */}
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 p-0.5 shrink-0 hidden sm:block">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                {currentFlyer.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                {currentFlyer.products.length} Hotspots
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
              <span>{currentFlyer.store}</span>
              <span>•</span>
              <span>{currentFlyer.validity}</span>
            </div>
          </div>
        </div>

        {/* Center Pagination Controls */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-2xl px-2 py-1 shadow-inner">
          <button
            onClick={handlePrevPage}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition min-w-[34px] min-h-[34px] flex items-center justify-center"
            title="Previous Flyer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-2 text-xs font-mono font-bold text-white flex items-center gap-1.5">
            <span className="text-emerald-400">Flyer {currentIndex + 1}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{flyers.length}</span>
          </div>

          <button
            onClick={handleNextPage}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition min-w-[34px] min-h-[34px] flex items-center justify-center"
            title="Next Flyer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools & Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Hotspot Style Selector (Desktop) */}
          <div className="hidden lg:flex items-center bg-slate-800/80 border border-slate-700 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => onHotspotStyleChange('pins')}
              className={`px-2.5 py-1 rounded-lg transition text-xs ${
                hotspotStyle === 'pins'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pins
            </button>
            <button
              onClick={() => onHotspotStyleChange('boxes')}
              className={`px-2.5 py-1 rounded-lg transition text-xs ${
                hotspotStyle === 'boxes'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Zones
            </button>
            <button
              onClick={() => onHotspotStyleChange('minimal')}
              className={`px-2.5 py-1 rounded-lg transition text-xs ${
                hotspotStyle === 'minimal'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dots
            </button>
            <button
              onClick={() => onHotspotStyleChange('ocr')}
              className={`px-2.5 py-1 rounded-lg transition text-xs ${
                hotspotStyle === 'ocr'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              OCR
            </button>
          </div>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Close Pop-up Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Flyer Pop-up Canvas */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-950">
        <FlyerCanvas
          key={currentFlyer.id}
          flyer={currentFlyer}
          onSelectProduct={onSelectProduct}
          selectedProductId={selectedProductId}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          hotspotStyle={hotspotStyle}
          showHotspots={showHotspots}
          onAddToCart={onAddToCart}
          cartProductIds={cartProductIds}
          onOpenCropModal={onOpenCropModal}
          onAddProductHotspot={onAddProductHotspot}
          onDeleteProductHotspot={onDeleteProductHotspot}
          onAcceptAutoCropCandidate={onAcceptAutoCropCandidate}
          onAcceptAllAutoCropCandidates={onAcceptAllAutoCropCandidates}
        />
      </div>

      {/* Bottom Page Thumbnail Strip Carousel */}
      {flyers.length > 1 && (
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-2 z-30 shrink-0 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
            Flyer Pages:
          </span>
          {flyers.map((f, idx) => (
            <button
              key={f.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition whitespace-nowrap min-h-[36px] ${
                idx === currentIndex
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md ring-1 ring-emerald-500/40'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="truncate max-w-[140px]">{f.title}</span>
              <span className="text-[10px] font-mono text-slate-400 px-1 py-0.2 rounded bg-slate-950">
                {f.products.length} deals
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
