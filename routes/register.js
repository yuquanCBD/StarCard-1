var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var capUtil = require('../util/captchaUtil.js');
var uuid = require('node-uuid');
//注册生成验证码
router.get('/', function(req, res, next){
	var cap = capUtil.getRandomNum(100000,999999);
	req.session.cap = cap;
	res.json({captcha : cap}); 
});

//获取短信验证码
router.post('/getMsgCap', checkCap);
router.post('/getMsgCap', checkTel);
router.post('/getMsgCap', getMsg);
//验证短信验证码
router.post('/vertifyMsg', vertifyM);
//设置昵称 密码 身份证后四位
router.post('/setInfo', checkInfo);
router.post('/setInfo', setUserInfo)

//验证验证码
function checkCap(req, res, next){
	if(req.session.cap != req.body.captcha)
		return res.json({error:'验证码错误'});
	next();
}
//看提供手机号是否已经注册
function checkTel(req, res, next){
	User.getUserByTel(req.body.telephone, function(err, user){
		if(err){
			return res.json({error:'数据库查询失败'});
		}
		if(user)
			return res.json({error:'手机号已被注册'});
		next();
	});
}
//向手机短信服务端发请求生成短信验证码
function getMsg(req, res, next){
	console.log('get');
	var tel = req.body.telephone;
	console.log(tel);
	var msg = capUtil.getMsgCap(tel);
	req.session.msg = msg;
	req.session.when = new Date();
	req.session.tel = tel;
	console.log('成功');
	res.json({sucess:'sucess'});
}
//检查验证码时间
//检查用户名是否已经存在
function checkInfo(req, res, next){
	var when = new Date();
	console.log(when);
	if((when.getTime() - req.session.when.getTime()) > 60000){
		return res.json({error:'输入验证码超时'});
	}
	var username = req.body.username;
	User.checkUserByName(username, function(err, rows){
		if(err){
			return res.json({error:'数据库查询失败'});
		}
		if(rows.length > 0){
			return res.json({error:'用户名已经存在'});
		}
		next();
	});
	
}
function setUserInfo(req, res, next){
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	console.log(password);
	var userInfo ={
		userid : uuid.v1(),
		username : req.body.username,
		password : password,
		telephone : req.session.tel,
		telephone : req.body.telephone,
		IDCardNo : req.body.IDCardNo,
		create_time : new Date(),
	};
	User.save(userInfo,function(err, user){
		if(err){
			return res.json({error:'注册失败'});
		}
		res.json({sucess:'success'});
	});
}
function vertifyM(req, res, next){
	if(req.session.msg != req.body.messageCaptcha)	
		return res.json({error:'短信验证码错误'});
	res.json({success:'sucess'});
}

module.exports = router;