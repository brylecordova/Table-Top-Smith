<script setup lang="ts">
import { ref } from 'vue';
import type { CanvasElement } from '../../types/index.ts';

const props = defineProps<{
  elements: CanvasElement[];
  selectedElementId: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', el: CanvasElement): void;
  (e: 'move-up', el: CanvasElement): void;
  (e: 'move-down', el: CanvasElement): void;
  (e: 'delete', id: string): void;
  (e: 'change'): void;
}>();

const draggedElementId = ref<string | null>(null);
const dropTargetId = ref<string | null>(null);

function sortedElements() {
  return [...props.elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
}

function handleDragStart(e: DragEvent, el: CanvasElement) {
  draggedElementId.value = el.id;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', el.id);
  }
}

function handleDragOver(e: DragEvent, targetEl: CanvasElement) {
  if (draggedElementId.value && draggedElementId.value !== targetEl.id) {
    dropTargetId.value = targetEl.id;
  }
}

function handleDragLeave() {
  dropTargetId.value = null;
}

function handleDrop(e: DragEvent, targetEl: CanvasElement) {
  if (!draggedElementId.value || draggedElementId.value === targetEl.id) {
    dropTargetId.value = null;
    return;
  }

  const sorted = sortedElements();
  const fromIdx = sorted.findIndex(el => el.id === draggedElementId.value);
  const toIdx = sorted.findIndex(el => el.id === targetEl.id);

  if (fromIdx >= 0 && toIdx >= 0) {
    const [moved] = sorted.splice(fromIdx, 1);
    sorted.splice(toIdx, 0, moved);

    // Reassign descending zIndex so order in DOM/canvas matches layer list
    const total = sorted.length;
    sorted.forEach((el, idx) => {
      el.zIndex = total - idx;
    });

    emit('change');
  }

  draggedElementId.value = null;
  dropTargetId.value = null;
}

function handleDragEnd() {
  draggedElementId.value = null;
  dropTargetId.value = null;
}
</script>

<template>
  <div class="space-y-2 select-none text-xs">
    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
        <i class="ri-stack-line text-amber-400 text-sm"></i>
        Layers ({{ props.elements.length }})
      </span>
      <span class="text-[9px] text-slate-500 font-mono">Reorder</span>
    </div>

    <div v-if="props.elements.length === 0" class="text-center py-4 text-slate-500 text-[11px] font-mono">
      No elements. Add Text or Image.
    </div>

    <div v-else class="space-y-1 max-h-52 overflow-y-auto p-0.5">
      <div
        v-for="el in sortedElements()"
        :key="el.id"
        draggable="true"
        @dragstart="e => handleDragStart(e, el)"
        @dragover.prevent="e => handleDragOver(e, el)"
        @dragleave="handleDragLeave"
        @drop.prevent="e => handleDrop(e, el)"
        @dragend="handleDragEnd"
        @click="emit('select', el)"
        class="px-2 py-1.5 rounded flex items-center justify-between transition-all cursor-pointer border relative"
        :class="[
          props.selectedElementId === el.id
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800',
          dropTargetId === el.id ? 'border-t-2 border-t-amber-400 bg-amber-500/10' : ''
        ]"
      >
        <div class="flex items-center gap-1.5 truncate">
          <i class="ri-draggable text-slate-500 cursor-grab active:cursor-grabbing shrink-0 text-sm"></i>
          <i
            :class="[
              el.type === 'text' ? 'ri-text' : el.type === 'image-frame' ? 'ri-image-2-line' : 'ri-sparkling-line',
              props.selectedElementId === el.id ? 'text-amber-400' : 'text-slate-400'
            ]"
            class="text-sm shrink-0"
          ></i>
          <span class="font-medium truncate text-[11px]">{{ el.name || el.type }}</span>
        </div>

        <div class="flex items-center gap-1 shrink-0" @click.stop>
          <!-- Move Up/Down Quick Buttons -->
          <button
            @click="emit('move-up', el)"
            class="p-0.5 hover:text-white text-slate-500 cursor-pointer"
            title="Forward"
          >
            <i class="ri-arrow-up-s-line text-sm"></i>
          </button>
          <button
            @click="emit('move-down', el)"
            class="p-0.5 hover:text-white text-slate-500 cursor-pointer"
            title="Backward"
          >
            <i class="ri-arrow-down-s-line text-sm"></i>
          </button>

          <!-- Lock Toggle with explicit tooltip & feedback -->
          <button
            @click="el.locked = !el.locked; emit('change')"
            class="p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            :class="el.locked ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-200'"
            :title="el.locked ? 'Locked: Cannot be selected or moved on canvas (Click to unlock)' : 'Unlocked: Click to lock on canvas'"
          >
            <i :class="el.locked ? 'ri-lock-fill' : 'ri-lock-unlock-line'" class="text-sm"></i>
          </button>

          <!-- Hide -->
          <button
            @click="el.hidden = !el.hidden; emit('change')"
            class="p-0.5 cursor-pointer"
            :class="el.hidden ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'"
            title="Hide Layer"
          >
            <i :class="el.hidden ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-sm"></i>
          </button>

          <!-- Delete -->
          <button
            @click="emit('delete', el.id)"
            class="p-0.5 text-slate-500 hover:text-red-400 cursor-pointer"
            title="Delete Layer"
          >
            <i class="ri-delete-bin-line text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
