<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  rulebook,
  saveRulebook,
  showToast
} from '../../stores/projectStore.ts';
import {
  BookOpen,
  Plus,
  Trash2,
  FileText,
  BookmarkCheck,
  Search,
  ListOrdered,
  FileCode,
  Tag,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  LayoutTemplate,
  BoxSelect,
  Sparkles
} from 'lucide-vue-next';
import type { RulebookChapter, GlossaryItem } from '../../types/index.ts';

const activeTab = ref<'editor' | 'toc' | 'glossary' | 'index' | 'booklet'>('editor');
const selectedChapterId = ref<string>('');
const newKeywordInput = ref<string>('');
const newGlossaryTerm = ref<string>('');
const newGlossaryDef = ref<string>('');
const zoomLevel = ref<number>(1.0);

function handleZoomIn() {
  zoomLevel.value = Math.min(2.0, +(zoomLevel.value + 0.15).toFixed(2));
}

function handleZoomOut() {
  zoomLevel.value = Math.max(0.6, +(zoomLevel.value - 0.15).toFixed(2));
}

function handleZoomReset() {
  zoomLevel.value = 1.0;
}

function handleInsertPlaceholder(type: 'header' | 'callout' | 'example' | 'diagram' | 'table' | 'footer') {
  if (!activeChapter.value) return;
  let snippet = '';
  switch (type) {
    case 'header':
      snippet = `\n\n### ── [SECTION HEADER: Gameplay Phase] ──\n`;
      break;
    case 'callout':
      snippet = `\n\n> ⚠️ **IMPORTANT RULE / CLARIFICATION**\n> When rolling a tie, defender wins priority.\n`;
      break;
    case 'example':
      snippet = `\n\n> 🎲 **EXAMPLE OF PLAY**\n> Player A spends 2 Action Points to move across 2 hexes, then uses 1 Magic Point to trigger Fireball.\n`;
      break;
    case 'diagram':
      snippet = `\n\n┌───────────────────────────────────────────────┐\n│ [DIAGRAM / PORTRAIT / ARTWORK PLACEHOLDER]    │\n│ Recommended size: 60mm × 40mm                │\n└───────────────────────────────────────────────┘\n`;
      break;
    case 'table':
      snippet = `\n\n| Attribute | Base Cost | Effect Description |\n| :--- | :---: | :--- |\n| Health (HP) | 10 | Max damage capacity |\n| Speed (SPD) | 3 | Hexes per movement turn |\n`;
      break;
    case 'footer':
      snippet = `\n\n─────────────────────────────────────────────────\n*[FOOTER: Official Tournament Reference • Rev 1.2]*\n`;
      break;
  }
  activeChapter.value.content += snippet;
  saveRulebook();
  showToast(`Inserted ${type} placeholder block`);
}

function handleBlankChapter() {
  if (!activeChapter.value) return;
  activeChapter.value.content = '';
  saveRulebook();
  showToast('Cleared chapter to blank state');
}

function handleApplyTemplate() {
  if (!activeChapter.value) return;
  activeChapter.value.title = `Phase ${activeChapter.value.pageNumber}: Core Game Flow`;
  activeChapter.value.content = `### ── [SECTION HEADER: Setup & Sequence] ──
Each turn is divided into three distinct steps executed in clockwise turn order.

1. **Draw Phase**: Replenish your hand up to the maximum hand size of 5 cards.
2. **Action Phase**: You may spend up to 3 Action Points to move, activate abilities, or trade.
3. **End Phase**: Discard excess tokens and pass the initiative marker.

> ⚠️ **IMPORTANT RULE / CLARIFICATION**
> Unused Action Points do not carry over to subsequent turns.

┌───────────────────────────────────────────────┐
│ [DIAGRAM / MAP ZONE REFERENCE PLACEHOLDER]    │
│ Board Position & Line-of-Sight Diagram        │
└───────────────────────────────────────────────┘

> 🎲 **EXAMPLE OF PLAY**
> Ranger moves 2 hexes towards the Mountain tile, revealing an exploration token.

─────────────────────────────────────────────────
*[FOOTER: TableSmith Standard Rulebook Imposition • Page ${activeChapter.value.pageNumber}]*`;
  saveRulebook();
  showToast('Applied rulebook template layout');
}

if (rulebook.value.chapters.length > 0) {
  selectedChapterId.value = rulebook.value.chapters[0].id;
}

