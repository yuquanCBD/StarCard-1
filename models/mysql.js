var mysql = require('mysql');
var pool = mysql.createPool({
    host: '121.40.55.207',
    user: 'root',
    password: '123456',
    database: 'starcard',
    port: 3306
});

module.exports = pool;