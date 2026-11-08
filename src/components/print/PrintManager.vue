<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  project,
  cardGroups,
  boxDielines,
  tokenSets,
  standeeSets,
  boards,
  showToast
} from '../../stores/projectStore.ts';

import jsPDF from 'jspdf';
import { getRemixIconClass } from '../../utils/iconHelper.ts';

const targetPaper = ref<'A4' | 'LETTER' | 'A3'>('A4');
const bleedMm = ref<number>(3);
const showCropMarks = ref<boolean>(true);
const cropMarkLengthMm = ref<number>(5);
const showCrosshairs = ref<boolean>(true);
const duplexMode = ref<boolean>(true);
const activeComponentTab = ref<'cards' | 'tokens' | 'standees' | 'boxes'>('cards');
const currentSheetView = ref<'front' | 'back'>('front');

const paperSpecs = {
  A4: { width: 210, height: 297, label: 'A4 (210 × 297 mm)' },
  LETTER: { width: 215.9, height: 279.4, label: 'US Letter (8.5 × 11 in)' },
  A3: { width: 297, height: 420, label: 'A3 (297 × 420 mm)' }
};

const currentPaper = computed(() => paperSpecs[targetPaper.value]);

// Calculate card grid capacity
const cardGrid = computed(() => {
  const grp = cardGroups.value[0];
  if (!grp) return { cols: 3, rows: 3, total: 9 };
  const cardW = grp.dimensions.width + bleedMm.value * 2;
  const cardH = grp.dimensions.height + bleedMm.value * 2;
  const margin = 10;
  const cols = Math.floor((currentPaper.value.width - margin * 2) / cardW);
  const rows = Math.floor((currentPaper.value.height - margin * 2) / cardH);
  return {
    cols: Math.max(1, cols),
    rows: Math.max(1, rows),
    total: Math.max(1, cols * rows)
  };
});

// Flat list of all cards in active group according to quantities
const cardListToPrint = computed(() => {
  const grp = cardGroups.value[0];
  if (!grp) return [];
  const list: any[] = [];
  grp.cards.forEach(c => {
    for (let i = 0; i < (c.quantity || 1); i++) {
      list.push({ ...c, copyNum: i + 1 });
    }
  });
  return list;
});

// Front and Back card grids for sheet preview
const sheetFrontCards = computed(() => {
  return cardListToPrint.value.slice(0, cardGrid.value.total);
});

// Duplex Back grid: columns must be horizontally flipped so they match long-edge feed!
const sheetBackCards = computed(() => {
  const fronts = sheetFrontCards.value;
  const cols = cardGrid.value.cols;
  const rows = cardGrid.value.rows;
  const backs: any[] = [];

  for (let r = 0; r < rows; r++) {
    const rowItems: any[] = [];
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      rowItems.push(fronts[idx] || null);
    }
    // Flip columns horizontally for back registration
    rowItems.reverse().forEach(item => backs.push(item));
  }
  return backs;
});

