<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  cardGroups,
  selectedGroupId,
  selectedCardId,
  activeCardGroup,
  activeCard,
  saveCardGroup,
  showToast,
  createCardGroup,
  renameCardGroup,
  deleteCardGroup,
  addCardToGroup,
  deleteCard
} from '../../stores/projectStore.ts';
import {
  recordSnapshot,
  performUndo,
  performRedo
} from '../../stores/historyStore.ts';

const showCreateGroupModal = ref(false);
const newGroupName = ref('');
const newGroupSize = ref<'poker' | 'bridge' | 'tarot' | 'mini'>('poker');

const showRenameGroupModal = ref(false);
const renameGroupName = ref('');

function openCreateGroup() {
  newGroupName.value = `Deck ${cardGroups.value.length + 1}`;
  newGroupSize.value = 'poker';
  showCreateGroupModal.value = true;
}

async function confirmCreateGroup() {
  if (!newGroupName.value.trim()) return;
  const sizeMap = {
    poker: { width: 63.5, height: 88.9, cornerRadius: 3 },
    bridge: { width: 57, height: 88.9, cornerRadius: 3 },
    tarot: { width: 70, height: 120, cornerRadius: 4 },
    mini: { width: 44, height: 67, cornerRadius: 2.5 }
  };
  await createCardGroup(newGroupName.value.trim(), sizeMap[newGroupSize.value]);
  showCreateGroupModal.value = false;
}

function openRenameGroup() {
  if (!activeCardGroup.value) return;
  renameGroupName.value = activeCardGroup.value.name;
  showRenameGroupModal.value = true;
}

async function confirmRenameGroup() {
  if (!activeCardGroup.value || !renameGroupName.value.trim()) return;
  await renameCardGroup(activeCardGroup.value._id, renameGroupName.value.trim());
  showRenameGroupModal.value = false;
}

async function confirmDeleteGroup() {
  if (!activeCardGroup.value) return;
  if (confirm(`Are you sure you want to delete card group "${activeCardGroup.value.name}" and all its cards?`)) {
    await deleteCardGroup(activeCardGroup.value._id);
  }
}

async function handleAddNewCard() {
  if (!activeCardGroup.value) return;
  await addCardToGroup(activeCardGroup.value._id);
}

async function handleDeleteCard(cardId: string) {
  if (!activeCardGroup.value) return;
  if (activeCardGroup.value.cards.length <= 1) {
    showToast('A card group must have at least one card.');
    return;
  }
  await deleteCard(activeCardGroup.value._id, cardId);
}

import type { CardItem, CardGroup, CanvasElement, TabletopIcon, AssetItem, ShapeType, PlaceholderPreset } from '../../types/index.ts';
import { getRemixIconClass } from '../../utils/iconHelper.ts';
import TransformBox from '../common/TransformBox.vue';
import AlignmentBar from '../common/AlignmentBar.vue';
import ElementInspector from '../common/ElementInspector.vue';
import LayerPanel from '../common/LayerPanel.vue';
import IconPickerModal from '../common/IconPickerModal.vue';
import { useCanvasTransform } from '../../composables/useCanvasTransform.ts';

const currentFace = ref<'front' | 'back'>('front');
const showCsvModal = ref(false);
const showIconModal = ref(false);
const showBlankConfirmModal = ref(false);
const selectedElementId = ref<string | null>(null);

const zoomLevel = ref<number>(1);
const canvasScale = computed(() => 3.8 * zoomLevel.value);

function handleZoomIn() {
  zoomLevel.value = Math.min(3, +(zoomLevel.value + 0.25).toFixed(2));
}

function handleZoomOut() {
  zoomLevel.value = Math.max(0.5, +(zoomLevel.value - 0.25).toFixed(2));
}

function handleZoomReset() {
  zoomLevel.value = 1;
}

// Elements on current face (Card Front vs Card Back)
const currentElements = computed(() => {
  if (!activeCard.value) return [];
  if (currentFace.value === 'front') {
    if (!activeCard.value.elements) {
      activeCard.value.elements = [];
    }
    return activeCard.value.elements;
  } else {
    if (!activeCardGroup.value) return [];
    if (!activeCardGroup.value.cardBack.elements) {
      activeCardGroup.value.cardBack.elements = [];
    }
    return activeCardGroup.value.cardBack.elements;
  }
});

// Transform Composable with Dynamic Smart Guides
const { startDrag, startResize, activeSmartGuides } = useCanvasTransform({
  snapGridMm: 1,
  canvasScale: () => canvasScale.value,
  canvasDimensionsMm: () => ({
    width: activeCardGroup.value?.dimensions.width || 63.5,
    height: activeCardGroup.value?.dimensions.height || 88.9
  }),
  getAllElements: () => currentElements.value,
  onTransformStart: () => snapshotState(),
  onTransformEnd: () => persistChanges()
});

