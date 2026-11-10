'use client';

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Trash2, 
  DollarSign, 
  Tag, 
  Sliders, 
  Type, 
  Layers, 
  Package, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { ProductDetail, HotspotBox } from '@/types/flyer';

interface HotspotEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetail;
  onSave: (updatedProduct: ProductDetail) => void;
  onDelete?: (productId: string) => void;
}

export default function HotspotEditModal({
  isOpen,
  onClose,
  product,
  onSave,
  onDelete,
}: HotspotEditModalProps) {
  const [title, setTitle] = useState(product.title);
  const [brand, setBrand] = useState(product.brand);
  const [category, setCategory] = useState(product.category);
  const [dealPrice, setDealPrice] = useState(product.dealPrice.toString());
  const [originalPrice, setOriginalPrice] = useState(product.originalPrice.toString());
  const [unit, setUnit] = useState(product.unit);
  const [unitPrice, setUnitPrice] = useState(product.unitPrice);
  const [badge, setBadge] = useState(product.badge || '');
  const [rawOcrText, setRawOcrText] = useState(product.rawOcrText || '');
  const [description, setDescription] = useState(product.description || '');
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'limited' | 'selling_fast'>(
    product.stockStatus || 'in_stock'
  );

  // Box coordinates
  const [boxX, setBoxX] = useState(product.box.x.toString());
  const [boxY, setBoxY] = useState(product.box.y.toString());
  const [boxWidth, setBoxWidth] = useState(product.box.width.toString());
  const [boxHeight, setBoxHeight] = useState(product.box.height.toString());

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericDeal = parseFloat(dealPrice) || 0;
    const numericOriginal = parseFloat(originalPrice) || numericDeal;
    const discountPercent =
      numericOriginal > numericDeal
        ? Math.round(((numericOriginal - numericDeal) / numericOriginal) * 100)
        : 0;

    const updatedBox: HotspotBox = {
      x: Math.max(0, Math.min(100, parseFloat(boxX) || 0)),
      y: Math.max(0, Math.min(100, parseFloat(boxY) || 0)),
      width: Math.max(2, Math.min(100, parseFloat(boxWidth) || 20)),
      height: Math.max(2, Math.min(100, parseFloat(boxHeight) || 20)),
    };

    const updatedProduct: ProductDetail = {
      ...product,
      title: title.trim() || 'Untitled Product',
      brand: brand.trim() || 'Store Select',
      category: category.trim() || 'General',
      dealPrice: numericDeal,
      originalPrice: numericOriginal,
      unit: unit.trim() || 'pack',
      unitPrice: unitPrice.trim() || `$${numericDeal.toFixed(2)} / ${unit}`,
      discountPercent,
      badge: badge.trim() || undefined,
      rawOcrText: rawOcrText.trim() || `${brand} ${title} $${numericDeal.toFixed(2)}`,
      description: description.trim() || 'Custom edited hotspot zone.',
      stockStatus,
      box: updatedBox,
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Admin Hotspot Zone Editor
              </h3>
              <p className="text-xs text-slate-400">
                Manually edit bounding box, prices, verbatim OCR text & product meta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Spatial Box Coordinates Section */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Bounding Box Spatial Coordinates (%)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Tile #{product.tileIndex || 1}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">X Position (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={boxX}
                  onChange={(e) => setBoxX(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Y Position (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={boxY}
                  onChange={(e) => setBoxY(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Width (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="100"
                  value={boxWidth}
                  onChange={(e) => setBoxWidth(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Height (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="100"
                  value={boxHeight}
                  onChange={(e) => setBoxHeight(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Product Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Product Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Retail Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="General">General Grocery</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Butcher & Seafood">Butcher & Seafood</option>
                <option value="Ice Cream & Dairy">Ice Cream & Dairy</option>
                <option value="Beverages & Spirits">Beverages & Spirits</option>
                <option value="Snacks & Pantry">Snacks & Pantry</option>
                <option value="Fireworks & Festivities">Fireworks & Festivities</option>
              </select>
            </div>
          </div>

          {/* Pricing & Unit Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Deal Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={dealPrice}
                onChange={(e) => setDealPrice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Original Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Unit / Size
              </label>
              <input
                type="text"
                placeholder="e.g. 1kg bag, 2L tub"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Unit Rate
              </label>
              <input
                type="text"
                placeholder="e.g. $2.98 / L"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Verbatim OCR Raw Text */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Verbatim Transcribed OCR Text
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Extracted verbatim from flyer image
              </span>
            </label>
            <textarea
              rows={2}
              value={rawOcrText}
              onChange={(e) => setRawOcrText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Promotional Callout & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Promo Callout Badge
              </label>
              <input
                type="text"
                placeholder="e.g. Top Weekly Deal, Halal Certified"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Stock Status
              </label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="in_stock">In Stock</option>
                <option value="selling_fast">Selling Fast</option>
                <option value="limited">Limited Stock</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(product.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-semibold transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Hotspot</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
