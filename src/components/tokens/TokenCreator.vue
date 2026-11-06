<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  tokenSets,
  saveTokens,
  showToast
} from '../../stores/projectStore.ts';
import {
  recordSnapshot,
  performUndo,
  performRedo
} from '../../stores/historyStore.ts';
import {
  Coins,
  Plus,
  Trash2,
  Copy,
  Sliders
} from 'lucide-vue-next';
import type { TokenItem, CanvasElement, TabletopIcon, ShapeType, PlaceholderPreset } from '../../types/index.ts';
import TransformBox from '../common/TransformBox.vue';
import AlignmentBar from '../common/AlignmentBar.vue';
import ElementInspector from '../common/ElementInspector.vue';
import LayerPanel from '../common/LayerPanel.vue';
import IconPickerModal from '../common/IconPickerModal.vue';
import { useCanvasTransform } from '../../composables/useCanvasTransform.ts';

const selectedTokenId = ref<string>('');
const selectedElementId = ref<string | null>(null);
const showIconModal = ref(false);
const zoomLevel = ref<number>(1);

const tokenScale = computed(() => 4.5 * zoomLevel.value);

function handleZoomIn() {
  zoomLevel.value = Math.min(3, +(zoomLevel.value + 0.25).toFixed(2));
}

function handleZoomOut() {
  zoomLevel.value = Math.max(0.5, +(zoomLevel.value - 0.25).toFixed(2));
}

function handleZoomReset() {
  zoomLevel.value = 1;
}

if (tokenSets.value.length > 0 && tokenSets.value[0].tokens.length > 0) {
  selectedTokenId.value = tokenSets.value[0].tokens[0].id;
}

const activeToken = computed(() => {
  if (tokenSets.value.length === 0) return null;
  const set = tokenSets.value[0];
  return set.tokens.find(t => t.id === selectedTokenId.value) || set.tokens[0] || null;
});

const currentElements = computed(() => {
  if (!activeToken.value) return [];
  if (!activeToken.value.elements) {
    activeToken.value.elements = [];
  }
  return activeToken.value.elements;
});

const activeElement = computed(() => {
  return currentElements.value.find(el => el.id === selectedElementId.value) || null;
});

function snapshotState() {
  if (tokenSets.value.length > 0) {
    recordSnapshot(JSON.parse(JSON.stringify(tokenSets.value[0])));
  }
}

function persistChanges() {
  if (tokenSets.value.length > 0) {
    saveTokens(tokenSets.value[0]);
  }
}

const { startDrag, startResize, activeSmartGuides } = useCanvasTransform({
  snapGridMm: 1,
  canvasScale: () => tokenScale.value,
  canvasDimensionsMm: () => ({
    width: activeToken.value?.diameterMm || 24,
    height: activeToken.value?.diameterMm || 24
  }),
  getAllElements: () => currentElements.value,
  onTransformStart: () => snapshotState(),
  onTransformEnd: () => persistChanges()
});

// Drag & Drop asset from Persistent Asset Manager onto Token
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
        showToast(`Applied ${asset.name} to token!`);
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
      showToast('Applied image to token!');
      return;
    }
    handleAddImageFrame(rawUrl);
  }
}

function handleUndo() {
  performUndo((snapshot) => {
    if (tokenSets.value.length > 0 && snapshot) {
      Object.assign(tokenSets.value[0], snapshot);
      showToast('Undo successful');
    }
  });
}

function handleRedo() {
  performRedo((snapshot) => {
    if (tokenSets.value.length > 0 && snapshot) {
      Object.assign(tokenSets.value[0], snapshot);
      showToast('Redo successful');
    }
  });
}

