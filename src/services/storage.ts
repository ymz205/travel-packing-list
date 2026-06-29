import { TripRecord, AppSettings, CustomCategory } from '../types';
import { BaseItem } from '../data/itemDatabase';

const STORAGE_KEYS = {
  CURRENT_LIST: 'travel_packing_current',
  HISTORY: 'travel_packing_history',
  SETTINGS: 'travel_packing_settings',
  CUSTOM_ITEMS: 'travel_packing_custom_items',
  CUSTOM_CATEGORIES: 'travel_packing_custom_categories',
};

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: 'system',
  userPreference记忆: true,
  packingTips: true,
  undoSteps: 20,
};

export function saveCurrentList(record: TripRecord | null): void {
  if (record) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_LIST, JSON.stringify(record));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_LIST);
  }
}

export function loadCurrentList(): TripRecord | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_LIST);
  return data ? JSON.parse(data) : null;
}

export function saveToHistory(record: TripRecord): void {
  const history = loadHistory();
  const existingIndex = history.findIndex(r => r.id === record.id);
  
  if (existingIndex >= 0) {
    history[existingIndex] = { ...record, updatedAt: Date.now() };
  } else {
    history.unshift({ ...record, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  // Keep only last 100 records
  const trimmedHistory = history.slice(0, 100);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
}

export function loadHistory(): TripRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
}

export function deleteFromHistory(id: string): void {
  const history = loadHistory();
  const filtered = history.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
}

export function clearOldHistory(daysThreshold: number = 90): TripRecord[] {
  const history = loadHistory();
  const threshold = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;
  const valid = history.filter(r => r.updatedAt > threshold);
  const old = history.filter(r => r.updatedAt <= threshold);
  
  if (old.length > 0) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(valid));
  }
  
  return old;
}

export function loadSettings(): AppSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function saveCustomItems(items: BaseItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_ITEMS, JSON.stringify(items));
}

export function loadCustomItems(): BaseItem[] {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_ITEMS);
  return data ? JSON.parse(data) : [];
}

export function saveCustomCategories(categories: CustomCategory[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(categories));
}

export function loadCustomCategories(): CustomCategory[] {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
  return data ? JSON.parse(data) : [];
}

export function exportAsText(items: TripRecord['items']): string {
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, TripRecord['items']>);

  const categoryNames: Record<string, string> = {
    clothing: '衣物类',
    toiletries: '洗护类',
    medicine: '药品类',
    electronics: '电子类',
    custom: '自定义',
  };

  let text = '旅行行李清单\n';
  text += '============\n\n';

  Object.entries(grouped).forEach(([category, items]) => {
    text += `${categoryNames[category] || category}\n`;
    items.forEach(item => {
      const status = item.packed ? '✓' : '○';
      const remark = item.remark ? ` (${item.remark})` : '';
      text += `${status} ${item.name} ×${item.quantity}${remark}\n`;
    });
    text += '\n';
  });

  return text;
}