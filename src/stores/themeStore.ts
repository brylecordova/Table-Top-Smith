import { ref, computed, watch } from 'vue';

export interface ThemeConfig {
  id: string;
  name: string;
  mode: 'dark' | 'light' | 'midnight' | 'parchment' | 'emerald';
  accentColor: string; // e.g. #F59E0B
  accentHover: string;
  accentText: string;
  bgBase: string; // Background of app/viewport
  bgSurface: string; // Background of panels/sidebars
  bgCard: string; // Background of cards/containers
  borderBase: string; // Border lines
  textBase: string; // Primary text color
  textMuted: string; // Secondary/muted text color
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'theme_amber_dark',
    name: 'Classic Forge (Amber & Obsidian)',
    mode: 'dark',
    accentColor: '#F59E0B',
    accentHover: '#D97706',
    accentText: '#0F172A',
    bgBase: '#0B0F17',
    bgSurface: '#0F172A',
    bgCard: '#1E293B',
    borderBase: '#334155',
    textBase: '#F8FAFC',
    textMuted: '#94A3B8'
  },
  {
    id: 'theme_light_minimal',
    name: 'Studio Draft (Clean Paper Light)',
    mode: 'light',
    accentColor: '#D97706',
    accentHover: '#B45309',
    accentText: '#FFFFFF',
    bgBase: '#F1F5F9',
    bgSurface: '#FFFFFF',
    bgCard: '#F8FAFC',
    borderBase: '#CBD5E1',
    textBase: '#0F172A',
    textMuted: '#64748B'
  },
  {
    id: 'theme_cyber_neon',
    name: 'Cyber Void (Neon Cyan & Obsidian)',
    mode: 'dark',
    accentColor: '#06B6D4',
    accentHover: '#0891B2',
    accentText: '#020617',
    bgBase: '#030712',
    bgSurface: '#0B0F19',
    bgCard: '#111827',
    borderBase: '#1F2937',
    textBase: '#F9FAFB',
    textMuted: '#9CA3AF'
  },
  {
    id: 'theme_crimson_citadel',
    name: 'Citadel War (Crimson & Slate)',
    mode: 'dark',
    accentColor: '#EF4444',
    accentHover: '#DC2626',
    accentText: '#FFFFFF',
    bgBase: '#0B090A',
    bgSurface: '#161113',
    bgCard: '#241419',
    borderBase: '#3F1D24',
    textBase: '#FFF1F2',
    textMuted: '#FDA4AF'
  },
  {
    id: 'theme_emerald_wilds',
    name: 'Wilds Codex (Forest Emerald & Gold)',
    mode: 'emerald',
    accentColor: '#10B981',
    accentHover: '#059669',
    accentText: '#022C22',
    bgBase: '#021810',
    bgSurface: '#062E1F',
    bgCard: '#0B3F2C',
    borderBase: '#14532D',
    textBase: '#ECFDF5',
    textMuted: '#6EE7B7'
  },
  {
    id: 'theme_ancient_parchment',
    name: 'Ancient Tome (Warm Parchment & Bronze)',
    mode: 'parchment',
    accentColor: '#B45309',
    accentHover: '#92400E',
    accentText: '#FEF3C7',
    bgBase: '#F5EBE0',
    bgSurface: '#E6D7C3',
    bgCard: '#D5C3AA',
    borderBase: '#B8A388',
    textBase: '#2C1D11',
    textMuted: '#5C4430'
  },
  {
    id: 'theme_violet_arcana',
    name: 'Violet Arcana (Mystic Purple)',
    mode: 'dark',
    accentColor: '#A855F7',
    accentHover: '#9333EA',
    accentText: '#FFFFFF',
    bgBase: '#0B0814',
    bgSurface: '#140E24',
    bgCard: '#1E1538',
    borderBase: '#3B2A63',
    textBase: '#FAF5FF',
    textMuted: '#D8B4FE'
  }
];

export const ACCENT_SWATCHES = [
  { name: 'Classic Gold / Amber', color: '#F59E0B' },
  { name: 'Dragon Crimson', color: '#EF4444' },
  { name: 'Arcane Violet', color: '#8B5CF6' },
  { name: 'Neon Cyber Cyan', color: '#06B6D4' },
  { name: 'Forest Emerald', color: '#10B981' },
  { name: 'Solar Orange', color: '#F97316' },
  { name: 'Sapphire Blue', color: '#3B82F6' },
  { name: 'Rose Pink', color: '#EC4899' },
  { name: 'Bronze Leather', color: '#D97706' },
  { name: 'Monochrome Silver', color: '#E2E8F0' }
];

const STORAGE_KEY = 'tablesmith_theme_settings';

function loadStoredTheme(): { presetId: string; customAccent: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse stored theme:', e);
  }
  return { presetId: 'theme_amber_dark', customAccent: null };
}

const initial = loadStoredTheme();
export const currentThemeId = ref<string>(initial.presetId);
export const customAccentColor = ref<string | null>(initial.customAccent);

export const activeTheme = computed<ThemeConfig>(() => {
  const base = THEME_PRESETS.find(p => p.id === currentThemeId.value) || THEME_PRESETS[0];
  if (!customAccentColor.value) return base;

  // Derive custom accent hover and text contrast
  const hex = customAccentColor.value;
  return {
    ...base,
    accentColor: hex,
    accentHover: adjustBrightness(hex, -20),
    accentText: getContrastTextColor(hex)
  };
});

function adjustBrightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getContrastTextColor(hex: string): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return '#FFFFFF';
  const r = (num >> 16);
  const g = ((num >> 8) & 0x00FF);
  const b = (num & 0x0000FF);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 140 ? '#0B0F17' : '#FFFFFF';
}

export function setThemePreset(presetId: string) {
  currentThemeId.value = presetId;
  customAccentColor.value = null; // reset to preset's native accent
  applyThemeToDom();
  saveTheme();
}

export function setCustomAccent(color: string) {
  customAccentColor.value = color;
  applyThemeToDom();
  saveTheme();
}

export function resetToPresetAccent() {
  customAccentColor.value = null;
  applyThemeToDom();
  saveTheme();
}

function saveTheme() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      presetId: currentThemeId.value,
      customAccent: customAccentColor.value
    }));
  } catch (e) {
    console.error('Failed to save theme to localStorage:', e);
  }
}

export function applyThemeToDom() {
  if (typeof document === 'undefined') return;
  const theme = activeTheme.value;
  const root = document.documentElement;

  // Apply CSS custom properties
  root.style.setProperty('--ts-accent', theme.accentColor);
  root.style.setProperty('--ts-accent-hover', theme.accentHover);
  root.style.setProperty('--ts-accent-text', theme.accentText);
  root.style.setProperty('--ts-bg-base', theme.bgBase);
  root.style.setProperty('--ts-bg-surface', theme.bgSurface);
  root.style.setProperty('--ts-bg-card', theme.bgCard);
  root.style.setProperty('--ts-border', theme.borderBase);
  root.style.setProperty('--ts-text-base', theme.textBase);
  root.style.setProperty('--ts-text-muted', theme.textMuted);

  // Apply data-theme attribute on root and body
  root.setAttribute('data-theme', theme.mode);
  if (document.body) {
    document.body.setAttribute('data-theme', theme.mode);
  }
}

// Watch activeTheme and apply whenever computed changes
watch(activeTheme, () => {
  applyThemeToDom();
}, { immediate: true });

// Auto apply on init
if (typeof window !== 'undefined') {
  applyThemeToDom();
}
