const mysql = require("mysql2/promise");
require("dotenv").config();

console.log('🔧 Loading database configuration...');
console.log('Environment variables:');
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_rating_db',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Test database connection function
async function testConnection() {
  let connection;
  
  try {
    console.log('\n🔄 Step 1: Testing basic MySQL connection...');
    
    // Test basic connection
    connection = await pool.getConnection();
    console.log('✅ Step 1: Basic MySQL connection successful!');
    
    console.log('\n🔄 Step 2: Checking database...');
    const [rows] = await connection.execute('SELECT DATABASE() as current_db');
    console.log(`📋 Current database: ${rows[0].current_db}`);
    
    console.log('\n🔄 Step 3: Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found in database!');
      console.log('💡 You need to run the database schema to create tables.');
    } else {
      console.log('✅ Tables found:', tables.map(t => Object.values(t)[0]));
      
      // Test a simple query
      console.log('\n🔄 Step 4: Testing data query...');
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Step 4: Found ${users[0].count} users in database`);
    }
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Specific error handling
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solutions:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check if MySQL is installed');
      console.log('3. Verify the host and port are correct');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solutions:');
      console.log('1. Check your username and password in .env file');
      console.log('2. Make sure the MySQL user has proper permissions');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Solutions:');
      console.log('1. The database does not exist - create it first');
      console.log('2. Check the database name in .env file');
    }
    
    throw error;
  } finally {
    if (connection) {
      connection.release();
      console.log('\n🔌 Connection closed');
    }
  }
}

// Execute query function - THIS IS WHAT WAS MISSING!
const executeQuery = async (query, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    console.log(`✅ Query executed successfully: ${query.substring(0, 50)}...`);
    return results;
  } catch (error) {
    console.error('❌ Query execution failed:', error.message);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Execute transaction function
const executeTransaction = async (queries) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('❌ Transaction failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Export all the functions that your app needs
module.exports = {
  pool,
  testConnection,
  executeQuery,        // THIS WAS MISSING - auth controller needs this!
  executeTransaction
};

console.log('✅ Database module loaded with exports:', Object.keys(module.exports));