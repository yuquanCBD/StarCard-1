var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');

router.post('/', function(req, res, next){
	console.log('user login.');
	var username = req.body.username;
	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	var device_token = req.body.device_token;//用户设备唯一标识符
	
	User.login(username, device_token, function(err, user){
		if(!user){
			return res.json({error: '用户不存在'});
		}
		if(user.password != password){
			return res.json({error: '用户名或密码错误'});
		}
		req.session.user = user;
		return res.json({userid: user.userid});
	});
});

module.exports = router;