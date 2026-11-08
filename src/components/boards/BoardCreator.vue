<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  boards,
  selectedBoardId,
  activeBoard,
  saveBoard,
  showToast
} from '../../stores/projectStore.ts';
import {
  recordSnapshot,
  performUndo,
  performRedo
} from '../../stores/historyStore.ts';

import type {
  BoardItem,
  BoardZone,
  CanvasElement,
  TabletopIcon,
  ShapeType,
  PlaceholderPreset
} from '../../types/index.ts';
import { getRemixIconClass } from '../../utils/iconHelper.ts';
import TransformBox from '../common/TransformBox.vue';
import AlignmentBar from '../common/AlignmentBar.vue';
import ElementInspector from '../common/ElementInspector.vue';
import LayerPanel from '../common/LayerPanel.vue';
import IconPickerModal from '../common/IconPickerModal.vue';
import { useCanvasTransform } from '../../composables/useCanvasTransform.ts';

const selectedElementId = ref<string | null>(null);
const showIconModal = ref(false);
const zoomLevel = ref<number>(1);
const isExplorationTestMode = ref<boolean>(false);

const baseScale = computed(() => {
  if (!activeBoard.value) return 1;
  const maxDim = Math.max(activeBoard.value.dimensionsMm.width, activeBoard.value.dimensionsMm.height);
  return Math.min(1.2, 500 / maxDim);
});

const boardScale = computed(() => baseScale.value * zoomLevel.value);

function handleZoomIn() {
  zoomLevel.value = Math.min(3, +(zoomLevel.value + 0.25).toFixed(2));
}

function handleZoomOut() {
  zoomLevel.value = Math.max(0.5, +(zoomLevel.value - 0.25).toFixed(2));
}

function handleZoomReset() {
  zoomLevel.value = 1;
}

const currentElements = computed(() => {
  if (!activeBoard.value) return [];
  if (!activeBoard.value.elements) {
    activeBoard.value.elements = [];
  }
  return activeBoard.value.elements;
});

const activeElement = computed(() => {
  return currentElements.value.find(el => el.id === selectedElementId.value) || null;
});

function snapshotState() {
  if (activeBoard.value) {
    recordSnapshot(JSON.parse(JSON.stringify(activeBoard.value)));
  }
}

function persistChanges() {
  if (activeBoard.value) {
    saveBoard(activeBoard.value);
  }
}

const { startDrag, startResize, activeSmartGuides } = useCanvasTransform({
  snapGridMm: 1,
  canvasScale: () => boardScale.value,
  canvasDimensionsMm: () => ({
    width: activeBoard.value?.dimensionsMm.width || 400,
    height: activeBoard.value?.dimensionsMm.height || 400
  }),
  getAllElements: () => currentElements.value,
  onTransformStart: () => snapshotState(),
  onTransformEnd: () => persistChanges()
});

// Drag & Drop asset from Persistent Asset Manager onto Board Canvas
function handleCanvasDrop(e: DragEvent) {
  e.preventDefault();
  const rawAsset = e.dataTransfer?.getData('application/json');
  const rawUrl = e.dataTransfer?.getData('text/plain');

  if (rawAsset) {
    try {
      const asset = JSON.parse(rawAsset);
      if (activeElement.value && (activeElement.value.type === 'image-frame' || activeElement.value.type === 'shape')) {
        snapshotState();
        activeElement.value.bgImageUrl = asset.url;
        persistChanges();
        showToast(`Applied ${asset.name} to board frame!`);
        return;
      }
      handleAddImageFrame(asset.url);
      return;
    } catch (e) {}
  }

  if (rawUrl) {
    if (activeElement.value && (activeElement.value.type === 'image-frame' || activeElement.value.type === 'shape')) {
      snapshotState();
      activeElement.value.bgImageUrl = rawUrl;
      persistChanges();
      showToast('Applied texture to board frame!');
      return;
    }
    handleAddImageFrame(rawUrl);
  }
}

function handleUndo() {
  performUndo((snapshot) => {
    if (activeBoard.value && snapshot) {
      Object.assign(activeBoard.value, snapshot);
      showToast('Undo successful');
    }
  });
}

