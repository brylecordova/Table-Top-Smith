# TableSmith: Universal Visual Layer & Element Engine Plan

A comprehensive upgrade to TableSmith Studio that transforms all 7 boardgame editors into a unified, high-precision visual drafting environment. Enables freeform drag-and-drop element repositioning, multi-handle resizing, rotational controls, rich typography text boxes, multi-layered image frames with borderless options, an integrated Tabletop Icon Library with inline insertion, layer z-ordering, element alignment tools, and undo/redo history.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The architectural blueprint below incorporates all confirmed choices from your requirements interview:

- **Canvas Interaction**: Direct click-and-drag element selection with 8 bounding box resize handles, rotation anchor handle, and millimeter snap-to-grid guides across Cards, Box Nets, Tokens, Standees, and Game Boards.
- **Typography & Text Boxes**: Freeform and bounded text boxes with granular control over font-family (display, serif, sans, fantasy, mono), font-weight ($100$ to $900$), font-style (italic, normal), font-size ($6\text{pt}$ to $72\text{pt}$), line-height, text-align, letter-spacing, text color, and dropshadow/outline.
- **Section Image Frames & Dual-Layer Art**: Configurable image containers bound to specific regions (e.g. card portrait, board territory, standee cutout) with border control (0 border for invisible clipping masks, custom colors, corner radius), plus dual-layer background image + foreground cutout compositing.
- **Tabletop Icon Library**: Dedicated searchable icon drawer organized by game categories (Weapons, Armor, Magic, Resources, Dice, Stats, Statuses) supporting 3 insertion modes:
  1. *Inline Text Insertion*: Insert icons directly into rules text (e.g. `Deal 3 ⚔️ damage and gain 1 🛡️`).
  2. *Free-Floating Icon Layer*: Scale, rotate, and colorize icons anywhere on the canvas.
  3. *Portrait / Insignia Mode*: Set an icon directly as the card, token, or standee hero emblem.
- **Pro Editor Suite**:
  - *Layer Management*: Drag to reorder z-index, lock layers, hide/show toggles, and layer naming.
  - *Alignment & Distribution*: 1-click tools for Align Left, Center H/V, Align Right, Top, Bottom, and Distribute Spacing.
  - *Mask Frames & Opacity*: Opacity sliders ($0\%$ to $100\%$) and blend mode overlays.
  - *Undo / Redo History*: Full stack state snapshots with `Ctrl+Z` / `Ctrl+Y` keyboard shortcuts.

---

### 1. Overview & Core Concept

#### What This Upgrade Delivers
Previously, component layouts adhered to fixed template schemas. This upgrade introduces the **Universal Visual Layer Engine (`CanvasElement`)**, giving designers CAD-level creative freedom while preserving boardgame production constraints:
- **Card Creator**: Drag art portraits, text rules boxes, stat badges, and flavor text freely. Add multiple image boxes, invisible foreground art cutouts (character art popping outside the frame), and custom back overlays.
- **Box Dieline Creator**: Drag logos, warnings, publisher badges, barcode boxes, and side panel graphics directly on any face of the 2D box net.
- **Token & Standee Creator**: Freely place stat numbers, dual icons, name plaques, and base indicators with sub-millimeter precision.
- **Game Board Creator**: Drag victory point tracks, territory banners, resource slots, and player positions directly onto single, bi-fold, or quad-fold boards.
- **Rulebook & Print Hub**: Retain dynamic page indexing and imposition tiling with full visibility into custom element bounds.

---

### 2. User Experience & Visual Design

#### Visual Interaction Model
The editor canvas integrates an intuitive bounding box HUD matching Figma and Illustrator ergonomics:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ [↶ Undo] [↷ Redo] │ [Align: ⇤ ╪ ⇥ ⤒ ╫ ⤓] [Distribute] │ [Snap: 1mm] │ [Add Text] [Add Frame] [Icons]│
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                          (○) [Rotate Handle]                                │
│                                           │                                                 │
│               [■]────────────────────────[■]────────────────────────[■]                     │
│                │                                                     │                      │
│                │   ⚔️ Character Portrait Frame                       │                      │
│                │   • Foreground Cutout: Knight_Art.png (85% Opacity) │                      │
│                │   • Background Texture: Dark_Parchment.jpg          │                      │
│                │   • Border: 0px (Invisible Clipping Mask)          │                      │
│                │                                                     │                      │
│               [■]────────────────────────[■]────────────────────────[■]                     │
│                                                                                             │
│               ┌───────────────────────────────────────────────────────┐                     │
│               │ "Deal 3 ⚔️ Physical Damage. Target loses 1 🛡️."      │                     │
│               │ (Font: Outfit 13pt · Bold 700 · Tracking +0.02em)     │                     │
│               └───────────────────────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Canvas Interaction Behaviors
1. **Selection & Multi-Transform**: Clicking any element activates the 8 resize handles (corners and midpoints) plus a top rotation handle.
2. **Dragging with Live Snapping**: As elements are dragged, smart magenta guide lines appear when aligning to canvas center, safety margins, bleed boundaries, or neighboring elements.
3. **Keyboard Shortcuts**:
   - `Arrow Keys`: 1mm nudge (Shift + Arrow: 5mm nudge)
   - `Ctrl + Z` / `Ctrl + Y`: Undo / Redo
   - `Ctrl + D`: Duplicate selected element
   - `Del` / `Backspace`: Remove selected element
   - `[` / `]`: Move layer down / up in z-order
