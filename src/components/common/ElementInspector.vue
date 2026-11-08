<script setup lang="ts">
import type { CanvasElement } from '../../types/index.ts';
import AdvancedColorPicker from './AdvancedColorPicker.vue';
import { getRemixIconClass } from '../../utils/iconHelper.ts';

const props = defineProps<{
  element: CanvasElement | null;
}>();

const emit = defineEmits<{
  (e: 'change', el: CanvasElement): void;
  (e: 'open-icons'): void;
}>();

// 40+ Font Families organized into Formal / Professional and Playful / Creative
const formalFonts = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
  'EB Garamond', 'Cambria', 'Merriweather', 'Playfair Display', 'Source Sans 3',
  'Raleway', 'Nunito', 'Oswald', 'Work Sans', 'Fira Sans', 'Public Sans', 'Outfit'
];

const playfulFonts = [
  'Comic Sans MS', 'Comic Neue', 'Fredoka', 'Quicksand', 'Patrick Hand',
  'Pacifico', 'Caveat', 'Baloo 2', 'Chicle', 'Chewy',
  'Titan One', 'Bangers', 'Luckiest Guy', 'Bubblegum Sans', 'Sniglet',
  'Permanent Marker', 'Amatic SC', 'Lobster', 'Comfortaa', 'Crafty Girls'
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

function getBackgroundAlpha(colorStr?: string): number {
  if (!colorStr || colorStr === 'transparent') return 0;
  const str = colorStr.trim();
  if (str.startsWith('rgba')) {
    const parts = str.match(/[\d.]+/g);
    if (parts && parts.length >= 4) {
      return Math.round(parseFloat(parts[3]) * 100);
    }
  } else if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 8) {
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      return Math.round(a * 100);
    }
    return 100;
  }
  return 100;
}