// Current active element
const activeElement = computed(() => {
  return currentElements.value.find(el => el.id === selectedElementId.value) || null;
});

function snapshotState() {
  if (activeCard.value) {
    recordSnapshot({
      cards: JSON.parse(JSON.stringify(activeCardGroup.value?.cards || [])),
      cardBack: JSON.parse(JSON.stringify(activeCardGroup.value?.cardBack || {}))
    });
  }
}

function persistChanges() {
  if (activeCardGroup.value) {
    saveCardGroup(activeCardGroup.value);
  }
}

function handleUndo() {
  performUndo((snapshot) => {
    if (activeCardGroup.value && snapshot) {
      if (snapshot.cards) activeCardGroup.value.cards = snapshot.cards;
      if (snapshot.cardBack) activeCardGroup.value.cardBack = snapshot.cardBack;
      showToast('Undo successful');
    }
  });
}

function handleRedo() {
  performRedo((snapshot) => {
    if (activeCardGroup.value && snapshot) {
      if (snapshot.cards) activeCardGroup.value.cards = snapshot.cards;
      if (snapshot.cardBack) activeCardGroup.value.cardBack = snapshot.cardBack;
      showToast('Redo successful');
    }
  });
}

// Add Text Box
function handleAddText() {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_txt_${Date.now()}`,
    name: 'Text Box',
    type: 'text',
    x: 6,
    y: 10,
    width: 48,
    height: 12,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    text: 'Editable Text Element',
    fontFamily: 'Public Sans',
    fontSize: 11,
    fontWeight: 600,
    fontStyle: 'normal',
    textAlign: 'left',
    verticalAlign: 'middle',
    color: '#F8FAFC',
    lineHeight: 1.3,
    hasShadow: true,
    shadowColor: 'rgba(0,0,0,0.85)'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast('Added editable text element');
}

// Add Section Image Frame
function handleAddImageFrame(prefilledUrl = '') {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_img_${Date.now()}`,
    name: 'Portrait Image Frame',
    type: 'image-frame',
    x: 5,
    y: 16,
    width: 53.5,
    height: 36,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    bgImageUrl: prefilledUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    fgImageUrl: '',
    imageFit: 'cover',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderStyle: 'solid',
    borderRadius: 3,
    backgroundColor: '#0F172A'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast('Added image frame');
}

// Add Icon
function handleAddIconElement(icon: TabletopIcon) {
  snapshotState();
  const newEl: CanvasElement = {
    id: `el_ico_${Date.now()}`,
    name: `${icon.name} Icon`,
    type: 'icon',
    x: 8,
    y: 8,
    width: 14,
    height: 14,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    iconGlyph: icon.glyph,
    iconCssClass: icon.cssClass,
    iconColor: '#F59E0B'
  };
  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast(`Added ${icon.name} icon element`);
}

function handleInsertInlineIcon(icon: TabletopIcon) {
  snapshotState();
  if (activeElement.value) {
    if (activeElement.value.type === 'text' || activeElement.value.type === 'shape') {
      activeElement.value.text = (activeElement.value.text || '') + (activeElement.value.text ? ' ' : '') + icon.glyph;
      if (activeElement.value.type === 'shape' && !activeElement.value.iconGlyph) {
        activeElement.value.iconGlyph = icon.glyph;
        activeElement.value.iconCssClass = icon.cssClass;
      }
    } else if (activeElement.value.type === 'icon') {
      activeElement.value.iconGlyph = icon.glyph;
      activeElement.value.iconCssClass = icon.cssClass;
      activeElement.value.name = `${icon.name} Emblem`;
    }
    persistChanges();
    showToast(`Inserted ${icon.glyph} into ${activeElement.value.name}`);
  } else {
    const newEl: CanvasElement = {
      id: `el_txt_${Date.now()}`,
      name: `${icon.name} Text`,
      type: 'text',
      x: 10,
      y: 10,
      width: 45,
      height: 12,
      rotation: 0,
      zIndex: currentElements.value.length + 1,
      locked: false,
      hidden: false,
      opacity: 1,
      text: `${icon.glyph} ${icon.name}`,
      fontFamily: 'Outfit',
      fontSize: 12,
      fontWeight: 600,
      fontStyle: 'normal',
      textAlign: 'center',
      color: '#FFFFFF',
      lineHeight: 1.2
    };
    currentElements.value.push(newEl);
    selectedElementId.value = newEl.id;
    persistChanges();
    showToast(`Added text element with ${icon.glyph}`);
  }
}

function handleSetPortraitIcon(icon: TabletopIcon) {
  if (activeCard.value) {
    snapshotState();
    activeCard.value.artIcon = icon.cssClass || icon.glyph;
    persistChanges();
    showToast(`Set card icon to ${icon.name}`);
  } else {
    handleAddIconElement(icon);
  }
}