function handleAddText() {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_txt_${Date.now()}`,
    name: 'Stat Value',
    type: 'text',
    x: 4,
    y: 12,
    width: 16,
    height: 7,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    text: '+2 VP',
    fontFamily: 'JetBrains Mono',
    fontSize: 10,
    fontWeight: 700,
    fontStyle: 'normal',
    textAlign: 'center',
    color: '#F8FAFC',
    lineHeight: 1.1,
    hasShadow: true,
    shadowColor: 'rgba(0,0,0,0.9)'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast('Added text to token');
}

// Add Placeholder Box (Ring boundary, counter box, badge, HP marker, etc.)
function handleAddBox(preset: { shapeType: ShapeType; placeholderType: PlaceholderPreset; label: string; icon?: string }) {
  snapshotState();
  const d = activeToken.value?.diameterMm || 24;
  let w = Math.round(d * 0.7);
  let h = Math.round(d * 0.4);
  let x = Math.round((d - w) / 2);
  let y = Math.round((d - h) / 2);
  let bg = 'rgba(15, 23, 42, 0.8)';
  let border = '#F59E0B';
  let bWidth = 1;
  let bStyle: 'solid' | 'dashed' | 'dotted' | 'none' = 'solid';
  let radius = 2;

  if (preset.shapeType === 'circle') {
    w = Math.round(d * 0.6);
    h = w;
    x = Math.round((d - w) / 2);
    y = Math.round((d - h) / 2);
    radius = 9999;
  } else if (preset.shapeType === 'hex') {
    w = Math.round(d * 0.75);
    h = w;
    x = Math.round((d - w) / 2);
    y = Math.round((d - h) / 2);
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
    iconGlyph: preset.icon || '🪙',
    isFlipped: false
  };

  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast(`Added ${preset.label} to token`);
}

function handleBlankCanvas() {
  if (!activeToken.value) return;
  snapshotState();
  activeToken.value.elements = [];
  activeToken.value.icon = '';
  activeToken.value.text = '';
  selectedElementId.value = null;
  persistChanges();
  showToast('Token cleared to blank canvas!');
}

function handleApplyTemplate() {
  if (!activeToken.value) return;
  snapshotState();
  activeToken.value.icon = '💰';
  activeToken.value.text = '1G';
  activeToken.value.elements = [
    {
      id: 'el_ring',
      name: 'Inner Decorative Ring',
      type: 'shape',
      shapeType: 'circle',
      placeholderType: 'custom',
      placeholderLabel: 'Inner Border Ring',
      showPlaceholderLabel: false,
      x: 2,
      y: 2,
      width: (activeToken.value.diameterMm || 24) - 4,
      height: (activeToken.value.diameterMm || 24) - 4,
      rotation: 0,
      zIndex: 1,
      locked: false,
      hidden: false,
      opacity: 0.8,
      backgroundColor: 'transparent',
      borderColor: '#FDE68A',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderRadius: 9999
    }
  ];
  persistChanges();
  showToast('Applied token template');
}

function handleAddImageFrame(bgUrl?: string) {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_img_${Date.now()}`,
    name: 'Insignia Frame',
    type: 'image-frame',
    x: 3,
    y: 3,
    width: 18,
    height: 18,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    bgImageUrl: bgUrl || '',
    fgImageUrl: '',
    imageFit: 'contain',
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'none',
    borderRadius: 9,
    backgroundColor: 'transparent'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast('Added image frame to token');
}

