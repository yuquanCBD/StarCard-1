var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var capUtil = require('../util/captchaUtil.js');

//找回密码界面
router.get('/', function(req, res , next){
	var cap = capUtil.getRandomNum(100000, 999999);
	req.session.cap = cap;
	res.json({captcha : cap});
});

//获取短信验证码
router.post('/getMsgCap', checkCap);
router.post('/getMsgCap', function(req, res, next){

	User.getUserByTel(req.body.telephone, function(err, user){
		if(!user)
			return res.json({error: '用户不存在'});

		var tel = req.body.telephone;
		var msg = capUtil.getMsgCap(tel);
		req.session.msg = msg;
		req.session.when = new Date();
		req.session.tel = tel;
		res.json({success: '获取短信验证码成功'});
	});
});

function checkCap(req, res, next){
	if(req.session.cap != req.body.captcha)
		return res.json({error: '验证码错误'});
	next();
}


//校验短信验证码
router.post('/verifyMsg', function(req, res, next){
	var now = new Date();
	if(!req.session.when || (now.getTime() - req.session.when.getTime()) > 30000)
		return res.json({error: '验证码过期'});
	if(req.body.msg != req.session.msg)
		return res.json({error: '验证码错误'});

	res.json({success: '验证码校验成功'});
});

// 输入新密码
router.post('/newPwd', function(req, res, next){
	if(!req.session.tel)
		return res.json({error: 'session失效'});

	var md5 = crypto.createHash('md5');
	if(req.body.pwd1 || req.body.pwd1 != req.body.pwd2)
		return res.json({error: '输入密码不一致'});

	var pwd = md5.update(req.body.pw1).digest('base64');


	User.updatePwd(req.session.tel, pwd, function(err){
		if(err)
			return res.json({error: '更新密码失败'});

		res.json({success: '密码修改成功'});
	});

});


module.exports = router;














