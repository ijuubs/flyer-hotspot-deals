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
  ShoppingBag
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-xl flex justify-end animate-in fade-in duration-150 font-sans">
      <div 
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200 glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">Shopping Trip List</h3>
              <p className="text-xs text-slate-400">
                {items.length} item{items.length !== 1 ? 's' : ''} saved from flyer hotspots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Cost & Savings Bar */}
        {items.length > 0 && (
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 font-mono">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Estimated Total</span>
                <span className="text-xl font-black text-white tabular-nums">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 font-mono">
                <span className="text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                  <TrendingDown className="w-3.5 h-3.5" /> Savings
                </span>
                <span className="text-xl font-black text-emerald-400 tabular-nums">
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
              <p className="text-sm font-extrabold text-white">Your shopping trip list is empty</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Click any hotspot product on the flyer to add items to your trip checklist!
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const { product, quantity, selectedAlternative } = item;
              const isChecked = checkedItems.has(product.id);
              const price = selectedAlternative ? selectedAlternative.price : product.dealPrice;
              const lineTotal = price * quantity;

              return (
                <div
                  key={`cart-${product.id}-${idx}`}
                  className={`p-3.5 rounded-2xl border transition ${
                    isChecked
                      ? 'bg-slate-950/40 border-slate-800 opacity-60'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
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

                    {/* Item details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-0.5">
                        <span className="text-emerald-400 uppercase tracking-wider">
                          {selectedAlternative ? selectedAlternative.brand : product.brand}
                        </span>
                        {selectedAlternative && (
                          <span className="text-indigo-400 font-semibold">
                            Chosen Alt
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs font-extrabold text-white leading-snug ${isChecked ? 'line-through text-slate-500' : ''}`}>
                        {selectedAlternative ? selectedAlternative.name : product.title}
                      </h4>

                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        ${price.toFixed(2)} {selectedAlternative ? selectedAlternative.unit : product.unit}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800">
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-white tabular-nums">
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
                          <span className="font-mono font-black text-sm text-white tabular-nums">
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

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/95 space-y-2 shrink-0 pb-8 sm:pb-4 safe-area-bottom">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs text-slate-950 transition min-h-[44px] shadow-lg shadow-emerald-600/20"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print Shopping Trip Checklist</span>
            </button>
            <button
              onClick={onClearAll}
              className="w-full text-center py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 transition min-h-[36px]"
            >
              Clear entire list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
