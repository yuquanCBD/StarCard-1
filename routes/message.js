var express = require('express');
var router = express.Router();
var Message = require('../models/message')

//查询未读消息列表
router.get('/showMessageNotRead', function(req, res, next){
	var userid = req.query.userid;
	Message.showMessageNotRead(userid, function(err, rows){
		if(err)
			return res.json({error : err});
		return res.json(rows);
	});
});

//标记消息为已读
router.get('/markRead', function(req, res, next){
	var msg_id = req.query.msg_id;
	Message.markRead(msg_id, function(err, results){
		if(err)
			return res.json({error : err});
		return res.json({success : '标记已读成功'});
	});
});

//查询未读消息数量
router.get('/queryUnreadMsgNum', function(req, res, next){
	var userid = req.query.userid;
	Message.queryUnreadMsgNum(userid, function(err, num){
		if(err)
			return res.json({error : err});
		return res.json({number : num});//返回空或者数值
	});
});

//返回所有的消息
router.get('/showAllMessages', function(req, res, next){
	var userid = req.query.userid;
	Message.showAllMessages(userid, function(err, rows){
		if(err)
			return res.json({error : err});
		return res.json(rows);
	});
});

module.exports = router;