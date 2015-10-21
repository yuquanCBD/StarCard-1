var express = require('express');
var router  = express.Router();
var Wiki    = require('../models/wiki')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/queryList', function(req, res, next){
    var cond = req.body.cond;
    var brand = req.body.brand;
    var category = req.body.category;
    var offset = req.body.offset;
    var capacity = req.body.capacity;
    var userid = req.session.user.userid;
    // var userid = 'c96d3c40-431d-11e5-8410-8f36328e32cc';

    Wiki.queryByCond(userid, cond, brand, category, offset, capacity, function(err, rows){
        if (err)
            return res.json({error : err});
        //console.log(rows);
        return res.json(rows);
    });

});


router.post('/queryDetail', function(req, res, next){
    var wikiid = req.body.wikiid
    Wiki.queryDetail(wikiid, function(err, rows){
        if (err)
            return res.json({error : err});
        return res.json(rows);
    });
});


router.post('/modify', function(req, res, next){
    var wikiid = req.body.wikiid;
    var describes = req.body.describes;

    Wiki.modify(wikiid, describes, function(err, result){
        if (err)
            return res.json({error : err});
        return res.json({success : "更新成功"});
    })
})

module.exports = router;
