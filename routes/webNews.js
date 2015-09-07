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

// router.post('/add',function(req, res, next){
// 	var title = req.body.title;
// 	var source = req.body.source;
// 	//var create_time = req.body.create_time;
// 	var content = req.body.content;
// 	var obj = {title:title, source:source, content:content};
// 	News.add(obj, function(err, r){
// 		if(err){
// 			return res.json({error:"数据库操作错误"});
// 		}
// 		return res.render("../public/kindeditor/nodejs/newsAdd.html");
// 	})
// 	//return res.json({success:"success"});
// });
//添加信息
function addInfo(fields, files, res){
  var str = "";
  var uId = uuid.v1();
  var title = fields.title[0];
  var source = fields.source[0];
  var describes = fields.describes[0];
  var content = fields.content[0];
  //return res.render("../public/kindeditor/nodejs/advAdd.html");
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/news/');
  fs.mkdir(filePath+uId, function(err){
    if(err){
      console.log(err);
      return res.json({error:'存储图片失败'});
    }
    else{
      for (var i  in files.imgs) {
        if(i > 0) break; //最多3张
        var file = files.imgs[i];
        if(file.originalFilename.length == 0){
          break;
        }
        var types = file.originalFilename.split('.');
        var p = "imgs/news/"+uId+'/'+i+'.'+String(types[types.length-1]);
        if(str === ""){
          str += p;
        }
        else{
          str += (','+p);
        }
        fs.renameSync(file.path, filePath+uId+'/'+i+'.'+String(types[types.length-1]));
      };
      console.log('图片信息添加成功');       
      //将路径和卡片信息存入数据库
      var obj = {news_id:uId, title: title, source:source, describes:describes, content:content, main_picture:str};
      News.add(obj, function(err, user){
        if(err){
          return res.json({error:"新闻信息添加失败"});
        }
        return res.render("../public/kindeditor/nodejs/newsAdd.html");
      });
    }
  });
};
//添加新闻信息
router.post("/add", function(req, res, next){
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		if(err){
			console.log(err);
			console.log("解析失败");
			return res.json({error:"添加失败"});
		}
		addInfo(fields, files, res);
	})
});

//添加信息
function addInfoKind(fields, files, res){
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
		addInfoKind(fields, files, res);
	});
	//return res.json({error:0,url:"/imgs/news/f19fe650-51ef-11e5-aa63-171f08a47137/0.jpg"});
});
//获取列表
router.get('/getlist',function(req, res, next){
	News.getlist(function(err, rows){
		if(err){
			return res.json({error:"error"});
		}
		//console.log(rows);
		return res.json(rows);
	});
});
//根据新闻id删除新闻
// router.get('/delete',function(req, res, next){
// 	if(req.session.starObj === undefined){
//  		return res.json({error:"error"});
//   	};

// 	var news_id = req.query.news_id;
// 	console.log("%%%%%%%%%%%%%%%:",news_id);
// 	News.delete(news_id, function(err,rows){
// 		if(err){
// 			return res.json({error:"error"});
// 		}
// 		else{
// 			return res.json({success:"success"});
// 		}
// 	});
// });
//删除广告信息,并删除
router.post('/delete', function(req, res, next){
	var news_id = req.body.news_id;
    News.delete(news_id, function(err, r){
        if (err)
           return res.json({error : "数据库错误"});
        console.log('开始删除');
        var filePath = path.join(__dirname, '../public/imgs/news/');
        var dirpath = filePath+news_id;
        exec('rm -rf '+dirpath, function(err){
          if(err){
          	res.json({success:r});
            return console.log('删除图片文件夹失败');
          }
          else{
            console.log('删除图片文件夹成功');
            return res.json({success:r});
          }
        });
    });
});


// //根据新闻id更新信息
// router.post('/update',function(req, res, next){
// 	var news_id = req.body.news_id;
// 	var title = req.body.title;
// 	var source = req.body.source;
// 	//var create_time = req.body.create_time;
// 	var content = req.body.content;
// 	var obj = {news_id:news_id, title:title, source:source, content:content};
// 	News.update(obj, function(err, rows){
// 		if(err){
// 			return res.json({"err":"修改信息错误"});
// 		}
// 		else{
// 			return res.render("../public/kindeditor/nodejs/newsManage.html");
// 		}
// 	});
// });

