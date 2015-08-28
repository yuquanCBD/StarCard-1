var mysql = require('./mysql');
var logger = require('../helper/logger').logger('message');

function Message(){}

//查询未读消息列表
Message.showMessageNotRead = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'SELECT msg_id, event_id, status, time, msg_type FROM message WHERE userid = "' + userid + '" AND status = 0 ORDER BY time DESC';
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
Message.insertNewMsg = function(userid, event_id, msg_type, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'INSERT INTO message (userid, event_id, msg_type) VALUES(?, ?, ?)';//设置消息已读
		logger.info('sql: ', sql);

		conn.query(sql, [userid, event_id, msg_type],function(err, results){
			callback(err, results);
			conn.release();
		});
	});
};

//返回所有的消息
Message.showAllMessages = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'SELECT msg_id, event_id, status, time, msg_type FROM message WHERE userid = "' + userid + '" ORDER BY time DESC';
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
				callback(err, null);

			conn.release();
		});
	});
}

module.exports = Message;