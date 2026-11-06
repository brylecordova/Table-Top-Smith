<script setup lang="ts">
import { activeTool, type ActiveTool } from '../../stores/projectStore.ts';
import {
  Layers,
  Box,
  Coins,
  UserCheck,
  Map,
  BookOpen,
  Printer
} from 'lucide-vue-next';

interface ToolItem {
  id: ActiveTool;
  label: string;
  icon: any;
  shortcut: string;
}

const tools: ToolItem[] = [
  { id: 'cards', label: 'Card Creator', icon: Layers, shortcut: '1' },
  { id: 'boxes', label: 'Box Dielines', icon: Box, shortcut: '2' },
  { id: 'tokens', label: 'Token Creator', icon: Coins, shortcut: '3' },
  { id: 'standees', label: 'Standee Creator', icon: UserCheck, shortcut: '4' },
  { id: 'boards', label: 'Board Creator', icon: Map, shortcut: '5' },
  { id: 'rulebook', label: 'Rulebook & Index', icon: BookOpen, shortcut: '6' },
  { id: 'print', label: 'Print Imposition', icon: Printer, shortcut: '7' },
];
</script>

<template>
  <aside class="w-16 border-r border-slate-800 bg-[#0B0F17] flex flex-col items-center py-4 gap-2 shrink-0 z-20">
    <button
      v-for="tool in tools"
      :key="tool.id"
      @click="activeTool = tool.id"
      :title="`${tool.label} [${tool.shortcut}]`"
      class="group relative w-11 h-11 rounded-lg flex items-center justify-center transition-all"
      :class="activeTool === tool.id 
        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'"
    >
      <component :is="tool.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
      
      <!-- Tooltip -->
      <span class="absolute left-16 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
        {{ tool.label }}
      </span>
    </button>
  </aside>
</template>
