<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  boxDielines,
  selectedBoxId,
  activeBox,
  saveBoxDieline,
  showToast
} from '../../stores/projectStore.ts';
import {
  recordSnapshot,
  performUndo,
  performRedo
} from '../../stores/historyStore.ts';

import type { BoxDieline, BoxTemplateType, CanvasElement, TabletopIcon, ShapeType, PlaceholderPreset, BoxDesignPreset } from '../../types/index.ts';
import TransformBox from '../common/TransformBox.vue';
import AlignmentBar from '../common/AlignmentBar.vue';
import ElementInspector from '../common/ElementInspector.vue';
import LayerPanel from '../common/LayerPanel.vue';
import IconPickerModal from '../common/IconPickerModal.vue';
import { useCanvasTransform } from '../../composables/useCanvasTransform.ts';

const activeViewTab = ref<'lid' | 'tray'>('lid');
const showIconModal = ref(false);
const showPresetModal = ref(false);
const selectedElementId = ref<string | null>(null);
const zoomLevel = ref<number>(1);

// Box Groups & Organization
const BOX_GROUPS = ['Main Box', 'Deck Box', 'Side Box', 'Expansion Box'];
const editingBoxId = ref<string | null>(null);
const editingBoxName = ref<string>('');

// Built-in Curated Design Presets
const builtInDesignPresets: BoxDesignPreset[] = [
  {
    id: 'preset_obsidian_gold',
    name: 'Royal Obsidian & Gold',
    description: 'Dark slate body with rich gold borders & Cinzel display headers',
    lidColor: '#0F172A',
    sideColor: '#1E293B',
    trayColor: '#0B0F17',
    accentColor: '#F59E0B',
    fontFamily: 'Cinzel',
    titleColor: '#FFFFFF',
    subtitleColor: '#F59E0B'
  },
  {
    id: 'preset_crimson_war',
    name: 'Crimson Citadel War',
    description: 'Blood crimson panels with ivory accents & bold typography',
    lidColor: '#7F1D1D',
    sideColor: '#450A0A',
    trayColor: '#1C1917',
    accentColor: '#FEF3C7',
    fontFamily: 'Outfit',
    titleColor: '#FEF3C7',
    subtitleColor: '#FCA5A5'
  },
  {
    id: 'preset_emerald_expedition',
    name: 'Emerald Wilderness',
    description: 'Deep forest green with warm amber foil and classic serif',
    lidColor: '#064E3B',
    sideColor: '#022C22',
    trayColor: '#0B0F17',
    accentColor: '#FBBF24',
    fontFamily: 'Source Serif 4',
    titleColor: '#FFFFFF',
    subtitleColor: '#FBBF24'
  },
  {
    id: 'preset_cyber_void',
    name: 'Cyber Void & Aether',
    description: 'Midnight obsidian with neon cyan glow and monospaced tech stats',
    lidColor: '#090D16',
    sideColor: '#111827',
    trayColor: '#030712',
    accentColor: '#38BDF8',
    fontFamily: 'JetBrains Mono',
    titleColor: '#38BDF8',
    subtitleColor: '#E0F2FE'
  },
  {
    id: 'preset_parchment_tome',
    name: 'Ancient Tome & Leather',
    description: 'Aged warm leather and parchment tone with antique gold framing',
    lidColor: '#292524',
    sideColor: '#1C1917',
    trayColor: '#0C0A09',
    accentColor: '#D97706',
    fontFamily: 'Cinzel',
    titleColor: '#FDE68A',
    subtitleColor: '#D97706'
  },
  {
    id: 'preset_minimal_linen',
    name: 'Clean Minimalist Paper',
    description: 'Understated slate grey with clean crisp neutral typography',
    lidColor: '#1E293B',
    sideColor: '#0F172A',
    trayColor: '#020617',
    accentColor: '#94A3B8',
    fontFamily: 'Public Sans',
    titleColor: '#F8FAFC',
    subtitleColor: '#94A3B8'
  }
];

const customDesignPresets = ref<BoxDesignPreset[]>([]);
const selectedPresetId = ref<string>('preset_obsidian_gold');
const presetBatchScope = ref<'current' | 'group' | 'all' | 'custom'>('current');
const batchSelectedBoxIds = ref<string[]>([]);
const newPresetName = ref<string>('');

