var mysql = require('./mysql');

function ScoreRule(){}

ScoreRule.getRule = function(callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'SELECT rule FROM score_rule';
		conn.query(sql, function(err, rows){
			conn.release();
			if(rows.length != 0)
				callback(err, rows[0]);
			else
				callback(err, null);
		})
	})
}

module.exports = ScoreRule;