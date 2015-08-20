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
})

module.exports = router;