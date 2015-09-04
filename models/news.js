var mysql = require('./mysql');
function News(news){
	this.news = news;
}
News.add = function(obj, callback){
	var title = obj.title;
	var source = obj.source;
	var create_time = obj.create_time;
	var content = obj.content;
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'INSERT INTO news (title, source, create_time, content) VALUES(?, ?, ?, ?)';
		conn.query(sql, [title, source, create_time, content], function(err, results){
			if(err)
				return callback(err);
			conn.release();
			return callback(err,results);
        });

	});
}
News.update = function(obj, callback){
	var news_id = obj.news_id;
	var title = obj.title;
	var source = obj.source;
	var create_time = obj.create_time;
	var content = obj.content;
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'update news set title= ? , source = ? , create_time= ? , content= ? where news_id= ?';
		conn.query(sql, [title, source, create_time, content, news_id], function(err, results){
			if(err)
				return callback(err);
			conn.release();
			return callback(err,results);
        });

	});
};
News.getlist = function(callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'select * from news';
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);
			conn.release();
			return callback(err,results);
        });

	});
};

News.delete = function(news_id, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'delete from news where news_id="'+news_id+'"';
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);
			conn.release();
			return callback(err,results);
        });

	});
}
module.exports = News;