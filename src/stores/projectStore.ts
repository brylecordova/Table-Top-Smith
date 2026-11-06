import { reactive, ref, computed } from 'vue';
import type {
  GameProject,
  CardGroup,
  CardItem,
  BoxDieline,
  TokenSet,
  TokenItem,
  StandeeSet,
  StandeeItem,
  BoardItem,
  RulebookDoc,
  RulebookChapter,
  GlossaryItem,
  AssetItem
} from '../types/index.ts';

export type ActiveTool = 'cards' | 'boxes' | 'tokens' | 'standees' | 'boards' | 'rulebook' | 'print';

export const activeTool = ref<ActiveTool>('cards');
export const isLoading = ref<boolean>(false);
export const isSaving = ref<boolean>(false);
export const toastMessage = ref<string>('');
export const isAssetSidebarOpen = ref<boolean>(true);

export function showToast(msg: string) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = '';
    }
  }, 3500);
}

export const project = ref<GameProject>({
  _id: 'proj_iron_stone',
  name: 'Chronicles of Iron & Aether',
  description: 'Tactical skirmish board game with modular player boards, item cards, and standees',
  unit: 'mm',
  bleedMm: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const cardGroups = ref<CardGroup[]>([]);
export const selectedGroupId = ref<string>('');
export const selectedCardId = ref<string>('');

export const boxDielines = ref<BoxDieline[]>([]);
export const selectedBoxId = ref<string>('');

export const tokenSets = ref<TokenSet[]>([]);
export const standeeSets = ref<StandeeSet[]>([]);
export const boards = ref<BoardItem[]>([]);
export const selectedBoardId = ref<string>('');
export const assets = ref<AssetItem[]>([]);

export const rulebook = ref<RulebookDoc>({
  _id: 'rb_manual',
  projectId: 'proj_iron_stone',
  title: 'Rulebook & Codex of Play',
  pageSize: 'A5',
  chapters: [],
  glossary: [],
  keywords: []
});

export const activeCardGroup = computed(() => {
  return cardGroups.value.find(g => g._id === selectedGroupId.value) || cardGroups.value[0] || null;
});

export const activeCard = computed(() => {
  if (!activeCardGroup.value) return null;
  return activeCardGroup.value.cards.find(c => c.id === selectedCardId.value) || activeCardGroup.value.cards[0] || null;
});

export const activeBox = computed(() => {
  return boxDielines.value.find(b => b._id === selectedBoxId.value) || boxDielines.value[0] || null;
});

export const activeBoard = computed(() => {
  return boards.value.find(b => b._id === selectedBoardId.value) || boards.value[0] || null;
});

// Load full project from Express API
export async function fetchProject(projectId = 'proj_iron_stone') {
  isLoading.value = true;
  try {
    const res = await fetch(`/api/projects/${projectId}`);
    if (!res.ok) throw new Error('Failed to load project');
    const data = await res.json();
    project.value = data.project;
    cardGroups.value = data.cardGroups || [];
    boxDielines.value = data.boxDielines || [];
    tokenSets.value = data.tokens || [];
    standeeSets.value = data.standees || [];
    boards.value = data.boards || [];
    assets.value = data.assets || [];
    if (data.rulebook) {
      rulebook.value = data.rulebook;
    }

    if (cardGroups.value.length > 0 && !selectedGroupId.value) {
      selectedGroupId.value = cardGroups.value[0]._id;
      if (cardGroups.value[0].cards.length > 0) {
        selectedCardId.value = cardGroups.value[0].cards[0].id;
      }
    }
    if (boxDielines.value.length > 0 && !selectedBoxId.value) {
      selectedBoxId.value = boxDielines.value[0]._id;
    }
    if (boards.value.length > 0 && !selectedBoardId.value) {
      selectedBoardId.value = boards.value[0]._id;
    }
  } catch (err) {
    console.error('Error fetching project:', err);
    showToast('Loaded local workstation data');
  } finally {
    isLoading.value = false;
  }
}

// Save Card Group
export async function saveCardGroup(group: CardGroup) {
  isSaving.value = true;
  try {
    await fetch(`/api/projects/${project.value._id}/cardGroups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group)
    });
    showToast(`Saved card group "${group.name}"`);
  } catch (err) {
    console.error('Failed to save card group:', err);
  } finally {
    isSaving.value = false;
  }
}

// Save Box Dieline
export async function saveBoxDieline(dieline: BoxDieline) {
  isSaving.value = true;
  try {
    await fetch(`/api/projects/${project.value._id}/boxDielines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dieline)
    });
    showToast(`Saved box template "${dieline.name}"`);
  } catch (err) {
    console.error('Failed to save box dieline:', err);
  } finally {
    isSaving.value = false;
  }
}

// Save Tokens
export async function saveTokens(tokenSet: TokenSet) {
  isSaving.value = true;
  try {
    await fetch(`/api/projects/${project.value._id}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenSet)
    });
    showToast('Saved token collection');
  } catch (err) {
    console.error('Failed to save tokens:', err);
  } finally {
    isSaving.value = false;
  }
}

// Save Standees
export async function saveStandees(standeeSet: StandeeSet) {
  isSaving.value = true;
  try {
    await fetch(`/api/projects/${project.value._id}/standees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(standeeSet)
    });
    showToast('Saved standees');
  } catch (err) {
    console.error('Failed to save standees:', err);
  } finally {
    isSaving.value = false;
  }
}

// Save Boards
export async function saveBoard(board: BoardItem) {
  isSaving.value = true;
  try {
    await fetch(`/api/projects/${project.value._id}/boards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(board)
    });
    showToast(`Saved board "${board.name}"`);
  } catch (err) {
    console.error('Failed to save board:', err);
  } finally {
    isSaving.value = false;
  }
}

// Save Rulebook
export async function saveRulebook() {
  isSaving.value = true;
  try {
    await fetch(`/api/projects/${project.value._id}/rulebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rulebook.value)
    });
    showToast('Saved rulebook');
  } catch (err) {
    console.error('Failed to save rulebook:', err);
  } finally {
    isSaving.value = false;
  }
}

// Asset Management
export async function saveAsset(asset: AssetItem) {
  isSaving.value = true;
  try {
    const res = await fetch(`/api/projects/${project.value._id}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset)
    });
    const saved = await res.json();
    const idx = assets.value.findIndex(a => a.id === saved._id || a.id === saved.id);
    if (idx >= 0) {
      assets.value[idx] = saved;
    } else {
      assets.value.unshift(saved);
    }
    showToast(`Saved asset "${asset.name}"`);
  } catch (err) {
    console.error('Failed to save asset:', err);
  } finally {
    isSaving.value = false;
  }
}

export async function removeAsset(assetId: string) {
  try {
    await fetch(`/api/projects/${project.value._id}/assets/${assetId}`, {
      method: 'DELETE'
    });
    assets.value = assets.value.filter(a => a.id !== assetId);
    showToast('Removed asset');
  } catch (err) {
    console.error('Failed to delete asset:', err);
  }
}
