/**
 * SQLEngine - SQLite WASM 数据库引擎
 * 面试展示：完整的关系型数据库封装
 */

// 使用动态导入解决ESM兼容性问题
let SQL: any = null;

const STORAGE_KEY = 'sql_db_backup';
const DB_NAME = 'travel_packing.db';

import { SQL_INIT_STATEMENTS } from './sqlInit';

export class SqlEngine {
  private db: any = null;
  private initialized = false;

  isInitialized(): boolean {
    return this.initialized && this.db !== null;
  }

  /**
   * 初始化SQLite数据库
   * WASM初始化 + localStorage恢复
   */
  async init(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️ SQLite: 数据库已初始化，跳过');
      return;
    }

    try {
      console.log('🔄 SQLite: 开始初始化...');
      
      const sqlModule = await import('sql.js');
      console.log('✅ SQLite: sql.js 模块加载成功，导出:', Object.keys(sqlModule));
      
      const initSqlJs = sqlModule.default;
      console.log('✅ SQLite: initSqlJs 类型:', typeof initSqlJs);
      
      if (typeof initSqlJs === 'function') {
        SQL = await initSqlJs({
          locateFile: () => `/sql-wasm.wasm`,
        });
        console.log('✅ SQLite: WASM 模块加载成功');
      } else {
        console.error('❌ SQLite: initSqlJs 不是函数，尝试其他导出...');
        throw new Error('sql.js 初始化失败: initSqlJs 不是函数');
      }

      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        console.log('✅ SQLite: 找到localStorage备份数据');
        const data = Uint8Array.from(atob(savedData), c => c.charCodeAt(0));
        this.db = new SQL.Database(data);
        console.log(`✅ SQLite: 从localStorage恢复数据库，大小: ${data.length} bytes`);
      } else {
        console.log('ℹ️ SQLite: 未找到备份数据，创建新数据库');
        this.db = new SQL.Database();
        this.createTables();
        console.log('✅ SQLite: 创建新数据库');
      }

      this.initialized = true;
      console.log('✅ SQLite WASM 初始化成功');
      
