var mysql = require('./mysql');

function Card(card){
	this.cardid = card.cardid;
	this.title = card.title;
	this.describe = card.describe;
	this.price = card.price;
	this.logistic = card.logistic;
	this.category = card.category;
	this.brand = card.brand;
	this.freight = card.freight;
	this.exchange = card.exchange;
	this.owner = card.owner;
	this.amount = card.amount;
}

Card.get = function(){

};

Card.prototype.save = function(callback){
	var card = {
		cardid : this.cardid,
		title : this.title, 
		describe : this.describe,
		price : this.price,
		logistic : this.logistic,
		category : this.category,
		brand : this.brand,
		freight : this.freight,
		exchange : this.exchange,
		owner : this.owner,
		amount : this.amount
	};


	mysql.getConnection(function(err, conn){
		if (err) {
			console.log("POOL ==> " + err);
			callback(err);
		};

		var sql = 'insert into card(cardid, title, describes, price, logistic, category, brand, freight, exchange, owner, amount) values("'+
		 card.cardid +'","'+ card.title + '","'+ card.describe + '",'+ card.price +',"'+ card.logistic +'","'+ 
		 card.category+'","'+ card.brand +'",'+ card.freight +','+ card.exchange +',"'+ card.owner +'",'+ card.amount +')';

		console.log('SaveSQL: '+ sql);
		conn.query(sql, function(err, res){
			if(err){
				console.log(err);
				callback(err);
			}
			console.log("Card save ==> ");
        	console.log(res);
        	conn.release();
        	callback(err,res);
		});
	});
}

Card.add = function(sql, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			callback(err);

		conn.query(sql, function(err, res){
			conn.release();
			callback(err, res);
		})
	})
}

Card.query = function(callback){
	mysql.getConnection(function(err, conn){
		if (err) 
			callback(err);

		var sql = 'SELECT cardid, title, describes, price, logistic, category, brand, freight, exchange, owner, amount, pictures,time FROM card order by time DESC';
		console.log('querySQL: '+ sql);
		conn.query(sql, function(err, rows){
			if (err) 
				callback(err);
			callback(err, rows);
			conn.release();
		});
	});
};

Card.update = function(sql, callback){
	mysql.getConnection(function(err, conn){
		if (err) 
			callback(err);
		console.log('updateSQL: '+ sql);
		conn.query(sql, function(err, res){
			if (err) 
				callback(err);
			console.log("update result: "+res);
			callback(err, res);
			conn.release();
		});
	});
};

Card.delete = function(cardid, callback){
	mysql.getConnection(function(err, conn){
		if (err) 
			callback(err);

		var sql = 'DELETE FROM card WHERE cardid = "'+cardid+'"';
		console.log('deleteSQL: '+ sql);
		conn.query(sql, function(err, res){
			if (err) 
				callback(err);
			console.log("delete result: "+res);
			callback(err, res);
			conn.release();
		});
	});
};

Card.queryByID = function(cardid, callback){
		mysql.getConnection(function(err, conn){
		if (err) 
			callback(err);

		var sql = 'SELECT cardid, title, pictures, describes, price, logistic, category, brand, freight, exchange, owner, amount, time, longitude, latitude  FROM card WHERE cardid = "' +cardid+ '"';
		console.log('querySQL: '+ sql);
		conn.query(sql, function(err, rows){
			if (err) 
				callback(err);
			callback(err, rows);
			conn.release();
		});
	});
};


//首页模块所需接口
Card.searchByCond = function(userid, cond, category, brand, offset, capacity, order, longitude, latitude, callback){
	mysql.getConnection(function(err, conn){
		if (err) 
			callback(err);


		var sql = 'SELECT cardid, title, pictures, describes, price, logistic, category, brand, freight, exchange, owner, ownername, amount, time, longitude, latitude, main_img, is_official FROM card  WHERE status = 0 ';
        if (cond) 
            sql += ' AND (title like "%'+ cond +'%" OR brand like "%'+cond+'%") ';

        if (brand) 
                sql += 'AND brand like "%' + brand + '%" ';

        if (category) 
                sql += 'AND category like "%' + category + '%" ';


        if(order == 1 || order == 2)
        	sql += ' order by time DESC ';//默认按发布时间排序
        else if(order == 4)
        	sql += ' order by price ';//按价格price排序

        offset = parseInt(offset) * parseInt(capacity);
        sql += 'LIMIT ' + offset + ', ' + capacity;  //分页查询


		console.log('querySQL: '+ sql);
		conn.query(sql, function(err, rows){
			if(err){
				conn.release();
				return callback(err);
			}
			if (order == 3) {//根据经纬度排序
				rows.sort(function(a, b){
					var d1 = GetDistance(latitude, longitude, a.latitude, a.longitude);
					var d2 = GetDistance(latitude, longitude, b.latitude, b.longitude);
					return d1 > d2 ? 1 : -1;
				});
			}

			for (var i in rows) {
				rows[i].dis = GetDistance(latitude, longitude, rows[i].latitude, rows[i].longitude);
			}

			//查询用户用户收藏列表
			var sql = 'SELECT cardid FROM collect WHERE userid = ?';
			console.log(sql, userid);
			conn.query(sql, [userid], function(err, cards){
				if(err)
					return callback(err);
				for(var x in rows){//遍历card表，如果已收藏，则收藏标记位置为1
					rows[x].is_collect = 0;
					for(var y in cards){
						if(rows[x].cardid == cards[y].cardid){
							rows[x].is_collect = 1;//1为已标记
							break;
						}
					}
				}

				conn.release();
				callback(err, rows);
			})

		})
	})
}


function rad(d){
	return d * Math.PI / 180.0;
}
//
function GetDistance( lat1,  lng1,  lat2,  lng2){
	if( ( Math.abs( lat1 ) > 90  ) ||(  Math.abs( lat2 ) > 90 ) || ( Math.abs( lng1 ) > 180  ) ||(  Math.abs( lng2 ) > 180 ) )
		return;
	var radLat1 = rad(lat1);
	var radLat2 = rad(lat2);
	var a = radLat1 - radLat2;
	var  b = rad(lng1) - rad(lng2);
	var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
	Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
	s = s *6378.137 ;// EARTH_RADIUS;
	s = Math.round(s * 10000) / 10000;
	return s;
}


//卖家的所有待交易卡
Card.searchCardsByOwner = function(owner, callback){
    mysql.getConnection(function(err, conn){
        if (err) 
            callback(err);
        var sql = 'SELECT cardid, title, pictures, describes, price, logistic, category, brand, freight, exchange, owner, amount, '+
		'time, longitude, latitude, user.username FROM card LEFT JOIN user ON owner = user.userid WHERE user.userid = ? ORDER BY time DESC';

        console.log(sql);
        conn.query(sql, [owner],function(err, rows){
            callback(err, rows);
            conn.release();
        });
    })
}


module.exports = Card;









