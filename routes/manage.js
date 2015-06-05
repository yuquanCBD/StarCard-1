var express = require('express');
var router = express.Router();

router.get('/card',function(req, res, next){
	res.render('CardManage');
});

module.exports = router;