const allDesignPresets = computed(() => [
  ...builtInDesignPresets,
  ...customDesignPresets.value
]);

const activeDesignPreset = computed(() => {
  return allDesignPresets.value.find(p => p.id === selectedPresetId.value) || allDesignPresets.value[0];
});

const groupedBoxes = computed(() => {
  const groups: Record<string, BoxDieline[]> = {};
  BOX_GROUPS.forEach(g => { groups[g] = []; });
  boxDielines.value.forEach(b => {
    const grp = b.group || 'Main Box';
    if (!groups[grp]) groups[grp] = [];
    groups[grp].push(b);
  });
  return groups;
});

function handleZoomIn() {
  zoomLevel.value = Math.min(3, +(zoomLevel.value + 0.25).toFixed(2));
}

function handleZoomOut() {
  zoomLevel.value = Math.max(0.5, +(zoomLevel.value - 0.25).toFixed(2));
}

function handleZoomReset() {
  zoomLevel.value = 1;
}

const boxTemplates: { id: BoxTemplateType; label: string; desc: string }[] = [
  { id: 'telescope-2part', label: '2-Piece Telescoping Box', desc: 'Separate top lid and bottom tray that fit together with clearance' },
  { id: 'tuck-box', label: '1-Print Folding Tuck Box', desc: 'Single sheet card tuck box with top flap, dust flaps, and glue tab' },
  { id: 'book-magnetic', label: 'Book-Style Magnetic Box', desc: 'Wrap-around 3-panel hardcover case with drop-in inner tray' },
  { id: 'matchbox-sleeve', label: 'Matchbox Sliding Sleeve', desc: 'Hollow outer wrap sleeve with sliding open tray drawer' },
  { id: 'roll-end-tuck', label: 'Roll-End Tuck Top Mailer', desc: 'Self-locking corrugated mailer with roll-over double side walls' }
];

const boxPresets = [
  { name: 'Card Deck Box', w: 70, d: 95, h: 25, type: 'tuck-box' as BoxTemplateType },
  { name: 'Square Skirmish Box', w: 200, d: 200, h: 50, type: 'telescope-2part' as BoxTemplateType },
  { name: 'Standard Boardgame (30cm)', w: 295, d: 295, h: 72, type: 'telescope-2part' as BoxTemplateType },
  { name: 'Deluxe Magnetic Tome', w: 220, d: 160, h: 45, type: 'book-magnetic' as BoxTemplateType },
  { name: 'Modular Token Sleeve', w: 120, d: 80, h: 30, type: 'matchbox-sleeve' as BoxTemplateType }
];

// Visual scaling factor for 2D net canvas preview
const baseScale = computed(() => {
  if (!activeBox.value) return 1;
  const maxDim = Math.max(activeBox.value.targetDimensions.width, activeBox.value.targetDimensions.depth) + activeBox.value.targetDimensions.height * 2;
  return Math.min(1.2, 450 / Math.max(300, maxDim));
});

const scale = computed(() => baseScale.value * zoomLevel.value);

// Canvas Transform Composable with Dynamic Smart Guides
const { startDrag, startResize, activeSmartGuides } = useCanvasTransform({
  snapGridMm: 1,
  canvasScale: () => scale.value,
  canvasDimensionsMm: () => ({
    width: activeBox.value?.targetDimensions.width || 180,
    height: activeBox.value?.targetDimensions.depth || 180
  }),
  getAllElements: () => currentElements.value,
  onTransformStart: () => snapshotState(),
  onTransformEnd: () => persistChanges()
});

// Drag & Drop asset from Persistent Asset Manager onto Box Net
function handleCanvasDrop(e: DragEvent) {
  e.preventDefault();
  const rawAsset = e.dataTransfer?.getData('application/json');
  const rawUrl = e.dataTransfer?.getData('text/plain');

  if (rawAsset) {
    try {
      const asset = JSON.parse(rawAsset);
      if (activeElement.value && activeElement.value.type === 'image-frame') {
        snapshotState();
        activeElement.value.bgImageUrl = asset.url;
        persistChanges();
        showToast(`Applied ${asset.name} to box frame!`);
        return;
      }
      handleAddImageFrame(asset.url);
      return;
    } catch (e) {}
  }

  if (rawUrl) {
    if (activeElement.value && activeElement.value.type === 'image-frame') {
      snapshotState();
      activeElement.value.bgImageUrl = rawUrl;
      persistChanges();
      showToast('Applied texture to box frame!');
      return;
    }
    handleAddImageFrame(rawUrl);
  }
}