// Alignment
function handleAlign(direction: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') {
  if (!activeElement.value || !activeCardGroup.value) return;
  snapshotState();
  const el = activeElement.value;
  const cardW = activeCardGroup.value.dimensions.width;
  const cardH = activeCardGroup.value.dimensions.height;

  if (direction === 'left') el.x = 4;
  else if (direction === 'center-h') el.x = Math.round((cardW - el.width) / 2);
  else if (direction === 'right') el.x = Math.round(cardW - el.width - 4);
  else if (direction === 'top') el.y = 4;
  else if (direction === 'center-v') el.y = Math.round((cardH - el.height) / 2);
  else if (direction === 'bottom') el.y = Math.round(cardH - el.height - 4);

  persistChanges();
  showToast(`Aligned ${direction}`);
}

function handleDuplicateElement() {
  if (!activeElement.value) return;
  snapshotState();
  const clone: CanvasElement = {
    ...JSON.parse(JSON.stringify(activeElement.value)),
    id: `el_clone_${Date.now()}`,
    name: `${activeElement.value.name} (Copy)`,
    x: activeElement.value.x + 3,
    y: activeElement.value.y + 3,
    zIndex: currentElements.value.length + 1
  };
  currentElements.value.push(clone);
  selectedElementId.value = clone.id;
  persistChanges();
  showToast('Duplicated element');
}

function handleDeleteElement(id: string) {
  snapshotState();
  const index = currentElements.value.findIndex(el => el.id === id);
  if (index >= 0) {
    currentElements.value.splice(index, 1);
    selectedElementId.value = null;
    persistChanges();
    showToast('Deleted element');
  }
}

// Drag & Drop asset from Persistent Asset Manager
function handleCanvasDrop(e: DragEvent) {
  e.preventDefault();
  const rawAsset = e.dataTransfer?.getData('application/json');
  const rawUrl = e.dataTransfer?.getData('text/plain');

  if (rawAsset) {
    try {
      const asset: AssetItem = JSON.parse(rawAsset);
      if (activeElement.value && activeElement.value.type === 'image-frame') {
        snapshotState();
        activeElement.value.bgImageUrl = asset.url;
        persistChanges();
        showToast(`Applied ${asset.name} to frame!`);
        return;
      }
      handleAddImageFrame(asset.url);
      return;
    } catch (e) {}
  }

  if (rawUrl) {
    if (activeElement.value && activeElement.value.type === 'image-frame') {
      snapshotState();
      activeElement.value.bgImageUrl = rawUrl;
      persistChanges();
      showToast('Applied image to frame!');
      return;
    }
    handleAddImageFrame(rawUrl);
  }
}

// Add Placeholder Box (Headers, Footers, Portraits, Rules/Effects, HP, etc.)
function handleAddBox(preset: { shapeType: ShapeType; placeholderType: PlaceholderPreset; label: string; icon?: string }) {
  snapshotState();
  let w = 55.5;
  let h = 20;
  let x = 4;
  let y = 30;
  let bg = 'rgba(30, 41, 59, 0.7)';
  let border = '#334155';
  let bWidth = 1;
  let bStyle: 'solid' | 'dashed' | 'dotted' | 'none' = 'solid';
  let radius = 2;
  let icon = preset.icon || '';

  if (preset.placeholderType === 'header') {
    h = 9;
    y = 4;
    bg = '#0F172A';
    border = '#F59E0B';
    bWidth = 1.5;
    icon = '🏷️';
  } else if (preset.placeholderType === 'footer') {
    h = 7;
    y = 79;
    bg = '#0B0F17';
    border = '#334155';
    icon = '📑';
  } else if (preset.placeholderType === 'portrait') {
    h = 36;
    y = 15;
    bg = '#1E293B';
    border = '#F59E0B';
    bStyle = 'dashed';
    bWidth = 1.5;
    radius = 3;
    icon = '🖼️';
  } else if (preset.placeholderType === 'effect') {
    h = 22;
    y = 54;
    bg = 'rgba(15, 23, 42, 0.85)';
    border = '#475569';
    icon = '📜';
  } else if (preset.placeholderType === 'hp') {
    w = 11;
    h = 11;
    x = 48.5;
    y = 4;
    bg = '#DC2626';
    border = '#991B1B';
    radius = 2;
    icon = '❤️';
  } else if (preset.shapeType === 'hex') {
    w = 26;
    h = 26;
    x = 18;
    y = 30;
    bg = '#1E293B';
    border = '#F59E0B';
    bWidth = 2;
    icon = '⬢';
  } else if (preset.shapeType === 'circle') {
    w = 16;
    h = 16;
    x = 23;
    y = 35;
    bg = '#D97706';
    border = '#B45309';
    radius = 9999;
    icon = '🪙';
  }

  const newEl: CanvasElement = {
    id: `el_box_${Date.now()}`,
    name: preset.label,
    type: 'shape',
    shapeType: preset.shapeType,
    placeholderType: preset.placeholderType,
    placeholderLabel: preset.label,
    showPlaceholderLabel: true,
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    zIndex: currentElements.value.length + 1,
    locked: false,
    hidden: false,
    opacity: 1,
    backgroundColor: bg,
    borderColor: border,
    borderWidth: bWidth,
    borderStyle: bStyle,
    borderRadius: radius,
    iconGlyph: icon,
    isFlipped: false
  };

  currentElements.value.push(newEl);
  selectedElementId.value = newEl.id;
  persistChanges();
  showToast(`Added ${preset.label} placeholder box`);
}

