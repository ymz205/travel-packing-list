/**
 * Storage Adapter - 双存储方案适配器
 * 面试展示：适配器模式 + 策略模式
 */

import { sqlEngine, SqlEngine } from './sqlEngine';
import { Dexie } from 'dexie';

// Dexie数据库定义
class TravelDexieDB extends Dexie {
  trips!: any;
  items!: any;
  categories!: any;
  preferences!: any;

  constructor() {
    super('TravelPackingDB');
    this.version(1).stores({
      trips: '++id, name, destination, createdAt, isCurrent',
      items: '++id, tripId, name, category, packed, importance',
      categories: '++id, name, isBuiltin, sortOrder',
      preferences: 'key, value',
    });
  }
}

const dexieDB = new TravelDexieDB();

// 存储类型枚举
export type StorageType = 'dexie' | 'sql';

// 存储适配器接口
interface StorageAdapter {
  // 初始化
  init(): Promise<void>;
  
  // Trip操作
  createTrip(trip: any): Promise<void>;
  getCurrentTrip(): Promise<any>;
  getAllTrips(): Promise<any[]>;
  updateTrip(id: string, updates: any): Promise<void>;
  deleteTrip(id: string): Promise<void>;
  
  // Item操作
  addItem(item: any): Promise<void>;
  getItems(tripId: string): Promise<any[]>;
  updateItem(id: string, updates: any): Promise<void>;
  deleteItem(id: string): Promise<void>;
  
  // Category操作
  getCategories(): Promise<any[]>;
  addCategory(category: any): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  
  // Preference操作
  getPreference(key: string): Promise<any>;
  setPreference(key: string, value: any): Promise<void>;
  
  // 统计
  getPackingProgress(tripId: string): Promise<{ total: number; packed: number; percentage: number }>;
  getItemsByCategory(tripId: string): Promise<any[]>;
  searchTrips(keyword: string): Promise<any[]>;
}

// Dexie适配器
class DexieAdapter implements StorageAdapter {
  async init(): Promise<void> {
    await dexieDB.open();
    console.log('✅ Dexie: IndexedDB初始化成功');
  }

  async createTrip(trip: any): Promise<void> {
    await dexieDB.trips.add({
      ...trip,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isCurrent: true,
    });
    
    // 将其他行程设为非当前
    await dexieDB.trips.where('id').notEqual(trip.id).modify({ isCurrent: false });
  }

  async getCurrentTrip(): Promise<any> {
    return await dexieDB.trips.where('isCurrent').equals(1).first();
  }

  async getAllTrips(): Promise<any[]> {
    return await dexieDB.trips.orderBy('createdAt').reverse().toArray();
  }

  async updateTrip(id: string, updates: any): Promise<void> {
    await dexieDB.trips.update(id, { ...updates, updatedAt: Date.now() });
  }

  async deleteTrip(id: string): Promise<void> {
    await dexieDB.transaction('rw', [dexieDB.trips, dexieDB.items], async () => {
      await dexieDB.items.where('tripId').equals(id).delete();
      await dexieDB.trips.delete(id);
    });
  }

  async addItem(item: any): Promise<void> {
    await dexieDB.items.add({
      ...item,
      createdAt: Date.now(),
    });
  }

  async getItems(tripId: string): Promise<any[]> {
    return await dexieDB.items.where('tripId').equals(tripId).toArray();
  }

  async updateItem(id: string, updates: any): Promise<void> {
    await dexieDB.items.update(id, updates);
  }

  async deleteItem(id: string): Promise<void> {
    await dexieDB.items.delete(id);
  }

  async getCategories(): Promise<any[]> {
    return await dexieDB.categories.orderBy('sortOrder').toArray();
  }

  async addCategory(category: any): Promise<void> {
    await dexieDB.categories.add(category);
  }

  async deleteCategory(id: string): Promise<void> {
    await dexieDB.categories.where('id').equals(id).and((c: any) => !c.isBuiltin).delete();
  }

  async getPreference(key: string): Promise<any> {
    const pref = await dexieDB.preferences.get(key);
    return pref?.value;
  }

  async setPreference(key: string, value: any): Promise<void> {
    await dexieDB.preferences.put({ key, value, updatedAt: Date.now() });
  }

  async getPackingProgress(tripId: string): Promise<{ total: number; packed: number; percentage: number }> {
    const items = await this.getItems(tripId);
    const total = items.length;
    const packed = items.filter(i => i.packed).length;
    const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;
    return { total, packed, percentage };
  }

  async getItemsByCategory(tripId: string): Promise<any[]> {
    const items = await this.getItems(tripId);
    const categories = await this.getCategories();
    
    const grouped: Record<string, any> = {};
    categories.forEach(cat => {
      grouped[cat.id] = {
        category_id: cat.id,
        category_name: cat.name,
        category_icon: cat.icon,
        total_count: 0,
        packed_count: 0,
      };
    });

    items.forEach(item => {
      if (grouped[item.category]) {
        grouped[item.category].total_count++;
        if (item.packed) grouped[item.category].packed_count++;
      }
    });

    return Object.values(grouped);
  }

