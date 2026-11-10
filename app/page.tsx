'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FlyerCanvas from '@/components/FlyerCanvas';
import FlyerSidebar from '@/components/FlyerSidebar';
import ProductDetailModal from '@/components/ProductDetailModal';
import ProductCropModal from '@/components/ProductCropModal';
import ShoppingListDrawer from '@/components/ShoppingListDrawer';
import FlyerUploadModal from '@/components/FlyerUploadModal';
import MobileBottomNav from '@/components/MobileBottomNav';
import { SAMPLE_FLYERS } from '@/data/sampleFlyers';
import { Flyer, ProductDetail, CartItem, SimilarProduct, HotspotBox } from '@/types/flyer';

import { useSyncedStorage } from '@/lib/storage';

export default function HomePage() {
  const [customFlyers, setCustomFlyers] = useSyncedStorage<Flyer[]>('flyerspot_custom_flyers', []);
  const flyers = [...SAMPLE_FLYERS, ...customFlyers];

  const [currentFlyer, setCurrentFlyer] = useState<Flyer>(SAMPLE_FLYERS[0]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [cropModalProduct, setCropModalProduct] = useState<ProductDetail | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hotspotStyle, setHotspotStyle] = useState<'pins' | 'boxes' | 'minimal' | 'ocr'>('pins');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'canvas' | 'products' | 'cart'>('canvas');

  // Shopping list / Cart state (Hydration-safe external store)
  const [cartItems, setCartItems] = useSyncedStorage<CartItem[]>('flyerspot_cart', []);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  const handleSelectFlyer = (flyer: Flyer) => {
    setCurrentFlyer(flyer);
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedProduct(null);
    setMobileTab('canvas');
  };

  const handleAddToCart = (
    product: ProductDetail, 
    quantity: number = 1, 
    selectedAlternative?: SimilarProduct
  ) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
          selectedAlternative: selectedAlternative || updated[existingIdx].selectedAlternative,
        };
        return updated;
      }
      return [...prev, { product, quantity, selectedAlternative }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearAllCart = () => {
    setCartItems([]);
  };

  const handleFlyerCreated = (newFlyer: Flyer) => {
    setCustomFlyers((prev) => [newFlyer, ...prev]);
    setCurrentFlyer(newFlyer);
    setSelectedCategory('All');
    setSearchQuery('');
    setMobileTab('canvas');
  };

  const handleSaveCrop = (productId: string, updatedBox: HotspotBox, croppedImageUrl?: string) => {
    const updateProductList = (products: ProductDetail[]) =>
      products.map((p) =>
        p.id === productId
          ? { ...p, box: updatedBox, ...(croppedImageUrl ? { croppedImageUrl } : {}) }
          : p
      );

    const updatedFlyer = {
      ...currentFlyer,
      products: updateProductList(currentFlyer.products),
    };

    setCurrentFlyer(updatedFlyer);
    setCustomFlyers((prev) =>
      prev.map((f) => (f.id === updatedFlyer.id ? updatedFlyer : f))
    );

    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct({
        ...selectedProduct,
        box: updatedBox,
        ...(croppedImageUrl ? { croppedImageUrl } : {}),
      });
    }
  };

  const handleAddProductHotspot = (box: HotspotBox) => {
    const newProduct: ProductDetail = {
      id: `p-custom-${Date.now()}`,
      flyerId: currentFlyer.id,
      title: `Custom Hotspot #${currentFlyer.products.length + 1}`,
      brand: currentFlyer.store,
      category: 'General',
      dealPrice: 9.95,
      originalPrice: 12.95,
      unit: 'pack',
      unitPrice: '$9.95 / pack',
      discountPercent: 23,
      badge: 'Custom Hotspot',
      rawOcrText: `Custom Hotspot #${currentFlyer.products.length + 1} $9.95`,
      dealTileType: 'grid_tile',
      tileIndex: currentFlyer.products.length + 1,
      dealScore: 9.0,
      dealScoreRationale: 'User-created custom product bounding box.',
      description: 'Custom hotspot zone added manually to map this flyer product.',
      highlights: ['Custom hotspot box', 'User defined deal', 'Fully editable'],
      specs: { Status: 'User Created Box' },
      stockStatus: 'in_stock',
      box,
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      smartVerdict: {
        recommendation: 'strong_buy',
        headline: 'User Defined Hotspot Zone',
        reasoning: 'Custom added product zone.',
        bestFor: 'Individual shopping preferences.',
      },
      similarProducts: [],
    };

    const updatedFlyer = {
      ...currentFlyer,
      products: [...currentFlyer.products, newProduct],
    };

    setCurrentFlyer(updatedFlyer);
    setCustomFlyers((prev) =>
      prev.map((f) => (f.id === updatedFlyer.id ? updatedFlyer : f))
    );
    setSelectedProduct(newProduct);
  };

  const handleDeleteProductHotspot = (productId: string) => {
    const updatedFlyer = {
      ...currentFlyer,
      products: currentFlyer.products.filter((p) => p.id !== productId),
    };
    setCurrentFlyer(updatedFlyer);
    setCustomFlyers((prev) =>
      prev.map((f) => (f.id === updatedFlyer.id ? updatedFlyer : f))
    );
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
  };

  const handleAcceptAutoCropCandidate = (productId: string) => {
    const updatedFlyer = {
      ...currentFlyer,
      products: currentFlyer.products.map((p) =>
        p.id === productId ? { ...p, isCandidate: false } : p
      ),
    };
    setCurrentFlyer(updatedFlyer);
    setCustomFlyers((prev) =>
      prev.map((f) => (f.id === updatedFlyer.id ? updatedFlyer : f))
    );
  };

  const handleAcceptAllAutoCropCandidates = () => {
    const updatedFlyer = {
      ...currentFlyer,
      products: currentFlyer.products.map((p) =>
        p.isCandidate ? { ...p, isCandidate: false } : p
      ),
    };
    setCurrentFlyer(updatedFlyer);
    setCustomFlyers((prev) =>
      prev.map((f) => (f.id === updatedFlyer.id ? updatedFlyer : f))
    );
  };

  // Next / Prev navigation inside modal
  const currentProductIndex = selectedProduct
    ? currentFlyer.products.findIndex((p) => p.id === selectedProduct.id)
    : -1;

  const handlePrevProduct = () => {
    if (currentProductIndex > 0) {
      setSelectedProduct(currentFlyer.products[currentProductIndex - 1]);
    } else if (currentProductIndex === 0) {
      setSelectedProduct(currentFlyer.products[currentFlyer.products.length - 1]);
    }
  };

  const handleNextProduct = () => {
    if (currentProductIndex < currentFlyer.products.length - 1) {
      setSelectedProduct(currentFlyer.products[currentProductIndex + 1]);
    } else if (currentProductIndex === currentFlyer.products.length - 1) {
      setSelectedProduct(currentFlyer.products[0]);
    }
  };

  const cartProductIds = new Set(cartItems.map((c) => c.product.id));

  const totalSavings = cartItems.reduce((sum, item) => {
    if (!item.selectedAlternative && item.product.originalPrice > item.product.dealPrice) {
      return sum + (item.product.originalPrice - item.product.dealPrice) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Navbar
        flyers={flyers}
        currentFlyer={currentFlyer}
        onSelectFlyer={handleSelectFlyer}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenShoppingList={() => setIsShoppingListOpen(true)}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        totalSavings={totalSavings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hotspotStyle={hotspotStyle}
        onHotspotStyleChange={setHotspotStyle}
        showHotspots={showHotspots}
        onToggleShowHotspots={() => setShowHotspots(!showHotspots)}
      />

      {/* Main Responsive Workspace */}
      <main className="flex-1 flex flex-row overflow-hidden relative pb-14 lg:pb-0">
        {/* Canvas Pane (Visible on desktop/tablet, or on mobile when 'canvas' tab active) */}
        <div
          className={`flex-1 h-full overflow-hidden relative ${
            mobileTab === 'canvas' ? 'block' : 'hidden lg:block'
          }`}
        >
          <FlyerCanvas
            key={currentFlyer.id}
            flyer={currentFlyer}
            onSelectProduct={(p) => setSelectedProduct(p)}
            selectedProductId={selectedProduct?.id}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            hotspotStyle={hotspotStyle}
            showHotspots={showHotspots}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            cartProductIds={cartProductIds}
            onOpenCropModal={(p) => setCropModalProduct(p)}
            onAddProductHotspot={handleAddProductHotspot}
            onDeleteProductHotspot={handleDeleteProductHotspot}
            onAcceptAutoCropCandidate={handleAcceptAutoCropCandidate}
            onAcceptAllAutoCropCandidates={handleAcceptAllAutoCropCandidates}
          />
        </div>

        {/* Sidebar Product Directory (Visible on desktop, or on mobile when 'products' tab active) */}
        <div
          className={`h-full ${
            mobileTab === 'products'
              ? 'block w-full'
              : 'hidden lg:block lg:w-80 xl:w-96'
          }`}
        >
          <FlyerSidebar
            flyer={currentFlyer}
            selectedProductId={selectedProduct?.id}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              // On mobile, switch to canvas so user sees the spotlight
              if (window.innerWidth < 1024) {
                setMobileTab('canvas');
              }
            }}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            cartProductIds={cartProductIds}
            onOpenCropModal={(p) => setCropModalProduct(p)}
            onCloseMobile={() => setMobileTab('canvas')}
          />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={mobileTab}
        onChangeTab={(tab) => {
          if (tab === 'cart') {
            setIsShoppingListOpen(true);
          } else {
            setMobileTab(tab);
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenCart={() => setIsShoppingListOpen(true)}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        totalSavings={totalSavings}
        showHotspots={showHotspots}
        onToggleHotspots={() => setShowHotspots(!showHotspots)}
        onOpenSearch={() => {}}
      />

      {/* Product Detail & Comparison Modal */}
      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct.id}
          product={selectedProduct}
          flyerImageUrl={currentFlyer.imageUrl}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isInCart={cartProductIds.has(selectedProduct.id)}
          onPrevProduct={handlePrevProduct}
          onNextProduct={handleNextProduct}
          totalProductsCount={currentFlyer.products.length}
          currentProductIndex={currentProductIndex}
          onOpenCropModal={() => setCropModalProduct(selectedProduct)}
        />
      )}

      {/* Product Image Cropper Modal */}
      {cropModalProduct && (
        <ProductCropModal
          key={cropModalProduct.id}
          isOpen={!!cropModalProduct}
          onClose={() => setCropModalProduct(null)}
          product={cropModalProduct}
          flyerImageUrl={currentFlyer.imageUrl}
          onSaveCrop={handleSaveCrop}
        />
      )}

      {/* Shopping Trip Checklist Drawer */}
      <ShoppingListDrawer
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearAll={handleClearAllCart}
      />

      {/* Flyer Upload / Ingestion Modal */}
      <FlyerUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFlyerCreated={handleFlyerCreated}
        sampleFlyers={SAMPLE_FLYERS}
        onSelectSample={handleSelectFlyer}
      />
    </div>
  );
}
