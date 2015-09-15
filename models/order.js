var mysql = require('./mysql');
var uuid = require('node-uuid');
var Message = require('./message')
var queue = require('../struct/queue');
var async = require('async');
var pay 		= require('../pingpp/pay'); //ping＋＋支付接口
var getui = require('../getui/getui');
var crypto = require('crypto');

var API_KEY = "sk_test_aHSGK00yjnf18Kmn5GePmrH4" // 这里填入你的 Test/Live Key
var APP_ID = "app_TaHCa5ybnbHSXH44" // 这里填入你的应用 ID
var CHANNEL = 'alipay'; // 选择渠道
var pingpp = require('pingpp')(API_KEY);

var BUYER_TAG = -1;
var SELLER_TAG = 1;


function Order(){}

function Order(orderid, seller, buyer, receive_time){
	this.orderid = orderid;
	this.seller = seller;
	this.buyer = buyer;
	this.receive_time = receive_time;
}


//确认订单，待付款
Order.checkOrder = function(cardid, cardnum, seller, buyer, card_price, logistic_price, addr_id, card_pic, card_name, card_desc, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = 'SELECT amount FROM card WHERE cardid = ?';//查询卡片数量
		console.log(sql, cardid);
		conn.query(sql, [cardid], function(err, rows){
			if(err){
				conn.release();
				return callback(err);
			}

			if(rows.length == 0){
				conn.release();
				return callback('卡片数量不明');
			}
			var amount = rows[0].amount;//卡片数量
			if(amount < cardnum){
				conn.release();
				return callback('商品数量不足');
			}

			var sql = '';
			if(amount == cardnum)//修改卡片数量，如果下单卡片数量等于现有数量，则将卡片状态置为－1（交易中）
				sql = 'UPDATE card SET status = -1 , amount = 0 WHERE cardid = "' + cardid + '"';
			else
				sql = 'UPDATE card SET amount = '+(amount - cardnum)+' WHERE cardid = "' + cardid + '"';

			console.log(sql);
			conn.query(sql, function(err, results){
				if(err){
					conn.release();
					return callback(err);
				}
				//通过addr_id查询地址信息插入到orders表
				var sql = 'SELECT province, city, district, address, postcode, telephone, consignee FROM address WHERE addr_id = ?';
				conn.query(sql, [addr_id], function(err, rows){
					if(err){
						conn.release();
						return callback(err);
					}
					if(rows.length == 0){
						conn.release();
						return callback('地址id错误');
					}
					var province = rows[0].province;
					var city = rows[0].city;
					var district = rows[0].district;
					var address = rows[0].address;
					var postcode = rows[0].postcode;
					var telephone = rows[0].telephone;
					var consignee =rows[0].consignee;

					/*insert into orders*/
					var orderid = crypto.randomBytes(12).toString('hex');//生成24位orderid
					var sql = 'INSERT INTO orders (orderid, cardid, card_num, seller, buyer, card_price, logistic_price, addr_id, card_pic, card_name, card_desc, province, city, district, address, postcode, telephone, consignee) '+
					'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';//下单sql
					console.log(sql);
					conn.query(sql, [orderid, cardid, cardnum, seller, buyer, card_price, logistic_price, addr_id, card_pic, card_name, card_desc, province, city, district, address, postcode, telephone, consignee], function(err, results){
						if(err){
							conn.release();
							return callback(err);
						}
						
						callback(err, orderid);

						//生成卖家的一条消息 
						Message.insertOrderMsg(seller, orderid, 2, card_name, card_desc, card_pic, cardid, SELLER_TAG, 0, function(err, results){});

						/*个推消息*/
						var sql = 'SELECT device_token FROM user WHERE userid = ?';
						conn.query(sql, [seller], function(err, rows){
							conn.release();
							if(rows.length == 0)
								return;
							var device_token = rows[0].device_token;
							getui.push('交易消息', '您发布的卡片已有人购买', device_token);
						})
						/*个推消息*/

					})
					/*insert into orders*/	

				})	
				
			})

		})

	})//end mysql
}

