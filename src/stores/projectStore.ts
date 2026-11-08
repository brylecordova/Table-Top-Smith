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

export const currentView = ref<'menu' | 'builder'>('menu');
export const projectsList = ref<GameProject[]>([]);
export const activeTool = ref<ActiveTool>('cards');
export const isLoading = ref<boolean>(false);
export const isSaving = ref<boolean>(false);
export const toastMessage = ref<string>('');
export const isAssetSidebarOpen = ref<boolean>(false);

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

// ==========================================
// MAIN MENU & PROJECT PERSISTENCE
// ==========================================

export async function fetchProjectsList() {
  try {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      projectsList.value = data || [];
    }
  } catch (err) {
    console.error('Failed to fetch projects list:', err);
  }
}

export async function openProject(projectId: string) {
  await fetchProject(projectId);
  currentView.value = 'builder';
  showToast(`Opened project "${project.value.name}"`);
}

export async function returnToMainMenu() {
  if (activeCardGroup.value) {
    await saveCardGroup(activeCardGroup.value);
  }
  currentView.value = 'menu';
  await fetchProjectsList();
  showToast('Returned to Main Menu');
}

export async function createNewProject(payload: { name: string; description?: string }) {
  isLoading.value = true;
  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name || 'New Board Game Project',
        description: payload.description || 'Custom board game kit created in TableSmith Studio',
        unit: 'mm',
        bleedMm: 3
      })
    });
    const newProj = await res.json();
    const projId = newProj._id;

    // Create default initial Card Group ("Core Cards")
    const initialGroup: CardGroup = {
      _id: `grp_${Date.now()}`,
      projectId: projId,
      name: 'Core Cards',
      dimensions: { width: 63.5, height: 88.9, cornerRadius: 3 },
      isSharedBack: true,
      masterLayout: {
        borderWidth: 2,
        borderColor: '#F59E0B',
        backgroundColor: '#1E293B',
        headerHeight: 18,
        bannerColor: '#0F172A',
        badgeColor: '#F59E0B'
      },
      cardBack: {
        title: (newProj.name || 'CORE').toUpperCase(),
        subtitle: 'CORE DECK',
        color: '#0F172A',
        borderColor: '#F59E0B',
        pattern: 'diamonds'
      },
      cards: [
        {
          id: `card_${Date.now()}_1`,
          name: 'Hero Vanguard',
          type: 'Unit',
          cost: '3',
          stats: 'ATK 4 · HP 5',
          rulesText: 'First strike. When attacking, grant adjacent allies +1 DEF until end of round.',
          flavorText: 'Frontline champion guarding the frontier realm.',
          artIcon: 'ri-sword-line',
          quantity: 2
        }
      ]
    };

    await fetch(`/api/projects/${projId}/cardGroups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialGroup)
    });

    await fetchProject(projId);
    currentView.value = 'builder';
    showToast(`Created project "${newProj.name}"`);
  } catch (err) {
    console.error('Failed to create new project:', err);
    showToast('Error creating new project');
  } finally {
    isLoading.value = false;
  }
}

export async function deleteProject(projectId: string) {
  try {
    const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    if (res.ok) {
      projectsList.value = projectsList.value.filter(p => p._id !== projectId);
      showToast('Project deleted');
    }
  } catch (err) {
    console.error('Failed to delete project:', err);
  }
}

// ==========================================
// CARD GROUP MANAGEMENT ENGINE
// ==========================================

export async function createCardGroup(name: string, dimensions = { width: 63.5, height: 88.9, cornerRadius: 3 }) {
  const newGroupId = `grp_${Date.now()}`;
  const newGroup: CardGroup = {
    _id: newGroupId,
    projectId: project.value._id,
    name: name.trim() || 'New Card Group',
    dimensions,
    isSharedBack: true,
    masterLayout: {
      borderWidth: 2,
      borderColor: '#F59E0B',
      backgroundColor: '#1E293B',
      headerHeight: 18,
      bannerColor: '#0F172A',
      badgeColor: '#F59E0B'
    },
    cardBack: {
      title: (name || 'CARDS').toUpperCase(),
      subtitle: project.value.name.toUpperCase(),
      color: '#0F172A',
      borderColor: '#F59E0B',
      pattern: 'diamonds'
    },
    cards: [
      {
        id: `card_${Date.now()}`,
        name: `${name} Card 1`,
        type: 'Standard',
        cost: '1',
        stats: 'PWR 1',
        rulesText: 'Standard card effect rules text.',
        flavorText: 'Atmospheric lore or worldbuilding quote.',
        artIcon: 'ri-sword-line',
        quantity: 1
      }
    ]
  };

  cardGroups.value.push(newGroup);
  selectedGroupId.value = newGroupId;
  selectedCardId.value = newGroup.cards[0].id;
  await saveCardGroup(newGroup);
  showToast(`Created card group "${newGroup.name}"`);
}

export async function renameCardGroup(groupId: string, newName: string) {
  const group = cardGroups.value.find(g => g._id === groupId);
  if (!group || !newName.trim()) return;
  group.name = newName.trim();
  await saveCardGroup(group);
  showToast(`Renamed card group to "${group.name}"`);
}

export async function deleteCardGroup(groupId: string) {
  if (cardGroups.value.length <= 1) {
    showToast('Cannot delete the only card group. Create another first.');
    return;
  }
  const idx = cardGroups.value.findIndex(g => g._id === groupId);
  if (idx < 0) return;
  const deletedName = cardGroups.value[idx].name;
  cardGroups.value.splice(idx, 1);

  // Switch selected group
  selectedGroupId.value = cardGroups.value[0]._id;
  if (cardGroups.value[0].cards.length > 0) {
    selectedCardId.value = cardGroups.value[0].cards[0].id;
  } else {
    selectedCardId.value = '';
  }

  try {
    await fetch(`/api/projects/${project.value._id}/cardGroups/${groupId}`, {
      method: 'DELETE'
    });
    showToast(`Deleted card group "${deletedName}"`);
  } catch (err) {
    console.error('Failed to delete card group on backend:', err);
  }
}

export async function addCardToGroup(groupId: string) {
  const group = cardGroups.value.find(g => g._id === groupId);
  if (!group) return;

  const newCardId = `card_${Date.now()}`;
  const newCard: CardItem = {
    id: newCardId,
    name: `New ${group.name} Card`,
    type: 'Action',
    cost: '1',
    stats: 'STAT 1',
    rulesText: 'Describe card effect, mechanics, and triggers here.',
    flavorText: 'Atmospheric lore or worldbuilding quote.',
    artIcon: 'ri-sword-line',
    quantity: 1
  };

  group.cards.push(newCard);
  selectedGroupId.value = group._id;
  selectedCardId.value = newCardId;
  await saveCardGroup(group);
  showToast(`Added new card to "${group.name}"`);
}

export async function deleteCard(groupId: string, cardId: string) {
  const group = cardGroups.value.find(g => g._id === groupId);
  if (!group) return;
  const idx = group.cards.findIndex(c => c.id === cardId);
  if (idx < 0) return;
  group.cards.splice(idx, 1);
  if (group.cards.length > 0) {
    selectedCardId.value = group.cards[Math.max(0, idx - 1)].id;
  } else {
    selectedCardId.value = '';
  }
  await saveCardGroup(group);
  showToast('Deleted card');
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