const activeChapter = computed(() => {
  return rulebook.value.chapters.find(c => c.id === selectedChapterId.value) || rulebook.value.chapters[0] || null;
});

// Auto-generated dynamic Table of Contents
const tableOfContents = computed(() => {
  return rulebook.value.chapters.map((ch, idx) => ({
    id: ch.id,
    title: ch.title,
    pageNumber: ch.pageNumber || idx + 1
  }));
});

// Auto-generated dynamic Word Location / Index
const wordLocationIndex = computed(() => {
  const result: Record<string, number[]> = {};
  const keywords = rulebook.value.keywords || [];

  keywords.forEach(keyword => {
    result[keyword] = [];
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    rulebook.value.chapters.forEach((ch, idx) => {
      const pageNum = ch.pageNumber || idx + 1;
      const fullText = `${ch.title} ${ch.content}`;
      if (regex.test(fullText)) {
        if (!result[keyword].includes(pageNum)) {
          result[keyword].push(pageNum);
        }
      }
    });
  });

  return result;
});

function handleAddChapter() {
  const newNum = rulebook.value.chapters.length + 1;
  const newCh: RulebookChapter = {
    id: `ch_${Date.now()}`,
    title: `Chapter ${newNum}: New Rule Section`,
    pageNumber: newNum,
    content: 'Write detailed gameplay rules, phases, dice checks, and scoring requirements here.'
  };
  rulebook.value.chapters.push(newCh);
  selectedChapterId.value = newCh.id;
  saveRulebook();
  showToast('Added new chapter');
}

function handleDeleteChapter(id: string) {
  if (rulebook.value.chapters.length <= 1) {
    showToast('Cannot delete last chapter');
    return;
  }
  rulebook.value.chapters = rulebook.value.chapters.filter(c => c.id !== id);
  selectedChapterId.value = rulebook.value.chapters[0].id;
  saveRulebook();
  showToast('Deleted chapter');
}

function handleAddKeyword() {
  const kw = newKeywordInput.value.trim();
  if (!kw) return;
  if (!rulebook.value.keywords.includes(kw)) {
    rulebook.value.keywords.push(kw);
    saveRulebook();
    showToast(`Added "${kw}" to word index tracker`);
  }
  newKeywordInput.value = '';
}

function handleRemoveKeyword(kw: string) {
  rulebook.value.keywords = rulebook.value.keywords.filter(k => k !== kw);
  saveRulebook();
}

function handleAddGlossary() {
  const term = newGlossaryTerm.value.trim();
  const def = newGlossaryDef.value.trim();
  if (!term || !def) return;
  rulebook.value.glossary.push({ term, definition: def });
  newGlossaryTerm.value = '';
  newGlossaryDef.value = '';
  saveRulebook();
  showToast(`Added "${term}" to terminology glossary`);
}

function handleRemoveGlossary(index: number) {
  rulebook.value.glossary.splice(index, 1);
  saveRulebook();
}
</script>