// Prompt confirmation before blanking the card
function handleBlankCanvas() {
  const count = currentElements.value.length;
  if (count === 0) {
    showToast(`Card ${currentFace.value} is already blank.`);
    return;
  }
  // Open stylish in-app confirmation modal
  showBlankConfirmModal.value = true;
}

function confirmExecuteBlankCanvas() {
  snapshotState();
  if (currentFace.value === 'front' && activeCard.value) {
    activeCard.value.elements = [];
  } else if (currentFace.value === 'back' && activeCardGroup.value) {
    activeCardGroup.value.cardBack.elements = [];
  }
  selectedElementId.value = null;
  persistChanges();
  showBlankConfirmModal.value = false;
  showToast(`Card ${currentFace.value} cleared to blank canvas!`);
}

// Apply Card Front Template
function applyCardTemplate() {
  if (!activeCard.value) return;
  const card = activeCard.value;
  activeCard.value.elements = [
    // 1. Header Title Text Box
    {
      id: 'el_title',
      name: 'Card Title Box',
      type: 'text',
      x: 4,
      y: 4,
      width: 44,
      height: 9,
      rotation: 0,
      zIndex: 5,
      locked: false,
      hidden: false,
      opacity: 1,
      text: card.name,
      fontFamily: 'Outfit',
      fontSize: 12,
      fontWeight: 700,
      fontStyle: 'normal',
      textAlign: 'left',
      verticalAlign: 'middle',
      color: '#FFFFFF',
      lineHeight: 1.1,
      hasShadow: true,
      shadowColor: 'rgba(0,0,0,0.95)'
    },
    // 2. Cost / HP Badge
    {
      id: 'el_cost',
      name: 'Cost Badge',
      type: 'text',
      x: 49,
      y: 4,
      width: 10,
      height: 9,
      rotation: 0,
      zIndex: 6,
      locked: false,
      hidden: false,
      opacity: 1,
      text: String(card.cost || '1'),
      fontFamily: 'JetBrains Mono',
      fontSize: 12,
      fontWeight: 900,
      fontStyle: 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
      color: '#0F172A',
      lineHeight: 1,
      backgroundColor: '#F59E0B',
      borderRadius: 2,
      borderWidth: 1,
      borderColor: '#B45309',
      borderStyle: 'solid'
    },
    // 3. Portrait Image Frame
    {
      id: 'el_portrait',
      name: 'Portrait Frame',
      type: 'image-frame',
      x: 4,
      y: 15,
      width: 55.5,
      height: 38,
      rotation: 0,
      zIndex: 1,
      locked: false,
      hidden: false,
      opacity: 1,
      bgImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      fgImageUrl: '',
      imageFit: 'cover',
      borderWidth: 1.5,
      borderColor: '#F59E0B',
      borderStyle: 'solid',
      borderRadius: 2.5,
      backgroundColor: '#0F172A'
    },
    // 4. Type & Stats Banner
    {
      id: 'el_stats',
      name: 'Type & Stats Banner',
      type: 'text',
      x: 4,
      y: 54,
      width: 55.5,
      height: 6.5,
      rotation: 0,
      zIndex: 4,
      locked: false,
      hidden: false,
      opacity: 1,
      text: `${card.type} · ${card.stats}`,
      fontFamily: 'JetBrains Mono',
      fontSize: 8.5,
      fontWeight: 700,
      fontStyle: 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
      color: '#F59E0B',
      backgroundColor: '#0B0F17',
      borderWidth: 1,
      borderColor: '#334155',
      borderStyle: 'solid',
      borderRadius: 1.5
    },
    // 5. Rules Text Box
    {
      id: 'el_rules',
      name: 'Rules Text Box',
      type: 'text',
      x: 4,
      y: 62,
      width: 55.5,
      height: 18,
      rotation: 0,
      zIndex: 3,
      locked: false,
      hidden: false,
      opacity: 1,
      text: card.rulesText || 'Enter card rules and abilities here.',
      fontFamily: 'Public Sans',
      fontSize: 9,
      fontWeight: 400,
      fontStyle: 'normal',
      textAlign: 'left',
      verticalAlign: 'top',
      color: '#F1F5F9',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      borderWidth: 1,
      borderColor: '#334155',
      borderStyle: 'solid',
      borderRadius: 2,
      lineHeight: 1.35,
      hasShadow: true,
      shadowColor: 'rgba(0,0,0,0.9)'
    },
    // 6. Footer Strip
    {
      id: 'el_footer',
      name: 'Footer Meta Strip',
      type: 'text',
      x: 4,
      y: 81,
      width: 55.5,
      height: 5,
      rotation: 0,
      zIndex: 2,
      locked: false,
      hidden: false,
      opacity: 0.9,
      text: `${activeCardGroup.value?.name || 'CORE SET'} · QTY: ${card.quantity || 1}`,
      fontFamily: 'JetBrains Mono',
      fontSize: 7.5,
      fontWeight: 500,
      fontStyle: 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
      color: '#94A3B8',
      backgroundColor: '#0B0F17'
    }
  ];
}

