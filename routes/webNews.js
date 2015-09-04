/*
	web新闻管理
*/
var express = require('express');
var uuid = require('node-uuid');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var router = express.Router();
var News = require('../models/news');
var User = require('../models/user');
var getui = require('../getui/getui');
var options = {
	root: __dirname + '/../views/',
	dotfiles: 'deny',
	headers: {
	    'x-timestamp': Date.now(),
	    'x-sent': true
	}
};

router.get('/test', function(req, res, next){
	//return res.json({test:"/webNews/test接口测试成功"});
	return res.render('news_manage/ueditorTest.html');
});

router.get('/add', function(req, res, next){
	if(req.session.starObj === undefined){
 		return res.render('card_manage/login.html');
  	};
  return res.render('news_manage/newsAdd.html');
});

router.post('/add',function(req, res, next){
	var title = req.body.title;
	var source = req.body.source;
	var create_time = req.body.create_time;
	var content = req.body.content;
	var obj = {title:title, source:source, create_time:create_time, content:content};
	News.add(obj, function(err, r){
		if(err){
			return res.json({error:"数据库操作错误"});
		}
		return res.render("../public/kindeditor/nodejs/newsAdd.html");
	})
	//return res.json({success:"success"});
});
//添加信息
function addInfo(fields, files, res){
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/news/');
  for (var i  in files.imgFile){
        var file = files.imgFile[i];
        if(file.originalFilename.length == 0){
          break;
        }
        var types = file.originalFilename.split('.');
        var date = new Date();
        var str = String(date.getTime());
        imgurl = "/imgs/news/"+str+'.'+String(types[types.length-1]);
        fs.renameSync(file.path, filePath+str+'.'+String(types[types.length-1]));
      };
   return res.json({error:0,url:imgurl});
};


router.post("/uploadImg", function(req, res, next){
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		if(err){
		  console.log(err);
		  return res.json({error:1});
		};
		addInfo(fields, files, res);
	});
	//return res.json({error:0,url:"/imgs/news/f19fe650-51ef-11e5-aa63-171f08a47137/0.jpg"});
});
//获取列表
router.get('/getlist',function(req, res, next){
	News.getlist(function(err, rows){
		if(err){
			return res.json({error:"error"});
		}
		return res.json(rows);
	});
});
//根据新闻id删除新闻
router.get('/delete',function(req, res, next){
	if(req.session.starObj === undefined){
 		return res.json({error:"error"});
  	};
	var news_id = req.query.news_id;
	News.delete(news_id, function(err,rows){
		if(err){
			return res.json({error:"error"});
		}
		else{
			return res.json({success:"success"});
		}
	});
});
//根据新闻id更新信息
router.post('/update',function(req, res, next){
	var news_id = req.body.news_id;
	var title = req.body.title;
	var source = req.body.source;
	var create_time = req.body.create_time;
	var content = req.body.content;
	var obj = {news_id:news_id, title:title, source:source, create_time:create_time, content:content};
	News.update(obj, function(err, rows){
		if(err){
			return res.json({"err":"修改信息错误"});
		}
		else{
			return res.render("../public/kindeditor/nodejs/newsManage.html");
		}
	});
})





/*    ----------- 消息推送 -------------   */
router.get("/message", function(req, res, next){
	if(req.session.starObj === undefined){
 		return res.render('card_manage/login.html');
  	};
	return res.render("news_manage/message.html");
})
router.post("/message",function(req, res, next){
	var title = req.body.title;
	var content = req.body.content;
	User.getDevice_token(function(err, rows){
		
		var device = [];
		for (var i = 0; i < rows.length; i++) {
			if(rows[i].device_token != '')
				device.push(rows[i].device_token);
		};
		console.log(device);
		var obj = {content:content};
		console.log(device,'  ,  ',obj);
		getui.pushToList(title, content);
		return res.render("news_manage/message.html");
	})
});



module.exports = router;