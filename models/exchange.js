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
			callback(err, res);

		})
	})
};

module.exports = Exchange;