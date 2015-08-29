var express		= require('express');
var router 		= express.Router();
var Address 	= require('../models/address')
var Order 		= require('../models/order')

//获取常用收货地址列表
router.get('/queryAddrList', function(req, res, next){
	var userid = req.query.userid;
	Address.list(userid, function(err, addrs){
		if(err)
			return res.json({error : err});
		return res.json(addrs);
	});
});

//添加新地址
router.post('/addNewAddr', function(req, res, next){
	var userid = req.body.userid;
	var province = req.body.province;
	var city = req.body.city;
	var district = req.body.district;
	var postcode = req.body.postcode;
	var address = req.body.address;
	var telephone = req.body.telephone;
	var consigee = req.body.consigee;

	Address.add(userid, province, city, district, postcode, address, telephone, consigee, function(err, result){
		if(err)
			return res.json({error : err});
		return res.json({success : '新地址添加成功'});
	});
});

//删除地址
router.post('/delAddr', function(req, res, next){
	var userid = req.body.userid; 
	var addrid = req.body.addrid;

	Address.del(userid, addrid, function(err, result){
		if(err)
			return res.json({error : err});
		return res.json({success : '地址删除成功'});
	});
});

//确认订单，未付款
router.post('/checkOrder', function(req, res, next){
	var cardid = req.body.cardid;
	var cardnum = req.body.cardnum;
	var seller = req.body.seller;
	var buyer = req.body.buyer;
	var card_price = req.body.card_price;
	var logistic_price = req.body.logistic_price;
	var addrid = req.body.addrid;

	Order.checkOrder(cardid, cardnum, seller, buyer, card_price, logistic_price, addrid, function(err, orderid){
		if(err)
			return res.json({error : err});

		io.emit('order-' + seller, '您的卡片已有买家购买');//发送消息给卖家

		return res.json({orderid : orderid});
	});
});

//订单付款
router.post('/payOrder', function(req, res, next){
	var orderid = req.body.orderid;
	var alipay_id = req.body.alipay_id;

	Order.payOrder(orderid, alipay_id, function(err, results){
		if(err)
			return res.json({error : err});
		return res.json({success : '支付成功'});
	});
});

//订单发货
router.post('/deliverOrder', function(req, res, next){
	var orderid = req.body.orderid;
	var logistic = req.body.logistic;
	var logistic_no = req.body.logistic.no;

	Order.deliverOrder(orderid, logistic, logistic_no, function(err, results){
		if(err)
			return res.json({error : err});
		return res.json({success : '发货成功'});	
	});
});

//订单收货
router.post('/receiveOrder', function(req, res, next){
	var orderid = req.body.orderid;

	Order.receiveOrder(orderid, function(err, results){
		if(err)
			return res.json({error : err});
		return res.json({success : '收货成功'});
	});
});

//延长收货时间
router.post('/prolongOrder', function(req, res, next){
	var orderid = req.body.orderid;

	Order.prolongOrder(orderid, function(err, results){
		if(err)
			return res.json({error : err});
		return res.json({success : '收货时间延长成功'});
	});
});

//取消订单
router.post('/cancleOrder', function(req, res, next){
	var orderid = req.body.orderid;

	Order.cancleOrder(orderid, function(err, results){
		if(err)
			return res.json({error : err});
		return res.json({success : '订单取消成功'});
	});
});

//查询用户订单列表
router.post('/queryOrderList', function(req, res, next){
	var userid = req.body.userid;
	var tag = req.body.tag;
	var usertype = req.body.usertype;

	Order.queryOrderList(userid, tag, usertype, function(err, rows){
		if(err)
			return res.json({error : err});
		return res.json(rows);
	});
});


module.exports = router;







