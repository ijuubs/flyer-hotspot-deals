import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Crop, 
  Check, 
  RotateCcw, 
  Maximize2, 
  Sparkles, 
  Info,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sliders,
  Grid
} from 'lucide-react';
import { ProductDetail, HotspotBox } from '@/types/flyer';
import { cropFlyerImage } from '@/lib/cropUtils';

interface ProductCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetail;
  flyerImageUrl: string;
  onSaveCrop: (productId: string, updatedBox: HotspotBox, croppedImageUrl?: string) => void;
}

export default function ProductCropModal({
  isOpen,
  onClose,
  product,
  flyerImageUrl,
  onSaveCrop,
}: ProductCropModalProps) {
  const [box, setBox] = useState<HotspotBox>({ ...product.box });
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialBox, setInitialBox] = useState<HotspotBox>({ ...product.box });

  // Aspect ratio lock & Nudge precision
  const [selectedRatio, setSelectedRatio] = useState<'free' | '1:1' | '4:3' | '16:9' | '3:4'>('free');
  const [nudgeStep, setNudgeStep] = useState<number>(0.5);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);

  // Draw Mode state for manual click & drag bounding box definition
  const [isDrawMode, setIsDrawMode] = useState<boolean>(false);
  const [isDrawingNewBox, setIsDrawingNewBox] = useState<boolean>(false);
  const [drawStartPoint, setDrawStartPoint] = useState<{ x: number; y: number } | null>(null);

  // Mobile Loupe / Magnifier Lens position state
  const [loupeScreenPos, setLoupeScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [loupeImagePct, setLoupeImagePct] = useState<{ xPct: number; yPct: number }>({ xPct: 50, yPct: 50 });

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Generate live cropped preview whenever box changes
  useEffect(() => {
    let active = true;
    const generatePreview = async () => {
      try {
        const cropResult = await cropFlyerImage(flyerImageUrl, box, 0);
        if (active) {
          setCroppedPreview(cropResult);
        }
      } catch (e) {
        console.warn(e);
      }
    };
    generatePreview();
    return () => {
      active = false;
    };
  }, [flyerImageUrl, box]);

  if (!isOpen) return null;

  const handleContainerPointerDown = (e: React.PointerEvent) => {
    if (isDrawMode && imageContainerRef.current) {
      e.stopPropagation();
      const rect = imageContainerRef.current.getBoundingClientRect();
      const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setDrawStartPoint({ x: xPct, y: yPct });
      setIsDrawingNewBox(true);
      setLoupeScreenPos({ x: e.clientX, y: e.clientY });
      setLoupeImagePct({ xPct, yPct });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerDown = (e: React.PointerEvent, handle: string | null) => {
    if (isDrawMode) return;
    e.stopPropagation();
    setIsDragging(true);
    setActiveHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialBox({ ...box });

    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setLoupeScreenPos({ x: e.clientX, y: e.clientY });
      setLoupeImagePct({ xPct, yPct });
    }

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (isDragging || isDrawingNewBox) {
      setLoupeScreenPos({ x: e.clientX, y: e.clientY });
      setLoupeImagePct({ xPct, yPct });
    }

    if (isDrawMode && isDrawingNewBox && drawStartPoint) {
      const newX = Math.min(drawStartPoint.x, xPct);
      const newY = Math.min(drawStartPoint.y, yPct);
      const newW = Math.abs(xPct - drawStartPoint.x);
      const newH = Math.abs(yPct - drawStartPoint.y);

      if (newW > 1 && newH > 1) {
        setBox({
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
          width: Math.round(newW * 10) / 10,
          height: Math.round(newH * 10) / 10,
        });
      }
      return;
    }

    if (!isDragging) return;

    const deltaXPct = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPct = ((e.clientY - dragStart.y) / rect.height) * 100;

    setBox(() => {
      let { x, y, width, height } = initialBox;

      if (!activeHandle) {
        // Move whole box
        x = Math.max(0, Math.min(100 - width, initialBox.x + deltaXPct));
        y = Math.max(0, Math.min(100 - height, initialBox.y + deltaYPct));
      } else if (activeHandle === 'se') {
        width = Math.max(5, Math.min(100 - x, initialBox.width + deltaXPct));
        height = Math.max(5, Math.min(100 - y, initialBox.height + deltaYPct));
      } else if (activeHandle === 'sw') {
        const newX = Math.max(0, Math.min(initialBox.x + initialBox.width - 5, initialBox.x + deltaXPct));
        width = initialBox.x + initialBox.width - newX;
        x = newX;
        height = Math.max(5, Math.min(100 - y, initialBox.height + deltaYPct));
      } else if (activeHandle === 'ne') {
        const newY = Math.max(0, Math.min(initialBox.y + initialBox.height - 5, initialBox.y + deltaYPct));
        height = initialBox.y + initialBox.height - newY;
        y = newY;
        width = Math.max(5, Math.min(100 - x, initialBox.width + deltaXPct));
      } else if (activeHandle === 'nw') {
        const newX = Math.max(0, Math.min(initialBox.x + initialBox.width - 5, initialBox.x + deltaXPct));
        const newY = Math.max(0, Math.min(initialBox.y + initialBox.height - 5, initialBox.y + deltaYPct));
        width = initialBox.x + initialBox.width - newX;
        height = initialBox.y + initialBox.height - newY;
        x = newX;
        y = newY;
      } else if (activeHandle === 'n') {
        const newY = Math.max(0, Math.min(initialBox.y + initialBox.height - 2, initialBox.y + deltaYPct));
        height = initialBox.y + initialBox.height - newY;
        y = newY;
      } else if (activeHandle === 's') {
        height = Math.max(2, Math.min(100 - y, initialBox.height + deltaYPct));
      } else if (activeHandle === 'w') {
        const newX = Math.max(0, Math.min(initialBox.x + initialBox.width - 2, initialBox.x + deltaXPct));
        width = initialBox.x + initialBox.width - newX;
        x = newX;
      } else if (activeHandle === 'e') {
        width = Math.max(2, Math.min(100 - x, initialBox.width + deltaXPct));
      }

      return {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(height * 10) / 10,
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setLoupeScreenPos(null);

    if (isDrawMode && isDrawingNewBox) {
      setIsDrawingNewBox(false);
      setDrawStartPoint(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      return;
    }

    setIsDragging(false);
    setActiveHandle(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleSizeChange = (dim: 'w' | 'h', delta: number) => {
    setBox((prev) => {
      let { x, y, width, height } = prev;
      if (dim === 'w') width = Math.max(2, Math.min(100 - x, width + delta));
      if (dim === 'h') height = Math.max(2, Math.min(100 - y, height + delta));
      return {
        x,
        y,
        width: Math.round(width * 10) / 10,
        height: Math.round(height * 10) / 10,
      };
    });
  };

  const handleSingleSideAdjust = (side: 'top' | 'bottom' | 'left' | 'right', action: 'expand' | 'shrink') => {
    const delta = nudgeStep;
    setBox((prev) => {
      let { x, y, width, height } = prev;
      if (side === 'top') {
        if (action === 'expand') {
          const newY = Math.max(0, y - delta);
          height = height + (y - newY);
          y = newY;
        } else {
          const change = Math.min(height - 2, delta);
          y = y + change;
          height = height - change;
        }
      } else if (side === 'bottom') {
        if (action === 'expand') {
          height = Math.min(100 - y, height + delta);
        } else {
          height = Math.max(2, height - delta);
        }
      } else if (side === 'left') {
        if (action === 'expand') {
          const newX = Math.max(0, x - delta);
          width = width + (x - newX);
          x = newX;
        } else {
          const change = Math.min(width - 2, delta);
          x = x + change;
          width = width - change;
        }
      } else if (side === 'right') {
        if (action === 'expand') {
          width = Math.min(100 - x, width + delta);
        } else {
          width = Math.max(2, width - delta);
        }
      }

      return {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(height * 10) / 10,
      };
    });
  };

  const handleNudge = (dir: 'up' | 'down' | 'left' | 'right') => {
    setBox((prev) => {
      let { x, y, width, height } = prev;
      if (dir === 'up') y = Math.max(0, y - nudgeStep);
      if (dir === 'down') y = Math.min(100 - height, y + nudgeStep);
      if (dir === 'left') x = Math.max(0, x - nudgeStep);
      if (dir === 'right') x = Math.min(100 - width, x + nudgeStep);
      return {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        width,
        height,
      };
    });
  };

  const applyAspectRatio = (ratio: 'free' | '1:1' | '4:3' | '16:9' | '3:4') => {
    setSelectedRatio(ratio);
    if (ratio === 'free') return;

    setBox((prev) => {
      let r = 1;
      if (ratio === '1:1') r = 1;
      if (ratio === '4:3') r = 4 / 3;
      if (ratio === '16:9') r = 16 / 9;
      if (ratio === '3:4') r = 3 / 4;

      const newH = Math.max(5, Math.min(100 - prev.y, Math.round((prev.width / r) * 10) / 10));
      return { ...prev, height: newH };
    });
  };

  const handleReset = () => {
    setBox({ ...product.box });
    setSelectedRatio('free');
  };

  const handleSave = () => {
    onSaveCrop(product.id, box, croppedPreview || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-auto flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Draw Mode & Grid Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                Precision Hotspot & Crop Zone Tool
              </h3>
              <p className="text-xs text-slate-400">
                {isDrawMode 
                  ? '🎯 Draw Mode Active: Click & drag anywhere on the flyer image to draw a brand new hotspot box'
                  : 'Drag corner handles, use directional nudge arrows, or enter exact percentages'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGridOverlay(!showGridOverlay)}
              className={`p-2 rounded-xl border text-xs transition ${
                showGridOverlay
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Toggle precision alignment grid"
            >
              <Grid className="w-4 h-4" />
            </button>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setIsDrawMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  !isDrawMode
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Move className="w-3.5 h-3.5" />
                <span>Adjust Handles</span>
              </button>
              <button
                onClick={() => setIsDrawMode(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  isDrawMode
                    ? 'bg-amber-500 text-slate-950 shadow ring-2 ring-amber-300'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Draw New Box</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content: Split Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Flyer Canvas with Cropping Box */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950 rounded-2xl p-2 sm:p-4 border border-slate-800 select-none overflow-hidden min-h-[320px]">
            <div
              ref={imageContainerRef}
              onPointerDown={handleContainerPointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`relative max-w-full max-h-[58vh] inline-block rounded-xl overflow-hidden ${
                isDrawMode ? 'cursor-crosshair ring-2 ring-amber-400' : 'cursor-crosshair'
              }`}
            >
              {/* Draw Mode Helper Banner */}
              {isDrawMode && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-1.5 animate-pulse border border-amber-300">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Click & Drag to Draw New Crop Box</span>
                </div>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flyerImageUrl}
                alt="Flyer for cropping"
                className="max-h-[58vh] w-auto object-contain block pointer-events-none"
                draggable={false}
              />

              {/* Darkened overlay outside the crop box */}
              <div className="absolute inset-0 bg-slate-950/60 pointer-events-none" />

              {/* Grid overlay for alignment */}
              {showGridOverlay && (
                <div className="absolute inset-0 hud-grid-overlay opacity-30 pointer-events-none" />
              )}

              {/* Active Crop Box */}
              <div
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                onPointerDown={(e) => handlePointerDown(e, null)}
                className={`absolute border-2 border-emerald-400 bg-transparent shadow-[0_0_0_9999px_rgba(2,6,23,0.65)] cursor-move ${
                  isDragging ? 'ring-2 ring-emerald-300' : ''
                }`}
              >
                {/* Rule of thirds grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-emerald-400/50" />
                  <div className="border-r border-b border-emerald-400/50" />
                  <div className="border-b border-emerald-400/50" />
                  <div className="border-r border-b border-emerald-400/50" />
                  <div className="border-r border-b border-emerald-400/50" />
                  <div className="border-b border-emerald-400/50" />
                  <div className="border-r border-emerald-400/50" />
                  <div className="border-r border-emerald-400/50" />
                  <div />
                </div>

                {/* Mobile-Friendly Enlarged Corner Resize Handle Touch Hitboxes (36px touch zone) */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'nw')}
                  className="absolute -top-4 -left-4 w-9 h-9 flex items-center justify-center cursor-nwse-resize touch-none z-30"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-lg ring-2 ring-emerald-400/30" />
                </div>
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'ne')}
                  className="absolute -top-4 -right-4 w-9 h-9 flex items-center justify-center cursor-nesw-resize touch-none z-30"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-lg ring-2 ring-emerald-400/30" />
                </div>
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'sw')}
                  className="absolute -bottom-4 -left-4 w-9 h-9 flex items-center justify-center cursor-nesw-resize touch-none z-30"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-lg ring-2 ring-emerald-400/30" />
                </div>
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'se')}
                  className="absolute -bottom-4 -right-4 w-9 h-9 flex items-center justify-center cursor-nwse-resize touch-none z-30"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-lg ring-2 ring-emerald-400/30" />
                </div>

                {/* Single Side Edge Handles (Top, Bottom, Left, Right) */}
                {/* Top Edge (N) */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'n')}
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-14 h-7 flex items-center justify-center cursor-ns-resize touch-none z-30 group/edge"
                  title="Drag to adjust Top side only"
                >
                  <div className="w-9 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-md group-hover/edge:bg-emerald-300 group-hover/edge:scale-110 transition-all ring-2 ring-emerald-400/20" />
                </div>
                {/* Bottom Edge (S) */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 's')}
                  className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-14 h-7 flex items-center justify-center cursor-ns-resize touch-none z-30 group/edge"
                  title="Drag to adjust Bottom side only"
                >
                  <div className="w-9 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-md group-hover/edge:bg-emerald-300 group-hover/edge:scale-110 transition-all ring-2 ring-emerald-400/20" />
                </div>
                {/* Left Edge (W) */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'w')}
                  className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-14 flex items-center justify-center cursor-ew-resize touch-none z-30 group/edge"
                  title="Drag to adjust Left side only"
                >
                  <div className="w-2.5 h-9 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-md group-hover/edge:bg-emerald-300 group-hover/edge:scale-110 transition-all ring-2 ring-emerald-400/20" />
                </div>
                {/* Right Edge (E) */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'e')}
                  className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-14 flex items-center justify-center cursor-ew-resize touch-none z-30 group/edge"
                  title="Drag to adjust Right side only"
                >
                  <div className="w-2.5 h-9 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-md group-hover/edge:bg-emerald-300 group-hover/edge:scale-110 transition-all ring-2 ring-emerald-400/20" />
                </div>

                {/* Crop label badge */}
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono text-emerald-400 border border-emerald-500/40 pointer-events-none">
                  {Math.round(box.width * 10) / 10}% × {Math.round(box.height * 10) / 10}%
                </div>
              </div>
            </div>

            {/* Mobile Touch Quick Controller Pad */}
            <div className="lg:hidden w-full mt-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span className="text-emerald-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> Touch Nudge & Size Controls
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {box.width}% × {box.height}%
                </span>
              </div>

              {/* D-Pad Arrow Buttons + Steppers */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNudge('left')}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 active:bg-emerald-600 text-slate-200 active:text-slate-950 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                    title="Nudge Left"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleNudge('up')}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 active:bg-emerald-600 text-slate-200 active:text-slate-950 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                      title="Nudge Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge('down')}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 active:bg-emerald-600 text-slate-200 active:text-slate-950 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                      title="Nudge Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNudge('right')}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 active:bg-emerald-600 text-slate-200 active:text-slate-950 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                    title="Nudge Right"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Size Steppers (+ / -) */}
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleSizeChange('w', 1)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold active:scale-95 text-center min-h-[36px]"
                  >
                    W +1%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSizeChange('w', -1)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold active:scale-95 text-center min-h-[36px]"
                  >
                    W -1%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSizeChange('h', 1)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold active:scale-95 text-center min-h-[36px]"
                  >
                    H +1%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSizeChange('h', -1)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold active:scale-95 text-center min-h-[36px]"
                  >
                    H -1%
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Floating Magnifier Glass Loupe Lens (Mobile & Precision Zoom) */}
        {loupeScreenPos && (
          <div
            style={{
              left: `${loupeScreenPos.x}px`,
              top: `${Math.max(80, loupeScreenPos.y - 100)}px`,
            }}
            className="fixed z-[60] -translate-x-1/2 w-28 h-28 rounded-full border-4 border-emerald-400 bg-slate-950 shadow-2xl overflow-hidden pointer-events-none flex items-center justify-center ring-4 ring-slate-950/90 animate-in zoom-in-75 duration-75"
          >
            <div
              style={{
                width: '320%',
                height: '320%',
                backgroundImage: `url(${flyerImageUrl})`,
                backgroundSize: '100% 100%',
                backgroundPosition: `${loupeImagePct.xPct}% ${loupeImagePct.yPct}%`,
              }}
              className="w-full h-full"
            />
            {/* Center Target Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-emerald-400/80" />
              <div className="h-full w-[1px] bg-emerald-400/80 absolute" />
              <div className="w-4 h-4 border-2 border-emerald-400 rounded-full" />
            </div>
            <div className="absolute bottom-1 px-2 py-0.5 rounded bg-slate-950/90 text-[9px] font-mono font-bold text-emerald-300 border border-emerald-500/50">
              3.2x Loupe
            </div>
          </div>
        )}

          {/* Right Panel: Controls & Live Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Aspect Ratio Selector Presets */}
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Aspect Ratio Presets
                </span>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-[11px] font-bold">
                  {(['free', '1:1', '4:3', '16:9', '3:4'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => applyAspectRatio(r)}
                      className={`py-1.5 rounded-xl transition ${
                        selectedRatio === r
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r === 'free' ? 'Free' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nudge Directional Pad & Precision Controls */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-200">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Sliders className="w-4 h-4" /> Fine Nudge Controls
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <span>Step:</span>
                    <button
                      type="button"
                      onClick={() => setNudgeStep(0.2)}
                      className={`px-1.5 py-0.5 rounded ${nudgeStep === 0.2 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900'}`}
                    >
                      0.2%
                    </button>
                    <button
                      type="button"
                      onClick={() => setNudgeStep(0.5)}
                      className={`px-1.5 py-0.5 rounded ${nudgeStep === 0.5 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900'}`}
                    >
                      0.5%
                    </button>
                    <button
                      type="button"
                      onClick={() => setNudgeStep(1.0)}
                      className={`px-1.5 py-0.5 rounded ${nudgeStep === 1.0 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900'}`}
                    >
                      1.0%
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-around">
                  {/* D-Pad Arrows */}
                  <div className="grid grid-cols-3 grid-rows-3 gap-1 w-28 h-28">
                    <div />
                    <button
                      type="button"
                      onClick={() => handleNudge('up')}
                      className="flex items-center justify-center rounded-xl bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-slate-950 transition border border-slate-800 active:scale-90"
                      title="Nudge Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <div />
                    <button
                      type="button"
                      onClick={() => handleNudge('left')}
                      className="flex items-center justify-center rounded-xl bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-slate-950 transition border border-slate-800 active:scale-90"
                      title="Nudge Left"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center justify-center text-[10px] font-mono text-slate-500 font-bold">
                      ±{nudgeStep}%
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNudge('right')}
                      className="flex items-center justify-center rounded-xl bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-slate-950 transition border border-slate-800 active:scale-90"
                      title="Nudge Right"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <div />
                    <button
                      type="button"
                      onClick={() => handleNudge('down')}
                      className="flex items-center justify-center rounded-xl bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-slate-950 transition border border-slate-800 active:scale-90"
                      title="Nudge Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <div />
                  </div>

                  {/* Numeric Input Fields */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">X (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={box.x}
                        onChange={(e) => setBox({ ...box, x: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Y (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={box.y}
                        onChange={(e) => setBox({ ...box, y: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">W (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={box.width}
                        onChange={(e) => setBox({ ...box, width: Math.max(2, parseFloat(e.target.value) || 2) })}
                        className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">H (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={box.height}
                        onChange={(e) => setBox({ ...box, height: Math.max(2, parseFloat(e.target.value) || 2) })}
                        className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Single Side Push / Pull Adjust Controls */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
                  Adjust Single Side (Push / Pull)
                </span>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                  <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 pl-1">Top</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSingleSideAdjust('top', 'expand')}
                        className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition"
                        title="Extend Top side outward"
                      >
                        ↑ Out
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSingleSideAdjust('top', 'shrink')}
                        className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
                        title="Pull Top side inward"
                      >
                        ↓ In
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 pl-1">Bottom</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSingleSideAdjust('bottom', 'expand')}
                        className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition"
                        title="Extend Bottom side outward"
                      >
                        ↓ Out
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSingleSideAdjust('bottom', 'shrink')}
                        className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
                        title="Pull Bottom side inward"
                      >
                        ↑ In
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 pl-1">Left</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSingleSideAdjust('left', 'expand')}
                        className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition"
                        title="Extend Left side outward"
                      >
                        ← Out
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSingleSideAdjust('left', 'shrink')}
                        className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
                        title="Pull Left side inward"
                      >
                        → In
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 pl-1">Right</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSingleSideAdjust('right', 'expand')}
                        className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition"
                        title="Extend Right side outward"
                      >
                        → Out
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSingleSideAdjust('right', 'shrink')}
                        className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition"
                        title="Pull Right side inward"
                      >
                        ← In
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cropped Image Live Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
                  Live Cropped Result
                </span>

                <div className="relative aspect-square w-full max-w-[180px] mx-auto rounded-xl overflow-hidden bg-slate-900 border-2 border-emerald-500/60 shadow-xl flex items-center justify-center group">
                  {croppedPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={croppedPreview}
                      alt="Cropped Preview"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="text-xs text-slate-500">Generating crop...</div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 shadow">
                    Crop Preview
                  </div>
                </div>
              </div>
            </div>

            {/* Save & Reset Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Original Box</span>
              </button>

              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/25 transition active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Cropped Product Zone</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