//逻辑
//1.如果用户没有修改图片，那么只需要修改文本信息然后更新数据库
//2.如果用户修改图片，那么需要将原来图片删除，然后将新文件写进原来文件夹，并且还需要更新数据库文本信息以及路径信息
function updateInfo(fields, files, res){
  var str = "";
  var title = fields.title[0];
  var source = fields.source[0];
  var describes = fields.describes[0];
  var content = fields.content[0];
  var news_id = fields.news_id[0];
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/news/');
  //console.log(files.imgs[0]);
  //如果存在上传文件
  if(files.imgs[0].originalFilename){
    // 判断文件夹是否存在,如果文件夹存在，删除里边所有文件 
    fs.exists(filePath+news_id, function(exists){ 
     if(exists){ 
        var dirList = fs.readdirSync(filePath+news_id);
        dirList.forEach(function(fileName){
          fs.unlinkSync(filePath+news_id+'/'+fileName);
        });
        console.log('删除成功');

        //*******************
        for (var i  in files.imgs) {
          if(i > 0) break; //最多1张
          var file = files.imgs[i];
          if(file.originalFilename.length == 0){
            break;
          }
          var types = file.originalFilename.split('.');
          var p = "imgs/news/"+news_id+'/'+i+'.'+String(types[types.length-1]);
          if(str === ""){
            str += p;
          }
          else{
            str += (','+p);
          }
          fs.renameSync(file.path, filePath+news_id+'/'+i+'.'+String(types[types.length-1]));
        };
        console.log('图片信息添加成功');
        //将路径和卡片信息存入数据库
        var obj = {news_id:news_id, title: title, source:source, describes:describes, content:content, main_picture:str};
        News.updateWithImg(obj, function(err, rows){
          if(err){
            return res.json({error:"信息修改失败"});
          }
          return res.render('../public/kindeditor/nodejs/newsManage.html');
        });
        //*******************
     }else{ 
        console.log("文件夹不存在");
        return res.json({error:'存储图片文件夹不存在'});
     } 
    });
  }
  //如果不存在上传文件
  else{
    //var obj = {adv_id:adv_id, title:title, content:content};
    var obj = {news_id:news_id, title: title, source:source, describes:describes, content:content};
    News.updateWithoutImg(obj, function(err, user){
      if(err){
        return res.json({error:"信息修改失败"});
      }
      return res.render('../public/kindeditor/nodejs/newsManage.html');
    });    
  }
};
//根据新闻id更新新闻信息
router.post('/update', function(req, res, next){
   var form = new multiparty.Form();
   form.parse(req, function(err, fields, files){
    if(err){
      console.log(err);
      return res.render('../public/404.html');
    }
    updateInfo(fields, files, res);
   })
});














/*    ----------- 消息推送 -------------   */
router.get("/message", function(req, res, next){
	if(req.session.starObj === undefined){
 		return res.render('card_manage/login.html');
  	};
	return res.render("news_manage/message.html");
});
router.get("/messagelist", function(req, res, next){
	if(req.session.starObj === undefined){
 		return res.render('card_manage/login.html');
  	};
	return res.render("news_manage/messageManage.html");
});

router.post("/message",function(req, res, next){
	var title = req.body.title;
	var content = req.body.content;
	News.addMessage({title:title, content:content}, function(err, r){
		if(err){
			return res.json({error:"消息存储失败"});
		}
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
		});
	});
	
});

//获取列表
router.get('/getlistMessage',function(req, res, next){
	News.getlistMessage(function(err, rows){
		if(err){
			return res.json({error:"error"});
		}
		//console.log(rows);
		return res.json(rows);
	});
});
//deleteMessage
router.post('/deletemessage', function(req, res, next){
	var message_id = req.body.message_id;
	News.deleteMessage(message_id, function(err, r){
		if(err){
			return res.json({error:"error"});
		}
		return res.json({success:"success"});
	})
});

module.exports = router;