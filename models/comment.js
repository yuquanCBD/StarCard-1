var mysql = require('./mysql');
var Message = require('./message')


function Comment(comment){
	this.cardid = comment.cardid;
	this.userid = comment.userid;
	this.commentto = comment.commentto;
	this.content = comment.content;
};

Comment.execSql = function(sql, callback){
	mysql.getConnection(function(err, conn){
		if(err){
			console.log("POOL ==>" + err);
			callback(err);
			conn.release();
		};

		conn.query(sql, function(err, result){
			if(err){
				console.log(err);
				callback(err);
			}
			var comment_id = result.insertId

			callback(err, result);
			if(comment_id != null && comment_id != '') return;

			//查询评论卡片的卖家
			var sql = 'SELECT owner From card a left join card_comment b on a.cardid = b.cardid where b.commentid = ?';
			conn.query(sql, [comment_id], function(err, rows){
				conn.release();
				if(rows.length == 0)
					return;
				var seller = rows[0].owner;
				//生成买家的一条消息 
				if(comment_id != null && comment_id != '')
					Message.insertNewMsg(owner, comment_id, 1, function(err, results){}); // 生成对卖家的一条信息
			});

		})
	})
};

module.exports = Comment;