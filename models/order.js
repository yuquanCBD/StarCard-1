var mysql = require('./mysql');
var uuid = require('node-uuid');
var Message = require('./message')
var queue = require('../struct/queue');
var pay 		= require('../pingpp/pay'); //ping＋＋支付接口



function Order(){}

function Order(orderid, receive_time){
	this.orderid = orderid;
	this.receive_time = receive_time;
}


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
				//生成卖家的一条消息 
				Message.insertNewMsg(seller, orderid, 2, function(err, results){});
			});
        });

	});
};

//订单付款，待发货
Order.payOrder = function(orderid, amount, client_ip, callback){
	/* ping＋＋支付 */
	pay.pingpp.charges.create({
	      subject: "starcard trade",
	      body: "starcard trade pay",
	      amount: amount,
	      order_no: orderid,
	      channel: pay.CHANNEL,
	      currency: "cny",
	      client_ip: client_ip,
	      app: {id: pay.APP_ID}
	  }, function(err, charge) {
	      console.log(err, charge);
	      callback(err, charge);
	});

}

Order.payOrderSuccess = function(orderid, transaction_no, callback){
	var sql = 'UPDATE orders SET status = 1, alipay_id = "'+transaction_no+'" WHERE orderid = "' + orderid + '"';

	console.log('payOrder_SQL: '+ sql);
	conn.query(sql, function(err, results){
		if(err)
			return callback(err);

		callback(err, results);

		var sql = 'SELECT seller FROM orders WHERE orderid = ?';//根据订单号查询卖家的userid
		conn.query(sql, [orderid], function(err, rows){
			conn.release();
			var seller = rows[0].seller;
			//生成卖家的一条消息 
			Message.insertNewMsg(seller, orderid, 2, function(err, results){});
		});

    });
}

//订单发货，待收货
Order.deliverOrder = function(orderid, logistic, logistic_no, logistic_code, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var date = new Date();
		date.setDate(date.getDate() + 7); //默认设置7天后自动收货
		var receive_time = date.getTime()/60000; //收货时间点精确到分钟

		var sql = 'UPDATE orders SET status = 2, logistic = "'+logistic+'",  logistic_no = "'+logistic_no+'", receive_time = '+receive_time+', logistic_code = '+ logistic_code +' WHERE orderid = "' + orderid + '"';

		console.log('deliverOrder_SQL: '+ sql);
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);

			queue.push(new Order(orderid, receive_time));//向自动收货队列中插入一条数据

			callback(err, results);

			var sql = 'SELECT buyer FROM orders WHERE orderid = ?';//根据订单号查询买家的userid
			conn.query(sql, [orderid], function(err, rows){
				conn.release();
				var buyer = rows[0].buyer;
				//生成买家的一条消息 
				Message.insertNewMsg(buyer, orderid, 2, function(err, results){});
			});

        });

	});
};

//订单收货， 交易成功
Order.receiveOrder = function(orderid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'UPDATE orders SET status = 3 WHERE orderid = "' + orderid + '"'; //设置收货成功

		console.log('receiveOrder_SQL: '+ sql);
		conn.query(sql, function(err, results){
			callback(err, results);

			queue.pops(orderid);//从自动收货队列中删除元素
			//生成消息
			var sql = 'SELECT seller FROM orders WHERE orderid = ?';//根据订单号查询买家的userid
			conn.query(sql, [orderid], function(err, rows){
				conn.release();
				if(rows.length ==0) return;
				var seller = rows[0].seller;
				//生成买家的一条消息 
				Message.insertNewMsg(seller, orderid, 2, function(err, results){});
			});
			
        });

	});
};

//延长收货
Order.prolongOrder = function(orderid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var date = new Date();
		date.setDate(date.getDate() + 7); //默认从当前时间点延长7天
		var receive_time = date.getTime()/60000; //收货时间点精确到分钟

		var sql = 'UPDATE orders SET receive_time = ' + receive_time + ' WHERE orderid = "' + orderid + '"'; //设置收货成功

		console.log('prolongOrder_SQL: '+ sql);
		conn.query(sql, function(err, results){
			callback(err, results);
			
			queue.refresh(new Order(orderid, receive_time)); //更新自动收货队列
			var sql = 'SELECT seller FROM orders WHERE orderid = ?';//根据订单号查询买家的userid
			conn.query(sql, [orderid], function(err, rows){
				conn.release();
				var seller = rows[0].seller;
				//生成买家的一条消息 
				Message.insertNewMsg(seller, orderid, 2, function(err, results){});
			});

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
			callback(err, results);
			
			var sql = 'SELECT seller FROM orders WHERE orderid = ?';//根据订单号查询买家的userid
			conn.query(sql, [orderid], function(err, rows){
				conn.release();
				var seller = rows[0].seller;
				//生成买家的一条消息 
				Message.insertNewMsg(seller, orderid, 2, function(err, results){});
			});
			
        });
	});
};

Order.queryOrderList = function(userid, tag, usertype,callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = '';
		if(usertype == 1)
			sql = 'SELECT orderid, cardid, seller, buyer, logistic, logistic_no, status, card_price, logistic_price, addr_id, card_num, alipay_id, receive_time FROM orders WHERE buyer = "'+userid+'" AND status = ' + tag; 
		else
			sql = 'SELECT orderid, cardid, seller, buyer, logistic, logistic_no, status, card_price, logistic_price, addr_id, card_num, alipay_id, receive_time FROM orders WHERE seller = "'+userid+'" AND status = ' + tag; 
		console.log('SQL: '+ sql);
		conn.query(sql, function(err, rows){
			if(err)
				return callback(err);
			callback(err, rows);
			conn.release();
        });
	});
};
Order.exec = function(sql, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		conn.query(sql, function(err, rows){
			if(err)
				return callback(err);
			callback(err,rows);
			conn.release();
		});
	});
} //exec


module.exports = Order;