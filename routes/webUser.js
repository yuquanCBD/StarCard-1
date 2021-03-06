/*
 * web部分
*/
var express = require('express');
var uuid = require('node-uuid');
var User = require('../models/user.js');
var Util = require('../util/captchaUtil.js');
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
	return res.json({error:'数据解析错误'});
  res.render('test.html',{title:'测试程序'});
});

router.get('/add',function(req, res, next){
  var obj = req.session.starObj;
  if(obj === undefined){
    return res.render("card_manage/login.html");
  }
	res.sendFile('card_manage/userAdd.html', options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', 'card_manage/userAdd.html');
      //return res.render('card_manage/CardManage.html');
    }
  });
});
//添加用户信息，带有图片的post请求
router.post("/add",function(req, res, next){
	var form = new multiparty.Form();
  form.parse(req, function(err, fields, files){
    if(err){
      console.log(err);
      res.json({error:'数据解析错误'});
      return;
    };
    addInfo(fields, files, res);
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
  var uId = fields.userid[0];
  //var username = fields.username[0];
  var gender = fields.gender[0];
  var email = fields.email[0];
  var telephone = fields.telephone[0];
  var score = fields.score[0];
  var IDCardNo = fields.IDCardNo[0];
  var identificated = fields.identificated[0];
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/user/');
  //console.log(files.imgs[0]);
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
          if(i > 1) break; //最多1张
          var file = files.imgs[i];
          if(file.originalFilename.length == 0){
            break;
          }
          var date = new Date();
          var imgName = String(date.getTime());
          var types = file.originalFilename.split('.');
          var p = "imgs/user/"+uId+'/'+imgName+'.'+String(types[types.length-1]);
          if(str === ""){
            str += p;
          }
          else{
            str += (','+p);
          }
          fs.renameSync(file.path, filePath+uId+'/'+imgName+'.'+String(types[types.length-1]));
        };
        console.log('图片信息添加成功');
        //将路径和卡片信息存入数据库
        var sql = 'UPDATE user SET gender="'+ gender +'", email="'+email+'", telephone="'+telephone+'", score="'+score+'", IDCardNo="'+IDCardNo+'",portrait="'+str+'", identificated="'+identificated+'" WHERE userid = "'+uId+'"';

        console.log(sql);
        // User.exec(sql, function(err, user){
        //   if(err){
        //     return res.json({error:"用户信息修改失败"});
        //   }

        //   Util.sendIdenResult(telephone,identificated);
        //   return res.render('card_manage/userManage.html');
        // });


        var sql1 = 'select * from user where userid="'+uId+'" and identificated="'+identificated+'"';
        User.exec(sql1, function(err, rows){
          if(err){
            return res.json({error:"用户信息修改失败"});
          }
          if(rows.length <= 0) //认证状态已经被修改
          {
            console.log("发短信啦啦啦啦啦啦啦");
            Util.sendIdenResult(telephone,identificated);
          }
          User.exec(sql, function(err){
            if(err){
              return res.json({error:"用户信息修改失败"});
            }
            //Util.sendIdenResult(telephone,identificated);
            return res.render('card_manage/userManage.html');
            })
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
    var sql = 'UPDATE user SET gender="'+ gender +'", email="'+email+'", telephone="'+telephone+'", score="'+score+'", IDCardNo="'+IDCardNo+'",identificated="'+identificated+'" WHERE userid = "'+uId+'"';
    // User.exec(sql, function(err, user){
    //   if(err){
    //     return res.json({error:"用户信息修改失败"});
    //   }
    //   Util.sendIdenResult(telephone,identificated);
    //   return res.render('card_manage/userManage.html');
    // });

    var sql1 = 'select * from user where userid="'+uId+'" and identificated="'+identificated+'"';
    User.exec(sql1, function(err, rows){
      if(err){
        return res.json({error:"用户信息修改失败"});
      }
      if(rows.length <= 0) //认证状态已经被修改
      {
        console.log("发短信啦啦啦啦啦啦啦");
        Util.sendIdenResult(telephone,identificated);
      }
      User.exec(sql, function(err){
        if(err){
          return res.json({error:"用户信息修改失败"});
        }
        //Util.sendIdenResult(telephone,identificated);
        return res.render('card_manage/userManage.html');
        })
    });
        
  }
};
//添加信息
function addInfo(fields, files, res){
  var str = "";
  var uId = uuid.v1();
  var username = fields.username[0];
  var password = fields.password[0];
  var IDCardNo = fields.IDCardNo[0];
  var telephone = fields.telephone[0];
  var score = fields.score[0];
  var gender = fields.gender[0];
  var email = fields.email[0];
  var md5 = crypto.createHash('md5');
	password = md5.update(password).digest('base64');
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/user/');
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
        var date = new Date();
        var imgName = String(date.getTime());

        var types = file.originalFilename.split('.');
        var p = "imgs/user/"+uId+'/'+imgName+'.'+String(types[types.length-1]);
        if(str === ""){
          str += p;
        }
        else{
          str += (','+p);
        }
        fs.renameSync(file.path, filePath+uId+'/'+imgName+'.'+String(types[types.length-1]));
      };
      console.log('图片信息添加成功');
      console.log(str);
      //将路径和卡片信息存入数据库
      var sql = 'insert into user(userid, username, password, IDCardNo, telephone, score, gender, email, portrait, identificated) values';
      sql = sql + '("'+uId+'","'+username+'","'+password+'","'+IDCardNo+'","'+telephone+'","'+score+'","'+gender+'","'+email+'","'+str+'", 1)';
      console.log(sql);
      User.exec(sql, function(err, user){
        if(err){
          return res.json({error:"用户信息添加失败"});
        }
        return res.render('card_manage/userAdd.html');
      });
    }
  });
};

