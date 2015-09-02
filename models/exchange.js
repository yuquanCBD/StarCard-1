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
Exchange.addExchange = function(id, buserid, scardid, suserid, describes, card_pic, card_name, card_desc, pictures,callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'insert into exchange(id, buserid, scardid, suserid, describes, card_pic, card_name, card_desc, pictures) values' +
					'(?, ?, ?, ?, ?, ?, ?, ?, ?)';
		conn.query(sql, [id, buserid, scardid, suserid, describes, card_pic, card_name, card_desc, pictures],function(err, results){
			conn.release();
			if(err)
				return callback(err);

			callback(err, results);
			Message.insertNewMsg(suserid, id, 2, card_name, card_desc, card_pic, scardid, function(err, results){if(err) console.log(err)});
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

			callback(err, results);
			Message.insertNewMsg(buserid, id, 2, card_name, card_desc, card_pic, scardid, function(err, results){ if(err) console.log(err)});
		})
	})

}

module.exports = Exchange;