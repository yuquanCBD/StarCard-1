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

		var sql = 'SELECT cardid, title, describes, price, logistic, category, brand, freight, exchange, owner, amount FROM card ';
		console.log('querySQL: '+ sql);
		conn.query(sql, function(err, rows){
			if (err) 
				callback(err);
			callback(err, rows);
		});
	});
};

Card.update = function(card, callback){
	mysql.getConnection(function(err, conn){
		if (err) 
			callback(err);

		var sql = 'UPDATE card SET title="'+ card.title +'", describes="'+card.describes+'", price="'+card.price+'", logistic="'+card.logistic
		+'", category="'+card.category+'", brand="'+card.brand+'", freight="'+card.freight+'", exchange="'+card.exchange
		+'",amount="'+card.amount+'" WHERE cardid = "'+card.cardid+'"';
		console.log('updateSQL: '+ sql);
		conn.query(sql, function(err, res){
			if (err) 
				callback(err);
			console.log("update result: "+res);
			callback(err, res);
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
		});
	});
};

Card.queryByID = function(cardid, callback){
		mysql.getConnection(function(err, conn){
		if (err) 
			callback(err);

		var sql = 'SELECT cardid, title, describes, price, logistic, category, brand, freight, exchange, owner, amount FROM card WHERE cardid = "' +cardid+ '"';
		console.log('querySQL: '+ sql);
		conn.query(sql, function(err, rows){
			if (err) 
				callback(err);
			callback(err, rows[0]);
		});
	});
};



module.exports = Card;









