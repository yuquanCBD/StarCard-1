/*
webWiki部分
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

router.get('/add', function(req, res, next){
	var username = req.session.username;
	var password = req.session.password;
	console.log("============username:",username," password:",password);
	var sql = 'select * from manager where username="'+username+'" and password="'+password+'"';
	User.exec(sql, function(err,r){
		if(err || r.length <=0){
			return res.render("card_manage/login_error.html");
		}
		else{
			return res.render("wiki_manage/wikiAdd.html",{title:""});
		}
	});
});
router.post('/add',function(req, res, next){
	var form = new multiparty.Form();
  	form.parse(req, function(err, fields, files){
	    if(err){
	      console.log(err);
	      res.json({error:'数据解析错误'});
	      return;
	    };
	    // 根据名称 品牌 类别 确定百科信息是否存在
	    var wikiname = fields.wikiname[0];
	    var category = fields.category[0];
	    var brand = fields.brand[0];
	    var sqlCheck = 'select * from wiki where wikiname="'+wikiname+'" and category="'+category+'" and brand="'+brand+'"';
	    console.log("===========",sqlCheck);
	    User.exec(sqlCheck, function(err, r){
	    	if(err){
	    		return res.render('wiki_manage/wikiAdd.html',{title:"数据库错误，请稍候重试!"});
	    	}
	    	else if(r.length > 0){
	    		var str = "百科中文名:"+wikiname+', 品牌:'+brand+', 类别:'+category+"已经存在,请查看百科信息!"
	    		return res.render('wiki_manage/wikiAdd.html',{title:str});
	    	}
	    	else{
	    		addInfo(fields, files, res, req);
	    	}
	    });
	});
});

//添加信息
function addInfo(fields, files, res, req){
  var str = "";
  var uId = uuid.v1();
  var wikiname = fields.wikiname[0];
  var english_name = fields.english_name[0];
  var category = fields.category[0];
  var manufacturer = fields.manufacturer[0];
  var series = fields.series[0];
  var serial_number = fields.serial_number[0];
  var rarity = fields.rarity[0];
  var describes = fields.describes[0];
  var price = fields.price[0];
  var brand = fields.brand[0];
  var islock = fields.islock[0];
  var contributor = req.session.username;

  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/wiki/');
  fs.mkdir(filePath+uId, function(err){
    if(err){
      console.log(err);
      return res.json({error:'存储图片失败'});
    }
    else{
      for (var i  in files.imgs) {
        if(i > 1) break; //最多1张
        var file = files.imgs[i];
        if(file.originalFilename.length == 0){
          break;
        }
        var types = file.originalFilename.split('.');
        var p = "imgs/wiki/"+uId+'/'+i+'.'+String(types[types.length-1]);
        if(str === ""){
          str += p;
        }
        else{
          str += (','+p);
        }
        fs.renameSync(file.path, filePath+uId+'/'+i+'.'+String(types[types.length-1]));
      };
      console.log('图片信息添加成功');
      console.log(str);
      //将路径和卡片信息存入数据库
      var sql = 'insert into wiki(wikiid, wikiname, english_name, category, manufacturer, series, serial_number, rarity, describes, price, contributor, picture, brand, islock) values(';
      sql = sql + '"'+uId+'","'+wikiname+'","'+english_name+'","'+category+'","'+manufacturer+'","'+series+'","'+serial_number+'","'+rarity+'","'+describes+'","'+price+'","'+contributor+'","'+str+'","'+brand+'","'+islock+'")';
      console.log(sql);
      User.exec(sql, function(err, r){
        if(err){
          return res.json({error:"wiki信息添加失败"});
        }
        return res.render('wiki_manage/wikiAdd.html');
      });
    }
  });
};

router.get('/query',function(req, res, next){
	var username = req.session.username;
	var password = req.session.password;

	return res.render('wiki_manage/lock.html');

});
router.post('/query',function(req, res, next){
	var sql = 'select * from wiki';
	User.exec(sql, function(err, r){
		if(err){
			return res.json({error:err});
		}
		else{
			console.log(r);
			return res.json(r);
		}
	})
});
router.post('/setlock',function(req, res, next){
	var wikiid = req.body.wikiid;
	var islock = req.body.lock;
	console.log('wikiid:',wikiid,', islock:',islock);
	var sql = 'update wiki set islock="'+islock+'" where wikiid="'+wikiid+'"';
	User.exec(sql, function(err, r){
		if(err){
			return res.json({error:err});
		}
		return res.json({success:"success"});
	});
});


module.exports = router;