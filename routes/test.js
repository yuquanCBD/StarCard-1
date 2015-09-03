var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
	res.render('test');
})

router.post('/', function(req, res, next){
	console.log(req.body);
	res.json({success : 'hello'});
})

module.exports = router;