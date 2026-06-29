export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'rainy' | 'dry';
export type TripType = 'business' | 'leisure' | 'outdoor' | 'family' | 'honeymoon';

export interface Destination {
  name: string;
  country: string;
  climate: 'tropical' | 'temperate' | 'cold' | 'desert';
}

export interface PackingItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  packed: boolean;
  remark: string;
  importance: number;
  tips?: string;
  isCustom?: boolean;
}

export type BuiltinCategory = 'clothing' | 'toiletries' | 'medicine' | 'electronics';
export type ItemCategory = BuiltinCategory | string;

export interface CustomCategory {
  id: string;
  name: string;
}

export interface TripConfig {
  destination: string;
  days: number;
  season: Season;
  tripType: TripType;
  minimalMode: boolean;
}

export interface TripRecord {
  id: string;
  name: string;
  config: TripConfig;
  items: PackingItem[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  darkMode: 'light' | 'dark' | 'system';
  userPreference记忆: boolean;
  packingTips: boolean;
  undoSteps: number;
  storageType?: 'dexie' | 'sql';
}