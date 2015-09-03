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
		var sql1 = 'INSERT INTO news (title, source, create_time, content) VALUES(?, ?, ?, ?)';
		conn.query(sql1, [title, source, create_time, content], function(err, results){
			if(err)
				return callback(err);

			return callback(err,results);
        });

	});
}

module.exports = News;