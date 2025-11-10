/**
 * Base Model Class
 * Class พื้นฐานสำหรับ database operations ทั่วไป
 */

const { getDatabase, query, queryOne, execute, transaction } = require('../config/database');
const { DatabaseError } = require('../utils/errors');
const logger = require('../utils/logger');

class BaseModel {
  /**
   * Constructor
   * @param {string} tableName - ชื่อตาราง
   * @param {string} primaryKey - Primary key column (default: 'id')
   */
  constructor(tableName, primaryKey = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * Find record by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<Object|null>} Record or null if not found
   */
  async findById(id) {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
      const result = queryOne(sql, [id]);

      logger.dbOperation('findById', this.tableName, { id, found: !!result });

      return result || null;
    } catch (error) {
      logger.error(`Error finding ${this.tableName} by ID:`, {
        error: error.message,
        table: this.tableName,
        id
      });
      throw new DatabaseError(`Error finding ${this.tableName}`, error);
    }
  }

  /**
   * Find records by conditions
   * @param {Object} conditions - Where conditions
   * @param {Object} options - { orderBy, limit, offset }
   * @returns {Promise<Array>} Array of records
   */
  async findWhere(conditions = {}, options = {}) {
    try {
      const { orderBy = 'created_at', orderDir = 'DESC', limit, offset } = options;

      // Build WHERE clause
      const whereKeys = Object.keys(conditions);
      const whereClause = whereKeys.length > 0
        ? 'WHERE ' + whereKeys.map(key => `${key} = ?`).join(' AND ')
        : '';

      const whereValues = whereKeys.map(key => conditions[key]);

      // Build SQL
      let sql = `SELECT * FROM ${this.tableName} ${whereClause}`;

      if (orderBy) {
        sql += ` ORDER BY ${orderBy} ${orderDir}`;
      }

      if (limit) {
        sql += ` LIMIT ${parseInt(limit)}`;
      }

      if (offset) {
        sql += ` OFFSET ${parseInt(offset)}`;
      }

      const results = query(sql, whereValues);

      logger.dbOperation('findWhere', this.tableName, {
        conditions,
        options,
        resultCount: results.length
      });

      return results;
    } catch (error) {
      logger.error(`Error finding ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        conditions
      });
      throw new DatabaseError(`Error finding ${this.tableName}`, error);
    }
  }

  /**
   * Find all records
   * @param {Object} options - { orderBy, limit, offset }
   * @returns {Promise<Array>} Array of all records
   */
  async findAll(options = {}) {
    return await this.findWhere({}, options);
  }

  /**
   * Create new record
   * @param {Object} data - Record data
   * @param {Object} options - { trx: transaction }
   * @returns {Promise<Object>} Created record
   */
  async create(data, options = {}) {
    try {
      // Add timestamps
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const insertData = {
        ...data,
        created_at: now,
        updated_at: now
      };

      // Build SQL
      const columns = Object.keys(insertData);
      const values = Object.values(insertData);
      const placeholders = columns.map(() => '?').join(', ');

      const sql = `
        INSERT INTO ${this.tableName} (${columns.join(', ')})
        VALUES (${placeholders})
      `;

      // Execute insert
      const result = execute(sql, values);
      const insertId = result.lastInsertRowid;

      // Get created record
      const created = await this.findById(insertId);

      logger.dbOperation('create', this.tableName, {
        insertId,
        dataKeys: columns
      });

      return created;
    } catch (error) {
      logger.error(`Error creating ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        dataKeys: Object.keys(data)
      });
      throw new DatabaseError(`Error creating ${this.tableName}`, error);
    }
  }

  /**
   * Update record by ID
   * @param {number|string} id - Record ID
   * @param {Object} data - Update data
   * @param {Object} options - { trx: transaction }
   * @returns {Promise<Object>} Updated record
   */
  async updateById(id, data, options = {}) {
    try {
      // Add updated timestamp
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const updateData = {
        ...data,
        updated_at: now
      };

      // Build SQL
      const columns = Object.keys(updateData);
      const values = Object.values(updateData);
      const setClause = columns.map(col => `${col} = ?`).join(', ');

      const sql = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE ${this.primaryKey} = ?
      `;

      // Execute update
      const result = execute(sql, [...values, id]);

      if (result.changes === 0) {
        return null; // No rows updated
      }

      // Get updated record
      const updated = await this.findById(id);

      logger.dbOperation('updateById', this.tableName, {
        id,
        updatedFields: columns,
        changes: result.changes
      });

      return updated;
    } catch (error) {
      logger.error(`Error updating ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        id,
        dataKeys: Object.keys(data)
      });
      throw new DatabaseError(`Error updating ${this.tableName}`, error);
    }
  }

  /**
   * Update records by conditions
   * @param {Object} conditions - Where conditions
   * @param {Object} data - Update data
   * @returns {Promise<number>} Number of updated records
   */
  async updateWhere(conditions, data) {
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const updateData = {
        ...data,
        updated_at: now
      };

      // Build SET clause
      const updateColumns = Object.keys(updateData);
      const updateValues = Object.values(updateData);
      const setClause = updateColumns.map(col => `${col} = ?`).join(', ');

      // Build WHERE clause
      const whereKeys = Object.keys(conditions);
      const whereValues = Object.values(conditions);
      const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');

      const sql = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE ${whereClause}
      `;

      const result = execute(sql, [...updateValues, ...whereValues]);

      logger.dbOperation('updateWhere', this.tableName, {
        conditions,
        updatedFields: updateColumns,
        changes: result.changes
      });

      return result.changes;
    } catch (error) {
      logger.error(`Error updating ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        conditions
      });
      throw new DatabaseError(`Error updating ${this.tableName}`, error);
    }
  }

  /**
   * Soft delete record by ID
   * @param {number|string} id - Record ID
   * @param {number} deletedBy - User ID who deleted
   * @returns {Promise<boolean>} True if deleted
   */
  async softDelete(id, deletedBy = null) {
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const data = {
        is_deleted: true,
        deleted_at: now
      };

      if (deletedBy) {
        data.deleted_by = deletedBy;
      }

      const result = await this.updateById(id, data);

      logger.dbOperation('softDelete', this.tableName, {
        id,
        deletedBy,
        success: !!result
      });

      return !!result;
    } catch (error) {
      logger.error(`Error soft deleting ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        id
      });
      throw new DatabaseError(`Error deleting ${this.tableName}`, error);
    }
  }

  /**
   * Hard delete record by ID
   * @param {number|string} id - Record ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
      const result = execute(sql, [id]);

      logger.dbOperation('delete', this.tableName, {
        id,
        changes: result.changes,
        success: result.changes > 0
      });

      return result.changes > 0;
    } catch (error) {
      logger.error(`Error deleting ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        id
      });
      throw new DatabaseError(`Error deleting ${this.tableName}`, error);
    }
  }

  /**
   * Delete records by conditions
   * @param {Object} conditions - Where conditions
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteWhere(conditions) {
    try {
      const whereKeys = Object.keys(conditions);
      const whereValues = Object.values(conditions);
      const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');

      const sql = `DELETE FROM ${this.tableName} WHERE ${whereClause}`;
      const result = execute(sql, whereValues);

      logger.dbOperation('deleteWhere', this.tableName, {
        conditions,
        changes: result.changes
      });

      return result.changes;
    } catch (error) {
      logger.error(`Error deleting ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        conditions
      });
      throw new DatabaseError(`Error deleting ${this.tableName}`, error);
    }
  }

  /**
   * Count records
   * @param {Object} conditions - Where conditions
   * @returns {Promise<number>} Count of records
   */
  async count(conditions = {}) {
    try {
      const whereKeys = Object.keys(conditions);
      const whereValues = Object.values(conditions);
      const whereClause = whereKeys.length > 0
        ? 'WHERE ' + whereKeys.map(key => `${key} = ?`).join(' AND ')
        : '';

      const sql = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
      const result = queryOne(sql, whereValues);

      return result ? result.count : 0;
    } catch (error) {
      logger.error(`Error counting ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        conditions
      });
      throw new DatabaseError(`Error counting ${this.tableName}`, error);
    }
  }

  /**
   * Check if record exists
   * @param {Object} conditions - Where conditions
   * @returns {Promise<boolean>} True if exists
   */
  async exists(conditions) {
    try {
      const count = await this.count(conditions);
      return count > 0;
    } catch (error) {
      logger.error(`Error checking existence in ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        conditions
      });
      throw new DatabaseError(`Error checking ${this.tableName}`, error);
    }
  }

  /**
   * Paginate records
   * @param {Object} options - { page, limit, orderBy, orderDir, conditions }
   * @returns {Promise<Object>} { data, pagination }
   */
  async paginate(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        orderBy = 'created_at',
        orderDir = 'DESC',
        conditions = {}
      } = options;

      const offset = (page - 1) * limit;

      // Get total count
      const total = await this.count(conditions);

      // Get data
      const data = await this.findWhere(conditions, {
        orderBy,
        orderDir,
        limit,
        offset
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error(`Error paginating ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        options
      });
      throw new DatabaseError(`Error paginating ${this.tableName}`, error);
    }
  }

  /**
   * Execute custom SQL query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(sql, params = []) {
    try {
      const results = query(sql, params);

      logger.dbOperation('customQuery', this.tableName, {
        sqlLength: sql.length,
        paramCount: params.length,
        resultCount: results.length
      });

      return results;
    } catch (error) {
      logger.error(`Error executing query on ${this.tableName}:`, {
        error: error.message,
        table: this.tableName,
        sqlPreview: sql.substring(0, 100)
      });
      throw new DatabaseError(`Error querying ${this.tableName}`, error);
    }
  }
}

module.exports = BaseModel;
