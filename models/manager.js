var mysql = require('./mysql');

function Manager(){}

Manager.queryManagerInfoById = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'SELECT * FROM manager WHERE userid = ?';

		conn.query(sql, [userid], function(err, rows){
			conn.release();
			if(rows.length != 0)
				return callback(err, rows[0]);
			else
				return callback(err, null);
		})
	})
}

module.exports = Manager;