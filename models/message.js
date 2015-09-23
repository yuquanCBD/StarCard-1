var mysql = require('./mysql');

function Message(){}

//查询未读消息列表
Message.showMessageNotRead = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'SELECT msg_id, event_id, status, time, msg_type, title, description, card_pic, cardid, order_buy_sell, order_status FROM message WHERE userid = "' + userid + '" AND status = 0 ORDER BY time DESC';
		conn.query(sql,function(err, rows){
			callback(err, rows);
			conn.release();
		});
	});
};

//标记消息为已读
Message.markRead = function(msg_id, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'UPDATE message SET status = 1 WHERE msg_id = ?';//设置消息已读

		conn.query(sql, [msg_id],function(err, results){
			callback(err, results);
			conn.release();
		});
	});
};

//msg :1. 评论消息 2. 订单消息 3. 系统消息， 4. 换卡消息
Message.insertNewMsg = function(userid, event_id, msg_type, title, description, card_pic, cardid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);
		console.log('--------------insertNewMsg', userid, event_id, msg_type, title, description, card_pic, cardid);
		var sql = 'INSERT INTO message (userid, event_id, msg_type, title, description, card_pic, cardid) VALUES(?, ?, ?, ?, ?, ?, ?)';

		conn.query(sql, [userid, event_id, msg_type, title, description, card_pic, cardid], function(err, results){
			callback(err, results);
			conn.release();
		});
	});
}

//生成订单消息
Message.insertOrderMsg = function(userid, event_id, msg_type, title, description, card_pic, cardid, order_buy_sell, order_status, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);
		console.log('--------------insertNewMsg', userid, event_id, msg_type, title, description, card_pic, cardid, order_buy_sell, order_status);
		var sql = 'INSERT INTO message (userid, event_id, msg_type, title, description, card_pic, cardid, order_buy_sell, order_status) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';

		conn.query(sql, [userid, event_id, msg_type, title, description, card_pic, cardid, order_buy_sell, order_status], function(err, results){
			callback(err, results);
			conn.release();
		});
	});
}

//返回所有的消息
Message.showAllMessages = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'SELECT msg_id, event_id, status, time, msg_type, title, description, card_pic, cardid FROM message WHERE userid = "' + userid + '" ORDER BY time DESC';
		conn.query(sql,function(err, rows){
			callback(err, rows);
			conn.release();
		});
	});
}

//查询未读消息数量
Message.queryUnreadMsgNum = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'SELECT COUNT(msg_id) AS num FROM message WHERE status = 0 AND userid = ? GROUP BY userid  ORDER BY time DESC';
		conn.query(sql, [userid], function(err, rows){
			if (rows.length != 0)
				callback(err, rows[0].num);
			else
				callback(err, 0);

			conn.release();
		});
	});
}

module.exports = Message;