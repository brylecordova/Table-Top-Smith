<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import type { CanvasElement } from '../../types/index.ts';
import type { HandleType } from '../../composables/useCanvasTransform.ts';
import { getRemixIconClass } from '../../utils/iconHelper.ts';

const props = defineProps<{
  element: CanvasElement;
  isSelected: boolean;
  scale: number;
}>();

const emit = defineEmits<{
  (e: 'select', el: CanvasElement): void;
  (e: 'start-drag', event: MouseEvent, el: CanvasElement): void;
  (e: 'start-resize', event: MouseEvent, el: CanvasElement, handle: HandleType): void;
  (e: 'change', el: CanvasElement): void;
}>();

const isEditing = ref(false);
const editField = ref<'text' | 'placeholderLabel'>('text');
const editValue = ref('');
const textInputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);

function startEditing(field: 'text' | 'placeholderLabel' = 'text', e?: MouseEvent) {
  if (e) e.stopPropagation();
  if (props.element.locked) return;
  editField.value = field;
  editValue.value = field === 'placeholderLabel'
    ? (props.element.placeholderLabel || props.element.name || '')
    : (props.element.text || '');
  isEditing.value = true;
  nextTick(() => {
    if (textInputRef.value) {
      textInputRef.value.focus();
      textInputRef.value.select();
    }
  });
}

function finishEditing() {
  if (!isEditing.value) return;
  if (editField.value === 'placeholderLabel') {
    props.element.placeholderLabel = editValue.value;
  } else {
    props.element.text = editValue.value;
  }
  isEditing.value = false;
  emit('change', props.element);
}

function handleEnter(e: KeyboardEvent) {
  if (editField.value === 'text' && e.shiftKey) {
    return; // allow newline on Shift+Enter
  }
  e.preventDefault();
  finishEditing();
}

function cancelEditing() {
  isEditing.value = false;
}

function handleContainerDblClick(e: MouseEvent) {
  e.stopPropagation();
  if (props.element.type === 'text') {
    startEditing('text', e);
  } else if (props.element.type === 'shape') {
    if (props.element.text) {
      startEditing('text', e);
    } else {
      startEditing('placeholderLabel', e);
    }
  }
}

const transformStyle = computed(() => {
  const el = props.element;
  return {
    left: `${el.x * props.scale}px`,
    top: `${el.y * props.scale}px`,
    width: `${el.width * props.scale}px`,
    height: `${el.height * props.scale}px`,
    transform: `rotate(${el.rotation || 0}deg)`,
    transformOrigin: 'center center',
    zIndex: el.zIndex || 1,
    opacity: el.opacity !== undefined ? el.opacity : 1,
    display: el.hidden ? 'none' : 'block'
  };
});

const isPolygonShape = computed(() => {
  return props.element.type === 'shape' && (props.element.shapeType === 'hex' || props.element.shapeType === 'badge');
});

function handleMouseDown(e: MouseEvent) {
  emit('select', props.element);
  emit('start-drag', e, props.element);
}

function handleResize(e: MouseEvent, handle: HandleType) {
  emit('start-resize', e, props.element, handle);
}
</script>

