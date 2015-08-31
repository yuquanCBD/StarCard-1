var express = require('express');
var router = express.Router();
var User = require('../models/user')
var multiparty = require('multiparty');

router.post('/identification', function (req, res, next) {
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files){
		if(err)
			return res.json({error : err});

		var userid = fields.userid[0];

		User.identification(userid, files, function(err){
			if(err)
				return res.json({error : err});
			return res.json({success : '身份证上传成功'});
		})
	})

})


router.get('/', function(req, res, next){
console.log("Request handler 'start' was called."); 
 
  var body = '<html>'+ 
     '<head>'+ 
    '<meta http-equiv="Content-Type" content="text/html; '+ 
    'charset=UTF-8" />'+ 
    '</head>'+ 
    '<body>'+ 
    '<form action="/usercenter/identification" enctype="multipart/form-data" '+ 
    //'<form action="/publish/delete"'+ 
    'method="post">'+ 
    '用户id<input type="text" name="userid" value="user001" /></br>'+
    '<input type="file" name="imgs" multiple="multiple"></br>'+ 
    '<input type="submit" value="Upload file" />'+ 
    '</form>'+ 
    '</body>'+ 
    '</html>'; 
 
    res.writeHead(200, {"Content-Type": "text/html"}); 
    res.write(body); 
    res.end(); 
})


module.exports = router;