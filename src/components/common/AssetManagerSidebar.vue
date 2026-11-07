<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  assets,
  saveAsset,
  removeAsset,
  isAssetSidebarOpen,
  showToast
} from '../../stores/projectStore.ts';
import type { AssetItem } from '../../types/index.ts';

const selectedCategory = ref<'all' | 'character' | 'texture' | 'item' | 'icon' | 'frame'>('all');
const searchQuery = ref('');
const isUploading = ref(false);

const newAssetName = ref('');
const newAssetCategory = ref<'character' | 'texture' | 'item' | 'icon' | 'frame'>('character');
const newAssetTags = ref('');
const newAssetUrl = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);

const categories = [
  { id: 'all', label: 'All' },
  { id: 'character', label: 'Characters' },
  { id: 'texture', label: 'Textures' },
  { id: 'item', label: 'Items' },
  { id: 'icon', label: 'Icons' },
  { id: 'frame', label: 'Frames' }
];

const filteredAssets = computed(() => {
  return assets.value.filter(a => {
    const matchesCat = selectedCategory.value === 'all' || a.category === selectedCategory.value;
    const query = searchQuery.value.toLowerCase().trim();
    const matchesQuery = !query ||
      a.name.toLowerCase().includes(query) ||
      (a.tags && a.tags.some(t => t.toLowerCase().includes(query)));
    return matchesCat && matchesQuery;
  });
});

const emit = defineEmits<{
  (e: 'insert-asset', asset: AssetItem): void;
}>();

function triggerFileUpload() {
  fileInputRef.value?.click();
}

function handleFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    const sizeKb = Math.round(file.size / 1024);
    const asset: AssetItem = {
      id: `ast_${Date.now()}`,
      projectId: 'proj_iron_stone',
      name: file.name.replace(/\.[^/.]+$/, ''),
      category: newAssetCategory.value,
      tags: ['upload', file.type.split('/')[1] || 'image'],
      url: dataUrl,
      fileSize: `${sizeKb} KB`,
      createdAt: new Date().toISOString()
    };
    saveAsset(asset);
    target.value = '';
    showToast(`Uploaded "${asset.name}" to assets!`);
  };
  reader.readAsDataURL(file);
}

function handleAddUrlAsset() {
  if (!newAssetUrl.value) return;
  const tags = newAssetTags.value
    ? newAssetTags.value.split(',').map(t => t.trim()).filter(Boolean)
    : [newAssetCategory.value];

  const asset: AssetItem = {
    id: `ast_${Date.now()}`,
    projectId: 'proj_iron_stone',
    name: newAssetName.value.trim() || 'Custom Asset',
    category: newAssetCategory.value,
    tags,
    url: newAssetUrl.value.trim(),
    fileSize: 'External URL',
    createdAt: new Date().toISOString()
  };

  saveAsset(asset);
  newAssetName.value = '';
  newAssetUrl.value = '';
  newAssetTags.value = '';
  isUploading.value = false;
  showToast('Asset added to library');
}

function handleDragStart(e: DragEvent, asset: AssetItem) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', asset.url);
    e.dataTransfer.setData('application/json', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  }
}
</script>

