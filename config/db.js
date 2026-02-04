const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'queue',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// --- ADD THIS TEST BLOCK ---
promisePool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database Connected Successfully!');
        connection.release(); // Important: release the connection back to the pool
    })
    .catch(err => {
        console.error('❌ Database Connection Failed!');
        console.error('Error details:', err.message);
    });
// ---------------------------

module.exports = promisePool;