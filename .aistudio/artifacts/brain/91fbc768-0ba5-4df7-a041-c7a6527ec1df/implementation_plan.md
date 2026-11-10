# FlyerSpot Complete Visual & Architectural Redesign Plan

Comprehensive visual rebrand, typography overhaul, navigation redesign, theme styling, and motion architecture upgrade for the FlyerSpot Interactive Flyer & Hotspot Intelligence App.

> [!IMPORTANT]
> **Confirmed Rebrand Decisions**:
> - **Visual Theme**: Modern Luxury Dark — Obsidian dark canvas (`#020617`), slate card surfaces (`#0f172a`), emerald accents (`#10b981`), and subtle gold/amber highlights.
> - **Navigation Architecture**: 3-Zone Header on desktop paired with an ergonomic Floating Dock menu on mobile.
> - **Motion & Animations**: Smooth spring transitions via `motion/react`, tactile hover micro-interactions, glowing progress bars, and glassmorphic overlays.

---

## 1. Overview & Core Concept

**FlyerSpot** converts static grocery & retail promotional flyer images into interactive, clickable hotspot zones with real-time deal analysis, OCR text extraction, and store price comparisons.

This redesign transforms the UI from a standard dark layout into a **production-grade luxury interactive catalog**, incorporating refined spatial layout, disciplined typography, custom loading states, clean single-line navigation, and fluid animations.

---

## 2. User Experience & Visual Design

### Visual Identity & Color System (60-30-10 Rule)
- **60% Canvas**: Deep Obsidian Slate (`#020617` / `bg-slate-950`) with subtle radial dark gradient highlights (`radial-gradient(ellipse at top, #0f172a, #020617)`).
- **30% Structural Surfaces**: Glassmorphic slate card containers (`#0f172a` / `bg-slate-900/80` with `border border-slate-800/80` and backdrop blur).
- **10% Accent Budget**: High-intent Emerald (`#10b981` / `#059669`) for interactive deal CTAs, savings callouts, and primary active states; Amber Gold (`#f59e0b`) for headline offers & AI candidate hotspots.

### Typography & Type Scale
- **Display & Headlines**: `Plus Jakarta Sans` / `Outfit` — bold, modern geometric sans-serif for high visual impact and legible brand presence.
- **Body & Controls**: `Manrope` / `DM Sans` — clean, highly readable grotesque sans-serif for descriptions, specs, and navigation labels.
- **Tabular Data & OCR**: `JetBrains Mono` / `font-mono tabular-nums` for crisp price tags, discount percentages, coordinates, and raw OCR text.

### Layout & Navigation Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ ZONE 1: BRAND WORDMARK   │   ZONE 2: NAV LINKS           │ ZONE 3: ACTIONS & CART           │
│ FlyerSpot [OCR Vision]   │   Flyers · Deals · Analytics  │ Search · Upload · Cart ($0.00)   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────┴─────────────────────────────────────────────────┐
│                                 MAIN WORKSPACE CONTAINER                                    │
│  ┌──────────────────────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ Interactive Flyer Canvas                         │  │ Product Directory Sidebar       │  │
│  │ (Pan, Zoom, Bounding Box Hotspots, Draw Mode)   │  │ (Categories, Price Sort, Search)│  │
│  └──────────────────────────────────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────┴─────────────────────────────────────────────────┐
│ MOBILE FLOATING DOCK (Ergonomic Thumb Navigation)                                            │
│ [Canvas]    [Products]    [+ Upload]    [Gallery]    [Cart (3)]                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Desktop Top Bar (3-Zone Contract)
- **Zone 1 (Brand)**: Single-element wordmark `FlyerSpot` with an emerald indicator dot.
- **Zone 2 (Navigation)**: Single-line text links (`Interactive Canvas`, `Flyer Gallery`, `Admin Studio`, `Deal Analytics`).
- **Zone 3 (Actions)**: Quick Search shortcut, Mode toggle (User/Admin), Batch Upload CTA, and Cart trigger with live count badge.

