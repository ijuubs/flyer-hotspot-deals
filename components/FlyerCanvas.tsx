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
  Trash2,
  Scan,
  BoxSelect,
  Merge,
  ShoppingCart,
  X,
  CheckSquare,
  FolderPlus,
  Upload
} from 'lucide-react';
import { Flyer, ProductDetail, HotspotCluster } from '@/types/flyer';
import { autoGroupAdjacentProducts, isBoxIntersecting } from '@/lib/clusterUtils';

interface FlyerCanvasProps {
  flyer: Flyer | null;
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
  onEditProduct?: (product: ProductDetail) => void;
  onBulkRecategorize?: (productIds: string[], newCategory: string) => void;
  onApplyDetectedHotspots?: (products: ProductDetail[], categories?: string[]) => void;
  isAdminMode?: boolean;
  onOpenUpload?: () => void;
  onLoadSampleFlyer?: () => void;
  onDeleteFlyer?: (flyerId: string) => void;
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
  onEditProduct,
  onBulkRecategorize,
  onApplyDetectedHotspots,
  isAdminMode = false,
  onOpenUpload,
  onLoadSampleFlyer,
  onDeleteFlyer,
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

  // Visual AI Vision Laser Scanner Overlay State
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Gemini 3.8 Deep Vision OCR Active Detection State
  const [isOcrDetecting, setIsOcrDetecting] = useState<boolean>(false);
  const [ocrStatusText, setOcrStatusText] = useState<string>('');
  const [ocrSuccessCount, setOcrSuccessCount] = useState<number | null>(null);