function handleRedo() {
  performRedo((snapshot) => {
    if (activeBoard.value && snapshot) {
      Object.assign(activeBoard.value, snapshot);
      showToast('Redo successful');
    }
  });
}

// Add Text Box
function handleAddText() {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_txt_${Date.now()}`,
    name: 'Map Title / Track',
    type: 'text',
    x: 20,
    y: 20,
    width: 140,
    height: 18,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    text: 'CITADEL OF THE SUNKEN MOUNTAIN',
    fontFamily: 'Cinzel',
    fontSize: 16,
    fontWeight: 700,
    fontStyle: 'normal',
    textAlign: 'center',
    color: '#F59E0B',
    lineHeight: 1.2,
    hasShadow: true,
    shadowColor: 'rgba(0,0,0,0.9)'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast('Added text to board');
}

// Add Image Frame
function handleAddImageFrame(bgUrl?: string) {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_img_${Date.now()}`,
    name: 'Board Texture Frame',
    type: 'image-frame',
    x: 30,
    y: 30,
    width: 160,
    height: 110,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 0.9,
    bgImageUrl: bgUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    fgImageUrl: '',
    imageFit: 'cover',
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderStyle: 'solid',
    borderRadius: 4,
    backgroundColor: 'transparent'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast('Added image frame to board');
}

// Add Placeholder Box (Header, Footer, Portrait, Effect, Marker, Hexagon Tile, etc.)
function handleAddBox(preset: { shapeType: ShapeType; placeholderType: PlaceholderPreset; label: string; icon?: string }) {
  snapshotState();
  let w = 80;
  let h = 45;
  let x = 40;
  let y = 40;
  let bg = 'rgba(30, 41, 59, 0.75)';
  let border = '#334155';
  let bWidth = 1.5;
  let bStyle: 'solid' | 'dashed' | 'dotted' | 'none' = 'solid';
  let radius = 4;
  let icon = preset.icon || '';
  let flippedTitle = '';
  let flippedIcon = '🏰';
  let flippedDesc = '';
  let flippedColor = '#F59E0B';

  if (preset.shapeType === 'hex') {
    w = 60;
    h = 60;
    bg = '#1E293B';
    border = '#F59E0B';
    bWidth = 2;
    icon = '🌫️';
    flippedTitle = 'Citadel Ruins';
    flippedIcon = '🏰';
    flippedDesc = 'Ancient stronghold. Draw 1 Relic card when explored.';
    flippedColor = '#F59E0B';
  } else if (preset.placeholderType === 'header') {
    w = 200;
    h = 18;
    y = 15;
    bg = '#0F172A';
    border = '#F59E0B';
    icon = '🗺️';
  } else if (preset.placeholderType === 'footer') {
    w = 300;
    h = 24;
    y = 350;
    bg = '#0B0F17';
    border = '#334155';
    icon = '🏁';
  } else if (preset.placeholderType === 'hp' || preset.placeholderType === 'marker') {
    w = 28;
    h = 28;
    bg = '#EF4444';
    border = '#B91C1C';
    radius = 9999;
    icon = '❤️';
  } else if (preset.placeholderType === 'portrait') {
    w = 70;
    h = 70;
    bg = '#1E293B';
    border = '#F59E0B';
    bStyle = 'dashed';
    icon = '🖼️';
  } else if (preset.placeholderType === 'effect') {
    w = 120;
    h = 50;
    bg = 'rgba(15, 23, 42, 0.85)';
    border = '#475569';
    icon = '📜';
  }

  const newEl: CanvasElement = {
    id: `el_box_${Date.now()}`,
    name: preset.label,
    type: 'shape',
    shapeType: preset.shapeType,
    placeholderType: preset.placeholderType,
    placeholderLabel: preset.label,
    showPlaceholderLabel: true,
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    backgroundColor: bg,
    borderColor: border,
    borderWidth: bWidth,
    borderStyle: bStyle,
    borderRadius: radius,
    iconGlyph: icon,
    isFlipped: false,
    flippedTitle,
    flippedIcon,
    flippedDescription: flippedDesc,
    flippedColor
  };

  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast(`Added ${preset.label} to board`);
}

// Add Hexagon Exploration Tile Element directly
function handleAddHexTile() {
  handleAddBox({
    shapeType: 'hex',
    placeholderType: 'custom',
    label: 'Exploration Hex Tile',
    icon: '🌫️'
  });
}

