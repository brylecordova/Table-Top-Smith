<script setup lang="ts">
import { ref, computed } from 'vue';
import { TABLETOP_ICONS } from '../../constants/tabletopIcons.ts';
import type { TabletopIcon } from '../../types/index.ts';
import { getRemixIconClass } from '../../utils/iconHelper.ts';

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
const selectedCategory = ref<string>('all');

const categories = [
  { id: 'all', label: 'All Icons', icon: 'ri-apps-2-line' },
  { id: 'chat', label: 'Chat', icon: 'ri-chat-smile-2-line' },
  { id: 'combat', label: 'Combat & Weapons', icon: 'ri-sword-line' },
  { id: 'magic', label: 'Magic & Arcana', icon: 'ri-magic-line' },
  { id: 'resources', label: 'Resources', icon: 'ri-copper-coin-line' },
  { id: 'dice', label: 'Dice & Chance', icon: 'ri-dice-line' },
  { id: 'conditions', label: 'Status & Effects', icon: 'ri-fire-line' },
  { id: 'exploration', label: 'Map & Terrain', icon: 'ri-compass-3-line' },
  { id: 'stats', label: 'Attributes & HP', icon: 'ri-heart-line' },
  { id: 'factions', label: 'Monsters & Factions', icon: 'ri-skull-line' },
  { id: 'ui', label: 'UI & Objectives', icon: 'ri-trophy-line' }
];

function getCategoryCount(catId: string): number {
  if (catId === 'all') return TABLETOP_ICONS.length;
  return TABLETOP_ICONS.filter(icon => icon.category === catId).length;
}

