/*
 * web部分，卡片
*/
var express = require('express');
var uuid = require('node-uuid');
var User = require('../models/user.js');
var Comment = require('../models/comment');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var router = express.Router();
var Card = require('../models/card');
var crypto = require('crypto');

var options = {
	root: __dirname + '/../views/',
	dotfiles: 'deny',
	headers: {
	    'x-timestamp': Date.now(),
	    'x-sent': true
	}
};

router.get('/login', function(req, res, next){
  res.render('card_manage/login.html');
});
router.get('/test', function(req, res, next){
  // //var sql = "SELECT Max(a.salary+c.salary) FROM salary as a inner join employee as b inner join salary as c on a.id = b.id and b.spouse_id = c.id";
  // var sql = "select a.name from employee as a inner join salary as b on a.spouse_id = b.id having Max(b.salary);"
  // User.exec(sql, function(err,rows){
  //   return res.json(rows);
  // })
  res.render('test.html',{title:'测试程序'});
});
router.post('/login', function(req, res, next){
  //生成口令的散列值
  var md5 = crypto.createHash('md5');

  var username = req.body.username;
  // var password = req.body.password;
  // var md5 = crypto.createHash('md5');
  // password = md5.update(password).digest('base64');
  var password = md5.update(req.body.password).digest('base64');

  console.log('username: '+username+', password: '+password);
  var sql = 'select * from manager where username="'+username+'" and password="'+password+'"';

  // var sqlTest = "select user.telephone,manager.telephone from user full outer join manager on user.userid = manager.userid";
  // User.exec(sqlTest, function(err, r){
  //   if(err){
  //     console.log(err);
  //     console.log("测试sql出现错误!");
  //     return res.render("card_manage/index.html");
  //   }
  //   else
  //     console.log("测试sql执行结果：",r);
  //     return res.render("card_manage/index.html");
  // });


  User.exec(sql, function(err, rows){
    if(err){
      console.log("login error========>",err);
      return res.render("card_manage/login_error.html");
    }
    if(rows.length <= 0){
      console.log("========== login_error.html ==========");
      return res.render("card_manage/login_error.html");
    }
    else{
      req.session.username = username;
      req.session.password = password;
      req.session.userid = rows[0].userid;
      req.session.starObj = {username:username, password:password, userid:rows[0].userid};
      console.log("rows[0]==========>",rows[0].username);
      return res.render("card_manage/index.html");
    }
  });

});
router.get('/starcardAdd',function(req, res, next){
  if(req.session.starObj === undefined){
    return res.render('card_manage/login.html');
  };
  res.render('card_manage/StarCardAdd.html');
});
router.post('/starcardAdd',function(req, res, next){
  if(req.session.starObj === undefined){
    return res.render('card_manage/login.html');
  };
  var cid = req.session.starObj.userid; //用户id
  var username = req.session.starObj.username;
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files){
    if(err){
      console.log(err);
      res.json({error:'数据解析错误'});
      return;
    };
    addInfo(fields, files, res, cid, username);
  })
});