4. **Contextual Property Inspector**: Selecting an element automatically updates the right-hand panel with element-specific controls (Text attributes vs Image frame controls vs Shape borders).

---

### 3. Detailed Feature Specifications

#### A. Universal Element Data Model
Every draggable object on a canvas implements a polymorphic `CanvasElement` interface:

```typescript
export type ElementType = 'text' | 'image-frame' | 'icon' | 'shape';

export interface CanvasElement {
  id: string;
  name: string;
  type: ElementType;
  x: number; // mm
  y: number; // mm
  width: number; // mm
  height: number; // mm
  rotation: number; // degrees 0-360
  zIndex: number;
  locked: boolean;
  hidden: boolean;
  opacity: number; // 0.0 - 1.0

  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number; // pt
  fontWeight?: number; // 100-900
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  hasShadow?: boolean;
  shadowColor?: string;

  // Image Frame specific
  bgImageUrl?: string;
  fgImageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'fill';
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'none';
  borderRadius?: number;
  backgroundColor?: string;

  // Icon specific
  iconGlyph?: string;
  iconColor?: string;
  iconScale?: number;
}
```

#### B. Rich Typography & Text Box Controls
- **Font Families**: Curated typography roster:
  - *Display / Title*: **Outfit**, **Cinzel** (Fantasy/Medieval), **Bricolage Grotesque** (Modern tactical)
  - *Body Prose*: **Public Sans**, **Source Serif 4** (Classic boardgame rule text)
  - *Data & Stats*: **JetBrains Mono** (Tabular numerals)
- **Granular Formatting**:
  - Font Weight: 300 (Light), 400 (Regular), 600 (Semi-bold), 700 (Bold), 900 (Black)
  - Italic toggle, Uppercase toggle, Line-height slider ($1.0$ to $2.0$)
  - Text Color picker + Text Drop Shadow (offset, blur, color) for reading over textured backgrounds.

#### C. Section Image Frames & Dual-Layer Character Cards
- **Section Bounding**: Add dedicated image boxes (e.g. Card Portrait, Crest Badge, Map Illustration).
- **Invisible Border Toggle**: Set border to 0px / `none` for seamless edge-to-edge art integration.
- **Dual-Layer Artwork Compositing**:
  - *Background Layer*: Atmosphere, parchment, dungeon stones, or sky gradient.
  - *Foreground Layer*: Transparent PNG character or item cutout with independent scaling and offset, allowing characters to break the frame visually for modern dynamic card aesthetics.
- **Image URL or Local File Upload**: Direct upload support via data URLs or external image URLs.

#### D. Tabletop Icon Library
- **Icon Categories**:
  - ⚔️ **Combat**: Swords, Axes, Bows, Shields, Daggers, Wounds, Skulls, Armor, Helmets
  - 🔮 **Magic & Arcana**: Fire, Ice, Lightning, Runes, Potions, Scrolls, Portals
  - 🪙 **Economy & Resources**: Gold Coins, Gems, Wood, Ore, Food, Mana Crystals, Keys
  - 🎲 **Tabletop & Actions**: Dice (D4, D6, D8, D10, D20), Hourglasses, Movement Boots, Cards, Flags
  - 👥 **Classes & Factions**: Vanguard, Mage, Ranger, Rogue, Boss, Dragon
- **Integration**:
  - Click-to-insert inline tokens directly into any text area at cursor position.
  - Click-to-add as independent scalable vector/emoji element on canvas.
  - Quick-assign as card portrait or token insignia.

#### E. Pro Editor Suite: Layers, Alignment & History
- **Layer Panel**:
  - Visual layer list showing all elements on current card/board/box.
  - Drag to reorder z-index.
  - Padlock icon to lock (prevents misclicking while editing background).
  - Eye icon to hide/show layer.
- **Alignment Toolbar**:
  - Align Left / Align Center / Align Right
  - Align Top / Align Middle / Align Bottom
  - Distribute Horizontally / Distribute Vertically