//订单付款，待发货
Order.payOrder = function(orderid, amount, client_ip, callback){
	amount = parseInt(amount * 100);
	/* ping＋＋支付 */
	pingpp.charges.create({
	      subject: "starcard trade",
	      body: "starcard trade pay",
	      amount: amount,
	      order_no: orderid,
	      channel: CHANNEL,
	      currency: "cny",
	      client_ip: client_ip,
	      app: {id: APP_ID}
	  }, function(err, charge) {
	      console.log(err, charge);
	      callback(err, charge);
	});

}

Order.payOrderSuccess = function(orderid, transaction_no, charge_id, callback){
	console.log('------------------ Order.payOrderSuccess');
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'UPDATE orders SET status = 1, alipay_id = ?, charge_id = ? WHERE orderid = "' + orderid + '"';

		console.log(sql);
		conn.query(sql, [transaction_no, charge_id], function(err, results){
			if(err){
				conn.release();
				return callback(err);
			}
				
			callback(err, results);

			var sql = 'SELECT seller, card_name, card_desc, card_pic, cardid FROM orders WHERE orderid = ?';//根据订单号查询卖家的userid
			conn.query(sql, [orderid], function(err, rows){

				if(rows.length == 0) return;

				var seller = rows[0].seller;
				var card_name = rows[0].card_name;
				var card_desc = rows[0].card_desc;
				var card_pic = rows[0].card_pic;
				var cardid = rows[0].cardid;
				//生成卖家的一条消息 
				Message.insertOrderMsg(seller, orderid, 2, card_name, card_desc, card_pic, cardid, SELLER_TAG, 1, function(err, results){if(err) console.log(err)});

				/*个推消息*/
				var sql = 'SELECT device_token FROM user WHERE userid = ?';
				conn.query(sql, [seller], function(err, rows){
					conn.release();
					if(rows.length == 0)
						return;
					var device_token = rows[0].device_token;
					getui.push('交易消息', '您发布的卡片已有人付款', device_token);
				})
				/*个推消息*/
			})

	    })

	})
}

//订单发货，待收货
Order.deliverOrder = function(orderid, logistic, logistic_no, logistic_code, callback){
	mysql.getConnection(function(err, conn){
		if(err){
			conn.release();
			return callback(err);
		}
			
		var date = new Date();
		date.setDate(date.getDate() + 7); //默认设置7天后自动收货
		var receive_time = date.getTime()/60000; //收货时间点精确到分钟

		var sql = 'UPDATE orders SET status = 2, logistic = "'+logistic+'",  logistic_no = "'+logistic_no+'", receive_time = '+receive_time+', logistic_code = "'+ logistic_code +'" WHERE orderid = "' + orderid + '"';

		console.log('deliverOrder_SQL: '+ sql);
		conn.query(sql, function(err, results){
			if(err){
				conn.release();
				return callback(err);
			}
				

			callback(err, results);//回调返回


			var sql = 'SELECT seller, buyer, card_name, card_desc, card_pic, cardid FROM orders WHERE orderid = ?';//根据订单号查询买家的userid
			conn.query(sql, [orderid], function(err, rows){
				if(rows.length == 0) return;

				var seller = rows[0].seller;
				var buyer = rows[0].buyer;
				var card_name = rows[0].card_name;
				var card_desc = rows[0].card_desc;
				var card_pic = rows[0].card_pic;
				var cardid = rows[0].cardid;
				//生成卖家的一条消息 
				Message.insertOrderMsg(buyer, orderid, 2, card_name, card_desc, card_pic, cardid, BUYER_TAG, 2, function(err, results){if(err) console.log(err);});

				queue.push(new Order(orderid, seller, buyer, receive_time));//向自动收货队列中插入一条数据


				/*个推消息*/
				var sql = 'SELECT device_token FROM user WHERE userid = ?';
				conn.query(sql, [buyer], function(err, rows){
					conn.release();
					if(rows.length == 0)
						return;
					var device_token = rows[0].device_token;
					getui.push('交易消息', '您购买的卡片卖家已经发货', device_token);
				})
				/*个推消息*/

			});

        });

	});
};

