var mysql = require('./mysql');
var Message = require('./message')


function Comment(comment){
	this.cardid = comment.cardid;
	this.userid = comment.userid;
	this.commentto = comment.commentto;
	this.content = comment.content;
}


//发表评论
Comment.addComment = function(cardid, userid, commentto, content, username, user_pic, to_username, callback){
	mysql.getConnection(function(err, conn){
		var sql = 'insert into card_comment(cardid, userid, commentto, content, username, user_pic, to_username) values' + 
            '(?, ?, ?, ?, ?, ?, ?)';

        conn.query(sql, [cardid, userid, commentto, content, username, user_pic, to_username], function(err, results){
        	if(err){
        		conn.release();
        		return callback(err);
        	}
			var comment_id = results.insertId;

			callback(err, results);
			if(comment_id == null || comment_id == '') return;

			//查询评论卡片的卖家
			var sql = 'SELECT a.owner, a.title, a.describes, a.pictures From card a left join card_comment b on a.cardid = b.cardid where b.commentid = ?';
			console.log(sql);
			conn.query(sql, [comment_id], function(err, rows){
				conn.release();
				if(rows.length == 0)
					return;
				var seller = rows[0].owner;
				var title = rows[0].title;
				var describes = rows[0].describes;
				var pictures = rows[0].pictures;
				//生成买家的一条消息 
				Message.insertNewMsg(seller, comment_id, 1, title, describes, pictures, function(err, results){ if(err) console.log(err);}); // 生成对卖家的一条信息
			})

        })    
    })

}

//显示卡片评论列表
Comment.showCardComments = function(cardid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'SELECT * FROM card_comment WHERE cardid = ?';
		conn.query(sql, [cardid], function(err, rows){
			conn.release();
			callback(err, rows);
		});

	})
}

//删除评论信息
Comment.delcomment = function(commentid, callback){
	mysql.getConnection(function(err, conn){
		if(err){
			return callback(err);
		}
		var sql = 'delete from card_comment where commentid = "'+commentid+'"';
		conn.query(sql, function(err, r){
			if(err){
				conn.release();
				return callback(err);
			}
			conn.release();
			return callback(err, r);
		})
	})
}


module.exports = Comment;