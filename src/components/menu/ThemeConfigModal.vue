<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  THEME_PRESETS,
  ACCENT_SWATCHES,
  currentThemeId,
  customAccentColor,
  activeTheme,
  setThemePreset,
  setCustomAccent,
  resetToPresetAccent
} from '../../stores/themeStore.ts';
import AdvancedColorPicker from '../common/AdvancedColorPicker.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const activeTab = ref<'presets' | 'accent'>('presets');
const hexInputVal = ref(activeTheme.value.accentColor);

function handleSelectPreset(presetId: string) {
  setThemePreset(presetId);
  hexInputVal.value = activeTheme.value.accentColor;
}

function handleSelectSwatch(color: string) {
  setCustomAccent(color);
  hexInputVal.value = color;
}

function handleCustomColorChange(color: string) {
  setCustomAccent(color);
  hexInputVal.value = color;
}

function handleResetAccent() {
  resetToPresetAccent();
  hexInputVal.value = activeTheme.value.accentColor;
}

function getModeBadgeClass(mode: string) {
  switch (mode) {
    case 'light':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'parchment':
      return 'bg-amber-200/40 text-amber-800 border-amber-400/50';
    case 'emerald':
      return 'bg-emerald-900/60 text-emerald-300 border-emerald-700';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-150"
    @click.self="emit('close')"
  >
    <div
      class="border rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors"
      :style="{
        backgroundColor: activeTheme.bgSurface,
        borderColor: activeTheme.borderBase,
        color: activeTheme.textBase
      }"
    >
      <!-- Modal Header -->
      <div
        class="px-6 py-4 border-b flex items-center justify-between shrink-0"
        :style="{ borderColor: activeTheme.borderBase }"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shadow-sm border transition-colors"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 20%, transparent)',
              borderColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 50%, transparent)',
              color: activeTheme.accentColor
            }"
          >
            <i class="ri-palette-line text-lg"></i>
          </div>
          <div>
            <h3 class="text-base font-bold font-display tracking-tight" :style="{ color: activeTheme.textBase }">
              Editor Theme & Accent Configuration
            </h3>
            <p class="text-[11px] font-mono" :style="{ color: activeTheme.textMuted }">
              Personalize studio canvas, dark/light presets & tabletop accent colors
            </p>
          </div>
        </div>

        <button
          @click="emit('close')"
          class="p-1.5 rounded-lg hover:bg-slate-800/40 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <i class="ri-close-line text-xl"></i>
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div
        class="px-6 pt-3 flex items-center gap-2 border-b shrink-0 text-xs font-semibold"
        :style="{ borderColor: activeTheme.borderBase }"
      >
        <button
          @click="activeTab = 'presets'"
          class="pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer"
          :class="activeTab === 'presets' ? 'font-bold' : 'border-transparent opacity-60 hover:opacity-100'"
          :style="activeTab === 'presets' ? { borderColor: activeTheme.accentColor, color: activeTheme.accentColor } : {}"
        >
          <i class="ri-contrast-drop-2-line"></i>
          <span>Theme Presets ({{ THEME_PRESETS.length }})</span>
        </button>

        <button
          @click="activeTab = 'accent'"
          class="pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer"
          :class="activeTab === 'accent' ? 'font-bold' : 'border-transparent opacity-60 hover:opacity-100'"
          :style="activeTab === 'accent' ? { borderColor: activeTheme.accentColor, color: activeTheme.accentColor } : {}"
        >
          <i class="ri-magic-line"></i>
          <span>Custom Accent Color</span>
          <span
            v-if="customAccentColor"
            class="w-2 h-2 rounded-full inline-block ml-0.5 animate-pulse"
            :style="{ backgroundColor: activeTheme.accentColor }"
          ></span>
        </button>
      </div>

      <!-- Scrollable Tab Body -->
      <div class="p-6 overflow-y-auto space-y-6 flex-1">
        <!-- TAB 1: Theme Presets -->
        <div v-if="activeTab === 'presets'" class="space-y-4">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium" :style="{ color: activeTheme.textMuted }">
              Select a visual mood for your editor workstation:
            </span>
            <span class="text-[11px] font-mono px-2 py-0.5 rounded border" :style="{ borderColor: activeTheme.borderBase, color: activeTheme.textMuted }">
              Active: {{ activeTheme.name }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="preset in THEME_PRESETS"
              :key="preset.id"
              @click="handleSelectPreset(preset.id)"
              class="group p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
              :style="{
                backgroundColor: currentThemeId === preset.id ? preset.bgCard : preset.bgSurface,
                borderColor: currentThemeId === preset.id ? preset.accentColor : preset.borderBase,
                boxShadow: currentThemeId === preset.id ? `0 0 0 1px ${preset.accentColor}40` : 'none'
              }"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    class="font-bold text-xs font-display flex items-center gap-1.5"
                    :style="{ color: preset.textBase }"
                  >
                    <span
                      class="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      :style="{ backgroundColor: preset.accentColor }"
                    ></span>
                    {{ preset.name }}
                  </span>

                  <span
                    class="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border"
                    :class="getModeBadgeClass(preset.mode)"
                  >
                    {{ preset.mode }}
                  </span>
                </div>

                <!-- Palette Preview Bar -->
                <div class="flex items-center h-4 rounded overflow-hidden border border-black/20 my-2">
                  <div class="flex-1 h-full" :style="{ backgroundColor: preset.bgBase }" title="App Background"></div>
                  <div class="flex-1 h-full" :style="{ backgroundColor: preset.bgSurface }" title="Panel Surface"></div>
                  <div class="flex-1 h-full" :style="{ backgroundColor: preset.bgCard }" title="Card Surface"></div>
                  <div class="flex-1 h-full" :style="{ backgroundColor: preset.borderBase }" title="Borders"></div>
                  <div class="w-8 h-full" :style="{ backgroundColor: preset.accentColor }" title="Primary Accent"></div>
                </div>
              </div>

              <!-- Selection Indicator -->
              <div class="flex items-center justify-between text-[11px] pt-2 border-t" :style="{ borderColor: preset.borderBase }">
                <span class="font-mono text-[10px]" :style="{ color: preset.textMuted }">
                  {{ preset.accentColor }}
                </span>
                <span
                  v-if="currentThemeId === preset.id"
                  class="font-bold flex items-center gap-1 text-[11px]"
                  :style="{ color: preset.accentColor }"
                >
                  <i class="ri-check-line font-bold"></i>
                  <span>Active</span>
                </span>
                <span
                  v-else
                  class="opacity-0 group-hover:opacity-75 transition-opacity text-[11px]"
                  :style="{ color: preset.textMuted }"
                >
                  Click to Apply
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: Custom Accent Color -->
        <div v-if="activeTab === 'accent'" class="space-y-5">
          <div class="space-y-1">
            <h4 class="text-xs font-bold font-display" :style="{ color: activeTheme.textBase }">
              Accent Color (Yellow / Gold Replacement)
            </h4>
            <p class="text-[11px]" :style="{ color: activeTheme.textMuted }">
              Customize the primary highlight color used for active tools, selection borders, key buttons, and smart alignment guides.
            </p>
          </div>

          <!-- Curated Tabletop Swatches -->
          <div class="space-y-2">
            <span class="text-[10px] font-mono uppercase tracking-wider block" :style="{ color: activeTheme.textMuted }">
              Curated Tabletop Palettes
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                v-for="swatch in ACCENT_SWATCHES"
                :key="swatch.color"
                @click="handleSelectSwatch(swatch.color)"
                class="p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2 group hover:scale-[1.02]"
                :style="{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.accentColor.toLowerCase() === swatch.color.toLowerCase() ? activeTheme.accentColor : activeTheme.borderBase
                }"
              >
                <span
                  class="w-5 h-5 rounded-md shrink-0 shadow-xs flex items-center justify-center text-xs font-bold"
                  :style="{
                    backgroundColor: swatch.color,
                    color: swatch.color === '#E2E8F0' ? '#0B0F17' : '#FFFFFF'
                  }"
                >
                  <i
                    v-if="activeTheme.accentColor.toLowerCase() === swatch.color.toLowerCase()"
                    class="ri-check-line"
                  ></i>
                </span>
                <div class="overflow-hidden">
                  <div class="text-[11px] font-bold truncate" :style="{ color: activeTheme.textBase }">
                    {{ swatch.name }}
                  </div>
                  <div class="text-[9px] font-mono" :style="{ color: activeTheme.textMuted }">
                    {{ swatch.color }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Freeform Custom Hex & Advanced Color Picker -->
          <div
            class="p-4 rounded-xl border space-y-3"
            :style="{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.borderBase }"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span class="text-xs font-bold font-display" :style="{ color: activeTheme.textBase }">
                  Custom Hex / Hue Slider
                </span>
                <p class="text-[11px]" :style="{ color: activeTheme.textMuted }">
                  Pick any custom brand, team, or theme hex color code
                </p>
              </div>

              <div class="flex items-center gap-2">
                <AdvancedColorPicker
                  :modelValue="activeTheme.accentColor"
                  @change="handleCustomColorChange"
                  :showAlpha="false"
                />

                <button
                  v-if="customAccentColor"
                  @click="handleResetAccent"
                  class="px-2.5 py-1.5 text-xs rounded border hover:bg-slate-800/40 transition-colors cursor-pointer flex items-center gap-1"
                  :style="{ borderColor: activeTheme.borderBase, color: activeTheme.textMuted }"
                  title="Reset to default preset accent"
                >
                  <i class="ri-refresh-line text-xs"></i>
                  <span>Reset Default</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Interactive Preview Strip -->
        <div
          class="p-4 rounded-xl border space-y-3"
          :style="{
            backgroundColor: activeTheme.bgCard,
            borderColor: activeTheme.borderBase
          }"
        >
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono uppercase tracking-wider font-bold" :style="{ color: activeTheme.textMuted }">
              Live Theme Preview
            </span>
            <span
              class="text-[10px] font-mono px-2 py-0.5 rounded-full border"
              :style="{
                backgroundColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 15%, transparent)',
                borderColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 40%, transparent)',
                color: activeTheme.accentColor
              }"
            >
              Accent: {{ activeTheme.accentColor }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- Mock Primary Button -->
            <button
              class="px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              :style="{
                backgroundColor: activeTheme.accentColor,
                color: activeTheme.accentText
              }"
            >
              <i class="ri-add-line font-bold"></i>
              <span>Create Card Deck</span>
            </button>

            <!-- Mock Ghost/Border Button -->
            <button
              class="px-3.5 py-2 rounded-lg font-medium text-xs border flex items-center gap-1.5 transition-all"
              :style="{
                borderColor: activeTheme.accentColor,
                color: activeTheme.accentColor,
                backgroundColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 10%, transparent)'
              }"
            >
              <i class="ri-printer-line"></i>
              <span>Imposition Bleed</span>
            </button>

            <!-- Mock Tag / Badge -->
            <span
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono border"
              :style="{
                borderColor: activeTheme.borderBase,
                backgroundColor: activeTheme.bgSurface,
                color: activeTheme.textBase
              }"
            >
              <i class="ri-checkbox-circle-fill text-xs" :style="{ color: activeTheme.accentColor }"></i>
              <span>Smart Snapping ON</span>
            </span>

            <!-- Sample Card Mini Mockup -->
            <div
              class="px-3 py-1.5 rounded-md border text-[11px] font-mono flex items-center gap-2"
              :style="{
                borderColor: activeTheme.accentColor,
                backgroundColor: activeTheme.bgBase,
                color: activeTheme.textBase
              }"
            >
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: activeTheme.accentColor }"></span>
              <span>Layer 1 (Hero Box)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div
        class="px-6 py-3.5 border-t flex items-center justify-between shrink-0 text-xs"
        :style="{ borderColor: activeTheme.borderBase, backgroundColor: activeTheme.bgSurface }"
      >
        <span class="text-[11px] font-mono flex items-center gap-1.5" :style="{ color: activeTheme.textMuted }">
          <i class="ri-checkbox-circle-line" :style="{ color: activeTheme.accentColor }"></i>
          <span>Theme automatically saved to local workspace</span>
        </span>

        <button
          @click="emit('close')"
          class="px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          :style="{
            backgroundColor: activeTheme.accentColor,
            color: activeTheme.accentText
          }"
        >
          <i class="ri-check-line text-sm"></i>
          <span>Done & Apply</span>
        </button>
      </div>
    </div>
  </div>
</template>
