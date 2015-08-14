var mysql = require('./mysql');

function Address(){};

//获取常用地址列表
Address.list = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		
		var sql = 'SELECT addr_id, province, city, district, postcode, address, telephone, consigee, tag FROM address WHERE userid = "'+ userid +'"';
		console.log('addressList_SQL: '+ sql);

		conn.query(sql, function(err, results){
            callback(err, results);
            conn.release();
        });
	});
};

//添加新地址并设置为默认地址
Address.add = function(userid, province, city, district, postcode, address, telephone, consigee, callback){
	mysql.getConnection(function(err, conn){
		var sql1 = 'UPDATE address SET tag = 0 WHERE userid = "'+userid+'" AND tag = 1';//取消原来的默认收获地址

		//设置新的默认收获地址
		var sql2 = 'INSERT INTO address (userid, province, city, district, postcode, address, telephone, consigee, tag) '+
		'VALUES("'+userid+'", "'+province+'", "'+city+'", "'+district+'", "'+postcode+'", "'+address+'", "'+telephone+'", "'+consigee
			+'", 1)';

		console.log('sql1: '+ sql1);
		conn.query(sql1, function(err, results){
			if(err)
				return callback(err);
			console.log('sql2: '+ sql2);
			conn.query(sql2, function(err, results){
				callback(err, results);
			});
			conn.release();
        });
	});
};

Address.del = function(userid, addrid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'DELETE FROM address WHERE userid = ? AND addr_id = ?';
		var cond = [userid, addrid];

		console.log('del_SQL: '+ sql);

		conn.query(sql, cond, function(err, results){
            callback(err, results);
            conn.release();
        });
	});};



module.exports = Address;