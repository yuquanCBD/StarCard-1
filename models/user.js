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
			if(err)
				callback(err);

			console.log(rows);
			if (rows.length != 0) {
				var user = new User(rows[0]);
				conn.release();
				callback(err,user);
			}else
				callback(err, null);
        	conn.release();
		});
	});
}

//用户登录
User.login = function(username, device_token, callback){
	mysql.getConnection(function(err, conn){
		if (err) 
			callback(err);

		var sql = 'SELECT userid, username, password, score, device_token FROM user WHERE username = "' + username +'"';
		console.log(sql);
		conn.query(sql, function(err, rows){
			if(err)
				return callback(err);
			if(rows.length == 0)
				return callback('用户不存在')

			var sql = 'UPDATE user SET device_token = ? WHERE userid = ?';
			console.log(sql);
			conn.query(sql, [device_token, rows[0].userid], function(err, results){
        		conn.release();
        		callback(err, rows[0]);
			})

		})
	})
}


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
}
User.getDevice_token = function(callback){
	mysql.getConnection(function(err, conn){
		if(err){
			return callback(err);
		}
		var sql = "select device_token from user";
		conn.query(sql, function(err, rows){
			if(err){
				conn.release();
				return callback(err);
			}
			conn.release();
			return callback(err, rows);
		}) 
	})
}
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
					conn.release();
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
		if(err)
			return callback(err);

		conn.query(sql, function(err, res){
			conn.release();
			callback(err, res);
		})
	})
};
//根据用户id更新禁言状态
User.updateShutup = function(userid, shutup, callback){
	mysql.getConnection(function(err, conn){
		if(err){
			console.log("POOL: ==> " + err);
			return callback(err);
		}
		var sql = 'update user set shutup="'+ shutup +'" where userid="'+userid+'"';
		conn.query(sql, function(err, rows){
			if(err){
				return callback(err, null);
			}
			conn.release();
			return callback(err, rows);
		});
	});
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
			callback(err,rows[0]);
			conn.release();
		});
	});
};

//收藏卡片
User.addCardCollect = function(userid, cardid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);
		var sql = 'SELECT COUNT(1) AS has FROM collect WHERE userid = ? AND cardid = ?';

		console.log('SQL: '+ sql);
		conn.query(sql, [userid, cardid], function(err, rows){
			if(rows.length > 0 && rows[0].has > 0){
				conn.release();
				return callback('卡片收藏不能重复添加');
			}

			var sql = 'INSERT INTO collect(userid, cardid) VALUES(?, ?)';

			console.log('SQL: '+ sql);
			conn.query(sql, [userid, cardid], function(err, results){
				callback(err, results);
				conn.release();
			})
		})

	})
}

//取消收藏卡片
User.cancleCardCollect = function(userid, cardid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'DELETE FROM collect WHERE userid = ? AND cardid = ?';

		console.log('SQL: '+ sql);
		conn.query(sql, [userid, cardid], function(err, results){
			callback(err, results);
			conn.release();
		})

	})
}


//查询用户收藏的卡片
User.queryCollect = function(userid, offset, capacity, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'SELECT a.cardid, a.title, a.pictures, a.describes, a.price, a.logistic, a.category, a.brand, '+
				'a.freight, a.exchange, a.owner, a.amount, a.time, a.longitude, a.latitude FROM card a '+
				'LEFT JOIN collect b ON a.cardid = b.cardid where b.userid = "'+ userid +'"';

       	offset = parseInt(offset) * parseInt(capacity);
        sql += 'LIMIT ' + offset + ', ' + capacity;  //分页查询

		console.log('SelectSQL: '+ sql);
		conn.query(sql, function(err, rows){
			callback(err,rows);
			conn.release();
		});
	});
};


