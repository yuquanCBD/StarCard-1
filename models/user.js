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

		var sql = 'SELECT username, password FROM user WHERE username = "' + username +'"';
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

User.prototype.save = function save(callback){

		var user = {
			username : this.username,
			password : this.password,
			telephone : this.telephone,
			create_time : new Date(),
			IDCardNo : this.IDCardNo,
		};

		mysql.getConnection(function(err, conn){
		if (err) {
			console.log("POOL ==> " + err);
			callback(err);
		};

		var sql = 'insert into user(username, password, telephone, create_time, IDCardNo) values("'+ user.username +'","'+ user.password + '","'+ user.telephone+ '","'+ user.create_time +'","'+ user.IDCardNo +'")';
		console.log('SaveSQL: '+ sql);
		conn.query(sql, function(err, res){
			if(err){
				console.log(err);
				callback(err);
			}
			console.log("User save ==> ");
        	console.log(res);
        	conn.release();
        	callback(err,user);
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


module.exports = User;