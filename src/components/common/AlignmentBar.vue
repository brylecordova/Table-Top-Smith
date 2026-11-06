<script setup lang="ts">
import { ref } from 'vue';
import {
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Type,
  Image as ImageIcon,
  Sparkles,
  Square,
  Hexagon,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkle,
  FilePlus,
  ChevronDown
} from 'lucide-vue-next';
import { canUndo, canRedo } from '../../stores/historyStore.ts';
import type { PlaceholderPreset, ShapeType } from '../../types/index.ts';

const props = withDefaults(defineProps<{
  hasSelection: boolean;
  isLocked?: boolean;
  zoom?: number;
}>(), {
  zoom: 1
});

const emit = defineEmits<{
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'align', direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom'): void;
  (e: 'add-text'): void;
  (e: 'add-image-frame'): void;
  (e: 'add-box', preset: { shapeType: ShapeType; placeholderType: PlaceholderPreset; label: string; icon?: string }): void;
  (e: 'open-icons'): void;
  (e: 'duplicate'): void;
  (e: 'delete'): void;
  (e: 'zoom-in'): void;
  (e: 'zoom-out'): void;
  (e: 'zoom-reset'): void;
  (e: 'blank-canvas'): void;
  (e: 'apply-template'): void;
}>();

const isBoxMenuOpen = ref(false);

const boxPresets = [
  { shapeType: 'rectangle' as ShapeType, placeholderType: 'header' as PlaceholderPreset, label: 'Header Bar', desc: 'Title & nameplate strip', icon: '🏷️' },
  { shapeType: 'rectangle' as ShapeType, placeholderType: 'footer' as PlaceholderPreset, label: 'Footer Bar', desc: 'Meta, credit or page numbering', icon: '📑' },
  { shapeType: 'rounded-rect' as ShapeType, placeholderType: 'portrait' as PlaceholderPreset, label: 'Portrait Box', desc: 'Hero or component visual box', icon: '🖼️' },
  { shapeType: 'rounded-rect' as ShapeType, placeholderType: 'effect' as PlaceholderPreset, label: 'Rules / Effect Box', desc: 'Card text or ability description', icon: '📜' },
  { shapeType: 'badge' as ShapeType, placeholderType: 'hp' as PlaceholderPreset, label: 'HP / Marker Badge', desc: 'Health, wound or stamina marker', icon: '❤️' },
  { shapeType: 'hex' as ShapeType, placeholderType: 'custom' as PlaceholderPreset, label: 'Hexagon Tile (Exploration)', desc: 'Flippable exploration map hex', icon: '⬢' },
  { shapeType: 'circle' as ShapeType, placeholderType: 'marker' as PlaceholderPreset, label: 'Circle Token / Coin', desc: 'Circular token or resource marker', icon: '🪙' },
  { shapeType: 'rectangle' as ShapeType, placeholderType: 'custom' as PlaceholderPreset, label: 'Custom Box Placeholder', desc: 'Freeform layout container', icon: '⏹️' }
];

function selectBoxPreset(preset: typeof boxPresets[0]) {
  isBoxMenuOpen.value = false;
  emit('add-box', preset);
}
</script>