<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- Sub-Sidebar: Chapters & Modes -->
    <aside class="w-64 border-r border-slate-800 bg-[#0F172A]/70 flex flex-col shrink-0">
      <div class="p-3 border-b border-slate-800 flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-300 font-display uppercase tracking-wider">Rulebook Chapters</span>
        <button
          @click="handleAddChapter"
          class="p-1 hover:bg-slate-800 rounded text-amber-400 hover:text-amber-300 transition-colors"
          title="Add Chapter"
        >
          <Plus class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="p-2 border-b border-slate-800/80 space-y-1">
        <button
          @click="activeTab = 'editor'"
          class="w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center gap-2 transition-colors"
          :class="activeTab === 'editor' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
        >
          <FileText class="w-3.5 h-3.5" />
          Chapter Editor
        </button>
        <button
          @click="activeTab = 'toc'"
          class="w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center gap-2 transition-colors"
          :class="activeTab === 'toc' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
        >
          <ListOrdered class="w-3.5 h-3.5" />
          Table of Contents (Auto)
        </button>
        <button
          @click="activeTab = 'glossary'"
          class="w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center gap-2 transition-colors"
          :class="activeTab === 'glossary' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
        >
          <BookmarkCheck class="w-3.5 h-3.5" />
          Terminology Reference (Auto)
        </button>
        <button
          @click="activeTab = 'index'"
          class="w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center gap-2 transition-colors"
          :class="activeTab === 'index' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
        >
          <Search class="w-3.5 h-3.5" />
          Word Location Index (Auto)
        </button>
        <button
          @click="activeTab = 'booklet'"
          class="w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center gap-2 transition-colors"
          :class="activeTab === 'booklet' ? 'bg-amber-500/15 text-amber-300 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
        >
          <BookOpen class="w-3.5 h-3.5" />
          Complete Booklet Preview
        </button>
      </div>

      <!-- Chapters List -->
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div class="px-2 py-1 text-[10px] text-slate-500 font-mono uppercase tracking-wider">Pages</div>
        <div
          v-for="ch in rulebook.chapters"
          :key="ch.id"
          @click="selectedChapterId = ch.id; activeTab = 'editor'"
          class="p-2 rounded text-xs flex items-center justify-between cursor-pointer transition-colors"
          :class="selectedChapterId === ch.id && activeTab === 'editor'
            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
            : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'"
        >
          <div class="truncate">
            <div class="font-medium truncate">{{ ch.title }}</div>
            <div class="text-[10px] text-slate-500 font-mono">Page {{ ch.pageNumber }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Center Canvas / Document View -->
    <main class="flex-1 bg-[#131B2A] flex flex-col overflow-hidden relative">
      <!-- Toolbar -->
      <div class="h-10 border-b border-slate-800 bg-[#0B0F17]/80 px-4 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <span class="text-xs text-white font-display font-semibold">{{ rulebook.title }}</span>
          <span class="text-xs text-slate-500 font-mono">Format: {{ rulebook.pageSize }} Booklet</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Zoom Controls -->
          <div class="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded px-1.5 py-0.5">
            <button
              @click="handleZoomOut"
              class="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut class="w-3.5 h-3.5" />
            </button>
            <button
              @click="handleZoomReset"
              class="text-[11px] font-mono text-slate-300 hover:text-amber-300 px-1 py-0.5 rounded transition-colors"
              title="Reset Zoom (100%)"
            >
              {{ Math.round(zoomLevel * 100) }}%
            </button>
            <button
              @click="handleZoomIn"
              class="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn class="w-3.5 h-3.5" />
            </button>
          </div>

          <template v-if="activeTab === 'editor' && activeChapter">
            <button
              @click="handleBlankChapter"
              class="px-2 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded flex items-center gap-1 transition-colors"
              title="Start with Blank Chapter"
            >
              <BoxSelect class="w-3.5 h-3.5 text-slate-400" />
              Blank Canvas
            </button>
            <button
              @click="handleApplyTemplate"
              class="px-2 py-1 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded flex items-center gap-1 transition-colors"
              title="Apply Standard Rulebook Layout Template"
            >
              <LayoutTemplate class="w-3.5 h-3.5" />
              Template
            </button>
            <button
              @click="handleDeleteChapter(activeChapter.id)"
              class="px-2 py-1 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 rounded flex items-center gap-1 transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
              Delete
            </button>
          </template>
        </div>
      </div>

      <!-- Document Content Body -->
      <div class="flex-1 overflow-y-auto p-8 flex justify-center">
        <!-- Scale Container for Zoom -->
        <div
          class="w-full flex justify-center transition-transform duration-150 origin-top"
          :style="{ transform: `scale(${zoomLevel})` }"
        >
        <!-- 1. Chapter Editor -->
        <div v-if="activeTab === 'editor' && activeChapter" class="w-full max-w-2xl bg-[#0B0F17] border border-slate-800 rounded-xl p-8 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="text-xs text-amber-400 font-mono">Page {{ activeChapter.pageNumber }}</span>
            <span class="text-[10px] text-slate-500 font-mono">TableSmith Auto-Pagination</span>
          </div>

          <div>
            <label class="text-[10px] text-slate-500 font-mono">Chapter Title</label>
            <input
              v-model="activeChapter.title"
              @input="saveRulebook"
              class="w-full bg-[#1E293B] border border-slate-700 rounded px-3 py-1.5 text-base font-bold text-white font-display mt-1"
            />
          </div>

          <!-- Add Placeholder Layout Blocks -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Quick Layout & Placeholder Boxes</label>
              <span class="text-[10px] text-slate-500 font-mono">Click to insert at cursor</span>
            </div>
            <div class="flex flex-wrap gap-1.5 p-2 bg-slate-900/70 border border-slate-800/80 rounded-lg">
              <button
                @click="handleInsertPlaceholder('header')"
                class="px-2 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700/60 flex items-center gap-1"
              >
                + Header Bar
              </button>
              <button
                @click="handleInsertPlaceholder('callout')"
                class="px-2 py-1 text-[11px] font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 flex items-center gap-1"
              >
                + Callout Box
              </button>
              <button
                @click="handleInsertPlaceholder('example')"
                class="px-2 py-1 text-[11px] font-mono bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 flex items-center gap-1"
              >
                + Example of Play
              </button>
              <button
                @click="handleInsertPlaceholder('diagram')"
                class="px-2 py-1 text-[11px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 flex items-center gap-1"
              >
                + Diagram Frame
              </button>
              <button
                @click="handleInsertPlaceholder('table')"
                class="px-2 py-1 text-[11px] font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 flex items-center gap-1"
              >
                + Stat Table
              </button>
              <button
                @click="handleInsertPlaceholder('footer')"
                class="px-2 py-1 text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60 flex items-center gap-1"
              >
                + Footer Bar
              </button>
            </div>
          </div>

          <div>
            <label class="text-[10px] text-slate-500 font-mono">Rules Prose & Markdown</label>
            <textarea
              v-model="activeChapter.content"
              @input="saveRulebook"
              rows="12"
              class="w-full bg-[#1E293B] border border-slate-700 rounded p-3 text-xs text-slate-200 font-sans leading-relaxed mt-1 resize-none font-mono"
            ></textarea>
          </div>

          <!-- Highlighted Glossary Terms Detected in this chapter -->
          <div class="border-t border-slate-800 pt-3">
            <span class="text-[10px] text-slate-500 font-mono block mb-1.5">Detected Terminology on this page:</span>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="item in rulebook.glossary"
                :key="item.term"
                v-show="activeChapter.content.toLowerCase().includes(item.term.toLowerCase())"
                class="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-mono"
              >
                {{ item.term }}
              </span>
            </div>
          </div>
        </div>

        <!-- 2. Auto-Generated Table of Contents -->
        <div v-else-if="activeTab === 'toc'" class="w-full max-w-2xl bg-[#0B0F17] border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
          <div class="border-b border-slate-800 pb-4 text-center">
            <h2 class="text-xl font-bold text-white font-display tracking-wide uppercase">Table of Contents</h2>
            <p class="text-xs text-slate-500 font-mono mt-1">Automatically compiled from chapter pages</p>
          </div>

          <div class="space-y-3">
            <div
              v-for="item in tableOfContents"
              :key="item.id"
              class="flex items-baseline justify-between text-xs py-1 border-b border-slate-800/60"
            >
              <span class="font-medium text-slate-200">{{ item.title }}</span>
              <span class="text-amber-400 font-mono font-bold">p. {{ item.pageNumber }}</span>
            </div>
            <!-- Dynamic Supplemental Pages -->
            <div class="flex items-baseline justify-between text-xs py-1 border-b border-slate-800/60">
              <span class="font-medium text-slate-300">Terminology Reference & Glossary</span>
              <span class="text-amber-400 font-mono font-bold">p. {{ tableOfContents.length + 1 }}</span>
            </div>
            <div class="flex items-baseline justify-between text-xs py-1 border-b border-slate-800/60">
              <span class="font-medium text-slate-300">Word Location & Topical Index</span>
              <span class="text-amber-400 font-mono font-bold">p. {{ tableOfContents.length + 2 }}</span>
            </div>
          </div>
        </div>

        <!-- 3. Auto-Generated Terminology Reference Page -->
        <div v-else-if="activeTab === 'glossary'" class="w-full max-w-2xl bg-[#0B0F17] border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
          <div class="border-b border-slate-800 pb-4 text-center">
            <h2 class="text-xl font-bold text-white font-display tracking-wide uppercase">Terminology Reference</h2>
            <p class="text-xs text-slate-500 font-mono mt-1">Official rules glossary & definitions</p>
          </div>

          <div class="space-y-4">
            <div
              v-for="(item, idx) in rulebook.glossary"
              :key="item.term"
              class="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-1"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-amber-300 font-display text-sm">{{ item.term }}</span>
                <button
                  @click="handleRemoveGlossary(idx)"
                  class="text-slate-500 hover:text-red-400 text-[10px]"
                >
                  Remove
                </button>
              </div>
              <p class="text-slate-300 leading-relaxed">{{ item.definition }}</p>
            </div>
          </div>
        </div>

        <!-- 4. Auto-Generated Word Location & Index Page -->
        <div v-else-if="activeTab === 'index'" class="w-full max-w-2xl bg-[#0B0F17] border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
          <div class="border-b border-slate-800 pb-4 text-center">
            <h2 class="text-xl font-bold text-white font-display tracking-wide uppercase">Word Location & Index Page</h2>
            <p class="text-xs text-slate-500 font-mono mt-1">
              Scans all chapters and lists exact page occurrences for rules references
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(pages, term) in wordLocationIndex"
              :key="term"
              class="p-3 bg-slate-900/60 border border-slate-800 rounded text-xs space-y-1"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-white font-display">{{ term }}</span>
                <span class="text-[10px] text-amber-400 font-mono">
                  {{ pages.length ? `p. ${pages.join(', ')}` : 'Not mentioned' }}
                </span>
              </div>
              <div class="text-[10px] text-slate-500 font-mono">
                Appears on {{ pages.length }} page{{ pages.length === 1 ? '' : 's' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Complete Booklet Preview -->
        <div v-else-if="activeTab === 'booklet'" class="w-full max-w-2xl space-y-6">
          <div
            v-for="ch in rulebook.chapters"
            :key="ch.id"
            class="bg-[#0B0F17] border border-slate-800 rounded-xl p-8 shadow-2xl space-y-4"
          >
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <span class="text-xs text-amber-400 font-mono font-bold">PAGE {{ ch.pageNumber }}</span>
              <span class="text-[10px] text-slate-500 font-mono uppercase">{{ rulebook.title }}</span>
            </div>
            <h3 class="text-lg font-bold text-white font-display">{{ ch.title }}</h3>
            <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{{ ch.content }}</p>
          </div>
        </div>
        </div>
      </div>
    </main>

    <!-- Right Inspector: Glossary & Index Keyword Management -->
    <aside class="w-80 border-l border-slate-800 bg-[#0B0F17] overflow-y-auto p-4 shrink-0 space-y-5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 class="text-xs font-semibold text-slate-200 font-display uppercase tracking-wider flex items-center gap-1.5">
          <Tag class="w-3.5 h-3.5 text-amber-400" />
          Rulebook Indexer
        </h3>
      </div>

      <!-- Add Tracked Keywords for Word Location -->
      <div class="space-y-3">
        <label class="text-[11px] font-semibold text-slate-400">Tracked Index Keywords</label>
        <div class="flex gap-1.5">
          <input
            v-model="newKeywordInput"
            @keyup.enter="handleAddKeyword"
            placeholder="e.g. Dice Check"
            class="flex-1 bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
          />
          <button
            @click="handleAddKeyword"
            class="px-2.5 py-1 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded font-display"
          >
            Add
          </button>
        </div>

        <div class="flex flex-wrap gap-1.5 pt-1">
          <span
            v-for="kw in rulebook.keywords"
            :key="kw"
            class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1.5"
          >
            {{ kw }}
            <button @click="handleRemoveKeyword(kw)" class="text-slate-500 hover:text-red-400">×</button>
          </span>
        </div>
      </div>

      <!-- Add Terminology Glossary -->
      <div class="border-t border-slate-800 pt-3 space-y-3">
        <label class="text-[11px] font-semibold text-slate-400">Add Terminology Definition</label>
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Term</span>
          <input
            v-model="newGlossaryTerm"
            placeholder="e.g. Line of Sight"
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
          />
        </div>
        <div>
          <span class="text-[10px] text-slate-500 font-mono">Definition</span>
          <textarea
            v-model="newGlossaryDef"
            rows="2"
            placeholder="Unobstructed straight line between attacker and target center."
            class="w-full bg-[#1E293B] border border-slate-700 rounded px-2 py-1 text-xs text-white resize-none"
          ></textarea>
        </div>
        <button
          @click="handleAddGlossary"
          class="w-full py-1 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded font-display"
        >
          Save to Glossary
        </button>
      </div>
    </aside>
  </div>
</template>
