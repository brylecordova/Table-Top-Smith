<script setup lang="ts">
import { onMounted } from 'vue';
import {
  currentView,
  activeTool,
  isLoading,
  toastMessage
} from './stores/projectStore.ts';
import { activeTheme, applyThemeToDom } from './stores/themeStore.ts';
import MainMenu from './components/menu/MainMenu.vue';
import HeaderNav from './components/common/HeaderNav.vue';
import ToolSidebar from './components/common/ToolSidebar.vue';
import AssetManagerSidebar from './components/common/AssetManagerSidebar.vue';
import CardCreator from './components/cards/CardCreator.vue';
import BoxCreator from './components/boxes/BoxCreator.vue';
import TokenCreator from './components/tokens/TokenCreator.vue';
import StandeeCreator from './components/standees/StandeeCreator.vue';
import BoardCreator from './components/boards/BoardCreator.vue';
import RulebookCreator from './components/rulebook/RulebookCreator.vue';
import PrintManager from './components/print/PrintManager.vue';

onMounted(() => {
  applyThemeToDom();
});
</script>

<template>
  <div
    class="h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors"
    :style="{ backgroundColor: activeTheme.bgBase, color: activeTheme.textBase }"
  >
    <!-- View 1: Main Menu & Project Management -->
    <MainMenu v-if="currentView === 'menu'" />

    <!-- View 2: Board Game Builder Canvas Studio -->
    <template v-else-if="currentView === 'builder'">
      <!-- Top Navigation Bar with Main Menu Return Button -->
      <HeaderNav />

      <!-- Main Studio Body -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Tool Dock -->
        <ToolSidebar />

        <!-- Persistent Sidebar Asset Manager -->
        <AssetManagerSidebar />

        <!-- Active Tool Viewport -->
        <CardCreator v-if="activeTool === 'cards'" />
        <BoxCreator v-else-if="activeTool === 'boxes'" />
        <TokenCreator v-else-if="activeTool === 'tokens'" />
        <StandeeCreator v-else-if="activeTool === 'standees'" />
        <BoardCreator v-else-if="activeTool === 'boards'" />
        <RulebookCreator v-else-if="activeTool === 'rulebook'" />
        <PrintManager v-else-if="activeTool === 'print'" />
      </div>
    </template>

    <!-- Toast Notification Banner -->
    <div
      v-if="toastMessage"
      class="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-2xl text-xs font-mono flex items-center gap-2 border animate-bounce-subtle"
      :style="{
        backgroundColor: activeTheme.bgSurface,
        borderColor: activeTheme.accentColor,
        color: activeTheme.textBase
      }"
    >
      <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: activeTheme.accentColor }"></span>
      {{ toastMessage }}
    </div>

    <!-- Initial Loading Backdrop -->
    <div
      v-if="isLoading"
      class="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 pointer-events-none"
      :style="{ backgroundColor: activeTheme.bgBase + 'CC' }"
    >
      <div class="flex flex-col items-center gap-2 font-mono text-xs" :style="{ color: activeTheme.textMuted }">
        <div
          class="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          :style="{ borderColor: activeTheme.accentColor, borderTopColor: 'transparent' }"
        ></div>
        <span>Loading TableSmith Workstation...</span>
      </div>
    </div>
  </div>
</template>
