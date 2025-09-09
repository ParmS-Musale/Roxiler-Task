// Store Model class for database operations
const db = require('../config/database'); // Your database connection

class Store {
  // Create a new store
  static async create(storeData) {
    const {
      name, email, address, owner_id
    } = storeData;

    const query = `
      INSERT INTO stores (name, email, address, owner_id) 
      VALUES (?, ?, ?, ?)
    `;

    const values = [name, email || null, address || null, owner_id || null];

    try {
      const result = await db.executeQuery(query, values);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating store: ${error.message}`);
    }
  }

  // Find all stores with filters
  static async findAll(filters = {}) {
    let query = `
      SELECT s.*, u.name as owner_name, u.email as owner_email
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.is_active = TRUE
    `;
    const queryParams = [];

    // Add search filter
    if (filters.search && filters.search.trim()) {
      query += ` AND (s.name LIKE ? OR s.address LIKE ?)`;
      const searchTerm = `%${filters.search.trim()}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Add owner filter
    if (filters.ownerId) {
      query += ` AND s.owner_id = ?`;
      queryParams.push(filters.ownerId);
    }

    // Add rating filter
    if (filters.minRating && filters.minRating > 0) {
      query += ` AND s.average_rating >= ?`;
      queryParams.push(filters.minRating);
    }

    // Add sorting - validate and sanitize sort parameters
    const validSortFields = ['name', 'average_rating', 'total_ratings', 'created_at'];
    const sortBy = validSortFields.includes(filters.sortBy) ? filters.sortBy : 'name';
    const sortOrder = ['ASC', 'DESC'].includes(filters.sortOrder?.toUpperCase()) ? 
                     filters.sortOrder.toUpperCase() : 'ASC';
    
    query += ` ORDER BY s.${sortBy} ${sortOrder}`;

    // Add pagination - build into query string (MySQL doesn't handle LIMIT as parameter well)
    if (filters.limit && filters.limit > 0) {
      const limitValue = Math.min(parseInt(filters.limit), 100); // Max 100 items
      const offsetValue = filters.offset && filters.offset > 0 ? parseInt(filters.offset) : 0;
      
      if (offsetValue > 0) {
        query += ` LIMIT ${offsetValue}, ${limitValue}`;
      } else {
        query += ` LIMIT ${limitValue}`;
      }
    }

    try {
      console.log('Executing query:', query);
      console.log('With parameters:', queryParams);
      
      const rows = await db.executeQuery(query, queryParams);
      
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        address: row.address,
        owner_id: row.owner_id,
        average_rating: parseFloat(row.average_rating) || 0,
        total_ratings: row.total_ratings || 0,
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at,
        owner: {
          name: row.owner_name,
          email: row.owner_email
        }
      }));
    } catch (error) {
      console.error('Store.findAll error:', error);
      throw new Error(`Error fetching stores: ${error.message}`);
    }
  }

  // Count total stores with filters
  static async count(filters = {}) {
    let query = `SELECT COUNT(*) as count FROM stores WHERE is_active = TRUE`;
    const queryParams = [];

    if (filters.search && filters.search.trim()) {
      query += ` AND (name LIKE ? OR address LIKE ?)`;
      const searchTerm = `%${filters.search.trim()}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    if (filters.ownerId) {
      query += ` AND owner_id = ?`;
      queryParams.push(filters.ownerId);
    }

    if (filters.minRating && filters.minRating > 0) {
      query += ` AND average_rating >= ?`;
      queryParams.push(filters.minRating);
    }

    try {
      console.log('Count query:', query);
      console.log('Count parameters:', queryParams);
      
      const rows = await db.executeQuery(query, queryParams);
      return rows[0].count;
    } catch (error) {
      console.error('Store.count error:', error);
      throw new Error(`Error counting stores: ${error.message}`);
    }
  }

  // Find store by ID
  static async findById(id) {
    const query = `
      SELECT s.*, u.name as owner_name, u.email as owner_email, u.created_at as owner_created_at
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.id = ? AND s.is_active = TRUE
    `;

    try {
      const rows = await db.executeQuery(query, [id]);
      if (rows.length === 0) return null;

      const store = rows[0];
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner_id: store.owner_id,
        average_rating: parseFloat(store.average_rating) || 0,
        total_ratings: store.total_ratings || 0,
        is_active: Boolean(store.is_active),
        created_at: store.created_at,
        updated_at: store.updated_at,
        owner: store.owner_id ? {
          id: store.owner_id,
          name: store.owner_name,
          email: store.owner_email,
          created_at: store.owner_created_at
        } : null
      };
    } catch (error) {
      console.error('Store.findById error:', error);
      throw new Error(`Error fetching store: ${error.message}`);
    }
  }

  // Update store
  static async update(id, updateData) {
    const allowedFields = ['name', 'email', 'address', 'is_active'];
    
    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) return false;

    values.push(id); // Add ID for WHERE clause

    const query = `UPDATE stores SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    try {
      console.log('Update query:', query);
      console.log('Update parameters:', values);
      
      const result = await db.executeQuery(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Store.update error:', error);
      throw new Error(`Error updating store: ${error.message}`);
    }
  }

  // Soft delete store
  static async delete(id) {
    const query = `UPDATE stores SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    try {
      const result = await db.executeQuery(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Store.delete error:', error);
      throw new Error(`Error deleting store: ${error.message}`);
    }
  }
}

module.exports = Store;