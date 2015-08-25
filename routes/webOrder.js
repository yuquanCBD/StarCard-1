/*
 * web部分
*/
var express = require('express');
var uuid = require('node-uuid');
var User = require('../models/user.js');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var crypto = require('crypto');
var router = express.Router();
var Card = require('../models/card');
var Order = require('../models/order');
var options = {
	root: __dirname + '/../views/',
	dotfiles: 'deny',
	headers: {
	    'x-timestamp': Date.now(),
	    'x-sent': true
	}
};

router.get('/',function(req, res, next){
	console.log("***********LOGIN***********");
	return res.json({error:"数据解析错误."});
});

router.get('/query', function(req, res, next){
	return res.render('order_manage/orderManage.html',{title:"订单查询"});
})

router.post('/query', function(req, res, next){
	console.log("*****************************");
	var sql = "select * from orders";
	Order.exec(sql, function(err, rows){
		if(err){
			console.log("err ===========>",err);
			return res.json({'error':"数据库查询错误"});
		}
		//console.log("========================***********=========",rows);

		return res.json(rows);
	})
  //res.render('order_manage/orderManage.html',{title:'订单查询'});
});
router.post('/delete',function(req, res, next){
	console.log('*****************delete***************');
	var sql = 'delete from orders where orderid="'+req.body.orderid+'"';
	Order.exec(sql, function(err, r){
		if(err){
			return res.json({error:"数据库错误"});
		}
		return res.json({success:r});
	})
});
router.post('/addr',function(req, res, next){
	var addr_id = req.body.addr_id;
	var sql = 'select * from address where addr_id="'+addr_id+'"';
	Order.exec(sql, function(err, rows){
		if(err){
			return res.json({error:err});
		}
		return res.json({addr:rows});
	})
});
router.post('/update', function(req, res, next){
	var orderid = req.body.orderid;
	var message = req.body.message;
	var status = req.body.status;
	var card_price = req.body.card_price;
	var logistic_price = req.body.logistic_price;
	var card_num = req.body.card_num;
	var sql = 'update orders set message="'+message+'", status="'+status+'", card_num="'+card_num+'", card_price="'+card_price+'", logistic_price="'+logistic_price+'" where orderid="'+orderid+'"';
	Order.exec(sql, function(err, r){
		if(err){
			return res.json({error:"数据库发生错误"});
		}
		return res.render('order_manage/orderManage.html',{title:"订单查询"});
	})
});
router.post('/gettele',function(req, res, next){
	var buyer = req.body.buyer;
	var seller = req.body.seller;

	var sql1 = 'select * from user where userid="'+seller+'"';
	var sql2 = 'select * from user where userid="'+buyer+'"';

	var buyerTele,sellerTele;
	Order.exec(sql1, function(err, r){
		if(err){
			return res.json({error:err});
		}
		else{
			sellerTele = r[0].telephone;
			Order.exec(sql2, function(err1, row){
				if(err){
					return res.json({error:err1});
				}
				buyerTele = row[0].telephone;
				return res.json({buyerTele:buyerTele, sellerTele:sellerTele});
			})
		}
	})
})

module.exports = router;