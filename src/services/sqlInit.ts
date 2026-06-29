/**
 * SQLite 数据库初始化脚本
 * 定义四张核心数据表结构
 */

// SQL初始化语句
export const SQL_INIT_STATEMENTS = `
-- ============================================
-- 旅行极简行李AI清单 - SQLite数据库初始化脚本
-- 面试展示用：完整的关系型数据库设计
-- ============================================

-- 1. 行程表 (trip) - 存储每次旅行的基本信息
CREATE TABLE IF NOT EXISTS trip (
    id TEXT PRIMARY KEY,                    -- 行程ID (UUID格式)
    name TEXT NOT NULL,                     -- 行程名称
    destination TEXT NOT NULL,              -- 目的地
    days INTEGER NOT NULL DEFAULT 3,       -- 出行天数
    season TEXT NOT NULL,                   -- 季节
    trip_type TEXT NOT NULL DEFAULT 'leisure', -- 旅行类型
    minimal_mode INTEGER DEFAULT 0,         -- 极简模式 (0/1)
    created_at INTEGER NOT NULL,           -- 创建时间戳
    updated_at INTEGER NOT NULL,           -- 更新时间戳
    is_current INTEGER DEFAULT 0            -- 是否为当前行程 (0/1)
);

-- 2. 物品分类表 (item_category) - 支持内置+自定义分类
CREATE TABLE IF NOT EXISTS item_category (
    id TEXT PRIMARY KEY,                    -- 分类ID
    name TEXT NOT NULL UNIQUE,              -- 分类名称
    name_en TEXT,                           -- 英文名称
    icon TEXT,                             -- 图标名称
    sort_order INTEGER DEFAULT 0,           -- 排序顺序
    is_builtin INTEGER DEFAULT 0,          -- 是否内置 (0/1)
    created_at INTEGER NOT NULL            -- 创建时间戳
);

-- 3. 行程物品表 (trip_item) - 存储每个行程的物品清单
CREATE TABLE IF NOT EXISTS trip_item (
    id TEXT PRIMARY KEY,                    -- 物品ID
    trip_id TEXT NOT NULL,                  -- 行程ID (外键)
    name TEXT NOT NULL,                     -- 物品名称
    category_id TEXT NOT NULL,              -- 分类ID (外键)
    quantity INTEGER DEFAULT 1,             -- 数量
    packed INTEGER DEFAULT 0,               -- 是否已打包 (0/1)
    remark TEXT,                           -- 备注
    importance INTEGER DEFAULT 3,           -- 重要性 (1-5)
    is_custom INTEGER DEFAULT 0,           -- 是否自定义物品 (0/1)
    created_at INTEGER NOT NULL,           -- 创建时间戳
    FOREIGN KEY (trip_id) REFERENCES trip(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES item_category(id)
);

-- 4. 用户偏好表 (user_preference) - 存储用户设置和偏好
CREATE TABLE IF NOT EXISTS user_preference (
    key TEXT PRIMARY KEY,                   -- 配置键
    value TEXT NOT NULL,                    -- 配置值 (JSON字符串)
    updated_at INTEGER NOT NULL             -- 更新时间戳
);

-- ============================================
-- 索引优化 - 提升查询性能
-- ============================================

-- trip表的索引
CREATE INDEX IF NOT EXISTS idx_trip_created_at ON trip(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trip_is_current ON trip(is_current);
CREATE INDEX IF NOT EXISTS idx_trip_destination ON trip(destination);

-- trip_item表的索引
CREATE INDEX IF NOT EXISTS idx_trip_item_trip_id ON trip_item(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_item_category ON trip_item(category_id);
CREATE INDEX IF NOT EXISTS idx_trip_item_packed ON trip_item(packed);
CREATE INDEX IF NOT EXISTS idx_trip_item_name ON trip_item(name);

-- item_category表的索引
CREATE INDEX IF NOT EXISTS idx_category_sort ON item_category(sort_order);
CREATE INDEX IF NOT EXISTS idx_category_builtin ON item_category(is_builtin);

-- ============================================
-- 初始化内置数据
-- ============================================

-- 插入内置分类
INSERT OR IGNORE INTO item_category (id, name, name_en, icon, sort_order, is_builtin, created_at) VALUES
('clothing', '衣物类', 'Clothing', 'shirt', 1, 1, ${Date.now()}),
('toiletries', '洗护类', 'Toiletries', 'droplet', 2, 1, ${Date.now()}),
('medicine', '药品类', 'Medicine', 'pill', 3, 1, ${Date.now()}),
('electronics', '电子类', 'Electronics', 'smartphone', 4, 1, ${Date.now()});

-- 插入默认用户偏好
INSERT OR IGNORE INTO user_preference (key, value, updated_at) VALUES
('theme', '"light"', ${Date.now()}),
('storage_mode', '"dexie"', ${Date.now()}),
('undo_steps', '10', ${Date.now()});
`;

// 内置分类数据
export const BUILTIN_CATEGORIES = [
  { id: 'clothing', name: '衣物类', name_en: 'Clothing', icon: 'shirt', sort_order: 1 },
  { id: 'toiletries', name: '洗护类', name_en: 'Toiletries', icon: 'droplet', sort_order: 2 },
  { id: 'medicine', name: '药品类', name_en: 'Medicine', icon: 'pill', sort_order: 3 },
  { id: 'electronics', name: '电子类', name_en: 'Electronics', icon: 'smartphone', sort_order: 4 },
];

// 数据库版本和元信息
export const DB_METADATA = {
  name: 'TravelPackingListDB',
  version: 1,
  description: '旅行极简行李AI清单 - SQLite数据库',
  author: '面试展示项目',
};