function addInfo(fields, files, res, cid, username){
  var str = "";
  var mainStr = "";
  var uId = uuid.v1();
  var title = fields.title[0];
  var price = parseInt(fields.price[0]);
  var amount = parseInt(fields.amount[0]);
  var category = fields.category[0];
  var brand = fields.brand[0];
  //var logistic = fields.logistic[0];
  var freight = fields.freight[0];
  var exchange = fields.exchange[0];
  var describes = fields.describes[0];
  var exchange_desc = fields.exchange_desc[0];
  if(exchange_desc == ""){
    exchange_desc = "无";
  }
  var owner = cid;
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/card/');
  fs.mkdir(filePath+uId, function(err){
    if(err){
      console.log(err);
      return res.json({error:'存储图片失败'});
    }
    else{
      for (var i  in files.imgs) {
        if(i > 2) break; //最多三张
        var file = files.imgs[i];
        if(file.originalFilename.length == 0){
          break;
        }
        var date = new Date();
        var imgName = String(date.getTime());
        var types = file.originalFilename.split('.');
        var p = "imgs/card/"+uId+'/'+imgName+'.'+String(types[types.length-1]);
        if(str === ""){
          str += p;
        }
        else{
          str += (','+p);
        }
        fs.renameSync(file.path, filePath+uId+'/'+imgName+'.'+String(types[types.length-1]));
      };
      for (var i  in files.mainImgs) {
        if(i > 0) break; //最多1张
        var file = files.mainImgs[i];
        if(file.originalFilename.length == 0){
          break;
        }
        var types = file.originalFilename.split('.');
        var p = "imgs/card/"+uId+'/main.'+String(types[types.length-1]);
        if(mainStr === ""){
          mainStr += p;
        }
        else{
          mainStr += (','+p);
        }
        if(str === ""){
          str += mainStr;
        }
        else{
          str +=(','+mainStr);
        }
        fs.renameSync(file.path, filePath+uId+'/main.'+String(types[types.length-1]));
      };

      console.log('图片信息添加成功');
      console.log(str,' %%%%%%% ',mainStr);
      //将路径和卡片信息存入数据库
      var sql = 'insert into card(cardid, title, describes, price, exchange_desc, category, brand, exchange, owner, amount, pictures, main_img, ownername, freight) values';
      sql = sql + '("'+uId+'","'+title+'","'+describes+'","'+price+'","'+exchange_desc+'","'+category+'","'+brand+'","'+exchange+'","'+owner+'","'+amount+'","'+str+'","'+mainStr+'","'+username+'","'+freight+'")';
      console.log(sql);
      Card.add(sql, function(err, user){
        if(err){
          return res.json({error:"卡信息添加失败"});
        }
        return res.render('card_manage/StarCardAdd.html');
      });
    }
  });
};

router.get('/commonquery', function(req, res ,next){
  if(req.session.starObj === undefined){
    return res.render('card_manage/login.html');
  };
  res.render('card_manage/cCardManage.html');
});
router.get('/managerquery', function(req, res ,next){
  if(req.session.starObj === undefined){
    return res.render('card_manage/login.html');
  };
  res.render('card_manage/mCardManage.html');
});

