var express = require('express');
var router = express.Router();
var Card = require('../models/card')

//根据卡片类别和品牌, 排序条件(1, 默认; 2.最近发布；3.离我最近)返回卡片列表
router.post('/showList', function(req, res, next) {
    var category = req.body.category;
    var brand = req.body.brand;
    var offset = req.body.offset;
    var capacity = req.body.capacity;
    var order = req.body.order;
    Card.queryByTypeBrand(category, brand, offset, capacity, function(err, rows){

    });
});


router.post('/search', function(req, res, next){

});


//卡片详情
router.post('/showDetail', function(req, res, next){
    var cardid = req.body.cardid;

});


//卖家的所有待交易卡
router.post('/showCardsOfOwner', function(req, res, next){

});

module.exports = router;