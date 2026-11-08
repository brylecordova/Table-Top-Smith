# TableSmith Studio — Board Game Prototyping & Imposition Workstation

> **TableSmith Studio** is a professional, production-grade visual workstation engineered for tabletop game designers, indie developers, and board game publishers. Design card decks, folding packaging box dielines, punchboard tokens, cutout standees, exploration hex maps, and official rulebook codices — with built-in duplex PDF printing, bleed calculation, and Tabletop Simulator (TTS) export.

---

## Key Highlights & Core Capabilities

| Studio Module | Primary Capability | Key Specifications & Features | Output & Production |
| :--- | :--- | :--- | :--- |
| **Cards & Decks** | Multi-deck group manager with shared & custom backs | Standard Poker, Bridge, Tarot, and Mini dimensions; CSV batch importer; 100% editable layers | High-res vector PDF, Tabletop Simulator deck sheet & JSON |
| **Packaging Box Dielines** | Parametric folding box CAD & clearance engine | Telescoping 2-piece boxes, tuck boxes, magnetic cases, matchbox sleeves, roll-end mailers | Bleed-compensated dielines with cut lines, fold creases, and glue flaps |
| **Punchboard Tokens** | Die-cut counters, markers, and game tokens | Circular, rounded square, and hexagonal tokens; custom diameter, borders, icons, and stat rings | Auto-tiled punchboard sheets with laser/die cut margins |
| **Figure Standees** | Fold-over character and boss standees | Symmetrical front/back reflection preview, custom interlocking base tabs (15×5mm), arch silhouettes | Fold-over cut sheets for plastic stands and chipboard bases |
| **Game Boards & Mats** | Full game boards, encounter mats, and exploration tiles | Single, bi-fold, and quad-fold formats; square & hex coordinate grids; clickable flip-to-reveal hex tiles | Multi-fold imposition prints with spine margin allowances |
| **Rulebook Codex** | Comprehensive rulebook, glossary, and reference index | Multi-chapter editor; auto-generated Table of Contents, alphabetical glossary, and keyword reference locator | Print-ready booklet layouts (A5, A4, Digest) |
| **Print & Imposition** | Duplex sheet imposition & print production suite | A4, US Letter, and A3 duplex alignment; 0–6mm adjustable bleed; crop cut marks & center crosshairs | Vector duplex PDF with front/back registration alignment |
| **Theme & Visual Engine** | Workstation theme presets & custom accent picker | 7 built-in themes (Classic Forge, Clean Paper Light, Cyber Void, Citadel War, etc.) & custom hex accent picker | Consistent styling applied across the entire studio and all editors |

---

## Workstation Modules

### 1. Card Creating Engine
- **Card Group Architecture**: Organize cards into dedicated decks (e.g. *Equipment*, *Spells*, *Quests*, *Monsters*), each supporting standard Poker (63.5×88.9mm), Bridge (57×88.9mm), Tarot (70×120mm), or Mini (44×67mm) sizing.
- **Card Face Switching**: Toggle freely between **Card Front** and **Card Back**. Manage shared deck backs or individual card layouts.
- **100% Editable Canvas**: Every component — titles, cost badges, portrait frames, stats bars, rules text, and footer strips — is an independent, draggable `CanvasElement`.
- **Blank Canvas Safeguard**: Instant reset to blank canvas with modal confirmation and full Undo/Redo protection.
- **CSV Batch Deck Importer**: Ingest game spreadsheets with one-click column mapping to mass-generate cards in seconds.

### 2. Packaging Box & Dieline Creator
- **Geometric Net Structures**: Includes 2-piece telescoping boxes (lid + bottom tray with auto clearance calculations), 1-print tuck boxes with folding flaps and glue tabs, book-style magnetic cases, matchbox sleeves, and roll-end mailers.
- **Dieline Legend**: Real-time rendering of solid cut lines, dashed fold creases, and glue flap tabs with thickness offset compensation.
- **Curated Style Presets**: Apply packaging design themes like *Royal Obsidian & Gold*, *Crimson Citadel*, *Emerald Wilderness*, and *Cyber Void*.

