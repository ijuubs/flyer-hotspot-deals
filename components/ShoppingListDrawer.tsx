'use client';

import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  CheckSquare, 
  Square, 
  Printer, 
  TrendingDown, 
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Share2
} from 'lucide-react';
import { CartItem } from '@/types/flyer';

interface ShoppingListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
}

export default function ShoppingListDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearAll,
}: ShoppingListDrawerProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleCheck = (productId: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const totalCost = items.reduce((sum, item) => {
    const price = item.selectedAlternative ? item.selectedAlternative.price : item.product.dealPrice;
    return sum + price * item.quantity;
  }, 0);

  const totalSavings = items.reduce((sum, item) => {
    if (!item.selectedAlternative && item.product.originalPrice > item.product.dealPrice) {
      return sum + (item.product.originalPrice - item.product.dealPrice) * item.quantity;
    }
    return sum;
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Shopping Trip Checklist</h3>
              <p className="text-xs text-slate-400">
                {items.length} item{items.length !== 1 ? 's' : ''} saved from flyer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Savings & Budget Summary Pill */}
        {items.length > 0 && (
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 shrink-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block">Estimated Total</span>
                <span className="text-xl font-extrabold text-white">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <TrendingDown className="w-3.5 h-3.5" /> Flyer Savings
                </span>
                <span className="text-xl font-extrabold text-emerald-400">
                  ${totalSavings.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-20 px-4 text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">Your shopping list is empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Click any hotspot product on the flyer to add deals and compare items!
              </p>
            </div>
          ) : (
            items.map((item) => {
              const { product, quantity, selectedAlternative } = item;
              const isChecked = checkedItems.has(product.id);
              const price = selectedAlternative ? selectedAlternative.price : product.dealPrice;
              const lineTotal = price * quantity;

              return (
                <div
                  key={product.id}
                  className={`p-3.5 rounded-xl border transition ${
                    isChecked
                      ? 'bg-slate-950/40 border-slate-800 opacity-60'
                      : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleCheck(product.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
                      )}
                    </button>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                          {selectedAlternative ? selectedAlternative.brand : product.brand}
                        </span>
                        {selectedAlternative && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                            Chosen Alternative
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs font-bold text-white leading-snug mt-0.5 ${isChecked ? 'line-through text-slate-400' : ''}`}>
                        {selectedAlternative ? selectedAlternative.name : product.title}
                      </h4>

                      <div className="text-[11px] text-slate-400 mt-0.5">
                        ${price.toFixed(2)} {selectedAlternative ? selectedAlternative.unit : product.unit}
                      </div>

                      {/* Quantity Controls & Line Price */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/60">
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-white">
                            ${lineTotal.toFixed(2)}
                          </span>
                          <button
                            onClick={() => onRemoveItem(product.id)}
                            className="text-slate-500 hover:text-rose-400 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer Actions */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-2 shrink-0 pb-8 sm:pb-4">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition min-h-[44px]"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Trip Checklist</span>
            </button>
            <button
              onClick={onClearAll}
              className="w-full text-center py-2 text-xs text-slate-400 hover:text-rose-400 transition min-h-[36px]"
            >
              Clear entire list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
