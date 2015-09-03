/*
 * web部分
*/
var express = require('express');
var ueditor = require("ueditor");
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

router.get("/ueditor", function(req, res, next){
	console.log("get上传图片请求",req.query.action);
	//ueditor客户发起上传请求
	if(req.query.action == "uploadimage"){

		var foo = req.ueditor;
		var imgname = req.ueditor.filename;
		var img_url = '/ueditor/upload/image/';
		res.ue_up(img_url);
	}
	else if(req.query.action == "listimage"){
		var dir_url = '/ueditor/upload/image/';
		res.ue_list(dir_url);
	}
	 else {
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json')
    }
});
router.post("/ueditor", function(req, res, next){
	console.log("post上传图片请求",req.query.action);
	//ueditor客户发起上传请求
	if(req.query.action == "uploadimage"){
		console.log(ueditor);
		var foo = req.ueditor;
		var imgname = req.ueditor.filename;
		var img_url = '/ueditor/upload/image/';

		// var form = new multiparty.Form();
		// form.parse(req, function(err, fields, files){
		// 	if(err){
		// 	  console.log(err);
		// 	  res.json({error:'数据解析错误'});
		// 	  return;
		// 	};
		// 	console.log(img_url);

		// 	console.log(files.upfile[0].originalFilename);
		// 	res.json(img_url+files.upfile[0].originalFilename);
		// });
		// console.log(img_url);
		res.ue_up(img_url);
		
	}
	else if(req.query.action == "listimage"){
		var dir_url = '/ueditor/upload/image/';
		res.ue_list(dir_url);
	}
	 else {
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json')
    }
});

module.exports = router;