  // Trigger 2.2s visual scanning animation
  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 400);
          return 100;
        }
        return prev + 5;
      });
    }, 90);
  };

  // Perform Deep Gemini 3.8 Vision OCR scan to detect ALL deal bounding boxes/tiles
  const handleRunDeepOcrScan = async () => {
    if (isOcrDetecting || !flyer) return;
    setIsOcrDetecting(true);
    setIsScanning(true);
    setScanProgress(15);
    setOcrStatusText('Transmitting flyer image to Gemini 3.8 Vision OCR...');

    let progressTimer: NodeJS.Timeout | null = null;
    let stepTimer1: NodeJS.Timeout | null = null;
    let stepTimer2: NodeJS.Timeout | null = null;

    try {
      progressTimer = setInterval(() => {
        setScanProgress((prev) => Math.min(prev + 8, 88));
      }, 350);

      stepTimer1 = setTimeout(() => {
        setOcrStatusText('Scanning modular deal tiles, starburst badges & price tags...');
      }, 700);

      stepTimer2 = setTimeout(() => {
        setOcrStatusText('Detecting bounding boxes & transcribing verbatim OCR text...');
      }, 1500);

      const res = await fetch('/api/analyze-flyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: flyer.imageUrl,
          flyerTitle: flyer.title,
          storeName: flyer.store,
          sensitivityLevel: 'high',
        }),
      });

      if (progressTimer) clearInterval(progressTimer);
      setScanProgress(100);

      if (res.ok) {
        const data = await res.json();
        if (data?.flyer?.products && data.flyer.products.length > 0) {
          if (onApplyDetectedHotspots) {
            onApplyDetectedHotspots(data.flyer.products, data.flyer.categories);
          }
          setOcrSuccessCount(data.flyer.products.length);
          setTimeout(() => setOcrSuccessCount(null), 5000);
        }
      }
    } catch (err) {
      console.warn('Deep OCR detection error:', err);
    } finally {
      if (progressTimer) clearInterval(progressTimer);
      if (stepTimer1) clearTimeout(stepTimer1);
      if (stepTimer2) clearTimeout(stepTimer2);
      setTimeout(() => {
        setIsOcrDetecting(false);
        setIsScanning(false);
      }, 500);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const timer = setTimeout(() => {
      setIsScanning(true);
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsScanning(false), 400);
            return 100;
          }
          return prev + 5;
        });
      }, 90);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [flyer?.id]);

  // Spatial Auto-Grouping Clusters state
  const [isClusterMode, setIsClusterMode] = useState<boolean>(false);
  const [selectedCluster, setSelectedCluster] = useState<HotspotCluster | null>(null);

  // Multi-Select Lasso Mode state
  const [isLassoMode, setIsLassoMode] = useState<boolean>(false);
  const [isLassoDragging, setIsLassoDragging] = useState<boolean>(false);
  const [lassoStart, setLassoStart] = useState<{ x: number; y: number } | null>(null);
  const [lassoCurrent, setLassoCurrent] = useState<{ x: number; y: number } | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showRecategorizeMenu, setShowRecategorizeMenu] = useState<boolean>(false);

  // Automatically compute spatial clusters when cluster mode is enabled
  const clusters = React.useMemo(() => {
    return isClusterMode && flyer ? autoGroupAdjacentProducts(flyer.products) : [];
  }, [isClusterMode, flyer]);

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
    if (selectedProductId && flyer?.products) {
      const prod = flyer.products.find((p) => p.id === selectedProductId);
      if (prod && containerRef.current && zoom > 1) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const targetX = -((prod.box.x + prod.box.width / 2) / 100 * containerWidth * zoom - containerWidth / 2);
        const targetY = -((prod.box.y + prod.box.height / 2) / 100 * containerHeight * zoom - containerHeight / 2);
        setPan({ x: targetX, y: targetY });
      }
    }
  }, [selectedProductId, flyer?.products, zoom]);

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

  if (!flyer) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-slate-950 font-sans">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-center mb-5 shadow-2xl">
          <Upload className="w-10 h-10 stroke-[1.75]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">No Flyer Currently Active</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
          All mock data and uploaded flyers have been deleted. Upload your retail flyer to map deal zones and extract OCR pricing, or load the attached Joy&apos;s of the Table flyer.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/25 transition active:scale-95 flex items-center gap-2 min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Flyer Image</span>
            </button>
          )}
          {onLoadSampleFlyer && (
            <button
              onClick={onLoadSampleFlyer}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition active:scale-95 flex items-center gap-2 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Load Joy&apos;s of the Table</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none font-sans">
      {/* Top Banner Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-300 z-10 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
          <span className="font-semibold text-white truncate text-xs">{flyer.store}</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden md:inline truncate">{flyer.validity}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            {flyer.products.length} Hotspots
          </span>
          {onDeleteFlyer && (
            <button
              onClick={() => {
                if (confirm(`Delete "${flyer.title}" from catalog?`)) {
                  onDeleteFlyer(flyer.id);
                }
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete this flyer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls: Auto-Detect Hotspots, AI Vision Sweep, Auto-Group, Lasso Select, Draw & Zoom */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Gemini 3.8 Deep Vision OCR Auto-Detect Hotspots Button */}
          {onApplyDetectedHotspots && (
            <button
              onClick={handleRunDeepOcrScan}
              disabled={isOcrDetecting}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1 sm:gap-1.5 shadow min-h-[32px] ${
                isOcrDetecting
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 ring-2 ring-emerald-300 animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 active:scale-95'
              }`}
              title="Run Gemini 3.8 Vision OCR to detect all deal tiles and set hotspot zones across the entire flyer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isOcrDetecting ? 'animate-spin' : 'text-slate-950'}`} />
              <span className="hidden sm:inline">{isOcrDetecting ? 'Detecting Tiles...' : 'Auto-Detect Hotspots'}</span>
              <span className="sm:hidden">{isOcrDetecting ? 'Detecting...' : 'Auto-Detect'}</span>
            </button>
          )}

          {/* AI Vision Sweep Re-Scan Trigger */}
          <button
            onClick={handleTriggerScan}
            disabled={isScanning || isOcrDetecting}
            className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 shadow min-h-[32px] ${
              isScanning && !isOcrDetecting
                ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-300 animate-pulse'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
            }`}
            title="Trigger tactile AI Vision laser scanner effect"
          >
            <Scan className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">{isScanning && !isOcrDetecting ? `Scanning ${scanProgress}%` : 'Sweep'}</span>
          </button>

          {/* Spatial Auto-Group Clusters Button */}
          <button
            onClick={() => {
              setIsClusterMode(!isClusterMode);
              if (isLassoMode) setIsLassoMode(false);
            }}
            className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 shadow min-h-[32px] ${
              isClusterMode
                ? 'bg-indigo-600 text-white font-black ring-2 ring-indigo-300'
                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
            }`}
            title="Toggle spatial auto-grouping algorithm to merge adjacent products into cluster zones"
          >
            <Merge className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isClusterMode ? 'Clusters Active' : 'Auto-Group'}</span>
          </button>

          {/* Lasso Multi-Select Button */}
          <button
            onClick={() => {
              setIsLassoMode(!isLassoMode);
              if (isDrawMode) setIsDrawMode(false);
            }}
            className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 shadow min-h-[32px] ${
              isLassoMode
                ? 'bg-cyan-400 text-slate-950 font-black ring-2 ring-cyan-200 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
            }`}
            title="Drag a selection box around multiple hotspots to perform bulk actions"
          >
            <BoxSelect className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isLassoMode ? 'Lasso Active' : 'Lasso Select'}</span>
          </button>

          {onAddProductHotspot && (
            <button
              onClick={() => {
                setIsDrawMode(!isDrawMode);
                if (isLassoMode) setIsLassoMode(false);
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 shadow min-h-[32px] ${
                isDrawMode
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
              }`}
              title="Click and drag on flyer image to draw a custom product box"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDrawMode ? 'Drawing Box...' : 'Draw Hotspot'}</span>
              <span className="sm:hidden">{isDrawMode ? 'Drawing...' : 'Draw'}</span>
            </button>
          )}

          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-800/90 border border-slate-700/80 rounded-xl p-0.5 shadow-sm">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.75}
              className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition min-w-[28px] min-h-[28px] flex items-center justify-center"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="hidden sm:inline px-1.5 sm:px-2 text-[11px] font-mono text-slate-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 2.5}
              className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition min-w-[28px] min-h-[28px] flex items-center justify-center"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition min-w-[28px] min-h-[28px] flex items-center justify-center"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    {/* OCR Detection Success Banner */}
    {ocrSuccessCount !== null && (
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/95 border border-emerald-400/80 text-emerald-200 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 max-w-[92vw] sm:max-w-max">
        <div className="p-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
        </div>
        <span className="text-xs font-bold text-white truncate">
          Gemini 3.8 Vision OCR detected <strong className="text-emerald-400 font-extrabold">{ocrSuccessCount} deal tiles</strong> and mapped all hotspot zones!
        </span>
        <button
          onClick={() => setOcrSuccessCount(null)}
          className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-900/60 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )}

    {/* Admin Hotspot Editor Mode Active Banner */}
    {isAdminMode && (
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-amber-950/95 border border-amber-500/60 text-amber-200 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 max-w-[92vw] sm:max-w-max">
        <div className="flex items-center gap-2">
          <Crop className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <span className="text-xs font-bold text-white truncate">
            Admin Hotspot Editor Active: Click any box to edit meta or draw new zones
          </span>
        </div>
        {onAddProductHotspot && (
          <button
            onClick={() => setIsDrawMode(!isDrawMode)}
            className={`px-2.5 py-1 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow ${
              isDrawMode
                ? 'bg-amber-400 text-slate-950 ring-2 ring-white animate-pulse'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isDrawMode ? 'Drawing...' : 'Draw New Box'}</span>
          </button>
        )}
      </div>
    )}

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

          {/* Tactile Visual Laser Scanner Overlay */}
          {isScanning && (
            <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden rounded-xl bg-slate-950/30 backdrop-blur-[1px] animate-in fade-in duration-150">
              {/* Cyberpunk Grid Overlay */}
              <div className="absolute inset-0 hud-grid-overlay opacity-30 animate-grid-pulse" />

              {/* Moving Laser Beam Line */}
              <div 
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent cyber-laser-glow animate-laser-sweep z-30"
              />

              {/* Secondary Cyan Beam Line */}
              <div 
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent cyber-cyan-glow animate-laser-sweep z-30"
                style={{ animationDelay: '0.4s' }}
              />

              {/* Target Bounding Reticles */}
              {flyer.products.map((p, pIdx) => (
                <div
                  key={`scan-reticle-${p.id}`}
                  style={{
                    left: `${p.box.x}%`,
                    top: `${p.box.y}%`,
                    width: `${p.box.width}%`,
                    height: `${p.box.height}%`,
                  }}
                  className="absolute border border-dashed border-emerald-400/80 bg-emerald-500/10 rounded-lg animate-target-ping"
                >
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-300" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-300" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-300" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-300" />
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-bold text-emerald-300 bg-slate-950/90 px-1 rounded shadow">
                    Zone #{pIdx + 1}
                  </span>
                </div>
              ))}

              {/* Floating Tactical HUD Badge Banner */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border border-emerald-500/60 text-emerald-300 px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-[94vw]">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                  <Scan className="w-4 h-4 animate-pulse text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {isOcrDetecting ? 'Gemini 3.8 Vision OCR Active' : 'AI Deep Vision Scan Active'}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {scanProgress}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{isOcrDetecting && ocrStatusText ? ocrStatusText : `Analyzing ${flyer.products.length} Hotspot Zones`}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-emerald-400 font-bold hidden sm:inline">OCR Spatial Geometry Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lasso Multi-Select Canvas Overlay */}
          {isLassoMode && (
            <div
              className="absolute inset-0 z-40 cursor-crosshair bg-cyan-950/10"
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                setLassoStart({ x, y });
                setLassoCurrent({ x, y });
                setIsLassoDragging(true);
              }}
              onMouseMove={(e) => {
                if (!isLassoDragging || !lassoStart) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                setLassoCurrent({ x, y });

                const lassoBox = {
                  x: Math.min(lassoStart.x, x),
                  y: Math.min(lassoStart.y, y),
                  width: Math.abs(x - lassoStart.x),
                  height: Math.abs(y - lassoStart.y),
                };

                const matchedIds = flyer.products
                  .filter((p) => isBoxIntersecting(p.box, lassoBox))
                  .map((p) => p.id);

                setSelectedProductIds(new Set(matchedIds));
              }}
              onMouseUp={() => {
                setIsLassoDragging(false);
                setLassoStart(null);
                setLassoCurrent(null);
              }}
            >
              {isLassoDragging && lassoStart && lassoCurrent && (
                <div
                  style={{
                    left: `${Math.min(lassoStart.x, lassoCurrent.x)}%`,
                    top: `${Math.min(lassoStart.y, lassoCurrent.y)}%`,
                    width: `${Math.abs(lassoCurrent.x - lassoStart.x)}%`,
                    height: `${Math.abs(lassoCurrent.y - lassoStart.y)}%`,
                  }}
                  className="absolute border-2 border-cyan-400 bg-cyan-400/20 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.5)] animate-pulse pointer-events-none flex items-center justify-center"
                >
                  <span className="text-[10px] font-mono font-black text-cyan-200 bg-slate-950/90 px-2 py-0.5 rounded-full border border-cyan-400">
                    Selecting ({selectedProductIds.size})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Spatial Auto-Group Cluster Zones Overlay */}
          {isClusterMode && clusters.length > 0 && (
            <div className="absolute inset-0 z-20 pointer-events-auto">
              {clusters.map((cluster) => {
                const isSelected = selectedCluster?.id === cluster.id;
                return (
                  <div
                    key={cluster.id}
                    style={{
                      left: `${cluster.box.x}%`,
                      top: `${cluster.box.y}%`,
                      width: `${cluster.box.width}%`,
                      height: `${cluster.box.height}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCluster(cluster);
                      setSelectedProductIds(new Set(cluster.productIds));
                    }}
                    className={`absolute border-2 rounded-xl transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500/30 ring-4 ring-indigo-400/50 shadow-[0_0_25px_rgba(99,102,241,0.6)]'
                        : 'border-indigo-500/80 bg-indigo-950/30 hover:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                    }`}
                  >
                    <div className="absolute -top-3.5 left-2 z-30 flex items-center gap-1.5 bg-indigo-950 border border-indigo-400/80 text-indigo-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-lg">
                      <Merge className="w-3 h-3 text-indigo-400" />
                      <span>{cluster.name}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-mono text-[9px]">
                        {cluster.productIds.length} deals
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
              {flyer.products.map((product, idx) => {
                const matches = isProductMatching(product);
                const isSelected = selectedProductId === product.id;
                const isMultiSelected = selectedProductIds.has(product.id);
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
                    key={`${product.id}-${idx}`}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isLassoMode || e.shiftKey) {
                        setSelectedProductIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(product.id)) next.delete(product.id);
                          else next.add(product.id);
                          return next;
                        });
                      } else {
                        onSelectProduct(product);
                      }
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
                      isMultiSelected
                        ? 'ring-4 ring-cyan-400 bg-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.6)] z-30'
                        : isSelected
                        ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 z-30'
                        : 'z-20'
                    }`}
                  >
                    {/* Multi-selected checkbox badge */}
                    {isMultiSelected && (
                      <div className="absolute -top-2 -left-2 z-40 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg border border-white animate-bounce">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

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

                    {/* Admin Hotspot Edit & Delete Badge Overlay */}
                    {(isAdminMode || onEditProduct) && (
                      <div className="absolute -top-3 right-1 z-40 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        {onEditProduct && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProduct(product);
                            }}
                            className="px-2 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[9px] shadow-lg transition flex items-center gap-0.5 border border-slate-900"
                            title="Edit product meta, price, and bounding box"
                          >
                            <span>Edit</span>
                          </button>
                        )}
                        {onDeleteProductHotspot && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProductHotspot(product.id);
                            }}
                            className="p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition"
                            title="Delete this hotspot box"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
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

      {/* Floating Bottom Bulk Action Toolbar Bar */}
      {selectedProductIds.size > 0 && (
        <div className="absolute bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-cyan-500/60 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-[95vw] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-300 pr-2 border-r border-slate-700">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>{selectedProductIds.size} Hotspots Selected</span>
          </div>

          {/* Add All to Cart */}
          <button
            onClick={() => {
              flyer.products
                .filter((p) => selectedProductIds.has(p.id))
                .forEach((p) => onAddToCart(p));
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition shadow flex items-center gap-1.5 active:scale-95 min-h-[32px]"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add All to Cart</span>
          </button>

          {/* Group Selected into Cluster */}
          <button
            onClick={() => {
              setIsClusterMode(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow flex items-center gap-1.5 active:scale-95 min-h-[32px]"
          >
            <Merge className="w-3.5 h-3.5" />
            <span>Group Selected</span>
          </button>

          {/* Bulk Re-Categorize Menu Toggle */}
          {onBulkRecategorize && (
            <div className="relative">
              <button
                onClick={() => setShowRecategorizeMenu(!showRecategorizeMenu)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition shadow flex items-center gap-1.5 min-h-[32px]"
              >
                <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Re-Categorize</span>
              </button>

              {showRecategorizeMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 py-1 backdrop-blur-md">
                  {['Meat & Poultry', 'Produce', 'Beverages & Spirits', 'Snacks & Bakery', 'Dairy & Frozen', 'Pantry & Essentials', 'General'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onBulkRecategorize(Array.from(selectedProductIds), cat);
                        setShowRecategorizeMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-300 font-medium transition"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bulk Delete Hotspots */}
          {onDeleteProductHotspot && (
            <button
              onClick={() => {
                Array.from(selectedProductIds).forEach((id) => onDeleteProductHotspot(id));
                setSelectedProductIds(new Set());
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition shadow flex items-center gap-1.5 min-h-[32px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          )}

          {/* Clear Selection */}
          <button
            onClick={() => {
              setSelectedProductIds(new Set());
              if (isLassoMode) setIsLassoMode(false);
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
