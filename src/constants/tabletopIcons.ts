import type { TabletopIcon } from '../types/index.ts';

export const TABLETOP_ICONS: TabletopIcon[] = [
  // Combat
  { id: 'sword', name: 'Broadsword', glyph: '⚔️', category: 'combat', description: 'Physical attack power' },
  { id: 'shield', name: 'Kite Shield', glyph: '🛡️', category: 'combat', description: 'Armor and block defense' },
  { id: 'bow', name: 'Longbow', glyph: '🏹', category: 'combat', description: 'Ranged pierce attack' },
  { id: 'dagger', name: 'Stiletto Dagger', glyph: '🗡️', category: 'combat', description: 'Stealth and critical hit' },
  { id: 'axe', name: 'Battleaxe', glyph: '🪓', category: 'combat', description: 'Cleave and heavy trauma' },
  { id: 'wound', name: 'Wound / Blood', glyph: '🩸', category: 'combat', description: 'Physical damage counter' },
  { id: 'skull', name: 'Death Skull', glyph: '💀', category: 'combat', description: 'Lethal damage or defeat' },
  { id: 'target', name: 'Crosshairs', glyph: '🎯', category: 'combat', description: 'Accuracy and critical range' },
  { id: 'armor', name: 'Steel Armor', glyph: '🥋', category: 'combat', description: 'Damage reduction value' },
  { id: 'bomb', name: 'Powder Bomb', glyph: '💣', category: 'combat', description: 'Area of effect explosion' },

  // Magic
  { id: 'orb', name: 'Arcane Orb', glyph: '🔮', category: 'magic', description: 'Spellcasting power' },
  { id: 'fire', name: 'Pyromancy Fire', glyph: '🔥', category: 'magic', description: 'Burn and fire damage' },
  { id: 'ice', name: 'Frost Nova', glyph: '❄️', category: 'magic', description: 'Freeze and slow effect' },
  { id: 'lightning', name: 'Thunderbolt', glyph: '⚡', category: 'magic', description: 'Shock and pierce resistance' },
  { id: 'potion', name: 'Elixir Vial', glyph: '🧪', category: 'magic', description: 'Consumable restorative brew' },
  { id: 'scroll', name: 'Ancient Scroll', glyph: '📜', category: 'magic', description: 'Single-use incantation' },
  { id: 'portal', name: 'Dimensional Rift', glyph: '🌀', category: 'magic', description: 'Teleportation node' },
  { id: 'spark', name: 'Divine Radiance', glyph: '✨', category: 'magic', description: 'Holy buff and blessing' },
  { id: 'candle', name: 'Ritual Candle', glyph: '🕯️', category: 'magic', description: 'Channeled dark ritual' },

  // Resources
  { id: 'gold', name: 'Gold Coin', glyph: '💰', category: 'resources', description: 'Standard currency marker' },
  { id: 'gem', name: 'Arcane Ruby', glyph: '💎', category: 'resources', description: 'High-value rare treasure' },
  { id: 'wood', name: 'Timber Log', glyph: '🌲', category: 'resources', description: 'Crafting material wood' },
  { id: 'ore', name: 'Iron Pickaxe', glyph: '⛏️', category: 'resources', description: 'Metal mining resource' },
  { id: 'key', name: 'Dungeon Key', glyph: '🗝️', category: 'resources', description: 'Unlocks vault or portal' },
  { id: 'meat', name: 'Ration Meat', glyph: '🥩', category: 'resources', description: 'Supplies and upkeep' },
  { id: 'bread', name: 'Provision Bread', glyph: '🍞', category: 'resources', description: 'Camp nourishment' },
  { id: 'mana', name: 'Mana Droplet', glyph: '💧', category: 'resources', description: 'Energy pool point' },
  { id: 'chest', name: 'Treasure Chest', glyph: '📦', category: 'resources', description: 'Loot reward cache' },
  { id: 'pouch', name: 'Coin Pouch', glyph: '🪙', category: 'resources', description: 'Bank reserve' },

  // Dice & Tabletop
  { id: 'd20', name: 'Twenty-Sided Die', glyph: '🎲', category: 'dice', description: 'Check resolution roll' },
  { id: 'd6', name: 'Game Die', glyph: '🎯', category: 'dice', description: 'Action point dice check' },
  { id: 'hourglass', name: 'Turn Timer', glyph: '⏳', category: 'dice', description: 'Round count or cooldown' },
  { id: 'boot', name: 'Swift Boots', glyph: '👢', category: 'dice', description: 'Movement speed points' },
  { id: 'heart', name: 'Vitality Heart', glyph: '❤️', category: 'dice', description: 'Maximum life health points' },
  { id: 'crown', name: 'Victory Crown', glyph: '👑', category: 'dice', description: 'Victory point objective' },
  { id: 'flag', name: 'Faction Banner', glyph: '🚩', category: 'dice', description: 'Territory control mark' },
  { id: 'compass', name: 'Scout Compass', glyph: '🧭', category: 'dice', description: 'Exploration and direction' },
  { id: 'book', name: 'Grimoire Tome', glyph: '📖', category: 'dice', description: 'Rulebook codex' },

  // Factions & Monsters
  { id: 'dragon', name: 'Ancient Dragon', glyph: '🐉', category: 'factions', description: 'Apex boss enemy' },
  { id: 'beast', name: 'Dire Wolf', glyph: '🐺', category: 'factions', description: 'Wild predator encounter' },
  { id: 'eagle', name: 'War Griffin', glyph: '🦅', category: 'factions', description: 'Aerial allied mount' },
  { id: 'zombie', name: 'Undead Walker', glyph: '🧟', category: 'factions', description: 'Swarm ghoul minion' },
  { id: 'wizard', name: 'Grand Magus', glyph: '🧙', category: 'factions', description: 'Arcanist hero' },
  { id: 'rogue', name: 'Shadow Shinobi', glyph: '👤', category: 'factions', description: 'Stealth infiltrator' },
  { id: 'castle', name: 'Stronghold Keep', glyph: '🏰', category: 'factions', description: 'Fortified player base' },
  { id: 'mountain', name: 'Crag Peak', glyph: '⛰️', category: 'factions', description: 'Impassable terrain' }
];