      // 验证数据库
      const stats = this.getStats();
      console.log(`📊 SQLite: 数据库统计 - ${stats.totalRecords} 条记录`);
      
    } catch (error) {
      console.error('❌ SQLite 初始化失败:', error);
      this.initialized = false;
      this.db = null;
      throw error;
    }
  }

  /**
   * 创建数据表
   * DDL语句执行
   */
  private createTables(): void {
    if (!this.db) return;

    // 处理动态时间戳
    const statements = SQL_INIT_STATEMENTS.replace(/\${Date.now\(\)}/g, Date.now().toString());
    const sqlStatements = statements.split(';').filter((s: string) => s.trim());

    sqlStatements.forEach((sql: string) => {
      if (sql.trim()) {
        this.db!.run(sql);
      }
    });
  }

  /**
   * 保存数据库到localStorage
   * 数据持久化策略
   */
  saveToStorage(): void {
    if (!this.db) return;

    try {
      const data = this.db.export();
      const base64 = btoa(String.fromCharCode(...data));
      localStorage.setItem(STORAGE_KEY, base64);
      console.log('💾 SQLite: 数据已保存到localStorage');
    } catch (error) {
      console.error('❌ SQLite 保存失败:', error);
    }
  }

  /**
   * 执行SQL查询
   * SQL注入防护 + 参数化查询
   */
  query<T = any>(sql: string, params: any[] = []): T[] {
    if (!this.db) return [];

    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);

      const results: T[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row as T);
      }
      stmt.free();

      return results;
    } catch (error) {
      console.error('❌ SQL查询失败:', error, sql);
      return [];
    }
  }

  /**
   * 执行SQL语句（INSERT/UPDATE/DELETE）
   * 事务处理
   */
  execute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
    if (!this.db) return { changes: 0, lastInsertRowid: 0 };

    try {
      this.db.run(sql, params);
      const changes = this.db.getRowsModified();
      const lastId = this.db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] || 0;

      // 自动保存
      this.saveToStorage();

      return { changes, lastInsertRowid: Number(lastId) };
    } catch (error) {
      console.error('❌ SQL执行失败:', error, sql);
      return { changes: 0, lastInsertRowid: 0 };
    }
  }

  /**
   * 事务执行
   * 事务ACID特性
   */
  transaction<T>(fn: () => T): T {
    if (!this.db) throw new Error('数据库未初始化');

    try {
      this.db.run('BEGIN TRANSACTION');
      const result = fn();
      this.db.run('COMMIT');
      this.saveToStorage();
      return result;
    } catch (error) {
      this.db.run('ROLLBACK');
      throw error;
    }
  }

  // ==================== Trip 操作 ====================

  /**
   * 创建新行程
   */
  createTrip(trip: {
    id: string;
    name: string;
    destination: string;
    days: number;
    season: string;
    tripType: string;
    minimalMode: boolean;
  }): void {
    const sql = `
      INSERT INTO trip (id, name, destination, days, season, trip_type, minimal_mode, created_at, updated_at, is_current)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const now = Date.now();
    this.execute(sql, [
      trip.id,
      trip.name,
      trip.destination,
      trip.days,
      trip.season,
      trip.tripType,
      trip.minimalMode ? 1 : 0,
      now,
      now,
    ]);

    // 将其他行程设为非当前
    this.execute('UPDATE trip SET is_current = 0 WHERE id != ?', [trip.id]);
  }

  /**
   * 获取当前行程
   */
  getCurrentTrip(): any {
    const results = this.query('SELECT * FROM trip WHERE is_current = 1 LIMIT 1');
    return results[0] || null;
  }

  /**
   * 获取所有行程（历史）
   */
  getAllTrips(): any[] {
    return this.query('SELECT * FROM trip ORDER BY created_at DESC');
  }

  /**
   * 更新行程
   */
  updateTrip(id: string, updates: Partial<any>): void {
    const fields = Object.keys(updates)
      .map(key => {
        const sqlKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${sqlKey} = ?`;
      })
      .join(', ');

    const values = Object.values(updates);

    this.execute(
      `UPDATE trip SET ${fields}, updated_at = ? WHERE id = ?`,
      [...values, Date.now(), id]
    );
  }

  /**
   * 删除行程
   */
  deleteTrip(id: string): void {
    this.transaction(() => {
      this.execute('DELETE FROM trip_item WHERE trip_id = ?', [id]);
      this.execute('DELETE FROM trip WHERE id = ?', [id]);
    });
  }

  // ==================== TripItem 操作 ====================

  /**
   * 添加物品到行程
   */
  addTripItem(item: {
    id: string;
    tripId: string;
    name: string;
    categoryId: string;
    quantity: number;
    packed: boolean;
    remark?: string;
    importance: number;
    isCustom?: boolean;
  }): void {
    const sql = `
      INSERT INTO trip_item (id, trip_id, name, category_id, quantity, packed, remark, importance, is_custom, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    this.execute(sql, [
      item.id,
      item.tripId,
      item.name,
      item.categoryId,
      item.quantity,
      item.packed ? 1 : 0,
      item.remark || '',
      item.importance,
      item.isCustom ? 1 : 0,
      Date.now(),
    ]);
  }

  /**
   * 获取行程的所有物品
   */
  getTripItems(tripId: string): any[] {
    return this.query(
      `SELECT ti.*, ic.name as category_name, ic.icon as category_icon
       FROM trip_item ti
       LEFT JOIN item_category ic ON ti.category_id = ic.id
       WHERE ti.trip_id = ?
       ORDER BY ic.sort_order, ti.name`,
      [tripId]
    );
  }

  /**
   * 按分类统计物品
   * 聚合查询 + GROUP BY
   */
  getItemsByCategory(tripId: string): any[] {
    return this.query(`
      SELECT 
        ic.id as category_id,
        ic.name as category_name,
        ic.icon as category_icon,
        COUNT(*) as total_count,
        SUM(CASE WHEN ti.packed = 1 THEN 1 ELSE 0 END) as packed_count
      FROM trip_item ti
      LEFT JOIN item_category ic ON ti.category_id = ic.id
      WHERE ti.trip_id = ?
      GROUP BY ic.id, ic.name, ic.icon
      ORDER BY ic.sort_order
    `, [tripId]);
  }

  /**
   * 获取打包进度
   * 聚合统计
   */
  getPackingProgress(tripId: string): { total: number; packed: number; percentage: number } {
    const results = this.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN packed = 1 THEN 1 ELSE 0 END) as packed
      FROM trip_item
      WHERE trip_id = ?
    `, [tripId]);

    const total = results[0]?.total || 0;
    const packed = results[0]?.packed || 0;
    const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;

    return { total, packed, percentage };
  }

  /**
   * 更新物品状态
   */
  updateTripItem(id: string, updates: Partial<any>): void {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => {
        const sqlKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${sqlKey} = ?`;
      })
      .join(', ');

    const values = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => {
        const value = updates[key];
        if (typeof value === 'boolean') return value ? 1 : 0;
        return value;
      });

    this.execute(`UPDATE trip_item SET ${fields} WHERE id = ?`, [...values, id]);
  }

  /**
   * 删除物品
   */
  deleteTripItem(id: string): void {
    this.execute('DELETE FROM trip_item WHERE id = ?', [id]);
  }

  /**
   * 搜索历史行程
   * 模糊查询 + 排序
   */
  searchTrips(keyword: string): any[] {
    return this.query(`
      SELECT * FROM trip 
      WHERE name LIKE ? OR destination LIKE ?
      ORDER BY created_at DESC
    `, [`%${keyword}%`, `%${keyword}%`]);
  }

  // ==================== Category 操作 ====================

  /**
   * 获取所有分类
   */
  getAllCategories(): any[] {
    return this.query('SELECT * FROM item_category ORDER BY sort_order');
  }

  /**
   * 添加自定义分类
   */
  addCustomCategory(id: string, name: string): void {
    const maxSort = this.query('SELECT MAX(sort_order) as max FROM item_category')[0]?.max || 0;
    
    this.execute(`
      INSERT INTO item_category (id, name, sort_order, is_builtin, created_at)
      VALUES (?, ?, ?, 0, ?)
    `, [id, name, maxSort + 1, Date.now()]);
  }

  /**
   * 删除自定义分类
   */
  deleteCustomCategory(id: string): void {
    this.execute('DELETE FROM item_category WHERE id = ? AND is_builtin = 0', [id]);
  }

  // ==================== Preference 操作 ====================

  /**
   * 获取用户偏好
   */
  getPreference(key: string): any {
    const results = this.query('SELECT value FROM user_preference WHERE key = ?', [key]);
    if (results[0]) {
      try {
        return JSON.parse(results[0].value);
      } catch {
        return results[0].value;
      }
    }
    return null;
  }

  /**
   * 设置用户偏好
   */
  setPreference(key: string, value: any): void {
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
    
    this.execute(`
      INSERT OR REPLACE INTO user_preference (key, value, updated_at)
      VALUES (?, ?, ?)
    `, [key, valueStr, Date.now()]);

    this.saveToStorage();
  }

  // ==================== 导出功能 ====================

  /**
   * 导出.db文件
   * Blob + 文件下载
   */
  exportDatabase(): void {
    if (!this.db) {
      console.error('❌ SQLite: 数据库未初始化');
      alert('数据库未初始化，请先切换到SQLite模式');
      return;
    }

    try {
      // 检查数据库是否为空
      const stats = this.getStats();
      if (stats.totalRecords === 0) {
        console.log('ℹ️ SQLite: 数据库为空，尝试从localStorage导入...');
        this.importFromLocalStorage();
        console.log('✅ SQLite: 数据导入完成');
      }

      const data = this.db.export();
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = DB_NAME;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      const finalStats = this.getStats();
      console.log(`📦 SQLite: 数据库已导出为.db文件，包含 ${finalStats.totalRecords} 条记录`);
    } catch (error) {
      console.error('❌ SQLite: 导出失败:', error);
      alert('导出失败，请查看控制台日志');
    }
  }

  private importFromLocalStorage(): void {
    if (!this.db) return;

    try {
      const currentData = localStorage.getItem('travel_packing_current');
      const historyData = localStorage.getItem('travel_packing_history');
      const customCategoriesData = localStorage.getItem('travel_packing_custom_categories');

      if (!currentData && !historyData) {
        console.log('ℹ️ SQLite: localStorage也没有数据');
        return;
      }

      this.transaction(() => {
        if (customCategoriesData) {
          const categories = JSON.parse(customCategoriesData);
          categories.forEach((cat: any) => {
            this.execute(
              'INSERT OR IGNORE INTO item_category (id, name, name_en, icon, sort_order, is_builtin) VALUES (?, ?, ?, ?, ?, 0)',
              [cat.id, cat.name, cat.name_en || '', cat.icon || 'tag', cat.sortOrder || 99, 0]
            );
          });
        }

        const allTrips: any[] = [];
        if (currentData) {
          const current = JSON.parse(currentData);
          allTrips.push(current);
        }
        if (historyData) {
          const history = JSON.parse(historyData);
          allTrips.push(...history);
        }

        allTrips.forEach((trip) => {
          this.execute(
            'INSERT OR REPLACE INTO trip (id, name, destination, days, season, trip_type, minimal_mode, created_at, updated_at, is_current) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              trip.id,
              trip.name,
              trip.config?.destination || '',
              trip.config?.days || 1,
              trip.config?.season || '',
              trip.config?.tripType || 'leisure',
              trip.config?.minimalMode ? 1 : 0,
              trip.createdAt || Date.now(),
              trip.updatedAt || Date.now(),
              currentData && trip.id === JSON.parse(currentData).id ? 1 : 0,
            ]
          );

          if (trip.items) {
            trip.items.forEach((item: any) => {
              this.execute(
                'INSERT OR REPLACE INTO trip_item (id, trip_id, name, category_id, quantity, packed, remark, importance, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                  item.id,
                  trip.id,
                  item.name,
                  item.category || 'other',
                  item.quantity || 1,
                  item.packed ? 1 : 0,
                  item.remark || '',
                  item.importance || 3,
                  item.isCustom ? 1 : 0,
                ]
              );
            });
          }
        });
      });

      this.saveToStorage();
    } catch (error) {
      console.error('❌ SQLite: 从localStorage导入失败:', error);
    }
  }

  /**
   * 执行原生SQL（仅用于高级操作）
   */
  exec(sql: string): void {
    if (!this.db) return;
    this.db.exec(sql);
    this.saveToStorage();
  }

  /**
   * 获取数据库统计信息
   * 系统表查询
   */
  getStats(): {
    tables: { name: string; count: number }[];
    totalRecords: number;
    dbSize: number;
  } {
    if (!this.db) {
      console.error('❌ SQLite: getStats 调用时数据库未初始化');
      return { tables: [], totalRecords: 0, dbSize: 0 };
    }
    
    try {
      const tables = this.query(`
        SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

      const tableCounts: { name: string; count: number }[] = tables.map((t: any) => {
        const countResult = this.query(`SELECT COUNT(*) as count FROM ${t.name}`);
        return { name: t.name, count: countResult[0]?.count || 0 };
      });

      const totalRecords = tableCounts.reduce((sum, t) => sum + t.count, 0);

      const savedData = localStorage.getItem(STORAGE_KEY);
      const dbSize = savedData ? Math.round(savedData.length * 0.75 / 1024) : 0;

      return { tables: tableCounts, totalRecords, dbSize };
    } catch (error) {
      console.error('❌ SQLite: getStats 失败:', error);
      return { tables: [], totalRecords: 0, dbSize: 0 };
    }
  }

  /**
   * 关闭数据库
   */
  close(): void {
    if (this.db) {
      this.saveToStorage();
      this.db.close();
      this.db = null;
      this.initialized = false;
      console.log('🔒 SQLite: 数据库已关闭');
    }
  }
}

// 导出单例
export const sqlEngine = new SqlEngine();
