'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  Scan,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { Flyer } from '@/types/flyer';
import { compressImageForUpload } from '@/lib/imageCompressor';
import { createInteractiveFlyerFromImage } from '@/lib/fallbackGenerator';

interface BulkItem {
  id: string;
  previewUrl: string;
  title: string;
  store: string;
  status: 'queued' | 'scanning' | 'ocr' | 'completed' | 'error';
  errorMsg?: string;
}

interface FlyerUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyerCreated: (flyer: Flyer) => void;
  sampleFlyers: Flyer[];
  onSelectSample: (flyer: Flyer) => void;
}

export default function FlyerUploadModal({
  isOpen,
  onClose,
  onFlyerCreated,
  sampleFlyers,
  onSelectSample,
}: FlyerUploadModalProps) {
  const [bulkQueue, setBulkQueue] = useState<BulkItem[]>([]);
  const [globalStoreName, setGlobalStoreName] = useState<string>('Supermarket');
  const [sensitivityLevel, setSensitivityLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleMultipleFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const fileArray = Array.from(files).filter((selectedFile) => selectedFile.type.startsWith('image/'));

    if (fileArray.length === 0) {
      setErrorMessage('Please select valid image files (JPEG, PNG, WEBP).');
      return;
    }

    const newItems: BulkItem[] = await Promise.all(
      fileArray.map((selectedFile, i) => {
        return new Promise<BulkItem>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = (e.target?.result as string) || '';
            const title = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            resolve({
              id: `bulk-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
              previewUrl: dataUrl,
              title,
              store: globalStoreName || 'Retail Store',
              status: 'queued',
            });
          };
          reader.onerror = () => {
            const title = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            resolve({
              id: `bulk-err-${Date.now()}-${i}`,
              previewUrl: '',
              title,
              store: globalStoreName || 'Retail Store',
              status: 'error',
              errorMsg: 'Could not read file',
            });
          };
          reader.readAsDataURL(selectedFile);
        });
      })
    );

    const validItems = newItems.filter((item) => item.previewUrl);
    setBulkQueue((prev) => [...prev, ...validItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveQueueItem = (id: string) => {
    setBulkQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProcessBatch = async () => {
    if (bulkQueue.length === 0) return;

    setIsProcessingBatch(true);
    setErrorMessage(null);

    const maxDimension = sensitivityLevel === 'high' ? 2400 : sensitivityLevel === 'medium' ? 1800 : 1200;
    const quality = sensitivityLevel === 'high' ? 0.95 : sensitivityLevel === 'medium' ? 0.88 : 0.80;

    for (let i = 0; i < bulkQueue.length; i++) {
      setCurrentBatchIndex(i);

      setBulkQueue((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'scanning' } : item))
      );

      const currentItem = bulkQueue[i];

      try {
        const compressed = await compressImageForUpload(currentItem.previewUrl, maxDimension, quality);

        setBulkQueue((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'ocr' } : item))
        );

        let flyerData: Flyer | null = null;

        try {
          const response = await fetch('/api/analyze-flyer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: compressed.base64,
              mimeType: compressed.mimeType,
              flyerTitle: currentItem.title || `Flyer Page #${i + 1}`,
              storeName: globalStoreName || currentItem.store || 'Retail Supermarket',
              sensitivityLevel,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.flyer) {
              flyerData = data.flyer;
            }
          }
        } catch (apiErr) {
          console.warn('API analyze-flyer failed, fallback generator taking over:', apiErr);
        }

        if (!flyerData) {
          flyerData = createInteractiveFlyerFromImage(
            currentItem.previewUrl,
            currentItem.title,
            globalStoreName || currentItem.store
          );
        }

        onFlyerCreated(flyerData);

        setBulkQueue((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'completed' } : item))
        );
      } catch (err: any) {
        console.error(`Error processing bulk flyer ${i}:`, err);
        const safeFlyer = createInteractiveFlyerFromImage(
          currentItem.previewUrl,
          currentItem.title,
          globalStoreName
        );
        onFlyerCreated(safeFlyer);

        setBulkQueue((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'completed' } : item))
        );
      }
    }

    setIsProcessingBatch(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-hidden animate-in fade-in duration-150 font-sans">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in slide-in-from-bottom duration-200 glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                Bulk Flyer Upload & AI Hotspot Ingestion
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Upload grocery circulars to extract spatial deal tiles and generate interactive hotspots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessingBatch}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Supermarket Store Brand
              </label>
              <input
                type="text"
                value={globalStoreName}
                onChange={(e) => setGlobalStoreName(e.target.value)}
                placeholder="e.g. MH & MaxVal-u Supermarkets"
                disabled={isProcessingBatch}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[42px]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                OCR Scan Precision
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSensitivityLevel('high')}
                  disabled={isProcessingBatch}
                  className={`py-2 rounded-xl font-extrabold transition text-[11px] ${
                    sensitivityLevel === 'high'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  High (2400px)
                </button>
                <button
                  type="button"
                  onClick={() => setSensitivityLevel('medium')}
                  disabled={isProcessingBatch}
                  className={`py-2 rounded-xl font-extrabold transition text-[11px] ${
                    sensitivityLevel === 'medium'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => setSensitivityLevel('low')}
                  disabled={isProcessingBatch}
                  className={`py-2 rounded-xl font-extrabold transition text-[11px] ${
                    sensitivityLevel === 'low'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fast
                </button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleMultipleFiles(e.target.files)}
          />

          {/* Upload Dropzone */}
          {!isProcessingBatch && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-800 hover:border-emerald-500/60 rounded-3xl p-8 text-center bg-slate-950/40 hover:bg-slate-950/80 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform border border-emerald-500/20">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white">
                Click or drag & drop flyer images here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Select 1 or multiple flyer pages at once (JPEG, PNG, WEBP)
              </p>
            </div>
          )}

          {/* Bulk Queue List */}
          {bulkQueue.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Ingestion Queue ({bulkQueue.length} pages)</span>
                {!isProcessingBatch && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Pages
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {bulkQueue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.previewUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        {(item.status === 'scanning' || item.status === 'ocr') && (
                          <div className="absolute inset-0 bg-slate-950/40 pointer-events-none">
                            <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 animate-laser-sweep cyber-laser-glow" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <input
                          type="text"
                          value={item.title}
                          disabled={isProcessingBatch}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBulkQueue((prev) =>
                              prev.map((q) => (q.id === item.id ? { ...q, title: val } : q))
                            );
                          }}
                          className="bg-transparent border-none text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 truncate max-w-[180px] sm:max-w-[260px]"
                        />
                        <div className="text-[10px] text-slate-400 px-1 font-mono">
                          Page #{idx + 1}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'queued' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400">
                          Queued
                        </span>
                      )}
                      {item.status === 'scanning' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> Scanning
                        </span>
                      )}
                      {item.status === 'ocr' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3" /> Vision OCR
                        </span>
                      )}
                      {item.status === 'completed' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> Done
                        </span>
                      )}

                      {!isProcessingBatch && (
                        <button
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Sample Presets */}
          {!isProcessingBatch && bulkQueue.length === 0 && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 block mb-2">
                Or select a preset sample flyer:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {sampleFlyers.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      onSelectSample(sample);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-left text-xs transition flex items-center gap-2.5 group min-h-[44px]"
                  >
                    <div className="w-9 h-11 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sample.imageUrl}
                        alt={sample.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white group-hover:text-emerald-400 truncate text-[11px] sm:text-xs transition">
                        {sample.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {sample.products.length} Hotspots
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-800 bg-slate-950/95 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isProcessingBatch}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition disabled:opacity-40"
          >
            Cancel
          </button>

          {bulkQueue.length > 0 && (
            <button
              onClick={handleProcessBatch}
              disabled={isProcessingBatch}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 font-extrabold text-xs sm:text-sm text-white shadow-xl shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              {isProcessingBatch ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Converting ({currentBatchIndex + 1}/{bulkQueue.length})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Convert {bulkQueue.length} Flyer(s) to Hotspots</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