//订单收货， 交易成功
Order.receiveOrder = function(orderid, seller, buyer, callback){
/*
	mysql.getConnection(function(err, conn){//更新card status为1，交易成功
		if(err)
			return callback(err);

		var sql = 'SELECT cardid FROM orders WHERE orderid = ?';
		console.log(sql);
		conn.query(sql, [orderid], function(err, rows){
			if(err)
				return callback(err);
			if(rows.length == 0) return;

			var cardid = rows[0].cardid;
			var sql = 'UPDATE card SET status = 1 WHERE cardid = ?';
			conn.query(sql, [cardid], function(err, results){
				conn.release();
				if(err)
					return callback(err);
			})

		})

	})

*/
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'UPDATE orders SET status = 3 WHERE orderid = "' + orderid + '"'; //设置收货成功

		console.log('receiveOrder_SQL: '+ sql);
		conn.query(sql, function(err, results){
			if(err)
				return callback(err);

			//更新卖家信息
			var sql = 'UPDATE user SET sell_cnt = sell_cnt + 1 WHERE userid = ?';
			conn.query(sql, [seller], function(err, results){
				if(err)
					return callback(err);
				//更新买家信息
				var sql = 'UPDATE user SET buy_cnt = buy_cnt + 1 WHERE userid = ?';
				conn.query(sql, [buyer], function(err, results){
					if(err)
						return callback(err);
					callback(err, results);
					queue.pops(orderid);//从自动收货队列中删除元素

					//生成对买家和卖家的消息
					var sql = 'SELECT card_name, card_desc, card_pic, cardid FROM orders WHERE orderid = ?';//根据订单号查询买家的userid
					conn.query(sql, [orderid], function(err, rows){

						if(rows.length == 0) return;

						var card_name = rows[0].card_name;
						var card_desc = rows[0].card_desc;
						var card_pic = rows[0].card_pic;
						var cardid = rows[0].cardid;
						//生成对买家和卖家的消息
						Message.insertOrderMsg(buyer, orderid, 2, card_name, card_desc, card_pic, cardid, BUYER_TAG, 3, function(err, results){if(err) console.log(err);});
						Message.insertOrderMsg(seller, orderid, 2, card_name, card_desc, card_pic, cardid, SELLER_TAG, 3, function(err, results){if(err) console.log(err);});
						
						/*个推消息*/
						var sql = 'SELECT device_token FROM user WHERE userid = ?';
						conn.query(sql, [seller], function(err, rows){
							conn.release();
							if(rows.length == 0) return;
							var device_token = rows[0].device_token;
							getui.push('交易消息', '您发货的商品已由买家收货', device_token);
						})
						/*个推消息*/

					})

				})
			})
			
        })

	})
}

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
			

			var sql = 'SELECT seller, buyer, card_name, card_desc, card_pic, cardid FROM orders WHERE orderid = ?';
			conn.query(sql, [orderid], function(err, rows){

				if(rows.length == 0) return;

				var seller = rows[0].seller;
				var buyer = rows[0].buyer;
				var card_name = rows[0].card_name;
				var card_desc = rows[0].card_desc;
				var card_pic = rows[0].card_pic;
				var cardid = rows[0].cardid;

				//生成卖家的一条消息 
				Message.insertOrderMsg(seller, orderid, 2, card_name, card_desc, card_pic, cardid, SELLER_TAG, 2, function(err, results){if(err) console.log(err);});
			
				queue.refresh(new Order(orderid, seller, buyer, receive_time)); //更新自动收货队列
				/*个推消息*/
				var sql = 'SELECT device_token FROM user WHERE userid = ?';
				conn.query(sql, [seller], function(err, rows){
					conn.release();
					if(rows.length == 0)
						return;
					var device_token = rows[0].device_token;
					getui.push('交易消息', '买家延长了收货时间', device_token);
				})
				/*个推消息*/


			});

        });

	});
};

