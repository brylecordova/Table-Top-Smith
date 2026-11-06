<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  standeeSets,
  saveStandees,
  showToast
} from '../../stores/projectStore.ts';
import {
  recordSnapshot,
  performUndo,
  performRedo
} from '../../stores/historyStore.ts';
import {
  UserCheck,
  Plus,
  Trash2,
  Copy,
  Sliders
} from 'lucide-vue-next';
import type { StandeeItem, CanvasElement, TabletopIcon } from '../../types/index.ts';
import TransformBox from '../common/TransformBox.vue';
import AlignmentBar from '../common/AlignmentBar.vue';
import ElementInspector from '../common/ElementInspector.vue';
import LayerPanel from '../common/LayerPanel.vue';
import IconPickerModal from '../common/IconPickerModal.vue';
import { useCanvasTransform } from '../../composables/useCanvasTransform.ts';

const selectedStandeeId = ref<string>('');
const selectedElementId = ref<string | null>(null);
const isFoldOverMode = ref<boolean>(false);
const showIconModal = ref(false);

const standeeScale = 4.0;

if (standeeSets.value.length > 0 && standeeSets.value[0].standees.length > 0) {
  selectedStandeeId.value = standeeSets.value[0].standees[0].id;
}

const activeStandee = computed(() => {
  if (standeeSets.value.length === 0) return null;
  const set = standeeSets.value[0];
  return set.standees.find(s => s.id === selectedStandeeId.value) || set.standees[0] || null;
});

const currentElements = computed(() => {
  if (!activeStandee.value) return [];
  if (!activeStandee.value.elements) {
    activeStandee.value.elements = [];
  }
  return activeStandee.value.elements;
});

const activeElement = computed(() => {
  return currentElements.value.find(el => el.id === selectedElementId.value) || null;
});

function snapshotState() {
  if (standeeSets.value.length > 0) {
    recordSnapshot(JSON.parse(JSON.stringify(standeeSets.value[0])));
  }
}

function persistChanges() {
  if (standeeSets.value.length > 0) {
    saveStandees(standeeSets.value[0]);
  }
}

const { startDrag, startResize, activeSmartGuides } = useCanvasTransform({
  snapGridMm: 1,
  canvasScale: () => standeeScale,
  canvasDimensionsMm: () => ({
    width: activeStandee.value?.widthMm || 32,
    height: activeStandee.value?.heightMm || 48
  }),
  getAllElements: () => currentElements.value,
  onTransformStart: () => snapshotState(),
  onTransformEnd: () => persistChanges()
});

// Drag & Drop asset from Persistent Asset Manager onto Standee
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
        showToast(`Applied ${asset.name} to standee cutout!`);
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
      showToast('Applied image to standee cutout!');
      return;
    }
    handleAddImageFrame(rawUrl);
  }
}

function handleUndo() {
  performUndo((snapshot) => {
    if (standeeSets.value.length > 0 && snapshot) {
      Object.assign(standeeSets.value[0], snapshot);
      showToast('Undo successful');
    }
  });
}

function handleRedo() {
  performRedo((snapshot) => {
    if (standeeSets.value.length > 0 && snapshot) {
      Object.assign(standeeSets.value[0], snapshot);
      showToast('Redo successful');
    }
  });
}

function handleAddText() {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_txt_${Date.now()}`,
    name: 'Character Banner',
    type: 'text',
    x: 4,
    y: 35,
    width: 24,
    height: 8,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    text: activeStandee.value?.name || 'Vanguard Knight',
    fontFamily: 'Outfit',
    fontSize: 10,
    fontWeight: 700,
    fontStyle: 'normal',
    textAlign: 'center',
    color: '#FFFFFF',
    lineHeight: 1.1,
    hasShadow: true,
    shadowColor: 'rgba(0,0,0,0.9)'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast('Added text to standee');
}

function handleAddImageFrame(bgUrl?: string) {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_img_${Date.now()}`,
    name: 'Character Figure Cutout',
    type: 'image-frame',
    x: 2,
    y: 8,
    width: 28,
    height: 38,
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
    borderRadius: 0,
    backgroundColor: 'transparent'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast('Added character art frame to standee');
}

