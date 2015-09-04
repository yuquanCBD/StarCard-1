var mysql = require("./mysql");

function Adv(adv){
	this.adv = adv;
}

Adv.add = function(obj, callback){
	var adv_id = obj.adv_id;
	var title = obj.title;
	var content = obj.content;
	var main_picture = obj.main_picture;
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'INSERT INTO adv (adv_id, title, content, main_picture) VALUES(?, ?, ?, ?)';
		conn.query(sql, [adv_id, title, content, main_picture], function(err, results){
			if(err)
				return callback(err);
			conn.release();
			return callback(err,results);
        });

	});
}

Adv.getlist = function(callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'select * from adv order by create_time desc';
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);
			conn.release();
			return callback(err,results);
        });

	});
};


Adv.delete = function(adv_id, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'delete from adv where adv_id="'+adv_id+'"';
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);
			conn.release();
			return callback(err,results);
        });

	});
};

Adv.updateWithImg = function(obj, callback){
	var adv_id = obj.adv_id;
	var title = obj.title;
	var main_picture = obj.main_picture;
	var content = obj.content;
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'update adv set title= ? , main_picture = ? , content= ? where adv_id= ?';
		conn.query(sql, [title, main_picture, content, adv_id], function(err, results){
			if(err)
				return callback(err);
			conn.release();
			return callback(err,results);
        });

	});
};
Adv.updateWithoutImg = function(obj, callback){
	var adv_id = obj.adv_id;
	var title = obj.title;
	//var main_picture = obj.main_picture;
	var content = obj.content;
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'update adv set title= ? , content= ? where adv_id= ?';
		conn.query(sql, [title, content, adv_id], function(err, results){
			if(err)
				return callback(err);
			conn.release();
			return callback(err,results);
        });

	});
};


module.exports = Adv;