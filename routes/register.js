var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var capUtil = require('../util/captchaUtil.js');
var uuid = require('node-uuid');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');

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


//设置昵称 密码 身份证后四位 存储身份证照片imgs
router.post('/setInfo',function(req, res, next){
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		if(err){
			console.log(err);
			return;
		}
		checkInfo(fields, files, res, req);
	});
});
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
	var time = new Date();
	req.session.when = time.getTime();
	req.session.tel = tel;
	console.log('成功');
	res.json({success:'success'});
}
//检查验证码时间
//检查用户名是否已经存在
function checkInfo(fields, files, res, req){
	console.log('输出用户昵称:');
	console.log(fields.username[0]);

	var now = new Date();
	if(!req.session.when || (now.getTime()/1000 - req.session.when) > 300)
		return res.json({error: '验证码过期'});

	var username = fields.username[0];
	User.checkUserByName(username, function(err, rows){
		if(err){
			return res.json({error:'数据库查询失败'});
		}
		if(rows.length > 0){
			return res.json({error:'用户名已经存在'});
		} 
		else{
			setUserInfo(fields, files, res, req);//存储信息
		}
	});	
	
}
function setUserInfo(fields, files, res, req){
	var md5 = crypto.createHash('md5');
	var password = md5.update(fields.password[0]).digest('base64');
	var uId = uuid.v1();
	var userInfo ={
		userid : uId,
		username : fields.username[0],
		password : password,
		telephone : req.session.tel,
		//telephone : fields.telephone[0],
		IDCardNo : fields.idCardNo[0]
	};
	User.save(userInfo,function(err, user){
		if(err){
			return res.json({error:'注册失败'});
		}
		saveImg(uId, files, res);//存储图片
	});
}
function saveImg(id, files, res){
	var filePath = path.join(__dirname, '../public/imgs/user/');
	fs.mkdir(filePath+id, function(err){
		if(err){
			console.log(err);
		}
		else{
			for (var i in files.imgs ) {
				if(i>2) break;
				var file = files.imgs[i];
				if(file.originalFilename.length == 0)
					break;
				var types = file.originalFilename.split('.'); //将文件名以.分隔，取得数组最后一项作为文件后缀名。
			    fs.renameSync(file.path, filePath + id + '/' + i + '.' +String(types[types.length-1]));
			};
			console.log('注册成功');
			res.json({success:'success'});
		}
	});
}
function vertifyM(req, res, next){
	console.log('短信验证码: ', req.session.msg, req.body.messageCaptcha);
	// if(req.session.msg != req.body.messageCaptcha)	
	// 	return res.json({error:'短信验证码错误'});
	res.json({success:'验证成功！'});
}

module.exports = router;