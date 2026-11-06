<script setup lang="ts">
import { ref, computed } from 'vue';
import { TABLETOP_ICONS } from '../../constants/tabletopIcons.ts';
import type { TabletopIcon } from '../../types/index.ts';
import { Search, Sparkles, X } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select-element', icon: TabletopIcon): void;
  (e: 'select-inline', icon: TabletopIcon): void;
  (e: 'select-portrait', icon: TabletopIcon): void;
}>();

const searchQuery = ref('');
const selectedCategory = ref<'all' | 'combat' | 'magic' | 'resources' | 'dice' | 'factions'>('all');

const categories = [
  { id: 'all', label: 'All Icons' },
  { id: 'combat', label: '⚔️ Combat' },
  { id: 'magic', label: '🔮 Magic' },
  { id: 'resources', label: '🪙 Resources' },
  { id: 'dice', label: '🎲 Tabletop' },
  { id: 'factions', label: '🐉 Factions' }
];

const filteredIcons = computed(() => {
  return TABLETOP_ICONS.filter(icon => {
    const matchesCat = selectedCategory.value === 'all' || icon.category === selectedCategory.value;
    const matchesQuery = !searchQuery.value ||
      icon.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      icon.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      icon.glyph.includes(searchQuery.value);
    return matchesCat && matchesQuery;
  });
});
</script>

<template>
  <div
    v-if="props.isOpen"
    class="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none"
  >
    <div class="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-5 shadow-2xl flex flex-col max-h-[85vh] space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles class="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white font-display">Tabletop Icon & Symbol Library</h3>
            <p class="text-[11px] text-slate-400">Choose icons for canvas placement, inline text tokens, or card portraits</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Search & Category Filters -->
      <div class="space-y-2">
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            placeholder="Search icons (e.g. sword, potion, gold, die, dragon)..."
            class="w-full bg-[#0B0F17] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id as any"
            class="px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0"
            :class="selectedCategory === cat.id
              ? 'bg-amber-400 text-slate-950 font-semibold shadow-xs'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Icon Grid -->
      <div class="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-1">
        <div
          v-for="icon in filteredIcons"
          :key="icon.id"
          class="p-2.5 rounded-lg bg-[#0B0F17] border border-slate-800 hover:border-amber-500/50 flex flex-col justify-between group transition-all"
        >
          <div class="flex items-center gap-2.5 mb-2">
            <span class="text-3xl shrink-0 group-hover:scale-110 transition-transform">{{ icon.glyph }}</span>
            <div class="truncate">
              <div class="text-xs font-semibold text-white truncate font-display">{{ icon.name }}</div>
              <div class="text-[10px] text-slate-500 truncate">{{ icon.description }}</div>
            </div>
          </div>

          <!-- Quick Actions per Icon -->
          <div class="flex items-center gap-1 pt-1 border-t border-slate-800/80 text-[10px]">
            <button
              @click="emit('select-element', icon); emit('close')"
              class="flex-1 py-1 rounded bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 transition-colors text-center"
              title="Add as draggable canvas element"
            >
              + Canvas
            </button>
            <button
              @click="emit('select-inline', icon); emit('close')"
              class="flex-1 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 transition-colors text-center"
              title="Insert inline with text"
            >
              + Inline
            </button>
            <button
              @click="emit('select-portrait', icon); emit('close')"
              class="py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Set as Hero Portrait"
            >
              Portrait
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="border-t border-slate-800 pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Showing {{ filteredIcons.length }} game symbols</span>
        <span>Click [+ Canvas] or [+ Inline] to insert</span>
      </div>
    </div>
  </div>
</template>
