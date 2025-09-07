// Create this file as test-db-connection.js in your backend directory
const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔍 Testing database connection...');
console.log('Environment variables:');
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- DB_PORT:', process.env.DB_PORT);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

async function testConnection() {
  let connection;
  
  try {
    console.log('\n🔄 Step 1: Testing basic MySQL connection...');
    
    // Test basic connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT) || 3306
    });
    
    console.log('✅ Step 1: Basic MySQL connection successful!');
    
    console.log('\n🔄 Step 2: Checking available databases...');
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('Available databases:', databases.map(db => Object.values(db)[0]));
    
    // Check if our database exists
    const dbName = process.env.DB_NAME || 'store_rating_db';
    const dbExists = databases.some(db => Object.values(db)[0] === dbName);
    
    if (!dbExists) {
      console.log(`❌ Database '${dbName}' does not exist!`);
      console.log(`💡 Creating database '${dbName}'...`);
      
      await connection.execute(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully!`);
    } else {
      console.log(`✅ Database '${dbName}' exists!`);
    }
    
    console.log('\n🔄 Step 3: Testing connection to specific database...');
    await connection.changeUser({ database: dbName });
    console.log('✅ Step 3: Connected to specific database!');
    
    console.log('\n🔄 Step 4: Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found in database!');
      console.log('💡 You need to run the database schema to create tables.');
    } else {
      console.log('✅ Tables found:', tables.map(t => Object.values(t)[0]));
      
      // Test a simple query
      console.log('\n🔄 Step 5: Testing data query...');
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Step 5: Found ${users[0].count} users in database`);
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
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed');
    }
  }
}

testConnection();