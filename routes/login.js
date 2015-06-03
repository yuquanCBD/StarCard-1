var express = require('express');
var router = express.Router();
var crypto = require('crypto');

router.get('/', function(req, res, next){
	console.log('login page.');
	res.send("login page");
});

module.exports = router;