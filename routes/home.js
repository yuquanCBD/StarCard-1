var express = require('express');
var router = express.Router();
var Card = require('../models/card');
var User = require('../models/user');
var News = require('../models/news');

//根据卡片类别和品牌, 排序条件(1, 默认; 2.最近发布；3.离我最近)返回卡片列表
router.get('/showList', function(req, res, next) {
    var cond = req.query.cond;
    var category = req.query.category;
    var brand = req.query.brand;
    var offset = req.query.offset;
    var capacity = req.query.capacity;
    var order = req.query.order;
    var longitude = req.query.longitude;
    var latitude = req.query.latitude;
    var userid = req.session.user.userid;

    Card.searchByCond(userid, cond, category, brand, offset, capacity, order, longitude, latitude, function(err, rows){
        if(err){
            return res.json({error: err});
        }
        return res.json(rows)
    });
});


//卡片详情
router.post('/showDetail', function(req, res, next){
    var cardid = req.body.cardid;
    Card.queryByID(cardid, function(err, row){
        if (err)
            return res.json({error : err});
        return res.json(row);
    });
});


//卖家的所有待交易卡
router.post('/showCardsOfOwner', function(req, res, next){
    var owner = req.body.owner;
    Card.searchCardsByOwner(owner, function(err, rows){
        if (err)
            return res.json({error : err});
        return res.json(rows);
    });
});

//userid、返回用户名字、购买和售出的卡片deprecated!!!
router.post('/showTradeInfo', function(req, res, next){
    var userid = req.body.userid;
    User.queryTradeByUserid(userid, function(err, in_num, out_num, username){
        if (err) 
            return res.json({error : err});
        return res.json({in_num : in_num, out_num : out_num, username : username})
    });
});



//查询免责声明
router.get('/disclaimer', function(req, res, next){
    News.disclaimer(function(err, content, id){
        if(err)
            return res.json({error : err});
        return res.json({disclaimer : content});
    })
});




module.exports = router;