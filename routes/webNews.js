/*
	web新闻管理
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
var options = {
	root: __dirname + '/../views/',
	dotfiles: 'deny',
	headers: {
	    'x-timestamp': Date.now(),
	    'x-sent': true
	}
};

router.get('/test', function(req, res, next){
	return res.json({test:"/webNews/test接口测试成功"});
});

router.get('/add', function(req, res, next){
	if(req.session.starObj === undefined){
 		return res.render('card_manage/login.html');
  };
  return res.render('news_manage/newsAdd.html');
})










module.exports = router;