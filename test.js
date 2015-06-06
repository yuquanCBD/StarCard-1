var http = require('http');
var querystring = require('querystring');
var contents = querystring.stringify({
	username: 'louzh',
	password: '123456',
	telephone: 13073687787,
	captcha : 938541,
	IDCardNo : 1956,

});
var options = {
	host: 'localhost',
	port: '3000',
	path: '/register/setInfo',
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