<template>
  <div class="h-9 border-b border-slate-800 bg-[#0B0F17] px-3 flex items-center justify-between shrink-0 select-none text-xs">
    <!-- Left: History & Element Creation Tools -->
    <div class="flex items-center gap-1.5">
      <!-- Undo / Redo -->
      <div class="flex items-center bg-slate-900 border border-slate-700/80 rounded p-0.5">
        <button
          @click="emit('undo')"
          :disabled="!canUndo"
          class="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('redo')"
          :disabled="!canRedo"
          class="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="h-4 w-px bg-slate-800 mx-0.5"></div>

      <!-- Add Box Placeholder Dropdown Menu -->
      <div class="relative">
        <button
          @click="isBoxMenuOpen = !isBoxMenuOpen"
          class="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 hover:text-white flex items-center gap-1.5 transition-colors font-medium text-[11px]"
          title="Add placeholder box (Header, Footer, Portrait, Effect, HP, Hexagon, etc.)"
        >
          <Square class="w-3.5 h-3.5 text-amber-400" />
          <span>+ Add Box / Layer</span>
          <ChevronDown class="w-3 h-3 text-amber-400 opacity-70" />
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="isBoxMenuOpen"
          class="fixed inset-0 z-40"
          @click="isBoxMenuOpen = false"
        ></div>
        <div
          v-if="isBoxMenuOpen"
          class="absolute left-0 top-full mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1 z-50 space-y-0.5"
        >
          <div class="px-2 py-1 text-[10px] text-slate-500 font-mono uppercase tracking-wider border-b border-slate-800">
            Placeholder Box Presets
          </div>
          <button
            v-for="preset in boxPresets"
            :key="preset.label"
            @click="selectBoxPreset(preset)"
            class="w-full text-left px-2 py-1.5 rounded hover:bg-amber-500/15 hover:text-amber-200 text-slate-300 flex items-center gap-2 transition-colors text-[11px]"
          >
            <span class="text-base shrink-0">{{ preset.icon }}</span>
            <div class="truncate">
              <div class="font-semibold truncate">{{ preset.label }}</div>
              <div class="text-[9px] text-slate-500 truncate">{{ preset.desc }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Add Text Box -->
      <button
        @click="emit('add-text')"
        class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors font-medium text-[11px]"
      >
        <Type class="w-3.5 h-3.5 text-amber-400" />
        Add Text
      </button>

      <!-- Add Image Frame -->
      <button
        @click="emit('add-image-frame')"
        class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors font-medium text-[11px]"
      >
        <ImageIcon class="w-3.5 h-3.5 text-cyan-400" />
        Add Image
      </button>

      <!-- Tabletop Icon Picker -->
      <button
        @click="emit('open-icons')"
        class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors font-medium text-[11px]"
      >
        <Sparkles class="w-3.5 h-3.5 text-amber-400" />
        Icon Library
      </button>

      <div class="h-4 w-px bg-slate-800 mx-0.5"></div>

      <!-- Blank Canvas vs Template Actions -->
      <button
        @click="emit('blank-canvas')"
        class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors text-[11px] font-mono"
        title="Clear all elements and start with a blank canvas"
      >
        <FilePlus class="w-3 h-3 text-slate-400" />
        <span>Blank Canvas</span>
      </button>
      <button
        @click="emit('apply-template')"
        class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors text-[11px] font-mono"
        title="Apply starter layout template"
      >
        <Sparkle class="w-3 h-3 text-amber-400" />
        <span>Template</span>
      </button>
    </div>

    <!-- Right: Zoom Controls & Alignment Actions -->
    <div class="flex items-center gap-2">
      <!-- Zoom Viewport Controls -->
      <div class="flex items-center bg-slate-900 border border-slate-700/80 rounded p-0.5 font-mono text-[11px]">
        <button
          @click="emit('zoom-out')"
          class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Zoom Out (-25%)"
        >
          <ZoomOut class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('zoom-reset')"
          class="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-[10px] tabular-nums"
          title="Reset Zoom to 100%"
        >
          {{ Math.round((props.zoom || 1) * 100) }}%
        </button>
        <button
          @click="emit('zoom-in')"
          class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Zoom In (+25%)"
        >
          <ZoomIn class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="h-4 w-px bg-slate-800"></div>

      <!-- Alignment Toolbar (active when an element is selected) -->
      <div
        class="flex items-center bg-slate-900 border border-slate-700/80 rounded p-0.5 transition-opacity"
        :class="props.hasSelection ? 'opacity-100' : 'opacity-30 pointer-events-none'"
      >
        <button
          @click="emit('align', 'left')"
          class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Align Left"
        >
          <AlignLeft class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('align', 'center-h')"
          class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Center Horizontally"
        >
          <AlignCenter class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('align', 'right')"
          class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Align Right"
        >
          <AlignRight class="w-3.5 h-3.5" />
        </button>

        <div class="h-3 w-px bg-slate-800 mx-0.5"></div>

        <button
          @click="emit('align', 'top')"
          class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Align Top"
        >
          <AlignVerticalJustifyStart class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('align', 'center-v')"
          class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Center Vertically"
        >
          <AlignVerticalJustifyCenter class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('align', 'bottom')"
          class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Align Bottom"
        >
          <AlignVerticalJustifyEnd class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Duplicate & Delete -->
      <div
        class="flex items-center gap-1 transition-opacity"
        :class="props.hasSelection ? 'opacity-100' : 'opacity-30 pointer-events-none'"
      >
        <button
          @click="emit('duplicate')"
          class="p-1 rounded bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white"
          title="Duplicate Element"
        >
          <Copy class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('delete')"
          class="p-1 rounded bg-slate-900 border border-slate-700/80 hover:bg-red-950 text-red-400 hover:text-red-300"
          title="Delete Element"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
