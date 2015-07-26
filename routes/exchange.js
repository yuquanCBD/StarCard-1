/*
 * 交易中交换卡片模块
*/

var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var uuid = require('node-uuid');
var Card = require('../models/card');
var User = require('../models/user');
var Exchange = require('../models/exchange');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;


router.get('/',function(req,res,next){
	var body = '<html>'+ 
     '<head>'+ 
    '<meta http-equiv="Content-Type" content="text/html; '+ 
    'charset=UTF-8" />'+ 
    '</head>'+ 
    '<body>'+ 
    '<form action="/exchange" enctype="multipart/form-data" '+ 
    //'<form action="/exchange/changeStatus"'+ 
    'method="post">'+ 
    //'id<input type="text" name="id" value="5ec3ec90-2dbf-11e5-b9ee-a9bc30505375"/></br>'+
    //'status<input type="text" name="status" value="1"/></br>'+
    '买家id<input type="text" name="Buserid" value="buser" /></br>'+
    '卖家id<input type="text" name="Suserid" value="Suser" /></br>'+
    '卖家卡片id<input type="text" name="Scardid" value="d54c37e0-21fe-11e5-85a9-5d2b18c36f80" /></br>'+
    '描述信息<input type="text" name="describes" value="描述信息" /></br>'+
    '图片<input type="file" name="imgs" multiple="multiple"></br>'+ 
    '<input type="submit" value="Upload file" />'+ 
    '</form>'+ 
    '</body>'+ 
    '</html>'; 
 
 
    res.writeHead(200, {"Content-Type": "text/html"}); 
    res.write(body); 
    res.end();
});
//买家添加交互卡片信息
router.post('/',function(req,res,next){
	//存储卡片照片，依据cardid在public/imgs/card目录下创建同名目录，图片存储在此目录中
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		addInfo(fields, files, res);
	});
});
//买家通过自己的用户id找到交换自己对应的交换纪录,这接口用于消息模块
router.get('/buyer',function(req, res, next){
	var buserid = req.query.userid;
	var sql = 'select * from exchange where buserid = "'+ buserid +'"';
	Exchange.execSql(sql, function(err, r){
		if(err){
			return res.json({error:'error'});
		}
		else{
			return res.json(r);
		}
	});

});
//卖家通过自己的用户id找到交换自己对应的交换纪录,这接口用于消息模块
router.get('/seller',function(req, res, next){
	var suserid = req.query.userid;
	var sql = 'select * from exchange where suserid = "'+ suserid +'"';
	Exchange.execSql(sql, function(err, r){
		if(err){
			return res.json({error:'error'});
		}
		else{
			return res.json(r);
		}
	});

});
//卖家通过换卡记录id可以修改状态，status＝0表示未处理，1表示同意，－1表示回绝
router.post('/changeStatus',function(req, res, next){
	var id = req.body.id; //交换纪录的id
	var status = req.body.status; //交换状态
	var refuseInfo; //回绝信息
	var sql;
	if(status != -1 && status != 1){
		status = 0;
	}
	if(status == -1){
		refuseInfo = req.body.refuseInfo;
		sql = 'UPDATE exchange SET status="'+ status+ '",refuseInfo="'+ refuseInfo +'" WHERE id = "'+id+'"';
	}
	else{
		sql = 'UPDATE exchange SET status="'+ status+'" WHERE id = "'+id+'"';
	}
	Exchange.execSql(sql, function(err, r){
		if(err){
			return res.json({error:'error'});
		}
		return res.json({success:'success'});
	})
});
//增加交换信息函数
function addInfo(fields, files, res){
  var str = "";
  var uId = uuid.v1();
  var buserid = fields.Buserid[0];
  var scardid = fields.Scardid[0];
  var suserid = fields.Suserid[0];
  var describes = fields.describes[0];

  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/exchange/');
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
        var p = "imgs/exchange/"+uId+'/'+i+'.'+String(types[types.length-1]);
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
      var sql = 'insert into exchange(id, describes, pictures ,scardid, suserid, buserid) values';
      sql = sql + '("'+uId+'","'+describes+'","'+str+'","'+scardid+'","'+suserid+'","'+buserid+'")';
      console.log(sql);
      Exchange.execSql(sql, function(err, r){
        if(err){
          return res.json({error:"卡信息添加失败"});
        }
        return res.json({success:'success'});
      });
    }
  });
};
module.exports = router;