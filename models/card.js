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

function GenerateCardID(){

	return ;
}

module.exports = Card;