// Apply Card Back Template with editable layers
function applyCardBackTemplate() {
  if (!activeCardGroup.value) return;
  activeCardGroup.value.cardBack.elements = [
    // Decorative Frame Box
    {
      id: 'el_back_frame',
      name: 'Inner Decorative Frame',
      type: 'shape',
      shapeType: 'rounded-rect',
      placeholderType: 'custom',
      placeholderLabel: 'Card Back Frame',
      showPlaceholderLabel: false,
      x: 4,
      y: 4,
      width: 55.5,
      height: 80.9,
      rotation: 0,
      zIndex: 1,
      locked: false,
      hidden: false,
      opacity: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      borderColor: activeCardGroup.value.cardBack.borderColor || '#F59E0B',
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderRadius: 4
    },
    // Central Symbol
    {
      id: 'el_back_symbol',
      name: 'Back Crest Symbol',
      type: 'icon',
      x: 21,
      y: 26,
      width: 20,
      height: 20,
      rotation: 0,
      zIndex: 2,
      locked: false,
      hidden: false,
      opacity: 1,
      iconGlyph: '🛡️',
      iconColor: '#F59E0B'
    },
    // Title
    {
      id: 'el_back_title',
      name: 'Back Title',
      type: 'text',
      x: 6,
      y: 50,
      width: 50,
      height: 10,
      rotation: 0,
      zIndex: 3,
      locked: false,
      hidden: false,
      opacity: 1,
      text: activeCardGroup.value.cardBack.title || 'CHRONICLES',
      fontFamily: 'Outfit',
      fontSize: 14,
      fontWeight: 800,
      fontStyle: 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
      color: '#F8FAFC',
      letterSpacing: 2
    },
    // Subtitle
    {
      id: 'el_back_sub',
      name: 'Back Subtitle',
      type: 'text',
      x: 6,
      y: 61,
      width: 50,
      height: 6,
      rotation: 0,
      zIndex: 4,
      locked: false,
      hidden: false,
      opacity: 1,
      text: activeCardGroup.value.cardBack.subtitle || 'TABLESMITH',
      fontFamily: 'JetBrains Mono',
      fontSize: 8,
      fontWeight: 600,
      fontStyle: 'normal',
      textAlign: 'center',
      verticalAlign: 'middle',
      color: '#F59E0B',
      letterSpacing: 1.5
    }
  ];
}

function handleApplyTemplate() {
  snapshotState();
  if (currentFace.value === 'front') {
    applyCardTemplate();
  } else {
    applyCardBackTemplate();
  }
  selectedElementId.value = null;
  persistChanges();
  showToast(`Applied layout template to card ${currentFace.value}`);
}

function ensureInitialCardElements() {
  if (!activeCard.value) return;
  if (activeCard.value.elements === undefined) {
    applyCardTemplate();
  }
}

watch(activeCard, () => {
  ensureInitialCardElements();
  selectedElementId.value = null;
}, { immediate: true });
</script>