#### 2. Mobile Ergonomic Floating Dock
- Floating pill dock anchored at the bottom with thumb-friendly targets ($\ge 44\text{px}$).
- Smooth active tab indicator sliding beneath selected item (`Canvas`, `Deals`, `Convert Flyer`, `Cart`).

#### 3. Redesigned Modals & Drawers
- **Product Detail & Price Comparison Modal**: Full-screen split layout with zoomable product crop, specs matrix, smart verdict badge, and competitor price comparison.
- **Flyer Pop-up Viewer**: Lightbox viewer with thumbnail page slider and directional keyboard pagination.
- **Batch Upload Modal**: Glowing drag-and-drop zone with OCR sensitivity selector (High/Medium/Fast) and itemized batch queue status.
- **Draw Mode & Hotspot Editor**: Precise bounding box handles with live coordinate feedback.

---

## 3. Key Product Decisions & Trade-Offs

1. **Theme Strategy**: Standardize on a unified dark luxury theme with CSS variables in `globals.css` and Tailwind classes.
2. **Animation Engine**: Leverage `motion/react` for route changes, modal entrances, glowing candidate borders, and floating dock indicators.
3. **Typography Loading**: Import Google Fonts (`Plus Jakarta Sans`, `Manrope`, `JetBrains Mono`) directly in `app/layout.tsx` to prevent font shifts.
4. **Custom Loaders**: Replace generic spinners with bespoke glowing OCR scan bars, shimmer skeletons, and batch progress indicators.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      Next.js App Router                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ app/layout.tsx (Google Fonts: Plus Jakarta Sans, Manrope, JetBrains Mono)             │  │
│  │ app/globals.css (Tailwind v4 theme variables, glass gradients, spring keyframes)      │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                              │                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ app/page.tsx (Global State, Sync Store, Navigation View Switcher)                    │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│          │                           │                           │               │          │
│   ┌──────┴──────┐             ┌──────┴──────┐             ┌──────┴──────┐ ┌──────┴──────┐   │
│   │ Navbar.tsx  │             │ Canvas.tsx  │             │ Sidebar.tsx │ │ Gallery.tsx │   │
│   └─────────────┘             └─────────────┘             └─────────────┘ └─────────────┘   │
│          │                           │                           │               │          │
│   ┌──────┴───────────────────────────┴───────────────────────────┴───────────────┴──────┐   │
│   │ Modals: ProductDetail, ProductCrop, HotspotEdit, FlyerPopUp, UploadModal, Dock       │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Redesign Checklist
1. `app/globals.css`: Add custom gradient utilities, glassmorphism backdrops, and font family definitions.
2. `app/layout.tsx`: Inject Google Fonts metadata and viewport settings.
3. `components/Navbar.tsx`: Restyle to 3-zone contract with glass blur, emerald accents, and single-line links.
4. `components/FlyerCanvas.tsx`: Upgrade hotspot styles (Pins, Bounding Boxes, Minimal Dots, OCR Transcriptions) with glowing spring borders and Draw Mode visual feedback.
5. `components/FlyerSidebar.tsx`: Redesign category pills into clean segmented filters, tabular price items, and hover scale effects.
6. `components/FlyerGalleryView.tsx`: Upgrade card grid with 16:9 thumbnail covers, glass badges, and smooth entrance staggers.
7. `components/MobileBottomNav.tsx` & `MobileMenuDrawer.tsx`: Restyle floating bottom dock with active indicator glow and ergonomic bottom drawer.
8. `components/ProductDetailModal.tsx` & `ProductCropModal.tsx`: Apply obsidian glass surfaces, crisp typography, and competitor price charts.
9. `components/FlyerUploadModal.tsx`: Restyle upload dropzone with glowing scan line loader and sensitivity pills.
