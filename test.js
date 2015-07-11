var http = require('http');
var querystring = require('querystring');
// var contents = querystring.stringify({
// 	cond : '科比', 
// 	brand : 'Futera',
// 	category: '篮球卡',
// 	offset : 0,
// 	capacity : 20,
// 	order : 3,
// 	longitude : 113.3803010000,
// 	latitude : 22.5145190000
// });

// var contents = querystring.stringify({
// 	cardid : '007dcf30-206c-11e5-a032-75a6ecfb593e'
// });

/*我的卡圈测试 start*/
//	/mycard/queryScore
var contents = querystring.stringify({
	userid : '787348d0-126b-11e5-a5da-0959cd299e41'
});

//	/mycard/queryScore
var contents = querystring.stringify({
	userid : '787348d0-126b-11e5-a5da-0959cd299e41'
});

//卡片查询，0.待交易卡查询 1.售出卡查询 2.购入卡查询 
var contents = querystring.stringify({
	userid : '787348d0-126b-11e5-a5da-0959cd299e41',
	type   : 1
});

//个人资料修改
var contents = querystring.stringify({
	userid : '787348d0-126b-11e5-a5da-0959cd299e41',
	type   : 1
});
/*我的卡圈测试 end*/



var options = {
	host: 'localhost',
	port: '3000',
	path: '/mycard/queryMyCard',
	method: 'POST',
	headers: {
	'Content-Type': 'application/x-www-form-urlencoded',
	'Content-Length' : contents.length
}
};
var req = http.request(options, function(res) {
	res.setEncoding('utf8');
	res.on('data', function (data) {
	console.log(data);
	});
});
req.write(contents);
req.end();