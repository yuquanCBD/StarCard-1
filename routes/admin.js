/*
 * web部分
*/
var express = require('express');
var uuid = require('node-uuid');
var User = require('../models/user.js');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var router = express.Router();
var Card = require('../models/card');
var logger = require('../helper/logger').logger('admin');


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
  res.render('test.html',{title:'测试程序'});
});
router.post('/login', function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;
  console.log('username: '+username+', password: '+password);
  var sql = 'select * from manager where username="'+username+'" and password="'+password+'"';
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
      
      console.log("rows[0]==========>",rows[0].username);
      return res.render("card_manage/index.html");
    }

  })
  // res.sendFile('card_manage/index.html', options, function (err) {
  //   if (err) {
  //     console.log(err);
  //     res.status(err.status).end();
  //   }
  //   else {
  //     console.log('Sent:', 'card_manage/index.html');
  //     //return res.render('card_manage/CardManage.html');
  //   }
  // });
});
router.get('/starcardAdd',function(req, res, next){
  res.render('card_manage/StarCardAdd.html');
});
router.post('/starcardAdd',function(req, res, next){
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files){
    if(err){
      console.log(err);
      res.json({error:'数据解析错误'});
      return;
    };
    addInfo(fields, files, res);
  })
});

function addInfo(fields, files, res){
  var str = "";
  var uId = uuid.v1();
  var title = fields.title[0];
  var price = fields.price[0];
  var amount = fields.amount[0];
  var category = fields.category[0];
  var brand = fields.brand[0];
  var logistic = fields.logistic[0];
  var freight = fields.freight[0];
  var exchange = fields.exchange[0];
  var describes = fields.describes[0];
  var owner = 0;
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
        var types = file.originalFilename.split('.');
        var p = "imgs/card/"+uId+'/'+i+'.'+String(types[types.length-1]);
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
      var sql = 'insert into card(cardid, title, describes, price, logistic, category, brand, freight, exchange, owner, amount, pictures) values';
      sql = sql + '("'+uId+'","'+title+'","'+describes+'","'+price+'","'+logistic+'","'+category+'","'+brand+'","'+freight+'","'+exchange+'","'+owner+'","'+amount+'","'+str+'")';
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

router.get('/query', function(req, res ,next){
  res.render('card_manage/CardManage.html');
});

router.post('/query', function(req, res, next){
    Card.query(function(err, cards){
        if (err)
            return res.json({error: err});
        console.log(cards);
        return res.json(cards);    
    });         
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
  var logistic = fields.logistic[0];
  var freight = fields.freight[0];
  var exchange = fields.exchange[0];
  var describes = fields.describes[0];
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
          fs.unlinkSync(filePath+uId+'/'+fileName);
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
          var p = "imgs/card/"+uId+'/'+i+'.'+String(types[types.length-1]);
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
        var sql = 'UPDATE card SET title="'+ title +'", describes="'+describes+'", price="'+price+'", logistic="'+logistic+'", category="'+category+'", brand="'+brand+'", freight="'+freight+'", exchange="'+exchange
          +'",amount="'+amount+'",pictures="'+str+'" WHERE cardid = "'+uId+'"';
        console.log(sql);
        Card.update(sql, function(err, user){
          if(err){
            return res.json({error:"卡信息修改失败"});
          }
          return res.render('card_manage/CardManage.html');
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
    var sql = 'UPDATE card SET title="'+ title +'", describes="'+describes+'", price="'+price+'", logistic="'+logistic+'", category="'+category+'", brand="'+brand+'", freight="'+freight+'", exchange="'+exchange
          +'",amount="'+amount+'" WHERE cardid = "'+uId+'"';
    Card.update(sql, function(err, user){
      if(err){
        return res.json({error:"卡信息修改失败"});
      }
      return res.render('card_manage/CardManage.html');
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
            return res.json({sucess:r});
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
  res.render("card_manage/userAdd.html");
});
module.exports = router;

