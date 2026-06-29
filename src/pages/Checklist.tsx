import { useState } from 'react';
import { ArrowLeft, Check, Trash2, Plus, X, Edit3, Download, FileText, Share2, Copy, Zap, Undo2, Redo2, Search } from 'lucide-react';
import { useChecklistStore } from '../stores/checklistStore';
import { ItemCategory, PackingItem, CustomCategory } from '../types';
import { exportAsPDF, exportAsExcel, copyToClipboard } from '../services/export';
import { exportAsText } from '../services/storage';

interface ChecklistProps {
  store: ReturnType<typeof useChecklistStore>;
  onBack: () => void;
}

const categoryLabels: Record<ItemCategory | 'all', string> = {
  all: '全部',
  clothing: '衣物类',
  toiletries: '洗护类',
  medicine: '药品类',
  electronics: '电子类',
  custom: '自定义',
};

export default function Checklist({ store, onBack }: ChecklistProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [exportPackedOnly, setExportPackedOnly] = useState(false);
  const [editingRemark, setEditingRemark] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('clothing');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemRemark, setNewItemRemark] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  if (!store.currentRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">暂无清单，请先创建</p>
          <button onClick={onBack} className="text-primary hover:underline">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const { currentRecord, filteredItems, packedCount, totalCount } = store;
  const progress = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const getItemsToExport = () => {
    return exportPackedOnly ? currentRecord.items.filter(item => item.packed) : currentRecord.items;
  };

  const handleCopyText = async () => {
    const text = exportAsText(getItemsToExport());
    await copyToClipboard(text);
    setShowShareModal(false);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  const handleExportPDF = async () => {
    await exportAsPDF({ ...currentRecord, items: getItemsToExport() });
    setShowShareModal(false);
  };

  const handleExportExcel = () => {
    exportAsExcel({ ...currentRecord, items: getItemsToExport() });
    setShowShareModal(false);
  };

  const handleStartRemark = (item: PackingItem) => {
    setEditingRemark(item.id);
    setRemarkText(item.remark);
  };

  const handleSaveRemark = (itemId: string) => {
    store.updateItem(itemId, { remark: remarkText });
    setEditingRemark(null);
    setRemarkText('');
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      store.addItem(newItemName.trim(), newItemCategory, newItemQuantity, newItemRemark.trim());
      setNewItemName('');
      setNewItemQuantity(1);
      setNewItemRemark('');
      setShowAddModal(false);
    }
  };

  const handleAddCategoryFromModal = () => {
    if (newCategoryName.trim()) {
      store.addCustomCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddCategoryModal(false);
    }
  };

  const handleStartEditCategory = (cat: CustomCategory) => {
    setEditingCategory(cat.id);
    setEditingCategoryName(cat.name);
  };

  const handleSaveCategoryName = (categoryId: string) => {
    if (editingCategoryName.trim()) {
      store.renameCustomCategory(categoryId, editingCategoryName.trim());
    }
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    const itemsInCategory = currentRecord.items.filter(item => item.category === categoryName);
    if (itemsInCategory.length > 0) {
      if (!window.confirm(`删除类别 "${categoryName}" 后，该类别下的 ${itemsInCategory.length} 个物品也将一并删除，确定要删除吗？`)) {
        return;
      }
      // 删除该类别下的所有物品
      store.removeItemsInCategory(categoryName);
    } else {
      if (!window.confirm(`确定要删除类别 "${categoryName}" 吗？`)) {
        return;
      }
    }
    store.removeCustomCategory(categoryId);
    if (store.filter === categoryName) {
      store.setFilter('all');
    }
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    if (!window.confirm(`确定要删除物品 "${itemName}" 吗？`)) {
      return;
    }
    store.removeItem(itemId);
  };

  return (
    <div className="min-h-screen pb-32 sm:pb-0">
      {/* Header */}
      <div className="sticky top-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{currentRecord.name}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentRecord.config.destination}</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle cx="20" cy="20" r="16" strokeWidth="3" fill="none" className="stroke-gray-200 dark:stroke-gray-700" />
                  <circle cx="20" cy="20" r="16" strokeWidth="3" fill="none" className="stroke-primary" 
                    strokeDasharray={`${progress * 1.005} 100`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Undo/Redo */}
        <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => store.undo()}
              disabled={store.undoStack.length === 0}
              className={`p-1.5 rounded ${store.undoStack.length === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="撤销"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => store.redo()}
              disabled={store.redoStack.length === 0}
              className={`p-1.5 rounded ${store.redoStack.length === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="重做"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {store.undoStack.length}/{store.settings.undoSteps}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => store.saveToHistory()}
              className="text-xs text-primary hover:underline"
            >
              保存到历史
            </button>
            <button
              onClick={() => store.toggleMinimalMode()}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${currentRecord.config.minimalMode ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            >
              <Zap className="w-3 h-3" />
              极简
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            key="all"
            onClick={() => store.setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              store.filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {categoryLabels['all']}
          </button>
          {(['clothing', 'toiletries', 'medicine', 'electronics'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => store.setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                store.filter === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
          {store.customCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">|</span>
              {store.customCategories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-1">
                  <button
                    onClick={() => store.setFilter(cat.name)}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                      store.filter === cat.name
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {editingCategory === cat.id ? (
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="bg-transparent border-b border-current outline-none px-0 min-w-[40px]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                            handleSaveCategoryName(cat.id);
                          } else if (e.key === 'Escape') {
                            e.stopPropagation();
                            setEditingCategory(null);
                            setEditingCategoryName('');
                          }
                        }}
                      />
                    ) : (
                      cat.name
                    )}
                  </button>
                  {editingCategory !== cat.id && (
                    <>
                      <button
                        onClick={() => handleStartEditCategory(cat)}
                        className="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="编辑类别"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 text-gray-400 hover:text-danger hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="删除类别"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="添加类别"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={store.searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              placeholder="搜索物品..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            已打包 {packedCount}/{totalCount}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => store.selectAll()}
              className="text-xs text-gray-500 hover:text-primary"
            >
              全选
            </button>
            <button
              onClick={() => store.clearAllPacked()}
              className="text-xs text-gray-500 hover:text-danger"
            >
              清空勾选
            </button>
          </div>
        </div>
      </div>

      {/* Item List */}
      <div className="px-4 py-4 space-y-2 pb-40 sm:pb-20">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => store.togglePacked(item.id)}
            className={`flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 ${item.packed ? 'opacity-60' : ''} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
          >
            {/* Checkbox */}
            <button
              onClick={(e) => { e.stopPropagation(); store.togglePacked(item.id); }}
              className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                item.packed
                  ? 'bg-primary border-primary text-white'
                  : 'border-gray-300 dark:border-gray-500 hover:border-primary'
              }`}
            >
              {item.packed && <Check className="w-4 h-4" />}
            </button>

            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <div className={`text-gray-900 dark:text-white ${item.packed ? 'line-through' : ''}`}>
                {item.name}
                <span className="ml-1 text-gray-500 dark:text-gray-400 text-sm">×{item.quantity}</span>
                {item.isCustom && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
                    用户添加
                  </span>
                )}
              </div>
              {item.tips && store.settings.packingTips && (
                <div className="text-xs text-primary mt-1">{item.tips}</div>
              )}
              {item.remark && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  {item.remark}
                </div>
              )}
              {editingRemark === item.id && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="如：需托运、液体限制"
                    className="flex-1 h-8 px-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRemark(item.id)}
                  />
                  <button onClick={(e) => { e.stopPropagation(); handleSaveRemark(item.id); }} className="text-primary text-sm">保存</button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleStartRemark(item); }}
                className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="备注"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, item.name); }}
                className="p-1.5 text-gray-400 hover:text-danger hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-gray-500 mb-4">没有找到匹配的物品</p>
            <button
              onClick={() => {
                if (store.filter !== 'all') {
                  setNewItemCategory(store.filter);
                }
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加物品
            </button>
          </div>
        )}
      </div>

      {/* Copy Success Toast */}
      {showCopySuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          复制成功
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => {
          if (store.filter !== 'all') {
            setNewItemCategory(store.filter);
          }
          setShowAddModal(true);
        }}
        className="fixed bottom-32 sm:bottom-6 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Export Bar */}
      <div className="fixed bottom-16 sm:bottom-0 left-0 right-0 sm:left-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <button onClick={handleCopyText} className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300">
            <Copy className="w-5 h-5" />
            <span className="text-xs">复制</span>
          </button>
          <button onClick={handleExportPDF} className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300">
            <FileText className="w-5 h-5" />
            <span className="text-xs">PDF</span>
          </button>
          <button onClick={handleExportExcel} className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300">
            <Download className="w-5 h-5" />
            <span className="text-xs">Excel</span>
          </button>
          <button onClick={() => setShowShareModal(true)} className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-300">
            <Share2 className="w-5 h-5" />
            <span className="text-xs">分享</span>
          </button>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-gray-800 w-full sm:w-auto sm:min-w-[320px] rounded-t-2xl sm:rounded-xl p-6 pb-24 sm:pb-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">添加物品</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">物品名称</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="输入物品名称"
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">分类</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="clothing">衣物类</option>
                  <option value="toiletries">洗护类</option>
                  <option value="medicine">药品类</option>
                  <option value="electronics">电子类</option>
                  {store.customCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">数量</label>
                <input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">备注（可选）</label>
                <input
                  type="text"
                  value={newItemRemark}
                  onChange={(e) => setNewItemRemark(e.target.value)}
                  placeholder="如：需托运、液体限制"
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className={`w-full h-12 rounded-lg font-medium transition-colors ${
                  newItemName.trim()
                    ? 'bg-primary text-white hover:bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={() => setShowAddCategoryModal(false)}>
          <div className="bg-white dark:bg-gray-800 w-full sm:w-auto sm:min-w-[320px] rounded-t-2xl sm:rounded-xl p-6 pb-24 sm:pb-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">添加新类别</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">类别名称</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="输入类别名称，如：证件类、零食类"
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
              
              <button
                onClick={handleAddCategoryFromModal}
                disabled={!newCategoryName.trim()}
                className={`w-full h-12 rounded-lg font-medium transition-colors ${
                  newCategoryName.trim()
                    ? 'bg-primary text-white hover:bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white dark:bg-gray-800 w-full sm:w-auto sm:min-w-[320px] rounded-t-2xl sm:rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">分享 / 导出</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Export Option Toggle */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">仅导出已打包物品</span>
                <button
                  onClick={() => setExportPackedOnly(!exportPackedOnly)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    exportPackedOnly ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      exportPackedOnly ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {exportPackedOnly
                  ? `将导出 ${currentRecord.items.filter(i => i.packed).length} 件已打包物品`
                  : `将导出全部 ${currentRecord.items.length} 件物品`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button onClick={handleCopyText} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Copy className="w-8 h-8 text-primary" />
                <span className="text-sm text-gray-700 dark:text-gray-300">复制文本</span>
              </button>
              <button onClick={handleExportPDF} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FileText className="w-8 h-8 text-primary" />
                <span className="text-sm text-gray-700 dark:text-gray-300">导出 PDF</span>
              </button>
              <button onClick={handleExportExcel} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Download className="w-8 h-8 text-primary" />
                <span className="text-sm text-gray-700 dark:text-gray-300">导出 Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}