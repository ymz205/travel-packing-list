/**
 * StorageSwitcher - 存储切换开关组件
 * 面试展示：双存储方案UI切换
 */

import { Database, HardDrive, Download, Info } from 'lucide-react';
import { StorageType } from '../services/storageAdapter';
import { storageManager } from '../services/storageAdapter';

interface StorageSwitcherProps {
  currentType: StorageType;
  onSwitch: (type: StorageType) => void;
}

export default function StorageSwitcher({ currentType, onSwitch }: StorageSwitcherProps) {
  const handleExport = () => {
    if (currentType === 'sql') {
      storageManager.exportDB();
    }
  };

  const getStats = () => {
    if (currentType === 'sql') {
      const stats = storageManager.getStats();
      if (stats) {
        return `${stats.totalRecords} 条记录 | ${stats.dbSize} KB`;
      }
    }
    return '使用IndexedDB';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            存储方案
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Info className="w-3 h-3" />
          <span>{getStats()}</span>
        </div>
      </div>

      {/* 存储切换按钮 */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => onSwitch('dexie')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
            currentType === 'dexie'
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span className="text-sm font-medium">Dexie</span>
        </button>
        
        <button
          onClick={() => onSwitch('sql')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
            currentType === 'sql'
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Database className="w-4 h-4" />
          <span className="text-sm font-medium">SQLite</span>
        </button>
      </div>

      {/* 功能按钮 */}
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={currentType !== 'sql'}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            currentType === 'sql'
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <Download className="w-4 h-4" />
          <span className="text-xs">导出.db</span>
        </button>
        
        <div className="flex-1 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs">
          <div className="font-medium mb-1">
            {currentType === 'dexie' ? 'IndexedDB方案' : 'SQLite WASM方案'}
          </div>
          <div className="text-xs opacity-80">
            {currentType === 'dexie'
              ? '• 键值存储\n• 自动索引\n• 简单易用'
              : '• 关系型数据库\n• SQL查询\n• 支持事务\n• 可导出.db'}
          </div>
        </div>
      </div>

      {/* 面试说明 */}
      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="text-xs text-yellow-700 dark:text-yellow-400">
          💡 <strong>提示：</strong>两套存储方案并行，Dexie用于简单场景，SQLite用于复杂查询和数据展示。
        </div>
      </div>
    </div>
  );
}
