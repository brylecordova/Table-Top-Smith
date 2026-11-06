<script setup lang="ts">
import { onMounted } from 'vue';
import {
  activeTool,
  isLoading,
  toastMessage,
  fetchProject
} from './stores/projectStore.ts';
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
  fetchProject();
});
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[#0B0F17] text-slate-100 overflow-hidden font-sans">
    <!-- Top Navigation Bar -->
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

    <!-- Toast Notification Banner -->
    <div
      v-if="toastMessage"
      class="fixed bottom-4 right-4 z-50 bg-slate-900 border border-amber-500/40 text-amber-200 px-4 py-2 rounded-lg shadow-2xl text-xs font-mono flex items-center gap-2 animate-bounce-subtle"
    >
      <span class="w-2 h-2 rounded-full bg-amber-400"></span>
      {{ toastMessage }}
    </div>

    <!-- Initial Loading Backdrop -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-[#0B0F17]/80 backdrop-blur-xs flex items-center justify-center z-50 pointer-events-none"
    >
      <div class="flex flex-col items-center gap-2 text-slate-400 font-mono text-xs">
        <div class="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading TableSmith Workstation...</span>
      </div>
    </div>
  </div>
</template>