// Export High-Resolution Print-Ready PDF
function handleExportPdf() {
  showToast('Generating print-ready imposition PDF with bleed & cut marks...');
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: targetPaper.value === 'A3' ? 'a3' : targetPaper.value === 'LETTER' ? 'letter' : 'a4'
  });

  const grp = cardGroups.value[0];
  const paper = currentPaper.value;
  const cardW = grp ? grp.dimensions.width : 63.5;
  const cardH = grp ? grp.dimensions.height : 88.9;
  const b = bleedMm.value;
  const cols = cardGrid.value.cols;
  const rows = cardGrid.value.rows;

  const totalGridW = cols * (cardW + b * 2);
  const totalGridH = rows * (cardH + b * 2);
  const startX = (paper.width - totalGridW) / 2;
  const startY = (paper.height - totalGridH) / 2;

  // Page 1: Fronts
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`TableSmith Imposition Sheet - ${project.value.name} (Front) - Bleed: ${b}mm`, startX, startY - 4);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (cardW + b * 2);
      const y = startY + r * (cardH + b * 2);
      const card = sheetFrontCards.value[r * cols + c];

      if (card) {
        // Bleed box
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(x, y, cardW + b * 2, cardH + b * 2, 2, 2, 'F');

        // Trim border
        doc.setDrawColor(245, 158, 11);
        doc.roundedRect(x + b, y + b, cardW, cardH, 3, 3, 'S');

        // Card Text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(card.name, x + b + 4, y + b + 8);
        doc.setFontSize(7);
        doc.setTextColor(200);
        doc.text(`${card.type} · Cost ${card.cost}`, x + b + 4, y + b + 13);
        doc.text(card.stats || '', x + b + 4, y + b + 18);
        doc.text(card.rulesText?.substring(0, 45) || '', x + b + 4, y + b + 30);

        // Vector Crop / Cut Marks
        if (showCropMarks.value) {
          const cutX1 = x + b;
          const cutX2 = x + b + cardW;
          const cutY1 = y + b;
          const cutY2 = y + b + cardH;
          const len = cropMarkLengthMm.value;

          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.2);

          // Top-Left
          doc.line(cutX1, cutY1 - len, cutX1, cutY1 - 1);
          doc.line(cutX1 - len, cutY1, cutX1 - 1, cutY1);

          // Top-Right
          doc.line(cutX2, cutY1 - len, cutX2, cutY1 - 1);
          doc.line(cutX2 + 1, cutY1, cutX2 + len, cutY1);

          // Bottom-Left
          doc.line(cutX1, cutY2 + 1, cutX1, cutY2 + len);
          doc.line(cutX1 - len, cutY2, cutX1 - 1, cutY2);

          // Bottom-Right
          doc.line(cutX2, cutY2 + 1, cutX2, cutY2 + len);
          doc.line(cutX2 + 1, cutY2, cutX2 + len, cutY2);
        }
      }
    }
  }

  // Page 2: Duplex Backs (if duplex enabled)
  if (duplexMode.value) {
    doc.addPage();
    doc.text(`TableSmith Imposition Sheet - ${project.value.name} (Duplex Backs) - Bleed: ${b}mm`, startX, startY - 4);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (cardW + b * 2);
        const y = startY + r * (cardH + b * 2);
        const card = sheetBackCards.value[r * cols + c];

        if (card) {
          doc.setFillColor(15, 23, 42);
          doc.roundedRect(x, y, cardW + b * 2, cardH + b * 2, 2, 2, 'F');
          doc.setDrawColor(245, 158, 11);
          doc.roundedRect(x + b, y + b, cardW, cardH, 3, 3, 'S');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.text(grp?.cardBack.title || 'TABLESMITH', x + b + cardW / 2, y + b + cardH / 2, { align: 'center' });
        }
      }
    }
  }

  doc.save(`${project.value.name.replace(/\s+/g, '_')}_Imposition_Print_Ready.pdf`);
  showToast('Print-Ready PDF downloaded successfully!');
}

