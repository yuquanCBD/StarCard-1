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
var Adv = require('../models/adv');
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
	return res.json({error:"哈哈哈哈大笑"});
});

//添加广告正文图片信息,配合kindeditor
function addInfoKind(fields, files, res){
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/adv/');
  for (var i  in files.imgFile){
        var file = files.imgFile[i];
        if(file.originalFilename.length == 0){
          break;
        }
        var types = file.originalFilename.split('.');
        var date = new Date();
        var str = String(date.getTime());
        imgurl = "/imgs/adv/"+str+'.'+String(types[types.length-1]);
        fs.renameSync(file.path, filePath+str+'.'+String(types[types.length-1]));
      };
   return res.json({error:0,url:imgurl});
};
//添加信息
function addInfoNew(fields, files, res){
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/adv/');
  for (var i  in files.imgFile){
        var file = files.imgFile[i];
        if(file.originalFilename.length == 0){
          break;
        }
        var types = file.originalFilename.split('.');
        var date = new Date();
        var str = String(date.getTime());
        imgurl = "/imgs/adv/"+str+'.'+String(types[types.length-1]);
        fs.renameSync(file.path, filePath+str+'.'+String(types[types.length-1]));
      };
   return res.json({error:0,url:imgurl});
};
//添加广告信息
//添加信息
function addInfo(fields, files, res){
  var str = "";
  var uId = uuid.v1();
  var title = fields.title[0];
  var content = fields.content[0];
  console.log("title:",title," content:",content);
  console.log("$$$$$$$$$$$$################@@@@@@@@@@@@@@@@@  ",files);
  //return res.render("../public/kindeditor/nodejs/advAdd.html");
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/adv/');
  fs.mkdir(filePath+uId, function(err){
    if(err){
      console.log(err);
      return res.json({error:'存储图片失败'});
    }
    else{
      for (var i  in files.imgs) {
        if(i > 3) break; //最多3张
        var file = files.imgs[i];
        if(file.originalFilename.length == 0){
          break;
        }
        var types = file.originalFilename.split('.');
        var p = "imgs/adv/"+uId+'/'+i+'.'+String(types[types.length-1]);
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
      var obj = {adv_id:uId, title: title, content:content, main_picture:str};
      Adv.add(obj, function(err, user){
        if(err){
          return res.json({error:"广告信息添加失败"});
        }
        return res.render("../public/kindeditor/nodejs/advAdd.html");
      });
    }
  });
};


router.post("/uploadImg", function(req, res, next){
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		if(err){
		  console.log(err);
		  return res.json({error:1});
		};
		addInfoNew(fields, files, res);
	});
	//return res.json({error:0,url:"/imgs/news/f19fe650-51ef-11e5-aa63-171f08a47137/0.jpg"});
});

router.post("/add", function(req, res, next){
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		if(err){
			console.log(err);
			return res.render('../public/404.html');
		}
		addInfo(fields, files, res);
	})
});
//获取列表
router.get('/getlist',function(req, res, next){
	Adv.getlist(function(err, rows){
		if(err){
			return res.json({error:"error"});
		}
		return res.json(rows);
	});
});
router.post('/list',function(req, res, next){
  Adv.getlist(function(err, rows){
    if(err){
      return res.json({error:"error"});
    }
    return res.json(rows);
  });
})


//删除广告信息,并删除
router.get('/delete', function(req, res, next){
	var adv_id = req.query.adv_id;
    Adv.delete(adv_id, function(err, r){
        if (err)
           return res.json({error : err});
        console.log('开始删除');
        var filePath = path.join(__dirname, '../public/imgs/adv/');
        var dirpath = filePath+adv_id;
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

//逻辑
//1.如果用户没有修改图片，那么只需要修改文本信息然后更新数据库
//2.如果用户修改图片，那么需要将原来图片删除，然后将新文件写进原来文件夹，并且还需要更新数据库文本信息以及路径信息
function updateInfo(fields, files, res){
  var str = "";
  var title = fields.title[0];
  var content = fields.content[0];
  var adv_id = fields.adv_id[0];
  console.log(title,' , ',content,'   ,   ',adv_id);
  console.log("%%%%%%%%%%%%%%%%%%%%%%%   :   ",adv_id);
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/adv/');
  //console.log(files.imgs[0]);
  //如果存在上传文件
  if(files.imgs[0].originalFilename){
    // 判断文件夹是否存在,如果文件夹存在，删除里边所有文件 
    fs.exists(filePath+adv_id, function(exists){ 
     if(exists){ 
        var dirList = fs.readdirSync(filePath+adv_id);
        dirList.forEach(function(fileName){
        	// var strs = fileName.split('.');
        	// console.log("％％％％％％％％％％％％％％图片名称",strs[0],'  ,  ',strs[1] );
          fs.unlinkSync(filePath+adv_id+'/'+fileName);
        });
        console.log('删除成功');

        //*******************
        for (var i  in files.imgs) {
          if(i > 2) break; //最多三张
          var file = files.imgs[i];
          if(file.originalFilename.length == 0){
            break;
          }
          var types = file.originalFilename.split('.');
          var p = "imgs/adv/"+adv_id+'/'+i+'.'+String(types[types.length-1]);
          if(str === ""){
            str += p;
          }
          else{
            str += (','+p);
          }
          fs.renameSync(file.path, filePath+adv_id+'/'+i+'.'+String(types[types.length-1]));
        };
        console.log('图片信息添加成功');
        //将路径和卡片信息存入数据库
        var obj = {adv_id:adv_id, title:title, content:content, main_picture:str};

        Adv.updateWithImg(obj, function(err, rows){
          if(err){
            return res.json({error:"广告信息修改失败"});
          }
          return res.render('../public/kindeditor/nodejs/advManage.html');
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
    var obj = {adv_id:adv_id, title:title, content:content};
    Adv.updateWithoutImg(obj, function(err, user){
      if(err){
        return res.json({error:"卡信息修改失败"});
      }
      return res.render('../public/kindeditor/nodejs/advManage.html');
    });    
  }
};
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

module.exports = router;