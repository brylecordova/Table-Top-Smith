// Centralized icon resolver and mapper for TableSmith
// Maps legacy emoji and tabletop keys to crisp Remix Icon or RPG-Awesome classes,
// preventing missing glyph white rectangles / tofu boxes in all browser environments.

export const EMOJI_TO_REMIX_MAP: Record<string, string> = {
  // 1. Combat & Weapons
  '⚔️': 'ri-sword-line',
  '🛡️': 'ri-shield-line',
  '🏹': 'ri-focus-3-line',
  '🗡️': 'ri-knife-line',
  '🪓': 'ra ra-axe',
  '🩸': 'ra ra-bleeding-eye',
  '💀': 'ri-skull-line',
  '🎯': 'ri-crosshair-2-line',
  '🥋': 'ra ra-vest',
  '💣': 'ra ra-bomb-explosion',
  '🔨': 'ra ra-heavy-fall',
  '🌾': 'ra ra-sprout',
  '🔱': 'ra ra-spear-head',
  '💥': 'ri-flashlight-line',
  '🪖': 'ra ra-helmet',

  // 2. Magic & Arcana
  '🔮': 'ra ra-crystal-ball',
  '🔥': 'ri-fire-line',
  '❄️': 'ri-snowflake-line',
  '⚡': 'ri-flashlight-line',
  '🧪': 'ra ra-flask',
  '📜': 'ra ra-scroll-unfurled',
  '🌀': 'ra ra-implosion',
  '✨': 'ri-sparkling-line',
  '🕯️': 'ra ra-lit-candelabra',
  '🪄': 'ra ra-wand',
  '☄️': 'ra ra-meteor',
  '🧿': 'ra ra-eyeball',
  '💍': 'ri-vip-diamond-line',

  // 3. Resources & Currencies
  '💰': 'ri-money-dollar-circle-line',
  '🪙': 'ri-copper-coin-line',
  '💎': 'ra ra-gem',
  '🪵': 'ra ra-pine-tree',
  '⛏️': 'ra ra-anvil',
  '🪨': 'ri-landscape-line',
  '🗝️': 'ra ra-key',
  '🥩': 'ra ra-meat',
  '🍞': 'ri-bread-line',
  '🐟': 'ra ra-fish',
  '💧': 'ra ra-water-drop',
  '📦': 'ra ra-treasures',
  '🧰': 'ri-tools-line',

  // 4. Dice & Chance
  '🎲': 'ra ra-d20',
  '⚅': 'ra ra-dice-six-faces-six',
  '⚀': 'ra ra-dice-six-faces-one',
  '🂠': 'ra ra-cards',
  '🎰': 'ri-gift-line',
  '⏳': 'ra ra-hourglass',
  '⏱️': 'ri-time-line',
  '🍀': 'ra ra-clover',

  // 5. Conditions & Status Effects
  '💫': 'ri-sparkling-line',
  '☣️': 'ra ra-poison-cloud',
  '💤': 'ri-zzz-line',
  '🤫': 'ri-volume-mute-line',
  '🙈': 'ri-eye-close-line',
  '💢': 'ri-fire-line',
  '🪬': 'ri-eye-line',
  '🕊️': 'ri-flight-takeoff-line',
  '👁️‍🗨️': 'ri-eye-line',

  // 6. Exploration & Map
  '🌫️': 'ri-foggy-line',
  '🧭': 'ri-compass-3-line',
  '🗺️': 'ri-map-2-line',
  '🏰': 'ra ra-castle-flag',
  '⛰️': 'ra ra-mountains',
  '🏕️': 'ra ra-tent',
  '🚪': 'ri-door-open-line',
  '🕳️': 'ri-circle-line',
  '🌋': 'ri-fire-line',
  '🏜️': 'ri-sun-line',
  '🏝️': 'ri-landscape-line',
  '⛵': 'ri-sailboat-line',
  '⛩️': 'ri-ancient-gate-line',
  '🪦': 'ri-monument-line',
  '🍺': 'ra ra-beer',
  '⚠️': 'ri-alert-line',
  '🐾': 'ra ra-pawprint',
  '📍': 'ri-map-pin-line',
  '⬢': 'ri-shape-line',

  // 7. Stats & Attributes
  '❤️': 'ri-heart-line',
  '🩺': 'ri-heart-pulse-line',
  '🔋': 'ri-battery-2-line',
  '✊': 'ri-hand-coin-line',
  '🪽': 'ra ra-feather-wing',
  '🧠': 'ri-brain-line',
  '👁️': 'ri-eye-line',
  '💬': 'ri-chat-1-line',
  '👢': 'ra ra-boot-stomp',

  // 8. Factions & Monsters
  '🐉': 'ra ra-dragon-wing',
  '🐺': 'ra ra-wolf-howl',
  '🦅': 'ri-flight-takeoff-line',
  '🧟': 'ri-skull-line',
  '🧙': 'ra ra-player',
  '🤺': 'ri-sword-line',
  '👤': 'ri-user-line',
  '👺': 'ri-skull-line',
  '🧛': 'ra ra-bat',
  '🐙': 'ra ra-octopus',
  '🕷️': 'ra ra-spider-face',
  '👻': 'ri-ghost-line',
  '♟️': 'ri-user-star-line',

  // 9. UI & Game Loop Tokens
  '👑': 'ra ra-crown',
  '🏆': 'ri-trophy-line',
  '🚩': 'ri-flag-line',
  '⭐': 'ri-star-line',
  '✅': 'ri-check-line',
  '❌': 'ri-close-line',
  '🤝': 'ri-handshake-line',
  '⬆️': 'ri-arrow-up-line',
  '🔒': 'ra ra-padlock',
  '🔓': 'ra ra-open-gate',
  '🔄': 'ri-refresh-line',
  '🗑️': 'ri-delete-bin-line',
  '📖': 'ri-book-open-line',
  '🏷️': 'ri-price-tag-3-line',
  '📑': 'ri-file-text-line',
  '🖼️': 'ri-image-2-line',
  '⏹️': 'ri-checkbox-blank-line'
};

/**
 * Returns a CSS class guaranteed to render cleanly.
 * If raw is already a CSS class (starts with ri- or ra ), returns it.
 * If raw is an emoji with a known mapping, returns the mapping.
 * Otherwise returns fallback or ri-sparkling-line.
 */
export function getRemixIconClass(rawIcon?: string, defaultClass = 'ri-sparkling-line'): string {
  if (!rawIcon) return defaultClass;
  const trimmed = rawIcon.trim();
  if (trimmed.startsWith('ri-') || trimmed.startsWith('ra ') || trimmed.includes('ri-') || trimmed.includes('ra-')) {
    return trimmed;
  }
  if (EMOJI_TO_REMIX_MAP[trimmed]) {
    return EMOJI_TO_REMIX_MAP[trimmed];
  }
  return defaultClass;
}
