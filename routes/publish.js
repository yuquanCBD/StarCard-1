var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var uuid = require('node-uuid');
var Card = require('../models/card');
var User = require('../models/User');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;

router.get('/', function(req, res, next){
console.log("Request handler 'start' was called."); 
 
  var body = '<html>'+ 
     '<head>'+ 
    '<meta http-equiv="Content-Type" content="text/html; '+ 
    'charset=UTF-8" />'+ 
    '</head>'+ 
    '<body>'+ 
    '<form action="/publish/update" enctype="multipart/form-data" '+ 
    //'<form action="/publish/delete"'+ 
    'method="post">'+ 
    '卡片名称<input type="text" name="title" value="card1" /></br>'+
    '描述<input type="text" name="describes" value="card1" /></br>'+
    '价格<input type="text" name="price" value="1.0" /></br>'+
    '物流<input type="text" name="logistic" value="顺丰" /></br>'+
    '<input type="text" name="category" value="其他卡" /></br>'+
    '<input type="text" name="cardid" value="d54c37e0-21fe-11e5-85a9-5d2b18c36f80" /></br>'+
    '<input type="text" name="brand" value="Futera" /></br>'+
    '<input type="text" name="freight" value="5" /></br>'+
    '<input type="text" name="exchange" value="1" /></br>'+
    '<input type="text" name="owner" value="userid001" /></br>'+
    '<input type="text" name="amount" value="3" /></br>'+
    '<input type="text" name="longitude" value="120.2" /></br>'+
    '<input type="text" name="latitude" value="30.3" /></br>'+
    '<input type="file" name="imgs" multiple="multiple"></br>'+ 
    '<input type="submit" value="Upload file" />'+ 
    '</form>'+ 
    '</body>'+ 
    '</html>'; 
 
    res.writeHead(200, {"Content-Type": "text/html"}); 
    res.write(body); 
    res.end(); 
});
router.get('/getscore', function(req, res, next){
	var username = req.query.username;
	var sql = 'select score from user where username = "'+ username +'"';
	User.query(sql, function(err, rows){
		if(err){
			return res.json({err:'查询积分失败'});
		}
		return res.json(rows[0]);//{"score":5}
	});

});
router.get('/getcard', function(req, res, next){
	var owner = req.query.owner;
	Card.searchCardsByOwner(owner, function(err, r){
		if(err){
			return res.json({error:err});
		}
		return res.json(r);
	});
});
router.post('/', function(req, res, next){
	//存储卡片照片，依据cardid在public/imgs/card目录下创建同名目录，图片存储在此目录中
	//TODO
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		addInfo(fields, files, res);
	});
});
//删除卡片数据库信息以及图片文件夹信息
router.post('/delete', function(req, res, next){
	var filePath = path.join(__dirname, '../public/imgs/card/');
	var dirpath = filePath + req.body.cardid;
	exec('rm -rf '+dirpath, function(err){
      if(err){
      	console.log('删除图片文件夹失败');
        return res.json({error:err});
      }
      else{
        console.log('删除图片文件夹成功');
        Card.delete(req.body.cardid, function(err, r){
        	if(err){
        		console.log('删除数据库信息失败');
        		return res.json({error:err});
        	}
        	return res.json({sucess:'sucess'});
        })
      }
    });
});
//修改卡片信息
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
//逻辑
//1.如果用户没有修改图片，那么只需要修改文本信息然后更新数据库
//2.如果用户修改图片，那么需要将原来图片删除，然后将新文件写进原来文件夹，并且还需要更新数据库文本信息以及路径信息
//3.原则上用户卡片的owner信息不允许改变
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
  var longitude = fields.longitude[0];
  var latitude = fields.latitude[0];
  //var owner = fields.owner[0];
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
          +'",amount="'+amount+'",longitude="'+longitude+'",latitude="'+latitude+'",pictures="'+str+'" WHERE cardid = "'+uId+'"';
        console.log(sql);
        Card.update(sql, function(err, user){
          if(err){
            return res.json({error:"卡信息修改失败"});
          }
          return res.json({success:'success'});
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
          +'",amount="'+amount+'",longitude="'+longitude+'",latitude="'+latitude+'" WHERE cardid = "'+uId+'"';
    Card.update(sql, function(err, user){
      if(err){
        return res.json({error:"卡信息修改失败"});
      }
      return res.json({success:'success'});
    });
        
  }
};
//增加卡片信息函数
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
  var longitude = fields.longitude[0];
  var latitude = fields.latitude[0];
  var owner = fields.owner[0];
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
        if(file.originalFilename.length == 0){//没有上传图片
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
      var sql = 'insert into card(cardid, title, describes, price, logistic, category, brand, freight, exchange, owner, amount, pictures, longitude, latitude) values';
      sql = sql + '("'+uId+'","'+title+'","'+describes+'","'+price+'","'+logistic+'","'+category+'","'+brand+'","'+freight+'","'+exchange+'","'+owner+'","'+amount+'","'+str+'","'+longitude+'","'+latitude+'")';
      console.log(sql);
      Card.add(sql, function(err, user){
        if(err){
          return res.json({error:"卡信息添加失败"});
        }
        return res.json({success:'success'});
      });
    }
  });
};
module.exports = router;