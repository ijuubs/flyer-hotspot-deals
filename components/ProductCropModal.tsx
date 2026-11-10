'use client';

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
  Move
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

  // Draw Mode state for manual click & drag bounding box definition
  const [isDrawMode, setIsDrawMode] = useState<boolean>(false);
  const [isDrawingNewBox, setIsDrawingNewBox] = useState<boolean>(false);
  const [drawStartPoint, setDrawStartPoint] = useState<{ x: number; y: number } | null>(null);

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
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!imageContainerRef.current) return;

    if (isDrawMode && isDrawingNewBox && drawStartPoint) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

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

    const rect = imageContainerRef.current.getBoundingClientRect();
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

  const handleReset = () => {
    setBox({ ...product.box });
  };

  const handleSave = () => {
    onSaveCrop(product.id, box, croppedPreview || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Draw Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Product Crop & Bounding Box Adjuster
              </h3>
              <p className="text-xs text-slate-400">
                {isDrawMode 
                  ? '🎯 Draw Mode Active: Click & drag anywhere on the flyer image to define a new bounding box'
                  : 'Drag corner handles or move the crop box to frame the exact product graphic'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setIsDrawMode(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content: Split Layout on tablet/desktop, stacked on mobile */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Flyer Canvas with Cropping Box */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center bg-slate-950 rounded-xl p-2 sm:p-4 border border-slate-800 select-none overflow-hidden min-h-[300px]">
            <div
              ref={imageContainerRef}
              onPointerDown={handleContainerPointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`relative max-w-full max-h-[58vh] inline-block rounded overflow-hidden ${
                isDrawMode ? 'cursor-crosshair ring-2 ring-amber-400' : 'cursor-crosshair'
              }`}
            >
              {/* Draw Mode Helper Banner */}
              {isDrawMode && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-pulse border border-amber-300">
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
              <div className="absolute inset-0 bg-slate-950/50 pointer-events-none" />

              {/* Active Crop Box */}
              <div
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                onPointerDown={(e) => handlePointerDown(e, null)}
                className={`absolute border-2 border-emerald-400 bg-transparent shadow-[0_0_0_9999px_rgba(2,6,23,0.55)] cursor-move ${
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

                {/* Corner resize handles */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'nw')}
                  className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 cursor-nwse-resize shadow"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'ne')}
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 cursor-nesw-resize shadow"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'sw')}
                  className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 cursor-nesw-resize shadow"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'se')}
                  className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 cursor-nwse-resize shadow"
                />

                {/* Crop label badge */}
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono text-emerald-400 border border-emerald-500/40 pointer-events-none">
                  {Math.round(box.width)}% × {Math.round(box.height)}%
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Cropped Result & Product Info */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                Live Cropped Product Preview
              </span>

              {/* Cropped Image Result */}
              <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-xl overflow-hidden bg-slate-950 border-2 border-emerald-500/60 shadow-xl flex items-center justify-center group">
                {croppedPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={croppedPreview}
                    alt="Cropped Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-slate-500">Generating crop...</div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 shadow">
                  Flyer Crop
                </div>
              </div>

              {/* Selected Product Info */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-xs">
                <div className="font-semibold text-emerald-400 uppercase text-[10px]">
                  {product.brand}
                </div>
                <div className="font-bold text-white text-sm truncate">
                  {product.title}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-white">
                    ${product.dealPrice.toFixed(2)}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {product.unit}
                  </span>
                </div>
              </div>

              {/* Coordinates info */}
              <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Top-Left (X, Y):</span>
                  <span className="text-slate-200 font-mono">{box.x}%, {box.y}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Zone Dimensions:</span>
                  <span className="text-slate-200 font-mono">{box.width}% × {box.height}%</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Original Box</span>
              </button>

              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Cropped Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