//取消订单
Order.cancleOrder = function(orderid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'SELECT cardid, card_num FROM orders WHERE orderid = ?';//查询订单卡片数量
		conn.query(sql, [orderid], function(err, rows){
			if(err){
				conn.release();
				return callback(err);
			}
			if(rows.length == 0){
				conn.release();
				return callback('订单信息为空');
			}
			var cardid = rows[0].cardid;
			var card_num = rows[0].card_num;

			var sql = 'UPDATE card SET status = 0, amount = amount + ? WHERE cardid = ?';//修改卡片状态为0（待出售），卡片数量为原有卡片数量加上订单的卡片数量
			conn.query(sql, [card_num, cardid], function(err, results){
				if(err){
					conn.release();
					return callback(err);
				}

				var sql = 'UPDATE orders SET status = -1 WHERE orderid = ?'; //修改订单状态为关闭
				conn.query(sql, [orderid], function(err, results){
					if(err){
						conn.release();
						return callback(err);
					}

					callback(err, results);//回调返回

					var sql = 'SELECT seller, card_name, card_desc, card_pic, cardid FROM orders WHERE orderid = ?';//根据订单号查询卖家的userid
					conn.query(sql, [orderid], function(err, rows){
					
						if(rows.length == 0) return;

						var seller = rows[0].seller;
						var card_name = rows[0].card_name;
						var card_desc = rows[0].card_desc;
						var card_pic = rows[0].card_pic;
						var cardid = rows[0].cardid;
						//生成卖家的一条消息 
						Message.insertOrderMsg(seller, orderid, 2, card_name, card_desc, card_pic, cardid, SELLER_TAG, -1, function(err, results){if(err) console.log(err);});

						/*个推消息*/
						var sql = 'SELECT device_token FROM user WHERE userid = ?';
						conn.query(sql, [seller], function(err, rows){
							conn.release();
							if(rows.length == 0)
								return;
							var device_token = rows[0].device_token;
							getui.push('交易消息', '买家取消了订单', device_token);
						})
						/*个推消息*/

					})


				})
			})

		})

	})//end mysql
}


//update,更新备注信息
Order.updateExtra = function(orderid, extra, callback){
	var sql = 'update orders set extra ="'+extra+'" where orderid="'+orderid+'"';
	mysql.getConnection(function(err, conn){
		if(err){
			conn.release();
			return callback(err);
		}
			
		conn.query(sql, function(err, results){
			conn.release();
			if(err){
				return callback(err);
			}
			return callback(err, results);
		})
	})
}

//查询订单列表
Order.queryOrderList = function(userid, tag, usertype,callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);
		var sql = '';
		if(usertype == 1)
			sql = 'SELECT orderid, cardid, seller, buyer, logistic, logistic_no, logistic_code, status, card_price, logistic_price, addr_id, card_num, alipay_id, receive_time,  card_pic, card_name, card_desc, create_time, province, city, district, address, postcode, telephone, consignee FROM orders WHERE buyer = "'+userid+'" AND status = ' + tag; 

		else
			sql = 'SELECT orderid, cardid, seller, buyer, logistic, logistic_no, logistic_code, status, card_price, logistic_price, addr_id, card_num, alipay_id, receive_time, card_pic, card_name, card_desc , create_time, province, city, district, address, postcode, telephone, consignee FROM orders WHERE seller = "'+userid+'" AND status = ' + tag; 
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

//update,更新备注信息

//批量修改打款状态
Order.batchPaid = function(orders, callback){
	async.each(orders, function(orderid, callback1){
		mysql.getConnection(function(err, conn){
			if(err)
				return callback1(err);

			var sql = 'UPDATE orders SET paid_tag = 1 WHERE orderid = ?';
			conn.query(sql, [orderid], function(err, rows){
				if(err)
					return callback1(err);
				conn.release();
				callback1();
			})
		})
	}, function(err){
		callback(err);
	})
}

