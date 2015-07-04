var mysql = require('./mysql');

function User(user){
	this.username = user.username;
	this.password = user.password;
	this.telephone = user.telephone;
	this.email = user.email;
	this.create_time = user.create_time;
	ths.IDCardNo = user.IDCardNo;
	this.gender = user.gender;
}

User.get = function get(username, callback){
	mysql.getConnection(function(err, conn){
		if (err) {
			console.log("POOL: ==> " + err);
			callback(err);
		};

		var sql = 'SELECT username, password, score FROM user WHERE username = "' + username +'"';
		console.log('SelectSQL: '+ sql);
		conn.query(sql, function(err, rows){
			if(err){
				console.log(err);
				callback(err);
			}
			
			console.log(rows);
			if (rows) {
				var user = new User(rows[0]);
				callback(err,user);
			}else
				callback(err, null);
        	conn.release();
		});
	});
};
User.save = function save(user,callback){
		mysql.getConnection(function(err, conn){
		if (err) {
			console.log("POOL ==> " + err);
			callback(err);
		};

		var sql = 'insert into user(userid, username, password, telephone, IDCardNo) values("'+ user.userid+'","'+  user.username +'","'+ user.password + '","'+ user.telephone+ '","'+ user.IDCardNo +'")';
		console.log('SaveSQL: '+ sql);
		conn.query(sql, function(err, res){
			if(err){
				console.log(err);
				callback(err);
			}
			console.log("User save ==> ");
        	console.log(res);
        	conn.release();
        	callback(err,res);
		});
	});
};

User.getUserByTel = function getUserByTel(tel, callback){
		mysql.getConnection(function(err, conn){
		if (err) {
			console.log("POOL: ==> " + err);
			callback(err);
		};

		var sql = 'SELECT username FROM user WHERE telephone = "' + tel +'"';
		console.log('SelectSQL: '+ sql);
		conn.query(sql, function(err, rows){
			if(err){
				console.log(err);
				callback(err);
			}
			console.log('查询输出');
			console.log(rows);
			if (rows.length > 0 ) {
				var user = new User(rows[0]);
				callback(err,user);
			}else
				callback(err, null);
        	conn.release();
		});
	});
};

User.updatePwd = function updatePwd(tel, password, callback){
	mysql.getConnection(function(err, conn){
		if (err) {
			console.log("POOL: ==> " + err);
			callback(err);
		};

		var sql = 'UPDATE user set password = "' + password +'" WHERE telephone = "' + tel + '"';
		console.log('UPDATESQL: '+ sql);
		conn.query(sql, function(err, res){
			if(err){
				console.log(err);
				callback(err);
			}else
				callback(null);

        	conn.release();
		});
	});
};
User.checkUserByName = function checkUserByName(username, callback){
	mysql.getConnection(function(err, conn){
		if(err){
			console.log("POOL: ==> " + err);
			callback(err);
		};
		var sql = 'select * from user where username = "'+ username +'"';
		console.log('SelectSQL: '+ sql);
		conn.query(sql, function(err, rows){
			if(err){
				callback(err, null);
			}
			console.log('*****查询用户名是否重复*****');
			console.log(rows);
			callback(err, rows);
		});
	});
};
User.query = function getScore(sql, callback){
	mysql.getConnection(function(err, conn){
		if(err){
			console.log("POOL: ==> " + err);
			callback(err);
		}
		else{
			console.log('querySQL:',sql);
			conn.query(sql, function(err, rows){
				if(err){
					callback(err, null);
				}
				else{
					console.log(rows);
					callback(err, rows);
				}
			});//conn.query
		};
	});//mysql.getConnection
}



module.exports = User;