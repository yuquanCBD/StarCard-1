var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('./models/user');
var capUtil = require('./util/captchaUtil');

//找回密码界面
router.get('/', function(req, res , next){
	var cap = capUtil.getRandomNum(100000, 999999);
	req.session.cap = cap;
	res.json({captcha : cap});
});

//获取短信验证码
router.post('/getMsgCap', checkCap);
router.post('/getMsgCap', checkTel);
router.post('/getMsgCap', function(req, res, next){
	var tel = req.body.telephone;
	var msg = capUtil.getMsgCap(tel);
	req.session.msg = msg;
	req.session.when = new Date();
	res.json({success: 'success'});
});

function checkCap(req, res, next){
	if(req.session.cap != req.body.captcha)
		return res.json({error: '验证码错误'});
	next();
}

function checkTel(req, res, next){
	User.getUserByTel(req.body.telephone, function(err, user){
		if(!user)
			return res.json({error: '用户不存在'});
		next();
	});
}

//校验短信验证码
router.post('/verifyMsg', function(req, res, next){
	
});

module.exports = router;