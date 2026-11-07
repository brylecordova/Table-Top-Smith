import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDatabase } from './src/server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Seed sample project if empty
async function ensureSampleData() {
  const db = await getDatabase();
  const projects = await db.collection('projects').find();
  if (projects.length === 0) {
    const sampleId = 'proj_iron_stone';
    await db.collection('projects').insertOne({
      _id: sampleId,
      name: 'Chronicles of Iron & Aether',
      description: 'Tactical skirmish board game with modular player boards, item cards, and standees',
      unit: 'mm',
      bleedMm: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 1. Sample Card Groups
    await db.collection('cardGroups').insertOne({
      _id: 'grp_equipment',
      projectId: sampleId,
      name: 'Equipment & Artifacts',
      dimensions: { width: 63.5, height: 88.9, cornerRadius: 3 },
      isSharedBack: true,
      masterLayout: {
        borderWidth: 2.5,
        borderColor: '#F59E0B',
        backgroundColor: '#1E293B',
        headerHeight: 18,
        bannerColor: '#0F172A',
        badgeColor: '#F59E0B'
      },
      cardBack: {
        title: 'CHRONICLES',
        subtitle: 'EQUIPMENT',
        color: '#0F172A',
        borderColor: '#F59E0B',
        pattern: 'diamonds'
      },
      cards: [
        {
          id: 'card_1',
          name: 'Sunforged Broadsword',
          type: 'Weapon',
          cost: '3',
          stats: 'ATK +4 · Rng 1',
          rulesText: 'On critical hit, inflicts Burn for 2 turns. Target discards 1 armor counter.',
          flavorText: 'Forged in the heart of the obsidian volcano before the fall.',
          artIcon: 'ri-sword-line',
          quantity: 3
        },
        {
          id: 'card_2',
          name: 'Aegis of the Stone Warden',
          type: 'Armor',
          cost: '4',
          stats: 'DEF +5 · Wgt 2',
          rulesText: 'Absorbs up to 3 damage per round from adjacent ally attacks.',
          flavorText: 'Carved from monolithic granite that weathered the dragon siege.',
          artIcon: 'ri-shield-line',
          quantity: 2
        },
        {
          id: 'card_3',
          name: 'Elixir of Swift Winds',
          type: 'Consumable',
          cost: '2',
          stats: 'MOV +3 · Inst',
          rulesText: 'Gain 2 free maneuvers this round. Ignores terrain hazards.',
          flavorText: 'Bottled zephyrs harvested from the Whispering Crags.',
          artIcon: 'ri-flask-line',
          quantity: 4
        }
      ]
    });

    // 2. Sample Box Dieline (Telescoping 2-part box + others)
    await db.collection('boxDielines').insertOne({
      _id: 'box_core',
      projectId: sampleId,
      templateType: 'telescope-2part',
      name: 'Standard Game Box (Two-Piece Rigid)',
      targetDimensions: { width: 200, depth: 200, height: 50 },
      materialThicknessMm: 1.5,
      lidClearanceMm: 1.5,
      flangeWidthMm: 15,
      panels: {
        lidTop: { title: 'CHRONICLES OF IRON', subtitle: 'TACTICAL SKIRMISH GAME', bgColor: '#0F172A', accentColor: '#F59E0B' },
        lidSides: { text: 'CHRONICLES OF IRON & AETHER · 1-4 PLAYERS · AGE 14+', color: '#1E293B' },
        trayBottom: { text: 'COMPONENTS INCLUDED: 120 Cards, 40 Tokens, 6 Standees, 1 Modular Board, 1 Rulebook.', color: '#0B0F17' }
      }
    });

    // 3. Sample Tokens
    await db.collection('tokens').insertOne({
      _id: 'tok_counters',
      projectId: sampleId,
      name: 'Combat Status & Currency Tokens',
      tokens: [
        { id: 't1', name: 'Gold Coin', shape: 'circle', diameterMm: 22, color: '#F59E0B', text: '1G', icon: '💰', quantity: 20 },
        { id: 't2', name: 'Wound Marker', shape: 'circle', diameterMm: 18, color: '#EF4444', text: '-1 HP', icon: '🩸', quantity: 15 },
        { id: 't3', name: 'Hex Terrain Obstacle', shape: 'hex', diameterMm: 30, color: '#334155', text: 'Rubble', icon: '⛰️', quantity: 8 },
        { id: 't4', name: 'Action Shield', shape: 'square', diameterMm: 25, color: '#3B82F6', text: 'SHIELD', icon: '🛡️', quantity: 10 }
      ]
    });

    // Seed Sample Personal Assets for Asset Manager
    await db.collection('assets').insertOne({
      _id: 'ast_parchment',
      projectId: sampleId,
      name: 'Dark Spell Parchment',
      category: 'texture',
      tags: ['background', 'parchment', 'dark', 'fantasy'],
      url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
      fileSize: '420 KB',
      createdAt: new Date().toISOString()
    });
    await db.collection('assets').insertOne({
      _id: 'ast_obsidian',
      projectId: sampleId,
      name: 'Volcanic Obsidian Texture',
      category: 'texture',
      tags: ['crag', 'stone', 'volcano', 'board'],
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      fileSize: '512 KB',
      createdAt: new Date().toISOString()
    });
    await db.collection('assets').insertOne({
      _id: 'ast_knight_portrait',
      projectId: sampleId,
      name: 'Sunforged Vanguard Art',
      category: 'character',
      tags: ['hero', 'knight', 'vanguard', 'portrait'],
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
      fileSize: '680 KB',
      createdAt: new Date().toISOString()
    });
    await db.collection('assets').insertOne({
      _id: 'ast_mystic_nebula',
      projectId: sampleId,
      name: 'Aether Void Atmosphere',
      category: 'texture',
      tags: ['magic', 'void', 'space', 'cover'],
      url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
      fileSize: '390 KB',
      createdAt: new Date().toISOString()
    });

    // 4. Sample Standees
    await db.collection('standees').insertOne({
      _id: 'st_heroes',
      projectId: sampleId,
      name: 'Core Hero Standees',
      standees: [
        { id: 's1', name: 'Valeria the Ironheart', shape: 'arch', widthMm: 35, heightMm: 65, baseTabMm: { width: 20, height: 10 }, color: '#B45309', icon: '🗡️', role: 'Vanguard' },
        { id: 's2', name: 'Morgrim Rune-Caster', shape: 'arch', widthMm: 35, heightMm: 60, baseTabMm: { width: 20, height: 10 }, color: '#4338CA', icon: '🔮', role: 'Arcanist' },
        { id: 's3', name: 'Zephyr Scout', shape: 'rectangle', widthMm: 30, heightMm: 55, baseTabMm: { width: 20, height: 10 }, color: '#047857', icon: '🏹', role: 'Ranger' }
      ]
    });

    // 5. Sample Boards
    await db.collection('boards').insertOne({
      _id: 'brd_main',
      projectId: sampleId,
      name: 'Citadel Ruins (Bi-Fold Main Board)',
      type: 'bi-fold',
      dimensionsMm: { width: 400, height: 400 },
      spineGapMm: 3,
      gridType: 'hex',
      gridSizeMm: 32,
      showCoordinates: true,
      zones: [
        { id: 'z1', name: 'Keep Courtyard', x: 20, y: 20, width: 160, height: 160, color: '#1E293B' },
        { id: 'z2', name: 'Catacombs Gate', x: 220, y: 20, width: 160, height: 160, color: '#0F172A' },
        { id: 'z3', name: 'Turn & VP Track', x: 20, y: 350, width: 360, height: 35, color: '#334155' }
      ]
    });

    // 6. Sample Rulebook
    await db.collection('rulebooks').insertOne({
      _id: 'rb_manual',
      projectId: sampleId,
      title: 'Rulebook & Codex of Play',
      pageSize: 'A5',
      chapters: [
        {
          id: 'ch1',
          title: 'Component Overview & Setup',
          pageNumber: 1,
          content: 'Place the Citadel Ruins board in the center of the table. Each player takes one Player Board and corresponding Standee. Shuffle the Equipment & Artifacts deck and deal 4 cards to each adventurer. Place Gold Coins and Wound Markers within easy reach.'
        },
        {
          id: 'ch2',
          title: 'Turn Structure & Sequence',
          pageNumber: 2,
          content: 'A game round consists of three phases: 1. Initiative Roll: roll a D6 for turn order. 2. Action Phase: spend stamina tokens to move, attack, or equip gear. 3. Refresh Phase: replenish energy and resolve ongoing status effects.'
        },
        {
          id: 'ch3',
          title: 'Combat Resolution & Dice Checks',
          pageNumber: 3,
          content: 'When initiating an attack, make a Dice Check by rolling your combat pool against the target Defense value. Every hit reduces enemy armor or applies a Wound Marker. Critical hit triggers bonus weapon traits.'
        },
        {
          id: 'ch4',
          title: 'Winning the Game & Victory Points',
          pageNumber: 4,
          content: 'The match concludes when an adventurer claims 10 Victory Points on the VP Track or defeats the ancient Boss in the Catacombs. Calculate final bonuses from surviving Artifacts.'
        }
      ],
      glossary: [
        { term: 'Dice Check', definition: 'Rolling dice pool against a target difficulty rating (DR) to determine action success.' },
        { term: 'Wound Marker', definition: 'Token placed on a character card representing cumulative physical trauma.' },
        { term: 'Standee', definition: 'Cardboard or acrylic figure cutout representing a character on the game board.' }
      ],
      keywords: ['Dice Check', 'Turn Order', 'Wound Marker', 'Standee', 'Combat', 'Equipment']
    });

    // Seed default tabletop assets if none exist
    const defaultAssets = [
      {
        _id: 'ast_parchment',
        id: 'ast_parchment',
        projectId: sampleId,
        name: 'Aged Parchment Texture',
        category: 'textures',
        url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80',
        tags: ['parchment', 'paper', 'scroll', 'vintage'],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'ast_obsidian',
        id: 'ast_obsidian',
        projectId: sampleId,
        name: 'Dark Obsidian Stone',
        category: 'textures',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        tags: ['stone', 'dark', 'rock', 'dungeon'],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'ast_knight_portrait',
        id: 'ast_knight_portrait',
        projectId: sampleId,
        name: 'Vanguard Knight Portrait',
        category: 'characters',
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
        tags: ['knight', 'warrior', 'hero', 'portrait'],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'ast_mystic_nebula',
        id: 'ast_mystic_nebula',
        projectId: sampleId,
        name: 'Mystic Nebula Card Back',
        category: 'textures',
        url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
        tags: ['nebula', 'magic', 'cosmic', 'cardback'],
        createdAt: new Date().toISOString()
      }
    ];

    const currentAssets = await db.collection('assets').find({ projectId: sampleId });
    if (currentAssets.length === 0) {
      for (const ast of defaultAssets) {
        await db.collection('assets').insertOne(ast);
      }
    }

    console.log('Sample boardgame project successfully seeded.');
  } else {
    // If project already exists, also ensure assets are populated
    const sampleId = 'proj_iron_stone';
    const currentAssets = await db.collection('assets').find({ projectId: sampleId });
    if (currentAssets.length === 0) {
      const defaultAssets = [
        {
          _id: 'ast_parchment',
          id: 'ast_parchment',
          projectId: sampleId,
          name: 'Aged Parchment Texture',
          category: 'textures',
          url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80',
          tags: ['parchment', 'paper', 'scroll', 'vintage'],
          createdAt: new Date().toISOString()
        },
        {
          _id: 'ast_obsidian',
          id: 'ast_obsidian',
          projectId: sampleId,
          name: 'Dark Obsidian Stone',
          category: 'textures',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
          tags: ['stone', 'dark', 'rock', 'dungeon'],
          createdAt: new Date().toISOString()
        },
        {
          _id: 'ast_knight_portrait',
          id: 'ast_knight_portrait',
          projectId: sampleId,
          name: 'Vanguard Knight Portrait',
          category: 'characters',
          url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
          tags: ['knight', 'warrior', 'hero', 'portrait'],
          createdAt: new Date().toISOString()
        },
        {
          _id: 'ast_mystic_nebula',
          id: 'ast_mystic_nebula',
          projectId: sampleId,
          name: 'Mystic Nebula Card Back',
          category: 'textures',
          url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
          tags: ['nebula', 'magic', 'cosmic', 'cardback'],
          createdAt: new Date().toISOString()
        }
      ];
      for (const ast of defaultAssets) {
        await db.collection('assets').insertOne(ast);
      }
    }
  }
}

// REST API Endpoints
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const projects = await db.collection('projects').find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const project = await db.collection('projects').findOne({ _id: id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const cardGroups = await db.collection('cardGroups').find({ projectId: id });
    const boxDielines = await db.collection('boxDielines').find({ projectId: id });
    const tokens = await db.collection('tokens').find({ projectId: id });
    const standees = await db.collection('standees').find({ projectId: id });
    const boards = await db.collection('boards').find({ projectId: id });
    const rulebooks = await db.collection('rulebooks').find({ projectId: id });
    const assets = await db.collection('assets').find({ projectId: id });

    res.json({
      project,
      cardGroups,
      boxDielines,
      tokens,
      standees,
      boards,
      rulebook: rulebooks[0] || null,
      assets: assets || []
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/projects/:id/assets', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const assets = await db.collection('assets').find({ projectId: id });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/projects/:id/assets', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const asset = req.body;
    const assetId = asset._id || asset.id || `ast_${Date.now()}`;
    const newDoc = {
      ...asset,
      _id: assetId,
      projectId: id,
      createdAt: asset.createdAt || new Date().toISOString()
    };
    await db.collection('assets').updateOne(
      { _id: assetId },
      { $set: newDoc },
      { upsert: true }
    );
    res.json(newDoc);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/projects/:id/assets/:assetId', async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const db = await getDatabase();
    await db.collection('assets').deleteOne({ _id: assetId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const newProject = {
      _id: `proj_${Date.now()}`,
      name: req.body.name || 'Untitled Board Game',
      description: req.body.description || '',
      unit: req.body.unit || 'mm',
      bleedMm: req.body.bleedMm || 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.collection('projects').insertOne(newProject);
    res.json(newProject);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    await db.collection('projects').updateOne({ _id: id }, { $set: req.body });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Component update endpoints
app.post('/api/projects/:id/cardGroups', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const cardGroup = req.body;
    const groupId = cardGroup._id || cardGroup.id || `grp_${Date.now()}`;
    await db.collection('cardGroups').updateOne(
      { _id: groupId },
      { $set: { ...cardGroup, _id: groupId, projectId: id, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    res.json({ success: true, groupId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/projects/:id/cardGroups/:groupId', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const db = await getDatabase();
    await db.collection('cardGroups').deleteOne({ _id: groupId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/projects/:id/boxDielines', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const dieline = req.body;
    const dielineId = dieline._id || dieline.id || `box_${Date.now()}`;
    await db.collection('boxDielines').updateOne(
      { _id: dielineId },
      { $set: { ...dieline, _id: dielineId, projectId: id, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    res.json({ success: true, dielineId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/projects/:id/tokens', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const tokenSet = req.body;
    const tokenId = tokenSet._id || tokenSet.id || `tok_${Date.now()}`;
    await db.collection('tokens').updateOne(
      { _id: tokenId },
      { $set: { ...tokenSet, _id: tokenId, projectId: id, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    res.json({ success: true, tokenId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/projects/:id/standees', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const standeeSet = req.body;
    const standeeId = standeeSet._id || standeeSet.id || `st_${Date.now()}`;
    await db.collection('standees').updateOne(
      { _id: standeeId },
      { $set: { ...standeeSet, _id: standeeId, projectId: id, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    res.json({ success: true, standeeId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/projects/:id/boards', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const board = req.body;
    const boardId = board._id || board.id || `brd_${Date.now()}`;
    await db.collection('boards').updateOne(
      { _id: boardId },
      { $set: { ...board, _id: boardId, projectId: id, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    res.json({ success: true, boardId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/projects/:id/rulebook', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const rulebook = req.body;
    const rulebookId = rulebook._id || rulebook.id || `rb_${Date.now()}`;
    await db.collection('rulebooks').updateOne(
      { projectId: id },
      { $set: { ...rulebook, _id: rulebookId, projectId: id, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    res.json({ success: true, rulebookId });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Tabletop Simulator Deck and Saved Object Generator
app.post('/api/projects/:id/export/tts', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const project = await db.collection('projects').findOne({ _id: id });
    const cardGroups = await db.collection('cardGroups').find({ projectId: id });
    const tokens = await db.collection('tokens').find({ projectId: id });
    const boards = await db.collection('boards').find({ projectId: id });

    // Build standard Tabletop Simulator Object
    const ttsObject = {
      SaveName: project?.name || 'TableSmith Game',
      GameType: 'Custom Tabletop Game',
      Date: new Date().toLocaleString(),
      VersionNumber: 'v1.0',
      ObjectStates: [
        // Cards Deck representation
        ...cardGroups.map((group, idx) => ({
          Name: 'DeckCustom',
          Transform: { posX: -4 + idx * 3, posY: 1, posZ: 0, rotX: 0, rotY: 180, rotZ: 0, scaleX: 1, scaleY: 1, scaleZ: 1 },
          Nickname: group.name,
          Description: `${group.cards.length} cards from ${group.name}`,
          DeckIDs: group.cards.map((_: any, i: number) => (idx + 1) * 100 + i),
          CustomDeck: {
            [String(idx + 1)]: {
              FaceURL: `https://tablesmith.local/deck/${group._id}/fronts.jpg`,
              BackURL: `https://tablesmith.local/deck/${group._id}/back.jpg`,
              NumWidth: 10,
              NumHeight: 7,
              BackIsHidden: true,
              UniqueBack: false
            }
          },
          ContainedObjects: group.cards.map((card: any, i: number) => ({
            Name: 'CardCustom',
            Nickname: card.name,
            Description: `${card.type || ''}\n${card.stats || ''}\n${card.rulesText || ''}`,
            CardID: (idx + 1) * 100 + i
          }))
        })),
        // Boards representation
        ...boards.map((b: any, idx: number) => ({
          Name: 'Custom_Board',
          Transform: { posX: 0, posY: 0.5, posZ: -5 + idx * 8, rotX: 0, rotY: 0, rotZ: 0, scaleX: b.dimensionsMm.width / 100, scaleY: 1, scaleZ: b.dimensionsMm.height / 100 },
          Nickname: b.name,
          CustomImage: {
            ImageURL: `https://tablesmith.local/board/${b._id}.jpg`,
            WidthScale: 1
          }
        }))
      ]
    };

    res.json(ttsObject);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Dynamic Rulebook Indexer Calculation
app.post('/api/projects/:id/rulebook/index', (req: Request, res: Response) => {
  try {
    const { chapters, keywords } = req.body;
    if (!chapters || !Array.isArray(chapters)) {
      return res.status(400).json({ error: 'Chapters array required' });
    }

    const keywordIndex: Record<string, number[]> = {};
    const terms: string[] = keywords || [];

    terms.forEach(term => {
      keywordIndex[term] = [];
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      chapters.forEach((ch: any, pageIdx: number) => {
        const pageNum = ch.pageNumber || pageIdx + 1;
        const textToSearch = `${ch.title || ''} ${ch.content || ''}`;
        if (regex.test(textToSearch)) {
          if (!keywordIndex[term].includes(pageNum)) {
            keywordIndex[term].push(pageNum);
          }
        }
      });
    });

    res.json({
      keywordIndex,
      totalPages: chapters.length,
      toc: chapters.map((ch: any, i: number) => ({
        id: ch.id,
        title: ch.title,
        pageNumber: ch.pageNumber || i + 1
      }))
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Route-level fallback: Express error middleware to handle database queries failing gracefully when MongoDB is offline
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err?.name === 'MongooseError' || err?.name === 'MongoNetworkError' || err?.name === 'MongoServerSelectionError' || err?.message?.includes('buffering timed out')) {
    console.warn('[AI Studio] Database offline — returning mock empty response');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
  }
  next(err);
});

// Start dev or production server
async function startServer() {
  await ensureSampleData();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev, use Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TableSmith Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