//用户名信息验证
router.post("/userCheck",function(req, res, next){
	var username = req.body.username;
	console.log("========",username);
	User.checkUserByName(username,function(err,rows){
    console.log("****************");
		if(err){
			res.json({error:"数据库查询错误!"});
		}
		else{
			if(rows.length > 0){
				console.log("呦呦呦");
				res.json({success:true});
			}
			else{
				console.log("wuwuwu");
				res.json({success:false});
			}
		}
	})
});

//用户信息管理
router.get('/query', function(req, res ,next){
  var obj = req.session.starObj;
  if(obj === undefined){
    return res.render("card_manage/login.html");
  }
  res.render('card_manage/userManage.html');
});

router.post('/query', function(req, res, next){
  var sql = "select * from user card order by create_time DESC";
  User.exec(sql, function(err, rows){
    if(err){
      console.log("======>",err);
      return res.json({err:"数据库查询错误"});
    }
    //console.log("user query======>",rows);
    return res.json(rows);
  });       
});

//根据id删除用户信息
router.post("/delete",function(req, res, next){
  var userid = req.body.userid;
  var sql = 'DELETE FROM user WHERE userid = "'+userid+'"';
  console.log("=======================");
  User.exec(sql, function(err, r){
    if (err)
       return res.json({error : err});
    console.log('开始删除');
    var filePath = path.join(__dirname, '../public/imgs/user/');
    var dirpath = filePath+userid;
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
  })
});

/*****************   超级管理员部分  *********************/
router.get("/getmanager",function(req, res, next){
  var obj = req.session.starObj;
  if(obj === undefined){
    return res.render("card_manage/login.html");
  }
  var username = req.session.username;
  var password = req.session.password;
  var sql = 'select * from manager where username="'+username+'" and password="'+password+'"';
  User.exec(sql, function(err, row){
    if(err){
      return res.render("card_manage/manager_common.html");
    }
    if(row.length <= 0){
      return res.render("card_manage/manager_common.html");
    }
    if(row[0].super == 1){
      return res.render("card_manage/manager_super.html");
    }
    else{
      return res.render("card_manage/manager_common.html");
    }
  });
});
//查询所有管理员信息
router.post('/mquery',function(req, res, next){
  var sql = "select * from manager";
  User.exec(sql, function(err, rows){
    if(err){
      console.log("======>",err);
      return res.json({err:"数据库查询错误"});
    }
    //console.log("user query======>",rows);
    return res.json(rows);
  });
});
//添加管理员信息
router.post('/madd',function(req, res, next){
  var form = new multiparty.Form();
  var username = req.session.username;
  if(username === undefined){
    console.log("用户名为空");
    return res.render("card_manage/manager_common.html");
  }
  form.parse(req, function(err, fields, files){
    if(err){
      console.log(err);
      res.json({error:'数据解析错误'});
      return;
    };
    var username = fields.username[0];
    var sqlCheck = 'select * from manager where username="'+username+'"';
    //先检查传过来的用户名是否存在，然后再进行添加
    User.exec(sqlCheck, function(err, re){
      if(err){
        return res.render("card_manage/manager_super.html");
      }
      if(re.length >= 1){
        return res.render("card_manage/manager_super.html");
      }
      else{
        addInfoM(fields, files, res);
      }
    });
   
  });
});

