<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    showAlpha?: boolean;
    disabled?: boolean;
  }>(),
  {
    modelValue: '#F59E0B',
    label: '',
    showAlpha: true,
    disabled: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'change', val: string): void;
}>();

const isOpen = ref(false);

// Internal HSV & Alpha state
const hue = ref(38); // 0-360
const saturation = ref(93); // 0-100
const brightness = ref(96); // 0-100
const alpha = ref(1); // 0-1

// Helper: HSV to RGB
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const sat = s / 100;
  const val = v / 100;
  const c = val * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = val - c;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h <= 360) { r = c; g = 0; b = x; }
  return [
    Math.min(255, Math.max(0, Math.round((r + m) * 255))),
    Math.min(255, Math.max(0, Math.round((g + m) * 255))),
    Math.min(255, Math.max(0, Math.round((b + m) * 255)))
  ];
}

// Helper: RGB to HSV
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;
  const max = Math.max(normR, normG, normB);
  const min = Math.min(normR, normG, normB);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    switch (max) {
      case normR: h = (normG - normB) / d + (normG < normB ? 6 : 0); break;
      case normG: h = (normB - normR) / d + 2; break;
      case normB: h = (normR - normG) / d + 4; break;
    }
    h /= 6;
  }
  return [
    Math.round(h * 360) % 360,
    Math.round(s * 100),
    Math.round(v * 100)
  ];
}

function parseColorString(val: string) {
  if (!val || val === 'transparent') {
    alpha.value = 0;
    return;
  }
  const clean = val.trim();
  if (clean.startsWith('#')) {
    let hex = clean.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16) || 0;
      const g = parseInt(hex.slice(2, 4), 16) || 0;
      const b = parseInt(hex.slice(4, 6), 16) || 0;
      const [h, s, v] = rgbToHsv(r, g, b);
      hue.value = h;
      saturation.value = s;
      brightness.value = v;
      alpha.value = 1;
    } else if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16) || 0;
      const g = parseInt(hex.slice(2, 4), 16) || 0;
      const b = parseInt(hex.slice(4, 6), 16) || 0;
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      const [h, s, v] = rgbToHsv(r, g, b);
      hue.value = h;
      saturation.value = s;
      brightness.value = v;
      alpha.value = +a.toFixed(2);
    }
  } else if (clean.startsWith('rgb')) {
    const parts = clean.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      const r = parseInt(parts[0], 10);
      const g = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      const [h, s, v] = rgbToHsv(r, g, b);
      hue.value = h;
      saturation.value = s;
      brightness.value = v;
      if (parts.length >= 4) {
        alpha.value = parseFloat(parts[3]);
      } else {
        alpha.value = 1;
      }
    }
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) parseColorString(newVal);
  },
  { immediate: true }
);

const currentRgb = computed(() => {
  return hsvToRgb(hue.value, saturation.value, brightness.value);
});

const currentHex = computed(() => {
  const [r, g, b] = currentRgb.value;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
});

const formattedColor = computed(() => {
  if (alpha.value === 0) return 'transparent';
  if (alpha.value === 1) return currentHex.value;
  const [r, g, b] = currentRgb.value;
  return `rgba(${r}, ${g}, ${b}, ${alpha.value})`;
});

function emitUpdate() {
  const val = formattedColor.value;
  emit('update:modelValue', val);
  emit('change', val);
}

function updateHue(e: Event) {
  hue.value = parseInt((e.target as HTMLInputElement).value, 10);
  emitUpdate();
}

function updateSaturation(e: Event) {
  saturation.value = parseInt((e.target as HTMLInputElement).value, 10);
  emitUpdate();
}

function updateBrightness(e: Event) {
  brightness.value = parseInt((e.target as HTMLInputElement).value, 10);
  emitUpdate();
}

function updateAlpha(e: Event) {
  alpha.value = +(parseInt((e.target as HTMLInputElement).value, 10) / 100).toFixed(2);
  emitUpdate();
}

function handleHexInput(e: Event) {
  const text = (e.target as HTMLInputElement).value.trim();
  if (/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(text)) {
    const formatted = text.startsWith('#') ? text : `#${text}`;
    parseColorString(formatted);
    emitUpdate();
  }
}

// Quick Preset Swatches for Tabletop Design
const presets = [
  '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#06B6D4', '#E2E8F0', '#64748B', '#0F172A',
  '#000000', 'transparent'
];

function selectPreset(color: string) {
  if (color === 'transparent') {
    alpha.value = 0;
  } else {
    parseColorString(color);
  }
  emitUpdate();
}
</script>

