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
	var obj = req.session.starObj;
	if(obj === undefined){
		return res.render("card_manage/login.html");
	}
	return res.render('order_manage/orderManage.html',{title:"订单查询",status:4});
});

router.get('/commonquery', function(req, res, next){
	var obj = req.session.starObj;
	if(obj === undefined){
		return res.render("card_manage/login.html");
	}
	return res.render("order_manage/cOrderManage.html",{title:"普通商家订单查询",status:4});
});
router.get('/managerquery', function(req, res, next){
	var obj = req.session.starObj;
	if(obj == undefined){
		return res.render("card_manage/login.html");
	}
	return res.render("order_manage/mOrderManage.html",{title:"管理员订单查询",status:4});
});
//所有订单中根据状态查询
router.post('/query', function(req, res, next){
	var status = req.body.status;
    res.render('order_manage/orderManage.html',{title:'订单查询',status:status});
});
//普通用户中订单中根据状态查询
router.post('/queryC', function(req, res, next){
	var status = req.body.status;
    res.render('order_manage/cOrderManage.html',{title:'普通商家订单查询',status:status});
});
//管理员中订单中根据状态查询
router.post('/queryM', function(req, res, next){
	var status = req.body.status;
    res.render('order_manage/mOrderManage.html',{title:'管理员订单查询',status:status});
});

//根据订单状态查询订单信息
router.post('/queryByStatus', function(req, res, next){

	var status = req.body.status;
	if(status == "" || status== null){
		return res.json({error:"error"});
	}
	//console.log("测试form=-=-=-=-=-=-=-=-=-=====================",status);
	var sql;
	if(status == 4){
		sql ='select * from orders order by create_time desc'; 
	}
	else{
		sql = 'select * from orders where status="'+status+'" order by orders.create_time desc';
	}
	console.log(sql);
	Order.exec(sql, function(err, rows){
		if(err){
			return res.json({error:"数据库查询错误"});
		}
		
		return res.json(rows);
		//return res.render("order_manage/mOrderManage.html",{title:"管理员订单查询"});
	})
});
router.post('/queryByStatusC', function(req, res, next){

	var status = req.body.status;
	if(status == "" || status== null){
		return res.json({error:"error"});
	}
	//console.log("测试form=-=-=-=-=-=-=-=-=-=====================",status);
	var sql;
	if(status == 4){
		//sql ='select * from orders order by create_time desc';
		sql = "select * from user inner join orders on orders.seller = user.userid order by orders.create_time desc"; 
	}
	else{
		//sql = 'select * from orders where status="'+status+'" order by orders.create_time desc';
		var sql = 'select * from user inner join orders on orders.seller = user.userid where orders.status="'+status+'" order by orders.create_time desc';
	}
	console.log(sql);
	Order.exec(sql, function(err, rows){
		if(err){
			return res.json({error:"数据库查询错误"});
		}
		
		return res.json(rows);
		//return res.render("order_manage/mOrderManage.html",{title:"管理员订单查询"});
	})
});
router.post('/queryByStatusM', function(req, res, next){

	var status = req.body.status;
	if(status == "" || status== null){
		return res.json({error:"error"});
	}
	//console.log("测试form=-=-=-=-=-=-=-=-=-=====================",status);
	var sql;
	if(status == 4){
		//sql ='select * from orders order by create_time desc'; 
		sql = "select * from manager inner join orders on orders.seller = manager.userid order by orders.create_time desc"; 
	}
	else{
		//sql = 'select * from orders where status="'+status+'" order by orders.create_time desc';
		var sql = 'select * from manager inner join orders on orders.seller = manager.userid where orders.status="'+status+'" order by orders.create_time desc';
	}
	console.log(sql);
	Order.exec(sql, function(err, rows){
		if(err){
			return res.json({error:"数据库查询错误"});
		}
		
		return res.json(rows);
		//return res.render("order_manage/mOrderManage.html",{title:"管理员订单查询"});
	})
});
// //查询买家为管理员的订单消息
// router.post('/managerquery', function(req,res,next){
// 	var obj = req.session.starObj;
// 	if(obj === undefined){
// 		return res.json({error:"error"});
// 	}
// 	var sql = "select * from manager inner join orders on orders.seller = manager.userid order by orders.create_time desc";
// 	Order.exec(sql, function(err, rows){
// 		if(err){
// 			return res.json({error:"数据库查询错误"});
// 		}
// 		console.log("=========",rows);
// 		return res.json(rows);
// 	})
// });
// //查询买家为普通商家的订单消息
// router.post('/commonquery', function(req,res,next){
// 	var obj = req.session.starObj;
// 	if(obj === undefined){
// 		return res.json({error:"error"});
// 	}
// 	var sql = "select * from user inner join orders on orders.seller = user.userid order by orders.create_time desc";
// 	Order.exec(sql, function(err, rows){
// 		if(err){
// 			return res.json({error:"数据库查询错误"});
// 		}
// 		return res.json(rows);
// 	})
// });
// router
router.post('/delete',function(req, res, next){
	console.log('*****************delete***************');
	var obj = req.session.starObj;
	if(obj === undefined){
		return res.json({error:"error"});
	}
	var sql = 'delete from orders where orderid="'+req.body.orderid+'"';
	Order.exec(sql, function(err, r){
		if(err){
			return res.json({error:"数据库错误"});
		}
		return res.json({success:r});
	})
});
router.post('/addr',function(req, res, next){
	var obj = req.session.starObj;
	if(obj === undefined){
		return res.json({error:"error"});
	}
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
	var logistic = req.body.logistic == "无" ? "" : req.body.logistic;
	var logistic_no = req.body.logistic_no;
	var sql = 'update orders set message="'+message+'", status="'+status+'", logistic="'+logistic+'", logistic_no="'+logistic_no+'", card_num="'+card_num+'", card_price="'+card_price+'", logistic_price="'+logistic_price+'" where orderid="'+orderid+'"';
	console.log("=====================================================update sql==========",sql);
	Order.exec(sql, function(err, r){
		if(err){
			return res.json({error:"数据库发生错误"});
		}
		return res.render('order_manage/orderManage.html',{title:"订单查询",status:4});
	})
});
router.post('/gettele',function(req, res, next){
	var buyer = req.body.buyer;
	var seller = req.body.seller;
	//console.log("==========buyerid==========",buyer);
	//console.log("==========sellerid===========",seller);
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
});

