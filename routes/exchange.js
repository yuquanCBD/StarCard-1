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
    '买家id<input type="text" name="buserid" value="c96d3c40-431d-11e5-8410-8f36328e32cc" /></br>'+
    '卖家id<input type="text" name="suserid" value="c7969870-4968-11e5-b280-89ba2eb5880c" /></br>'+
    '卖家卡片id<input type="text" name="scardid" value="d54c37e0-21fe-11e5-85a9-5d2b18c36f80" /></br>'+
    '描述信息<input type="text" name="describes" value="描述信息" /></br>'+
    '卡片住图 <input type="text" name="card_pic" value="imgs/card/d54c37e0-21fe-11e5-85a9-5d2b18c36f80/0.png" /></br>'+
    '卡片住图 <input type="text" name="card_name" value="cardname 11" /></br>'+
    '卡片住图 <input type="text" name="card_desc" value="carddesc" /></br>'+
    '图片<input type="file" name="imgs" multiple="multiple"></br>'+ 
    '<input type="submit" value="Upload file" />'+ 
    '</form>'+ 
    '</body>'+ 
    '</html>'; 
 
 
    res.writeHead(200, {"Content-Type": "text/html"}); 
    res.write(body); 
    res.end();
})


//买家添加交互卡片信息
router.post('/',function(req,res,next){
	//存储卡片照片，依据cardid在public/imgs/card目录下创建同名目录，图片存储在此目录中
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		addInfo(fields, files, res);
	})
})


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

})

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

})

//卖家通过换卡记录id可以修改状态，status＝0表示未处理，1表示同意，－1表示回绝
router.post('/changeStatus',function(req, res, next){
  	var id = req.body.id; //交换纪录的id
  	var status = req.body.status; //交换状态
  	var refuseInfo = req.body.refuseInfo; //回绝信息
    var buserid = req.body.buserid;
    var card_pic = req.body.card_pic;
    var card_name = req.body.card_name;
    var card_desc = req.body.card_desc;
    var scardid = req.body.scardid;

  	if(status != -1 && status != 1)
  		  status = 0;
  	
    Exchange.changeStatus(id, status, refuseInfo, buserid, card_pic, card_name, card_desc, scardid, function(err, results){
        if(err)
            res.json({error : err});
        res.json({success : '换卡申请处理成功'});
    })

})

//增加交换信息函数
function addInfo(fields, files, res){
  var str = "";
  var uId = uuid.v1();
  var buserid = fields.buserid[0];
  var scardid = fields.scardid[0];
  var suserid = fields.suserid[0];
  var describes = fields.describes[0];
  var card_pic = fields.card_pic[0];
  var card_name = fields.card_name[0];
  var card_desc = fields.card_desc[0];

  //存储图片，得到图片的路径信息
  var filePath = path.join(__dirname, '../public/imgs/exchange/');
  fs.mkdir(filePath+uId, function(err){

    if(err)
        return res.json({error:'存储图片失败'});


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
      }

      console.log('图片信息添加成功', str);
      //将路径和卡片信息存入数据库

      Exchange.addExchange(uId, buserid, scardid, suserid, describes, card_pic, card_name, card_desc, str,function(err, results){
          if(err)
              return res.json({error : err});
          return res.json({success : '交换申请提交成功'});
      })


  });
}

//根据id查询换卡申请详情
router.get('/getExchangeInfoById', function(req, res, next){
    var id = req.query.id;

    Exchange.getExchangeInfoById(id, function(err, rows){
        if(err)
          return res.json({error : err});
        if(rows.length == 0)
          return res.json(null);
        else
          return res.json(rows[0]);
    })

})

module.exports = router;