function handleTextBgAlphaChange(e: Event) {
  if (!props.element) return;
  const val = parseInt((e.target as HTMLInputElement).value, 10);
  if (val <= 0) {
    props.element.textBackgroundColor = 'transparent';
    props.element.textHasBackground = false;
  } else {
    props.element.textHasBackground = true;
    const a = +(val / 100).toFixed(2);
    let r = 15, g = 23, b = 42; // default dark slate
    const current = props.element.textBackgroundColor;
    if (current && current !== 'transparent') {
      if (current.startsWith('rgb')) {
        const parts = current.match(/[\d.]+/g);
        if (parts && parts.length >= 3) {
          r = parseInt(parts[0], 10);
          g = parseInt(parts[1], 10);
          b = parseInt(parts[2], 10);
        }
      } else if (current.startsWith('#')) {
        let hex = current.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (hex.length >= 6) {
          r = parseInt(hex.slice(0, 2), 16) || 0;
          g = parseInt(hex.slice(2, 4), 16) || 0;
          b = parseInt(hex.slice(4, 6), 16) || 0;
        }
      }
    }
    props.element.textBackgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  notifyChange();
}
</script>

<template>
  <div v-if="props.element" class="space-y-4 text-xs select-none">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-2">
      <div class="flex items-center gap-1.5 font-semibold text-slate-200 font-display">
        <i
          :class="props.element.type === 'text' ? 'ri-text' : props.element.type === 'image-frame' ? 'ri-image-2-line' : props.element.type === 'shape' ? 'ri-shape-line' : 'ri-sparkling-line'"
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

    <!-- Position & Size Coordinates -->
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
          <span class="text-[9px] text-slate-500">Opacity ({{ Math.round((props.element.opacity ?? 1) * 100) }}%)</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="props.element.opacity"
            @input="notifyChange"
            class="w-full mt-1 accent-amber-400 cursor-pointer"
          />
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 1. TEXT ELEMENT CONTROLS                   -->
    <!-- ========================================== -->
    <div v-if="props.element.type === 'text'" class="border-t border-slate-800 pt-3 space-y-3">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
        <i class="ri-text text-amber-400 text-sm"></i>
        Typography & Text
      </span>

      <!-- Font Family (40+ Fonts grouped into Formal & Playful) -->
      <div>
        <span class="text-[10px] text-slate-500 font-mono">Font Family</span>
        <select
          v-model="props.element.fontFamily"
          @change="notifyChange"
          class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white mt-0.5 font-sans"
        >
          <optgroup label="Formal / Professional (20+)">
            <option v-for="f in formalFonts" :key="f" :value="f" :style="{ fontFamily: f }">
              {{ f }}
            </option>
          </optgroup>
          <optgroup label="Playful / Creative (20+)">
            <option v-for="f in playfulFonts" :key="f" :value="f" :style="{ fontFamily: f }">
              {{ f }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- Font Size & Weight -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Font Size (pt)</span>
          <input
            type="number"
            min="6"
            max="96"
            v-model.number="props.element.fontSize"
            @input="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono mt-0.5"
          />
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Weight</span>
          <select
            v-model.number="props.element.fontWeight"
            @change="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white mt-0.5"
          >
            <option :value="300">Light (300)</option>
            <option :value="400">Regular (400)</option>
            <option :value="600">Semi-Bold (600)</option>
            <option :value="700">Bold (700)</option>
            <option :value="900">Black (900)</option>
          </select>
        </div>
      </div>

      <!-- Microsoft Word Style Horizontal Alignment Buttons -->
      <div class="space-y-1">
        <span class="text-[10px] text-slate-500 font-mono">Horizontal Alignment</span>
        <div class="flex items-center bg-[#1E293B] border border-slate-700 rounded p-0.5 gap-0.5">
          <button
            type="button"
            @click="props.element.textAlign = 'left'; notifyChange()"
            class="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
            :class="props.element.textAlign === 'left' || !props.element.textAlign ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
            title="Align Left"
          >
            <i class="ri-align-left text-sm leading-none"></i>
          </button>
          <button
            type="button"
            @click="props.element.textAlign = 'center'; notifyChange()"
            class="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
            :class="props.element.textAlign === 'center' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
            title="Align Center"
          >
            <i class="ri-align-center text-sm leading-none"></i>
          </button>
          <button
            type="button"
            @click="props.element.textAlign = 'right'; notifyChange()"
            class="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
            :class="props.element.textAlign === 'right' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
            title="Align Right"
          >
            <i class="ri-align-right text-sm leading-none"></i>
          </button>
          <button
            type="button"
            @click="props.element.textAlign = 'justify'; notifyChange()"
            class="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
            :class="props.element.textAlign === 'justify' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
            title="Justify"
          >
            <i class="ri-align-justify text-sm leading-none"></i>
          </button>
        </div>
      </div>

      <!-- Microsoft Word Style Vertical Alignment Buttons -->
      <div class="space-y-1">
        <span class="text-[10px] text-slate-500 font-mono">Vertical Alignment</span>
        <div class="flex items-center bg-[#1E293B] border border-slate-700 rounded p-0.5 gap-0.5">
          <button
            type="button"
            @click="props.element.verticalAlign = 'top'; notifyChange()"
            class="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
            :class="props.element.verticalAlign === 'top' || !props.element.verticalAlign ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
            title="Align Top"
          >
            <i class="ri-align-top text-sm leading-none"></i>
          </button>
          <button
            type="button"
            @click="props.element.verticalAlign = 'middle'; notifyChange()"
            class="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
            :class="props.element.verticalAlign === 'middle' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
            title="Align Middle"
          >
            <i class="ri-align-vertically text-sm leading-none"></i>
          </button>
          <button
            type="button"
            @click="props.element.verticalAlign = 'bottom'; notifyChange()"
            class="flex-1 py-1 rounded text-center transition-colors cursor-pointer"
            :class="props.element.verticalAlign === 'bottom' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
            title="Align Bottom"
          >
            <i class="ri-align-bottom text-sm leading-none"></i>
          </button>
        </div>
      </div>

      <!-- Text Formatting Controls (Dropdown Menu) -->
      <div class="space-y-1">
        <span class="text-[10px] text-slate-500 font-mono">List Format</span>
        <select
          v-model="props.element.listStyle"
          @change="notifyChange"
          class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1.5 text-xs text-white mt-0.5 font-sans cursor-pointer focus:outline-none focus:border-amber-400"
        >
          <option value="none">None (Standard block/inline text)</option>
          <option value="disc">Unordered List (Bullets)</option>
          <option value="decimal">Ordered List (Numbers)</option>
        </select>
      </div>

      <!-- Font Style & Text Color with Advanced Color Picker -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Font Style</span>
          <select
            v-model="props.element.fontStyle"
            @change="notifyChange"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-1.5 py-1 text-xs text-white mt-0.5"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italic</option>
          </select>
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-mono block mb-0.5">Text Color</span>
          <AdvancedColorPicker
            v-model="props.element.color"
            @change="notifyChange"
            :showAlpha="true"
          />
        </div>
      </div>

      <!-- Text Container Background Transparency / Opacity Slider (0 - 100%) -->
      <div class="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-400 font-mono">Background Fill</span>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-amber-400 font-mono font-semibold">
              {{ getBackgroundAlpha(props.element.textBackgroundColor) }}%
            </span>
            <span class="text-[9px] text-slate-500 font-mono">
              ({{ getBackgroundAlpha(props.element.textBackgroundColor) === 0 ? 'Transparent' : getBackgroundAlpha(props.element.textBackgroundColor) === 100 ? 'Opaque' : 'Tinted' }})
            </span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          :value="getBackgroundAlpha(props.element.textBackgroundColor)"
          @input="handleTextBgAlphaChange"
          class="w-full accent-amber-400 cursor-pointer"
          title="Background Fill Transparency (0 = Fully Transparent, 100 = Fully Opaque)"
        />

        <div class="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <span class="text-[9px] text-slate-500 font-mono">Fill Color Tint:</span>
          <AdvancedColorPicker
            v-model="props.element.textBackgroundColor"
            @change="notifyChange"
            :showAlpha="true"
          />
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 2. SHAPE ELEMENT CONTROLS                  -->
    <!-- ========================================== -->
    <div v-else-if="props.element.type === 'shape'" class="border-t border-slate-800 pt-3 space-y-3">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
        <i class="ri-shape-line text-amber-400 text-sm"></i>
        Shape Controls
      </span>

      <!-- Shape Geometry & Preset -->
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

      <!-- Dedicated Shape Opacity Slider (0-100%) -->
      <div class="p-2 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
        <div class="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>SHAPE OPACITY</span>
          <span>{{ Math.round((props.element.opacity ?? 1) * 100) }}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          v-model.number="props.element.opacity"
          @input="notifyChange"
          class="w-full accent-amber-400 cursor-pointer"
        />
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

      <!-- Colors & Borders with Advanced Color Picker -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[10px] text-slate-500 font-mono block mb-1">Fill Color</span>
          <AdvancedColorPicker
            v-model="props.element.backgroundColor"
            @change="notifyChange"
            :showAlpha="true"
          />
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-mono block mb-1">Border Color</span>
          <AdvancedColorPicker
            v-model="props.element.borderColor"
            @change="notifyChange"
            :showAlpha="true"
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

      <!-- Typography & Text Styling for Shapes/Containers -->
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
              <optgroup label="Formal / Professional (20+)">
                <option v-for="f in formalFonts" :key="f" :value="f">{{ f }}</option>
              </optgroup>
              <optgroup label="Playful / Creative (20+)">
                <option v-for="f in playfulFonts" :key="f" :value="f">{{ f }}</option>
              </optgroup>
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

        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-[10px] text-slate-500 font-mono block mb-1">Text Color</span>
            <AdvancedColorPicker
              v-model="props.element.color"
              @change="notifyChange"
              :showAlpha="true"
            />
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

      <!-- Icon in Shape -->
      <div class="border-t border-slate-800/80 pt-2">
        <span class="text-[10px] text-slate-500 font-mono">Icon Symbol</span>
        <div class="flex items-center gap-2 mt-1">
          <div class="w-8 h-8 rounded bg-[#1E293B] border border-slate-700 flex items-center justify-center text-amber-400 text-lg">
            <i :class="props.element.iconCssClass || getRemixIconClass(props.element.iconGlyph, 'ri-sparkling-line')"></i>
          </div>
          <button
            @click="emit('open-icons')"
            class="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <i class="ri-sparkling-line text-amber-400 text-xs"></i>
            Change Icon
          </button>
        </div>
      </div>

      <!-- Exploration Tile Flip Settings -->
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
              <span class="text-[9px] text-slate-400 font-mono block mb-1">Revealed Tint</span>
              <AdvancedColorPicker
                v-model="props.element.flippedColor"
                @change="notifyChange"
                :showAlpha="true"
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
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 3. IMAGE FRAME CONTROLS                    -->
    <!-- ========================================== -->
    <div v-else-if="props.element.type === 'image-frame'" class="border-t border-slate-800 pt-3 space-y-3">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
        <i class="ri-image-2-line text-amber-400 text-sm"></i>
        Image Frame
      </span>

      <!-- Frame Border -->
      <div class="grid grid-cols-2 gap-2">
        <div>
          <span class="text-[10px] text-slate-500 font-mono block mb-1">Border Color</span>
          <AdvancedColorPicker
            v-model="props.element.borderColor"
            @change="notifyChange"
            :showAlpha="true"
          />
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

      <!-- Quick Background Presets -->
      <div class="space-y-1">
        <span class="text-[10px] text-slate-500 font-mono">Texture Preset</span>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            v-for="bg in sampleBackgrounds"
            :key="bg.label"
            type="button"
            @click="props.element.bgImageUrl = bg.url; notifyChange()"
            class="p-1.5 rounded border text-[10px] font-mono transition-colors text-left truncate cursor-pointer"
            :class="props.element.bgImageUrl === bg.url ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold' : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'"
          >
            {{ bg.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 4. ICON ELEMENT CONTROLS                   -->
    <!-- ========================================== -->
    <div v-else-if="props.element.type === 'icon'" class="border-t border-slate-800 pt-3 space-y-3">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
        <i class="ri-sparkling-line text-amber-400 text-sm"></i>
        Tabletop Icon
      </span>

      <div class="flex items-center gap-3 p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
        <div class="w-12 h-12 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-amber-400 text-3xl">
          <i :class="props.element.iconCssClass || getRemixIconClass(props.element.iconGlyph, 'ri-sword-line')"></i>
        </div>
        <div class="flex-1 space-y-1.5">
          <button
            @click="emit('open-icons')"
            class="w-full py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i class="ri-refresh-line text-xs"></i>
            Change Icon
          </button>
          <div class="flex items-center gap-2">
            <span class="text-[9px] text-slate-400 font-mono">Color:</span>
            <AdvancedColorPicker
              v-model="props.element.iconColor"
              @change="notifyChange"
              :showAlpha="true"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 5. UNIVERSAL VISUAL EFFECTS (ALL ELEMENTS) -->
    <!-- ========================================== -->
    <div class="border-t border-slate-800 pt-3 space-y-3">
      <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
        <i class="ri-magic-line text-amber-400 text-sm"></i>
        Visual Effects
      </span>

      <!-- Drop Shadow Section -->
      <div class="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
            <input
              type="checkbox"
              v-model="props.element.hasDropShadow"
              @change="notifyChange"
              class="rounded bg-slate-950 border-slate-700 text-amber-400 focus:ring-0"
            />
            <span>Drop Shadow</span>
          </label>
          <span v-if="props.element.hasDropShadow" class="text-[9px] text-amber-400 font-mono font-bold">ACTIVE</span>
        </div>

        <div v-if="props.element.hasDropShadow" class="space-y-2 pt-1 border-t border-slate-800/60">
          <div class="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
            <div>
              <span>X Offset (px)</span>
              <input
                type="number"
                v-model.number="props.element.shadowOffsetX"
                @input="notifyChange"
                class="w-full bg-[#0B0F17] border border-slate-700 rounded px-1.5 py-0.5 text-white mt-0.5"
              />
            </div>
            <div>
              <span>Y Offset (px)</span>
              <input
                type="number"
                v-model.number="props.element.shadowOffsetY"
                @input="notifyChange"
                class="w-full bg-[#0B0F17] border border-slate-700 rounded px-1.5 py-0.5 text-white mt-0.5"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
            <div>
              <span>Blur Radius (px)</span>
              <input
                type="number"
                min="0"
                max="100"
                v-model.number="props.element.shadowBlur"
                @input="notifyChange"
                class="w-full bg-[#0B0F17] border border-slate-700 rounded px-1.5 py-0.5 text-white mt-0.5"
              />
            </div>
            <div>
              <span>Spread (px)</span>
              <input
                type="number"
                min="-50"
                max="100"
                v-model.number="props.element.shadowSpread"
                @input="notifyChange"
                class="w-full bg-[#0B0F17] border border-slate-700 rounded px-1.5 py-0.5 text-white mt-0.5"
              />
            </div>
          </div>

          <div>
            <span class="text-[10px] text-slate-400 font-mono block mb-1">Shadow Color</span>
            <AdvancedColorPicker
              v-model="props.element.shadowColor"
              @change="notifyChange"
              :showAlpha="true"
            />
          </div>
        </div>
      </div>

      <!-- Glow Effect Section -->
      <div class="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
            <input
              type="checkbox"
              v-model="props.element.hasGlow"
              @change="notifyChange"
              class="rounded bg-slate-950 border-slate-700 text-amber-400 focus:ring-0"
            />
            <span>Glow Effect</span>
          </label>
          <span v-if="props.element.hasGlow" class="text-[9px] text-cyan-400 font-mono font-bold">ACTIVE</span>
        </div>

        <div v-if="props.element.hasGlow" class="space-y-2 pt-1 border-t border-slate-800/60">
          <div class="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
            <div>
              <span>Blur Radius (px)</span>
              <input
                type="number"
                min="1"
                max="100"
                v-model.number="props.element.glowBlur"
                @input="notifyChange"
                class="w-full bg-[#0B0F17] border border-slate-700 rounded px-1.5 py-0.5 text-white mt-0.5"
              />
            </div>
            <div>
              <span>Opacity ({{ Math.round((props.element.glowOpacity ?? 1) * 100) }}%)</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                v-model.number="props.element.glowOpacity"
                @input="notifyChange"
                class="w-full mt-2 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <span class="text-[10px] text-slate-400 font-mono block mb-1">Glow Color</span>
            <AdvancedColorPicker
              v-model="props.element.glowColor"
              @change="notifyChange"
              :showAlpha="true"
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