function handleAddIconElement(icon: TabletopIcon) {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_ico_${Date.now()}`,
    name: `${icon.name} Marker`,
    type: 'icon',
    x: 40,
    y: 40,
    width: 28,
    height: 28,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    iconGlyph: icon.glyph,
    iconCssClass: icon.cssClass,
    iconColor: '#F59E0B'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast(`Added ${icon.name} marker to board`);
}

function handleInsertInlineIcon(icon: TabletopIcon) {
  snapshotState();
  if (activeElement.value) {
    if (activeElement.value.type === 'text' || activeElement.value.type === 'shape') {
      activeElement.value.text = (activeElement.value.text || '') + (activeElement.value.text ? ' ' : '') + icon.glyph;
      if (activeElement.value.type === 'shape' && !activeElement.value.iconGlyph) {
        activeElement.value.iconGlyph = icon.glyph;
      }
    } else if (activeElement.value.type === 'icon') {
      activeElement.value.iconGlyph = icon.glyph;
      activeElement.value.name = `${icon.name} Emblem`;
    }
    persistChanges();
    showToast(`Inserted ${icon.glyph} into ${activeElement.value.name}`);
  } else {
    const newEl: CanvasElement = {
      id: `el_txt_${Date.now()}`,
      name: `${icon.name} Label`,
      type: 'text',
      x: 30,
      y: 30,
      width: 60,
      height: 16,
      rotation: 0,
      zIndex: currentElements.value.length + 1,
      locked: false,
      hidden: false,
      opacity: 1,
      text: `${icon.glyph} ${icon.name}`,
      fontFamily: 'Outfit',
      fontSize: 12,
      fontWeight: 600,
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#FFFFFF',
      lineHeight: 1.2
    };
    currentElements.value.push(newEl);
    selectedElementId.value = newEl.id;
    persistChanges();
    showToast(`Added text label with ${icon.glyph}`);
  }
}

function handleSetPortraitIcon(icon: TabletopIcon) {
  handleAddIconElement(icon);
}

function handleAlign(direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') {
  if (!activeElement.value || !activeBoard.value) return;
  snapshotState();
  const el = activeElement.value;
  const w = activeBoard.value.dimensionsMm.width;
  const h = activeBoard.value.dimensionsMm.height;

  if (direction === 'left') el.x = 10;
  else if (direction === 'center-h') el.x = Math.round((w - el.width) / 2);
  else if (direction === 'right') el.x = Math.round(w - el.width - 10);
  else if (direction === 'top') el.y = 10;
  else if (direction === 'center-v') el.y = Math.round((h - el.height) / 2);
  else if (direction === 'bottom') el.y = Math.round(h - el.height - 10);

  persistChanges();
  showToast(`Aligned ${direction}`);
}

function handleDuplicateElement() {
  if (!activeElement.value) return;
  snapshotState();
  const clone = {
    ...JSON.parse(JSON.stringify(activeElement.value)),
    id: `el_clone_${Date.now()}`,
    name: `${activeElement.value.name} (Copy)`,
    x: activeElement.value.x + 10,
    y: activeElement.value.y + 10,
    zIndex: currentElements.value.length + 1
  };
  currentElements.value.push(clone);
  selectedElementId.value = clone.id;
  persistChanges();
  showToast('Duplicated element');
}

function handleDeleteElement(id: string) {
  snapshotState();
  const index = currentElements.value.findIndex(el => el.id === id);
  if (index >= 0) {
    currentElements.value.splice(index, 1);
    selectedElementId.value = null;
    persistChanges();
    showToast('Deleted element');
  }
}

// Add Zone (Supports Hexagon, Rectangle, Circle)
function handleAddZone(shape: 'hex' | 'rectangle' | 'circle' = 'rectangle') {
  if (!activeBoard.value) return;
  snapshotState();
  const isHex = shape === 'hex';
  const newZone: BoardZone = {
    id: `z_${Date.now()}`,
    name: isHex ? 'Unexplored Hex Node' : 'Encounter Zone',
    shape,
    x: 40,
    y: 40,
    width: isHex ? 60 : 100,
    height: isHex ? 60 : 70,
    color: '#1E293B',
    icon: isHex ? '🌫️' : '📍',
    isFlipped: false,
    flippedTitle: 'Sunken Vault',
    flippedIcon: '🏰',
    flippedColor: '#F59E0B',
    flippedDescription: 'Ancient vault revealed!'
  };
  activeBoard.value.zones.push(newZone);
  persistChanges();
  showToast(`Added ${shape} zone to board`);
}

function handleDeleteZone(id: string) {
  if (!activeBoard.value) return;
  snapshotState();
  activeBoard.value.zones = activeBoard.value.zones.filter(z => z.id !== id);
  persistChanges();
  showToast('Deleted zone');
}

// Clear all board zones & elements for a completely blank canvas
function handleBlankCanvas() {
  if (!activeBoard.value) return;
  snapshotState();
  activeBoard.value.zones = [];
  activeBoard.value.elements = [];
  selectedElementId.value = null;
  persistChanges();
  showToast('Board cleared to completely blank canvas!');
}

// Apply Starter Board Template
function handleApplyTemplate() {
  if (!activeBoard.value) return;
  snapshotState();
  activeBoard.value.zones = [
    { id: 'z1', name: 'Keep Courtyard', shape: 'rectangle', x: 20, y: 20, width: 150, height: 140, color: '#1E293B', icon: '🏰' },
    { id: 'z2', name: 'Catacombs Gate', shape: 'rectangle', x: 200, y: 20, width: 150, height: 140, color: '#0F172A', icon: '🚪' },
    { id: 'z3', name: 'VP Track & Round Counter', shape: 'rectangle', x: 20, y: 340, width: 340, height: 35, color: '#334155', icon: '👑' }
  ];
  activeBoard.value.elements = [
    {
      id: 'el_title',
      name: 'Board Title',
      type: 'text',
      x: 20,
      y: 175,
      width: 340,
      height: 18,
      rotation: 0,
      zIndex: 2,
      locked: false,
      hidden: false,
      opacity: 1,
      text: activeBoard.value.name,
      fontFamily: 'Cinzel',
      fontSize: 16,
      fontWeight: 700,
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#F59E0B',
      hasShadow: true
    }
  ];
  persistChanges();
  showToast('Applied starter board template');
}
</script>

<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- Sub-Sidebar: Board List -->
    <aside class="w-60 border-r border-slate-800 bg-[#0F172A]/70 flex flex-col shrink-0 select-none">
      <div class="p-3 border-b border-slate-800 flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-300 font-display uppercase tracking-wider">Game Boards & Mats</span>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div
          v-for="b in boards"
          :key="b._id"
          @click="selectedBoardId = b._id; selectedElementId = null"
          class="p-2 rounded text-xs flex items-center justify-between cursor-pointer transition-colors"
          :class="selectedBoardId === b._id
            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
            : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'"
        >
          <div class="flex items-center gap-2 truncate">
            <i class="ri-map-2-line text-base text-amber-400 shrink-0"></i>
            <div class="truncate">
              <div class="font-medium truncate">{{ b.name }}</div>
              <div class="text-[10px] text-slate-500 font-mono capitalize">{{ b.type }} · {{ b.dimensionsMm.width }}×{{ b.dimensionsMm.height }}mm</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Exploration Legend / Test Mode Toggle -->
      <div class="p-3 border-t border-slate-800 bg-[#0B0F17]/80 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
            <i class="ri-compass-3-line text-amber-400 text-sm"></i>
            Exploration Mode
          </span>
          <button
            @click="isExplorationTestMode = !isExplorationTestMode"
            class="px-2 py-0.5 rounded text-[10px] font-mono border transition-all"
            :class="isExplorationTestMode
              ? 'bg-amber-400 text-slate-950 font-bold border-amber-500 shadow-xs'
              : 'bg-slate-800 text-slate-400 border-slate-700'"
          >
            {{ isExplorationTestMode ? 'Test Mode Active' : 'Off' }}
          </button>
        </div>
        <p class="text-[10px] text-slate-500 leading-tight">
          {{ isExplorationTestMode ? 'Click any hex tile on the map to flip & reveal hidden locations!' : 'Enable to preview exploration tile flip mechanics.' }}
        </p>
      </div>
    </aside>

    <!-- Center Canvas: Board Visualizer -->
    <main class="flex-1 bg-[#131B2A] flex flex-col overflow-hidden relative">
      <!-- Universal Alignment Toolbar -->
      <AlignmentBar
        :has-selection="!!activeElement"
        :is-locked="activeElement?.locked"
        :zoom="zoomLevel"
        @undo="handleUndo"
        @redo="handleRedo"
        @add-text="handleAddText"
        @add-image-frame="() => handleAddImageFrame()"
        @add-box="handleAddBox"
        @blank-canvas="handleBlankCanvas"
        @apply-template="handleApplyTemplate"
        @open-icons="showIconModal = true"
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @zoom-reset="handleZoomReset"
        @align="handleAlign"
        @duplicate="handleDuplicateElement"
        @delete="activeElement && handleDeleteElement(activeElement.id)"
      />

      <!-- Board Action Bar -->
      <div class="h-9 border-b border-slate-800/80 bg-[#0B0F17]/60 px-4 flex items-center justify-between shrink-0 select-none">
        <div class="flex items-center gap-3">
          <span class="text-xs text-white font-medium flex items-center gap-1.5 font-display">
            <i class="ri-map-2-line text-amber-400 text-sm"></i>
            {{ activeBoard?.name }}
            <span class="text-slate-500 font-mono text-[11px] font-normal">({{ activeBoard?.dimensionsMm.width }} × {{ activeBoard?.dimensionsMm.height }} mm)</span>
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Add Hexagon Tile Button -->
          <button
            @click="handleAddHexTile"
            class="px-2.5 py-1 text-xs text-amber-300 font-semibold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded flex items-center gap-1.5 transition-colors font-mono cursor-pointer"
            title="Add a flippable Hexagon exploration tile for map discovery"
          >
            <i class="ri-shape-line text-amber-400 text-sm"></i>
            + Hex Tile
          </button>

          <!-- Add Zone Button -->
          <button
            @click="handleAddZone('rectangle')"
            class="px-2.5 py-1 text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded flex items-center gap-1 transition-colors cursor-pointer"
          >
            <i class="ri-add-line text-slate-400 text-sm"></i>
            + Zone
          </button>
        </div>
      </div>

      <!-- Preview Canvas Viewport -->
      <div
        class="flex-1 flex items-center justify-center p-8 overflow-auto select-none"
        @click="selectedElementId = null"
        @dragover.prevent
        @drop="handleCanvasDrop"
      >
        <div v-if="activeBoard" class="relative bg-[#0B0F17] border-2 border-slate-700 shadow-2xl p-2 rounded-lg" @click.stop>
          <div
            class="relative overflow-hidden border border-slate-800 shadow-inner"
            :style="{
              width: `${activeBoard.dimensionsMm.width * boardScale}px`,
              height: `${activeBoard.dimensionsMm.height * boardScale}px`,
              backgroundColor: '#0F172A'
            }"
          >
            <!-- Dynamic Smart Guides Lines -->
            <div
              v-for="(guide, gIdx) in activeSmartGuides"
              :key="gIdx"
              class="absolute pointer-events-none z-50"
              :class="guide.type === 'vertical' 
                ? 'top-0 bottom-0 border-l-2 border-dashed border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]' 
                : 'left-0 right-0 border-t-2 border-dashed border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]'"
              :style="guide.type === 'vertical' ? { left: `${guide.pos}px` } : { top: `${guide.pos}px` }"
            ></div>

            <!-- Bi-Fold Spine Gap Simulation -->
            <div
              v-if="activeBoard.type === 'bi-fold'"
              class="absolute top-0 bottom-0 border-x border-cyan-400/60 bg-black/40 z-20 flex items-center justify-center font-mono text-[8px] text-cyan-300 pointer-events-none"
              :style="{
                left: `calc(50% - ${activeBoard.spineGapMm * boardScale / 2}px)`,
                width: `${Math.max(4, activeBoard.spineGapMm * boardScale)}px`
              }"
            >
              Hinge
            </div>

            <!-- Grid Overlay (Square / Hex) -->
            <div
              v-if="activeBoard.gridType === 'square'"
              class="absolute inset-0 pointer-events-none opacity-20 z-10"
              :style="{
                backgroundImage: 'linear-gradient(to right, #94A3B8 1px, transparent 1px), linear-gradient(to bottom, #94A3B8 1px, transparent 1px)',
                backgroundSize: `${activeBoard.gridSizeMm * boardScale}px ${activeBoard.gridSizeMm * boardScale}px`
              }"
            ></div>

            <!-- Empty Blank Canvas Notice -->
            <div
              v-if="activeBoard.zones.length === 0 && currentElements.length === 0"
              class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-2 pointer-events-none"
            >
              <i class="ri-compass-3-line text-3xl text-slate-600 animate-pulse"></i>
              <span>Blank Game Board Canvas</span>
              <span class="text-[10px] text-slate-600">Use [+ Hex Tile], [+ Box], or [Template] above</span>
            </div>

            <!-- Board Zones (Rectangles, Circles, and Hexagons with Flip State) -->
            <div
              v-for="z in activeBoard.zones"
              :key="z.id"
              class="absolute p-2 flex flex-col justify-between transition-all group select-none overflow-hidden"
              :class="[
                isExplorationTestMode ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 shadow-md' : 'cursor-default',
                z.shape === 'hex' ? 'border-0' : 'border border-slate-600'
              ]"
              :style="{
                left: `${z.x * boardScale}px`,
                top: `${z.y * boardScale}px`,
                width: `${z.width * boardScale}px`,
                height: `${z.height * boardScale}px`,
                backgroundColor: z.shape === 'hex' ? 'transparent' : (z.isFlipped ? (z.flippedColor || '#F59E0B') : z.color),
                borderRadius: z.shape === 'circle' ? '9999px' : z.shape === 'hex' ? '0px' : '6px',
                clipPath: z.shape === 'hex' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' : 'none'
              }"
              @click="isExplorationTestMode ? (z.isFlipped = !z.isFlipped, persistChanges()) : null"
            >
              <!-- SVG Polygon for Hexagonal Zone Edge & Border Tracing -->
              <svg
                v-if="z.shape === 'hex'"
                class="absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polygon
                  points="50,0 100,25 100,75 50,100 0,75 0,25"
                  :fill="z.isFlipped ? (z.flippedColor || '#F59E0B') : z.color"
                  stroke="#F59E0B"
                  stroke-width="2"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
              <div class="flex items-center justify-between w-full z-10">
                <i :class="[getRemixIconClass(z.isFlipped ? (z.flippedIcon || '✨') : (z.icon || (z.shape === 'hex' ? '⬢' : '📍'))), 'text-amber-400 text-sm filter drop-shadow']"></i>
                <button
                  v-if="!isExplorationTestMode"
                  @click.stop="z.isFlipped = !z.isFlipped; persistChanges()"
                  class="opacity-0 group-hover:opacity-100 px-1 py-0.5 rounded text-[8px] font-mono bg-black/70 text-amber-300 hover:bg-black transition-opacity cursor-pointer flex items-center justify-center"
                  title="Flip tile to test exploration reveal"
                >
                  <i class="ri-refresh-line text-[10px]"></i>
                </button>
              </div>

              <div class="truncate text-center z-10">
                <span class="text-[10px] font-bold text-white font-display truncate block">
                  {{ z.isFlipped ? (z.flippedTitle || z.name) : z.name }}
                </span>
                <span v-if="z.isFlipped && z.flippedDescription" class="text-[8px] text-slate-200 line-clamp-1">
                  {{ z.flippedDescription }}
                </span>
              </div>
            </div>

            <!-- Draggable Custom Elements Layer (Supports Hexagons, Circles, Boxes, Images, Text) -->
            <TransformBox
              v-for="el in currentElements"
              :key="el.id"
              :element="el"
              :is-selected="selectedElementId === el.id"
              :scale="boardScale"
              @select="selectedElementId = el.id"
              @start-drag="(e, elem) => startDrag(e, elem)"
              @start-resize="(e, elem, h) => startResize(e, elem, h)"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Right Inspector: Board Settings + Visual Layer Engine -->
    <aside class="w-80 border-l border-slate-800 bg-[#0B0F17] overflow-y-auto p-4 shrink-0 space-y-5">
      <!-- Element Properties Inspector -->
      <ElementInspector
        :element="activeElement"
        @change="persistChanges"
        @open-icons="showIconModal = true"
      />

      <!-- Layer Hierarchy Panel -->
      <div class="border-t border-slate-800 pt-4">
        <LayerPanel
          :elements="currentElements"
          :selected-element-id="selectedElementId"
          @select="el => selectedElementId = el.id"
          @move-up="el => el.zIndex = (el.zIndex || 0) + 1"
          @move-down="el => el.zIndex = Math.max(1, (el.zIndex || 0) - 1)"
          @delete="handleDeleteElement"
          @change="persistChanges"
        />
      </div>

      <!-- Board Zones Management -->
      <div v-if="activeBoard" class="border-t border-slate-800 pt-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Board Zones ({{ activeBoard.zones.length }})</span>
          <div class="flex items-center gap-1">
            <button
              @click="handleAddZone('hex')"
              class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30"
              title="Add Hex Zone"
            >
              + Hex
            </button>
            <button
              @click="handleAddZone('rectangle')"
              class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300"
              title="Add Box Zone"
            >
              + Box
            </button>
          </div>
        </div>

        <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <div
            v-for="z in activeBoard.zones"
            :key="z.id"
            class="p-2 rounded bg-slate-900 border border-slate-800 text-xs space-y-1.5"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 truncate">
                <i :class="[getRemixIconClass(z.isFlipped ? (z.flippedIcon || '✨') : (z.icon || (z.shape === 'hex' ? '⬢' : '📍'))), 'text-amber-400 text-sm shrink-0']"></i>
                <input
                  v-model="z.name"
                  @input="persistChanges"
                  class="bg-transparent font-semibold text-white truncate text-[11px] focus:outline-none"
                />
              </div>
              <div class="flex items-center gap-1">
                <button
                  @click="z.isFlipped = !z.isFlipped; persistChanges()"
                  class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 flex items-center justify-center cursor-pointer"
                  title="Flip Tile"
                >
                  <i class="ri-refresh-line text-xs"></i>
                </button>
                <button
                  @click="handleDeleteZone(z.id)"
                  class="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 flex items-center justify-center cursor-pointer"
                  title="Delete Zone"
                >
                  <i class="ri-delete-bin-line text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Shape & Flip options -->
            <div class="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div>
                <span class="text-slate-500">Shape</span>
                <select
                  v-model="z.shape"
                  @change="persistChanges"
                  class="w-full bg-[#1E293B] border border-slate-700 rounded px-1 py-0.5 text-white"
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="hex">Hexagon (Tile)</option>
                  <option value="circle">Circle</option>
                </select>
              </div>
              <div>
                <span class="text-slate-500">Color</span>
                <input
                  type="color"
                  v-model="z.color"
                  @input="persistChanges"
                  class="w-full h-5 rounded bg-transparent cursor-pointer border border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Board Parameters -->
      <div v-if="activeBoard" class="border-t border-slate-800 pt-4 space-y-3">
        <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Board Structure</span>
        <div>
          <span class="text-[9px] text-slate-500 font-mono">Title</span>
          <input
            v-model="activeBoard.name"
            @input="persistChanges"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Width (mm)</span>
            <input
              type="number"
              v-model.number="activeBoard.dimensionsMm.width"
              @change="persistChanges"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Height (mm)</span>
            <input
              type="number"
              v-model.number="activeBoard.dimensionsMm.height"
              @change="persistChanges"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Grid Overlay</span>
            <select
              v-model="activeBoard.gridType"
              @change="persistChanges"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="none">None</option>
              <option value="square">Square Grid</option>
              <option value="hex">Hex Grid</option>
            </select>
          </div>
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Grid Size (mm)</span>
            <input
              type="number"
              v-model.number="activeBoard.gridSizeMm"
              @change="persistChanges"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
        </div>
      </div>
    </aside>

    <!-- Tabletop Icon Library Modal -->
    <IconPickerModal
      :is-open="showIconModal"
      @close="showIconModal = false"
      @select-element="handleAddIconElement"
      @select-inline="handleInsertInlineIcon"
      @select-portrait="handleSetPortraitIcon"
    />
  </div>
</template>
