var mysql = require('mysql');
var pool = mysql.createPool({
    host: '121.40.55.207',
    user: 'root',
    password: 'k6w-s39-Ndy-Fda',
    database: 'starcard',
    port: 3306,
    connectionLimit : 50
});

module.exports = pool;