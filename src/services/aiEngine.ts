import { TripConfig, PackingItem, ItemCategory, Season } from '../types';
import { baseItems, destinations, generateId, getAllItems } from '../data/itemDatabase';
import { Destination } from '../types';

function getClimate(destinationName: string): Destination['climate'] | null {
  const found = destinations.find(d => d.name.includes(destinationName) || destinationName.includes(d.name));
  return found?.climate || null;
}

function getSeasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getQuantityMultiplier(category: ItemCategory, days: number): number {
  switch (category) {
    case 'clothing':
      if (days <= 3) return 1;
      if (days <= 7) return Math.ceil(days / 2);
      return Math.ceil(days / 2.5);
    case 'toiletries':
      return 1;
    case 'medicine':
      return 1;
    case 'electronics':
      return 1;
    default:
      return 1;
  }
}

function getClothingQuantity(itemName: string, days: number): number {
  const lowerName = itemName.toLowerCase();
  
  if (lowerName.includes('t恤') || lowerName.includes('衬衫') || lowerName.includes('内衣') || lowerName.includes('袜子')) {
    if (days <= 3) return days;
    return Math.ceil(days * 0.8);
  }
  if (lowerName.includes('裤') || lowerName.includes('牛仔')) {
    if (days <= 3) return 2;
    return Math.ceil(days / 2);
  }
  if (lowerName.includes('外套') || lowerName.includes('夹克') || lowerName.includes('卫衣')) {
    return 1;
  }
  if (lowerName.includes('泳装')) {
    return 1;
  }
  
  return 1;
}

export function generatePackingList(config: TripConfig, customItems: typeof baseItems = []): PackingItem[] {
  const climate = getClimate(config.destination);
  const season = config.season;
  const tripType = config.tripType;
  const days = config.days;
  const minimalMode = config.minimalMode;

  const allItems = getAllItems(customItems);
  const customItemNames = new Set(customItems.map(item => item.name));

  const filteredItems = allItems.filter(item => {
    // Climate filter
    if (item.climates && climate && !item.climates.includes(climate)) {
      return false;
    }
    
    // Season filter
    if (item.seasons && !item.seasons.includes(season)) {
      return false;
    }
    
    // Trip type filter
    if (item.tripTypes && !item.tripTypes.includes(tripType)) {
      return false;
    }
    
    // Minimal mode: filter out low importance items
    if (minimalMode && item.importance < 4) {
      return false;
    }
    
    return true;
  });

  const packingItems: PackingItem[] = filteredItems.map(item => {
    let quantity = getQuantityMultiplier(item.category, days);
    
    if (item.category === 'clothing') {
      quantity = getClothingQuantity(item.name, days);
    }
    
    // Adjust for minimal mode
    if (minimalMode && quantity > 1) {
      quantity = Math.min(quantity, 2);
    }
    
    return {
      id: generateId(),
      name: item.name,
      category: item.category,
      quantity,
      packed: false,
      remark: '',
      importance: item.importance,
      tips: item.tips,
      isCustom: customItemNames.has(item.name),
    };
  });

  // Sort by category and importance
  const categoryOrder: ItemCategory[] = ['clothing', 'toiletries', 'medicine', 'electronics', 'custom'];
  packingItems.sort((a, b) => {
    const catA = categoryOrder.indexOf(a.category);
    const catB = categoryOrder.indexOf(b.category);
    if (catA !== catB) return catA - catB;
    return b.importance - a.importance;
  });

  return packingItems;
}

export function getAutoSeason(): Season {
  const month = new Date().getMonth() + 1;
  return getSeasonFromMonth(month);
}

export function searchDestinations(query: string): Destination[] {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return destinations.filter(d => 
    d.name.toLowerCase().includes(lowerQuery) ||
    d.country.toLowerCase().includes(lowerQuery) ||
    (d as any).pinyin?.toLowerCase().includes(lowerQuery)
  ).slice(0, 8);
}