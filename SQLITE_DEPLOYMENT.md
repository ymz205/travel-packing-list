# 旅行极简行李AI清单 - SQLite WASM双存储方案

## 项目简介

本项目实现了基于 sql.js 的前端 SQLite WASM 双存储方案，用于面试展示，可直接部署到 GitHub + Vercel。

## 技术栈

- **前端框架**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **存储方案**: 
  - Dexie.js (IndexedDB)
  - SQLite WASM (sql.js)
- **部署平台**: Vercel

## 核心功能

### 1. 四张关联数据表

```sql
-- 1. trip - 行程表
CREATE TABLE trip (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    days INTEGER NOT NULL DEFAULT 3,
    season TEXT NOT NULL,
    trip_type TEXT NOT NULL DEFAULT 'leisure',
    minimal_mode INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    is_current INTEGER DEFAULT 0
);

-- 2. item_category - 物品分类表
CREATE TABLE item_category (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    name_en TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_builtin INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
);

-- 3. trip_item - 行程物品表
CREATE TABLE trip_item (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    packed INTEGER DEFAULT 0,
    remark TEXT,
    importance INTEGER DEFAULT 3,
    is_custom INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (trip_id) REFERENCES trip(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES item_category(id)
);

-- 4. user_preference - 用户偏好表
CREATE TABLE user_preference (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
```

### 2. SQL查询实现

#### AI生成清单查询
```sql
-- 根据目的地、季节、旅行类型筛选物品
SELECT * FROM base_items 
WHERE (climates IS NULL OR climates LIKE '%' || ? || '%')
  AND (seasons IS NULL OR seasons LIKE '%' || ? || '%')
  AND (trip_types IS NULL OR trip_types LIKE '%' || ? || '%')
ORDER BY importance DESC;
```

#### 分类筛选查询
```sql
-- 按分类统计物品数量和打包进度
SELECT 
    ic.name as category_name,
    COUNT(*) as total_count,
    SUM(CASE WHEN ti.packed = 1 THEN 1 ELSE 0 END) as packed_count
FROM trip_item ti
LEFT JOIN item_category ic ON ti.category_id = ic.id
WHERE ti.trip_id = ?
GROUP BY ic.id
ORDER BY ic.sort_order;
```

#### 打包进度统计
```sql
-- 聚合统计打包进度
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN packed = 1 THEN 1 ELSE 0 END) as packed
FROM trip_item
WHERE trip_id = ?;
```

#### 历史搜索查询
```sql
-- 模糊搜索历史行程
SELECT * FROM trip 
WHERE name LIKE '%' || ? || '%' 
   OR destination LIKE '%' || ? || '%'
ORDER BY created_at DESC;
```

## 部署步骤

### 1. GitHub部署准备

```bash
# 初始化Git仓库
git init
git add .
git commit -m "feat: 实现SQLite WASM双存储方案"

# 创建GitHub仓库并推送
git remote add origin https://github.com/yourusername/travel-packing-list.git
git push -u origin main
```

### 2. Vercel部署

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择你的GitHub仓库
5. 配置项目设置：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 点击 "Deploy"

### 3. Vercel配置文件 (vercel.json)

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/sql-wasm.wasm",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" },
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

## 面试演示说明

### 核心亮点

#### 1. 双存储方案架构
- **Dexie模式**: 适用于简单场景，键值存储，自动索引
- **SQLite模式**: 适用于复杂查询，支持事务，可导出.db文件

#### 2. 技术难点与解决方案

**问题1: WASM文件404**
- **原因**: Vercel默认不识别.wasm文件的MIME类型
- **解决**: 配置vercel.json指定Content-Type为application/wasm

**问题2: 分包加载**
- **原因**: sql.js库较大，需要单独打包
- **解决**: vite.config.ts中配置manualChunks

**问题3: 数据持久化**
- **原因**: WASM数据库重启后会丢失
- **解决**: 使用localStorage备份数据库二进制数据

#### 3. SQL查询示例

```typescript
// 事务处理示例
transaction(() => {
  this.execute('DELETE FROM trip_item WHERE trip_id = ?', [tripId]);
  this.execute('DELETE FROM trip WHERE id = ?', [tripId]);
});

// 聚合统计
const progress = query(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN packed = 1 THEN 1 ELSE 0 END) as packed
  FROM trip_item
  WHERE trip_id = ?
`, [tripId]);
```

#### 4. 设计模式

- **适配器模式**: StorageAdapter统一接口，Dexie/SQLite适配器实现
- **单例模式**: sqlEngine全局单例
- **工厂模式**: StorageManager根据类型创建适配器

### 演示流程

1. **打开应用** → 设置页面查看存储方案切换
2. **切换到SQLite模式** → 查看数据库初始化日志
3. **生成清单** → 查看SQL插入语句
4. **筛选分类** → 查看GROUP BY查询
5. **查看打包进度** → 查看聚合统计查询
6. **搜索历史** → 查看LIKE模糊查询
7. **导出.db文件** → 演示Blob下载功能

### 代码片段

```typescript
// SQLEngine核心方法
async init(): Promise<void> {
  this.SQL = await initSqlJs({
    locateFile: () => `/sql-wasm.wasm`,
  });
  
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    const data = Uint8Array.from(atob(savedData), c => c.charCodeAt(0));
    this.db = new this.SQL.Database(data);
  } else {
    this.db = new this.SQL.Database();
    this.createTables();
  }
}

// 查询方法
query<T>(sql: string, params: any[] = []): T[] {
  const stmt = this.db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}
```

## 项目结构

```
travel-packing-list/
├── public/
│   └── sql-wasm.wasm          # SQLite WASM文件
├── src/
│   ├── components/
│   │   └── StorageSwitcher.tsx  # 存储切换UI
│   ├── services/
│   │   ├── sqlInit.ts         # SQL初始化脚本
│   │   ├── sqlEngine.ts       # SQLite引擎封装
│   │   └── storageAdapter.ts  # 双存储适配器
│   ├── stores/
│   │   └── useStorageStore.ts # 存储状态管理
│   └── types/
│       └── index.ts           # 类型定义
├── vercel.json               # Vercel配置
├── vite.config.ts            # Vite配置
└── package.json
```

## 常见问题

### Q: WASM文件加载失败？
A: 检查public目录下是否有sql-wasm.wasm文件，确保vercel.json配置正确。

### Q: 数据库导出失败？
A: 确保使用SQLite模式，导出功能仅在SQLite模式下可用。

### Q: 切换存储后数据丢失？
A: 目前双存储方案数据不互通，切换前请确保已导出数据。

## 联系作者

如有问题或建议，请提交Issue或Pull Request。