//卡片查询，0.待交易卡查询 1.售出卡查询 2.购入卡查询 
//TODO 购入卡查询
User.queryMyCard = function(userid, type, offset, capacity, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		
		var sql = '';
		if(parseInt(type) == 0)
			sql = 'SELECT a.cardid, a.title, a.pictures, a.describes, a.price, a.logistic, a.category, a.brand, '+
				'a.freight, a.exchange, a.owner, a.amount, a.time, a.longitude, a.latitude FROM card a  WHERE '+
				'status = 0 AND owner = "'+ userid +'"';
		else if(parseInt(type) == 1)
			sql = 'SELECT a.cardid, a.title, a.pictures, a.describes, a.price, a.logistic, a.category, a.brand, '+
				'a.freight, a.exchange, a.owner, a.amount, a.time, a.longitude, a.latitude FROM card a  WHERE '+
				'status = 1 AND owner = "'+ userid +'"';

		offset = parseInt(offset) * parseInt(capacity);
        sql += 'LIMIT ' + offset + ', ' + capacity;  //分页查询

		console.log('SelectSQL: '+ sql);
		conn.query(sql, function(err, rows){
			callback(err,rows)
			conn.release();
		});
	});
};


//更新用户资料
User.updateUserInfo = function(userid, username, tel, gender, addrid, IDCardNo, files, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);
		
		var sql0 = 'SELECT IDCardNo FROM user WHERE userid = "' + userid + '"';
		var sql1 = 'UPDATE user SET username  = "'+username+'", telephone = "'+tel+'", gender ='+gender+'  WHERE userid = "'+userid+'"';
		var sql2 = 'UPDATE address SET ';
	
		console.log('SQL: '+ sql0);
		conn.query(sql0, function(err, rows){
			if(err){
				conn.release();
				return callback(err);
			}
			if(rows[0].IDCardNo != IDCardNo)
				return callback('身份证号码错误！'); 

			console.log('SQL: '+ sql1);
			conn.query(sql1, function(err, res){
				if(err){
					conn.release();
					return callback(err);
				}

				//设置用户其他地址为普通地址 
				var sql = 'UPDATE address SET tag = 0 WHERE userid = ? AND tag = 1';
				console.log(sql);
				conn.query(sql, [userid], function(err,res){
					if(err){
						conn.release();
						return callback(err);
					}

					var sql = 'UPDATE address SET tag = 1 WHERE userid = ? AND addr_id = ?';
					console.log(sql);
					conn.query(sql, [userid, addrid], function(err,res){
						if(err){
							conn.release();
							return callback(err);
						}
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
						    tmpPath += 'imgs/user/' +userid+ '/' + i + '.' +String(types[types.length-1]);
						}
						var sql = 'UPDATE user SET portrait = "' + tmpPath + '" WHERE userid = "' + userid + '"';
						console.log("SQL:", sql);
						conn.query(sql, function(err, results){
							conn.release();
							callback(err);	
						})

					})

				})
			})

		})
	})
}




/*
----------------------------------------我的卡圈 end --------------------------------------------
*/

//userid、返回用户名字、购买和售出的卡片
User.queryTradeByUserid = function(userid, callback){
	mysql.getConnection(function(err, conn){

		var in_num, out_num, username;

		if(err)
			return callback(err);
		
		var sql = 'SELECT COUNT(*) AS in_num FROM orders GROUP BY buyer HAVING buyer = "' + userid + '"'; //查询买入卡片数量
		console.log("SQL:", sql);

		conn.query(sql, function(err, rows){
			if(err){
				conn.release()
				callback(err);
			}
			if(rows.length != 0)
				in_num = rows[0].in_num;
			else
				in_num = 0;
			var sql = 'SELECT COUNT(*) AS out_num FROM orders GROUP BY seller HAVING seller = "' + userid + '"'; //查询卖出卡片数量
			console.log("SQL:", sql);

			conn.query(sql, function(err, rows){
				if(err){
					conn.release();
					callback(err);
				}
				if(rows.length != 0)
					out_num = rows[0].out_num;
				else
					out_num = 0;

				var sql = 'SELECT username FROM user WHERE userid = "' + userid + '"'; // 查询用户名称
				console.log("SQL:", sql);

				conn.query(sql, function(err, rows){
					if(err){
						conn.release()
						callback(err);
					}
					username = rows[0].username;
					callback(err, in_num, out_num, username);
					conn.release()
				});
			});
		});
	});
};



