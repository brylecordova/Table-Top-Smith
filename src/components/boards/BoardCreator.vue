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
import {
  Map,
  Plus,
  Trash2,
  Copy,
  Sliders,
  Grid
} from 'lucide-vue-next';
import type { BoardItem, BoardZone, CanvasElement, TabletopIcon } from '../../types/index.ts';
import TransformBox from '../common/TransformBox.vue';
import AlignmentBar from '../common/AlignmentBar.vue';
import ElementInspector from '../common/ElementInspector.vue';
import LayerPanel from '../common/LayerPanel.vue';
import IconPickerModal from '../common/IconPickerModal.vue';
import { useCanvasTransform } from '../../composables/useCanvasTransform.ts';

const selectedElementId = ref<string | null>(null);
const showIconModal = ref(false);

const boardScale = computed(() => {
  if (!activeBoard.value) return 1;
  const maxDim = Math.max(activeBoard.value.dimensionsMm.width, activeBoard.value.dimensionsMm.height);
  return Math.min(1.2, 500 / maxDim);
});

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
      if (activeElement.value && activeElement.value.type === 'image-frame') {
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
    if (activeElement.value && activeElement.value.type === 'image-frame') {
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

function handleAddText() {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_txt_${Date.now()}`,
    name: 'Map Title / Track',
    type: 'text',
    x: 20,
    y: 20,
    width: 120,
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

function handleAddImageFrame(bgUrl?: string) {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_img_${Date.now()}`,
    name: 'Board Texture Frame',
    type: 'image-frame',
    x: 30,
    y: 30,
    width: 150,
    height: 100,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 0.85,
    bgImageUrl: bgUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    fgImageUrl: '',
    imageFit: 'cover',
    borderWidth: 1.5,
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

function handleAddIconElement(icon: TabletopIcon) {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_ico_${Date.now()}`,
    name: `${icon.name} Marker`,
    type: 'icon',
    x: 40,
    y: 40,
    width: 24,
    height: 24,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    iconGlyph: icon.glyph,
    iconColor: '#F59E0B'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast(`Added ${icon.name} marker to board`);
}

function handleInsertInlineIcon(icon: TabletopIcon) {
  if (activeElement.value && activeElement.value.type === 'text') {
    snapshotState();
    activeElement.value.text = (activeElement.value.text || '') + ` ${icon.glyph}`;
    persistChanges();
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
    x: activeElement.value.x + 8,
    y: activeElement.value.y + 8
  };
  currentElements.value.push(clone);
  selectedElementId.value = clone.id;
  persistChanges();
}

function handleDeleteElement(id: string) {
  snapshotState();
  const index = currentElements.value.findIndex(el => el.id === id);
  if (index >= 0) {
    currentElements.value.splice(index, 1);
    selectedElementId.value = null;
    persistChanges();
  }
}

function handleAddZone() {
  if (!activeBoard.value) return;
  snapshotState();
  const newZone: BoardZone = {
    id: `z_${Date.now()}`,
    name: 'New Encounter Zone',
    x: 30,
    y: 30,
    width: 100,
    height: 70,
    color: '#1E293B'
  };
  activeBoard.value.zones.push(newZone);
  persistChanges();
  showToast('Added zone to board');
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
            <span class="text-base shrink-0">🗺️</span>
            <div class="truncate">
              <div class="font-medium truncate">{{ b.name }}</div>
              <div class="text-[10px] text-slate-500 font-mono capitalize">{{ b.type }} · {{ b.dimensionsMm.width }}×{{ b.dimensionsMm.height }}mm</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Center Canvas: Board Visualizer -->
    <main class="flex-1 bg-[#131B2A] flex flex-col overflow-hidden relative">
      <!-- Universal Alignment Toolbar -->
      <AlignmentBar
        :has-selection="!!activeElement"
        :is-locked="activeElement?.locked"
        @undo="handleUndo"
        @redo="handleRedo"
        @add-text="handleAddText"
        @add-image-frame="handleAddImageFrame"
        @open-icons="showIconModal = true"
        @align="handleAlign"
        @duplicate="handleDuplicateElement"
        @delete="activeElement && handleDeleteElement(activeElement.id)"
      />

      <div class="h-9 border-b border-slate-800/80 bg-[#0B0F17]/60 px-4 flex items-center justify-between shrink-0 select-none">
        <span class="text-xs text-white font-medium">
          {{ activeBoard?.name }} ({{ activeBoard?.dimensionsMm.width }} × {{ activeBoard?.dimensionsMm.height }} mm)
        </span>
        <button
          @click="handleAddZone"
          class="px-2 py-0.5 text-xs text-slate-950 font-semibold bg-amber-400 hover:bg-amber-300 rounded flex items-center gap-1 transition-colors"
        >
          <Plus class="w-3 h-3" />
          Add Zone
        </button>
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

            <!-- Grid Overlay -->
            <div
              v-if="activeBoard.gridType === 'square'"
              class="absolute inset-0 pointer-events-none opacity-20 z-10"
              :style="{
                backgroundImage: 'linear-gradient(to right, #94A3B8 1px, transparent 1px), linear-gradient(to bottom, #94A3B8 1px, transparent 1px)',
                backgroundSize: `${activeBoard.gridSizeMm * boardScale}px ${activeBoard.gridSizeMm * boardScale}px`
              }"
            ></div>

            <!-- Board Zones -->
            <div
              v-for="z in activeBoard.zones"
              :key="z.id"
              class="absolute border border-slate-600 rounded p-2 flex flex-col justify-between transition-all group"
              :style="{
                left: `${z.x * boardScale}px`,
                top: `${z.y * boardScale}px`,
                width: `${z.width * boardScale}px`,
                height: `${z.height * boardScale}px`,
                backgroundColor: z.color
              }"
            >
              <span class="text-[10px] font-bold text-white font-display truncate">{{ z.name }}</span>
            </div>

            <!-- Draggable Custom Elements Layer -->
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
