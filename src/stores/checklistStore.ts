import { useState, useCallback, useEffect } from 'react';
import { TripConfig, PackingItem, TripRecord, AppSettings, ItemCategory, CustomCategory } from '../types';
import { generatePackingList, getAutoSeason } from '../services/aiEngine';
import { saveCurrentList, loadCurrentList, saveToHistory, loadHistory, deleteFromHistory, loadSettings, saveSettings, clearOldHistory, saveCustomItems, loadCustomItems, saveCustomCategories, loadCustomCategories } from '../services/storage';
import { generateId, BaseItem } from '../data/itemDatabase';
import { sqlEngine } from '../services/sqlEngine';

interface HistoryItem extends TripRecord {}

interface UndoState {
  items: PackingItem[];
}

// SQLite同步工具函数
const syncTripToSQLite = async (record: TripRecord) => {
  try {
    if (!sqlEngine.isInitialized()) {
      await sqlEngine.init();
    }
    
    if (!sqlEngine.isInitialized()) return;

    sqlEngine.transaction(() => {
      sqlEngine.execute(
        'INSERT OR REPLACE INTO trip (id, name, destination, days, season, trip_type, minimal_mode, created_at, updated_at, is_current) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          record.id,
          record.name,
          record.config?.destination || '',
          record.config?.days || 1,
          record.config?.season || '',
          record.config?.tripType || 'leisure',
          record.config?.minimalMode ? 1 : 0,
          record.createdAt || Date.now(),
          record.updatedAt || Date.now(),
          1,
        ]
      );

      record.items.forEach((item) => {
        sqlEngine.execute(
          'INSERT OR REPLACE INTO trip_item (id, trip_id, name, category_id, quantity, packed, remark, importance, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            item.id,
            record.id,
            item.name,
            item.category || 'other',
            item.quantity || 1,
            item.packed ? 1 : 0,
            item.remark || '',
            item.importance || 3,
            item.isCustom ? 1 : 0,
          ]
        );
      });
    });

    sqlEngine.saveToStorage();
    console.log(`✅ SQLite: 同步行程 ${record.name} 成功`);
  } catch (error) {
    console.error('❌ SQLite: 同步行程失败:', error);
  }
};

const syncCategoryToSQLite = async (category: CustomCategory) => {
  try {
    if (!sqlEngine.isInitialized()) {
      await sqlEngine.init();
    }
    
    if (!sqlEngine.isInitialized()) return;

    sqlEngine.execute(
      'INSERT OR REPLACE INTO item_category (id, name, name_en, icon, sort_order, is_builtin) VALUES (?, ?, ?, ?, ?, 0)',
      [category.id, category.name, '', 'tag', 99]
    );
    sqlEngine.saveToStorage();
    console.log(`✅ SQLite: 同步分类 ${category.name} 成功`);
  } catch (error) {
    console.error('❌ SQLite: 同步分类失败:', error);
  }
};

const removeCategoryFromSQLite = async (categoryId: string) => {
  try {
    if (!sqlEngine.isInitialized()) {
      await sqlEngine.init();
    }
    
    if (!sqlEngine.isInitialized()) return;

    sqlEngine.transaction(() => {
      sqlEngine.execute('DELETE FROM trip_item WHERE category_id = ?', [categoryId]);
      sqlEngine.execute('DELETE FROM item_category WHERE id = ?', [categoryId]);
    });
    sqlEngine.saveToStorage();
    console.log(`✅ SQLite: 删除分类 ${categoryId} 成功`);
  } catch (error) {
    console.error('❌ SQLite: 删除分类失败:', error);
  }
};

const removeItemFromSQLite = async (itemId: string) => {
  try {
    if (!sqlEngine.isInitialized()) {
      await sqlEngine.init();
    }
    
    if (!sqlEngine.isInitialized()) return;

    sqlEngine.execute('DELETE FROM trip_item WHERE id = ?', [itemId]);
    sqlEngine.saveToStorage();
    console.log(`✅ SQLite: 删除物品 ${itemId} 成功`);
  } catch (error) {
    console.error('❌ SQLite: 删除物品失败:', error);
  }
};

