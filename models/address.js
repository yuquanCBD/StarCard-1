var mysql = require('./mysql');
var async = require('async');


function Address(){};

//获取常用地址列表
Address.list = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		
		var sql = 'SELECT addr_id, userid,province, city, district, postcode, address, telephone, consignee, tag FROM address WHERE userid = "'+ userid +'"';
		console.log('addressList_SQL: '+ sql);

		conn.query(sql, function(err, results){
            callback(err, results);
            conn.release();
        });
	});
};

//添加新地址并设置为默认地址
Address.add = function(userid, province, city, district, postcode, address, telephone, consignee, callback){
	mysql.getConnection(function(err, conn){
		var sql1 = 'UPDATE address SET tag = 0 WHERE userid = "'+userid+'" AND tag = 1';//取消原来的默认收获地址

		//设置新的默认收获地址
		var sql2 = 'INSERT INTO address (userid, province, city, district, postcode, address, telephone, consignee, tag) '+
		'VALUES("'+userid+'", "'+province+'", "'+city+'", "'+district+'", "'+postcode+'", "'+address+'", "'+telephone+'", "'+consignee
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
	})
}

//根据地址id查询地址详情
Address.queryAddrById = function(addrid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err)

		var sql = 'SELECT addr_id, userid,province, city, district, postcode, address, telephone, consignee, tag FROM address WHERE addr_id = ?';
		console.log('SQL: '+ sql);

		conn.query(sql, [addrid], function(err, rows){
            conn.release();
            callback(err, rows);
        });
	})
}

//查询默认收货地址
Address.getDefaultAddr = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err)

		var sql = 'SELECT addr_id, userid,province, city, district, postcode, address, telephone, consignee, tag FROM address WHERE userid = ? AND tag = 1';
		console.log('SQL: '+ sql);

		conn.query(sql, [userid], function(err, rows){
            conn.release();
            callback(err, rows);
        });
	})
}

//修改默认收货地址
Address.modifyDefaultAddr = function(userid, province, city, district, address, postcode, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err)

		var sql = 'UPDATE address SET province = ?, city = ?, district = ?, address = ?, postcode = ? WHERE userid = ? AND tag = 1';
		console.log('SQL: '+ sql);

		conn.query(sql, [province, city, district, address, postcode, userid], function(err, results){
            conn.release();
            callback(err, results);
        });
	})
}

//通过id修改用户地址
Address.modifyAddrById = function(userid, addrid, province, city, district, address, postcode, telephone, consignee, is_default, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err)

		if(is_default == 0){//不设置为默认地址

			var sql = 'UPDATE address SET province = ?, city = ?, district = ?, address = ?, postcode = ? , telephone = ?, consignee = ? WHERE addr_id = ?';
			console.log('SQL: '+ sql);

			conn.query(sql, [province, city, district, address, postcode, telephone, consignee, addrid], function(err, results){
	            conn.release();
	            return callback(err, results);
	        })
        }else{//设置为默认地址
        	var sql = 'UPDATE address SET tag = 0 WHERE userid = ?';
        	console.log('SQL: '+ sql);
			conn.query(sql, [userid], function(err, results){
				if (err) {
					conn.release();
					return callback(err);
				}
	            
	            var sql = 'UPDATE address SET province = ?, city = ?, district = ?, address = ?, postcode = ? , telephone = ?, consignee = ?, tag = 1 WHERE addr_id = ?';
				conn.query(sql, [province, city, district, address, postcode, telephone, consignee, addrid], function(err, results){
		            conn.release();
		            return callback(err, results);
		        })

	        })

        }
	})
}

module.exports = Address;