<template>
  <aside
    class="border-r border-slate-800 bg-[#0B0F17] flex flex-col shrink-0 z-20 transition-all duration-200 select-none"
    :class="isAssetSidebarOpen ? 'w-64' : 'w-10'"
  >
    <!-- Top Toggle Bar -->
    <div class="h-9 px-2 border-b border-slate-800 flex items-center justify-between text-xs">
      <div v-if="isAssetSidebarOpen" class="flex items-center gap-1.5 font-semibold text-slate-200 font-display">
        <i class="ri-folder-open-line text-amber-400 text-sm"></i>
        <span>Asset Manager</span>
      </div>
      <button
        @click="isAssetSidebarOpen = !isAssetSidebarOpen"
        class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white ml-auto cursor-pointer"
        :title="isAssetSidebarOpen ? 'Collapse Asset Manager' : 'Expand Asset Manager'"
      >
        <i :class="isAssetSidebarOpen ? 'ri-arrow-left-s-line' : 'ri-arrow-right-s-line'" class="text-sm"></i>
      </button>
    </div>

    <!-- Collapsed View Indicator -->
    <div
      v-if="!isAssetSidebarOpen"
      @click="isAssetSidebarOpen = true"
      class="flex-1 flex flex-col items-center py-4 gap-3 cursor-pointer hover:bg-slate-900/50"
      title="Click to open Asset Manager"
    >
      <i class="ri-folder-open-line text-amber-400 text-base"></i>
      <span class="text-[10px] text-slate-500 font-mono rotate-90 whitespace-nowrap mt-4">
        ASSETS ({{ assets.length }})
      </span>
    </div>

    <!-- Expanded Asset Workspace -->
    <template v-else>
      <!-- Upload Controls Strip -->
      <div class="p-3 border-b border-slate-800 space-y-2">
        <div class="flex items-center gap-1.5">
          <button
            @click="triggerFileUpload"
            class="flex-1 py-1.5 px-2 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold font-display text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <i class="ri-upload-2-line text-sm"></i>
            Upload
          </button>
          <button
            @click="isUploading = !isUploading"
            class="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Add via Image URL"
          >
            <i class="ri-link text-sm"></i>
          </button>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelected"
        />

        <!-- Add by URL Dropdown Panel -->
        <div v-if="isUploading" class="p-2.5 bg-slate-900/90 border border-slate-700 rounded-lg space-y-2 text-xs">
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Image URL</span>
            <input
              v-model="newAssetUrl"
              placeholder="https://.../art.png"
              class="w-full bg-[#0B0F17] border border-slate-700 rounded px-2 py-1 text-white text-[11px]"
            />
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <div>
              <span class="text-[9px] text-slate-500 font-mono">Name</span>
              <input
                v-model="newAssetName"
                placeholder="Asset name"
                class="w-full bg-[#0B0F17] border border-slate-700 rounded px-2 py-1 text-white text-[11px]"
              />
            </div>
            <div>
              <span class="text-[9px] text-slate-500 font-mono">Category</span>
              <select
                v-model="newAssetCategory"
                class="w-full bg-[#0B0F17] border border-slate-700 rounded px-1.5 py-1 text-white text-[10px]"
              >
                <option value="character">Character</option>
                <option value="texture">Texture</option>
                <option value="item">Item</option>
                <option value="icon">Icon</option>
                <option value="frame">Frame</option>
              </select>
            </div>
          </div>
          <div>
            <span class="text-[9px] text-slate-500 font-mono">Tags (comma separated)</span>
            <input
              v-model="newAssetTags"
              placeholder="boss, dragon, weapon"
              class="w-full bg-[#0B0F17] border border-slate-700 rounded px-2 py-1 text-white text-[11px]"
            />
          </div>
          <div class="flex items-center justify-end gap-1.5 pt-1">
            <button
              @click="isUploading = false"
              class="px-2 py-0.5 rounded text-slate-400 hover:text-white text-[10px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              @click="handleAddUrlAsset"
              class="px-3 py-1 rounded bg-amber-400 text-slate-950 font-bold text-[10px] cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Search & Category Filters -->
      <div class="p-2 border-b border-slate-800 space-y-1.5">
        <div class="relative">
          <i class="ri-search-line text-xs absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <input
            v-model="searchQuery"
            placeholder="Search assets & tags..."
            class="w-full bg-[#1E293B] border border-slate-700 rounded pl-7 pr-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div class="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id as any"
            class="px-2 py-0.5 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            :class="selectedCategory === cat.id
              ? 'bg-amber-400 text-slate-950 font-semibold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Asset Items Grid -->
      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        <div v-if="filteredAssets.length === 0" class="text-center py-6 text-slate-500 text-xs font-mono">
          No assets found. Click [+ Upload] to add images or character art.
        </div>

        <div
          v-for="ast in filteredAssets"
          :key="ast.id"
          draggable="true"
          @dragstart="e => handleDragStart(e, ast)"
          class="p-2 bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 rounded-lg group transition-all flex flex-col gap-1.5 cursor-grab active:cursor-grabbing"
          title="Drag and drop onto canvas, or click [+ Insert]"
        >
          <!-- Thumbnail Image -->
          <div class="h-24 w-full rounded bg-black/60 overflow-hidden relative border border-slate-800 flex items-center justify-center">
            <img
              :src="ast.url"
              :alt="ast.name"
              class="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <span class="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-black/70 text-amber-300">
              {{ ast.category }}
            </span>
          </div>

          <!-- Title & Tags -->
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold text-slate-200 truncate font-display">{{ ast.name }}</span>
            <button
              @click.stop="removeAsset(ast.id)"
              class="text-slate-500 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Delete Asset"
            >
              <i class="ri-delete-bin-line text-xs"></i>
            </button>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in ast.tags"
              :key="tag"
              class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-mono"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- One-Click Insert Button -->
          <button
            @click="emit('insert-asset', ast)"
            class="w-full py-1 text-[10px] font-semibold rounded bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 transition-colors flex items-center justify-center gap-1 border border-slate-700/60 cursor-pointer"
          >
            <i class="ri-add-line text-xs"></i>
            Insert
          </button>
        </div>
      </div>

      <!-- Footer Help -->
      <div class="p-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
        Drag image directly onto canvas or click Insert
      </div>
    </template>
  </aside>
</template>
