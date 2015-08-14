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
};
Card.add = function(sql, callback){
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
Card.query = function(callback){
	mysql.getConnection(function(err, conn){
		if (err) 
			callback(err);

		var sql = 'SELECT cardid, title, describes, price, logistic, category, brand, freight, exchange, owner, amount,pictures FROM card ';
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
			callback(err, rows[0]);
			conn.release();
		});
	});
};


//首页模块所需接口
Card.searchByCond = function(cond, category, brand, offset, capacity, order, longitude, latitude, callback){
	mysql.getConnection(function(err, conn){
		if (err) 
			callback(err);

        var flag1 = false;
        var flag2 = false;

		var sql = 'SELECT cardid, title, pictures, describes, price, logistic, category, brand, freight, exchange, owner, amount, time, longitude, latitude FROM card ';
        if (cond) {
            sql += ' WHERE (title = "'+ cond +'" OR brand = "'+cond+'") ';
            flag1 = true;
        }
        if (brand) {
            if (flag1)
                sql += 'AND brand = "' + brand + '" ';
            else
                sql += 'WHERE brand = "' + brand + '" ';
            flag2 = true;
        }
        if (category) {
            if (flag1 && !flag2) 
                sql += 'AND category = "' + category + '" ';
            else if (flag1 && flag2)
                sql += 'AND category = "' + category + '" ';
            else if (!flag1 && flag2)
                sql += 'AND category = "' + category + '" ';
            else 
                sql += 'WHERE category = "' + category + '" ';
        }

        if(order == 1)
        	sql += ' order by time ';

        offset = parseInt(offset) * parseInt(capacity);
        sql += 'LIMIT ' + offset + ', ' + capacity;  //分页查询


		console.log('querySQL: '+ sql);
		conn.query(sql, function(err, rows){
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
			console.log(rows)
			callback(err, rows);
			conn.release();
		});
	});
};


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


Card.searchCardsByOwner = function(owner, callback){
    mysql.getConnection(function(err, conn){
        if (err) 
            callback(err);

		var sql = 'SELECT cardid, title, pictures, describes, price, logistic, category, brand, freight, exchange, owner, amount, time, longitude, latitude FROM card WHERE owner = "' +owner+'"';

        console.log('searchCardsByOwner_SQL: '+ sql);
        conn.query(sql, function(err, rows){
            callback(err, rows);
            conn.release();
        });
    });
};

module.exports = Card;









