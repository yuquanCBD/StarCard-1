var mysql = require('./mysql');
var uuid = require('node-uuid');


function Order(){};

//确认订单，待付款
Order.checkOrder = function(cardid, cardnum, seller, buyer, card_price, logistic_price, addr_id, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var orderid = uuid.v1();
		var sql1 = 'INSERT INTO orders (orderid, cardid, card_num, seller, buyer, status, card_price, logistic_price, addr_id) '+
				'VALUES("'+orderid+'", "'+cardid+'", '+cardnum+', "'+seller+'", "'+buyer+'", 0,'+card_price+' ,'+logistic_price+' ,'+addr_id+' )';

		var sql2 = 'UPDATE card SET status = -1 WHERE cardid = "' + cardid + '"';

		console.log('Order_Add_SQL: '+ sql1);
		conn.query(sql1, function(err, results){
			if(err)
				return callback(err);

			console.log('UPDATE_card_SQL: '+ sql2);
			conn.query(sql2, function(err, results){
				callback(err, orderid);
				conn.release();
			});
        });

	});
};

//订单付款，待发货
Order.payOrder = function(orderid, alipay_id, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'UPDATE orders SET status = 1, alipay_id = "'+alipay_id+'" WHERE orderid = "' + orderid + '"';

		console.log('payOrder_SQL: '+ sql);
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);
			callback(err, results);
			conn.release();
        });

	});
};

//订单发货，待收货
Order.deliverOrder = function(orderid, logistic, logistic_no, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var date = new Date();
		date.setDate(date.getDate() + 7); //默认设置7天后自动收货

		var sql = 'UPDATE orders SET status = 2, logistic = "'+logistic+'",  logistic_no = "'+logistic_no+'", receive_time = '+date.getTime()+' WHERE orderid = "' + orderid + '"';

		console.log('deliverOrder_SQL: '+ sql);
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);
			callback(err, results);
			conn.release();
        });

	});
};

//订单收获， 交易成功
Order.receiveOrder = function(orderid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'UPDATE orders SET status = 3 WHERE orderid = "' + orderid + '"'; //设置收货成功

		console.log('receiveOrder_SQL: '+ sql);
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);
			callback(err, results);
			conn.release();
        });

	});
};

//延长收货
Order.prolongOrder = function(orderid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var date = new Date();
		date.setDate(date.getDate() + 7); //默认延长7天

		var sql = 'UPDATE orders SET receive_time = '+date.getTime()+' WHERE orderid = "' + orderid + '"'; //设置收货成功

		console.log('prolongOrder_SQL: '+ sql);
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);
			callback(err, results);
			conn.release();
        });

	});
};

//取消订单
Order.cancleOrder = function(orderid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'UPDATE orders SET status = -1 WHERE orderid = "' + orderid + '"'; 

		console.log('cancleOrder_SQL: '+ sql);
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);
			callback(err, results);
			conn.release();
        });
	});
};

Order.queryOrderList = function(userid, tag, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'SELECT orderid, cardid, seller, buyer, logistic, logistic_no, status, card_price, logistic_price, addr_id, card_num, alipay_id, receive_time FROM orders WHERE buyer = "'+userid+'" AND status = ' + tag; 

		console.log('SQL: '+ sql);
		conn.query(sql, function(err, rows){
			if(err)
				return callback(err);
			callback(err, rows);
			conn.release();
        });
	});
};


module.exports = Order;