var express = require('express');
var uuid = require('node-uuid');
var User = require('../models/user.js');
var multiparty = require('multiparty');
var path = require('path');
var fs = require('fs');

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

router.get('/login', function(req, res, next){
  res.render('login.html');
});
router.get('/test', function(req, res, next){
  res.render('test.html',{title:'测试程序'});
});
router.post('/login', function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;
  console.log('username: '+username+', password: '+password);
  res.sendFile('card_manage/CardManage.html', options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', 'index.html');
      //return res.render('card_manage/CardManage.html');
    }
  });
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
  var sql = 'insert into card(cardid, title, describes, price, logistic, category, brand, freight, exchange, owner, amount) values';
  sql = sql + '("'+uId+'","'+title+'","'+describes+'","'+price+'","'+logistic+'","'+category+'","'+brand+'","'+freight+'","'+exchange+'","'+owner+'","'+amount+'")';
  console.log(sql);
  //res.json({err:'err'});
  Card.add(sql, function(err, user){
    if(err){
      return res.json({error:'卡信息添加失败'});
    }
    saveImg(uId, files, res);
  });

};
function saveImg(id, files, res){
  var filePath = path.join(__dirname, '../public/imgs/card/');
  fs.mkdir(filePath+id, function(err){
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
        fs.renameSync(file.path, filePath+id+'/'+i+'.'+String(types[types.length-1]));
      };
      console.log('卡片添加成功');
      return res.render('card_manage/CardManage.html');
    }
  })
}

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

router.post('/update', function(req, res, next){
   var cardInfo = {
    cardid    : req.body.cardid,
    title     : req.body.title,
    describes : req.body.describes,
    price     : req.body.price,
    logistic  : req.body.logistic,
    category  : req.body.category,
    brand     : req.body.brand,
    freight   : req.body.freight,
    exchange  : req.body.exchange,
    amount    : req.body.amount
    };
    console.log(cardInfo);
    Card.update(cardInfo,function(err,r){
      if(err){
        console.log(err);
        return res.json({error:err});
      }
      return res.render('card_manage/CardManage.html');
    });

    //
});

router.get('/picture', function(req, res, next){
  var filePath = path.join(__dirname, '../public/imgs/card/'+req.query.cardid);
    console.log(req.query.cardid);
    var files = fs.readdirSync(filePath);
     res.render('card_manage/picture', { title: 'My Little Star',imgs:files, filePath: '../imgs/card/'+req.query.cardid});
});

// router.post('/update', function(req, res, next){
//   var card = {
//     cardid    : req.body.cardid,
//     title     : req.body.title,
//     describes : req.body.describes,
//     price     : req.body.price,
//     logistic  : req.body.logistic,
//     category  : req.body.category,
//     brand     : req.body.brand,
//     freight   : req.body.freight,
//     exchange  : req.body.exchange,
//     amount    : req.body.amount,
//     owner     : req.body.owner
//   };



//   Card.update(card, function(err, res){
//     if (err)
//       return res.json({error : err});
//     return res.json({success : res});
//   })
// });

router.post('/delete', function(req, res, next){
    Card.delete(req.body.cardid, function(err, r){
        if (err)
           return res.json({error : err});
        return res.json({sucess:r});
    });
});

router.post('/detail', function(req, res, next){
  Card.queryByID(req.body.cardid, function(err, card){
        if (err)
           return res.json({error : err});
        return res.json({card : card});
  });
});


module.exports = router;