### 3. Punchboard Token Creator
- **Shapes & Geometries**: Circular tokens, rounded squares, and interlocking hexagons.
- **Customizable Dimensions**: Millimeter-accurate diameter settings, custom background tinting, inner ring borders, and stat counters.
- **Production Sheet Layout**: Auto-tiled punchboard sheet preview with bleed margins for laser cutters or die punchers.

### 4. Acrylic & Cardboard Standee Creator
- **Fold-Over Symmetrical Cutouts**: Instant reflection preview for double-sided folding standees.
- **Interlocking Base Tabs**: Custom width and height connector tabs (e.g. 15×5mm) for standard plastic and slotted chipboard stands.
- **Arch & Rectangular Silhouettes**: Configurable top arch curvature for RPG heroes, bosses, NPCs, and terrain props.

### 5. Game Board & Exploration Mat Creator
- **Board Configurations**: Single mats, bi-fold boards with spine hinge simulation, and quad-fold expedition boards.
- **Grid Overlays**: Built-in square and hex grid generators with customizable millimeter cell spacing.
- **Exploration Hex Tile Discovery**: Place hexagonal exploration tiles that can be **flipped** on click to reveal hidden locations, loot vaults, dragon lairs, or traps.
- **Interactive Exploration Mode**: Test game mechanics by clicking tiles to simulate live fog-of-war discovery.

### 6. Rulebook & Codex Creator
- **Booklet Layouts**: Formats for standard A5, A4, and Digest booklets.
- **Automated References**: Auto-generated Table of Contents, glossary index, and cross-chapter keyword reference locator.
- **Layout Snippets**: One-click insertions for Callout boxes, Examples of Play, Diagram placeholders, and Markdown tables.

### 7. Print Imposition & Export Suite
- **Duplex Sheet Imposition**: Automatic front-and-back alignment for standard A4, US Letter, and A3 paper.
- **Adjustable Bleed Margins**: Industry-standard 3mm (or custom) bleed with adjustable crop marks and cutting guides.
- **Vector PDF Generation**: Export high-resolution, print-ready vector PDFs directly in the browser via `jspdf`.
- **Tabletop Simulator (TTS)**: Export custom deck sheet images and JSON deck configs ready for import into Tabletop Simulator.

---

## Professional Canvas Tools & Controls

| Feature | Description |
| :--- | :--- |
| **Layer Locking** | Lock specific elements via the Layer Manager to prevent accidental selection, dragging, or modifications on canvas. |
| **Smart Snapping Guides** | Real-time magnetic guides (dashed glowing lines) that snap to canvas center axes, borders, and sibling element edges. |
| **40+ Typography Engine** | Formal serif/sans fonts (*Cinzel*, *EB Garamond*, *Inter*, *Outfit*, *Public Sans*) & creative fonts (*Comic Neue*, *Fredoka*, *Bangers*). |
| **Advanced HSV Color Picker** | Full hex, HSL/HSV, alpha transparency, and curated tabletop palette swatches. |
| **Glow & Drop Shadows** | Customizable X/Y offset, blur radius, spread, and color for tabletop spell effects and card pop. |
| **Tabletop Icon Library** | Comprehensive tabletop icon system featuring clean Remix UI icons and RPG-Awesome fantasy symbols. |
| **Persistent Asset Manager** | Persistent sidebar for uploading character art, textures, parchment maps, and drag-and-drop art insertion. |
| **Studio Theme Customizer** | Instant preset switching (Dark, Light, Cyber, Citadel, Emerald, Parchment) and custom accent color palette. |

---

## Technical Architecture

- **Frontend**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`), TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Backend**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) with native MongoDB adapter and local JSON fallback
- **Icons**: [Remix Icon](https://remixicon.com/) & [RPG-Awesome](https://nagoshiashumari.github.io/Rpg-Awesome/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tablesmith-studio.git
   cd tablesmith-studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Launch development workstation:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## License

TableSmith Studio is open-source software licensed under the [Apache-2.0 License](LICENSE).
