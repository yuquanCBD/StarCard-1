var mysql = require('./mysql');

function Exchange(exchange){
};

Exchange.execSql = function(sql, callback){
	mysql.getConnection(function(err, conn){
		if(err){
			console.log("POOL ==>" + err);
			callback(err);
		};

		conn.query(sql, function(err, res){
			if(err){
				console.log(err);
				callback(err);
			}
			conn.release();
			callback(err, res);
		})
	})
};

module.exports = Exchange;