export function useChecklistStore() {
  const [currentRecord, setCurrentRecord] = useState<TripRecord | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [undoStack, setUndoStack] = useState<UndoState[]>([]);
  const [redoStack, setRedoStack] = useState<UndoState[]>([]);
  const [filter, setFilter] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customItems, setCustomItems] = useState<BaseItem[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

  // Load initial data
  useEffect(() => {
    const saved = loadCurrentList();
    if (saved) {
      setCurrentRecord(saved);
    }
    setHistory(loadHistory());
    setCustomItems(loadCustomItems());
    setCustomCategories(loadCustomCategories());
    clearOldHistory(90);
  }, []);

  // Auto-save current record
  useEffect(() => {
    if (currentRecord) {
      const timeoutId = setTimeout(() => {
        saveCurrentList(currentRecord);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [currentRecord]);

  // Dark mode handling
  useEffect(() => {
    const isDark = settings.darkMode === 'dark' || 
      (settings.darkMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [settings.darkMode]);

  const generateList = useCallback((config: TripConfig) => {
    const items = generatePackingList(config, customItems);
    const record: TripRecord = {
      id: generateId(),
      name: `${config.destination} ${config.tripType === 'business' ? '出差' : config.tripType === 'leisure' ? '休闲' : config.tripType === 'outdoor' ? '户外' : config.tripType === 'family' ? '亲子' : '蜜月'}行 - ${config.days}天`,
      config,
      items,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCurrentRecord(record);
    setUndoStack([]);
    setRedoStack([]);
    setFilter('all');
    
    syncTripToSQLite(record);
    
    return record;
  }, [customItems]);

  const updateItem = useCallback((itemId: string, updates: Partial<PackingItem>) => {
    if (!currentRecord) return;
    
    // Save undo state
    setUndoStack(prev => [...prev.slice(-settings.undoSteps - 1), { items: currentRecord.items }]);
    setRedoStack([]);

    setCurrentRecord(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
        updatedAt: Date.now(),
      };
      saveCurrentList(updated);
      return updated;
    });
  }, [currentRecord, settings.undoSteps]);

  const togglePacked = useCallback((itemId: string) => {
    if (!currentRecord) return;
    const item = currentRecord.items.find(i => i.id === itemId);
    if (item) {
      updateItem(itemId, { packed: !item.packed });
    }
  }, [currentRecord, updateItem]);

  const addItem = useCallback((name: string, category: ItemCategory, quantity: number = 1, remark: string = '') => {
    if (!currentRecord) return;
    
    setUndoStack(prev => [...prev.slice(-settings.undoSteps - 1), { items: currentRecord.items }]);
    setRedoStack([]);

    const newItem: PackingItem = {
      id: generateId(),
      name,
      category,
      quantity,
      packed: false,
      remark,
      importance: 3,
      isCustom: true,
    };
    
    setCurrentRecord(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        items: [...prev.items, newItem],
        updatedAt: Date.now(),
      };
      saveCurrentList(updated);
      return updated;
    });

    const newCustomItem: BaseItem = {
      name,
      category,
      importance: 3,
    };
    
    setCustomItems(prev => {
      const existingNames = new Set(prev.map(item => item.name));
      if (!existingNames.has(name)) {
        const updated = [...prev, newCustomItem];
        saveCustomItems(updated);
        return updated;
      }
      return prev;
    });
  }, [currentRecord, settings.undoSteps]);

  const removeItem = useCallback((itemId: string) => {
    if (!currentRecord) return;
    
    const itemToRemove = currentRecord.items.find(item => item.id === itemId);
    
    setUndoStack(prev => [...prev.slice(-settings.undoSteps - 1), { items: currentRecord.items }]);
    setRedoStack([]);

    setCurrentRecord(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
        updatedAt: Date.now(),
      };
      saveCurrentList(updated);
      return updated;
    });

    // 如果是用户添加的物品，也从 customItems 中删除
    if (itemToRemove?.isCustom) {
      setCustomItems(prev => {
        const updated = prev.filter(item => item.name !== itemToRemove.name);
        saveCustomItems(updated);
        return updated;
      });
    }
    
    removeItemFromSQLite(itemId);
  }, [currentRecord, settings.undoSteps]);

  const removeItemsInCategory = useCallback((categoryName: string) => {
    if (!currentRecord) return;
    
    setUndoStack(prev => [...prev.slice(-settings.undoSteps - 1), { items: currentRecord.items }]);
    setRedoStack([]);

    setCurrentRecord(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        items: prev.items.filter(item => item.category !== categoryName),
        updatedAt: Date.now(),
      };
      saveCurrentList(updated);
      return updated;
    });

    // 从 customItems 中删除该类别的用户添加物品
    setCustomItems(prev => {
      const updated = prev.filter(item => item.category !== categoryName);
      saveCustomItems(updated);
      return updated;
    });
  }, [currentRecord, settings.undoSteps]);

  const addCustomCategory = useCallback((name: string) => {
    setCustomCategories(prev => {
      const existingNames = new Set(prev.map(cat => cat.name));
      if (!existingNames.has(name)) {
        const newCategory = { id: generateId(), name };
        const updated = [...prev, newCategory];
        saveCustomCategories(updated);
        syncCategoryToSQLite(newCategory);
        return updated;
      }
      return prev;
    });
  }, []);

  const renameCustomCategory = useCallback((categoryId: string, newName: string) => {
    setCustomCategories(prev => {
      const updated = prev.map(cat => 
        cat.id === categoryId ? { ...cat, name: newName } : cat
      );
      saveCustomCategories(updated);
      return updated;
    });

    if (currentRecord) {
      setCurrentRecord(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          items: prev.items.map(item => 
            item.category === categoryId 
              ? { ...item, category: newName } 
              : item
          ),
          updatedAt: Date.now(),
        };
        saveCurrentList(updated);
        return updated;
      });
    }
  }, [currentRecord]);

  const removeCustomCategory = useCallback((categoryId: string) => {
    setCustomCategories(prev => {
      const updated = prev.filter(cat => cat.id !== categoryId);
      saveCustomCategories(updated);
      return updated;
    });
    removeCategoryFromSQLite(categoryId);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0 || !currentRecord) return;
    
    const prevState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { items: currentRecord.items }]);
    setUndoStack(prev => prev.slice(0, -1));
    
    setCurrentRecord(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        items: prevState.items,
        updatedAt: Date.now(),
      };
      saveCurrentList(updated);
      return updated;
    });
  }, [undoStack, currentRecord]);

  const redo = useCallback(() => {
    if (redoStack.length === 0 || !currentRecord) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { items: currentRecord.items }]);
    setRedoStack(prev => prev.slice(0, -1));
    
    setCurrentRecord(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        items: nextState.items,
        updatedAt: Date.now(),
      };
      saveCurrentList(updated);
      return updated;
    });
  }, [redoStack, currentRecord]);

  const toggleMinimalMode = useCallback(() => {
    if (!currentRecord) return;
    const newConfig = { ...currentRecord.config, minimalMode: !currentRecord.config.minimalMode };
    generateList(newConfig);
  }, [currentRecord, generateList]);

  const saveToHistoryList = useCallback(() => {
    if (!currentRecord) return;
    saveToHistory(currentRecord);
    setHistory(loadHistory());
  }, [currentRecord]);

  const loadFromHistory = useCallback((record: TripRecord) => {
    setCurrentRecord(record);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const deleteHistory = useCallback((id: string) => {
    deleteFromHistory(id);
    setHistory(loadHistory());
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const clearAllPacked = useCallback(() => {
    if (!currentRecord) return;
    
    setUndoStack(prev => [...prev.slice(-settings.undoSteps - 1), { items: currentRecord.items }]);
    setRedoStack([]);

    setCurrentRecord(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        items: prev.items.map(item => ({ ...item, packed: false })),
        updatedAt: Date.now(),
      };
      saveCurrentList(updated);
      return updated;
    });
  }, [currentRecord, settings.undoSteps]);

  const selectAll = useCallback(() => {
    if (!currentRecord) return;
    
    setUndoStack(prev => [...prev.slice(-settings.undoSteps - 1), { items: currentRecord.items }]);
    setRedoStack([]);

    setCurrentRecord(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        items: prev.items.map(item => ({ ...item, packed: true })),
        updatedAt: Date.now(),
      };
      saveCurrentList(updated);
      return updated;
    });
  }, [currentRecord, settings.undoSteps]);

  const filteredItems = currentRecord?.items.filter(item => {
    if (filter !== 'all' && item.category !== filter) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }) || [];

  const packedCount = currentRecord?.items.filter(item => item.packed).length || 0;
  const totalCount = currentRecord?.items.length || 0;

  return {
    currentRecord,
    history,
    settings,
    filter,
    searchQuery,
    filteredItems,
    packedCount,
    totalCount,
    customCategories,
    undoStack,
    redoStack,
    generateList,
    togglePacked,
    addItem,
    removeItem,
    removeItemsInCategory,
    updateItem,
    undo,
    redo,
    toggleMinimalMode,
    saveToHistory: saveToHistoryList,
    loadFromHistory,
    deleteHistory,
    updateSettings,
    setFilter,
    setSearchQuery,
    clearAllPacked,
    selectAll,
    addCustomCategory,
    renameCustomCategory,
    removeCustomCategory,
    getAutoSeason,
  };
}