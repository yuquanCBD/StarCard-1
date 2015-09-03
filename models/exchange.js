var mysql = require('./mysql');
var Message = require('./message')


function Exchange(exchange){
}

Exchange.execSql = function(sql, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		conn.query(sql, function(err, res){
			callback(err, res);

		})
	})
}

//提交换卡申请
Exchange.addExchange = function(id, buserid, scardid, suserid, describes, card_pic, card_name, card_desc, pictures, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'insert into exchange(id, buserid, scardid, suserid, describes, card_pic, card_name, card_desc, pictures) values' +
					'(?, ?, ?, ?, ?, ?, ?, ?, ?)';
		console.log(sql);
		conn.query(sql, [id, buserid, scardid, suserid, describes, card_pic, card_name, card_desc, pictures],function(err, results){
			conn.release();
			if(err)
				return callback(err);

			conn.release();
			callback(err, results);
			Message.insertNewMsg(suserid, id, 4, card_name, card_desc, card_pic, scardid, function(err, results){if(err) console.log(err)});
		})
	})
}

//处理换卡请求
Exchange.changeStatus = function(id, status, refuseInfo, buserid, card_pic, card_name, card_desc, scardid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'UPDATE exchange SET status = ?, refuseInfo = ? WHERE id = ?';

		conn.query(sql, [status, refuseInfo, id], function(err, results){
			if(err)
				return callback(err);

			conn.release();
			callback(err, results);
			Message.insertNewMsg(buserid, id, 4, card_name, card_desc, card_pic, scardid, function(err, results){ if(err) console.log(err)});
		})
	})

}

//根据id查询换卡申请详情
Exchange.getExchangeInfoById = function(id, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'SELECT suserid, scardid, buserid, pictures, describes, '+
				'status, refuseInfo, card_name, card_desc, card_pic FROM exchange WHERE id = ?';

		conn.query(sql, [id], function(err, rows){
			conn.release();
			callback(err, rows);
		})
	})
}

module.exports = Exchange;