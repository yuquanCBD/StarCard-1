var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var uuid = require('node-uuid');
var Card = require('../models/card');
var User = require('../models/user');
var Comment = require('../models/comment');
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
    '<form action="/comment/addComment" '+ 
    //'<form action="/publish/delete"'+ 
    'method="post">'+ 
    'cardid<input type="text" name="cardid" value="card1" /></br>'+
    'userid<input type="text" name="userid" value="card1" /></br>'+
    'commentto<input type="text" name="commentto" value="1.0" /></br>'+
    'content<input type="text" name="content" value="此卡真心不错!" /></br>'+
    '<input type="submit" value="add" />'+ 
    '</form>'+ 
    '</body>'+ 
    '</html>'; 
 
    res.writeHead(200, {"Content-Type": "text/html"}); 
    res.write(body); 
    res.end();
});

router.post('/addComment',function(req,res,next){
	//res.json({content:req.body});
	var cardid = req.body.cardid;
	var userid = req.body.userid;
	var commentto = req.body.commentto;
	var content = req.body.content;
	var sql = 'insert into card_comment(cardid, userid, commentto, content) values';
    sql = sql + '("'+cardid+'","'+userid+'","'+commentto+'","'+content+'")';
    Comment.execSql(sql,function(err, r){
    	if(err){
    		return res.json({error:'error'});
    	}
    	return res.json({success:'success'});
    });
    console.log(sql);
});
//通过cardid拿到对应评论信息
router.get('/getComment',function(req,res,next){
	var cardid = req.query.cardid;
	var sql = 'select * from card_comment where cardid = "'+ cardid +'"';
	Comment.execSql(sql, function(err, r){
		if(err){
			return res.json({error:'error'});
		}
		else{
			return res.json(r);
		}
	});
});

module.exports = router;