function handleAddIconElement(icon: TabletopIcon) {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_ico_${Date.now()}`,
    name: `${icon.name} Glyph`,
    type: 'icon',
    x: 5,
    y: 4,
    width: 12,
    height: 12,
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
  showToast(`Added ${icon.name} to token`);
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
    }
    persistChanges();
    showToast(`Inserted ${icon.glyph} into ${activeElement.value.name}`);
  } else {
    const newEl: CanvasElement = {
      id: `el_txt_${Date.now()}`,
      name: `${icon.name} Text`,
      type: 'text',
      x: 10,
      y: 10,
      width: 25,
      height: 8,
      rotation: 0,
      zIndex: currentElements.value.length + 1,
      locked: false,
      hidden: false,
      opacity: 1,
      text: `${icon.glyph} ${icon.name}`,
      fontFamily: 'Outfit',
      fontSize: 10,
      fontWeight: 600,
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#FFFFFF',
      lineHeight: 1.2
    };
    currentElements.value.push(newEl);
    selectedElementId.value = newEl.id;
    persistChanges();
    showToast(`Added text with ${icon.glyph}`);
  }
}

function handleSetPortraitIcon(icon: TabletopIcon) {
  if (activeToken.value) {
    snapshotState();
    activeToken.value.icon = icon.glyph;
    persistChanges();
  }
}

function handleAlign(direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') {
  if (!activeElement.value || !activeToken.value) return;
  snapshotState();
  const el = activeElement.value;
  const d = activeToken.value.diameterMm;

  if (direction === 'left') el.x = 2;
  else if (direction === 'center-h') el.x = Math.round((d - el.width) / 2);
  else if (direction === 'right') el.x = Math.round(d - el.width - 2);
  else if (direction === 'top') el.y = 2;
  else if (direction === 'center-v') el.y = Math.round((d - el.height) / 2);
  else if (direction === 'bottom') el.y = Math.round(d - el.height - 2);

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
    x: activeElement.value.x + 2,
    y: activeElement.value.y + 2
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

function handleAddToken() {
  if (tokenSets.value.length === 0) return;
  const newId = `tok_${Date.now()}`;
  const newToken: TokenItem = {
    id: newId,
    name: 'Mana Crystal',
    shape: 'hex',
    diameterMm: 24,
    color: '#8B5CF6',
    text: '+1 MP',
    icon: '💎',
    quantity: 12,
    elements: []
  };
  tokenSets.value[0].tokens.push(newToken);
  selectedTokenId.value = newId;
  persistChanges();
  showToast('Created new token');
}
</script>

<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- Sub-Sidebar: Token List -->
    <aside class="w-60 border-r border-slate-800 bg-[#0F172A]/70 flex flex-col shrink-0 select-none">
      <div class="p-3 border-b border-slate-800 flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-300 font-display uppercase tracking-wider">Punchboard Tokens</span>
        <button
          @click="handleAddToken"
          class="p-1 hover:bg-slate-800 rounded text-amber-400 hover:text-amber-300 transition-colors"
          title="Add Token"
        >
          <Plus class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div
          v-for="tok in tokenSets[0]?.tokens || []"
          :key="tok.id"
          @click="selectedTokenId = tok.id; selectedElementId = null"
          class="p-2 rounded text-xs flex items-center justify-between cursor-pointer transition-colors"
          :class="selectedTokenId === tok.id
            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
            : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'"
        >
          <div class="flex items-center gap-2 truncate">
            <span class="text-base shrink-0">{{ tok.icon || '🪙' }}</span>
            <div class="truncate">
              <div class="font-medium truncate">{{ tok.name }}</div>
              <div class="text-[10px] text-slate-500 font-mono">{{ tok.shape }} · Ø {{ tok.diameterMm }}mm</div>
            </div>
          </div>
          <span class="text-[10px] text-slate-500 font-mono shrink-0 ml-1">×{{ tok.quantity }}</span>
        </div>
      </div>
    </aside>

    <!-- Center Canvas: Token Punchboard Preview -->
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

      <div class="h-9 border-b border-slate-800/80 bg-[#0B0F17]/60 px-4 flex items-center justify-between shrink-0 select-none">
        <span class="text-xs text-slate-400 font-mono">
          {{ activeToken?.name }} · {{ activeToken?.shape }} · {{ activeToken?.diameterMm }}mm diameter
        </span>
        <span class="text-[11px] text-slate-500 font-mono">Drag elements freely on token face</span>
      </div>

      <!-- Preview Viewport -->
      <div
        class="flex-1 flex flex-col items-center justify-center p-8 overflow-auto select-none"
        @click="selectedElementId = null"
        @dragover.prevent
        @drop="handleCanvasDrop"
      >
        <div v-if="activeToken" class="flex flex-col items-center space-y-6" @click.stop>
          <!-- Token Render Container -->
          <div class="p-8 bg-[#0B0F17] border border-slate-800 rounded-2xl shadow-2xl flex items-center justify-center min-w-[280px] min-h-[280px]">
            <!-- Shape Container with Draggable Elements -->
            <div
              class="relative flex flex-col items-center justify-center shadow-2xl transition-all border-2 border-slate-100/90 select-none overflow-hidden"
              :class="activeToken.shape === 'circle' ? 'rounded-full' : activeToken.shape === 'rounded-square' ? 'rounded-2xl' : 'rounded-sm'"
              :style="{
                width: `${activeToken.diameterMm * tokenScale}px`,
                height: `${activeToken.diameterMm * tokenScale}px`,
                backgroundColor: activeToken.color,
                clipPath: activeToken.shape === 'hex' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' : 'none'
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

              <!-- Default Background Icon if no custom elements -->
              <div v-if="currentElements.length === 0" class="pointer-events-none text-center">
                <div class="text-4xl filter drop-shadow">{{ activeToken.icon }}</div>
                <div class="text-xs font-bold text-white font-mono mt-1 px-2 py-0.5 rounded bg-black/40">
                  {{ activeToken.text }}
                </div>
              </div>

              <!-- Custom Draggable Elements Layer -->
              <TransformBox
                v-for="el in currentElements"
                :key="el.id"
                :element="el"
                :is-selected="selectedElementId === el.id"
                :scale="tokenScale"
                @select="selectedElementId = el.id"
                @start-drag="(e, elem) => startDrag(e, elem)"
                @start-resize="(e, elem, h) => startResize(e, elem, h)"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Right Inspector: Token Properties + Visual Layer Engine -->
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

      <!-- Token Geometry -->
      <div v-if="activeToken" class="border-t border-slate-800 pt-4 space-y-3">
        <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Token Base Geometry</span>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Shape</span>
            <select
              v-model="activeToken.shape"
              @change="persistChanges"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="circle">Circle</option>
              <option value="square">Square</option>
              <option value="rounded-square">Rounded Square</option>
              <option value="hex">Hexagon</option>
            </select>
          </div>
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Diameter (mm)</span>
            <input
              type="number"
              v-model.number="activeToken.diameterMm"
              @change="persistChanges"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
        </div>
        <div>
          <span class="text-[9px] text-slate-500 font-mono">Token Color</span>
          <input
            type="color"
            v-model="activeToken.color"
            @input="persistChanges"
            class="w-full h-7 rounded bg-transparent cursor-pointer border border-slate-700 mt-0.5"
          />
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