<template>
  <div class="relative inline-flex items-center">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      :disabled="props.disabled"
      class="h-7 px-2 rounded border border-slate-700 bg-slate-900/90 hover:border-amber-400/80 flex items-center gap-1.5 transition-all text-xs text-slate-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
    >
      <!-- Color Chip Swatch -->
      <span
        class="w-4 h-4 rounded-xs border border-white/20 shadow-xs shrink-0 relative overflow-hidden"
        style="background-image: repeating-linear-gradient(45deg, #334155 25%, transparent 25%), repeating-linear-gradient(-45deg, #334155 25%, transparent 25%), repeating-linear-gradient(45deg, transparent 75%, #334155 75%), repeating-linear-gradient(-45deg, transparent 75%, #334155 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px;"
      >
        <span
          class="absolute inset-0"
          :style="{ backgroundColor: formattedColor }"
        ></span>
      </span>

      <span class="font-mono text-[11px] truncate max-w-[80px]">
        {{ alpha === 0 ? 'None' : currentHex }}
      </span>
      <span v-if="props.showAlpha && alpha < 1" class="text-[9px] text-slate-400 font-mono">
        {{ Math.round(alpha * 100) }}%
      </span>
      <i class="ri-arrow-down-s-line text-slate-400 text-xs ml-0.5"></i>
    </button>

    <!-- Popover Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    ></div>

    <!-- Advanced HSL/HSV Color Picker Popover -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-1.5 w-68 max-w-[calc(100vw-2rem)] box-border bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100"
    >
      <!-- Header Preview & Hex Input -->
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-lg border border-slate-700 relative overflow-hidden shrink-0 shadow-inner"
          style="background-image: repeating-linear-gradient(45deg, #334155 25%, transparent 25%), repeating-linear-gradient(-45deg, #334155 25%, transparent 25%), repeating-linear-gradient(45deg, transparent 75%, #334155 75%), repeating-linear-gradient(-45deg, transparent 75%, #334155 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px;"
        >
          <div
            class="absolute inset-0"
            :style="{ backgroundColor: formattedColor }"
          ></div>
        </div>

        <div class="flex-1 flex items-center bg-[#0B0F17] border border-slate-700 rounded px-2 py-1">
          <span class="text-slate-500 font-mono text-[11px] mr-1">HEX</span>
          <input
            :value="currentHex"
            @change="handleHexInput"
            class="w-full bg-transparent text-white font-mono text-xs focus:outline-none uppercase"
          />
        </div>
      </div>

      <!-- Sliders Section -->
      <div class="space-y-2.5">
        <!-- 1. Hue Slider (0-360°) -->
        <div class="space-y-1">
          <div class="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>HUE</span>
            <span>{{ hue }}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            :value="hue"
            @input="updateHue"
            class="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style="background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);"
          />
        </div>

        <!-- 2. Saturation Slider (0-100%) -->
        <div class="space-y-1">
          <div class="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>SATURATION</span>
            <span>{{ saturation }}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            :value="saturation"
            @input="updateSaturation"
            class="w-full h-2 rounded-lg appearance-none cursor-pointer"
            :style="{
              background: `linear-gradient(to right, #808080, hsl(${hue}, 100%, 50%))`
            }"
          />
        </div>

        <!-- 3. Brightness / Value Slider (0-100%) -->
        <div class="space-y-1">
          <div class="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>BRIGHTNESS</span>
            <span>{{ brightness }}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            :value="brightness"
            @input="updateBrightness"
            class="w-full h-2 rounded-lg appearance-none cursor-pointer"
            :style="{
              background: `linear-gradient(to right, #000000, hsl(${hue}, ${saturation}%, 50%))`
            }"
          />
        </div>

        <!-- 4. Alpha / Opacity Slider (0-100%) -->
        <div v-if="props.showAlpha" class="space-y-1">
          <div class="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>ALPHA / OPACITY</span>
            <span>{{ Math.round(alpha * 100) }}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            :value="Math.round(alpha * 100)"
            @input="updateAlpha"
            class="w-full h-2 rounded-lg appearance-none cursor-pointer"
            :style="{
              background: `linear-gradient(to right, transparent, ${currentHex})`
            }"
          />
        </div>
      </div>

      <!-- Quick Preset Swatches -->
      <div class="border-t border-slate-800 pt-2 space-y-1.5">
        <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Presets</span>
        <div class="grid grid-cols-6 gap-1.5">
          <button
            v-for="preset in presets"
            :key="preset"
            type="button"
            @click="selectPreset(preset)"
            class="w-6 h-6 rounded border border-slate-700 hover:scale-110 transition-transform relative overflow-hidden cursor-pointer"
            :title="preset"
          >
            <span
              v-if="preset === 'transparent'"
              class="absolute inset-0 flex items-center justify-center text-[10px] text-red-400 font-bold bg-slate-950"
            >
              ⊘
            </span>
            <span
              v-else
              class="absolute inset-0"
              :style="{ backgroundColor: preset }"
            ></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
