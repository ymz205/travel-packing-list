import { useState } from 'react';
import { useChecklistStore } from './stores/checklistStore';
import Home from './pages/Home';
import Checklist from './pages/Checklist';
import History from './pages/History';
import Settings from './pages/Settings';
import { Settings as SettingsIcon, Moon, Sun, List } from 'lucide-react';

type Page = 'home' | 'checklist' | 'history' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const store = useChecklistStore();

  const toggleDarkMode = () => {
    const newMode = store.settings.darkMode === 'dark' ? 'light' : 'dark';
    store.updateSettings({ darkMode: newMode });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home store={store} onGenerate={() => setCurrentPage('checklist')} />;
      case 'checklist':
        return <Checklist store={store} onBack={() => setCurrentPage('home')} />;
      case 'history':
        return <History store={store} onSelect={(record) => { store.loadFromHistory(record); setCurrentPage('checklist'); }} />;
      case 'settings':
        return <Settings store={store} />;
      default:
        return <Home store={store} onGenerate={() => setCurrentPage('checklist')} />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <List className="w-6 h-6 text-primary" />
          <span className="font-medium text-gray-900 dark:text-white hidden sm:inline">旅行极简行李AI清单</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={store.settings.darkMode === 'dark' ? '切换日间模式' : '切换夜间模式'}
          >
            {store.settings.darkMode === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <button
            onClick={() => setCurrentPage('history')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="历史记录"
          >
            <List className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="设置"
          >
            <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 min-h-screen">
        {renderPage()}
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around sm:hidden z-50">
        <button
          onClick={() => setCurrentPage('home')}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${currentPage === 'home' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <List className="w-5 h-5" />
          <span className="text-xs">首页</span>
        </button>
        <button
          onClick={() => setCurrentPage('checklist')}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${currentPage === 'checklist' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <List className="w-5 h-5" />
          <span className="text-xs">清单</span>
        </button>
        <button
          onClick={() => setCurrentPage('history')}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${currentPage === 'history' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <List className="w-5 h-5" />
          <span className="text-xs">历史</span>
        </button>
        <button
          onClick={() => setCurrentPage('settings')}
          className={`flex flex-col items-center gap-1 px-4 py-2 ${currentPage === 'settings' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-xs">设置</span>
        </button>
      </nav>
    </div>
  );
}

export default App;