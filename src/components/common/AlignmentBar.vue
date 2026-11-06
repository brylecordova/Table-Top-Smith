<script setup lang="ts">
import {
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Grid,
  Type,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Copy,
  Trash2
} from 'lucide-vue-next';
import { canUndo, canRedo } from '../../stores/historyStore.ts';

const props = defineProps<{
  hasSelection: boolean;
  isLocked?: boolean;
}>();

const emit = defineEmits<{
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'align', direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom'): void;
  (e: 'add-text'): void;
  (e: 'add-image-frame'): void;
  (e: 'open-icons'): void;
  (e: 'duplicate'): void;
  (e: 'delete'): void;
}>();
</script>

<template>
  <div class="h-9 border-b border-slate-800 bg-[#0B0F17] px-3 flex items-center justify-between shrink-0 select-none text-xs">
    <!-- Left: History & Add Element Buttons -->
    <div class="flex items-center gap-2">
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

      <div class="h-4 w-px bg-slate-800"></div>

      <!-- Add Text Box -->
      <button
        @click="emit('add-text')"
        class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors font-medium text-[11px]"
      >
        <Type class="w-3.5 h-3.5 text-amber-400" />
        Add Text
      </button>

      <!-- Add Section Image Frame -->
      <button
        @click="emit('add-image-frame')"
        class="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors font-medium text-[11px]"
      >
        <ImageIcon class="w-3.5 h-3.5 text-cyan-400" />
        Add Image Frame
      </button>

      <!-- Tabletop Icon Picker -->
      <button
        @click="emit('open-icons')"
        class="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 transition-colors font-medium text-[11px]"
      >
        <Sparkles class="w-3.5 h-3.5 text-amber-400" />
        Icon Library
      </button>
    </div>

    <!-- Right: Alignment & Selection Actions -->
    <div class="flex items-center gap-2">
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

      <span class="text-[10px] text-slate-500 font-mono hidden md:inline-block ml-1">
        Snap: 1mm
      </span>
    </div>
  </div>
</template>
