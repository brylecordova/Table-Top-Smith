<script setup lang="ts">
import { computed } from 'vue';
import type { CanvasElement } from '../../types/index.ts';
import type { HandleType } from '../../composables/useCanvasTransform.ts';

const props = defineProps<{
  element: CanvasElement;
  isSelected: boolean;
  scale: number;
}>();

const emit = defineEmits<{
  (e: 'select', el: CanvasElement): void;
  (e: 'start-drag', event: MouseEvent, el: CanvasElement): void;
  (e: 'start-resize', event: MouseEvent, el: CanvasElement, handle: HandleType): void;
}>();

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
  >
    <!-- Element Content Viewport -->
    <div
      class="w-full h-full relative overflow-hidden transition-all"
      :style="{
        borderRadius: props.element.borderRadius ? `${props.element.borderRadius * props.scale}px` : '0px',
        borderWidth: props.element.borderStyle === 'none' ? '0px' : `${(props.element.borderWidth || 0) * props.scale}px`,
        borderColor: props.element.borderColor || 'transparent',
        borderStyle: props.element.borderStyle || 'solid',
        backgroundColor: props.element.backgroundColor || 'transparent'
      }"
    >
      <!-- 1. Text Box Content -->
      <div
        v-if="props.element.type === 'text'"
        class="w-full h-full flex flex-col p-1 leading-normal overflow-hidden break-words"
        :class="props.element.verticalAlign === 'top' ? 'justify-start' : props.element.verticalAlign === 'bottom' ? 'justify-end' : 'justify-center'"
        :style="{
          fontFamily: props.element.fontFamily || 'Public Sans',
          fontSize: `${(props.element.fontSize || 12) * (props.scale / 3.8)}px`,
          fontWeight: props.element.fontWeight || 400,
          fontStyle: props.element.fontStyle || 'normal',
          textAlign: props.element.textAlign || 'left',
          color: props.element.color || '#FFFFFF',
          lineHeight: props.element.lineHeight || 1.3,
          letterSpacing: `${props.element.letterSpacing || 0}px`,
          textShadow: props.element.hasShadow ? `0px 2px 4px ${props.element.shadowColor || 'rgba(0,0,0,0.8)'}` : 'none'
        }"
      >
        {{ props.element.text || 'Add your text here...' }}
      </div>

      <!-- 2. Section Image Frame with Dual-Layer Compositing -->
      <div
        v-else-if="props.element.type === 'image-frame'"
        class="w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-900/60"
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
        class="w-full h-full flex items-center justify-center select-none"
        :style="{
          fontSize: `${Math.min(props.element.width, props.element.height) * props.scale * 0.75}px`,
          color: props.element.iconColor || '#F59E0B'
        }"
      >
        {{ props.element.iconGlyph || '⚔️' }}
      </div>

      <!-- 4. Shape Element -->
      <div
        v-else-if="props.element.type === 'shape'"
        class="w-full h-full"
      ></div>
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