<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- Sub-Sidebar: Card Groups & Card List -->
    <aside class="w-64 border-r border-slate-800 bg-[#0F172A]/80 flex flex-col shrink-0 select-none">
      <!-- Card Group Section -->
      <div class="p-3 border-b border-slate-800 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-300 font-display uppercase tracking-wider">Card Group</span>
          <div class="flex items-center gap-1">
            <button
              @click="openCreateGroup"
              class="p-1 hover:bg-slate-800 rounded text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              title="Create New Card Group"
            >
              <i class="ri-folder-add-line text-sm"></i>
            </button>
            <button
              @click="openRenameGroup"
              class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Rename Current Card Group"
            >
              <i class="ri-edit-line text-sm"></i>
            </button>
            <button
              @click="confirmDeleteGroup"
              class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete Current Card Group"
            >
              <i class="ri-delete-bin-line text-sm"></i>
            </button>
          </div>
        </div>

        <select
          v-model="selectedGroupId"
          class="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option v-for="grp in cardGroups" :key="grp._id" :value="grp._id">
            {{ grp.name }} ({{ grp.cards.length }} cards)
          </option>
        </select>
      </div>

      <!-- Cards in Group List Header -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 bg-slate-900/60">
        <span class="text-xs text-slate-400 font-mono">Cards ({{ activeCardGroup?.cards.length || 0 }})</span>

        <!-- Explicit "Add New Card" Action attached directly to group -->
        <button
          @click="handleAddNewCard"
          class="px-2 py-0.5 rounded bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          title="Add New Card to this group"
        >
          <i class="ri-add-line text-xs font-bold"></i>
          <span>Add Card</span>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div
          v-for="card in activeCardGroup?.cards || []"
          :key="card.id"
          @click="selectedCardId = card.id"
          class="group p-2 rounded text-xs flex items-center justify-between cursor-pointer transition-colors"
          :class="selectedCardId === card.id
            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
            : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'"
        >
          <div class="flex items-center gap-2 truncate">
            <i :class="[getRemixIconClass(card.artIcon, 'ri-sword-line'), 'text-amber-400 text-sm shrink-0']"></i>
            <div class="truncate">
              <div class="font-medium truncate">{{ card.name }}</div>
              <div class="text-[10px] text-slate-500 truncate">{{ card.type }} · Cost {{ card.cost }}</div>
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0 ml-1">
            <span class="text-[10px] text-slate-500 font-mono">×{{ card.quantity }}</span>
            <button
              @click.stop="handleDeleteCard(card.id)"
              class="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-slate-500 transition-opacity cursor-pointer"
              title="Delete Card"
            >
              <i class="ri-close-line text-xs"></i>
            </button>
          </div>
        </div>

        <button
          @click="handleAddNewCard"
          class="w-full mt-2 py-2 border border-dashed border-slate-700 hover:border-amber-400/60 rounded-lg text-slate-400 hover:text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-slate-900/30 hover:bg-amber-500/5"
        >
          <i class="ri-add-circle-line text-sm"></i>
          <span>Add New Card</span>
        </button>
      </div>
    </aside>

    <!-- Center Canvas Workspace -->
    <main class="flex-1 bg-[#131B2A] flex flex-col overflow-hidden relative">
      <!-- Universal Alignment & Pro Editing Toolbar -->
      <AlignmentBar
        :has-selection="!!activeElement"
        :is-locked="activeElement?.locked"
        :zoom="zoomLevel"
        @undo="handleUndo"
        @redo="handleRedo"
        @add-text="handleAddText"
        @add-image-frame="() => handleAddImageFrame()"
        @add-box="handleAddBox"
        @blank-canvas="handleBlankCanvas"
        @apply-template="handleApplyTemplate"
        @open-icons="showIconModal = true"
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @zoom-reset="handleZoomReset"
        @align="handleAlign"
        @duplicate="handleDuplicateElement"
        @delete="activeElement && handleDeleteElement(activeElement.id)"
      />

      <!-- Sub-Toolbar (Face Switcher & Size) -->
      <div class="h-9 border-b border-slate-800/80 bg-[#0B0F17]/60 px-4 flex items-center justify-between shrink-0 select-none">
        <div class="flex items-center gap-3">
          <div class="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5">
            <button
              @click="currentFace = 'front'; selectedElementId = null"
              class="px-2.5 py-0.5 text-xs rounded transition-colors"
              :class="currentFace === 'front' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'"
            >
              Card Front
            </button>
            <button
              @click="currentFace = 'back'; selectedElementId = null"
              class="px-2.5 py-0.5 text-xs rounded transition-colors"
              :class="currentFace === 'back' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'"
            >
              Card Back
            </button>
          </div>

          <span class="text-xs text-slate-500 font-mono">
            {{ activeCardGroup?.dimensions.width }} × {{ activeCardGroup?.dimensions.height }} mm · All Elements Fully Editable
          </span>
        </div>

        <span class="text-[11px] text-cyan-400 font-mono flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Dynamic Smart Guides Active
        </span>
      </div>

      <!-- Drag & Transform Canvas Viewport -->
      <div
        class="flex-1 flex items-center justify-center p-8 overflow-auto select-none"
        @click="selectedElementId = null"
        @dragover.prevent
        @drop="handleCanvasDrop"
      >
        <div v-if="activeCard && activeCardGroup" class="relative" @click.stop>
          <!-- Bleed Simulation Wrap -->
          <div
            class="relative p-3 border-2 border-dashed border-red-500/30 rounded-xl shadow-2xl transition-all"
            style="background: repeating-linear-gradient(45deg, #0B0F17, #0B0F17 10px, #131B2A 10px, #131B2A 20px);"
          >
            <!-- Physical Card Cut Bounds: Completely Editable Freeform Canvas -->
            <div
              v-if="currentFace === 'front'"
              class="relative overflow-hidden shadow-2xl transition-all"
              :style="{
                width: `${activeCardGroup.dimensions.width * canvasScale}px`,
                height: `${activeCardGroup.dimensions.height * canvasScale}px`,
                borderRadius: `${activeCardGroup.dimensions.cornerRadius * canvasScale}px`,
                backgroundColor: activeCardGroup.masterLayout.backgroundColor,
                border: `${activeCardGroup.masterLayout.borderWidth}px solid ${activeCardGroup.masterLayout.borderColor}`
              }"
            >
              <!-- Dynamic Smart Guides Lines -->
              <div
                v-for="(guide, gIdx) in activeSmartGuides"
                :key="gIdx"
                class="absolute pointer-events-none z-50"
                :class="guide.type === 'vertical' 
                  ? 'top-0 bottom-0 border-l-2 border-dashed border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]' 
                  : 'left-0 right-0 border-t-2 border-dashed border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]'"
                :style="guide.type === 'vertical' ? { left: `${guide.pos}px` } : { top: `${guide.pos}px` }"
              ></div>

              <!-- Every element on the card is an editable, draggable, selectable CanvasElement -->
              <TransformBox
                v-for="el in currentElements"
                :key="el.id"
                :element="el"
                :is-selected="selectedElementId === el.id"
                :scale="canvasScale"
                @select="selectedElementId = el.id"
                @start-drag="(e, elem) => startDrag(e, elem)"
                @start-resize="(e, elem, h) => startResize(e, elem, h)"
              />
            </div>

            <!-- Card Back Cut Bounds -->
            <div
              v-else
              class="relative overflow-hidden shadow-2xl transition-all"
              :style="{
                width: `${activeCardGroup.dimensions.width * canvasScale}px`,
                height: `${activeCardGroup.dimensions.height * canvasScale}px`,
                borderRadius: `${activeCardGroup.dimensions.cornerRadius * canvasScale}px`,
                backgroundColor: activeCardGroup.cardBack.color,
                border: `3px solid ${activeCardGroup.cardBack.borderColor}`
              }"
            >
              <!-- Dynamic Smart Guides Lines for Back -->
              <div
                v-for="(guide, gIdx) in activeSmartGuides"
                :key="gIdx"
                class="absolute pointer-events-none z-50"
                :class="guide.type === 'vertical' 
                  ? 'top-0 bottom-0 border-l-2 border-dashed border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]' 
                  : 'left-0 right-0 border-t-2 border-dashed border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]'"
                :style="guide.type === 'vertical' ? { left: `${guide.pos}px` } : { top: `${guide.pos}px` }"
              ></div>

              <!-- Custom Elements on Back (Completely freeform & editable layers) -->
              <div
                v-if="currentElements.length === 0"
                class="w-full h-full border border-dashed border-slate-700/60 rounded-lg p-4 flex flex-col items-center justify-center text-slate-500 font-mono text-[11px] gap-2 pointer-events-none"
              >
                <span>Blank Card Back Canvas</span>
                <span class="text-[9px] text-slate-600">Use [+ Add Box / Layer] or [Template] above</span>
              </div>

              <!-- Custom Elements on Back -->
              <TransformBox
                v-for="el in currentElements"
                :key="el.id"
                :element="el"
                :is-selected="selectedElementId === el.id"
                :scale="canvasScale"
                @select="selectedElementId = el.id"
                @start-drag="(e, elem) => startDrag(e, elem)"
                @start-resize="(e, elem, h) => startResize(e, elem, h)"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Right Inspector: Visual Layer Engine + Properties -->
    <aside class="w-80 border-l border-slate-800 bg-[#0B0F17] overflow-y-auto p-4 shrink-0 space-y-5">
      <!-- Element Properties Inspector -->
      <ElementInspector
        :element="activeElement"
        @change="persistChanges"
        @open-icons="showIconModal = true"
      />

      <!-- Layer Hierarchy Panel (with drag-and-drop layer reordering!) -->
      <div class="border-t border-slate-800 pt-4">
        <LayerPanel
          :elements="currentElements"
          :selected-element-id="selectedElementId"
          @select="el => selectedElementId = el.id"
          @move-up="el => el.zIndex = (el.zIndex || 0) + 1"
          @move-down="el => el.zIndex = Math.max(1, (el.zIndex || 0) - 1)"
          @delete="handleDeleteElement"
          @change="persistChanges"
        />
      </div>
    </aside>

    <!-- Tabletop Icon Library Modal -->
    <IconPickerModal
      :is-open="showIconModal"
      @close="showIconModal = false"
      @select-element="handleAddIconElement"
      @select-inline="handleInsertInlineIcon"
      @select-portrait="handleSetPortraitIcon"
    />

    <!-- Create Card Group Modal -->
    <div
      v-if="showCreateGroupModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-100"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <i class="ri-folder-add-line text-amber-400 text-lg"></i>
            <h3 class="text-sm font-bold text-white font-display">Create New Card Group</h3>
          </div>
          <button @click="showCreateGroupModal = false" class="text-slate-400 hover:text-white cursor-pointer">
            <i class="ri-close-line text-lg"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-[11px] font-semibold text-slate-300 mb-1">Group Name *</label>
            <input
              v-model="newGroupName"
              placeholder="e.g. Action Cards, Event Deck, Item Cards..."
              class="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              autofocus
            />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-300 mb-1">Standard Card Size</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="newGroupSize = 'poker'"
                class="p-2 rounded-lg border text-left cursor-pointer transition-colors"
                :class="newGroupSize === 'poker' ? 'bg-amber-500/15 border-amber-500/50 text-amber-200' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'"
              >
                <div class="font-bold text-[11px]">Poker Size</div>
                <div class="text-[9px] opacity-75">63.5 × 88.9 mm</div>
              </button>
              <button
                type="button"
                @click="newGroupSize = 'bridge'"
                class="p-2 rounded-lg border text-left cursor-pointer transition-colors"
                :class="newGroupSize === 'bridge' ? 'bg-amber-500/15 border-amber-500/50 text-amber-200' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'"
              >
                <div class="font-bold text-[11px]">Bridge Size</div>
                <div class="text-[9px] opacity-75">57 × 88.9 mm</div>
              </button>
              <button
                type="button"
                @click="newGroupSize = 'tarot'"
                class="p-2 rounded-lg border text-left cursor-pointer transition-colors"
                :class="newGroupSize === 'tarot' ? 'bg-amber-500/15 border-amber-500/50 text-amber-200' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'"
              >
                <div class="font-bold text-[11px]">Tarot Size</div>
                <div class="text-[9px] opacity-75">70 × 120 mm</div>
              </button>
              <button
                type="button"
                @click="newGroupSize = 'mini'"
                class="p-2 rounded-lg border text-left cursor-pointer transition-colors"
                :class="newGroupSize === 'mini' ? 'bg-amber-500/15 border-amber-500/50 text-amber-200' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'"
              >
                <div class="font-bold text-[11px]">Mini Size</div>
                <div class="text-[9px] opacity-75">44 × 67 mm</div>
              </button>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800 flex justify-end gap-2 text-xs">
          <button
            type="button"
            @click="showCreateGroupModal = false"
            class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmCreateGroup"
            :disabled="!newGroupName.trim()"
            class="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>

    <!-- Rename Card Group Modal -->
    <div
      v-if="showRenameGroupModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-100"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div class="flex items-center gap-2">
            <i class="ri-edit-line text-amber-400 text-lg"></i>
            <h3 class="text-sm font-bold text-white font-display">Rename Card Group</h3>
          </div>
          <button @click="showRenameGroupModal = false" class="text-slate-400 hover:text-white cursor-pointer">
            <i class="ri-close-line text-lg"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-[11px] font-semibold text-slate-300 mb-1">New Display Label *</label>
            <input
              v-model="renameGroupName"
              placeholder="e.g. Action Cards..."
              class="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-400"
              autofocus
              @keydown.enter="confirmRenameGroup"
            />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800 flex justify-end gap-2 text-xs">
          <button
            type="button"
            @click="showRenameGroupModal = false"
            class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmRenameGroup"
            :disabled="!renameGroupName.trim()"
            class="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            Save Name
          </button>
        </div>
      </div>
    </div>

    <!-- Blank Card Confirmation Modal -->
    <div
      v-if="showBlankConfirmModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-100"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
            <i class="ri-error-warning-line text-xl"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white font-display">Blank Card {{ currentFace === 'front' ? 'Front' : 'Back' }}?</h3>
            <p class="text-[11px] text-slate-400 mt-0.5">
              This will remove all {{ currentElements.length }} layer{{ currentElements.length === 1 ? '' : 's' }} from this card face.
            </p>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-[#0B0F17] border border-slate-800 text-[11px] text-slate-300 font-mono">
          <div class="flex items-center justify-between mb-1">
            <span class="text-slate-500">Target Face:</span>
            <span class="text-amber-400 font-bold uppercase">{{ currentFace }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Elements to delete:</span>
            <span class="text-red-400 font-bold">{{ currentElements.length }}</span>
          </div>
        </div>

        <p class="text-[10px] text-slate-500">
          Tip: You can use Undo (Ctrl+Z) if you change your mind.
        </p>

        <div class="pt-2 border-t border-slate-800 flex justify-end gap-2 text-xs">
          <button
            type="button"
            @click="showBlankConfirmModal = false"
            class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmExecuteBlankCanvas"
            class="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-500/20"
          >
            <i class="ri-delete-bin-line text-xs"></i>
            <span>Yes, Blank Card</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
