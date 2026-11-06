export interface GameProject {
  _id: string;
  name: string;
  description: string;
  unit: 'mm' | 'inch';
  bleedMm: number;
  createdAt: string;
  updatedAt: string;
}

export type ElementType = 'text' | 'image-frame' | 'icon' | 'shape';
export type ShapeType = 'rectangle' | 'circle' | 'rounded-rect' | 'hex' | 'badge';
export type PlaceholderPreset = 'header' | 'footer' | 'portrait' | 'effect' | 'marker' | 'hp' | 'stats' | 'cost' | 'custom';

export interface CanvasElement {
  id: string;
  name: string;
  type: ElementType;
  x: number; // mm
  y: number; // mm
  width: number; // mm
  height: number; // mm
  rotation: number; // degrees
  zIndex: number;
  locked: boolean;
  hidden: boolean;
  opacity: number; // 0 - 1

  // Text properties
  text?: string;
  fontFamily?: string;
  fontSize?: number; // pt
  fontWeight?: number; // 100 - 900
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  hasShadow?: boolean;
  shadowColor?: string;

  // Image Frame properties (with dual-layer foreground + background support)
  bgImageUrl?: string;
  fgImageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'fill';
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
  backgroundColor?: string;

  // Icon properties
  iconGlyph?: string;
  iconColor?: string;
  iconScale?: number;

  // Shape & Box Placeholder properties
  shapeType?: ShapeType;
  placeholderType?: PlaceholderPreset;
  placeholderLabel?: string;
  showPlaceholderLabel?: boolean;
  textHasBackground?: boolean;
  textBackgroundColor?: string;

  // Tile Flip Exploration properties (for board maps and flip elements)
  isFlipped?: boolean;
  flippedTitle?: string;
  flippedIcon?: string;
  flippedDescription?: string;
  flippedColor?: string;
  flippedBgImageUrl?: string;
}

export interface BoxDesignPreset {
  id: string;
  name: string;
  description: string;
  lidColor: string;
  sideColor: string;
  trayColor: string;
  accentColor: string;
  fontFamily: string;
  titleColor: string;
  subtitleColor: string;
  elements?: CanvasElement[];
}

export interface SmartGuide {
  type: 'horizontal' | 'vertical';
  pos: number; // in canvas pixels
}

export interface AssetItem {
  id: string;
  projectId: string;
  name: string;
  category: 'character' | 'texture' | 'item' | 'icon' | 'frame';
  tags: string[];
  url: string;
  fileSize?: string;
  createdAt: string;
}

export interface CardItem {
  id: string;
  name: string;
  type: string;
  cost: string;
  stats: string;
  rulesText: string;
  flavorText: string;
  artIcon: string;
  quantity: number;
  customBack?: string;
  elements?: CanvasElement[];
}

export interface CardMasterLayout {
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  headerHeight: number;
  bannerColor: string;
  badgeColor: string;
  masterElements?: CanvasElement[];
}

export interface CardGroup {
  _id: string;
  projectId: string;
  name: string;
  dimensions: {
    width: number;
    height: number;
    cornerRadius: number;
  };
  isSharedBack: boolean;
  masterLayout: CardMasterLayout;
  cardBack: {
    title: string;
    subtitle: string;
    color: string;
    borderColor: string;
    pattern: string;
    elements?: CanvasElement[];
  };
  cards: CardItem[];
}

export type BoxTemplateType =
  | 'telescope-2part'
  | 'tuck-box'
  | 'book-magnetic'
  | 'matchbox-sleeve'
  | 'roll-end-tuck';

export interface BoxDieline {
  _id: string;
  projectId: string;
  templateType: BoxTemplateType;
  name: string;
  targetDimensions: {
    width: number;
    depth: number;
    height: number;
  };
  materialThicknessMm: number;
  lidClearanceMm: number;
  group?: string; // 'Main Box' | 'Deck Box' | 'Side Box' | 'Expansion Box' | custom
  showDefaultLabels?: boolean;
  stylePresetName?: string;
  panels: {
    lidTop?: { title: string; subtitle: string; bgColor: string; accentColor: string };
    lidSides?: { text: string; color: string };
    trayBottom?: { text: string; color: string };
    [key: string]: any;
  };
  elements?: CanvasElement[];
}

export interface TokenItem {
  id: string;
  name: string;
  shape: 'circle' | 'square' | 'rounded-square' | 'hex' | 'shield';
  diameterMm: number;
  color: string;
  text: string;
  icon: string;
  quantity: number;
  elements?: CanvasElement[];
}

export interface TokenSet {
  _id: string;
  projectId: string;
  name: string;
  tokens: TokenItem[];
}

export interface StandeeItem {
  id: string;
  name: string;
  shape: 'arch' | 'rectangle' | 'contour';
  widthMm: number;
  heightMm: number;
  baseTabMm: {
    width: number;
    height: number;
  };
  color: string;
  icon: string;
  role: string;
  elements?: CanvasElement[];
}

export interface StandeeSet {
  _id: string;
  projectId: string;
  name: string;
  standees: StandeeItem[];
}

export interface BoardZone {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  shape?: 'rectangle' | 'circle' | 'hex';
  icon?: string;
  description?: string;
  isFlipped?: boolean;
  flippedTitle?: string;
  flippedIcon?: string;
  flippedColor?: string;
  flippedDescription?: string;
  flippedBgImageUrl?: string;
}

export interface BoardItem {
  _id: string;
  projectId: string;
  name: string;
  type: 'single' | 'bi-fold' | 'quad-fold' | 'six-fold' | 'player-mat';
  dimensionsMm: {
    width: number;
    height: number;
  };
  spineGapMm: number;
  gridType: 'none' | 'square' | 'hex';
  gridSizeMm: number;
  showCoordinates: boolean;
  zones: BoardZone[];
  elements?: CanvasElement[];
}

export interface RulebookChapter {
  id: string;
  title: string;
  pageNumber: number;
  content: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface RulebookDoc {
  _id: string;
  projectId: string;
  title: string;
  pageSize: 'A5' | 'A4' | 'LETTER';
  chapters: RulebookChapter[];
  glossary: GlossaryItem[];
  keywords: string[];
}

export interface TabletopIcon {
  id: string;
  name: string;
  glyph: string;
  category: 'combat' | 'magic' | 'resources' | 'dice' | 'factions' | 'ui' | 'conditions' | 'exploration' | 'equipment' | 'stats';
  description: string;
}