//添加管理员信息
function addInfoM(fields, files, res){
  var str = "";
  var uId = uuid.v1();
  var username = fields.username[0];
  var password = fields.password[0];
  var IDCardNo = fields.IDCardNo[0];
  var telephone = fields.telephone[0];
  var gender = fields.gender[0];
  var email = fields.email[0];
  var issuper = fields.super[0];
  var md5 = crypto.createHash('md5');
  password = md5.update(password).digest('base64');
  console.log("username:",username," password:",password," gender:",gender);
  
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/manager/');
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
        var date = new Date();
        var imgName = String(date.getTime());
        var types = file.originalFilename.split('.');
        var p = "imgs/manager/"+uId+'/'+imgName+'.'+String(types[types.length-1]);
        if(str === ""){
          str += p;
        }
        else{
          str += (','+p);
        }
        fs.renameSync(file.path, filePath+uId+'/'+imgName+'.'+String(types[types.length-1]));
      };
      console.log('图片信息添加成功');
      console.log(str);
      //将路径和卡片信息存入数据库
      var sql = 'insert into manager(userid, username, password, IDCardNo, telephone, gender, email, super, portrait) values';
      sql = sql + '("'+uId+'","'+username+'","'+password+'","'+IDCardNo+'","'+telephone+'","'+gender+'","'+email+'","'+issuper+'","'+str+'")';
      console.log(sql);
      User.exec(sql, function(err, user){
        if(err){
          return res.json({error:"管理员信息添加失败"});
        }
        return res.render("card_manage/manager_super.html");
      });
    }
  });
};

//管理员用户名信息验证
router.post("/managerCheck",function(req, res, next){
  var username = req.body.username;
  var sql = 'select * from manager where username="'+username+'"';
  User.exec(sql, function(err,rows){
    if(err){
      res.json({error:"数据库查询错误!"});
    }
    else{
      if(rows.length > 0){
        res.json({success:true});
      }
      else{
        res.json({success:false});
      }
    }
  })
});

//删除管理员信息
router.post("/mdelete",function(req, res, next){
  var userid = req.body.userid;
  var sql = 'DELETE FROM manager WHERE userid = "'+userid+'"';
  User.exec(sql, function(err, r){
    if (err)
       return res.json({error : err});
    console.log('开始删除');
    var filePath = path.join(__dirname, '../public/imgs/manager/');
    var dirpath = filePath+userid;
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
  })
});

//根据提交的id更新管理员信息，原则上不允许修改用户名以及用户id
router.post("/mupdate",function(req, res, next){
  var username = req.session.username;
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files){
    if(err){
      console.log(err);
      res.json({error:"数据解析错误"});
      return;
    };
    MupdateInfo(fields, files, res);
  })
});
//更新信息，逻辑
//1.如果用户没有修改图片，那么只需要修改文本信息然后更新数据库
//2.如果用户修改图片，那么需要将原来图片删除，然后将新文件写进原来文件夹，并且还需要更新数据库文本信息以及路径信息
function MupdateInfo(fields, files, res){
  var str = "";
  var uId = fields.userid[0];
  //var username = fields.username[0];
  var gender = fields.gender[0];
  var email = fields.email[0];
  var telephone = fields.telephone[0];
  var issuper = fields.super[0];
  var IDCardNo = fields.IDCardNo[0];
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/manager/');
  //console.log(files.imgs[0]);
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
          if(i > 1) break; //最多1张
          var file = files.imgs[i];
          if(file.originalFilename.length == 0){
            break;
          }
          var date = new Date();
          var imgName = String(date.getTime());
          var types = file.originalFilename.split('.');
          var p = "imgs/manager/"+uId+'/'+imgName+'.'+String(types[types.length-1]);
          if(str === ""){
            str += p;
          }
          else{
            str += (','+p);
          }
          fs.renameSync(file.path, filePath+uId+'/'+imgName+'.'+String(types[types.length-1]));
        };
        console.log('图片信息添加成功');
        //将路径和卡片信息存入数据库
        var sql = 'UPDATE manager SET gender="'+ gender +'", email="'+email+'", telephone="'+telephone+'", super="'+issuper+'", IDCardNo="'+IDCardNo+'",portrait="'+str+'" WHERE userid = "'+uId+'"';
        console.log(sql);
        User.exec(sql, function(err, user){
          if(err){
            return res.json({error:"用户信息修改失败"});
          }
          return res.render("card_manage/manager_super.html");
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
    var sql = 'UPDATE manager SET gender="'+ gender +'", email="'+email+'", telephone="'+telephone+'", super="'+issuper+'", IDCardNo="'+IDCardNo+'" WHERE userid = "'+uId+'"';
    User.exec(sql, function(err, user){
      if(err){
        return res.json({error:"用户信息修改失败"});
      }
      return res.render("card_manage/manager_super.html");
    });
        
  }
};

//禁言与解除禁言处理
router.post('/shutup',function(req,res,next){
  var userid = req.body.userid;
  var shutup = req.body.shutup;
  User.updateShutup(userid, shutup, function(err, r){
    if(err){
      return res.json({err:"数据库错误"});
    }
    return res.json({success:"success"});
  })
});

module.exports = router;