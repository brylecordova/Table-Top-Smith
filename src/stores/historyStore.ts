import { ref, computed } from 'vue';

const undoStack = ref<string[]>([]);
const redoStack = ref<string[]>([]);
const maxHistory = 40;

export const canUndo = computed(() => undoStack.value.length > 0);
export const canRedo = computed(() => redoStack.value.length > 0);

let isApplyingHistory = false;

export function recordSnapshot(state: any) {
  if (isApplyingHistory) return;
  try {
    const serialized = JSON.stringify(state);
    if (undoStack.value.length > 0 && undoStack.value[undoStack.value.length - 1] === serialized) {
      return; // Deduplicate identical snapshots
    }
    undoStack.value.push(serialized);
    if (undoStack.value.length > maxHistory) {
      undoStack.value.shift();
    }
    redoStack.value = []; // Clear redo branch on new action
  } catch (err) {
    console.warn('Failed to snapshot state:', err);
  }
}

export function performUndo(applyCallback: (state: any) => void) {
  if (!canUndo.value) return;
  const current = undoStack.value.pop();
  if (current) {
    redoStack.value.push(current);
    const previous = undoStack.value[undoStack.value.length - 1];
    if (previous) {
      isApplyingHistory = true;
      try {
        applyCallback(JSON.parse(previous));
      } finally {
        isApplyingHistory = false;
      }
    }
  }
}

export function performRedo(applyCallback: (state: any) => void) {
  if (!canRedo.value) return;
  const next = redoStack.value.pop();
  if (next) {
    undoStack.value.push(next);
    isApplyingHistory = true;
    try {
      applyCallback(JSON.parse(next));
    } finally {
      isApplyingHistory = false;
    }
  }
}

export function clearHistory() {
  undoStack.value = [];
  redoStack.value = [];
}