const filteredIcons = computed(() => {
  return TABLETOP_ICONS.filter(icon => {
    const matchesCat = selectedCategory.value === 'all' || icon.category === selectedCategory.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchesQuery = !q ||
      icon.name.toLowerCase().includes(q) ||
      (icon.description && icon.description.toLowerCase().includes(q)) ||
      icon.glyph.includes(q) ||
      (icon.cssClass && icon.cssClass.toLowerCase().includes(q)) ||
      (icon.id && icon.id.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });
});
</script>

<template>
  <div
    v-if="props.isOpen"
    class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-150"
  >
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full h-[84vh] shadow-2xl flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-xs">
            <i class="ri-sparkling-fill text-lg"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white font-display flex items-center gap-2">
              <span>Tabletop Icon & Symbol Library</span>
              <span class="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                {{ TABLETOP_ICONS.length }} Icons
              </span>
            </h3>
            <p class="text-[11px] text-slate-400">Searchable vector symbols for canvas design, board tiles, and inline chat text</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close Icon Library (Esc)"
        >
          <i class="ri-close-line text-xl"></i>
        </button>
      </div>

      <!-- Search Bar (Positioned Cleanly Above Main Content Area) -->
      <div class="px-5 py-3 border-b border-slate-800 bg-slate-950/40">
        <div class="relative">
          <i class="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            v-model="searchQuery"
            placeholder="Search all icons (e.g. chat bubble, broadsword, magic wand, d6, treasure chest, shield)..."
            class="w-full bg-[#0B0F17] border border-slate-700 hover:border-slate-600 focus:border-amber-400 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            title="Clear search"
          >
            <i class="ri-close-circle-fill text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Main Body: Vertical Category Sidebar + Icon Grid -->
      <div class="flex-1 flex overflow-hidden min-h-0">
        <!-- 1. Vertical Side Menu (Left-hand Sidebar) -->
        <aside class="w-52 shrink-0 border-r border-slate-800 bg-[#0B0F17]/90 p-2.5 flex flex-col space-y-1 overflow-y-auto">
          <div class="px-2.5 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
            Categories
          </div>

          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            class="w-full px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between group cursor-pointer text-left"
            :class="selectedCategory === cat.id
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
          >
            <div class="flex items-center gap-2 truncate">
              <i :class="[cat.icon, 'text-sm shrink-0', selectedCategory === cat.id ? 'text-slate-950' : 'text-amber-400 group-hover:text-amber-300']"></i>
              <span class="truncate">{{ cat.label }}</span>
            </div>
            <span
              class="text-[10px] font-mono px-1.5 py-0.2 rounded-full shrink-0 ml-1.5"
              :class="selectedCategory === cat.id
                ? 'bg-slate-950/20 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'"
            >
              {{ getCategoryCount(cat.id) }}
            </span>
          </button>
        </aside>

        <!-- 2. Icon Grid (Right-hand Main Content) -->
        <main class="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-900">
          <!-- Category Status Strip -->
          <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-950/30 text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-white font-display">
                {{ categories.find(c => c.id === selectedCategory)?.label || 'All Icons' }}
              </span>
              <span class="text-[11px] text-slate-400 font-mono">
                ({{ filteredIcons.length }} result{{ filteredIcons.length === 1 ? '' : 's' }})
              </span>
            </div>

            <!-- Hint on Placement Rules -->
            <div class="text-[10px] font-mono text-slate-400 hidden sm:flex items-center gap-2">
              <span v-if="selectedCategory === 'chat'" class="text-cyan-400 flex items-center gap-1">
                <i class="ri-information-line"></i>
                Supports Canvas & Inline Text
              </span>
              <span v-else class="text-amber-400/90 flex items-center gap-1">
                <i class="ri-drag-move-line"></i>
                Canvas Drag & Drop
              </span>
            </div>
          </div>

          <!-- Grid List -->
          <div
            v-if="filteredIcons.length > 0"
            class="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-2.5 auto-rows-max"
          >
            <div
              v-for="icon in filteredIcons"
              :key="icon.id"
              class="p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800/90 hover:border-amber-400/50 flex flex-col justify-between group transition-all hover:shadow-lg shadow-black/40"
            >
              <!-- Icon Preview & Name -->
              <div class="flex items-center gap-3 mb-2.5">
                <div class="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform group-hover:border-amber-400/40">
                  <i :class="['text-2xl text-amber-400 leading-none', getRemixIconClass(icon.cssClass || icon.glyph, 'ri-sparkling-line')]"></i>
                </div>
                <div class="truncate flex-1">
                  <div class="text-xs font-semibold text-white truncate font-display group-hover:text-amber-300 transition-colors">
                    {{ icon.name }}
                  </div>
                  <div class="text-[10px] text-slate-400 truncate mt-0.5">
                    {{ icon.description || 'Design icon' }}
                  </div>
                </div>
              </div>

              <!-- Action Placement Buttons:
                   - Remix & RPG-Awesome: Strictly Canvas-only
                   - Chat: Canvas or Inline (+ Text) -->
              <div class="flex items-center gap-1.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                <button
                  @click="emit('select-element', icon); emit('close')"
                  class="flex-1 py-1 px-2 rounded-md bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 transition-all text-center cursor-pointer font-semibold flex items-center justify-center gap-1"
                  title="Place as draggable element on canvas"
                >
                  <i class="ri-add-line text-xs"></i>
                  <span>+ Canvas</span>
                </button>
                <button
                  v-if="icon.set === 'chat' || icon.category === 'chat'"
                  @click="emit('select-inline', icon); emit('close')"
                  class="flex-1 py-1 px-2 rounded-md bg-cyan-950/70 border border-cyan-800/50 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 transition-all text-center cursor-pointer font-semibold flex items-center justify-center gap-1"
                  title="Insert inline inside text box or card description"
                >
                  <i class="ri-text text-xs"></i>
                  <span>+ Text</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty Search State -->
          <div v-else class="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
            <i class="ri-search-line text-3xl text-slate-600"></i>
            <p class="text-xs font-mono">No icons matching "{{ searchQuery }}" in {{ categories.find(c => c.id === selectedCategory)?.label }}.</p>
            <button
              @click="searchQuery = ''; selectedCategory = 'all'"
              class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </main>
      </div>

      <!-- Footer Info -->
      <div class="border-t border-slate-800 px-5 py-2.5 bg-slate-950/70 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Showing {{ filteredIcons.length }} of {{ TABLETOP_ICONS.length }} tabletop icons</span>
        <span class="text-slate-500">Select any icon to add to current project layer</span>
      </div>
    </div>
  </div>
</template>