router.post('/tele', function(req, res, next){
	var buyer = req.body.buyer;
	var seller = req.body.seller;
	//console.log("==========buyerid==========",buyer);
	//console.log("==========sellerid===========",seller);
	var buyerTele="",sellerTele="";
	var sql1 = 'select * from user where userid = "'+seller+'"';
	var sql2 = 'select * from manager where userid = "'+seller+'"';
	var sql3 = 'select * from user where userid = "'+buyer+'"';
	var sql4 = 'select * from manager where userid ="'+buyer+'"';
	var checkManger = function(sqlB1, sqlB2){
		return Order.exec(sqlB1,function(err,row3){
			if(err){
				return res.json({error:err});
			}
			if(row3.length > 0){
				buyerTele = row3[0].telephone;
				return res.json({buyerTele:buyerTele, sellerTele:sellerTele});
			}
			else{
				Order.exec(sqlB2, function(err,row4){
					var buyerTele = "";
					if(row4.length > 0)
						buyerTele = row4[0].telephone;
					return res.json({buyerTele:buyerTele, sellerTele:sellerTele});
				})
			}
		})
	}
	Order.exec(sql1, function(err, row1){
		if(err){
			return res.json({error:err});
		}
		if(row1.length > 0){
			sellerTele = row1[0].telephone;
			//console.log("==============user==============",sellerTele);
			checkManger(sql3, sql4);
			//return res.json({buyerTele:"276372673", sellerTele:sellerTele});
		}
		else{
			Order.exec(sql2, function(err, row2){
				if(row2.length > 0)
					sellerTele = row2[0].telephone;
				checkManger(sql3,sql4);
			})
		}
	});
});

//更新订单备注信息
router.post('/extra',function(req, res, next){
	var orderid=req.body.orderid;
	var extra = req.body.extra;
	Order.updateExtra(orderid, extra, function(err, results){
		if(err){
			return res.json({error:"数据库操作错误"});
		}
		return res.json({success:"success"});
	})
});
//批量更改完成打款字段
router.post('/paid',function(req, res, next){
	var orderids = req.body.orderid;
	var orders = new Array();
	orders = orderids.split(',');
	Order.batchPaid(orders, function(err){
		if(err)
			return res.json({error : err});
	 	return res.json({success:"success"});
	})
})


module.exports = router;