- **History Snapshot Engine**:
  - Automatically captures element transforms upon drag end or property change.
  - Stack size of 50 states with instantaneous rollback on `Ctrl+Z`.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER (Vue 3 + Vite)                                │
│                                                                                             │
│  ┌───────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐  │
│  │     Interactive HUD   │   │     Element Transform     │   │      Layer & History      │  │
│  │ • TransformBox.vue    │   │ • useCanvasTransform.ts   │   │ • useHistoryStore.ts      │  │
│  │ • AlignmentBar.vue    │<──┤ • Drag & Resize Math      │<──┤ • Undo/Redo Stacks        │  │
│  │ • IconLibraryModal.vue│   │ • Rotational Trig Math    │   │ • Z-Index Sorter          │  │
│  │ • LayerTreePanel.vue  │   │ • Snap-to-Grid (1mm)      │   │ • Selection Set (multi)   │  │
│  └───────────────────────┘   └───────────────────────────┘   └───────────────────────────┘  │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ Reactive Pinia Updates
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               COMPONENT EDITORS (Vue 3)                                     │
│                                                                                             │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐│
│  │  CardCreator.vue   │ │   BoxCreator.vue   │ │  TokenCreator.vue  │ │  BoardCreator.vue  ││
│  │ • Master + Dynamic │ │ • Panel Overlays   │ │ • Dual Face Tokens │ │ • Zones & Tracks   ││
│  │ • Dual-Layer Art   │ │ • Net Graphics     │ │ • Cutout Shapes    │ │ • Grid Snapping    ││
│  └────────────────────┘ └────────────────────┘ └────────────────────┘ └────────────────────┘│
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ Sync Payload / REST API
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               SERVER & PERSISTENCE (Node + Mongo)                            │
│                                                                                             │
│  • Stores elements: CanvasElement[] inside cardGroups, boxDielines, tokens, boards          │
│  • High-DPI Imposition PDF renderer parses CanvasElement geometry to vector/image streams   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Drag & Transform Mathematical Mechanics
1. **Drag Delta**: On `mousedown` on element body, calculates pointer offset $\Delta x = \text{clientX} - x_0$. Snaps $x_{\text{new}}$ to nearest grid interval (e.g. $1\,\text{mm} \times \text{scale}$).
2. **Handle Resizing**: 8 directional handles (`nw`, `n`, `ne`, `e`, `se`, `s`, `sw`, `w`). Computes opposite-corner fixed anchor and recalculates width and height with minimum dimensions of $5\,\text{mm}$.
3. **Rotation Handle**: Located $25\,\text{px}$ above center top. Computes $\theta = \text{atan2}(y_{\text{pointer}} - y_{\text{center}}, x_{\text{pointer}} - x_{\text{center}}) \times \frac{180}{\pi}$. Snaps to $15^\circ$ increments when holding `Shift`.

---

### 5. Step-by-Step Implementation Strategy

```
Phase 1: Core Element Model & Transform HUD
  ├── Define CanvasElement schema, typography tokens, and default element factories
  ├── Implement useCanvasTransform composable (drag, 8-point resize, rotate, grid snap)
  └── Create reusable TransformBox.vue HUD overlay component

Phase 2: Tabletop Icon Library & Inline Insertion
  ├── Build comprehensive icon dataset categorized by Combat, Magic, Loot, Dice, Factions
  ├── Implement IconPicker modal and popover with search filter
  └── Enable 3 insertion hooks: inline text replacement, standalone canvas icon, and portrait asset

Phase 3: Text Formatting & Dual-Layer Image Frames
  ├── Implement rich typography inspector (fonts, weights, styles, alignments, text shadow)
  ├── Build ImageFrame component supporting background texture + transparent foreground cutout
  └── Implement border controls (solid, dashed, 0 border invisible mask, corner radius)

Phase 4: Pro Editor Controls (Layers, Alignment, History)
  ├── Implement Undo/Redo history stack with Ctrl+Z / Ctrl+Y keyboard listener
  ├── Build Alignment Toolbar (align left/center/right/top/bottom, distribute evenly)
  └── Build Layer Tree with z-index reordering, lock, hide, and duplicate toggles

Phase 5: Editor Integration & Print Sync
  ├── Wire Universal Element Engine into CardCreator.vue
  ├── Wire into BoxCreator.vue, TokenCreator.vue, StandeeCreator.vue, and BoardCreator.vue
  ├── Update PrintManager.vue to render custom elements into print-ready PDF imposition sheets
  └── Verify build and lint across all modules
```

---

### 6. Review & Next Actions

Please review this implementation plan. Once you confirm, we will proceed with implementing the Universal Visual Layer & Element Engine step-by-step.