const currentElements = computed(() => {
  if (!activeBox.value) return [];
  if (!activeBox.value.elements) {
    activeBox.value.elements = [];
  }
  return activeBox.value.elements;
});

const activeElement = computed(() => {
  return currentElements.value.find(el => el.id === selectedElementId.value) || null;
});

function snapshotState() {
  if (activeBox.value) {
    recordSnapshot(JSON.parse(JSON.stringify(activeBox.value)));
  }
}

function persistChanges() {
  if (activeBox.value) {
    saveBoxDieline(activeBox.value);
  }
}

function handleUndo() {
  performUndo((snapshot) => {
    if (activeBox.value && snapshot) {
      Object.assign(activeBox.value, snapshot);
      showToast('Undo successful');
    }
  });
}

function handleRedo() {
  performRedo((snapshot) => {
    if (activeBox.value && snapshot) {
      Object.assign(activeBox.value, snapshot);
      showToast('Redo successful');
    }
  });
}

function handleAddText() {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_txt_${Date.now()}`,
    name: 'Box Net Text',
    type: 'text',
    x: 20,
    y: 20,
    width: 60,
    height: 16,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    text: 'AGES 14+ · 1-4 PLAYERS',
    fontFamily: 'Outfit',
    fontSize: 12,
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
  showToast('Added draggable text box to box net');
}

// Add Placeholder Box (Header strip, footer, logo box, side panel, barcode box, etc.)
function handleAddBox(preset: { shapeType: ShapeType; placeholderType: PlaceholderPreset; label: string; icon?: string }) {
  snapshotState();
  let w = 70;
  let h = 25;
  let bg = 'rgba(30, 41, 59, 0.75)';
  let border = '#F59E0B';
  let bWidth = 1.5;
  let bStyle: 'solid' | 'dashed' | 'dotted' | 'none' = 'solid';
  let radius = 3;

  if (preset.placeholderType === 'header') {
    w = 120;
    h = 16;
    bg = '#0F172A';
  } else if (preset.placeholderType === 'footer') {
    w = 120;
    h = 14;
    bg = '#0B0F17';
    border = '#334155';
  } else if (preset.placeholderType === 'portrait') {
    w = 60;
    h = 60;
    bg = '#1E293B';
    bStyle = 'dashed';
  } else if (preset.shapeType === 'hex') {
    w = 40;
    h = 40;
    bg = '#1E293B';
  } else if (preset.shapeType === 'circle') {
    w = 30;
    h = 30;
    bg = '#D97706';
    radius = 9999;
  }

  const newEl: CanvasElement = {
    id: `el_box_${Date.now()}`,
    name: preset.label,
    type: 'shape',
    shapeType: preset.shapeType,
    placeholderType: preset.placeholderType,
    placeholderLabel: preset.label,
    showPlaceholderLabel: true,
    x: 25,
    y: 25,
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
    iconGlyph: preset.icon || '📦',
    isFlipped: false
  };

  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast(`Added ${preset.label} to box net`);
}

function handleBlankCanvas() {
  if (!activeBox.value) return;
  snapshotState();
  activeBox.value.elements = [];
  activeBox.value.panels = {
    lidTop: { title: '', subtitle: '', bgColor: '#0F172A', accentColor: '#334155' },
    lidSides: { text: '', color: '#0F172A' },
    trayBottom: { text: '', color: '#0F172A' }
  };
  activeBox.value.showDefaultLabels = false;
  selectedElementId.value = null;
  persistChanges();
  showToast('Box net cleared to blank canvas!');
}

function handleClearDefaultContent() {
  if (!activeBox.value) return;
  snapshotState();
  if (!activeBox.value.panels) {
    activeBox.value.panels = {};
  }
  if (!activeBox.value.panels.lidTop) activeBox.value.panels.lidTop = { title: '', subtitle: '', bgColor: '#0F172A', accentColor: '#334155' };
  activeBox.value.panels.lidTop.title = '';
  activeBox.value.panels.lidTop.subtitle = '';
  if (!activeBox.value.panels.lidSides) activeBox.value.panels.lidSides = { text: '', color: '#0F172A' };
  activeBox.value.panels.lidSides.text = '';
  if (!activeBox.value.panels.trayBottom) activeBox.value.panels.trayBottom = { text: '', color: '#0F172A' };
  activeBox.value.panels.trayBottom.text = '';
  activeBox.value.showDefaultLabels = false;
  persistChanges();
  showToast('Cleared all default box labels and text');
}

function handleAddIconElement(icon: TabletopIcon) {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_ico_${Date.now()}`,
    name: `${icon.name} Icon`,
    type: 'icon',
    x: 20,
    y: 20,
    width: 20,
    height: 20,
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
  showToast(`Added ${icon.name} to box canvas`);
}

