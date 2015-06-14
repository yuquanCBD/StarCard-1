var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var uuid = require('node-uuid');
var Card = require('../models/card');
var path = require('path');
var fs = require('fs');

router.get('/', function(req, res, next){
console.log("Request handler 'start' was called."); 
 
  var body = '<html>'+ 
    '<head>'+ 
    '<meta http-equiv="Content-Type" content="text/html; '+ 
    'charset=UTF-8" />'+ 
    '</head>'+ 
    '<body>'+ 
    '<form action="/publish" enctype="multipart/form-data" '+ 
    'method="post">'+ 
    '<input type="text" name="title" value="card1" />'+
    '<input type="text" name="describe" value="card1" />'+
    '<input type="text" name="price" value="1.0" />'+
    '<input type="text" name="logistic" value="顺丰" />'+
    '<input type="text" name="category" value="1" />'+
    '<input type="text" name="brand" value="1" />'+
    '<input type="text" name="freight" value="1" />'+
    '<input type="text" name="exchange" value="1" />'+
    '<input type="text" name="owner" value="userid001" />'+
    '<input type="text" name="amount" value="1" />'+
    '<input type="file" name="imgs" multiple="multiple">'+ 
    '<input type="submit" value="Upload file" />'+ 
    '</form>'+ 
    '</body>'+ 
    '</html>'; 
 
    res.writeHead(200, {"Content-Type": "text/html"}); 
    res.write(body); 
    res.end(); 
});


router.post('/', function(req, res, next){
	var cardInfo = {
		cardid : uuid.v1(),
		title : req.body.title,
		describe : req.body.describe,
		price : req.body.price,
		logistic : req.body.logistic,
		category : req.body.category,
		brand : req.body.brand,
		freight : req.body.freight,
		exchange : req.body.exchange,
		owner : req.body.owner,
		amount : req.body.amount
	};

	//存储卡片照片，依据cardid在public/imgs/card目录下创建同名目录，图片存储在此目录中
	//TODO
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		var filePath = path.join(__dirname, 'public/imgs/card/');
		fs.mkdir(filePath + cardInfo.cardid, function(err){
			if(err)
				console.log(err);
			else{

				for (var i in files.imgs) {
			      	var file = files.imgs[i];
			        fs.renameSync(file.path, filePath + cardInfo.cardid + '/' + file.originalFilename);
		     	 }
			}
		});


	});

	var newCard = new Card(cardInfo);
	newCard.save(function(err){
		if(err){
			console.log('发帖信息存储失败, error: ' + err);
			res.json({error: '发帖失败'});
		}else
			res.json({success: "发帖成功"});
	});
});

module.exports = router;