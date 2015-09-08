/*
 * web部分
*/
var express = require('express');
var uuid = require('node-uuid');
var User = require('../models/user.js');
var Message = require('../models/message');
var Service = require('../models/service');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var crypto = require('crypto');
var router = express.Router();
var Card = require('../models/card');

var options = {
	root: __dirname + '/../views/',
	dotfiles: 'deny',
	headers: {
	    'x-timestamp': Date.now(),
	    'x-sent': true
	}
};
router.get('/test',function(req, res, next){
	return res.json({"测试":"客服测试"});
})

//获取客服列表
router.get('/getalllist',function(req, res, next){
	Service.getlist(function(err, rows){
		if(err){
			return res.json({error:"error"});
		}
		return res.json(rows);
	});
});
//获取为解决客服列表
router.get('/getchecklist',function(req, res, next){
	Service.getlistUnDeal(function(err, rows){
		if(err){
			return res.json({error:"error"});
		}
		return res.json(rows);
	});
});

//获取页面
router.get('/allsv', function(req, res, next){
	if(req.session.starObj === undefined){
 		return res.render('card_manage/login.html');
  	};
  	return res.render('service/serviceManage.html');
});
//获取页面
router.get('/checksv', function(req, res, next){
	if(req.session.starObj === undefined){
 		return res.render('card_manage/login.html');
  	};
  	return res.render('service/serviceCheckManage.html');
});

//解决
router.post("/check",function(req, res, next){
	if(req.session.starObj === undefined){
 		return res.json({error:"error"});
  	};
  	var starObj = req.session.starObj;
  	var userid = starObj.userid;
  	var username = starObj.username;
  	var id = req.body.id;
  	var obj = {id:id, userid:userid, username:username};
  	Service.update(obj, function(err, rows){
  		if(err){
  			return res.json({error:"数据库错误"});
  		}
  		return res.json({success:"success"});
  	});
});
//删除
router.post("/delete", function(req, res, next){
	if(req.session.starObj === undefined){
 		return res.json({error:"error"});
  	};
  	var id = req.body.id;
  	Service.delete(id,function(err,rows){
  		if(err){
  			return res.json({error:"数据库错误"});
  		}
  		return res.json({success:"success"});
  	})
});

// 添加客服信息
router.post("/add", function(req, res, next){
	var title = req.body.title;
	var content = req.body.content;
	var userid = req.body.userid;
	var username = req.body.username;
	var email = req.body.email;
	var obj = {title:title, content:content, userid:userid, username:username, email:email};
	Service.insert(obj, function(err, rows){
		if(err){
			return res.json({error:"error"});
		}
		return res.json({success:"success"});
	});
});




module.exports = router;