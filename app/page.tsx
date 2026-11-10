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
import FlyerGalleryView from '@/components/FlyerGalleryView';
import FlyerPopUpViewerModal from '@/components/FlyerPopUpViewerModal';
import HotspotEditModal from '@/components/HotspotEditModal';
import MobileMenuDrawer from '@/components/MobileMenuDrawer';
import { SAMPLE_FLYERS } from '@/data/sampleFlyers';
import { Flyer, ProductDetail, CartItem, SimilarProduct, HotspotBox } from '@/types/flyer';
import { Sparkles } from 'lucide-react';
import { useSyncedStorage, resetAppDatabase } from '@/lib/storage';

export default function HomePage() {
  const [customFlyers, setCustomFlyers] = useSyncedStorage<Flyer[]>('flyerspot_custom_flyers', []);
  const [deletedFlyerIds, setDeletedFlyerIds] = useSyncedStorage<string[]>('flyerspot_deleted_flyers', []);
  const [toastInfo, setToastInfo] = useState<{ show: boolean; title: string; subtitle: string }>({
    show: false,
    title: '',
    subtitle: '',
  });
  
  // Deduplicate flyers by ID, filter out deleted flyers, and ensure all product IDs are strictly unique
  const flyersMap = new Map<string, Flyer>();
  SAMPLE_FLYERS.forEach((f) => {
    if (!deletedFlyerIds.includes(f.id)) {
      flyersMap.set(f.id, f);
    }
  });
  customFlyers.forEach((f) => {
    if (!deletedFlyerIds.includes(f.id)) {
      flyersMap.set(f.id, f);
    }
  });
  const rawFlyers = Array.from(flyersMap.values());

  const flyers: Flyer[] = rawFlyers.map((f) => {
    const seenProdIds = new Set<string>();
    const unpackedProducts: ProductDetail[] = [];

    f.products.forEach((p, pIdx) => {
      const textLower = ((p.title || '') + ' ' + (p.rawOcrText || '')).toLowerCase();
      const isMergedRooster = p.id.includes('rooster-chicken-17-19') ||
        (textLower.includes('#17') && textLower.includes('#19')) ||
        (textLower.includes('18.50') && textLower.includes('20.95'));

      if (isMergedRooster) {
        unpackedProducts.push({
          ...p,
          id: `${f.id}-rooster-chicken-17`,
          title: 'Rooster Whole Dressed Chicken #17',
          brand: 'Rooster Poultry',
          category: 'Butcher & Seafood',
          dealPrice: 18.50,
          originalPrice: 22.50,
          unit: '#17 bird (approx 1.7kg)',
          unitPrice: '$10.88 / kg',
          discountPercent: 18,
          badge: 'Top Sunday Roast',
          rawOcrText: "rooster Fiji's Premier Quality chicken #17 $18.50 EA",
          box: { x: 2.5, y: 56.5, width: 17.5, height: 18.0 },
        });

        unpackedProducts.push({
          ...p,
          id: `${f.id}-rooster-chicken-19`,
          title: 'Rooster Whole Dressed Chicken #19',
          brand: 'Rooster Poultry',
          category: 'Butcher & Seafood',
          dealPrice: 20.95,
          originalPrice: 25.50,
          unit: '#19 jumbo bird (approx 1.9kg)',
          unitPrice: '$11.02 / kg',
          discountPercent: 18,
          badge: 'Jumbo Family Bird',
          rawOcrText: "rooster Fiji's Premier Quality chicken #19 $20.95 EA",
          box: { x: 20.5, y: 56.5, width: 17.5, height: 18.0 },
        });
      } else {
        let finalId = p.id;
        if (seenProdIds.has(finalId)) {
          finalId = `${f.id}-${p.id}-${pIdx}`;
        }
        seenProdIds.add(finalId);
        unpackedProducts.push({ ...p, id: finalId });
      }
    });

    return { ...f, products: unpackedProducts };
  });

  const [currentFlyer, setCurrentFlyer] = useState<Flyer | null>(flyers[0] || null);

  const [activeView, setActiveView] = useState<'canvas' | 'gallery'>('canvas');
  const [popUpFlyerId, setPopUpFlyerId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [cropModalProduct, setCropModalProduct] = useState<ProductDetail | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hotspotStyle, setHotspotStyle] = useState<'pins' | 'boxes' | 'minimal' | 'ocr'>('pins');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<'canvas' | 'products' | 'gallery' | 'cart'>('canvas');

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

  const handleDeleteFlyer = (flyerId: string) => {
    setDeletedFlyerIds((prev) => [...prev, flyerId]);
    setCustomFlyers((prev) => prev.filter((f) => f.id !== flyerId));
    const remaining = flyers.filter((f) => f.id !== flyerId);
    setCurrentFlyer(remaining.length > 0 ? remaining[0] : null);
    setSelectedProduct(null);
    setToastInfo({
      show: true,
      title: 'Flyer Deleted',
      subtitle: 'The flyer was removed from catalog.',
    });
    setTimeout(() => setToastInfo((prev) => ({ ...prev, show: false })), 4000);
  };

  const handleDeleteAllFlyers = () => {
    resetAppDatabase();
    setCustomFlyers([]);
    setCartItems([]);
    setDeletedFlyerIds(SAMPLE_FLYERS.map((f) => f.id));
    setCurrentFlyer(null);
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedProduct(null);
    setMobileTab('canvas');
    setActiveView('canvas');
    setToastInfo({
      show: true,
      title: 'All Uploaded Flyers & Mock Data Deleted',
      subtitle: 'Catalog is completely clean and ready for your fresh flyer uploads.',
    });
    setTimeout(() => setToastInfo((prev) => ({ ...prev, show: false })), 4500);
  };

  const handleLoadSampleFlyer = () => {
    setDeletedFlyerIds([]);
    if (SAMPLE_FLYERS.length > 0) {
      setCurrentFlyer(SAMPLE_FLYERS[0]);
      setToastInfo({
        show: true,
        title: "Joy's of the Table Flyer Loaded",
        subtitle: 'Loaded attached flyer with verified Rooster chicken deals.',
      });
      setTimeout(() => setToastInfo((prev) => ({ ...prev, show: false })), 4000);
    }
  };

  const handleResetDatabase = () => {
    resetAppDatabase();
    setCustomFlyers([]);
    setCartItems([]);
    setDeletedFlyerIds([]);
    setCurrentFlyer(SAMPLE_FLYERS[0] || null);
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedProduct(null);
    setMobileTab('canvas');
    setActiveView('canvas');
    setToastInfo({
      show: true,
      title: 'Catalog Reset to Factory Defaults',
      subtitle: 'Uploaded flyers purged, verified Joy&apos;s of the Table flyer restored.',
    });
    setTimeout(() => setToastInfo((prev) => ({ ...prev, show: false })), 4500);
  };

  const handleFlyerCreated = (newFlyer: Flyer) => {
    setDeletedFlyerIds((prev) => prev.filter((id) => id !== newFlyer.id));
    setCustomFlyers((prev) => [newFlyer, ...prev.filter((f) => f.id !== newFlyer.id)]);
    setCurrentFlyer(newFlyer);
    setSelectedCategory('All');
    setSearchQuery('');
    setMobileTab('canvas');
  };

  const handleSaveCrop = (productId: string, updatedBox: HotspotBox, croppedImageUrl?: string) => {
    if (!currentFlyer) return;
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
    if (!currentFlyer) return;
    const uniqueSuffix = Math.random().toString(36).substring(2, 9);
    const newProduct: ProductDetail = {
      id: `p-custom-${Date.now()}-${uniqueSuffix}`,
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
    if (!currentFlyer) return;
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

  const handleUpdateProduct = (updatedProduct: ProductDetail) => {
    if (!currentFlyer) return;
    const updatedFlyer = {
      ...currentFlyer,
      products: currentFlyer.products.map((p) =>
        p.id === updatedProduct.id ? updatedProduct : p
      ),
    };
    setCurrentFlyer(updatedFlyer);
    setCustomFlyers((prev) =>
      prev.map((f) => (f.id === updatedFlyer.id ? updatedFlyer : f))
    );
    if (selectedProduct?.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
  };

  const handleAcceptAutoCropCandidate = (productId: string) => {
    if (!currentFlyer) return;
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
    if (!currentFlyer) return;
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

  const handleBulkRecategorize = (productIds: string[], newCategory: string) => {
    if (!currentFlyer) return;
    const updatedFlyer = {
      ...currentFlyer,
      products: currentFlyer.products.map((p) =>
        productIds.includes(p.id) ? { ...p, category: newCategory } : p
      ),
    };
    setCurrentFlyer(updatedFlyer);
    setCustomFlyers((prev) =>
      prev.map((f) => (f.id === updatedFlyer.id ? updatedFlyer : f))
    );
  };

  const handleApplyDetectedHotspots = (products: ProductDetail[], categories?: string[]) => {
    if (!currentFlyer) return;
    const updatedFlyer: Flyer = {
      ...currentFlyer,
      products,
      categories: categories && categories.length ? categories : currentFlyer.categories,
    };
    setCurrentFlyer(updatedFlyer);
    setCustomFlyers((prev) =>
      prev.map((f) => (f.id === updatedFlyer.id ? updatedFlyer : f))
    );
    if (products.length > 0) {
      setSelectedProduct(products[0]);
    }
  };

  // Next / Prev navigation inside modal
  const currentProductIndex = selectedProduct && currentFlyer
    ? currentFlyer.products.findIndex((p) => p.id === selectedProduct.id)
    : -1;

  const handlePrevProduct = () => {
    if (!currentFlyer || currentFlyer.products.length === 0) return;
    if (currentProductIndex > 0) {
      setSelectedProduct(currentFlyer.products[currentProductIndex - 1]);
    } else if (currentProductIndex === 0) {
      setSelectedProduct(currentFlyer.products[currentFlyer.products.length - 1]);
    }
  };

  const handleNextProduct = () => {
    if (!currentFlyer || currentFlyer.products.length === 0) return;
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
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenFlyerPopUp={(flyer) => setPopUpFlyerId(flyer.id)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
        onResetDatabase={handleResetDatabase}
        onDeleteAllFlyers={handleDeleteAllFlyers}
      />

      {/* Main Responsive Workspace or Flyer Gallery */}
      <main className="flex-1 flex flex-row overflow-hidden relative pb-14 lg:pb-0">
        {activeView === 'gallery' || mobileTab === 'gallery' ? (
          <FlyerGalleryView
            flyers={flyers}
            onOpenFlyerPopUp={(flyer) => setPopUpFlyerId(flyer.id)}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        ) : (
          <>
            {/* Canvas Pane (Visible on desktop/tablet, or on mobile when 'canvas' tab active) */}
            <div
              className={`flex-1 h-full overflow-hidden relative ${
                mobileTab === 'canvas' ? 'block' : 'hidden lg:block'
              }`}
            >
              <FlyerCanvas
                key={currentFlyer ? currentFlyer.id : 'empty-canvas'}
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
                onEditProduct={(p) => setEditingProduct(p)}
                onBulkRecategorize={handleBulkRecategorize}
                onApplyDetectedHotspots={handleApplyDetectedHotspots}
                isAdminMode={isAdminMode}
                onOpenUpload={() => setIsUploadOpen(true)}
                onLoadSampleFlyer={handleLoadSampleFlyer}
                onDeleteFlyer={handleDeleteFlyer}
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
                onEditProduct={(p) => setEditingProduct(p)}
                isAdminMode={isAdminMode}
              />
            </div>
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={mobileTab}
        onChangeTab={(tab) => {
          if (tab === 'cart') {
            setIsShoppingListOpen(true);
          } else if (tab === 'gallery') {
            setActiveView('gallery');
            setMobileTab('gallery');
          } else {
            setActiveView('canvas');
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

      {/* Mobile Drawer Menu System */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
        flyers={flyers}
        currentFlyer={currentFlyer}
        onSelectFlyer={handleSelectFlyer}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenShoppingList={() => setIsShoppingListOpen(true)}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        totalSavings={totalSavings}
        hotspotStyle={hotspotStyle}
        onHotspotStyleChange={setHotspotStyle}
        showHotspots={showHotspots}
        onToggleShowHotspots={() => setShowHotspots(!showHotspots)}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
        onResetDatabase={handleResetDatabase}
        onDeleteAllFlyers={handleDeleteAllFlyers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Admin Hotspot Editor Modal */}
      {editingProduct && (
        <HotspotEditModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          onSave={handleUpdateProduct}
          onDelete={handleDeleteProductHotspot}
        />
      )}

      {/* Interactive Fullscreen Flyer Pop-up Viewer Modal with Pagination */}
      {popUpFlyerId && (
        <FlyerPopUpViewerModal
          isOpen={!!popUpFlyerId}
          onClose={() => setPopUpFlyerId(null)}
          flyers={flyers}
          initialFlyerId={popUpFlyerId}
          onSelectProduct={(p) => setSelectedProduct(p)}
          selectedProductId={selectedProduct?.id}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          hotspotStyle={hotspotStyle}
          onHotspotStyleChange={setHotspotStyle}
          showHotspots={showHotspots}
          onToggleShowHotspots={() => setShowHotspots(!showHotspots)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          cartProductIds={cartProductIds}
          onOpenCropModal={(p) => setCropModalProduct(p)}
          onAddProductHotspot={handleAddProductHotspot}
          onDeleteProductHotspot={handleDeleteProductHotspot}
          onAcceptAutoCropCandidate={handleAcceptAutoCropCandidate}
          onAcceptAllAutoCropCandidates={handleAcceptAllAutoCropCandidates}
        />
      )}

      {/* Product Detail & Comparison Modal */}
      {selectedProduct && (
        <ProductDetailModal
          key={`detail-modal-${selectedProduct.id}`}
          product={selectedProduct}
          flyerImageUrl={currentFlyer?.imageUrl || ''}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isInCart={cartProductIds.has(selectedProduct.id)}
          onPrevProduct={handlePrevProduct}
          onNextProduct={handleNextProduct}
          totalProductsCount={currentFlyer?.products.length || 0}
          currentProductIndex={currentProductIndex}
          onOpenCropModal={() => setCropModalProduct(selectedProduct)}
        />
      )}

      {/* Product Image Cropper Modal */}
      {cropModalProduct && (
        <ProductCropModal
          key={`crop-modal-${cropModalProduct.id}`}
          isOpen={!!cropModalProduct}
          onClose={() => setCropModalProduct(null)}
          product={cropModalProduct}
          flyerImageUrl={currentFlyer?.imageUrl || ''}
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

      {/* Database & Factory Defaults Reset Toast Banner */}
      {toastInfo.show && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-emerald-400 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 max-w-[92vw]">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-xs sm:text-sm text-emerald-300">{toastInfo.title}</div>
            <div className="text-[11px] sm:text-xs text-slate-300 truncate">{toastInfo.subtitle}</div>
          </div>
        </div>
      )}
    </div>
  );
}
