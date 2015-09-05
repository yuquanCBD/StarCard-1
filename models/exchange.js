var mysql = require('./mysql');
var Message = require('./message')
var getui = require('../getui/getui');


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
			if(err)
				return callback(err);

			callback(err, results);
			Message.insertNewMsg(suserid, id, 4, card_name, card_desc, card_pic, scardid, function(err, results){if(err) console.log(err)});

			/*个推消息*/
			var sql = 'SELECT device_token FROM user WHERE userid = ?';
			conn.query(sql, [suserid], function(err, rows){
				conn.release();
				if(rows.length == 0)
					return;
				var device_token = rows[0].device_token;
				getui.push('交易消息', '有人对您发布的卡片提出了换卡申请～', device_token);
			})
			/*个推消息*/
		})
	})
}

//处理换卡请求
Exchange.changeStatus = function(id, status, refuseInfo, buserid, card_pic, card_name, card_desc, scardid, callback){
	if(status == 1){//如果同意换卡，则把card表的status置为1
		mysql.getConnection(function(err, conn){
			if(err)
				return callback(err);

			var sql = 'UPDATE card SET status = 1 WHERE cardid = ?';
			conn.query(sql, [scardid], function(err, results){
				conn.release();
				if(err)
					return callback(err);
			})

		})
	}


	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'UPDATE exchange SET status = ?, refuseInfo = ? WHERE id = ?';

		conn.query(sql, [status, refuseInfo, id], function(err, results){
			if(err)
				return callback(err);

			callback(err, results);
			
			Message.insertNewMsg(buserid, id, 4, card_name, card_desc, card_pic, scardid, function(err, results){ if(err) console.log(err)});
		
			/*个推消息*/
			var sql = 'SELECT device_token FROM user WHERE userid = ?';
			conn.query(sql, [buserid], function(err, rows){
				conn.release();
				if(rows.length == 0)
					return;
				var device_token = rows[0].device_token;
				getui.push('交易消息', '卖家已经处理了您提出的换卡申请～', device_token);
			})
			/*个推消息*/
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