router.post('/query', function(req, res, next){
  var obj = req.session.starObj;
  if(obj === undefined){
    return res.json({error:"error"});
  }
  var obj = req.session.starObj;
  console.log("=============----------------=====================",obj);
  Card.query(function(err, cards){
      if (err)
          return res.json({error: err});
      //console.log("======================",cards);
      return res.json(cards);    
  });         
});
router.post('/commonquery', function(req, res, next){
  var sqlTest = "select * from card inner join user on card.owner = user.userid"
  User.exec(sqlTest , function(err, rows){
    if(err){
      return res.json({error: err});
    }
    return res.json(rows);
  })
});
//
router.post('/managerquery',function(req, res, next){
  var sqlTest = "select * from card inner join manager on card.owner = manager.userid"
  User.exec(sqlTest, function(err, rows){
    if(err){
      console.log("==============================:",err)
      return res.json({error:err});
    }
    else{
      console.log("==============================:",rows);
      return res.json(rows);
    }
  })
});
//逻辑
//1.如果用户没有修改图片，那么只需要修改文本信息然后更新数据库
//2.如果用户修改图片，那么需要将原来图片删除，然后将新文件写进原来文件夹，并且还需要更新数据库文本信息以及路径信息
function updateInfo(fields, files, res){
  var str = "";
  var uId = fields.cardid[0];
  var title = fields.title[0];
  var price = fields.price[0];
  var amount = fields.amount[0];
  var category = fields.category[0];
  var brand = fields.brand[0];
  //var logistic = fields.logistic[0];
  var freight = fields.freight[0];
  var exchange = fields.exchange[0];
  var describes = fields.describes[0];
  var exchange_desc = fields.exchange_desc[0];
  var owner = 0;
  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/card/');
  //console.log(files.imgs[0]);
  //如果存在上传文件
  if(files.imgs[0].originalFilename){
    // 判断文件夹是否存在,如果文件夹存在，删除里边所有文件 
    fs.exists(filePath+uId, function(exists){ 
     if(exists){ 
        var dirList = fs.readdirSync(filePath+uId);
        dirList.forEach(function(fileName){
          var splitPath = fileName.split('.');
          if(splitPath[0] != "main"){
            fs.unlinkSync(filePath+uId+'/'+fileName);
          }
          else{
            str+="imgs/card/"+uId+'/'+fileName;
          }
        });
        console.log('删除成功');

        //*******************
        for (var i  in files.imgs) {
          if(i > 2) break; //最多三张
          var file = files.imgs[i];
          if(file.originalFilename.length == 0){
            break;
          }
          var date = new Date();
          var imgName = String(date.getTime());
          var types = file.originalFilename.split('.');
          var p = "imgs/card/"+uId+'/'+imgName+'.'+String(types[types.length-1]);
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
        var sql = 'UPDATE card SET title="'+ title +'", describes="'+describes+'", price="'+price+'", exchange_desc="'+exchange_desc+'", category="'+category+'", brand="'+brand+'", freight="'+freight+'", exchange="'+exchange
          +'",amount="'+amount+'",pictures="'+str+'" WHERE cardid = "'+uId+'"';
        console.log(sql);
        Card.update(sql, function(err, user){
          if(err){
            return res.json({error:"卡信息修改失败"});
          }
          return res.render('card_manage/mCardManage.html');
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
    var sql = 'UPDATE card SET title="'+ title +'", describes="'+describes+'", price="'+price+'", exchange_desc="'+exchange_desc+'", category="'+category+'", brand="'+brand+'", freight="'+freight+'", exchange="'+exchange
          +'",amount="'+amount+'" WHERE cardid = "'+uId+'"';
    Card.update(sql, function(err, user){
      if(err){
        return res.json({error:"卡信息修改失败"});
      }
      return res.render('card_manage/mCardManage.html');
    });    
  }
};
router.post('/update', function(req, res, next){
   var form = new multiparty.Form();
   form.parse(req, function(err, fields, files){
    if(err){
      console.log(err);
      return;
    }
    updateInfo(fields, files, res);
   })
});

router.get('/picture', function(req, res, next){
  var filePath = path.join(__dirname, '../public/imgs/card/'+req.query.cardid);
    console.log(req.query.cardid);
    var files = fs.readdirSync(filePath);
     res.render('card_manage/picture', { title: 'My Little Star',imgs:files, filePath: '../imgs/card/'+req.query.cardid});
});

router.post('/delete', function(req, res, next){
    Card.delete(req.body.cardid, function(err, r){
        if (err)
           return res.json({error : err});
        console.log('开始删除');
        var filePath = path.join(__dirname, '../public/imgs/card/');
        var dirpath = filePath+req.body.cardid;
        exec('rm -rf '+dirpath, function(err){
          if(err){
            return console.log('删除图片文件夹失败');
          }
          else{
            console.log('删除图片文件夹成功');
            return res.json({success:r});
          }
        });
        //return res.json({sucess:r});
    });
});

router.post('/detail', function(req, res, next){
  console.log("detail==============");
  Card.queryByID(req.body.cardid, function(err, card){
        if (err)
           return res.json({error : err});
        return res.json({card : card});
  });
});

router.get("/userAdd",function(req, res, next){
  var obj = req.session.starObj;
  if(obj === undefined){
    return res.render("card_manage/login.html");
  }
  res.render("card_manage/userAdd.html");
});


/*****************       用户评论模块   *******************/
router.post('/delcomment',function(req, res, next){
  var commentid = req.body.commentid;
  Comment.delcomment(commentid, function(err, r){
    if(err){
      return res.json({err:"数据库错误"});
    }
    else{
      return res.json({success:"success"});
    }
  })
});
router.get('/querycomment',function(req, res, next){
  var obj = req.session.starObj;
  if(obj === undefined){
    return res.render("card_manage/login.html");
  }
  var cardid = "b2ac5370-5136-11e5-aa92-93f9048adb9b";
  var cardid = req.query.cardid;
  return res.render("card_manage/comment.html",{cardid:cardid});
});
router.post('/querycomment',function(req, res, next){
  var cardid = req.body.cardid;
  Comment.showCardComments(cardid, function(err, rows){
    if(err){
      return res.json({err:"数据库操作错误"});
    }
    else{
      console.log(rows);
      return res.json(rows);
    }
  })
});


module.exports = router;

