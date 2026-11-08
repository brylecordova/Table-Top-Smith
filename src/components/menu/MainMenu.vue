<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  projectsList,
  fetchProjectsList,
  openProject,
  createNewProject,
  deleteProject,
  isLoading
} from '../../stores/projectStore.ts';
import { activeTheme, currentThemeId, customAccentColor } from '../../stores/themeStore.ts';
import ThemeConfigModal from './ThemeConfigModal.vue';

const searchQuery = ref('');
const showNewProjectModal = ref(false);
const showThemeModal = ref(false);
const newProjectName = ref('');
const newProjectDesc = ref('');
const selectedPreset = ref<'boardgame' | 'cardgame' | 'skirmish'>('boardgame');
const isSubmitting = ref(false);

onMounted(async () => {
  await fetchProjectsList();
});

const filteredProjects = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return projectsList.value;
  return projectsList.value.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q))
  );
});

async function handleCreateProject() {
  if (!newProjectName.value.trim()) return;
  isSubmitting.value = true;
  try {
    await createNewProject({
      name: newProjectName.value.trim(),
      description: newProjectDesc.value.trim()
    });
    showNewProjectModal.value = false;
    newProjectName.value = '';
    newProjectDesc.value = '';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDeleteProject(id: string, name: string) {
  if (confirm(`Are you sure you want to delete the project "${name}"? This action cannot be undone.`)) {
    await deleteProject(id);
  }
}

function formatDate(isoStr?: string) {
  if (!isoStr) return 'Recently';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recently';
  }
}
</script>

<template>
  <div
    class="min-h-screen w-full flex flex-col font-sans select-none overflow-y-auto transition-colors"
    :style="{ backgroundColor: activeTheme.bgBase, color: activeTheme.textBase }"
  >
    <!-- Main Menu Top Brand Bar -->
    <header
      class="border-b px-8 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-colors"
      :style="{
        borderColor: activeTheme.borderBase,
        backgroundColor: activeTheme.bgSurface + 'EE'
      }"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-base shadow-sm transition-colors"
          :style="{
            backgroundColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 20%, transparent)',
            borderColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 40%, transparent)',
            color: activeTheme.accentColor
          }"
        >
          TS
        </div>
        <div>
          <h1 class="text-lg font-bold tracking-tight font-display" :style="{ color: activeTheme.textBase }">
            TableSmith Studio
          </h1>
          <p class="text-[11px] font-mono" :style="{ color: activeTheme.textMuted }">
            Board Game Prototyping, Card Engine & Imposition Workstation
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Theme & Accent Configuration Button -->
        <button
          @click="showThemeModal = true"
          class="px-3.5 py-2 rounded-lg border flex items-center gap-2 text-xs font-semibold transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
          :style="{
            backgroundColor: activeTheme.bgCard,
            borderColor: activeTheme.borderBase,
            color: activeTheme.textBase
          }"
          title="Customize Editor Theme Presets & Accent Color"
        >
          <span
            class="w-3.5 h-3.5 rounded-full shadow-xs shrink-0 flex items-center justify-center"
            :style="{ backgroundColor: activeTheme.accentColor }"
          ></span>
          <i class="ri-palette-line text-sm" :style="{ color: activeTheme.accentColor }"></i>
          <span>Theme & Accents</span>
          <span
            class="hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded border"
            :style="{ borderColor: activeTheme.borderBase, color: activeTheme.textMuted }"
          >
            {{ activeTheme.name.split(' (')[0] }}
          </span>
        </button>

        <!-- Create New Project Button -->
        <button
          @click="showNewProjectModal = true"
          class="px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer hover:brightness-110"
          :style="{
            backgroundColor: activeTheme.accentColor,
            color: activeTheme.accentText
          }"
        >
          <i class="ri-add-line text-sm font-bold"></i>
          <span>Create New Project</span>
        </button>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
      <!-- Hero Welcome Card -->
      <section
        class="relative overflow-hidden rounded-2xl border p-8 shadow-2xl transition-colors"
        :style="{
          backgroundColor: activeTheme.bgSurface,
          borderColor: activeTheme.borderBase
        }"
      >
        <div
          class="absolute -right-10 -bottom-10 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          :style="{ backgroundColor: activeTheme.accentColor }"
        ></div>

        <div class="relative z-10 max-w-2xl space-y-3">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 15%, transparent)',
              borderColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 30%, transparent)',
              color: activeTheme.accentColor
            }"
          >
            <i class="ri-sparkling-line"></i>
            <span>Tabletop Design Suite</span>
          </div>
          <h2 class="text-3xl font-extrabold tracking-tight font-display" :style="{ color: activeTheme.textBase }">
            Design, Imposition & Manufacture Your Board Games
          </h2>
          <p class="text-sm leading-relaxed" :style="{ color: activeTheme.textMuted }">
            Create custom card groups, folding box dielines, punchboard die-cut tokens, figure standees, and game boards with print-ready duplex PDF export.
          </p>

          <div class="pt-3 flex flex-wrap items-center gap-3">
            <button
              @click="showNewProjectModal = true"
              class="px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer hover:brightness-110"
              :style="{
                backgroundColor: activeTheme.accentColor,
                color: activeTheme.accentText
              }"
            >
              <i class="ri-add-circle-line text-base"></i>
              <span>Create New Project</span>
            </button>
            <button
              v-if="projectsList.length > 0"
              @click="openProject(projectsList[0]._id)"
              class="px-5 py-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer hover:bg-slate-800/40"
              :style="{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.borderBase,
                color: activeTheme.textBase
              }"
            >
              <i class="ri-folder-open-line text-base" :style="{ color: activeTheme.accentColor }"></i>
              <span>Open Most Recent ({{ projectsList[0].name }})</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Existing Projects Section -->
      <section class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" :style="{ borderColor: activeTheme.borderBase }">
          <div>
            <h3 class="text-base font-bold font-display flex items-center gap-2" :style="{ color: activeTheme.textBase }">
              <i class="ri-folder-open-line" :style="{ color: activeTheme.accentColor }"></i>
              <span>Open / Work on Existing Project</span>
            </h3>
            <p class="text-xs" :style="{ color: activeTheme.textMuted }">
              Select a saved board game project to resume editing in the canvas studio
            </p>
          </div>

          <!-- Search Bar -->
          <div class="relative w-full sm:w-72">
            <i class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xs" :style="{ color: activeTheme.textMuted }"></i>
            <input
              v-model="searchQuery"
              placeholder="Filter saved projects..."
              class="w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
              :style="{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.borderBase,
                color: activeTheme.textBase
              }"
            />
          </div>
        </div>

        <!-- Projects Grid -->
        <div v-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="proj in filteredProjects"
            :key="proj._id"
            @click="openProject(proj._id)"
            class="group p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl relative"
            :style="{
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.borderBase
            }"
          >
            <div>
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded border flex items-center justify-center shrink-0"
                    :style="{
                      backgroundColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 15%, transparent)',
                      borderColor: 'color-mix(in srgb, ' + activeTheme.accentColor + ' 30%, transparent)',
                      color: activeTheme.accentColor
                    }"
                  >
                    <i class="ri-stack-line text-base"></i>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold line-clamp-1 font-display" :style="{ color: activeTheme.textBase }">
                      {{ proj.name }}
                    </h4>
                    <span class="text-[10px] font-mono" :style="{ color: activeTheme.textMuted }">Updated {{ formatDate(proj.updatedAt) }}</span>
                  </div>
                </div>

                <!-- Delete Project Button -->
                <button
                  @click.stop="handleDeleteProject(proj._id, proj.name)"
                  class="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <i class="ri-delete-bin-line text-xs"></i>
                </button>
              </div>

              <p class="text-xs mt-3 line-clamp-2 leading-relaxed" :style="{ color: activeTheme.textMuted }">
                {{ proj.description || 'Custom tabletop game project created with TableSmith.' }}
              </p>
            </div>

            <!-- Footer Meta & Open CTA -->
            <div class="pt-3 border-t flex items-center justify-between text-xs" :style="{ borderColor: activeTheme.borderBase }">
              <span class="text-[10px] font-mono uppercase tracking-wider" :style="{ color: activeTheme.textMuted }">
                Unit: {{ proj.unit }} · Bleed: {{ proj.bleedMm }}mm
              </span>
              <span class="font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]" :style="{ color: activeTheme.accentColor }">
                <span>Open Project</span>
                <i class="ri-arrow-right-line text-xs"></i>
              </span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/30 p-6 space-y-3">
          <div class="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
            <i class="ri-folder-open-line"></i>
          </div>
          <h4 class="text-sm font-semibold text-slate-300">No board game projects found</h4>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by creating your first project, or explore with a pre-configured sample.
          </p>
          <button
            @click="showNewProjectModal = true"
            class="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <i class="ri-add-line"></i>
            <span>Create New Project</span>
          </button>
        </div>
      </section>
    </main>

    <!-- Create New Project Modal -->
    <div
      v-if="showNewProjectModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-150"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <i class="ri-add-circle-line text-base"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white font-display">Create New Board Game Project</h3>
              <p class="text-[11px] text-slate-400">Initialize a new project with cards, box dielines, and tokens</p>
            </div>
          </div>
          <button
            @click="showNewProjectModal = false"
            class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <i class="ri-close-line text-lg"></i>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-[11px] font-semibold text-slate-300 mb-1">Project Name *</label>
            <input
              v-model="newProjectName"
              placeholder="e.g. Chronicles of Eldoria, Cyberdeck 2099, Kingdom Siege..."
              class="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
              autofocus
            />
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-300 mb-1">Game Description / Tagline</label>
            <textarea
              v-model="newProjectDesc"
              rows="3"
              placeholder="Brief description of the game theme, mechanics, or player count..."
              class="w-full bg-[#0B0F17] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 text-xs resize-none"
            ></textarea>
          </div>

          <!-- Project Preset Selection -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-300 mb-2">Project Preset</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="selectedPreset = 'boardgame'"
                class="p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1"
                :class="selectedPreset === 'boardgame' ? 'bg-amber-500/15 border-amber-500/50 text-amber-200' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'"
              >
                <i class="ri-map-2-line text-lg text-amber-400"></i>
                <div class="font-bold text-[11px]">Full Board Game</div>
                <div class="text-[9px] opacity-75">Board, cards, tokens, box</div>
              </button>

              <button
                type="button"
                @click="selectedPreset = 'cardgame'"
                class="p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1"
                :class="selectedPreset === 'cardgame' ? 'bg-amber-500/15 border-amber-500/50 text-amber-200' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'"
              >
                <i class="ri-stack-line text-lg text-amber-400"></i>
                <div class="font-bold text-[11px]">Card Game / TCG</div>
                <div class="text-[9px] opacity-75">Multiple decks & tuck box</div>
              </button>

              <button
                type="button"
                @click="selectedPreset = 'skirmish'"
                class="p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1"
                :class="selectedPreset === 'skirmish' ? 'bg-amber-500/15 border-amber-500/50 text-amber-200' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'"
              >
                <i class="ri-user-star-line text-lg text-amber-400"></i>
                <div class="font-bold text-[11px]">Skirmish Kit</div>
                <div class="text-[9px] opacity-75">Standees, terrain, rulebook</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            @click="showNewProjectModal = false"
            class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleCreateProject"
            :disabled="!newProjectName.trim() || isSubmitting"
            class="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <i v-if="isSubmitting" class="ri-loader-4-line animate-spin text-sm"></i>
            <i v-else class="ri-check-line text-sm"></i>
            <span>Create & Launch Studio</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Theme & Accent Configuration Modal -->
    <ThemeConfigModal
      :isOpen="showThemeModal"
      @close="showThemeModal = false"
    />
  </div>
</template>
