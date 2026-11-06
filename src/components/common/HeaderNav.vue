<script setup lang="ts">
import { project, isSaving, activeTool, isAssetSidebarOpen, showToast } from '../../stores/projectStore.ts';
import { Download, Sparkles, FolderKanban } from 'lucide-vue-next';

function handleExportProduction() {
  activeTool.value = 'print';
  showToast('Switched to Print & Imposition Production Hub');
}
</script>

<template>
  <header class="flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-800 bg-[#0B0F17] shrink-0 z-30">
    <!-- Zone 1: Brand wordmark -->
    <div class="flex items-center gap-3 shrink-0">
      <div class="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
        TS
      </div>
      <a href="#" class="text-base font-bold tracking-tight text-white font-display whitespace-nowrap">
        TableSmith Studio
      </a>
      <span class="text-xs text-slate-500 font-mono hidden md:inline-block">/ {{ project.name }}</span>
    </div>

    <!-- Zone 2: Clean single-line nav links -->
    <nav class="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
      <button
        @click="activeTool = 'cards'"
        :class="activeTool === 'cards' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'"
        class="transition-colors whitespace-nowrap shrink-0"
      >
        Cards & Groups
      </button>
      <button
        @click="activeTool = 'boxes'"
        :class="activeTool === 'boxes' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'"
        class="transition-colors whitespace-nowrap shrink-0"
      >
        Box Dielines
      </button>
      <button
        @click="activeTool = 'boards'"
        :class="activeTool === 'boards' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'"
        class="transition-colors whitespace-nowrap shrink-0"
      >
        Game Boards
      </button>
      <button
        @click="activeTool = 'rulebook'"
        :class="activeTool === 'rulebook' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'"
        class="transition-colors whitespace-nowrap shrink-0"
      >
        Rulebook & Index
      </button>
      <button
        @click="activeTool = 'print'"
        :class="activeTool === 'print' ? 'text-amber-400 font-semibold' : 'hover:text-slate-200'"
        class="transition-colors whitespace-nowrap shrink-0"
      >
        Print Imposition
      </button>
    </nav>

    <!-- Zone 3: 1 Primary Action -->
    <div class="flex items-center gap-3 shrink-0">
      <button
        @click="isAssetSidebarOpen = !isAssetSidebarOpen"
        class="px-2.5 py-1 text-xs rounded border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        title="Toggle Persistent Asset Manager"
      >
        <FolderKanban class="w-3.5 h-3.5 text-amber-400" />
        <span class="hidden sm:inline">Assets</span>
      </button>

      <span v-if="isSaving" class="text-xs text-amber-400 font-mono flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        Saving...
      </span>
      <button
        @click="handleExportProduction"
        class="px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded font-display transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
      >
        <Download class="w-3.5 h-3.5" />
        Export Production Pack
      </button>
    </div>
  </header>
</template>
