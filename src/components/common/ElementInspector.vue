<script setup lang="ts">
import type { CanvasElement } from '../../types/index.ts';

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
        <i
          :class="props.element.type === 'text' ? 'ri-text' : props.element.type === 'image-frame' ? 'ri-image-2-line' : 'ri-sparkling-line'"
          class="text-amber-400 text-sm"
        ></i>
        <span class="capitalize">{{ props.element.name || props.element.type }}</span>
      </div>

      <div class="flex items-center gap-1">
        <button
          @click="props.element.locked = !props.element.locked; notifyChange()"
          class="p-1 rounded hover:bg-slate-800 cursor-pointer"
          :class="props.element.locked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'"
          title="Lock / Unlock Element"
        >
          <i :class="props.element.locked ? 'ri-lock-line' : 'ri-lock-unlock-line'" class="text-sm"></i>
        </button>
        <button
          @click="props.element.hidden = !props.element.hidden; notifyChange()"
          class="p-1 rounded hover:bg-slate-800 cursor-pointer"
          :class="props.element.hidden ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'"
          title="Hide / Show Element"
        >
          <i :class="props.element.hidden ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-sm"></i>
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

      <!-- Text Container Background / Fill Option -->
      <div class="p-2 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-400 font-mono">Background</span>
          <button
            @click="props.element.textHasBackground = !props.element.textHasBackground; if (!props.element.textHasBackground) props.element.textBackgroundColor = 'transparent'; notifyChange()"
            class="px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer"
            :class="props.element.textHasBackground === false || props.element.textBackgroundColor === 'transparent'
              ? 'bg-slate-800 text-slate-300 border-slate-700'
              : 'bg-amber-400/20 text-amber-300 border-amber-400/40'"
          >
            {{ props.element.textHasBackground === false || props.element.textBackgroundColor === 'transparent' ? 'Transparent' : 'Filled' }}
          </button>
        </div>
        <div v-if="props.element.textHasBackground !== false && props.element.textBackgroundColor !== 'transparent'" class="flex items-center gap-2 pt-1">
          <span class="text-[9px] text-slate-500 font-mono">Fill Color:</span>
          <input
            type="color"
            v-model="props.element.textBackgroundColor"
            @input="notifyChange"
            class="flex-1 h-6 rounded bg-transparent cursor-pointer border border-slate-700"
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
        <span>Drop Shadow</span>
      </label>

      <div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-500 font-mono">Content Text</span>
          <button
            @click="emit('open-icons')"
            class="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono cursor-pointer"
            title="Open Full Tabletop Icon Library"
          >
            <i class="ri-sparkling-line text-xs"></i>
            <span>+ Icons</span>
          </button>
        </div>

        <!-- Quick 1-click inline icon tokens -->
        <div class="flex items-center gap-1 my-1 overflow-x-auto pb-0.5">
          <span class="text-[9px] text-slate-500 font-mono shrink-0">Quick Icons:</span>
          <button
            v-for="sym in ['⚔️', '🛡️', '❤️', '🎲', '🪙', '✨', '📜', '👑', '🏹', '🧪']"
            :key="sym"
            @click="props.element.text = (props.element.text || '') + (props.element.text ? ' ' : '') + sym; notifyChange()"
            class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs shrink-0 transition-colors"
            :title="`Insert ${sym} inline`"
          >
            {{ sym }}
          </button>
        </div>

        <textarea
          v-model="props.element.text"
          @input="notifyChange"
          rows="3"
          placeholder="Enter text or inline icons..."
          class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-xs text-white font-sans mt-0.5 resize-none font-mono"
        ></textarea>
      </div>
    </div>

    <!-- SPECIFIC CONTROLS: SECTION IMAGE FRAME -->
    <div v-else-if="props.element.type === 'image-frame'" class="border-t border-slate-800 pt-3 space-y-3">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Dual-Layer Image Frame</span>

      <!-- Foreground Cutout -->
      <div>
        <span class="text-[10px] text-slate-400 font-mono">Foreground Cutout</span>
        <input
          v-model="props.element.fgImageUrl"
          @input="notifyChange"
          placeholder="https://.../character_cutout.png"
          class="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1 text-xs text-white mt-0.5"
        />
      </div>

      <!-- Background Texture -->
      <div>
        <span class="text-[10px] text-slate-400 font-mono">Background Texture</span>
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
        <div class="text-4xl p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center min-w-[52px] min-h-[52px]">
          <i v-if="props.element.iconCssClass" :class="props.element.iconCssClass" class="leading-none text-amber-400"></i>
          <span v-else>{{ props.element.iconGlyph || '⚔️' }}</span>
        </div>
        <div class="flex-1 space-y-1.5">
          <button
            @click="emit('open-icons')"
            class="w-full py-1 text-xs rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i class="ri-sparkling-line text-sm"></i>
            Change Icon
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

    <!-- SPECIFIC CONTROLS: SHAPE & PLACEHOLDER BOX -->
    <div v-else-if="props.element.type === 'shape'" class="border-t border-slate-800 pt-3 space-y-3">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
        <i class="ri-shape-line text-amber-400 text-sm"></i>
        Shape Controls
      </span>

      <!-- Shape Geometry -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[10px] text-slate-400 font-mono">Shape</span>
          <select
            v-model="props.element.shapeType"
            @change="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white mt-0.5"
          >
            <option value="rectangle">Rectangle</option>
            <option value="rounded-rect">Rounded</option>
            <option value="hex">Hex Tile</option>
            <option value="circle">Circle</option>
            <option value="badge">Badge</option>
          </select>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 font-mono">Preset</span>
          <select
            v-model="props.element.placeholderType"
            @change="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white mt-0.5"
          >
            <option value="custom">Custom</option>
            <option value="header">Header</option>
            <option value="footer">Footer</option>
            <option value="portrait">Portrait</option>
            <option value="effect">Effect</option>
            <option value="hp">HP</option>
            <option value="marker">Marker</option>
            <option value="cost">Cost</option>
            <option value="stats">Stats</option>
          </select>
        </div>
      </div>

      <!-- Placeholder Label & Tag -->
      <div>
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-400 font-mono">Label Tag</span>
          <label class="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              v-model="props.element.showPlaceholderLabel"
              @change="notifyChange"
              class="rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0"
            />
            <span>Show Tag</span>
          </label>
        </div>
        <input
          v-model="props.element.placeholderLabel"
          @input="notifyChange"
          placeholder="e.g. PORTRAIT ZONE, EFFECT, HP..."
          class="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1 text-xs text-white mt-1"
        />
      </div>

      <!-- Colors & Borders -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-slate-500 font-mono">Fill Color</span>
            <button
              @click="props.element.backgroundColor = 'transparent'; notifyChange()"
              class="text-[9px] text-slate-400 hover:text-amber-300 font-mono cursor-pointer"
            >
              Clear
            </button>
          </div>
          <input
            type="color"
            v-model="props.element.backgroundColor"
            @input="notifyChange"
            class="w-full h-7 rounded bg-transparent cursor-pointer border border-slate-700 mt-0.5"
          />
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Border Color</span>
          <input
            type="color"
            v-model="props.element.borderColor"
            @input="notifyChange"
            class="w-full h-7 rounded bg-transparent cursor-pointer border border-slate-700 mt-0.5"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Border Style</span>
          <select
            v-model="props.element.borderStyle"
            @change="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white mt-0.5"
          >
            <option value="solid">Solid Line</option>
            <option value="dashed">Dashed Outline</option>
            <option value="dotted">Dotted Outline</option>
            <option value="none">None (Invisible)</option>
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
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono mt-0.5"
          />
        </div>
      </div>

      <!-- Corner Radius -->
      <div v-if="props.element.shapeType !== 'hex'">
        <span class="text-[10px] text-slate-500 font-mono">Corner Radius (mm)</span>
        <input
          type="number"
          min="0"
          max="30"
          v-model.number="props.element.borderRadius"
          @input="notifyChange"
          class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono mt-0.5"
        />
      </div>

      <!-- TYPOGRAPHY & TEXT STYLING FOR HEADER / FOOTER / PLACEHOLDERS -->
      <div class="border-t border-slate-800/80 pt-2 space-y-2">
        <span class="text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
          <i class="ri-text text-amber-400 text-sm"></i>
          Text Styling & Typography
        </span>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-[10px] text-slate-500 font-mono">Font Family</span>
            <select
              v-model="props.element.fontFamily"
              @change="notifyChange"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-1 text-xs text-white mt-0.5"
            >
              <option v-for="f in fontOptions" :key="f.val" :value="f.val">{{ f.label }}</option>
            </select>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 font-mono">Font Size (pt)</span>
            <input
              type="number"
              min="6"
              max="72"
              v-model.number="props.element.fontSize"
              @input="notifyChange"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono mt-0.5"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div>
            <span class="text-[10px] text-slate-500 font-mono">Alignment</span>
            <select
              v-model="props.element.textAlign"
              @change="notifyChange"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-1 text-xs text-white mt-0.5"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 font-mono">Weight</span>
            <select
              v-model.number="props.element.fontWeight"
              @change="notifyChange"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-1 text-xs text-white mt-0.5"
            >
              <option :value="400">Regular</option>
              <option :value="600">Semi-Bold</option>
              <option :value="700">Bold</option>
            </select>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 font-mono">Text Color</span>
            <input
              type="color"
              v-model="props.element.color"
              @input="notifyChange"
              class="w-full h-7 rounded bg-transparent cursor-pointer border border-slate-700 mt-0.5"
            />
          </div>
        </div>

        <!-- Text Bounding Box Background / Transparent Fill Option -->
        <div class="p-2 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-slate-400 font-mono">Background</span>
            <button
              @click="props.element.textHasBackground = !props.element.textHasBackground; if (!props.element.textHasBackground) props.element.textBackgroundColor = 'transparent'; notifyChange()"
              class="px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer"
              :class="props.element.textHasBackground === false || props.element.textBackgroundColor === 'transparent'
                ? 'bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-amber-400/20 text-amber-300 border-amber-400/40'"
            >
              {{ props.element.textHasBackground === false || props.element.textBackgroundColor === 'transparent' ? 'Transparent' : 'Filled' }}
            </button>
          </div>
          <div v-if="props.element.textHasBackground !== false && props.element.textBackgroundColor !== 'transparent'" class="flex items-center gap-2 pt-1">
            <span class="text-[9px] text-slate-500 font-mono">Color:</span>
            <input
              type="color"
              v-model="props.element.textBackgroundColor"
              @input="notifyChange"
              class="flex-1 h-6 rounded bg-transparent cursor-pointer border border-slate-700"
            />
          </div>
        </div>

        <!-- Optional Subtext / Rules Content -->
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-slate-500 font-mono">Subtext / Rules</span>
            <button
              @click="emit('open-icons')"
              class="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono cursor-pointer"
            >
              <i class="ri-sparkling-line text-xs"></i>
              + Icons
            </button>
          </div>
          <textarea
            v-model="props.element.text"
            @input="notifyChange"
            rows="2"
            placeholder="Optional subtext, ability rules or flavor text..."
            class="w-full bg-[#1E293B] border border-slate-700 rounded p-1.5 text-xs text-white font-sans mt-0.5 resize-none font-mono"
          ></textarea>
        </div>
      </div>

      <!-- Icon in Box -->
      <div class="border-t border-slate-800/80 pt-2">
        <span class="text-[10px] text-slate-500 font-mono">Icon Glyph</span>
        <div class="flex items-center gap-1.5 mt-0.5">
          <input
            v-model="props.element.iconGlyph"
            @input="notifyChange"
            placeholder="e.g. ⚔️"
            class="w-12 bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white text-center"
          />
          <button
            @click="emit('open-icons')"
            class="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
          >
            <i class="ri-sparkling-line text-amber-400 text-xs"></i>
            Pick Icon
          </button>
        </div>
      </div>

      <!-- EXPLORATION TILE FLIP SETTINGS (FOR HEXAGONS & MAP TILES) -->
      <div v-if="props.element.shapeType === 'hex' || props.element.isFlipped !== undefined" class="border-t border-slate-800/80 pt-2 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-semibold text-amber-300 font-mono uppercase tracking-wider flex items-center gap-1">
            <i class="ri-refresh-line text-amber-400 text-xs"></i>
            Tile Flip Mode
          </span>
          <button
            @click="props.element.isFlipped = !props.element.isFlipped; notifyChange()"
            class="px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer"
            :class="props.element.isFlipped ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold' : 'bg-slate-800 text-slate-300 border-slate-700'"
          >
            {{ props.element.isFlipped ? 'Revealed' : 'Unexplored' }}
          </button>
        </div>

        <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-[9px] text-slate-400 font-mono">Revealed Title</span>
              <input
                v-model="props.element.flippedTitle"
                @input="notifyChange"
                placeholder="e.g. Dragon Lair"
                class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-0.5 text-xs text-white mt-0.5"
              />
            </div>
            <div>
              <span class="text-[9px] text-slate-400 font-mono">Revealed Icon</span>
              <input
                v-model="props.element.flippedIcon"
                @input="notifyChange"
                placeholder="e.g. 🐉"
                class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-0.5 text-xs text-white text-center mt-0.5"
              />
            </div>
          </div>

          <div>
            <span class="text-[9px] text-slate-400 font-mono">Revealed Description</span>
            <input
              v-model="props.element.flippedDescription"
              @input="notifyChange"
              placeholder="e.g. Boss spawns. All players roll initiative!"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-0.5 text-xs text-white mt-0.5"
            />
          </div>

          <div>
            <span class="text-[9px] text-slate-400 font-mono">Revealed Color Tint</span>
            <input
              type="color"
              v-model="props.element.flippedColor"
              @input="notifyChange"
              class="w-full h-6 rounded bg-transparent cursor-pointer border border-slate-700 mt-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-8 text-slate-500 text-xs font-mono">
    Click any element on canvas to inspect and edit properties.
  </div>
</template>
