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
        //if(i > 1) break; //最多1张
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
        return res.render('wiki_manage/wikiAdd.html',{title:""});
      });
    }
  });
};

router.get('/lock',function(req, res, next){
	var username = req.session.username;
	var password = req.session.password;

	return res.render('wiki_manage/lock.html');
});
router.get('/query',function(req, res, next){
	var username = req.session.username;
	var password = req.session.password;

	return res.render('wiki_manage/wikiManage.html');
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

//根据id删除百科
router.post("/delete",function(req, res, next){
  var wikiid = req.body.wikiid;
  var sql = 'DELETE FROM wiki WHERE wikiid = "'+wikiid+'"';
  console.log("=======================",wikiid);
  User.exec(sql, function(err, r){
    if (err)
       return res.json({error : err});
    console.log('开始删除');
    var filePath = path.join(__dirname, '../public/imgs/wiki/');
    var dirpath = filePath+wikiid;
    console.log("图片路径:",filePath);
    exec('rm -rf '+dirpath, function(err){
      if(err){
        return console.log('删除图片文件夹失败');
      }
      else{
        console.log('删除图片文件夹成功');
        return res.json({sucess:r});
      }
    });
  });
});

//根据提交的id更新用户信息，原则上不允许修改用户名以及用户id
router.post("/update",function(req, res, next){
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files){
    if(err){
      console.log(err);
      res.json({error:"数据解析错误"});
      return;
    };
    updateInfo(fields, files, res);
  })
});
//更新信息，逻辑
//1.如果用户没有修改图片，那么只需要修改文本信息然后更新数据库
//2.如果用户修改图片，那么需要将原来图片删除，然后将新文件写进原来文件夹，并且还需要更新数据库文本信息以及路径信息
function updateInfo(fields, files, res){
  var str = "";
  var uId = fields.wikiid[0];
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
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/wiki/');

  //如果存在上传文件
  if(files.imgs[0].originalFilename){
    // 判断文件夹是否存在,如果文件夹存在，删除里边所有文件 
    fs.exists(filePath+uId, function(exists){ 
     if(exists){ 
        var dirList = fs.readdirSync(filePath+uId);
        dirList.forEach(function(fileName){
          fs.unlinkSync(filePath+uId+'/'+fileName);
        });
        console.log('删除成功');

        //*******************
        for (var i  in files.imgs) {
          //if(i > 1) break; //最多1张
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
        //将路径和卡片信息存入数据库
        var sql = 'UPDATE wiki SET wikiname="'+ wikiname +'", english_name="'+english_name+'", category="'+category+'", manufacturer="'+manufacturer+'", brand="'+brand+'",picture="'+str+'",series="'+series+'",serial_number="'+serial_number+'",rarity="'+rarity+'",price="'+price+'",describes="'+describes+'" WHERE wikiid = "'+uId+'"';
        console.log(sql);
        User.exec(sql, function(err, user){
          if(err){
            return res.json({error:"用户信息修改失败"});
          }
          return res.render('wiki_manage/wikiManage.html');
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
    //var sql = 'UPDATE user SET gender="'+ gender +'", email="'+email+'", telephone="'+telephone+'", score="'+score+'", IDCardNo="'+IDCardNo+'" WHERE userid = "'+uId+'"';
    var sql = 'UPDATE wiki SET wikiname="'+ wikiname +'", english_name="'+english_name+'", category="'+category+'", manufacturer="'+manufacturer+'", brand="'+brand+'",series="'+series+'",serial_number="'+serial_number+'",rarity="'+rarity+'",price="'+price+'",describes="'+describes+'" WHERE wikiid = "'+uId+'"';
    User.exec(sql, function(err, user){
      if(err){
        return res.json({error:"用户信息修改失败"});
      }
      return res.render('wiki_manage/wikiManage.html');
    });
        
  }
};

router.get('/check',function(req, res, next){
  var username = req.session.username;
  var password = req.session.password;

  return res.render("wiki_manage/check.html");
});
//先更新wiki表信息相应记录，然后在删除wiki_pre表中的相应记录
router.post('/check',function(req, res, next){
  var describes = req.body.describes;
  var wikiid = req.body.wikiid;
  var sql1 = 'UPDATE wiki SET describes="'+ describes +'" WHERE wikiid = "'+wikiid+'"';
  var sql2 = 'delete from wiki_pre where wikiid="'+wikiid+'"';
  console.log("sql1=======:",sql1);
  console.log("sql2=======:",sql2);
  User.exec(sql1, function(err,r){
    if(err){
      return res.json({error:"error"});
    }
    else{
      User.exec(sql2, function(err, r){
        if(err){
          return res.json({error:"error"});
        }
        return res.json({success:"success"});
      })
    }
  });

})
router.post('/checkquery',function(req, res, next){
  var sql = 'select * from wiki_pre';
  User.exec(sql, function(err, r){
    if(err){
      console.log("获取审核表数据错误！");
      return res.json({error:err});
    }
    return res.json(r);
  });
});



module.exports = router;