//通过订单号查询订单详情
Order.queryOrderByOrderid = function(orderid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'SELECT cardid, seller, buyer, logistic_code, logistic, logistic_no, status, card_price,'+
		' logistic_price, message, ordertype, addr_id, card_num, alipay_id, receive_time, create_time, '+
		'card_pic, card_name, card_desc, paid_tag, extra, province, city, district, address, postcode, telephone, consignee'+
		' FROM orders WHERE orderid = ?';
		console.log(sql, orderid);
		conn.query(sql, [orderid], function(err, rows){
			conn.release();
			if(err)
				return callback(err);
			
			callback(err, rows);	
		})

	})
}

//修改运费
Order.modifyFreight = function(orderid, logistic_price, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'UPDATE orders SET logistic_price = ? WHERE orderid = ?';
		console.log(sql, logistic_price, orderid);
		conn.query(sql, [logistic_price, orderid], function(err, results){
			conn.release();
			callback(err, results);	
		})

	})
}

//退款申请提交
Order.refund = function(orderid, callback){
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'SELECT status, charge_id, card_price FROM orders WHERE orderid = ?';
		conn.query(sql, [orderid], function(err, rows){
			conn.release();
			if(err)
				return callback(err);
			
			if(rows.length == 0)
				return callback('订单信息为空');
			
			var status = rows[0].status;
			if(status != 1)//0:待付款 1:待发货
				return callback('订单当前状态不能退款');
			

			var charge_id = rows[0].charge_id;
			var amount = parseInt(rows[0].card_price * 100);
			pingpp.charges.createRefund(
				charge_id,
				{ amount: amount, description: "Refund Description" },
				function(err, refund) {
					console.log(charge_id, amount)
					console.log(err, refund);
					return callback(err, refund);
				}
			)
		})

	})
}

//退款成功
Order.refundSuccess = function(refund, callback){
	var charge_id = refund.charge
	mysql.getConnection(function(err, conn){
		if(err)
			return callback(err);

		var sql = 'SELECT orderid, buyer, seller, card_name, card_desc, card_pic, cardid, card_num FROM orders WHERE charge_id = ?';
		conn.query(sql, [charge_id], function(err, rows){
			if(err){
				conn.release();
				return callback(err);
			}

			if(rows.length == 0){
				conn.release();
				return;
			}

			var card_name = rows[0].card_name;
			var card_desc = rows[0].card_desc;
			var card_pic = rows[0].card_pic;
			var cardid = rows[0].cardid;
			var seller = rows[0].seller;
			var buyer = rows[0].buyer;
			var orderid = rows[0].orderid;
			var card_num = rows[0].card_num;

			var sql = 'UPDATE card SET status = 0, amount = amount + ? WHERE cardid = ?';//修改卡片状态为0（待出售），卡片数量为原有卡片数量加上订单的卡片数量
			conn.query(sql, [card_num, cardid], function(err, results){
				if(err){
					conn.release();
					return callback(err);
				}
				var sql = 'UPDATE orders SET status = -1 WHERE charge_id = ?';
				conn.query(sql, [charge_id], function(err, results){
					if(err){
						conn.release();
						return callback(err);
					}
					//生成对买家和卖家的消息
					Message.insertOrderMsg(buyer, orderid, 2, card_name, card_desc, card_pic, cardid, BUYER_TAG, 3, function(err, results){if(err) console.log(err);});
					Message.insertOrderMsg(seller, orderid, 2, card_name, card_desc, card_pic, cardid, SELLER_TAG, 3, function(err, results){if(err) console.log(err);});
					
					/*个推消息*/
					var sql = 'SELECT device_token FROM user WHERE userid = ?';
					conn.query(sql, [seller], function(err, rows){
						conn.release();
						if(rows.length == 0) return;
						var device_token = rows[0].device_token;
						getui.push('交易消息', '买家申请退款成功', device_token);
					})
					/*个推消息*/
				})

			})
		})

	})
}

module.exports = Order;