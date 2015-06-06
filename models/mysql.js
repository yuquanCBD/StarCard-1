var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'nodejs',
    password: 'nodejs',
    database: 'microblog',
    port: 3306
});

module.exports = pool;