<template>
  <div
    class="absolute select-none cursor-move group"
    :style="transformStyle"
    @mousedown="handleMouseDown"
    @dblclick="handleContainerDblClick"
  >
    <!-- Element Content Viewport -->
    <div
      class="w-full h-full relative overflow-hidden transition-all"
      :style="{
        borderRadius: props.element.shapeType === 'circle'
          ? '9999px'
          : props.element.borderRadius ? `${props.element.borderRadius * props.scale}px` : '0px',
        borderWidth: isPolygonShape || props.element.borderStyle === 'none' ? '0px' : `${(props.element.borderWidth || 0) * props.scale}px`,
        borderColor: isPolygonShape ? 'transparent' : (props.element.borderColor || 'transparent'),
        borderStyle: props.element.borderStyle || 'solid',
        backgroundColor: isPolygonShape ? 'transparent' : (props.element.backgroundColor || 'transparent')
      }"
    >
      <!-- SVG Polygon for Hexagonal & Shield Badge Shapes (Strict Border & Edge Tracing) -->
      <svg
        v-if="isPolygonShape"
        class="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          :points="props.element.shapeType === 'hex' ? '50,0 100,25 100,75 50,100 0,75 0,25' : '50,0 100,0 100,70 50,100 0,70 0,0'"
          :fill="props.element.backgroundColor || '#1E293B'"
          :stroke="props.element.borderStyle === 'none' ? 'none' : (props.element.borderColor || '#F59E0B')"
          :stroke-width="props.element.borderStyle === 'none' ? 0 : Math.max(1, (props.element.borderWidth || 1) * props.scale * 0.8)"
          :stroke-dasharray="props.element.borderStyle === 'dashed' ? '6,3' : props.element.borderStyle === 'dotted' ? '2,2' : undefined"
          vector-effect="non-scaling-stroke"
        />
      </svg>

      <!-- 1. Text Box Content (Supports double-click inline editing) -->
      <div
        v-if="props.element.type === 'text'"
        class="w-full h-full flex flex-col p-1 leading-normal overflow-hidden break-words whitespace-pre-wrap transition-colors z-10"
        :class="props.element.verticalAlign === 'top' ? 'justify-start' : props.element.verticalAlign === 'bottom' ? 'justify-end' : 'justify-center'"
        :style="{
          fontFamily: props.element.fontFamily ? `${props.element.fontFamily}, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif` : `'Public Sans', 'Apple Color Emoji', sans-serif`,
          fontSize: `${(props.element.fontSize || 12) * (props.scale / 3.8)}px`,
          fontWeight: props.element.fontWeight || 400,
          fontStyle: props.element.fontStyle || 'normal',
          textAlign: props.element.textAlign || 'left',
          color: props.element.color || '#FFFFFF',
          lineHeight: props.element.lineHeight || 1.3,
          letterSpacing: `${props.element.letterSpacing || 0}px`,
          textShadow: props.element.hasShadow ? `0px 2px 4px ${props.element.shadowColor || 'rgba(0,0,0,0.8)'}` : 'none',
          backgroundColor: (props.element.textHasBackground !== false && props.element.textBackgroundColor && props.element.textBackgroundColor !== 'transparent')
            ? props.element.textBackgroundColor
            : 'transparent'
        }"
        @dblclick.stop="startEditing('text', $event)"
      >
        <textarea
          v-if="isEditing && editField === 'text'"
          ref="textInputRef"
          v-model="editValue"
          class="w-full h-full bg-slate-950/95 text-white border-2 border-amber-400 rounded p-1 outline-none resize-none shadow-xl ring-2 ring-amber-400/40 select-text cursor-text"
          :style="{
            fontFamily: props.element.fontFamily ? `${props.element.fontFamily}, sans-serif` : 'inherit',
            fontSize: `${(props.element.fontSize || 12) * (props.scale / 3.8)}px`,
            textAlign: props.element.textAlign || 'left',
            color: props.element.color || '#FFFFFF',
            fontWeight: props.element.fontWeight || 400
          }"
          @blur="finishEditing"
          @keydown="e => { if (e.key === 'Enter' && !e.shiftKey) { handleEnter(e); } else if (e.key === 'Escape') { cancelEditing(); } }"
          @mousedown.stop
          @click.stop
        ></textarea>
        <template v-else>
          {{ props.element.text || 'Double-click to edit text...' }}
        </template>
      </div>

      <!-- 2. Section Image Frame with Dual-Layer Compositing -->
      <div
        v-else-if="props.element.type === 'image-frame'"
        class="w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-900/60 z-10"
      >
        <!-- Background Layer -->
        <div
          v-if="props.element.bgImageUrl"
          class="absolute inset-0 bg-cover bg-center pointer-events-none"
          :style="{ backgroundImage: `url(${props.element.bgImageUrl})` }"
        ></div>

        <!-- Foreground Cutout Layer -->
        <div
          v-if="props.element.fgImageUrl"
          class="absolute inset-0 bg-contain bg-center bg-no-repeat pointer-events-none z-10"
          :style="{ backgroundImage: `url(${props.element.fgImageUrl})` }"
        ></div>

        <!-- Placeholder if no image set -->
        <div
          v-if="!props.element.bgImageUrl && !props.element.fgImageUrl"
          class="text-slate-500 font-mono text-[9px] flex flex-col items-center justify-center gap-1 p-2 text-center"
        >
          <span class="text-xl">🖼️</span>
          <span>{{ props.element.borderStyle === 'none' ? 'Invisible Frame' : 'Image Frame' }}</span>
        </div>
      </div>

      <!-- 3. Icon Element -->
      <div
        v-else-if="props.element.type === 'icon'"
        class="w-full h-full flex items-center justify-center select-none z-10"
        :style="{
          fontSize: `${Math.min(props.element.width, props.element.height) * props.scale * 0.75}px`,
          color: props.element.iconColor || '#F59E0B'
        }"
      >
        <i v-if="props.element.iconCssClass" :class="props.element.iconCssClass" class="leading-none"></i>
        <i v-else-if="getRemixIconClass(props.element.iconGlyph)" :class="getRemixIconClass(props.element.iconGlyph)" class="leading-none text-amber-400"></i>
        <span v-else>{{ props.element.iconGlyph || '⚔️' }}</span>
      </div>

      <!-- 4. Shape & Placeholder Box Element -->
      <div
        v-else-if="props.element.type === 'shape'"
        class="w-full h-full relative flex flex-col items-center justify-center p-2 text-center overflow-hidden transition-all z-10"
        :style="{
          clipPath: props.element.shapeType === 'hex'
            ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            : props.element.shapeType === 'badge'
            ? 'polygon(50% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%, 0% 0%)'
            : 'none',
          borderRadius: props.element.shapeType === 'circle'
            ? '9999px'
            : props.element.borderRadius ? `${props.element.borderRadius * props.scale}px` : '0px'
        }"
      >
        <!-- Background Image if set on shape -->
        <div
          v-if="props.element.bgImageUrl"
          class="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40"
          :style="{ backgroundImage: `url(${props.element.bgImageUrl})` }"
        ></div>

        <!-- EXPLORATION TILE FLIP: REVEALED FACE -->
        <template v-if="props.element.isFlipped">
          <div
            class="w-full h-full flex flex-col items-center justify-center p-2 relative z-10 animate-fade-in"
            :style="{ backgroundColor: props.element.flippedColor || 'rgba(245, 158, 11, 0.15)' }"
          >
            <i v-if="props.element.flippedIcon && getRemixIconClass(props.element.flippedIcon)" :class="[getRemixIconClass(props.element.flippedIcon), 'text-2xl mb-1 filter drop-shadow']"></i>
            <span v-else class="text-2xl mb-1 filter drop-shadow">{{ props.element.flippedIcon || '✨' }}</span>
            <span
              class="font-bold uppercase tracking-wider font-display truncate max-w-full"
              :style="{
                fontSize: `${Math.max(9, Math.min(props.element.width, props.element.height) * props.scale * 0.14)}px`,
                color: props.element.flippedColor || '#F59E0B'
              }"
            >
              {{ props.element.flippedTitle || 'Revealed Zone' }}
            </span>
            <span
              v-if="props.element.flippedDescription"
              class="text-[9px] text-slate-300 font-sans line-clamp-2 mt-0.5 leading-tight"
            >
              {{ props.element.flippedDescription }}
            </span>
            <div class="mt-1 px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
              REVEALED TILE
            </div>
          </div>
        </template>

        <!-- NORMAL / UNEXPLORED / PLACEHOLDER FACE -->
        <template v-else>
          <!-- Hex Exploration Tile Default State -->
          <div v-if="props.element.shapeType === 'hex'" class="flex flex-col items-center justify-center p-1.5 z-10 w-full h-full" @dblclick.stop="startEditing('placeholderLabel', $event)">
            <i v-if="props.element.iconCssClass" :class="[props.element.iconCssClass, 'text-2xl filter drop-shadow']"></i>
            <i v-else-if="getRemixIconClass(props.element.iconGlyph)" :class="[getRemixIconClass(props.element.iconGlyph), 'text-2xl filter drop-shadow']"></i>
            <span v-else class="text-2xl filter drop-shadow">{{ props.element.iconGlyph || '🌫️' }}</span>
            <input
              v-if="isEditing && editField === 'placeholderLabel'"
              ref="textInputRef"
              v-model="editValue"
              class="w-full bg-slate-950/95 border-2 border-amber-400 rounded px-1.5 py-0.5 text-center outline-none text-white font-display text-xs shadow-lg ring-2 ring-amber-400/40 select-text cursor-text"
              @blur="finishEditing"
              @keydown="e => { if (e.key === 'Enter') { handleEnter(e); } else if (e.key === 'Escape') { cancelEditing(); } }"
              @mousedown.stop
              @click.stop
            />
            <span
              v-else
              class="font-display font-semibold uppercase tracking-wider truncate max-w-full text-white mt-0.5 cursor-pointer hover:text-amber-300"
              :style="{
                fontSize: `${Math.max(8, (props.element.fontSize || Math.min(props.element.width, props.element.height) * 0.12) * props.scale)}px`,
                fontFamily: props.element.fontFamily ? `${props.element.fontFamily}, 'Apple Color Emoji', sans-serif` : 'Outfit',
                color: props.element.color || '#FFFFFF'
              }"
              title="Double-click to edit label"
            >
              {{ props.element.placeholderLabel || props.element.name || 'Hex Tile' }}
            </span>
            <span
              v-if="props.element.text"
              class="text-[9px] text-slate-300 font-sans mt-0.5 truncate max-w-full cursor-pointer hover:text-white"
              :style="{ color: props.element.color || '#E2E8F0' }"
              @dblclick.stop="startEditing('text', $event)"
              title="Double-click to edit subtext"
            >
              {{ props.element.text }}
            </span>
          </div>

          <!-- Structured Placeholder Box (Header, Footer, Portrait, Rules Effect, HP, Marker) -->
          <div
            v-else
            class="flex flex-col items-center justify-center w-full h-full p-1 z-10"
            :style="{
              fontFamily: props.element.fontFamily ? `${props.element.fontFamily}, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif` : `'Public Sans', 'Apple Color Emoji', sans-serif`,
              textAlign: props.element.textAlign || 'center'
            }"
          >
            <!-- Icon if present -->
            <i v-if="props.element.iconCssClass" :class="[props.element.iconCssClass, 'text-xl mb-0.5 filter drop-shadow']"></i>
            <i v-else-if="getRemixIconClass(props.element.iconGlyph)" :class="[getRemixIconClass(props.element.iconGlyph), 'text-xl mb-0.5 filter drop-shadow']"></i>
            <span v-else-if="props.element.iconGlyph" class="text-xl mb-0.5 filter drop-shadow">
              {{ props.element.iconGlyph }}
            </span>

            <!-- Placeholder Tag / Type Badge (With Background Container Fill Toggle) -->
            <div
              v-if="props.element.showPlaceholderLabel !== false"
              class="flex items-center gap-1 font-mono uppercase tracking-wider px-2 py-0.5 rounded transition-colors max-w-full truncate"
              :class="[
                props.element.textHasBackground === false || props.element.textBackgroundColor === 'transparent'
                  ? 'bg-transparent border-transparent'
                  : 'bg-slate-900/80 border border-slate-700/80 shadow-xs'
              ]"
              :style="{
                fontSize: `${Math.max(9, (props.element.fontSize || 10) * (props.scale / 3.8))}px`,
                fontWeight: props.element.fontWeight || 600,
                color: props.element.color || '#FBBF24',
                backgroundColor: (props.element.textHasBackground !== false && props.element.textBackgroundColor && props.element.textBackgroundColor !== 'transparent')
                  ? props.element.textBackgroundColor
                  : undefined,
                borderColor: (props.element.textHasBackground === false || props.element.textBackgroundColor === 'transparent')
                  ? 'transparent'
                  : undefined
              }"
              @dblclick.stop="startEditing('placeholderLabel', $event)"
              title="Double-click to edit label"
            >
              <input
                v-if="isEditing && editField === 'placeholderLabel'"
                ref="textInputRef"
                v-model="editValue"
                class="w-full bg-slate-950/95 border-2 border-amber-400 rounded px-1 text-center outline-none text-white text-[10px] shadow-lg ring-2 ring-amber-400/40 select-text cursor-text"
                @blur="finishEditing"
                @keydown="e => { if (e.key === 'Enter') { handleEnter(e); } else if (e.key === 'Escape') { cancelEditing(); } }"
                @mousedown.stop
                @click.stop
              />
              <template v-else>
                <span
                  v-if="props.element.textHasBackground !== false && props.element.textBackgroundColor !== 'transparent'"
                  class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                ></span>
                <span class="truncate">{{ props.element.placeholderLabel || props.element.name || 'Placeholder Box' }}</span>
              </template>
            </div>

            <!-- Optional Subtext / Rule snippet -->
            <div
              v-if="props.element.text || (isEditing && editField === 'text')"
              class="mt-1 line-clamp-2 px-1 break-words whitespace-pre-wrap w-full"
              :style="{
                fontSize: `${Math.max(8, ((props.element.fontSize || 10) * 0.9) * (props.scale / 3.8))}px`,
                color: props.element.color || '#F8FAFC',
                fontFamily: props.element.fontFamily || 'inherit',
                fontWeight: props.element.fontWeight || 400
              }"
              @dblclick.stop="startEditing('text', $event)"
              title="Double-click to edit text"
            >
              <textarea
                v-if="isEditing && editField === 'text'"
                ref="textInputRef"
                v-model="editValue"
                rows="2"
                class="w-full bg-slate-950/95 border-2 border-amber-400 rounded p-1 outline-none resize-none text-white text-[10px] shadow-lg ring-2 ring-amber-400/40 select-text cursor-text"
                @blur="finishEditing"
                @keydown="e => { if (e.key === 'Enter' && !e.shiftKey) { handleEnter(e); } else if (e.key === 'Escape') { cancelEditing(); } }"
                @mousedown.stop
                @click.stop
              ></textarea>
              <template v-else>
                {{ props.element.text }}
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Active Selection Bounding Box & 8 Handles + Rotation -->
    <template v-if="props.isSelected && !props.element.locked">
      <!-- Outer Selection Border -->
      <div class="absolute -inset-0.5 border-2 border-amber-400 pointer-events-none z-30"></div>

      <!-- Rotation Stalk & Anchor Handle -->
      <div class="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-40">
        <div
          class="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-slate-900 cursor-grab hover:scale-125 transition-transform shadow-md"
          title="Rotate Element (Hold Shift for 15° snap)"
          @mousedown.stop="handleResize($event, 'rot')"
        ></div>
        <div class="w-0.5 h-3 bg-amber-400"></div>
      </div>

      <!-- Flip Tile Quick Toggle for Hex / Exploration tiles -->
      <button
        v-if="props.element.shapeType === 'hex' || props.element.flippedTitle !== undefined"
        @mousedown.stop="props.element.isFlipped = !props.element.isFlipped"
        class="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] font-mono shadow-lg flex items-center gap-1 z-50 whitespace-nowrap cursor-pointer transition-transform hover:scale-105"
        title="Flip exploration tile"
      >
        <i class="ri-refresh-line text-xs"></i>
        <span>{{ props.element.isFlipped ? 'Unflip Tile' : 'Flip & Reveal' }}</span>
      </button>

      <!-- 8-Point Resize Handles -->
      <!-- Top-Left -->
      <div
        class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs cursor-nwse-resize z-40 hover:scale-125"
        @mousedown.stop="handleResize($event, 'nw')"
      ></div>
      <!-- Top-Center -->
      <div
        class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs cursor-ns-resize z-40 hover:scale-125"
        @mousedown.stop="handleResize($event, 'n')"
      ></div>
      <!-- Top-Right -->
      <div
        class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs cursor-nesw-resize z-40 hover:scale-125"
        @mousedown.stop="handleResize($event, 'ne')"
      ></div>
      <!-- Middle-Right -->
      <div
        class="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs cursor-ew-resize z-40 hover:scale-125"
        @mousedown.stop="handleResize($event, 'e')"
      ></div>
      <!-- Bottom-Right -->
      <div
        class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs cursor-nwse-resize z-40 hover:scale-125"
        @mousedown.stop="handleResize($event, 'se')"
      ></div>
      <!-- Bottom-Center -->
      <div
        class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs cursor-ns-resize z-40 hover:scale-125"
        @mousedown.stop="handleResize($event, 's')"
      ></div>
      <!-- Bottom-Left -->
      <div
        class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs cursor-nesw-resize z-40 hover:scale-125"
        @mousedown.stop="handleResize($event, 'sw')"
      ></div>
      <!-- Middle-Left -->
      <div
        class="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-xs cursor-ew-resize z-40 hover:scale-125"
        @mousedown.stop="handleResize($event, 'w')"
      ></div>
    </template>
  </div>
</template>
