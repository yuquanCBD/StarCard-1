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
    'username<input type="text" name="username" value="u1" /></br>'+
    'user_pic<input type="text" name="user_pic" value="pic!" /></br>'+
    'to_username<input type="text" name="to_username" value="u2" /></br>'+
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
    var username = req.body.username;//评论人的名字
    var user_pic = req.body.user_pic;//评论人的头像路径
    var to_username = req.body.to_username;//被评论人的名字

    Comment.addComment(cardid, userid, commentto, content, username, user_pic, to_username, function(err, results){
        if(err)
          return res.json({error:"评论失败"});
        
        return res.json({success:'评论成功'});
    })

})


//通过cardid拿到对应评论信息
router.get('/getComment',function(req,res,next){
	var cardid = req.query.cardid;

    Comment.showCardComments(cardid, function(err, rows){
        if (err) 
            return res.json({error : err});
        return res.json(rows);
    })
})

//根据评论编号拉去评论详情
router.post('/getCommentByCid', function(req, res, next){
    var cid = req.body.cid;

    Comment.getCommentByCid(cid, function(err, rows){
        if(err)
            return res.json({error : err});
        if(rows.length == 0)
            return res.json(null);
        else
            return res.json(rows[0]);
    })

})

module.exports = router;