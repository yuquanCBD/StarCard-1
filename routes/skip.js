var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var url1 = req.query.url1;
	var url2 = req.query.url2;
	console.log(url1);
console.log(url2);

	res.render('skip', {
		url1 : url1,
		url2 : url2
	});
})	

module.exports = router;