function handleAddIconElement(icon: TabletopIcon) {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_ico_${Date.now()}`,
    name: `${icon.name} Crest`,
    type: 'icon',
    x: 8,
    y: 12,
    width: 16,
    height: 16,
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
  showToast(`Added ${icon.name} to standee`);
}

function handleInsertInlineIcon(icon: TabletopIcon) {
  if (activeElement.value && activeElement.value.type === 'text') {
    snapshotState();
    activeElement.value.text = (activeElement.value.text || '') + ` ${icon.glyph}`;
    persistChanges();
  }
}

function handleSetPortraitIcon(icon: TabletopIcon) {
  if (activeStandee.value) {
    snapshotState();
    activeStandee.value.icon = icon.glyph;
    persistChanges();
  }
}

function handleAlign(direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') {
  if (!activeElement.value || !activeStandee.value) return;
  snapshotState();
  const el = activeElement.value;
  const w = activeStandee.value.widthMm;
  const h = activeStandee.value.heightMm;

  if (direction === 'left') el.x = 2;
  else if (direction === 'center-h') el.x = Math.round((w - el.width) / 2);
  else if (direction === 'right') el.x = Math.round(w - el.width - 2);
  else if (direction === 'top') el.y = 2;
  else if (direction === 'center-v') el.y = Math.round((h - el.height) / 2);
  else if (direction === 'bottom') el.y = Math.round(h - el.height - 2);

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
</script>

<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- Sub-Sidebar: Standee List -->
    <aside class="w-60 border-r border-slate-800 bg-[#0F172A]/70 flex flex-col shrink-0 select-none">
      <div class="p-3 border-b border-slate-800 flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-300 font-display uppercase tracking-wider">Figure Standees</span>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div
          v-for="st in standeeSets[0]?.standees || []"
          :key="st.id"
          @click="selectedStandeeId = st.id; selectedElementId = null"
          class="p-2 rounded text-xs flex items-center justify-between cursor-pointer transition-colors"
          :class="selectedStandeeId === st.id
            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
            : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'"
        >
          <div class="flex items-center gap-2 truncate">
            <span class="text-base shrink-0">{{ st.icon || '♟️' }}</span>
            <div class="truncate">
              <div class="font-medium truncate">{{ st.name }}</div>
              <div class="text-[10px] text-slate-500 font-mono">{{ st.role }} · {{ st.widthMm }}×{{ st.heightMm }}mm</div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Center Canvas: Standee Visualizer -->
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
        <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            v-model="isFoldOverMode"
            class="rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0"
          />
          <span>Fold-Over Symmetrical Cutout Mode</span>
        </label>
        <span class="text-xs text-slate-400 font-mono">
          {{ activeStandee?.name }} · {{ activeStandee?.widthMm }} × {{ activeStandee?.heightMm }} mm
        </span>
      </div>

      <!-- Preview Viewport -->
      <div
        class="flex-1 flex flex-col items-center justify-center p-8 overflow-auto select-none"
        @click="selectedElementId = null"
        @dragover.prevent
        @drop="handleCanvasDrop"
      >
        <div v-if="activeStandee" class="flex flex-col items-center select-none" @click.stop>
          <!-- Fold-Over Top Reflection if enabled -->
          <div
            v-if="isFoldOverMode"
            class="opacity-60 flex flex-col items-center rotate-180 border-b border-dashed border-cyan-400 pb-1 pointer-events-none"
          >
            <div
              class="relative flex flex-col items-center justify-center shadow-md p-3 text-center border border-slate-400"
              :class="activeStandee.shape === 'arch' ? 'rounded-t-full' : 'rounded-t-lg'"
              :style="{
                width: `${activeStandee.widthMm * standeeScale}px`,
                height: `${activeStandee.heightMm * standeeScale}px`,
                backgroundColor: activeStandee.color
              }"
            >
              <div class="text-4xl filter drop-shadow">{{ activeStandee.icon }}</div>
              <div class="text-xs font-bold text-white font-display mt-1">{{ activeStandee.name }}</div>
            </div>
          </div>

          <!-- Main Standee Figure with Draggable Elements -->
          <div class="flex flex-col items-center">
            <!-- Cutout Silhouette Body -->
            <div
              class="relative flex flex-col items-center justify-between shadow-2xl p-2 border-2 border-slate-100 transition-all overflow-hidden"
              :class="activeStandee.shape === 'arch' ? 'rounded-t-full' : 'rounded-t-lg'"
              :style="{
                width: `${activeStandee.widthMm * standeeScale}px`,
                height: `${activeStandee.heightMm * standeeScale}px`,
                backgroundColor: activeStandee.color
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

              <!-- Default Background art if no custom elements -->
              <div v-if="currentElements.length === 0" class="pointer-events-none flex flex-col items-center justify-between h-full w-full py-2">
                <span class="text-[9px] font-mono tracking-widest uppercase bg-black/40 text-amber-300 px-2 py-0.5 rounded-full">
                  {{ activeStandee.role }}
                </span>
                <div class="text-5xl filter drop-shadow my-auto">{{ activeStandee.icon }}</div>
                <div class="w-full bg-black/60 py-1 px-2 rounded border border-white/20 text-center">
                  <span class="text-xs font-bold text-white font-display truncate block">{{ activeStandee.name }}</span>
                </div>
              </div>

              <!-- Custom Draggable Elements Layer -->
              <TransformBox
                v-for="el in currentElements"
                :key="el.id"
                :element="el"
                :is-selected="selectedElementId === el.id"
                :scale="standeeScale"
                @select="selectedElementId = el.id"
                @start-drag="(e, elem) => startDrag(e, elem)"
                @start-resize="(e, elem, h) => startResize(e, elem, h)"
              />
            </div>

            <!-- Base Slot Connector Tab -->
            <div
              class="border-x-2 border-b-2 border-amber-400 bg-amber-500/20 flex flex-col items-center justify-center text-[9px] font-mono text-amber-300 shadow-inner"
              :style="{
                width: `${activeStandee.baseTabMm.width * standeeScale}px`,
                height: `${activeStandee.baseTabMm.height * standeeScale}px`
              }"
            >
              <span>Base Tab ({{ activeStandee.baseTabMm.width }}×{{ activeStandee.baseTabMm.height }}mm)</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Right Inspector: Standee Properties + Visual Layer Engine -->
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

      <!-- Standee Base Parameters -->
      <div v-if="activeStandee" class="border-t border-slate-800 pt-4 space-y-3">
        <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Figure Dimensions</span>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Width (mm)</span>
            <input
              type="number"
              v-model.number="activeStandee.widthMm"
              @change="persistChanges"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Height (mm)</span>
            <input
              type="number"
              v-model.number="activeStandee.heightMm"
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
