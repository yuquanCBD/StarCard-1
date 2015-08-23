var mysql = require('./mysql');

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

		var sql = 'UPDATE message SET status = 2 WHERE msg_id = ?';//设置消息已读

		conn.query(sql, [msg_id],function(err, results){
			callback(err, results);
			conn.release();
		});
	});
};

module.exports = Message;