import { Moon, Sun, Monitor, Trash2, Download, Info } from 'lucide-react';
import { useChecklistStore } from '../stores/checklistStore';
import StorageSwitcher from '../components/StorageSwitcher';
import { storageManager } from '../services/storageAdapter';

interface SettingsProps {
  store: ReturnType<typeof useChecklistStore>;
  onSwitchStorage?: (type: 'dexie' | 'sql') => void;
  currentStorageType?: 'dexie' | 'sql';
}

export default function Settings({ store }: SettingsProps) {
  const { settings, updateSettings } = store;

  const handleClearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？此操作无法撤销。')) {
      store.history.forEach(record => store.deleteHistory(record.id));
    }
  };

  const handleExportData = () => {
    const data = {
      history: store.history,
      settings: store.settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel-packing-backup-${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      {/* Header */}
      <div className="sticky top-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="px-4 py-3">
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">设置</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Appearance */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">外观</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-gray-900 dark:text-white">主题模式</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">选择应用的外观主题</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateSettings({ darkMode: 'light' })}
                  className={`p-2 rounded-lg ${settings.darkMode === 'light' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                  title="日间模式"
                >
                  <Sun className="w-5 h-5" />
                </button>
                <button
                  onClick={() => updateSettings({ darkMode: 'dark' })}
                  className={`p-2 rounded-lg ${settings.darkMode === 'dark' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                  title="夜间模式"
                >
                  <Moon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => updateSettings({ darkMode: 'system' })}
                  className={`p-2 rounded-lg ${settings.darkMode === 'system' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                  title="跟随系统"
                >
                  <Monitor className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Personalization */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">个性化</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-gray-900 dark:text-white">用户偏好记忆</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">记住常用物品选择</div>
              </div>
              <button
                onClick={() => updateSettings({ userPreference记忆: !settings.userPreference记忆 })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.userPreference记忆 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.userPreference记忆 ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-gray-900 dark:text-white">打包技巧提示</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">显示物品打包小技巧</div>
              </div>
              <button
                onClick={() => updateSettings({ packingTips: !settings.packingTips })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.packingTips ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.packingTips ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-gray-900 dark:text-white">撤销/重做步数</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">操作历史保留数量</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={settings.undoSteps}
                  onChange={(e) => updateSettings({ undoSteps: parseInt(e.target.value) })}
                  className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-gray-900 dark:text-white w-8 text-right">{settings.undoSteps}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 存储方案 - 面试展示 */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">存储方案</h2>
          <StorageSwitcher
            currentType={store.settings.storageType || 'dexie'}
            onSwitch={(type) => {
              if (store.updateSettings) {
                store.updateSettings({ storageType: type } as any);
              }
              storageManager.switchStorage(type);
            }}
          />
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">数据管理</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            <button
              onClick={handleExportData}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-gray-900 dark:text-white">导出数据</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">备份历史记录和设置</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={handleClearHistory}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-danger" />
                <div>
                  <div className="text-danger">清空所有历史</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">删除所有历史记录</div>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">关于</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="p-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <div className="text-gray-900 dark:text-white">旅行极简行李AI清单</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">版本 1.0.0</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}