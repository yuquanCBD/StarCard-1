var mysql = require('./mysql');

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

		conn.query(sql, function(err, res){
			if(err){
				console.log(err);
				callback(err);
			}
			conn.release();
			callback(err, res);
		})
	})
};

module.exports = Comment;