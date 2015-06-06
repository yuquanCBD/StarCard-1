var mysql = require('mysql');
var pool = mysql.createPool({
    host: '115.28.60.156',
    user: 'root',
    password: 'zUCC2015',
    database: 'test1',
    port: 3306
});

module.exports = pool;