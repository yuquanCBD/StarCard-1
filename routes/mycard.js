var express = require('express');
var router = express.Router();
var User = require('../models/user')
var multiparty = require('multiparty');


//积分查询
router.post('/queryScore', function(req, res, next) {
	var userid = req.body.userid;
	User.queryScore(userid, function(err, user){
		if(err)
			return res.json({error : err});
		return res.json(user);
	});
});


//收藏卡片查询
router.post('/queryCollect', function(req, res, next) {
	var userid = req.body.userid;
	User.queryCollect(userid, function(err, cards){
		if(err)
			return res.json({error : err});
		return res.json(cards);
	});
});


//卡片查询，0.待交易卡查询 1.售出卡查询 2.购入卡查询 
//TODO 购入卡查询
router.post('/queryMyCard', function(req, res, next) {
	var userid = req.body.userid;
	var type = req.body.type;
	User.queryMyCard(userid, type, function(err, cards){
		if(err)
			return res.json({error : err})
		return res.json(cards);
	});
});


//个人资料修改
router.post('/updateUserInfo', function(req, res, next) {
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		if(err)
			return res.json({error : err});

		var userid = fields.userid[0];
		var username = fields.username[0];
		var gender = fields.gender[0];
		var tel = fields.tel[0];
		var province = fields.province[0];
		var city = fields.city[0];
		var district = fields.district[0];
		var address = fields.address[0];
		var postcode = fields.postcode[0];
		var IDCardNo = fields.IDCardNo[0];

		User.updateUserInfo(userid, username, tel, gender, province, city, district, address, postcode, IDCardNo, files, function(err){
			if(err)
				return res.json({error : err});
			return res.json({success : '更新成功'});
		});

	});

});



module.exports = router;