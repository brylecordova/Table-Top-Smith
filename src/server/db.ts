import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';

export interface StorageAdapter {
  collection(name: string): CollectionAdapter;
}

export interface CollectionAdapter {
  find(query?: Record<string, any>): Promise<any[]>;
  findOne(query: Record<string, any>): Promise<any | null>;
  insertOne(doc: any): Promise<{ insertedId: string }>;
  updateOne(filter: Record<string, any>, update: Record<string, any>, options?: { upsert?: boolean }): Promise<{ matchedCount: number; modifiedCount: number }>;
  deleteOne(filter: Record<string, any>): Promise<{ deletedCount: number }>;
}

class LocalJsonDb implements StorageAdapter {
  private filePath: string;
  private data: Record<string, any[]> = {};

  constructor(filePath: string) {
    this.filePath = filePath;
    this.load();
  }

  private load() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = { projects: [], cardGroups: [], boxDielines: [], tokens: [], standees: [], boards: [], rulebooks: [] };
        this.save();
      }
    } catch (e) {
      console.warn('Failed to load local database, falling back to memory store:', e);
      this.data = { projects: [], cardGroups: [], boxDielines: [], tokens: [], standees: [], boards: [], rulebooks: [] };
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database file:', e);
    }
  }

  collection(name: string): CollectionAdapter {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    const store = this.data[name];

    return {
      find: async (query?: Record<string, any>) => {
        if (!query || Object.keys(query).length === 0) return [...store];
        return store.filter(item => {
          return Object.entries(query).every(([k, v]) => item[k] === v);
        });
      },
      findOne: async (query: Record<string, any>) => {
        return store.find(item => {
          return Object.entries(query).every(([k, v]) => item[k] === v);
        }) || null;
      },
      insertOne: async (doc: any) => {
        const _id = doc._id || doc.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newDoc = { ...doc, _id };
        store.push(newDoc);
        this.save();
        return { insertedId: _id };
      },
      updateOne: async (filter: Record<string, any>, update: Record<string, any>, options?: { upsert?: boolean }) => {
        const index = store.findIndex(item => Object.entries(filter).every(([k, v]) => item[k] === v));
        if (index >= 0) {
          const target = store[index];
          const setFields = update.$set || update;
          store[index] = { ...target, ...setFields, updatedAt: new Date().toISOString() };
          this.save();
          return { matchedCount: 1, modifiedCount: 1 };
        } else if (options?.upsert) {
          const newDoc = { ...filter, ...(update.$set || update), _id: filter._id || `doc_${Date.now()}` };
          store.push(newDoc);
          this.save();
          return { matchedCount: 0, modifiedCount: 1 };
        }
        return { matchedCount: 0, modifiedCount: 0 };
      },
      deleteOne: async (filter: Record<string, any>) => {
        const initialLen = store.length;
        const filtered = store.filter(item => !Object.entries(filter).every(([k, v]) => item[k] === v));
        this.data[name] = filtered;
        this.save();
        return { deletedCount: initialLen - filtered.length };
      }
    };
  }
}

class MongoDbAdapter implements StorageAdapter {
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  collection(name: string): CollectionAdapter {
    const col = this.db.collection(name);
    return {
      find: async (query?: Record<string, any>) => col.find(query || {}).toArray(),
      findOne: async (query: Record<string, any>) => col.findOne(query),
      insertOne: async (doc: any) => {
        const res = await col.insertOne(doc);
        return { insertedId: res.insertedId.toString() };
      },
      updateOne: async (filter: Record<string, any>, update: Record<string, any>, options?: { upsert?: boolean }) => {
        const res = await col.updateOne(filter, update, options);
        return { matchedCount: res.matchedCount, modifiedCount: res.modifiedCount };
      },
      deleteOne: async (filter: Record<string, any>) => {
        const res = await col.deleteOne(filter);
        return { deletedCount: res.deletedCount };
      }
    };
  }
}

let dbInstance: StorageAdapter | null = null;

export async function getDatabase(): Promise<StorageAdapter> {
  if (dbInstance) return dbInstance;

  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      console.log('Connecting to MongoDB cluster at:', mongoUri);
      const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 2000, connectTimeoutMS: 2000 });
      await client.connect();
      const db = client.db(process.env.MONGODB_DB_NAME || 'tablesmith');
      dbInstance = new MongoDbAdapter(db);
      console.log('MongoDB successfully connected.');
      return dbInstance;
    } catch (err) {
      console.warn('Failed to connect to MongoDB URI. Falling back to local persistent store.', err);
    }
  }

  const dbPath = path.resolve(process.cwd(), 'data', 'tablesmith-db.json');
  console.log(`Using persistent local document store at ${dbPath}`);
  dbInstance = new LocalJsonDb(dbPath);
  return dbInstance;
}
