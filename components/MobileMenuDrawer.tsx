'use client';

import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Sparkles, 
  Upload, 
  ShoppingBag, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ChevronRight,
  RotateCcw,
  Search,
  Database,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Flyer } from '@/types/flyer';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: 'canvas' | 'gallery';
  onViewChange: (view: 'canvas' | 'gallery') => void;
  flyers: Flyer[];
  currentFlyer: Flyer | null;
  onSelectFlyer: (flyer: Flyer) => void;
  onOpenUpload: () => void;
  onOpenShoppingList: () => void;
  cartCount: number;
  totalSavings: number;
  hotspotStyle: 'pins' | 'boxes' | 'minimal' | 'ocr';
  onHotspotStyleChange: (style: 'pins' | 'boxes' | 'minimal' | 'ocr') => void;
  showHotspots: boolean;
  onToggleShowHotspots: () => void;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  onResetDatabase?: () => void;
  onDeleteAllFlyers?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  activeView,
  onViewChange,
  flyers,
  currentFlyer,
  onSelectFlyer,
  onOpenUpload,
  onOpenShoppingList,
  cartCount,
  totalSavings,
  hotspotStyle,
  onHotspotStyleChange,
  showHotspots,
  onToggleShowHotspots,
  isAdminMode,
  onToggleAdminMode,
  onResetDatabase,
  onDeleteAllFlyers,
  searchQuery = '',
  onSearchChange,
}: MobileMenuDrawerProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200 font-sans">
      {/* Backdrop Click */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-Up Bottom Sheet Drawer */}
      <div className="w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl p-5 space-y-4 max-h-[88vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 text-slate-100">
        {/* Drag Handle Top Bar */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white">FlyerSpot Mobile Menu</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px]">v3.0</span>
              </div>
              <p className="text-[11px] text-slate-400">Full Mobile Navigation & Controls</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Quick Search Bar */}
        {onSearchChange && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, brands, or prices..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Destination View Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              onViewChange('canvas');
              onClose();
            }}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between min-h-[72px] ${
              activeView === 'canvas'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <Layers className="w-4 h-4 text-emerald-400" />
              {activeView === 'canvas' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <div>
              <div className="font-extrabold text-xs text-white">Interactive Canvas</div>
              <div className="text-[10px] text-slate-400">
                {currentFlyer ? `${currentFlyer.products.length} Hotspots Mapped` : 'No Flyer Active'}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onViewChange('gallery');
              onClose();
            }}
            className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between min-h-[72px] ${
              activeView === 'gallery'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-mono text-slate-400">
                {flyers.length} Flyers
              </span>
            </div>
            <div>
              <div className="font-extrabold text-xs text-white">Flyer Gallery</div>
              <div className="text-[10px] text-slate-400">Catalog Collection</div>
            </div>
          </button>
        </div>

        {/* Flyer Catalog Quick Switcher */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Switch Flyer Catalog</span>
            <span className="text-emerald-400 text-[10px] font-mono font-bold">
              {flyers.length} Available
            </span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {flyers.length === 0 ? (
              <div className="p-3 text-center bg-slate-950/40 rounded-2xl border border-slate-800/80">
                <p className="text-xs text-slate-400">No flyers currently loaded</p>
                <button
                  onClick={() => {
                    onOpenUpload();
                    onClose();
                  }}
                  className="mt-1 text-xs text-emerald-400 font-bold hover:underline"
                >
                  + Upload a flyer
                </button>
              </div>
            ) : (
              flyers.map((f, idx) => (
                <button
                  key={`mobile-drawer-flyer-${f.id}-${idx}`}
                  onClick={() => {
                    onSelectFlyer(f);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition border ${
                    f.id === currentFlyer?.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.imageUrl} alt={f.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-white truncate">{f.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{f.store}</div>
                    <div className="text-[9px] text-emerald-400 font-mono mt-0.5">{f.products.length} Hotspots</div>
                  </div>
                  {f.id === currentFlyer?.id && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping mr-1" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Hotspot Visual Style Selector */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Hotspot Overlay Mode</span>
            <button
              onClick={onToggleShowHotspots}
              className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1"
            >
              {showHotspots ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showHotspots ? 'Visible' : 'Hidden'}</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => onHotspotStyleChange('pins')}
              className={`py-2 rounded-xl font-bold transition text-[11px] ${
                hotspotStyle === 'pins'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pins
            </button>
            <button
              onClick={() => onHotspotStyleChange('boxes')}
              className={`py-2 rounded-xl font-bold transition text-[11px] ${
                hotspotStyle === 'boxes'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Zones
            </button>
            <button
              onClick={() => onHotspotStyleChange('minimal')}
              className={`py-2 rounded-xl font-bold transition text-[11px] ${
                hotspotStyle === 'minimal'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dots
            </button>
            <button
              onClick={() => onHotspotStyleChange('ocr')}
              className={`py-2 rounded-xl font-bold transition text-[11px] ${
                hotspotStyle === 'ocr'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-amber-400 hover:text-white'
              }`}
            >
              OCR
            </button>
          </div>
        </div>

        {/* Admin Mode Toggle */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isAdminMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Admin Hotspot Editor Mode</span>
                {isAdminMode && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px]">Active</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                Manual bounding box editor & OCR text tuner
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onToggleAdminMode();
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
              isAdminMode
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isAdminMode ? 'Disable' : 'Enable'}
          </button>
        </div>

        {/* Database Reset & Management Section */}
        <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white">App Database Management</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Local Storage DB</span>
          </div>

          {/* Delete All Uploaded Flyers & Mock Data */}
          {onDeleteAllFlyers && (
            !confirmDeleteAll ? (
              <button
                onClick={() => setConfirmDeleteAll(true)}
                className="w-full py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Flyers & Mock Data</span>
              </button>
            ) : (
              <div className="space-y-2 p-2 rounded-xl bg-slate-950/80 border border-rose-500/50 animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Delete all flyers and mock data?</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  This wipes all uploaded flyers and mock data, providing a clean canvas.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onDeleteAllFlyers();
                      setConfirmDeleteAll(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition shadow flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete All</span>
                  </button>
                  <button
                    onClick={() => setConfirmDeleteAll(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          )}

          {/* Reset Database to Factory Default */}
          {onResetDatabase && (
            !confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Catalog to Default</span>
              </button>
            ) : (
              <div className="space-y-2 p-2 rounded-xl bg-slate-950/80 border border-slate-700 animate-in fade-in">
                <div className="flex items-center gap-2 text-slate-200 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Restore clean default catalog?</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  This clears uploaded custom flyers and restores the verified Joy&apos;s of the Table flyer.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onResetDatabase();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs transition shadow flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Yes, Restore Default</span>
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <button
            onClick={() => {
              onOpenUpload();
              onClose();
            }}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-extrabold transition flex items-center justify-between min-h-[44px] shadow-lg shadow-emerald-600/20"
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Upload / Scan New Flyer</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onOpenShoppingList();
              onClose();
            }}
            className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition flex items-center justify-between min-h-[44px]"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Shopping Trip List ({cartCount})</span>
            </div>
            {totalSavings > 0 && (
              <span className="text-emerald-400 font-extrabold text-[11px]">
                Save ${totalSavings.toFixed(2)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
