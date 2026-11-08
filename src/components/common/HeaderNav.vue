<script setup lang="ts">
import { project, isSaving, activeTool, isAssetSidebarOpen, showToast, returnToMainMenu } from '../../stores/projectStore.ts';

function handleExportProduction() {
  activeTool.value = 'print';
  showToast('Switched to Print & Imposition Production Hub');
}
</script>

<template>
  <header class="flex items-center justify-between gap-4 px-6 py-2.5 border-b border-slate-800 bg-[#0B0F17] shrink-0 z-30 select-none">
    <!-- Zone 1: Main Menu Return & Brand wordmark -->
    <div class="flex items-center gap-3 shrink-0">
      <button
        @click="returnToMainMenu"
        class="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-all shadow-sm cursor-pointer"
        title="Save & Return to Main Menu"
      >
        <i class="ri-home-4-line text-amber-400 text-sm"></i>
        <span>Main Menu</span>
      </button>

      <div class="h-4 w-px bg-slate-800"></div>

      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
          TS
        </div>
        <span class="text-sm font-bold tracking-tight text-white font-display whitespace-nowrap">
          TableSmith
        </span>
        <span class="text-xs text-slate-400 font-mono hidden md:inline-block max-w-[200px] truncate">
          / {{ project.name }}
        </span>
      </div>
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
        <i class="ri-folder-6-line text-amber-400 text-sm"></i>
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
        <i class="ri-download-2-line text-sm"></i>
        Export Pack
      </button>
    </div>
  </header>
</template>