User.findUserById = function(userid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'SELECT userid, username, email, create_time, telephone, IDCardNo, score, gender, portrait, sell_cnt, buy_cnt, identificated, shutup FROM user WHERE userid = ?';
		conn.query(sql, [userid], function(err, rows){
			conn.release();
			callback(err, rows[0]);
		});

	});
}


User.identification = function(userid, files, callback){
	//存储图片，得到图片的路径信息
    var filePath = path.join(__dirname, '../public/imgs/identification/');

    if(fs.existsSync(filePath + userid)){//如果存在文件夹，则删除
        var dirList = fs.readdirSync(filePath + userid);
        dirList.forEach(function(fileName){
          fs.unlinkSync(filePath+userid+'/'+fileName);
        });

    	fs.rmdirSync(filePath + userid);
    }

    //创建文件夹
    fs.mkdir(filePath + userid, function(err){
	    if(err)
      		return callback(err);

    	var str = '';
        for (var i  in files.imgs) {
	        if(i > 1) break; //最多2张
	        var file = files.imgs[i];
	        if(file.originalFilename.length == 0) break; //没有上传图片
	        
	        var types = file.originalFilename.split('.');
	        var p = "imgs/identification/"+userid+'/'+i+'.'+String(types[types.length-1]);
	        if(str === ""){
	          str += p;
	        }
	        else{
	          str += (','+p);
	        }
	        fs.renameSync(file.path, filePath+userid+'/'+i+'.'+String(types[types.length-1]));
    	}//for end
    	console.log('身份证照片上传成功');

		mysql.getConnection(function(err, conn){
			if(err)
				return callback(err);

			var sql = 'UPDATE user SET identificated = 1 WHERE userid = ?';
			console.log(sql, userid);
			conn.query(sql, [userid], function(err, results){
				conn.release();
				callback(err, results);
			});

		})//sql end

    })

}


//收藏wiki查询
User.queryWikiCollect = function(userid, offset, capacity, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'SELECT a.wikiid, a.wikiname, a.english_name, a.category, a.manufacturer, a.series, a.serial_number, a.rarity,'
				+'a.describes, a.price, a.contributor, a.picture, a.brand, a.islock FROM wiki a '
				+'LEFT JOIN wiki_collect b ON a.wikiid = b.wikiid where b.userid = ? ';

       	offset = parseInt(offset) * parseInt(capacity);
        sql += 'LIMIT ' + offset + ', ' + capacity;  //分页查询

		console.log('SQL: '+ sql);
		conn.query(sql, [userid], function(err, rows){
			callback(err,rows);
			conn.release();
		})
	})
}


//收藏wiki
User.addWikiCollect = function(userid, wikiid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'SELECT COUNT(1) AS has FROM wiki_collect WHERE userid = ? AND wikiid = ?';
		console.log('SQL: '+ sql);
		conn.query(sql, [userid, wikiid], function(err, rows){
			if(rows.length != 0 && rows[0].has > 0){
				conn.release();
				callback('收藏失败，不能重复收藏');
				return;
			}

			var sql = 'INSERT INTO wiki_collect(userid, wikiid) VALUES(?, ?)';

			console.log('SQL: '+ sql);
			conn.query(sql, [userid, wikiid], function(err, results){
				callback(err, results);
				conn.release();
			})

		})


	})
}

//取消百科收藏
User.cancleWikiCollect = function(userid, wikiid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		var sql = 'DELETE FROM wiki_collect WHERE userid = ? AND wikiid = ?';

		console.log('SQL: '+ sql);
		conn.query(sql, [userid, wikiid], function(err, results){
			callback(err, results);
			conn.release();
		})
	})
}

module.exports = User;