// Export Tabletop Simulator JSON bundle
async function handleExportTts() {
  showToast('Generating Tabletop Simulator JSON bundle...');
  try {
    const res = await fetch(`/api/projects/${project.value._id}/export/tts`, {
      method: 'POST'
    });
    const ttsData = await res.json();
    const blob = new Blob([JSON.stringify(ttsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.value.name.replace(/\s+/g, '_')}_Tabletop_Simulator.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Tabletop Simulator JSON exported!');
  } catch (err) {
    console.error('TTS export failed:', err);
    showToast('Failed to export TTS data');
  }
}
</script>

<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- Sub-Sidebar: Imposition Settings & Components -->
    <aside class="w-64 border-r border-slate-800 bg-[#0F172A]/70 flex flex-col shrink-0">
      <div class="p-3 border-b border-slate-800">
        <span class="text-xs font-semibold text-slate-300 font-display uppercase tracking-wider">Print Hub Setup</span>
      </div>

      <div class="p-3 border-b border-slate-800 space-y-3">
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Output Sheet Paper</span>
          <select
            v-model="targetPaper"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1"
          >
            <option value="A4">A4 (210 × 297 mm)</option>
            <option value="LETTER">US Letter (8.5 × 11 in)</option>
            <option value="A3">A3 Poster (297 × 420 mm)</option>
          </select>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] text-slate-500 font-mono">Bleed Margin</span>
            <span class="text-xs font-mono text-amber-400 font-bold">{{ bleedMm }} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="6"
            step="0.5"
            v-model.number="bleedMm"
            class="w-full mt-1 accent-amber-400 cursor-pointer"
          />
        </div>

        <div class="space-y-2 pt-1 border-t border-slate-800/80">
          <label class="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span>Crop Cut Marks</span>
            <input
              type="checkbox"
              v-model="showCropMarks"
              class="rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0"
            />
          </label>

          <label class="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span>Center Crosshairs</span>
            <input
              type="checkbox"
              v-model="showCrosshairs"
              class="rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0"
            />
          </label>

          <label class="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span>Duplex Registration</span>
            <input
              type="checkbox"
              v-model="duplexMode"
              class="rounded bg-slate-900 border-slate-700 text-amber-400 focus:ring-0"
            />
          </label>
        </div>
      </div>

      <!-- Component Imposition Selector -->
      <div class="p-3 border-b border-slate-800 space-y-1.5">
        <span class="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Components to Print</span>
        <button
          @click="activeComponentTab = 'cards'"
          class="w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center"
          :class="activeComponentTab === 'cards' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-400 hover:text-white'"
        >
          <i class="ri-stack-line text-sm mr-1.5 text-amber-400"></i>
          <span>Card Decks ({{ cardListToPrint.length }} cards total)</span>
        </button>
        <button
          @click="activeComponentTab = 'tokens'"
          class="w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center"
          :class="activeComponentTab === 'tokens' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-400 hover:text-white'"
        >
          <i class="ri-copper-coin-line text-sm mr-1.5 text-amber-400"></i>
          <span>Tokens Punchboard ({{ tokenSets[0]?.tokens.length || 0 }} sets)</span>
        </button>
        <button
          @click="activeComponentTab = 'standees'"
          class="w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center"
          :class="activeComponentTab === 'standees' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-400 hover:text-white'"
        >
          <i class="ri-user-star-line text-sm mr-1.5 text-amber-400"></i>
          <span>Figures & Standees ({{ standeeSets[0]?.standees.length || 0 }} figures)</span>
        </button>
        <button
          @click="activeComponentTab = 'boxes'"
          class="w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center"
          :class="activeComponentTab === 'boxes' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-400 hover:text-white'"
        >
          <i class="ri-box-3-line text-sm mr-1.5 text-amber-400"></i>
          <span>Box Dieline Sheets ({{ boxDielines.length }} boxes)</span>
        </button>
      </div>

      <!-- Quick Metrics -->
      <div class="p-3 space-y-2 mt-auto text-[11px] font-mono text-slate-400 bg-slate-900/40">
        <div>Yield: <strong class="text-white">{{ cardGrid.cols }} × {{ cardGrid.rows }} = {{ cardGrid.total }} items/sheet</strong></div>
        <div>Total Sheets: <strong class="text-amber-400">{{ Math.ceil(cardListToPrint.length / cardGrid.total) }} pages</strong></div>
      </div>
    </aside>

    <!-- Center Canvas: Sheet Imposition Live View -->
    <main class="flex-1 bg-[#131B2A] flex flex-col overflow-hidden relative">
      <!-- Toolbar -->
      <div class="h-10 border-b border-slate-800 bg-[#0B0F17]/80 px-4 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <!-- Duplex Page Toggle -->
          <div class="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5">
            <button
              @click="currentSheetView = 'front'"
              class="px-2.5 py-1 text-xs rounded transition-colors"
              :class="currentSheetView === 'front' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'"
            >
              Front Imposition
            </button>
            <button
              @click="currentSheetView = 'back'"
              class="px-2.5 py-1 text-xs rounded transition-colors"
              :class="currentSheetView === 'back' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'"
            >
              Duplex Reverse Back (Mirrored)
            </button>
          </div>

          <span class="text-xs text-slate-500 font-mono">
            Sheet: {{ currentPaper.label }} · Bleed: {{ bleedMm }}mm
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="handleExportTts"
            class="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <i class="ri-download-2-line text-amber-400 text-sm"></i>
            TTS Object
          </button>
          <button
            @click="handleExportPdf"
            class="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded font-display flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <i class="ri-printer-line text-sm"></i>
            Export PDF
          </button>
        </div>
      </div>

      <!-- Imposition Sheet Visualizer -->
      <div class="flex-1 flex items-center justify-center p-8 overflow-auto">
        <!-- Physical Sheet Mockup (e.g. A4 / Letter) -->
        <div
          class="relative bg-white text-slate-950 shadow-2xl p-6 rounded flex flex-col items-center justify-between select-none"
          :style="{
            width: `${currentPaper.width * 2.2}px`,
            height: `${currentPaper.height * 2.2}px`
          }"
        >
          <!-- Sheet Header Registration Marker -->
          <div class="w-full flex items-center justify-between text-[8px] font-mono text-slate-500 border-b border-slate-300 pb-1">
            <span>TableSmith Imposition Master · {{ project.name }}</span>
            <span class="font-bold text-slate-700 uppercase">
              {{ currentSheetView === 'front' ? 'SHEET 1: FRONTS' : 'SHEET 2: DUPLEX BACKS (FLIPPED)' }}
            </span>
            <span>Bleed: {{ bleedMm }}mm · Cut Marks: {{ showCropMarks ? 'Active' : 'Off' }}</span>
          </div>

          <!-- Component Grid Container -->
          <div
            v-if="activeComponentTab === 'cards'"
            class="grid gap-2 m-auto"
            :style="{
              gridTemplateColumns: `repeat(${cardGrid.cols}, minmax(0, 1fr))`
            }"
          >
            <template v-if="currentSheetView === 'front'">
              <div
                v-for="(card, i) in sheetFrontCards"
                :key="i"
                class="relative border border-slate-400 rounded-sm p-1 flex flex-col justify-between shadow-xs"
                :style="{
                  width: `${(cardGroups[0]?.dimensions.width || 63.5) * 1.5}px`,
                  height: `${(cardGroups[0]?.dimensions.height || 88.9) * 1.5}px`,
                  backgroundColor: '#1E293B',
                  color: 'white'
                }"
              >
                <!-- Simulated Bleed Ring -->
                <div v-if="bleedMm > 0" class="absolute -inset-1 border border-dashed border-red-500/40 pointer-events-none"></div>

                <!-- Crop Marks Simulation -->
                <template v-if="showCropMarks">
                  <span class="absolute -top-2 left-0 w-2 h-0.5 bg-black"></span>
                  <span class="absolute top-0 -left-2 w-0.5 h-2 bg-black"></span>
                  <span class="absolute -top-2 right-0 w-2 h-0.5 bg-black"></span>
                  <span class="absolute top-0 -right-2 w-0.5 h-2 bg-black"></span>
                </template>

                <div class="flex items-center justify-between text-[8px] border-b border-slate-700 pb-0.5">
                  <span class="font-bold truncate">{{ card.name }}</span>
                  <span class="bg-amber-400 text-slate-950 font-bold px-1 rounded-xs">{{ card.cost }}</span>
                </div>
                <div class="text-xl text-center flex items-center justify-center">
                  <i :class="[getRemixIconClass(card.artIcon, 'ri-sword-line'), 'text-amber-400']"></i>
                </div>
                <div class="text-[7px] text-slate-400 font-mono truncate">
                  {{ card.type }} · {{ card.stats }}
                </div>
              </div>
            </template>

            <!-- Duplex Backs View -->
            <template v-else>
              <div
                v-for="(card, i) in sheetBackCards"
                :key="i"
                class="relative border border-slate-400 rounded-sm p-2 flex flex-col items-center justify-center text-center shadow-xs"
                :style="{
                  width: `${(cardGroups[0]?.dimensions.width || 63.5) * 1.5}px`,
                  height: `${(cardGroups[0]?.dimensions.height || 88.9) * 1.5}px`,
                  backgroundColor: cardGroups[0]?.cardBack.color || '#0F172A',
                  color: 'white'
                }"
              >
                <div class="text-base text-amber-400 flex items-center justify-center">
                  <i class="ri-shield-line"></i>
                </div>
                <span class="text-[8px] font-bold tracking-widest uppercase">
                  {{ cardGroups[0]?.cardBack.title || 'TABLESMITH' }}
                </span>
                <span class="text-[6px] text-slate-400 font-mono mt-0.5">BACK #{{ i + 1 }}</span>
              </div>
            </template>
          </div>

          <!-- Tokens Imposition Preview -->
          <div
            v-else-if="activeComponentTab === 'tokens'"
            class="flex flex-wrap gap-4 m-auto justify-center max-w-md p-4"
          >
            <div
              v-for="tok in tokenSets[0]?.tokens || []"
              :key="tok.id"
              class="relative rounded-full flex flex-col items-center justify-center text-white border-2 border-slate-800 shadow-sm"
              :style="{
                width: `${tok.diameterMm * 2.5}px`,
                height: `${tok.diameterMm * 2.5}px`,
                backgroundColor: tok.color
              }"
            >
              <span class="text-sm">{{ tok.icon }}</span>
              <span class="text-[7px] font-mono font-bold">{{ tok.text }}</span>
            </div>
          </div>

          <!-- Standees Imposition Preview -->
          <div
            v-else-if="activeComponentTab === 'standees'"
            class="flex flex-wrap gap-6 m-auto justify-center max-w-md p-4"
          >
            <div
              v-for="st in standeeSets[0]?.standees || []"
              :key="st.id"
              class="flex flex-col items-center"
            >
              <div
                class="rounded-t-full p-2 border border-slate-800 text-center flex flex-col items-center justify-center text-white shadow-sm"
                :style="{
                  width: `${st.widthMm * 2}px`,
                  height: `${st.heightMm * 2}px`,
                  backgroundColor: st.color
                }"
              >
                <span class="text-xl">{{ st.icon }}</span>
                <span class="text-[8px] font-bold">{{ st.name }}</span>
              </div>
              <div
                class="bg-amber-400/50 border border-slate-800 text-[6px] font-mono text-slate-900 flex items-center justify-center"
                :style="{
                  width: `${st.baseTabMm.width * 2}px`,
                  height: `${st.baseTabMm.height * 2}px`
                }"
              >
                Tab
              </div>
            </div>
          </div>

          <!-- Box Dieline Imposition Preview -->
          <div
            v-else-if="activeComponentTab === 'boxes'"
            class="m-auto text-center p-4 space-y-2"
          >
            <span class="text-xs font-bold text-slate-700">Packaging Dieline Net Imposition</span>
            <div class="border-2 border-dashed border-slate-400 p-6 rounded bg-slate-100 flex items-center justify-center">
              <span class="text-xs font-mono text-slate-600">
                1:1 Scale Net Sheet for {{ boxDielines[0]?.name }} ({{ boxDielines[0]?.templateType }})
              </span>
            </div>
          </div>

          <!-- Sheet Footer Registration Marker -->
          <div class="w-full flex items-center justify-between text-[8px] font-mono text-slate-500 border-t border-slate-300 pt-1">
            <span>Registration: 99.8% Alignment</span>
            <span>Orientation: Portrait · Long Edge Flip</span>
            <span>Prepared with TableSmith Production Suite</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Right Inspector: Production Guidelines & Specs -->
    <aside class="w-80 border-l border-slate-800 bg-[#0B0F17] overflow-y-auto p-4 shrink-0 space-y-5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 class="text-xs font-semibold text-slate-200 font-display uppercase tracking-wider flex items-center gap-1.5">
          <FileCheck class="w-3.5 h-3.5 text-amber-400" />
          Production Specs
        </h3>
      </div>

      <div class="space-y-3 text-xs text-slate-300">
        <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1.5">
          <span class="font-bold text-white font-display">Duplex Reverse Alignment</span>
          <p class="text-[11px] text-slate-400 leading-relaxed">
            When printing double-sided, reverse pages are horizontally flipped so Column 1 Front aligns with Column 3 Back on long-edge turn.
          </p>
        </div>

        <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1.5">
          <span class="font-bold text-white font-display">Crop & Bleed Guidelines</span>
          <p class="text-[11px] text-slate-400 leading-relaxed">
            A standard 3mm bleed margin extends outside the cut boundary, eliminating white borders during rotary die cutting or guillotine cutting.
          </p>
        </div>

        <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1.5">
          <span class="font-bold text-white font-display">Tabletop Simulator (TTS) Ready</span>
          <p class="text-[11px] text-slate-400 leading-relaxed">
            Exports a formatted Saved Object JSON file ready to drop directly into <code class="text-amber-400 font-mono">Saved Objects</code> for digital playtesting.
          </p>
        </div>
      </div>

      <div class="border-t border-slate-800 pt-3 space-y-2">
        <button
          @click="handleExportPdf"
          class="w-full py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded font-display flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <i class="ri-printer-line text-base"></i>
          Export PDF
        </button>
        <button
          @click="handleExportTts"
          class="w-full py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded flex items-center justify-center gap-2 cursor-pointer"
        >
          <i class="ri-download-2-line text-amber-400 text-base"></i>
          Export TTS
        </button>
      </div>
    </aside>
  </div>
</template>