function handleInsertInlineIcon(icon: TabletopIcon) {
  if (activeElement.value && (activeElement.value.type === 'text' || activeElement.value.type === 'shape')) {
    snapshotState();
    const token = icon.glyph || '⚔️';
    activeElement.value.text = (activeElement.value.text ? `${activeElement.value.text} ` : '') + token;
    persistChanges();
    showToast(`Inserted ${icon.name} into text`);
  } else {
    handleAddIconElement(icon);
  }
}

function handleSetPortraitIcon(icon: TabletopIcon) {
  handleAddIconElement(icon);
}

function handleApplyTemplate() {
  if (!activeBox.value) return;
  snapshotState();
  activeBox.value.showDefaultLabels = true;
  activeBox.value.panels = {
    lidTop: { title: activeBox.value.name.toUpperCase(), subtitle: 'TACTICAL TABLETOP GAME', bgColor: '#0F172A', accentColor: '#F59E0B' },
    lidSides: { text: '1-4 PLAYERS · AGE 14+ · 60 MIN', color: '#1E293B' },
    trayBottom: { text: 'CONTAINS: Cards, Tokens, Standees, Boards, and Rules Codex.', color: '#0B0F17' }
  };
  persistChanges();
  showToast('Applied box template');
}

</script>

<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- Sub-Sidebar: Box List & Templates -->
    <aside class="w-60 border-r border-slate-800 bg-[#0F172A]/70 flex flex-col shrink-0 select-none">
      <div class="p-3 border-b border-slate-800">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-slate-300 font-display uppercase tracking-wider">Packaging Boxes</span>
          <button
            @click="handleCreateBox"
            class="p-1 hover:bg-slate-800 rounded text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center cursor-pointer"
            title="Create Box"
          >
            <i class="ri-folder-add-line text-sm"></i>
          </button>
        </div>
        <select
          v-model="selectedBoxId"
          class="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option v-for="b in boxDielines" :key="b._id" :value="b._id">
            {{ b.name }}
          </option>
        </select>
      </div>

      <!-- Template Selector -->
      <div class="p-3 border-b border-slate-800 space-y-2">
        <span class="text-[11px] font-semibold text-slate-400">Template Net Structure</span>
        <div class="space-y-1.5" v-if="activeBox">
          <button
            v-for="tmpl in boxTemplates"
            :key="tmpl.id"
            @click="activeBox.templateType = tmpl.id; persistChanges()"
            class="w-full text-left p-2 rounded border text-xs transition-colors"
            :class="activeBox.templateType === tmpl.id
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'"
          >
            <div class="font-medium text-[11px]">{{ tmpl.label }}</div>
            <div class="text-[9px] text-slate-500 truncate">{{ tmpl.desc }}</div>
          </button>
        </div>
      </div>

      <!-- Presets -->
      <div class="p-3 space-y-2">
        <span class="text-[11px] font-semibold text-slate-400">Standard Presets</span>
        <div class="space-y-1">
          <button
            v-for="p in boxPresets"
            :key="p.name"
            @click="applyPreset(p)"
            class="w-full text-left px-2 py-1 text-[10px] rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-between"
          >
            <span>{{ p.name }}</span>
            <span class="font-mono text-[9px] text-slate-500">{{ p.w }}×{{ p.d }}</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Center Canvas: Dieline Net Visualizer -->
    <main class="flex-1 bg-[#131B2A] flex flex-col overflow-hidden relative">
      <!-- Universal Alignment Toolbar -->
      <AlignmentBar
        :has-selection="!!activeElement"
        :is-locked="activeElement?.locked"
        :zoom="zoomLevel"
        @undo="handleUndo"
        @redo="handleRedo"
        @add-text="handleAddText"
        @add-image-frame="handleAddImageFrame"
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

      <!-- Sub-Toolbar -->
      <div class="h-9 border-b border-slate-800/80 bg-[#0B0F17]/60 px-4 flex items-center justify-between shrink-0 select-none">
        <div class="flex items-center gap-3">
          <div v-if="activeBox?.templateType === 'telescope-2part'" class="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5">
            <button
              @click="activeViewTab = 'lid'; selectedElementId = null"
              class="px-2.5 py-0.5 text-xs rounded transition-colors"
              :class="activeViewTab === 'lid' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'"
            >
              Top Lid Net (+{{ activeBox.lidClearanceMm }}mm)
            </button>
            <button
              @click="activeViewTab = 'tray'; selectedElementId = null"
              class="px-2.5 py-0.5 text-xs rounded transition-colors"
              :class="activeViewTab === 'tray' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'"
            >
              Bottom Tray Net
            </button>
          </div>

          <span class="text-xs text-slate-400 font-mono">
            {{ activeBox?.targetDimensions.width }} × {{ activeBox?.targetDimensions.depth }} × {{ activeBox?.targetDimensions.height }} mm
          </span>
        </div>

        <div class="flex items-center gap-4 text-[10px] font-mono text-slate-400">
          <span class="flex items-center gap-1.5">
            <span class="w-2.5 h-0.5 bg-slate-100"></span> Cut Line
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2.5 h-0.5 border-t border-dashed border-cyan-400"></span> Fold Crease
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 bg-amber-500/20 border border-amber-500/50"></span> Flap Tab
          </span>
        </div>
      </div>

      <!-- Dieline Net Canvas Viewport -->
      <div
        class="flex-1 flex items-center justify-center p-8 overflow-auto select-none"
        @click="selectedElementId = null"
        @dragover.prevent
        @drop="handleCanvasDrop"
      >
        <div v-if="activeBox" class="relative" @click.stop>
          <div class="p-6 bg-[#0B0F17]/90 border border-slate-800 rounded-xl shadow-2xl relative">
            
            <!-- Standard T-Layout or Cross Dieline Net -->
            <div class="relative flex flex-col items-center">
              <!-- North Wall -->
              <div
                class="relative border border-slate-300 border-b-cyan-400 border-b-dashed flex items-center justify-center text-center p-1"
                :style="{
                  width: `${activeBox.targetDimensions.width * scale}px`,
                  height: `${activeBox.targetDimensions.height * scale}px`,
                  backgroundColor: activeViewTab === 'lid' ? activeBox.panels.lidSides?.color || '#1E293B' : '#0F172A'
                }"
              >
                <!-- Flaps -->
                <div class="absolute -left-3 top-0 bottom-0 w-3 bg-amber-500/20 border border-amber-500/40 text-[7px] text-amber-300 flex items-center justify-center font-mono">Tab</div>
                <div class="absolute -right-3 top-0 bottom-0 w-3 bg-amber-500/20 border border-amber-500/40 text-[7px] text-amber-300 flex items-center justify-center font-mono">Tab</div>
                <span class="text-[9px] text-slate-400 font-mono rotate-180">▲ North Wall</span>
              </div>

              <!-- Center Row: West Wall + Main Face + East Wall -->
              <div class="flex items-center">
                <!-- West Wall -->
                <div
                  class="relative border border-slate-300 border-r-cyan-400 border-r-dashed flex items-center justify-center text-center p-1"
                  :style="{
                    width: `${activeBox.targetDimensions.height * scale}px`,
                    height: `${activeBox.targetDimensions.depth * scale}px`,
                    backgroundColor: activeViewTab === 'lid' ? activeBox.panels.lidSides?.color || '#1E293B' : '#0F172A'
                  }"
                >
                  <span class="text-[9px] text-slate-400 font-mono -rotate-90">◄ West Wall</span>
                </div>

                <!-- Main Face (Center Artboard with Draggable Elements) -->
                <div
                  class="relative border-2 border-slate-200 overflow-hidden shadow-inner flex flex-col items-center justify-center"
                  :style="{
                    width: `${activeBox.targetDimensions.width * scale}px`,
                    height: `${activeBox.targetDimensions.depth * scale}px`,
                    backgroundColor: activeViewTab === 'lid' ? activeBox.panels.lidTop?.bgColor || '#0F172A' : '#0B0F17'
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

                  <!-- Static background title if no custom elements -->
                  <div v-if="currentElements.length === 0" class="pointer-events-none text-center p-4">
                    <div class="text-xs font-bold text-white tracking-widest font-display uppercase">
                      {{ activeBox.panels.lidTop?.title || 'GAME TITLE' }}
                    </div>
                    <div class="text-[10px] text-amber-400 font-mono mt-0.5">
                      {{ activeBox.panels.lidTop?.subtitle || 'TACTICAL BOARD GAME' }}
                    </div>
                  </div>

                  <!-- Draggable Custom Elements Layer -->
                  <TransformBox
                    v-for="el in currentElements"
                    :key="el.id"
                    :element="el"
                    :is-selected="selectedElementId === el.id"
                    :scale="scale"
                    @select="selectedElementId = el.id"
                    @start-drag="(e, elem) => startDrag(e, elem)"
                    @start-resize="(e, elem, h) => startResize(e, elem, h)"
                  />
                </div>

                <!-- East Wall -->
                <div
                  class="relative border border-slate-300 border-l-cyan-400 border-l-dashed flex items-center justify-center text-center p-1"
                  :style="{
                    width: `${activeBox.targetDimensions.height * scale}px`,
                    height: `${activeBox.targetDimensions.depth * scale}px`,
                    backgroundColor: activeViewTab === 'lid' ? activeBox.panels.lidSides?.color || '#1E293B' : '#0F172A'
                  }"
                >
                  <span class="text-[9px] text-slate-400 font-mono rotate-90">East Wall ►</span>
                </div>
              </div>

              <!-- South Wall -->
              <div
                class="relative border border-slate-300 border-t-cyan-400 border-t-dashed flex items-center justify-center text-center p-1"
                :style="{
                  width: `${activeBox.targetDimensions.width * scale}px`,
                  height: `${activeBox.targetDimensions.height * scale}px`,
                  backgroundColor: activeViewTab === 'lid' ? activeBox.panels.lidSides?.color || '#1E293B' : '#0F172A'
                }"
              >
                <!-- Flaps -->
                <div class="absolute -left-3 top-0 bottom-0 w-3 bg-amber-500/20 border border-amber-500/40 text-[7px] text-amber-300 flex items-center justify-center font-mono">Tab</div>
                <div class="absolute -right-3 top-0 bottom-0 w-3 bg-amber-500/20 border border-amber-500/40 text-[7px] text-amber-300 flex items-center justify-center font-mono">Tab</div>
                <span class="text-[9px] text-slate-400 font-mono">▼ South Wall</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Right Inspector: Box Dimensions + Visual Layer Engine -->
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
          @move-up="handleMoveLayerUp"
          @move-down="handleMoveLayerDown"
          @delete="handleDeleteElement"
          @change="persistChanges"
        />
      </div>

      <!-- Box Dimensions -->
      <div v-if="activeBox" class="border-t border-slate-800 pt-4 space-y-3">
        <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Net Dimensions</span>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Width</span>
            <input
              type="number"
              v-model.number="activeBox.targetDimensions.width"
              @change="persistChanges"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Depth</span>
            <input
              type="number"
              v-model.number="activeBox.targetDimensions.depth"
              @change="persistChanges"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Height</span>
            <input
              type="number"
              v-model.number="activeBox.targetDimensions.height"
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
