import type { TabletopIcon } from '../types/index.ts';

export const TABLETOP_ICONS: TabletopIcon[] = [
  // ==========================================
  // 1. CHAT ICONS (NEW CATEGORY - Canvas & Inline placement)
  // ==========================================
  { id: 'chat_speech', name: 'Chat Bubble', glyph: '💬', cssClass: 'ri-chat-1-line', category: 'chat', set: 'chat', description: 'Standard dialogue speech balloon' },
  { id: 'chat_smile', name: 'Chat Smile', glyph: '😊', cssClass: 'ri-chat-smile-2-line', category: 'chat', set: 'chat', description: 'Friendly expression emote' },
  { id: 'chat_quote', name: 'Dialogue Quote', glyph: '🗨️', cssClass: 'ri-chat-quote-line', category: 'chat', set: 'chat', description: 'Quote or card flavor narrative' },
  { id: 'chat_heart', name: 'Love Reaction', glyph: '❤️', cssClass: 'ri-heart-3-line', category: 'chat', set: 'chat', description: 'Affection or life reaction' },
  { id: 'chat_thumb_up', name: 'Thumbs Up', glyph: '👍', cssClass: 'ri-thumb-up-line', category: 'chat', set: 'chat', description: 'Approval and confirmed vote' },
  { id: 'chat_thumb_down', name: 'Thumbs Down', glyph: '👎', cssClass: 'ri-thumb-down-line', category: 'chat', set: 'chat', description: 'Disapproval or veto vote' },
  { id: 'chat_question', name: 'Question Mark', glyph: '❓', cssClass: 'ri-question-line', category: 'chat', set: 'chat', description: 'Query prompt or mystery' },
  { id: 'chat_exclamation', name: 'Warning Alert', glyph: '❗', cssClass: 'ri-error-warning-line', category: 'chat', set: 'chat', description: 'Urgent notice or exclamation' },
  { id: 'chat_flame', name: 'Hot Reaction', glyph: '🔥', cssClass: 'ri-fire-line', category: 'chat', set: 'chat', description: 'Hype streak or burn token' },
  { id: 'chat_star', name: 'Star Favor', glyph: '⭐', cssClass: 'ri-star-line', category: 'chat', set: 'chat', description: 'Favor award or reputation' },
  { id: 'chat_trophy', name: 'Victory Trophy', glyph: '🏆', cssClass: 'ri-trophy-line', category: 'chat', set: 'chat', description: 'Achievement or winner reaction' },
  { id: 'chat_dice', name: 'Dice Roll', glyph: '🎲', cssClass: 'ri-dice-line', category: 'chat', set: 'chat', description: 'Inline dice roll prompt' },
  { id: 'chat_check', name: 'Checkmark Pass', glyph: '✅', cssClass: 'ri-checkbox-circle-line', category: 'chat', set: 'chat', description: 'Inline condition satisfied' },
  { id: 'chat_cross', name: 'Cross Denied', glyph: '❌', cssClass: 'ri-close-circle-line', category: 'chat', set: 'chat', description: 'Inline condition failed' },
  { id: 'chat_skull', name: 'Skull Hazard', glyph: '💀', cssClass: 'ri-skull-line', category: 'chat', set: 'chat', description: 'Danger or defeat marker' },
  { id: 'chat_swords', name: 'Swords Duel', glyph: '⚔️', cssClass: 'ri-sword-line', category: 'chat', set: 'chat', description: 'Inline attack or combat indicator' },
  { id: 'chat_shield', name: 'Shield Defend', glyph: '🛡️', cssClass: 'ri-shield-check-line', category: 'chat', set: 'chat', description: 'Inline defense indicator' },
  { id: 'chat_sparkle', name: 'Sparkle Magic', glyph: '✨', cssClass: 'ri-sparkling-line', category: 'chat', set: 'chat', description: 'Inline magical effect symbol' },
  { id: 'chat_coin', name: 'Gold Token', glyph: '🪙', cssClass: 'ri-copper-coin-line', category: 'chat', set: 'chat', description: 'Inline cost or reward token' },
  { id: 'chat_time', name: 'Turn Timer', glyph: '⏱️', cssClass: 'ri-time-line', category: 'chat', set: 'chat', description: 'Inline round countdown' },
  { id: 'chat_sound', name: 'Shout Alert', glyph: '📢', cssClass: 'ri-volume-up-line', category: 'chat', set: 'chat', description: 'Proclamation or horn call' },
  { id: 'chat_mute', name: 'Silence Hush', glyph: '🤫', cssClass: 'ri-volume-mute-line', category: 'chat', set: 'chat', description: 'Stealth or silence indicator' },
  { id: 'chat_crown', name: 'King Crown', glyph: '👑', cssClass: 'ri-vip-crown-line', category: 'chat', set: 'chat', description: 'Game master or ruler' },
  { id: 'chat_spark', name: 'Energy Bolt', glyph: '⚡', cssClass: 'ri-flashlight-line', category: 'chat', set: 'chat', description: 'Instant speed reaction' },
  { id: 'chat_discuss', name: 'Dialogue Discussion', glyph: '💬', cssClass: 'ri-discuss-line', category: 'chat', set: 'chat', description: 'Party conversation or debate' },
  { id: 'chat_message', name: 'Message Box', glyph: '✉️', cssClass: 'ri-message-3-line', category: 'chat', set: 'chat', description: 'Secret message or mission note' },
  { id: 'chat_happy', name: 'Joyful Emote', glyph: '😄', cssClass: 'ri-emotion-happy-line', category: 'chat', set: 'chat', description: 'Triumphant celebratory emote' },
  { id: 'chat_laugh', name: 'Laughing Emote', glyph: '😆', cssClass: 'ri-emotion-laugh-line', category: 'chat', set: 'chat', description: 'Amused party reaction' },
  { id: 'chat_unhappy', name: 'Sad Emote', glyph: '😟', cssClass: 'ri-emotion-unhappy-line', category: 'chat', set: 'chat', description: 'Disappointed party reaction' },
  { id: 'chat_qa', name: 'Q&A Dialogue', glyph: '🗨️', cssClass: 'ri-question-answer-line', category: 'chat', set: 'chat', description: 'Rule clarification and Q&A' },

  // ==========================================
  // 2. COMBAT & WEAPONS (Remix / RPG-Awesome - Canvas Only)
  // ==========================================
  { id: 'sword', name: 'Broadsword', glyph: '⚔️', cssClass: 'ri-sword-line', category: 'combat', set: 'remix', description: 'Physical attack power' },
  { id: 'shield', name: 'Kite Shield', glyph: '🛡️', cssClass: 'ri-shield-line', category: 'combat', set: 'remix', description: 'Armor and block defense' },
  { id: 'bow', name: 'Longbow', glyph: '🏹', cssClass: 'ra ra-crossbow', category: 'combat', set: 'rpg-awesome', description: 'Ranged pierce attack' },
  { id: 'dagger', name: 'Stiletto Dagger', glyph: '🗡️', cssClass: 'ra ra-daggers', category: 'combat', set: 'rpg-awesome', description: 'Stealth and critical hit' },
  { id: 'axe', name: 'Battleaxe', glyph: '🪓', cssClass: 'ra ra-axe', category: 'combat', set: 'rpg-awesome', description: 'Cleave and heavy trauma' },
  { id: 'double_battleaxe', name: 'double battleaxe', glyph: '🪓', cssClass: 'ra ra-crossed-axes', category: 'combat', set: 'rpg-awesome', description: 'Heavy double-bladed cleaving battleaxe' },
  { id: 'iron_ball_flail', name: 'iron ball flail', glyph: '⛓️', cssClass: 'ra ra-spikeball', category: 'combat', set: 'rpg-awesome', description: 'Heavy spiked iron flail ball' },
  { id: 'great_tower_shield', name: 'great tower shield', glyph: '🛡️', cssClass: 'ra ra-heavy-shield', category: 'combat', set: 'rpg-awesome', description: 'Full coverage heavy bastion tower shield' },
  { id: 'plated_gauntlet', name: 'plated gaunlet', glyph: '🧤', cssClass: 'ra ra-hand', category: 'combat', set: 'rpg-awesome', description: 'Heavy armored steel plate gauntlet' },
  { id: 'wound', name: 'Wound / Blood', glyph: '🩸', cssClass: 'ra ra-bleeding-eye', category: 'combat', set: 'rpg-awesome', description: 'Physical damage counter' },
  { id: 'skull', name: 'Death Skull', glyph: '💀', cssClass: 'ri-skull-line', category: 'combat', set: 'remix', description: 'Lethal damage or defeat' },
  { id: 'target', name: 'Crosshairs', glyph: '🎯', cssClass: 'ri-crosshair-2-line', category: 'combat', set: 'remix', description: 'Accuracy and critical range' },
  { id: 'armor', name: 'Steel Armor', glyph: '🥋', cssClass: 'ra ra-vest', category: 'combat', set: 'rpg-awesome', description: 'Damage reduction value' },
  { id: 'bomb', name: 'Powder Bomb', glyph: '💣', cssClass: 'ra ra-bomb-explosion', category: 'combat', set: 'rpg-awesome', description: 'Area of effect explosion' },
  { id: 'hammer', name: 'Warhammer', glyph: '🔨', cssClass: 'ra ra-heavy-fall', category: 'combat', set: 'rpg-awesome', description: 'Blunt armor-crushing trauma' },
  { id: 'scythe', name: 'Reaper Scythe', glyph: '🌾', cssClass: 'ra ra-scythe', category: 'combat', set: 'rpg-awesome', description: 'Wide sweep soul harvest' },
  { id: 'spear', name: 'Trident / Spear', glyph: '🔱', cssClass: 'ra ra-spear-head', category: 'combat', set: 'rpg-awesome', description: 'Reach attack and impale' },
  { id: 'boom', name: 'Explosive Impact', glyph: '💥', cssClass: 'ri-flashlight-line', category: 'combat', set: 'remix', description: 'Direct burst strike' },
  { id: 'helmet', name: 'Knight Helm', glyph: '🪖', cssClass: 'ra ra-helmet', category: 'combat', set: 'rpg-awesome', description: 'Head protection and fortitude' },

  // ==========================================
  // 3. MAGIC & ARCANA (Remix / RPG-Awesome - Canvas Only)
  // ==========================================
  { id: 'magic_wand', name: 'magic wand', glyph: '🪄', cssClass: 'ra ra-crystal-wand', category: 'magic', set: 'rpg-awesome', description: 'Enchanted crystal focus magic wand' },
  { id: 'elder_wand', name: 'elder wand', glyph: '🪄', cssClass: 'ra ra-crystal-wand', category: 'magic', set: 'rpg-awesome', description: 'Ancient elder wood channeling wand' },
  { id: 'star_meteor', name: 'star meteor', glyph: '☄️', cssClass: 'ra ra-burning-meteor', category: 'magic', set: 'rpg-awesome', description: 'Celestial blazing star meteor impact' },
  { id: 'flailing_meteor_star', name: 'flailing meteor star', glyph: '☄️', cssClass: 'ra ra-burning-meteor', category: 'magic', set: 'rpg-awesome', description: 'Cosmic shower flailing star meteor' },
  { id: 'arcane_grimoire', name: 'arcane grimoire', glyph: '📖', cssClass: 'ra ra-burning-book', category: 'magic', set: 'rpg-awesome', description: 'Tome of forbidden spells & incantations' },
  { id: 'orb', name: 'Arcane Orb', glyph: '🔮', cssClass: 'ra ra-crystal-ball', category: 'magic', set: 'rpg-awesome', description: 'Spellcasting power' },
  { id: 'fire', name: 'Pyromancy Fire', glyph: '🔥', cssClass: 'ri-fire-line', category: 'magic', set: 'remix', description: 'Burn and fire damage' },
  { id: 'ice', name: 'Frost Nova', glyph: '❄️', cssClass: 'ri-snowflake-line', category: 'magic', set: 'remix', description: 'Freeze and slow effect' },
  { id: 'lightning', name: 'Thunderbolt', glyph: '⚡', cssClass: 'ri-flashlight-line', category: 'magic', set: 'remix', description: 'Shock and pierce resistance' },
  { id: 'potion', name: 'Elixir Vial', glyph: '🧪', cssClass: 'ra ra-flask', category: 'magic', set: 'rpg-awesome', description: 'Consumable restorative brew' },
  { id: 'scroll', name: 'Ancient Scroll', glyph: '📜', cssClass: 'ra ra-scroll-unfurled', category: 'magic', set: 'rpg-awesome', description: 'Single-use incantation' },
  { id: 'portal', name: 'Dimensional Rift', glyph: '🌀', cssClass: 'ra ra-implosion', category: 'magic', set: 'rpg-awesome', description: 'Teleportation node' },
  { id: 'spark', name: 'Divine Radiance', glyph: '✨', cssClass: 'ri-sparkling-line', category: 'magic', set: 'remix', description: 'Holy buff and blessing' },
  { id: 'candle', name: 'Ritual Candle', glyph: '🕯️', cssClass: 'ra ra-lit-candelabra', category: 'magic', set: 'rpg-awesome', description: 'Channeled dark ritual' },
  { id: 'eye_amulet', name: 'All-Seeing Eye', glyph: '🧿', cssClass: 'ra ra-eyeball', category: 'magic', set: 'rpg-awesome', description: 'Ward against hexes and curses' },
  { id: 'ring_power', name: 'Ring of Power', glyph: '💍', cssClass: 'ri-vip-diamond-line', category: 'magic', set: 'remix', description: 'Continuous enchanted passive' },

  // ==========================================
  // 4. RESOURCES & CURRENCIES (Remix / RPG-Awesome - Canvas Only)
  // ==========================================
  { id: 'treasure_chest', name: 'treasure chest', glyph: '📦', cssClass: 'ra ra-gold-bar', category: 'resources', set: 'rpg-awesome', description: 'Gilded treasure chest with bullion wealth' },
  { id: 'gold', name: 'Gold Coin', glyph: '💰', cssClass: 'ri-money-dollar-circle-line', category: 'resources', set: 'remix', description: 'Standard currency marker' },
  { id: 'coin', name: 'Single Coin', glyph: '🪙', cssClass: 'ri-copper-coin-line', category: 'resources', set: 'remix', description: 'Basic denomination coin' },
  { id: 'gem', name: 'Arcane Ruby', glyph: '💎', cssClass: 'ra ra-gem', category: 'resources', set: 'rpg-awesome', description: 'High-value rare treasure' },
  { id: 'wood', name: 'Timber Log', glyph: '🪵', cssClass: 'ra ra-pine-tree', category: 'resources', set: 'rpg-awesome', description: 'Crafting material wood' },
  { id: 'ore', name: 'Iron Pickaxe', glyph: '⛏️', cssClass: 'ra ra-anvil', category: 'resources', set: 'rpg-awesome', description: 'Metal mining resource' },
  { id: 'stone', name: 'Quarried Stone', glyph: '🪨', cssClass: 'ri-landscape-line', category: 'resources', set: 'remix', description: 'Masonry building block' },
  { id: 'key', name: 'Dungeon Key', glyph: '🗝️', cssClass: 'ra ra-key-basic', category: 'resources', set: 'rpg-awesome', description: 'Unlocks vault or portal' },
  { id: 'meat', name: 'Ration Meat', glyph: '🥩', cssClass: 'ra ra-meat', category: 'resources', set: 'rpg-awesome', description: 'Supplies and upkeep' },
  { id: 'bread', name: 'Provision Bread', glyph: '🍞', cssClass: 'ri-bread-line', category: 'resources', set: 'remix', description: 'Camp nourishment' },
  { id: 'fish', name: 'Ration Fish', glyph: '🐟', cssClass: 'ra ra-fish', category: 'resources', set: 'rpg-awesome', description: 'Coastal expedition rations' },
  { id: 'mana', name: 'Mana Droplet', glyph: '💧', cssClass: 'ra ra-water-drop', category: 'resources', set: 'rpg-awesome', description: 'Energy pool point' },
  { id: 'crate', name: 'Supply Crate', glyph: '🧰', cssClass: 'ri-tools-line', category: 'resources', set: 'remix', description: 'Logistics cargo box' },
  { id: 'grain', name: 'Harvest Grain', glyph: '🌾', cssClass: 'ra ra-sprout', category: 'resources', set: 'rpg-awesome', description: 'Agriculture harvest yield' },

  // ==========================================
  // 5. DICE & CHANCE (Remix / RPG-Awesome - Canvas Only)
  // ==========================================
  { id: 'twenty_sided_die', name: 'twenty-sided die', glyph: '🎲', cssClass: 'ra ra-perspective-dice-random', category: 'dice', set: 'rpg-awesome', description: 'Isometric polyhedral 20-sided die' },
  { id: 'game_die_6', name: 'game die 6', glyph: '⚅', cssClass: 'ra ra-dice-six', category: 'dice', set: 'rpg-awesome', description: 'Game die with 6 pips' },
  { id: 'game_die_1', name: 'game die 1', glyph: '⚀', cssClass: 'ra ra-dice-one', category: 'dice', set: 'rpg-awesome', description: 'Game die with 1 pip' },
  { id: 'd6_pipe_1', name: 'D6: pipe one', glyph: '⚀', cssClass: 'ra ra-dice-one', category: 'dice', set: 'rpg-awesome', description: 'D6 die face with single pip' },
  { id: 'd6_pipe_2', name: 'D6: pipe two', glyph: '⚁', cssClass: 'ra ra-dice-two', category: 'dice', set: 'rpg-awesome', description: 'D6 die face with two pips' },
  { id: 'd6_pipe_3', name: 'D6: pipe three', glyph: '⚂', cssClass: 'ra ra-dice-three', category: 'dice', set: 'rpg-awesome', description: 'D6 die face with three pips' },
  { id: 'd6_pipe_4', name: 'D6: pipe four', glyph: '⚃', cssClass: 'ra ra-dice-four', category: 'dice', set: 'rpg-awesome', description: 'D6 die face with four pips' },
  { id: 'd6_pipe_5', name: 'D6: pipe five', glyph: '⚄', cssClass: 'ra ra-dice-five', category: 'dice', set: 'rpg-awesome', description: 'D6 die face with five pips' },
  { id: 'd6_pipe_6', name: 'D6: pipe six', glyph: '⚅', cssClass: 'ra ra-dice-six', category: 'dice', set: 'rpg-awesome', description: 'D6 die face with six pips' },
  { id: 'draw_deck', name: 'draw deck', glyph: '🂠', cssClass: 'ra ra-spades-card', category: 'dice', set: 'rpg-awesome', description: 'Tabletop card draw pile' },
  { id: 'fanned_card_hand', name: 'fanned card hand', glyph: '🂠', cssClass: 'ra ra-clovers-card', category: 'dice', set: 'rpg-awesome', description: 'Fanned playable card hand' },
  { id: 'suit_clubs_clover', name: 'suit: clubs/clover', glyph: '♣️', cssClass: 'ra ra-clovers-card', category: 'dice', set: 'rpg-awesome', description: 'Traditional card suit: clubs / clover' },
  { id: 'suit_spades', name: 'suit: spades', glyph: '♠️', cssClass: 'ra ra-spades-card', category: 'dice', set: 'rpg-awesome', description: 'Traditional card suit: spades' },
  { id: 'suit_hearts', name: 'suit: hearts', glyph: '♥️', cssClass: 'ra ra-hearts-card', category: 'dice', set: 'rpg-awesome', description: 'Traditional card suit: hearts' },
  { id: 'suit_diamonds', name: 'suit: diamonds', glyph: '♦️', cssClass: 'ra ra-diamonds-card', category: 'dice', set: 'rpg-awesome', description: 'Traditional card suit: diamonds' },
  { id: 'hourglass', name: 'Turn Timer', glyph: '⏳', cssClass: 'ra ra-hourglass', category: 'dice', set: 'rpg-awesome', description: 'Round count or cooldown' },
  { id: 'stopwatch', name: 'Round Stopwatch', glyph: '⏱️', cssClass: 'ri-time-line', category: 'dice', set: 'remix', description: 'Tactical action timing' },
  { id: 'clover', name: 'Four-Leaf Clover', glyph: '🍀', cssClass: 'ra ra-clover', category: 'dice', set: 'rpg-awesome', description: 'Bonus luck modifier' },

  // ==========================================
  // 6. CONDITIONS & STATUS EFFECTS (Canvas Only)
  // ==========================================
  { id: 'dizzy_stun', name: 'Stunned', glyph: '💫', cssClass: 'ri-sparkling-line', category: 'conditions', set: 'remix', description: 'Cannot take active actions' },
  { id: 'poison', name: 'Poison Status', glyph: '☣️', cssClass: 'ra ra-poison-cloud', category: 'conditions', set: 'rpg-awesome', description: 'Damage at start of turn' },
  { id: 'sleep', name: 'Sleeping / Dormant', glyph: '💤', cssClass: 'ri-zzz-line', category: 'conditions', set: 'remix', description: 'Awakens when dealt damage' },
  { id: 'mute', name: 'Silenced', glyph: '🤫', cssClass: 'ri-volume-mute-line', category: 'conditions', set: 'remix', description: 'Cannot cast spells' },
  { id: 'blind', name: 'Blinded', glyph: '🙈', cssClass: 'ri-eye-close-line', category: 'conditions', set: 'remix', description: 'Disadvantage on attacks' },
  { id: 'enraged', name: 'Berserk Rage', glyph: '💢', cssClass: 'ri-fire-line', category: 'conditions', set: 'remix', description: 'Attack +2, Defense -2' },
  { id: 'curse', name: 'Cursed Mark', glyph: '🪬', cssClass: 'ri-eye-line', category: 'conditions', set: 'remix', description: 'Reduces healing received' },
  { id: 'blessed', name: 'Blessed Dove', glyph: '🕊️', cssClass: 'ri-flight-takeoff-line', category: 'conditions', set: 'remix', description: 'Ward from fatal blows' },
  { id: 'invisible', name: 'Stealth Invisibility', glyph: '👁️‍🗨️', cssClass: 'ri-eye-line', category: 'conditions', set: 'remix', description: 'Cannot be targeted directly' },

  // ==========================================
  // 7. EXPLORATION & MAP (Canvas Only)
  // ==========================================
  { id: 'resting_campfire', name: 'resting campfire', glyph: '🔥', cssClass: 'ra ra-campfire', category: 'exploration', set: 'rpg-awesome', description: 'Safe recovery campfire & hearth' },
  { id: 'ancient_tomb', name: 'ancient tomb', glyph: '🪦', cssClass: 'ra ra-tombstone', category: 'exploration', set: 'rpg-awesome', description: 'Stone crypt tomb and graveyard' },
  { id: 'outpost_pavillion', name: 'outpost pavillion', glyph: '⛺', cssClass: 'ra ra-castle-flag', category: 'exploration', set: 'rpg-awesome', description: 'Expedition outpost pavilion structure' },
  { id: 'fog_war', name: 'Fog of War', glyph: '🌫️', cssClass: 'ri-foggy-line', category: 'exploration', set: 'remix', description: 'Unexplored hidden tile' },
  { id: 'compass', name: 'Scout Compass', glyph: '🧭', cssClass: 'ri-compass-3-line', category: 'exploration', set: 'remix', description: 'Exploration and direction' },
  { id: 'map_scroll', name: 'Torn Map', glyph: '🗺️', cssClass: 'ri-map-2-line', category: 'exploration', set: 'remix', description: 'Reveals adjacent nodes' },
  { id: 'castle', name: 'Stronghold Keep', glyph: '🏰', cssClass: 'ra ra-castle-flag', category: 'exploration', set: 'rpg-awesome', description: 'Fortified player base' },
  { id: 'mountain', name: 'Crag Peak', glyph: '⛰️', cssClass: 'ra ra-mountains', category: 'exploration', set: 'rpg-awesome', description: 'Impassable terrain' },
  { id: 'gate', name: 'Dungeon Gate', glyph: '🚪', cssClass: 'ri-door-open-line', category: 'exploration', set: 'remix', description: 'Entrance to underground vault' },
  { id: 'cave', name: 'Cavern Entrance', glyph: '🕳️', cssClass: 'ri-circle-line', category: 'exploration', set: 'remix', description: 'Subterranean passage' },
  { id: 'volcano', name: 'Active Volcano', glyph: '🌋', cssClass: 'ri-fire-line', category: 'exploration', set: 'remix', description: 'Lava hazard area' },
  { id: 'desert', name: 'Desert Dune', glyph: '🏜️', cssClass: 'ri-sun-line', category: 'exploration', set: 'remix', description: 'Arid stamina drain' },
  { id: 'island', name: 'Uncharted Island', glyph: '🏝️', cssClass: 'ri-landscape-line', category: 'exploration', set: 'remix', description: 'Secluded secret cache' },
  { id: 'ship', name: 'Galleon Ship', glyph: '⛵', cssClass: 'ri-sailboat-line', category: 'exploration', set: 'remix', description: 'Naval vessel transit' },
  { id: 'shrine', name: 'Mystic Torii Shrine', glyph: '⛩️', cssClass: 'ri-ancient-gate-line', category: 'exploration', set: 'remix', description: 'Statue granting blessings' },
  { id: 'tavern', name: 'Wayfarer Tavern', glyph: '🍺', cssClass: 'ra ra-beer', category: 'exploration', set: 'rpg-awesome', description: 'Hire mercenaries & trade rumors' },
  { id: 'trap', name: 'Hidden Trap', glyph: '⚠️', cssClass: 'ri-alert-line', category: 'exploration', set: 'remix', description: 'Triggers on enter' },
  { id: 'footprints', name: 'Beast Tracks', glyph: '🐾', cssClass: 'ra ra-pawprint', category: 'exploration', set: 'rpg-awesome', description: 'Trail leading to boss' },

  // ==========================================
  // 8. STATS & ATTRIBUTES (Canvas Only)
  // ==========================================
  { id: 'heart', name: 'Vitality Heart', glyph: '❤️', cssClass: 'ri-heart-line', category: 'stats', set: 'remix', description: 'Maximum life health points' },
  { id: 'health_cross', name: 'Aid Cross', glyph: '🩺', cssClass: 'ri-heart-pulse-line', category: 'stats', set: 'remix', description: 'Healing restoration rate' },
  { id: 'energy', name: 'Stamina Battery', glyph: '🔋', cssClass: 'ri-battery-2-line', category: 'stats', set: 'remix', description: 'Action stamina resource' },
  { id: 'fist', name: 'Strength Fist', glyph: '✊', cssClass: 'ri-hand-coin-line', category: 'stats', set: 'remix', description: 'Melee power and brute force' },
  { id: 'wing', name: 'Agility Wing', glyph: '🪽', cssClass: 'ra ra-feather-wing', category: 'stats', set: 'rpg-awesome', description: 'Evasion and initiative' },
  { id: 'brain', name: 'Intellect Brain', glyph: '🧠', cssClass: 'ri-brain-line', category: 'stats', set: 'remix', description: 'Spell knowledge and checks' },
  { id: 'eye', name: 'Perception Eye', glyph: '👁️', cssClass: 'ri-eye-line', category: 'stats', set: 'remix', description: 'Detects secret doors and traps' },
  { id: 'speech', name: 'Charisma Dialogue', glyph: '💬', cssClass: 'ri-chat-1-line', category: 'stats', set: 'remix', description: 'Negotiation and persuasion' },
  { id: 'boot', name: 'Movement Boots', glyph: '👢', cssClass: 'ra ra-boot-stomp', category: 'stats', set: 'rpg-awesome', description: 'Board movement points' },

  // ==========================================
  // 9. FACTIONS & MONSTERS (Canvas Only)
  // ==========================================
  { id: 'blood_vampire', name: 'blood vampire', glyph: '🧛', cssClass: 'ra ra-batwings', category: 'factions', set: 'rpg-awesome', description: 'Blood-drinking vampire bat predator' },
  { id: 'night_vampire_bat', name: 'night vampire bat', glyph: '🦇', cssClass: 'ra ra-batwings', category: 'factions', set: 'rpg-awesome', description: 'Night-dwelling predatory vampire bat' },
  { id: 'dragon', name: 'Ancient Dragon', glyph: '🐉', cssClass: 'ra ra-dragon-wing', category: 'factions', set: 'rpg-awesome', description: 'Apex boss enemy' },
  { id: 'beast', name: 'Dire Wolf', glyph: '🐺', cssClass: 'ra ra-wolf-howl', category: 'factions', set: 'rpg-awesome', description: 'Wild predator encounter' },
  { id: 'eagle', name: 'War Griffin', glyph: '🦅', cssClass: 'ri-flight-takeoff-line', category: 'factions', set: 'remix', description: 'Aerial allied mount' },
  { id: 'zombie', name: 'Undead Walker', glyph: '🧟', cssClass: 'ri-skull-line', category: 'factions', set: 'remix', description: 'Swarm ghoul minion' },
  { id: 'wizard', name: 'Grand Magus', glyph: '🧙', cssClass: 'ra ra-player', category: 'factions', set: 'rpg-awesome', description: 'Arcanist hero' },
  { id: 'knight', name: 'Vanguard Knight', glyph: '🤺', cssClass: 'ri-sword-line', category: 'factions', set: 'remix', description: 'Frontline armored defender' },
  { id: 'rogue', name: 'Shadow Assassin', glyph: '👤', cssClass: 'ri-user-line', category: 'factions', set: 'remix', description: 'Stealth infiltrator' },
  { id: 'goblin', name: 'Forest Goblin', glyph: '👺', cssClass: 'ri-skull-line', category: 'factions', set: 'remix', description: 'Scavenger ambusher' },
  { id: 'kraken', name: 'Abyssal Kraken', glyph: '🐙', cssClass: 'ra ra-octopus', category: 'factions', set: 'rpg-awesome', description: 'Deep sea raid boss' },
  { id: 'spider', name: 'Brood Spider', glyph: '🕷️', cssClass: 'ra ra-spider-face', category: 'factions', set: 'rpg-awesome', description: 'Web trap spinner' },
  { id: 'ghost', name: 'Vengeful Specter', glyph: '👻', cssClass: 'ri-ghost-line', category: 'factions', set: 'remix', description: 'Ethereal incorporeal ghost' },

  // ==========================================
  // 10. UI & GAME TOKENS (Canvas Only)
  // ==========================================
  { id: 'handshake_trade', name: 'handshake trade', glyph: '🤝', cssClass: 'ri-handshake-line', category: 'ui', set: 'remix', description: 'Player bartering and commerce phase' },
  { id: 'locked_seal', name: 'locked seal', glyph: '🔒', cssClass: 'ra ra-locked-fortress', category: 'ui', set: 'rpg-awesome', description: 'Fortress locked vault barrier seal' },
  { id: 'unlock', name: 'Open Latch', glyph: '🔓', cssClass: 'ri-lock-unlock-line', category: 'ui', set: 'remix', description: 'Unlocked accessible state' },
  { id: 'crown', name: 'Victory Crown', glyph: '👑', cssClass: 'ra ra-crown', category: 'ui', set: 'rpg-awesome', description: 'Victory point objective' },
  { id: 'trophy', name: 'Champion Trophy', glyph: '🏆', cssClass: 'ri-trophy-line', category: 'ui', set: 'remix', description: 'Match winner indicator' },
  { id: 'flag', name: 'Territory Banner', glyph: '🚩', cssClass: 'ri-flag-line', category: 'ui', set: 'remix', description: 'Control point banner' },
  { id: 'star', name: 'Gold Star', glyph: '⭐', cssClass: 'ri-star-line', category: 'ui', set: 'remix', description: 'Tier rating or favor point' },
  { id: 'check', name: 'Checkmark Pass', glyph: '✅', cssClass: 'ri-check-line', category: 'ui', set: 'remix', description: 'Completed mission / condition' },
  { id: 'cross', name: 'Denied X', glyph: '❌', cssClass: 'ri-close-line', category: 'ui', set: 'remix', description: 'Failed check or forbidden zone' },
  { id: 'upgrade', name: 'Level Up Arrow', glyph: '⬆️', cssClass: 'ri-arrow-up-line', category: 'ui', set: 'remix', description: 'Hero rank promotion' },
  { id: 'refresh', name: 'Cycle / Refresh', glyph: '🔄', cssClass: 'ri-refresh-line', category: 'ui', set: 'remix', description: 'Untap / phase upkeep' },
  { id: 'trash', name: 'Banish / Discard', glyph: '🗑️', cssClass: 'ri-delete-bin-line', category: 'ui', set: 'remix', description: 'Remove from current game' },
  { id: 'book', name: 'Rule Codex', glyph: '📖', cssClass: 'ri-book-open-line', category: 'ui', set: 'remix', description: 'Game rulebook reference' }
];
