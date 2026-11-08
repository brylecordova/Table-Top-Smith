<script setup lang="ts">
import { ref } from 'vue';
import { project, isSaving, activeTool, isAssetSidebarOpen, showToast, returnToMainMenu } from '../../stores/projectStore.ts';
import { activeTheme } from '../../stores/themeStore.ts';
import ThemeConfigModal from '../menu/ThemeConfigModal.vue';

const showThemeModal = ref(false);

function handleExportProduction() {
  activeTool.value = 'print';
  showToast('Switched to Print & Imposition Production Hub');
}
</script>

<template>
  <header
    class="flex items-center justify-between gap-4 px-6 py-2.5 border-b shrink-0 z-30 select-none transition-colors"
    :style="{ backgroundColor: activeTheme.bgSurface, borderColor: activeTheme.borderBase }"
  >
    <!-- Zone 1: Main Menu Return & Brand wordmark -->
    <div class="flex items-center gap-3 shrink-0">
      <button
        @click="returnToMainMenu"
        class="px-2.5 py-1.5 rounded-lg border text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-all shadow-sm cursor-pointer"
        :style="{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.borderBase
        }"
        title="Save & Return to Main Menu"
      >
        <i class="ri-home-4-line text-sm" :style="{ color: activeTheme.accentColor }"></i>
        <span>Main Menu</span>
      </button>

      <div class="h-4 w-px" :style="{ backgroundColor: activeTheme.borderBase }"></div>

      <div class="flex items-center gap-2">
        <div
          class="w-6 h-6 rounded border flex items-center justify-center font-bold text-xs"
          :style="{
            backgroundColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 20%, transparent)',
            borderColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 40%, transparent)',
            color: activeTheme.accentColor
          }"
        >
          TS
        </div>
        <span class="text-sm font-bold tracking-tight font-display whitespace-nowrap" :style="{ color: activeTheme.textBase }">
          TableSmith
        </span>
        <span class="text-xs font-mono hidden md:inline-block max-w-[200px] truncate" :style="{ color: activeTheme.textMuted }">
          / {{ project.name }}
        </span>
      </div>
    </div>

    <!-- Zone 2: Clean single-line nav links -->
    <nav class="hidden lg:flex items-center gap-6 text-xs font-medium" :style="{ color: activeTheme.textMuted }">
      <button
        @click="activeTool = 'cards'"
        :style="activeTool === 'cards' ? { color: activeTheme.accentColor, fontWeight: 'bold' } : {}"
        class="transition-colors whitespace-nowrap shrink-0 hover:opacity-100 cursor-pointer"
      >
        Cards & Groups
      </button>
      <button
        @click="activeTool = 'boxes'"
        :style="activeTool === 'boxes' ? { color: activeTheme.accentColor, fontWeight: 'bold' } : {}"
        class="transition-colors whitespace-nowrap shrink-0 hover:opacity-100 cursor-pointer"
      >
        Box Dielines
      </button>
      <button
        @click="activeTool = 'boards'"
        :style="activeTool === 'boards' ? { color: activeTheme.accentColor, fontWeight: 'bold' } : {}"
        class="transition-colors whitespace-nowrap shrink-0 hover:opacity-100 cursor-pointer"
      >
        Game Boards
      </button>
      <button
        @click="activeTool = 'rulebook'"
        :style="activeTool === 'rulebook' ? { color: activeTheme.accentColor, fontWeight: 'bold' } : {}"
        class="transition-colors whitespace-nowrap shrink-0 hover:opacity-100 cursor-pointer"
      >
        Rulebook & Index
      </button>
      <button
        @click="activeTool = 'print'"
        :style="activeTool === 'print' ? { color: activeTheme.accentColor, fontWeight: 'bold' } : {}"
        class="transition-colors whitespace-nowrap shrink-0 hover:opacity-100 cursor-pointer"
      >
        Print Imposition
      </button>
    </nav>

    <!-- Zone 3: 1 Primary Action -->
    <div class="flex items-center gap-3 shrink-0">
      <button
        @click="showThemeModal = true"
        class="px-2.5 py-1 text-xs rounded border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Change Theme & Accent Color"
      >
        <span
          class="w-2.5 h-2.5 rounded-full shadow-xs"
          :style="{ backgroundColor: activeTheme.accentColor }"
        ></span>
        <i class="ri-palette-line text-xs" :style="{ color: activeTheme.accentColor }"></i>
        <span class="hidden xl:inline text-[11px]">Theme</span>
      </button>

      <button
        @click="isAssetSidebarOpen = !isAssetSidebarOpen"
        class="px-2.5 py-1 text-xs rounded border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Toggle Persistent Asset Manager"
      >
        <i class="ri-folder-6-line text-sm" :style="{ color: activeTheme.accentColor }"></i>
        <span class="hidden sm:inline">Assets</span>
      </button>

      <span v-if="isSaving" class="text-xs font-mono flex items-center gap-1.5" :style="{ color: activeTheme.accentColor }">
        <span class="w-1.5 h-1.5 rounded-full animate-pulse" :style="{ backgroundColor: activeTheme.accentColor }"></span>
        Saving...
      </span>
      <button
        @click="handleExportProduction"
        class="px-3.5 py-1.5 text-xs font-bold rounded font-display transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm hover:brightness-110 cursor-pointer"
        :style="{
          backgroundColor: activeTheme.accentColor,
          color: activeTheme.accentText
        }"
      >
        <i class="ri-download-2-line text-sm"></i>
        Export Pack
      </button>
    </div>
  </header>

  <!-- Theme & Accent Configuration Modal -->
  <ThemeConfigModal
    :isOpen="showThemeModal"
    @close="showThemeModal = false"
  />
</template>
