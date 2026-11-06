<script setup lang="ts">
import type { CanvasElement } from '../../types/index.ts';
import {
  Sliders,
  Type,
  Image as ImageIcon,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Palette
} from 'lucide-vue-next';

const props = defineProps<{
  element: CanvasElement | null;
}>();

const emit = defineEmits<{
  (e: 'change', el: CanvasElement): void;
  (e: 'open-icons'): void;
}>();

const fontOptions = [
  { label: 'Public Sans (Neutral UI)', val: 'Public Sans' },
  { label: 'Outfit (Geometric Display)', val: 'Outfit' },
  { label: 'Cinzel (Fantasy / Medieval)', val: 'Cinzel' },
  { label: 'Source Serif (Classic Rulebook)', val: 'Source Serif 4' },
  { label: 'JetBrains Mono (Stats & Math)', val: 'JetBrains Mono' }
];

const sampleBackgrounds = [
  { label: 'None', url: '' },
  { label: 'Dark Parchment', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Obsidian Crag', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { label: 'Mystic Nebula', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80' }
];

function notifyChange() {
  if (props.element) {
    emit('change', props.element);
  }
}
</script>

<template>
  <div v-if="props.element" class="space-y-4 text-xs select-none">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
      <div class="flex items-center gap-1.5 font-semibold text-slate-200 font-display">
        <component
          :is="props.element.type === 'text' ? Type : props.element.type === 'image-frame' ? ImageIcon : Sparkles"
          class="w-3.5 h-3.5 text-amber-400"
        />
        <span class="capitalize">{{ props.element.name || props.element.type }}</span>
      </div>

      <div class="flex items-center gap-1">
        <button
          @click="props.element.locked = !props.element.locked; notifyChange()"
          class="p-1 rounded hover:bg-slate-800"
          :class="props.element.locked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'"
          title="Lock / Unlock Element"
        >
          <Lock v-if="props.element.locked" class="w-3.5 h-3.5" />
          <Unlock v-else class="w-3.5 h-3.5" />
        </button>
        <button
          @click="props.element.hidden = !props.element.hidden; notifyChange()"
          class="p-1 rounded hover:bg-slate-800"
          :class="props.element.hidden ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'"
          title="Hide / Show Element"
        >
          <EyeOff v-if="props.element.hidden" class="w-3.5 h-3.5" />
          <Eye v-else class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Transform Coordinates -->
    <div class="space-y-2">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Position & Size</span>
      <div class="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
        <div>
          <span class="text-[9px] text-slate-500">X (mm)</span>
          <input
            type="number"
            v-model.number="props.element.x"
            @input="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-0.5 text-white"
          />
        </div>
        <div>
          <span class="text-[9px] text-slate-500">Y (mm)</span>
          <input
            type="number"
            v-model.number="props.element.y"
            @input="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-0.5 text-white"
          />
        </div>
        <div>
          <span class="text-[9px] text-slate-500">W (mm)</span>
          <input
            type="number"
            v-model.number="props.element.width"
            @input="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-0.5 text-white"
          />
        </div>
        <div>
          <span class="text-[9px] text-slate-500">H (mm)</span>
          <input
            type="number"
            v-model.number="props.element.height"
            @input="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-0.5 text-white"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
        <div>
          <span class="text-[9px] text-slate-500">Rotation (deg)</span>
          <input
            type="number"
            v-model.number="props.element.rotation"
            @input="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-0.5 text-white"
          />
        </div>
        <div>
          <span class="text-[9px] text-slate-500">Opacity ({{ Math.round((props.element.opacity || 1) * 100) }}%)</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            v-model.number="props.element.opacity"
            @input="notifyChange"
            class="w-full mt-1 accent-amber-400 cursor-pointer"
          />
        </div>
      </div>
    </div>

    <!-- SPECIFIC CONTROLS: TEXT BOX -->
    <div v-if="props.element.type === 'text'" class="border-t border-slate-800 pt-3 space-y-3">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Typography & Text</span>

      <div>
        <span class="text-[10px] text-slate-500 font-mono">Font Family</span>
        <select
          v-model="props.element.fontFamily"
          @change="notifyChange"
          class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white mt-0.5"
        >
          <option v-for="f in fontOptions" :key="f.val" :value="f.val">{{ f.label }}</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Font Size (pt)</span>
          <input
            type="number"
            min="6"
            max="96"
            v-model.number="props.element.fontSize"
            @input="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
          />
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Weight</span>
          <select
            v-model.number="props.element.fontWeight"
            @change="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white"
          >
            <option :value="300">Light (300)</option>
            <option :value="400">Regular (400)</option>
            <option :value="600">Semi-Bold (600)</option>
            <option :value="700">Bold (700)</option>
            <option :value="900">Black (900)</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Horizontal Align</span>
          <select
            v-model="props.element.textAlign"
            @change="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-1 text-xs text-white"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Vertical Align</span>
          <select
            v-model="props.element.verticalAlign"
            @change="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-1 text-xs text-white"
          >
            <option value="top">Top</option>
            <option value="middle">Middle / Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Font Style</span>
          <select
            v-model="props.element.fontStyle"
            @change="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-1 text-xs text-white"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Text Color</span>
          <input
            type="color"
            v-model="props.element.color"
            @input="notifyChange"
            class="w-full h-7 rounded bg-transparent cursor-pointer border border-slate-700"
          />
        </div>
      </div>

      <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
        <input
          type="checkbox"
          v-model="props.element.hasShadow"
          @change="notifyChange"
          class="rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0"
        />
        <span>Drop Shadow for Readability</span>
      </label>

      <div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-500 font-mono">Content Text</span>
          <button
            @click="emit('open-icons')"
            class="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
          >
            <Sparkles class="w-3 h-3" />
            + Icon
          </button>
        </div>
        <textarea
          v-model="props.element.text"
          @input="notifyChange"
          rows="3"
          class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-xs text-white font-sans mt-1 resize-none"
        ></textarea>
      </div>
    </div>

    <!-- SPECIFIC CONTROLS: SECTION IMAGE FRAME -->
    <div v-else-if="props.element.type === 'image-frame'" class="border-t border-slate-800 pt-3 space-y-3">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Dual-Layer Image Frame</span>

      <!-- Foreground Cutout -->
      <div>
        <span class="text-[10px] text-slate-400 font-mono">Foreground Character Cutout URL</span>
        <input
          v-model="props.element.fgImageUrl"
          @input="notifyChange"
          placeholder="https://.../character_cutout.png"
          class="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1 text-xs text-white mt-0.5"
        />
      </div>

      <!-- Background Texture -->
      <div>
        <span class="text-[10px] text-slate-400 font-mono">Background Texture URL</span>
        <input
          v-model="props.element.bgImageUrl"
          @input="notifyChange"
          placeholder="https://.../dark_parchment.jpg"
          class="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1 text-xs text-white mt-0.5"
        />
      </div>

      <!-- Quick sample background presets -->
      <div class="flex items-center gap-1 text-[10px]">
        <span class="text-slate-500 font-mono">Presets:</span>
        <button
          v-for="bg in sampleBackgrounds"
          :key="bg.label"
          @click="props.element.bgImageUrl = bg.url; notifyChange()"
          class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
        >
          {{ bg.label }}
        </button>
      </div>

      <!-- Border Adjustment (0 border = invisible box!) -->
      <div class="border-t border-slate-800/80 pt-2 space-y-2">
        <span class="text-[10px] font-semibold text-slate-400">Section Border & Frame Mask</span>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-[10px] text-slate-500 font-mono">Border Style</span>
            <select
              v-model="props.element.borderStyle"
              @change="notifyChange"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white"
            >
              <option value="none">None (Invisible Box)</option>
              <option value="solid">Solid Line</option>
              <option value="dashed">Dashed Outline</option>
            </select>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 font-mono">Border Width (mm)</span>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              v-model.number="props.element.borderWidth"
              @input="notifyChange"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-[10px] text-slate-500 font-mono">Border Color</span>
            <input
              type="color"
              v-model="props.element.borderColor"
              @input="notifyChange"
              class="w-full h-7 rounded bg-transparent cursor-pointer border border-slate-700"
            />
          </div>
          <div>
            <span class="text-[10px] text-slate-500 font-mono">Corner Radius (mm)</span>
            <input
              type="number"
              min="0"
              max="20"
              v-model.number="props.element.borderRadius"
              @input="notifyChange"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- SPECIFIC CONTROLS: ICON ELEMENT -->
    <div v-else-if="props.element.type === 'icon'" class="border-t border-slate-800 pt-3 space-y-3">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Icon Glyph Properties</span>

      <div class="flex items-center gap-3">
        <div class="text-4xl p-2 bg-slate-900 border border-slate-800 rounded-lg">
          {{ props.element.iconGlyph || '⚔️' }}
        </div>
        <div class="flex-1 space-y-1.5">
          <button
            @click="emit('open-icons')"
            class="w-full py-1 text-xs rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5"
          >
            <Sparkles class="w-3.5 h-3.5" />
            Pick Different Icon
          </button>
        </div>
      </div>

      <div>
        <span class="text-[10px] text-slate-500 font-mono">Icon Tint Color</span>
        <input
          type="color"
          v-model="props.element.iconColor"
          @input="notifyChange"
          class="w-full h-7 rounded bg-transparent cursor-pointer border border-slate-700 mt-0.5"
        />
      </div>
    </div>
  </div>

  <div v-else class="text-center py-8 text-slate-500 text-xs font-mono">
    Click any element on canvas to inspect and edit properties.
  </div>
</template>