  async searchTrips(keyword: string): Promise<any[]> {
    return await dexieDB.trips
      .filter((t: any) => t.name.includes(keyword) || t.destination.includes(keyword))
      .reverse()
      .sortBy('createdAt');
  }
}

// SQLite适配器
class SQLiteAdapter implements StorageAdapter {
  private engine: SqlEngine;

  constructor() {
    this.engine = sqlEngine;
  }

  async init(): Promise<void> {
    await this.engine.init();
  }

  async createTrip(trip: any): Promise<void> {
    this.engine.createTrip(trip);
  }

  async getCurrentTrip(): Promise<any> {
    return this.engine.getCurrentTrip();
  }

  async getAllTrips(): Promise<any[]> {
    return this.engine.getAllTrips();
  }

  async updateTrip(id: string, updates: any): Promise<void> {
    this.engine.updateTrip(id, updates);
  }

  async deleteTrip(id: string): Promise<void> {
    this.engine.deleteTrip(id);
  }

  async addItem(item: any): Promise<void> {
    this.engine.addTripItem(item);
  }

  async getItems(tripId: string): Promise<any[]> {
    return this.engine.getTripItems(tripId);
  }

  async updateItem(id: string, updates: any): Promise<void> {
    this.engine.updateTripItem(id, updates);
  }

  async deleteItem(id: string): Promise<void> {
    this.engine.deleteTripItem(id);
  }

  async getCategories(): Promise<any[]> {
    return this.engine.getAllCategories();
  }

  async addCategory(category: any): Promise<void> {
    this.engine.addCustomCategory(category.id, category.name);
  }

  async deleteCategory(id: string): Promise<void> {
    this.engine.deleteCustomCategory(id);
  }

  async getPreference(key: string): Promise<any> {
    return this.engine.getPreference(key);
  }

  async setPreference(key: string, value: any): Promise<void> {
    this.engine.setPreference(key, value);
  }

  async getPackingProgress(tripId: string): Promise<{ total: number; packed: number; percentage: number }> {
    return this.engine.getPackingProgress(tripId);
  }

  async getItemsByCategory(tripId: string): Promise<any[]> {
    return this.engine.getItemsByCategory(tripId);
  }

  async searchTrips(keyword: string): Promise<any[]> {
    return this.engine.searchTrips(keyword);
  }
}

// 存储管理器
class StorageManager {
  private currentAdapter: StorageAdapter | null = null;
  private storageType: StorageType = 'dexie';

  async init(type: StorageType = 'dexie'): Promise<void> {
    this.storageType = type;
    this.currentAdapter = type === 'dexie' ? new DexieAdapter() : new SQLiteAdapter();
    await this.currentAdapter.init();
    
    // 初始化分类数据
    if (type === 'sql') {
      const categories = await this.currentAdapter.getCategories();
      if (categories.length === 0) {
        // 添加内置分类
        const builtinCategories = [
          { id: 'clothing', name: '衣物类', name_en: 'Clothing', icon: 'shirt', sortOrder: 1, isBuiltin: 1 },
          { id: 'toiletries', name: '洗护类', name_en: 'Toiletries', icon: 'droplet', sortOrder: 2, isBuiltin: 1 },
          { id: 'medicine', name: '药品类', name_en: 'Medicine', icon: 'pill', sortOrder: 3, isBuiltin: 1 },
          { id: 'electronics', name: '电子类', name_en: 'Electronics', icon: 'smartphone', sortOrder: 4, isBuiltin: 1 },
        ];
        for (const cat of builtinCategories) {
          await this.currentAdapter.addCategory(cat);
        }
      }
    }
  }

  getAdapter(): StorageAdapter {
    if (!this.currentAdapter) {
      throw new Error('存储未初始化');
    }
    return this.currentAdapter;
  }

  getType(): StorageType {
    return this.storageType;
  }

  async switchStorage(type: StorageType): Promise<void> {
    if (this.storageType === type) return;
    
    // 保存当前存储模式
    if (this.currentAdapter) {
      await this.currentAdapter.setPreference('storage_mode', type);
    }
    
    await this.init(type);
  }

  // 导出数据库
  exportDB(): void {
    if (!sqlEngine.isInitialized()) {
      sqlEngine.init().then(() => {
        sqlEngine.exportDatabase();
      }).catch(error => {
        console.error('❌ SQLite: 初始化失败:', error);
        alert('SQLite初始化失败，请查看控制台日志');
      });
    } else {
      sqlEngine.exportDatabase();
    }
  }

  getStats(): any {
    if (!sqlEngine.isInitialized()) {
      return null;
    }
    return sqlEngine.getStats();
  }
}

export const storageManager = new StorageManager();
export { dexieDB, sqlEngine };
