var http = require('http');
var querystring = require('querystring');
// var contents = querystring.stringify({
// 	cond: '',
// 	brand: '名牌2',
// 	category: '',
// 	offset : 0,
// 	capacity : 20
// });

var contents = querystring.stringify({
	wikiid : 1
});
var wikijson = JSON.stringify({
		wikiname : '马拉多纳122312',
		english_name : 'maladuona',
		category : '经典',
		manufacturer : 'nnc',
		series : '991',
		serial_number : 213213,
		rarity : 1,
		describes : 'des',
		price : 199.2,
		brand : 'byd',
		contributor : 'user002',
		wikiid : '001'
});
//console.log(wikijson);

// var contents = querystring.stringify({
// 	wiki : wikijson
// });
var options = {
	host: 'localhost',
	port: '3000',
	path: '/wiki/queryDetail',
	//path : '/register',
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