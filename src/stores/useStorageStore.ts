/**
 * Storage Store - 双存储方案状态管理
 * 面试展示：完整的存储抽象层
 */

import { useState, useCallback, useEffect } from 'react';
import { storageManager, StorageType } from '../services/storageAdapter';
import { generatePackingList } from '../services/aiEngine';
import { generateId, BaseItem } from '../data/itemDatabase';
import { TripConfig, PackingItem, TripRecord, ItemCategory } from '../types';

export function useStorageStore() {
  const [storageType, setStorageType] = useState<StorageType>('dexie');
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<TripRecord | null>(null);
  const [history, setHistory] = useState<TripRecord[]>([]);
  const [customItems] = useState<BaseItem[]>([]);
  const [customCategories, setCustomCategories] = useState<any[]>([]);

  // 初始化存储
  useEffect(() => {
    const initStorage = async () => {
      try {
        // 读取存储偏好
        const savedType = await storageManager.getAdapter().getPreference('storage_mode') as StorageType;
        const type = savedType || 'dexie';
        
        await storageManager.init(type);
        setStorageType(type);
        setIsInitialized(true);
        
        // 加载数据
        await loadData();
        
        console.log(`✅ 存储初始化完成: ${type}`);
      } catch (error) {
        console.error('❌ 存储初始化失败:', error);
        // 降级到Dexie
        await storageManager.init('dexie');
        setStorageType('dexie');
        setIsInitialized(true);
      }
    };

    initStorage();
  }, []);

  // 加载数据
  const loadData = async () => {
    try {
      const adapter = storageManager.getAdapter();
      
      // 加载当前行程
      const trip = await adapter.getCurrentTrip();
      if (trip) {
        const items = await adapter.getItems(trip.id);
        setCurrentRecord({
          id: trip.id,
          name: trip.name,
          config: {
            destination: trip.destination,
            days: trip.days,
            season: trip.season,
            tripType: trip.trip_type || trip.tripType,
            minimalMode: trip.minimal_mode === 1 || trip.minimalMode,
          },
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category_id || item.category,
            quantity: item.quantity,
            packed: item.packed === 1,
            remark: item.remark,
            importance: item.importance,
          })),
          createdAt: trip.created_at || trip.createdAt,
          updatedAt: trip.updated_at || trip.updatedAt,
        });
      }
      
      // 加载历史
      const trips = await adapter.getAllTrips();
      setHistory(trips.map(trip => ({
        id: trip.id,
        name: trip.name,
        config: {
          destination: trip.destination,
          days: trip.days,
          season: trip.season,
          tripType: trip.trip_type || trip.tripType,
          minimalMode: trip.minimal_mode === 1 || trip.minimalMode,
        },
        items: [],
        createdAt: trip.created_at || trip.createdAt,
        updatedAt: trip.updated_at || trip.updatedAt,
      })));
      
      // 加载分类
      const categories = await adapter.getCategories();
      setCustomCategories(categories.filter(c => !c.is_builtin && !c.isBuiltin));
      
    } catch (error) {
      console.error('❌ 加载数据失败:', error);
    }
  };

  // 生成清单
  const generateList = useCallback(async (config: TripConfig) => {
    const adapter = storageManager.getAdapter();
    
    // 生成AI清单
    const items = generatePackingList(config, customItems);
    
    // 创建行程记录
    const record: TripRecord = {
      id: generateId(),
      name: `${config.destination} ${config.tripType === 'business' ? '出差' : config.tripType === 'leisure' ? '休闲' : config.tripType === 'outdoor' ? '户外' : config.tripType === 'family' ? '亲子' : '蜜月'}行 - ${config.days}天`,
      config,
      items,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // 保存到数据库
    await adapter.createTrip({
      id: record.id,
      name: record.name,
      destination: config.destination,
      days: config.days,
      season: config.season,
      tripType: config.tripType,
      minimalMode: config.minimalMode,
    });
    
    // 保存物品
    for (const item of items) {
      await adapter.addItem({
        id: item.id,
        tripId: record.id,
        name: item.name,
        categoryId: item.category,
        quantity: item.quantity,
        packed: item.packed,
        remark: item.remark,
        importance: item.importance,
        isCustom: 0,
      });
    }
    
    setCurrentRecord(record);
    return record;
  }, [customItems]);

  // 更新物品
  const updateItem = useCallback(async (itemId: string, updates: Partial<PackingItem>) => {
    const adapter = storageManager.getAdapter();
    await adapter.updateItem(itemId, updates);
    
    setCurrentRecord(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
        updatedAt: Date.now(),
      };
    });
  }, []);

  // 切换打包状态
  const togglePacked = useCallback(async (itemId: string) => {
    const item = currentRecord?.items.find(i => i.id === itemId);
    if (item) {
      await updateItem(itemId, { packed: !item.packed });
    }
  }, [currentRecord, updateItem]);

  // 添加物品
  const addItem = useCallback(async (name: string, category: ItemCategory, quantity: number = 1, remark: string = '') => {
    if (!currentRecord) return;
    
    const adapter = storageManager.getAdapter();
    const newItem: PackingItem = {
      id: generateId(),
      name,
      category,
      quantity,
      packed: false,
      remark,
      importance: 3,
    };
    
    await adapter.addItem({
      id: newItem.id,
      tripId: currentRecord.id,
      name: newItem.name,
      categoryId: newItem.category,
      quantity: newItem.quantity,
      packed: newItem.packed,
      remark: newItem.remark,
      importance: newItem.importance,
      isCustom: 1,
    });
    
    setCurrentRecord(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [...prev.items, newItem],
        updatedAt: Date.now(),
      };
    });
  }, [currentRecord]);

  // 删除物品
  const deleteItem = useCallback(async (itemId: string) => {
    const adapter = storageManager.getAdapter();
    await adapter.deleteItem(itemId);
    
    setCurrentRecord(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
        updatedAt: Date.now(),
      };
    });
  }, []);

  // 切换存储类型
  const switchStorage = useCallback(async (type: StorageType) => {
    try {
      await storageManager.switchStorage(type);
      setStorageType(type);
      await loadData();
      console.log(`✅ 存储已切换到: ${type}`);
    } catch (error) {
      console.error('❌ 切换存储失败:', error);
    }
  }, []);

  // 获取打包进度
  const getPackingProgress = useCallback(async () => {
    if (!currentRecord) return { total: 0, packed: 0, percentage: 0 };
    const adapter = storageManager.getAdapter();
    return await adapter.getPackingProgress(currentRecord.id);
  }, [currentRecord]);

  // 按分类统计
  const getItemsByCategory = useCallback(async () => {
    if (!currentRecord) return [];
    const adapter = storageManager.getAdapter();
    return await adapter.getItemsByCategory(currentRecord.id);
  }, [currentRecord]);

  // 搜索历史
  const searchHistory = useCallback(async (keyword: string) => {
    const adapter = storageManager.getAdapter();
    return await adapter.searchTrips(keyword);
  }, []);

  // 导出数据库
  const exportDatabase = useCallback(() => {
    storageManager.exportDB();
  }, []);

  return {
    // 状态
    storageType,
    isInitialized,
    currentRecord,
    history,
    customItems,
    customCategories,
    
    // 方法
    generateList,
    updateItem,
    togglePacked,
    addItem,
    deleteItem,
    switchStorage,
    getPackingProgress,
    getItemsByCategory,
    searchHistory,
    exportDatabase,
  };
}
