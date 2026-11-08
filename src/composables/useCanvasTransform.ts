import { ref } from 'vue';
import type { CanvasElement, SmartGuide } from '../types/index.ts';

export type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rot';

export function useCanvasTransform(options: {
  snapGridMm?: number;
  canvasScale?: () => number;
  canvasDimensionsMm?: () => { width: number; height: number };
  getAllElements?: () => CanvasElement[];
  onTransformStart?: () => void;
  onTransformChange?: (el: CanvasElement) => void;
  onTransformEnd?: () => void;
}) {
  const snapGrid = options.snapGridMm || 1;
  const activeTransformElement = ref<CanvasElement | null>(null);
  const activeHandle = ref<HandleType | 'drag' | null>(null);
  const activeSmartGuides = ref<SmartGuide[]>([]);

  let startPointerX = 0;
  let startPointerY = 0;
  let startElX = 0;
  let startElY = 0;
  let startElW = 0;
  let startElH = 0;

  function snap(val: number): number {
    return Math.round(val / snapGrid) * snapGrid;
  }

  function startDrag(e: MouseEvent, el: CanvasElement) {
    if (el.locked) return;
    e.stopPropagation();
    activeTransformElement.value = el;
    activeHandle.value = 'drag';
    activeSmartGuides.value = [];

    const scale = options.canvasScale ? options.canvasScale() : 1;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startElX = el.x;
    startElY = el.y;

    options.onTransformStart?.();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function startResize(e: MouseEvent, el: CanvasElement, handle: HandleType) {
    if (el.locked) return;
    e.stopPropagation();
    activeTransformElement.value = el;
    activeHandle.value = handle;
    activeSmartGuides.value = [];

    const scale = options.canvasScale ? options.canvasScale() : 1;
    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startElX = el.x;
    startElY = el.y;
    startElW = el.width;
    startElH = el.height;

    options.onTransformStart?.();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!activeTransformElement.value || !activeHandle.value) return;
    const el = activeTransformElement.value;
    const scale = options.canvasScale ? options.canvasScale() : 1;
    const deltaX = (e.clientX - startPointerX) / scale;
    const deltaY = (e.clientY - startPointerY) / scale;

    const guides: SmartGuide[] = [];

    if (activeHandle.value === 'drag') {
      let newX = snap(startElX + deltaX);
      let newY = snap(startElY + deltaY);

      // Dynamic Smart Guides Calculation
      const otherElements = options.getAllElements ? options.getAllElements().filter(o => o.id !== el.id && !o.hidden) : [];
      const canvasDims = options.canvasDimensionsMm ? options.canvasDimensionsMm() : { width: 0, height: 0 };
      const snapThreshold = 1.8; // mm

      // 1. Canvas Boundary & Center Snapping
      if (canvasDims.width > 0) {
        const canvasLeft = 0;
        const canvasRight = canvasDims.width;
        const canvasCenterX = canvasDims.width / 2;
        const elCenterX = newX + el.width / 2;
        const elRight = newX + el.width;

        // Snap to Canvas Center
        if (Math.abs(elCenterX - canvasCenterX) <= snapThreshold) {
          newX = canvasCenterX - el.width / 2;
          guides.push({ type: 'vertical', pos: canvasCenterX * scale });
        }
        // Snap to Canvas Left Margin
        else if (Math.abs(newX - canvasLeft) <= snapThreshold) {
          newX = canvasLeft;
          guides.push({ type: 'vertical', pos: canvasLeft * scale });
        }
        // Snap to Canvas Right Margin
        else if (Math.abs(elRight - canvasRight) <= snapThreshold) {
          newX = canvasRight - el.width;
          guides.push({ type: 'vertical', pos: canvasRight * scale });
        }
      }

      if (canvasDims.height > 0) {
        const canvasTop = 0;
        const canvasBottom = canvasDims.height;
        const canvasCenterY = canvasDims.height / 2;
        const elCenterY = newY + el.height / 2;
        const elBottom = newY + el.height;

        // Snap to Canvas Vertical Center
        if (Math.abs(elCenterY - canvasCenterY) <= snapThreshold) {
          newY = canvasCenterY - el.height / 2;
          guides.push({ type: 'horizontal', pos: canvasCenterY * scale });
        }
        // Snap to Canvas Top Margin
        else if (Math.abs(newY - canvasTop) <= snapThreshold) {
          newY = canvasTop;
          guides.push({ type: 'horizontal', pos: canvasTop * scale });
        }
        // Snap to Canvas Bottom Margin
        else if (Math.abs(elBottom - canvasBottom) <= snapThreshold) {
          newY = canvasBottom - el.height;
          guides.push({ type: 'horizontal', pos: canvasBottom * scale });
        }
      }

      // 2. Align to Other Sibling Elements (Object-to-Object Snapping)
      for (const other of otherElements) {
        // Horizontal Alignments (X)
        // Left to Left
        if (Math.abs(newX - other.x) <= snapThreshold) {
          newX = other.x;
          guides.push({ type: 'vertical', pos: other.x * scale });
        }
        // Right to Right
        else if (Math.abs((newX + el.width) - (other.x + other.width)) <= snapThreshold) {
          newX = other.x + other.width - el.width;
          guides.push({ type: 'vertical', pos: (other.x + other.width) * scale });
        }
        // Left to Right (Flush edge)
        else if (Math.abs(newX - (other.x + other.width)) <= snapThreshold) {
          newX = other.x + other.width;
          guides.push({ type: 'vertical', pos: (other.x + other.width) * scale });
        }
        // Right to Left (Flush edge)
        else if (Math.abs((newX + el.width) - other.x) <= snapThreshold) {
          newX = other.x - el.width;
          guides.push({ type: 'vertical', pos: other.x * scale });
        }
        // Center X to Center X
        else if (Math.abs((newX + el.width / 2) - (other.x + other.width / 2)) <= snapThreshold) {
          newX = other.x + other.width / 2 - el.width / 2;
          guides.push({ type: 'vertical', pos: (other.x + other.width / 2) * scale });
        }

        // Vertical Alignments (Y)
        // Top to Top
        if (Math.abs(newY - other.y) <= snapThreshold) {
          newY = other.y;
          guides.push({ type: 'horizontal', pos: other.y * scale });
        }
        // Bottom to Bottom
        else if (Math.abs((newY + el.height) - (other.y + other.height)) <= snapThreshold) {
          newY = other.y + other.height - el.height;
          guides.push({ type: 'horizontal', pos: (other.y + other.height) * scale });
        }
        // Top to Bottom (Flush edge)
        else if (Math.abs(newY - (other.y + other.height)) <= snapThreshold) {
          newY = other.y + other.height;
          guides.push({ type: 'horizontal', pos: (other.y + other.height) * scale });
        }
        // Bottom to Top (Flush edge)
        else if (Math.abs((newY + el.height) - other.y) <= snapThreshold) {
          newY = other.y - el.height;
          guides.push({ type: 'horizontal', pos: other.y * scale });
        }
        // Center Y to Center Y
        else if (Math.abs((newY + el.height / 2) - (other.y + other.height / 2)) <= snapThreshold) {
          newY = other.y + other.height / 2 - el.height / 2;
          guides.push({ type: 'horizontal', pos: (other.y + other.height / 2) * scale });
        }
      }

      el.x = Math.max(0, newX);
      el.y = Math.max(0, newY);
      activeSmartGuides.value = guides;
    } else if (activeHandle.value === 'rot') {
      const rad = Math.atan2(e.clientY - (startPointerY - startElH * scale / 2), e.clientX - startPointerX);
      let deg = Math.round((rad * 180) / Math.PI) + 90;
      if (e.shiftKey) {
        deg = Math.round(deg / 15) * 15;
      }
      el.rotation = (deg + 360) % 360;
    } else {
      let newW = startElW;
      let newH = startElH;
      let newX = startElX;
      let newY = startElY;

      if (activeHandle.value.includes('e')) {
        newW = Math.max(5, snap(startElW + deltaX));
      }
      if (activeHandle.value.includes('s')) {
        newH = Math.max(5, snap(startElH + deltaY));
      }
      if (activeHandle.value.includes('w')) {
        const potentialW = Math.max(5, snap(startElW - deltaX));
        newX = startElX + (startElW - potentialW);
        newW = potentialW;
      }
      if (activeHandle.value.includes('n')) {
        const potentialH = Math.max(5, snap(startElH - deltaY));
        newY = startElY + (startElH - potentialH);
        newH = potentialH;
      }

      el.x = Math.max(0, newX);
      el.y = Math.max(0, newY);
      el.width = newW;
      el.height = newH;
    }

    options.onTransformChange?.(el);
  }

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    activeHandle.value = null;
    activeTransformElement.value = null;
    activeSmartGuides.value = [];
    options.onTransformEnd?.();
  }

  return {
    startDrag,
    startResize,
    activeHandle,
    activeTransformElement,
    activeSmartGuides
  };
}
