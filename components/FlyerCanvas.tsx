'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Sparkles, 
  Check, 
  Plus, 
  Tag, 
  ArrowRight, 
  TrendingDown, 
  Layers, 
  Info,
  Crop,
  Crosshair,
  Trash2
} from 'lucide-react';
import { Flyer, ProductDetail } from '@/types/flyer';

interface FlyerCanvasProps {
  flyer: Flyer;
  onSelectProduct: (product: ProductDetail) => void;
  selectedProductId?: string;
  searchQuery: string;
  selectedCategory: string;
  hotspotStyle: 'pins' | 'boxes' | 'minimal' | 'ocr';
  showHotspots: boolean;
  onAddToCart: (product: ProductDetail) => void;
  cartProductIds: Set<string>;
  onOpenCropModal?: (product: ProductDetail) => void;
  onAddProductHotspot?: (box: { x: number; y: number; width: number; height: number }) => void;
  onDeleteProductHotspot?: (productId: string) => void;
  onAcceptAutoCropCandidate?: (productId: string) => void;
  onAcceptAllAutoCropCandidates?: () => void;
}

export default function FlyerCanvas({
  flyer,
  onSelectProduct,
  selectedProductId,
  searchQuery,
  selectedCategory,
  hotspotStyle,
  showHotspots,
  onAddToCart,
  cartProductIds,
  onOpenCropModal,
  onAddProductHotspot,
  onDeleteProductHotspot,
  onAcceptAutoCropCandidate,
  onAcceptAllAutoCropCandidates,
}: FlyerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredProduct, setHoveredProduct] = useState<ProductDetail | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // AI Auto-Crop Suggestions toggle
  const [showAutoCropSuggestions, setShowAutoCropSuggestions] = useState<boolean>(true);

  // Custom Bounding Box Drawing Mode
  const [isDrawMode, setIsDrawMode] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  // Touch gesture support (pinch-to-zoom & single-finger pan)
  const touchStartRef = useRef<{ dist: number; panX: number; panY: number; touchX: number; touchY: number } | null>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two finger pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      touchStartRef.current = { dist, panX: pan.x, panY: pan.y, touchX: (e.touches[0].clientX + e.touches[1].clientX) / 2, touchY: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
    } else if (e.touches.length === 1 && zoom > 1) {
      // Single finger drag when zoomed
      touchStartRef.current = { dist: 0, panX: pan.x, panY: pan.y, touchX: e.touches[0].clientX, touchY: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 2) {
      // Pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / touchStartRef.current.dist;
      setZoom((prev) => Math.min(2.5, Math.max(0.75, prev * ratio)));
      touchStartRef.current.dist = dist;
    } else if (e.touches.length === 1 && zoom > 1) {
      // Drag pan
      const deltaX = e.touches[0].clientX - touchStartRef.current.touchX;
      const deltaY = e.touches[0].clientY - touchStartRef.current.touchY;
      setPan({
        x: touchStartRef.current.panX + deltaX,
        y: touchStartRef.current.panY + deltaY,
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  // Center on a specific product when selected
  useEffect(() => {
    if (selectedProductId) {
      const prod = flyer.products.find((p) => p.id === selectedProductId);
      if (prod && containerRef.current && zoom > 1) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const targetX = -((prod.box.x + prod.box.width / 2) / 100 * containerWidth * zoom - containerWidth / 2);
        const targetY = -((prod.box.y + prod.box.height / 2) / 100 * containerHeight * zoom - containerHeight / 2);
        setPan({ x: targetX, y: targetY });
      }
    }
  }, [selectedProductId, flyer.products, zoom]);

  // Filter products by category and search
  const isProductMatching = (product: ProductDetail) => {
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.dealPrice.toString().includes(query)
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Top Banner Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-300 z-10 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
          <span className="font-semibold text-white truncate text-xs">{flyer.store}</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden md:inline truncate">{flyer.validity}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            {flyer.products.length} Hotspots
          </span>
        </div>

        {/* Draw Custom Hotspot & Zoom Controls */}
        <div className="flex items-center gap-2">
          {onAddProductHotspot && (
            <button
              onClick={() => setIsDrawMode(!isDrawMode)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow min-h-[32px] ${
                isDrawMode
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
              }`}
              title="Click and drag on flyer image to draw a custom product box"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{isDrawMode ? 'Drawing Box...' : 'Draw Hotspot'}</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-xl p-0.5 shadow-sm">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.75}
            className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition min-w-[30px] min-h-[30px] flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 sm:px-2 text-[11px] font-mono text-slate-200">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 2.5}
            className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition min-w-[30px] min-h-[30px] flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition min-w-[30px] min-h-[30px] flex items-center justify-center"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    {/* AI Auto-Crop Suggestions Floating Banner */}
    {showAutoCropSuggestions && flyer.products.some((p) => p.isCandidate) && (
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border border-cyan-500/50 text-cyan-200 px-3.5 py-2 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 max-w-[92vw] sm:max-w-max">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow shrink-0" />
          <span className="text-xs font-semibold text-white truncate">
            AI Auto-Crop: <span className="text-cyan-400 font-bold">{flyer.products.filter((p) => p.isCandidate).length} candidate box(es)</span> detected
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onAcceptAllAutoCropCandidates && (
            <button
              onClick={onAcceptAllAutoCropCandidates}
              className="px-2.5 py-1 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs transition shadow flex items-center gap-1 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept All</span>
            </button>
          )}
          <button
            onClick={() => setShowAutoCropSuggestions(false)}
            className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    )}

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 w-full h-full overflow-auto flex items-center justify-center p-1 sm:p-4 md:p-6 pb-20 lg:pb-6 cursor-${
          isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative max-w-full inline-block shadow-2xl rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900 touch-pan-x touch-pan-y"
        >
          {/* Flyer Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flyer.imageUrl}
            alt={flyer.title}
            className="block w-auto max-h-[76vh] sm:max-h-[82vh] object-contain pointer-events-none mx-auto"
            draggable={false}
          />

          {/* Active Drawing Mode Canvas Overlay */}
          {isDrawMode && (
            <div
              className="absolute inset-0 z-40 cursor-crosshair bg-slate-950/20"
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                setDrawStart({ x, y });
                setDrawCurrent({ x, y });
                setIsDrawing(true);
              }}
              onMouseMove={(e) => {
                if (!isDrawing) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                setDrawCurrent({ x, y });
              }}
              onMouseUp={() => {
                if (isDrawing && drawStart && drawCurrent && onAddProductHotspot) {
                  const x = Math.min(drawStart.x, drawCurrent.x);
                  const y = Math.min(drawStart.y, drawCurrent.y);
                  const width = Math.abs(drawCurrent.x - drawStart.x);
                  const height = Math.abs(drawCurrent.y - drawStart.y);
                  if (width > 2 && height > 2) {
                    onAddProductHotspot({
                      x: Math.round(x * 10) / 10,
                      y: Math.round(y * 10) / 10,
                      width: Math.round(width * 10) / 10,
                      height: Math.round(height * 10) / 10,
                    });
                    setIsDrawMode(false);
                  }
                }
                setIsDrawing(false);
                setDrawStart(null);
                setDrawCurrent(null);
              }}
            >
              {isDrawing && drawStart && drawCurrent && (
                <div
                  style={{
                    left: `${Math.min(drawStart.x, drawCurrent.x)}%`,
                    top: `${Math.min(drawStart.y, drawCurrent.y)}%`,
                    width: `${Math.abs(drawCurrent.x - drawStart.x)}%`,
                    height: `${Math.abs(drawCurrent.y - drawStart.y)}%`,
                  }}
                  className="absolute border-2 border-amber-400 bg-amber-400/25 rounded shadow-2xl flex items-center justify-center text-amber-200 font-mono text-xs font-bold animate-pulse"
                >
                  Release to Save Box
                </div>
              )}
            </div>
          )}

          {/* Hotspot Overlays */}
          {showHotspots && (
            <div className="absolute inset-0 z-10 pointer-events-auto">
              {flyer.products.map((product) => {
                const matches = isProductMatching(product);
                const isSelected = selectedProductId === product.id;
                const isInCart = cartProductIds.has(product.id);
                const { box } = product;

                let accentColor = 'emerald';
                let accentBorder = 'border-emerald-500';
                let accentBg = 'bg-emerald-500';
                let accentBadge = 'bg-emerald-600';

                if (product.category.includes('Meat') || product.category.includes('Butcher') || product.category.includes('Poultry')) {
                  accentColor = 'rose';
                  accentBorder = 'border-rose-500';
                  accentBg = 'bg-rose-500';
                  accentBadge = 'bg-rose-600';
                } else if (product.category.includes('Produce') || product.category.includes('Fruit')) {
                  accentColor = 'amber';
                  accentBorder = 'border-amber-500';
                  accentBg = 'bg-amber-500';
                  accentBadge = 'bg-amber-600';
                } else if (product.category.includes('Beverage') || product.category.includes('Spirits')) {
                  accentColor = 'blue';
                  accentBorder = 'border-blue-500';
                  accentBg = 'bg-blue-500';
                  accentBadge = 'bg-blue-600';
                } else if (product.category.includes('Fireworks') || product.category.includes('Cake') || product.category.includes('Novelties')) {
                  accentColor = 'purple';
                  accentBorder = 'border-purple-500';
                  accentBg = 'bg-purple-500';
                  accentBadge = 'bg-purple-600';
                }

                return (
                  <div
                    key={product.id}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(product);
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoverPosition({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                      setHoveredProduct(product);
                    }}
                    onMouseLeave={() => setHoveredProduct(null)}
                    className={`group absolute transition-all duration-200 cursor-pointer min-w-[36px] min-h-[36px] ${
                      matches ? 'opacity-100' : 'opacity-20 hover:opacity-80'
                    } ${
                      isSelected
                        ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 z-30'
                        : 'z-20'
                    }`}
                  >
                    {/* AI Candidate Glowing Border & Accept Button */}
                    {product.isCandidate && showAutoCropSuggestions && (
                      <div className="absolute -inset-1 border-2 border-dashed border-cyan-400 bg-cyan-950/40 rounded-xl animate-pulse pointer-events-none z-30 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                        <div className="absolute -top-3 left-1 z-40 flex items-center gap-1 pointer-events-auto">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold text-[9px] border border-cyan-500/50 flex items-center gap-1 shadow">
                            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                            <span>AI Candidate</span>
                          </span>
                          {onAcceptAutoCropCandidate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAcceptAutoCropCandidate(product.id);
                              }}
                              className="px-2 py-0.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[9px] shadow-lg transition flex items-center gap-0.5 border border-white"
                              title="Accept & lock this AI candidate box"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Style 1: Bounding Boxes (Spatial Deal Tiles) */}
                    {hotspotStyle === 'boxes' && (
                      <div
                        className={`w-full h-full rounded-lg border-2 border-dashed ${accentBorder} bg-slate-950/40 hover:bg-slate-950/70 transition-all flex flex-col justify-between p-1.5 shadow-xl backdrop-blur-[1px] relative group/box`}
                      >
                        {/* Corner markers for spatial bounding box visual alignment */}
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white rounded-tl" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white rounded-tr" />
                        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white rounded-bl" />
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white rounded-br" />

                        {/* Top Tile Index & Type Tag */}
                        <div className="flex items-center justify-between gap-1 overflow-hidden">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-300 border border-slate-700 shadow shrink-0">
                            Tile #{product.tileIndex || 1}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${accentBadge} shadow-sm truncate max-w-[65%]`}>
                            ${product.dealPrice.toFixed(2)}
                          </span>
                          {isInCart && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow shrink-0">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>

                        {/* Bottom Title & Dimensions Tag */}
                        <div className="mt-auto pt-1">
                          <div className="text-[9px] font-medium text-white bg-slate-950/90 px-1.5 py-0.5 rounded truncate backdrop-blur-sm border border-slate-800 flex items-center justify-between gap-1">
                            <span className="truncate">{product.title}</span>
                            <span className="text-[8px] font-mono text-slate-400 shrink-0 hidden sm:inline">
                              {Math.round(box.width)}x{Math.round(box.height)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Style 2: Interactive Pulsing Price Pins (Default) */}
                    {hotspotStyle === 'pins' && (
                      <div className="w-full h-full relative group-hover:scale-[1.02] transition-transform">
                        <div
                          className={`w-full h-full rounded-md border border-white/0 group-hover:border-2 ${accentBorder} group-hover:bg-white/5 transition-all`}
                        />

                        {/* Floating Hotspot Tag Pin (Touch friendly) */}
                        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-20 flex items-center">
                          <button
                            className={`flex items-center gap-1 px-2 py-0.8 sm:py-1 rounded-full text-white text-[10px] sm:text-[11px] font-bold shadow-lg transition-all transform group-hover:scale-110 active:scale-95 ${accentBadge} ring-2 ring-white/80 min-h-[28px]`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                            <span>${product.dealPrice.toFixed(2)}</span>
                            {product.discountPercent > 0 && (
                              <span className="text-[9px] font-normal opacity-90 hidden sm:inline">
                                -{product.discountPercent}%
                              </span>
                            )}
                          </button>
                        </div>

                        {/* In-cart indicator */}
                        {isInCart && (
                          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-20 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Style 3: Minimalist Glowing Dots */}
                    {hotspotStyle === 'minimal' && (
                      <div className="w-full h-full relative">
                        <div className="absolute top-2 left-2">
                          <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${accentBg} ring-4 ring-white/60 animate-pulse shadow-lg`} />
                        </div>
                      </div>
                    )}

                    {/* Style 4: Verbatim OCR Transcribed Text Overlay */}
                    {hotspotStyle === 'ocr' && (
                      <div className="w-full h-full rounded-md border border-amber-400/80 bg-slate-950/85 hover:bg-slate-950 p-1 flex flex-col justify-between backdrop-blur-sm shadow-xl transition-all">
                        <div className="flex items-center gap-1 overflow-hidden">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-ping" />
                          <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-tight truncate">
                            OCR Text
                          </span>
                        </div>
                        <div className="text-[9px] font-mono text-slate-200 line-clamp-2 leading-tight">
                          {product.rawOcrText || `${product.brand} ${product.title} $${product.dealPrice.toFixed(2)}`}
                        </div>
                        <div className="text-[8px] font-mono text-emerald-400 font-bold truncate">
                          ${product.dealPrice.toFixed(2)} {product.unit}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Micro Hover Preview Tooltip (Desktop) */}
      {hoveredProduct && (
        <div
          style={{
            position: 'fixed',
            left: `${Math.min(Math.max(hoverPosition.x - 140, 16), typeof window !== 'undefined' ? window.innerWidth - 300 : 800)}px`,
            top: `${Math.max(hoverPosition.y - 140, 70)}px`,
          }}
          className="hidden md:block pointer-events-none z-50 w-72 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border border-slate-700 shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hoveredProduct.croppedImageUrl || hoveredProduct.imageUrl || ''}
                alt={hoveredProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                  {hoveredProduct.brand}
                </span>
                {hoveredProduct.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium">
                    {hoveredProduct.badge}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white truncate leading-tight mt-0.5">
                {hoveredProduct.title}
              </h4>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-extrabold text-white">
                  ${hoveredProduct.dealPrice.toFixed(2)}
                </span>
                {hoveredProduct.originalPrice > hoveredProduct.dealPrice && (
                  <span className="text-[11px] text-slate-400 line-through">
                    ${hoveredProduct.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-[10px] text-slate-400">
                  {hoveredProduct.unit}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {hoveredProduct.similarProducts.length} Alternatives
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              Click to view <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}

      {/* Helper Footer Hint (Hidden on mobile to save viewport) */}
      <div className="hidden sm:flex px-4 py-2 bg-slate-900 border-t border-slate-800 items-center justify-between text-[11px] text-slate-400 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Tap any flyer hotspot to inspect full details, flyer crop & similar alternatives</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Pinch / Scroll to zoom</span>
          <span>•</span>
          <span>Drag to pan</span>
        </div>
      </div>
    </div>
  );
}
