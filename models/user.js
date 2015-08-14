var mysql = require('./mysql');
var path = require('path');
var fs = require('fs');


function User(user){
	this.userid = user.userid;
	this.username = user.username;
	this.password = user.password;
	this.telephone = user.telephone;
	this.email = user.email;
	this.create_time = user.create_time;
	this.IDCardNo = user.IDCardNo;
	this.gender = user.gender;
}

User.get = function get(username, callback){
	mysql.getConnection(function(err, conn){
		if (err) {
			console.log("POOL: ==> " + err);
			callback(err);
		};

		var sql = 'SELECT userid, username, password, score FROM user WHERE username = "' + username +'"';
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
		}
		var sql = 'select * from user where username = "'+ username +'"';
		console.log('SelectSQL: '+ sql);
		conn.query(sql, function(err, rows){
			if(err){
				return callback(err, null);
			}
			console.log('*****查询用户名是否重复*****');
			console.log(rows);
			conn.release();
			callback(err, rows);
		});
	});
};
User.query = function(sql, callback){
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
					conn.release();
					callback(err, rows);
				}
			});//conn.query
		};
	});//mysql.getConnection
}
User.exec = function(sql, callback){
	mysql.getConnection(function(err, conn){
		if(err){
			console.log("POOL ==>" + err);
			callback(err);
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
/*
----------------------------------------我的卡圈 start --------------------------------------------
*/
//查询用户积分
User.queryScore = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'select score from user where userid = "'+ userid +'"';
		console.log('SelectSQL: '+ sql);
		conn.query(sql, function(err, rows){
			if(err)
				return callback(err);
			callback(err,rows[0])
		});
	});
};


//查询用户收藏的卡片
User.queryCollect = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'SELECT a.cardid, a.title, a.pictures, a.describes, a.price, a.logistic, a.category, a.brand, '+
				'a.freight, a.exchange, a.owner, a.amount, a.time, a.longitude, a.latitude FROM card a '+
				'LEFT JOIN collect b ON a.cardid = b.cardid where b.userid = "'+ userid +'"';
		console.log('SelectSQL: '+ sql);
		conn.query(sql, function(err, rows){
			if(err)
				return callback(err);
			callback(err,rows)
		});
	});
};


//卡片查询，0.待交易卡查询 1.售出卡查询 2.购入卡查询 
//TODO 购入卡查询
User.queryMyCard = function(userid, type, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = '';
		if(type == 0)
			sql = 'SELECT a.cardid, a.title, a.pictures, a.describes, a.price, a.logistic, a.category, a.brand, '+
				'a.freight, a.exchange, a.owner, a.amount, a.time, a.longitude, a.latitude FROM card a  WHERE '+
				'status = 0 AND owner = "'+ userid +'"';
		else if(type == 1)
			sql = 'SELECT a.cardid, a.title, a.pictures, a.describes, a.price, a.logistic, a.category, a.brand, '+
				'a.freight, a.exchange, a.owner, a.amount, a.time, a.longitude, a.latitude FROM card a  WHERE '+
				'status = 1 AND owner = "'+ userid +'"';
		console.log('SelectSQL: '+ sql);
		conn.query(sql, function(err, rows){
			if(err)
				return callback(err);
			callback(err,rows)
		});
	});
};


//更新用户资料
User.updateUserInfo = function(userid, username, tel, gender, province, city, district, address, postcode, IDCardNo, files, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql0 = 'SELECT IDCardNo FROM user WHERE userid = "' + userid + '"';
		var sql1 = 'UPDATE user SET username  = "'+username+'", telephone = "'+tel+'", gender ='+gender+'  WHERE userid = "'+userid+'"';
		var sql2 = 'UPDATE address SET province  = "'+province+'", city = "'+city+'", district = "'+district+'",'+
					'address = "'+address+'", postcode = '+postcode+' WHERE userid = "'+userid+'"';
	
		console.log('SQL: '+ sql0);
		conn.query(sql0, function(err, rows){
			if(err)
				return callback(err);
			if(rows[0].IDCardNo != IDCardNo)
				return callback('身份证号码错误！'); 

			console.log('SQL: '+ sql1);
			conn.query(sql1, function(err, res){
				if(err)
					return callback(err);
				console.log('SQL: '+ sql2);
				conn.query(sql2, function(err,res){
					if(err)
						return callback(err);
					//更新图片
					var filePath = path.join(__dirname, '../public/imgs/user/') + userid;
					if(!fs.existsSync(filePath))
						callback('用户图片文件夹不存在')
					var pics = fs.readdirSync(filePath);		//遍历删除目录下所有文件
					pics.forEach(function(fileName){
						var tmpPath = filePath + '/' + fileName;
						fs.unlinkSync(tmpPath);
					});
					//保存新的用户图片,同时保存路径
					var tmpPath = '';
					for (var i in files.imgs ) {
						if(i>2) break;
						var file = files.imgs[i];
						if(file.originalFilename.length == 0)
							break;
						var types = file.originalFilename.split('.'); //将文件名以.分隔，取得数组最后一项作为文件后缀名。
					    fs.renameSync(file.path, filePath + '/' + i + '.' +String(types[types.length-1]));
					    tmpPath += 'imgs/user/' +userid+ '/' + i + '.' +String(types[types.length-1]) + ';';
					}
					var sql = 'UPDATE user SET portrait = "' + tmpPath + '" WHERE userid = "' + userid + '"';
					console.log("SQL:", sql);
					conn.query(sql, function(err, res){});
					callback(err)
				});
			});

		});
	});
};


/*
----------------------------------------我的卡圈 end --------------------------------------------
*/



module.exports = User;