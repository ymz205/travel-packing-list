import { useState } from 'react';
import { ArrowLeft, Search, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useChecklistStore } from '../stores/checklistStore';
import { TripRecord } from '../types';

interface HistoryProps {
  store: ReturnType<typeof useChecklistStore>;
  onSelect: (record: TripRecord) => void;
}

export default function History({ store, onSelect }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredHistory = store.history.filter(record => 
    record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.config.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOld = (timestamp: number) => {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    return timestamp < ninetyDaysAgo;
  };

  const handleDelete = (id: string) => {
    store.deleteHistory(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      {/* Header */}
      <div className="sticky top-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => history.back()} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">历史清单</h1>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索行程或目的地..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="px-4 py-4 space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">暂无历史记录</p>
          </div>
        ) : (
          filteredHistory.map((record) => (
            <div
              key={record.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden ${isOld(record.updatedAt) ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => onSelect(record)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{record.name}</h3>
                    {isOld(record.updatedAt) && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                        已过期
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {record.config.destination}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(record.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    共 {record.items.length} 件物品 · 已打包 {record.items.filter(i => i.packed).length} 件
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>
              
              <div className="border-t border-gray-100 dark:border-gray-700/50 flex">
                <button
                  onClick={() => onSelect(record)}
                  className="flex-1 py-2 text-sm text-primary hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  查看详情
                </button>
                <button
                  onClick={() => setDeleteConfirm(record.id)}
                  className="flex-1 py-2 text-sm text-danger hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l border-gray-100 dark:border-gray-700/50"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">确认删除</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">确定要删除这条历史记录吗？此操作无法撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-12 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 h-12 rounded-lg bg-danger text-white font-medium hover:opacity-90"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}