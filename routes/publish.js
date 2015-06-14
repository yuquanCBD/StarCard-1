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


	//存储卡片照片，依据cardid在public/imgs/card目录下创建同名目录，图片存储在此目录中
	//TODO
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		console.log(fields);

		var cardInfo = {
			cardid : uuid.v1(),
			describe : fields.describe,
			title : fields.title,
			price : fields.price,
			logistic : fields.logistic,
			category : fields.category,
			brand : fields.brand,
			freight : fields.freight,
			exchange : fields.exchange,
			owner : fields.owner,
			amount : fields.amount
		};


		var filePath = path.join(__dirname, '../public/imgs/card/');
		fs.mkdir(filePath + cardInfo.cardid, function(err){
			if(err)
				console.log(err);
			else{
				for (var i in files.imgs) {
			      	var file = files.imgs[i];
			      	var types = file.originalFilename.split('.'); //将文件名以.分隔，取得数组最后一项作为文件后缀名。
			        fs.renameSync(file.path, filePath + cardInfo.cardid + '/' + i + '.' +String(types[types.length-1]));
		     	 }
			}
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

});

router.get('/userScore', function(req, res, next){
	
});

module.exports = router;