var express		= require('express');
var router 		= express.Router();
var Address 	= require('../models/address')
var Order 		= require('../models/order')


router.post('/modifyDefaultAddr', function(req, res, next){
	var userid = req.body.userid;
	var province = req.body.province;
	var city = req.body.city;
	var district = req.body.district;
	var address = req.body.address;
	var postcode = req.body.postcode;

	Address.modifyDefaultAddr(userid, province, city, district, address, postcode, function(err, results){
		if(err)
			return res.json({error : err});
		return res.json({success : '默认收货地址修改成功'});
	})
})

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
	var consignee = req.body.consignee;

	Address.add(userid, province, city, district, postcode, address, telephone, consignee, function(err, result){
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

//根据地址id查询地址详情
router.post('/queryAddrById', function(req, res, next){
	var addrid = req.body.addrid;

	Address.queryAddrById(addrid, function(err, rows){
		if(err)
			return res.json({error : err});
		if(rows.length == 0)
			return res.json(null);
		else
			return res.json(rows[0]);
	})

})

//查询默认发货地址
router.get('/getDefaultAddr', function(req, res, next){
	var userid = req.query.userid; 

	Address.getDefaultAddr(userid, function(err, rows){
		if(err)
			return res.json({error : err});
		if(rows.length == 0)
			return res.json(null);
		else
			return res.json(rows[0]);
	})

})

//确认订单，未付款
router.post('/checkOrder', function(req, res, next){
	var cardid = req.body.cardid;
	var cardnum = req.body.cardnum;
	var seller = req.body.seller;
	var buyer = req.body.buyer;
	var card_price = req.body.card_price;
	var logistic_price = req.body.logistic_price;
	var addrid = req.body.addrid;
	var card_pic = req.body.card_pic;
	var card_name = req.body.card_name;
	var card_desc = req.body.card_desc;

	Order.checkOrder(cardid, cardnum, seller, buyer, card_price, logistic_price, addrid, card_pic, card_name, card_desc, function(err, orderid){
		if(err)
			return res.json({error : err});

		return res.json({orderid : orderid});
	});
});

//订单付款
router.post('/payOrder', function(req, res, next){
	var orderid = req.body.orderid;
	var amount = req.body.amount;

	Order.payOrder(orderid, amount, req.ip, function(err, charge){
		if(err)
			return res.json({error : err});
		return res.json(charge);
	});
});

//订单发货
router.post('/deliverOrder', function(req, res, next){
	var orderid = req.body.orderid;
	var logistic = req.body.logistic;
	var logistic_no = req.body.logistic.no;
	var logistic_code = req.body.logistic_code;

	Order.deliverOrder(orderid, logistic, logistic_no, logistic_code, function(err, results){
		if(err)
			return res.json({error : err});
		return res.json({success : '发货成功'});	
	});
});

//订单收货
router.post('/receiveOrder', function(req, res, next){
	var orderid = req.body.orderid;
	var seller = req.body.seller;
	var buyer = req.body.buyer;

	Order.receiveOrder(orderid, seller, buyer, function(err, results){
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

//通过订单号查询订单详情
router.post('/queryOrderByOrderid', function(req, res, next){
	var orderid = req.body.orderid;

	Order.queryOrderByOrderid(orderid, function(err, rows){
        if(err)
            return res.json({error : err});
        if(rows.length == 0)
            return res.json(null);
        else
            return res.json(rows[0]);
	})
})


//修改运费
router.post('/modifyFreight', function(req, res, next){
	var orderid = req.body.orderid;
	var logistic_price = req.body.logistic_price;

	Order.modifyFreight(orderid, logistic_price, function(err, results){
        if(err)
            return res.json({error : err});
        return res.json({success : '修改成功'});
	})
})
module.exports = router;







