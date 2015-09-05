var http = require('http');
var utf8 = require('utf8');
var url  = require('url');
var querystring = require('querystring');

function util(){}

util.getRandomNum = function getRandomNum(Min,Max)
{   
	var Range = Max - Min;   
	var Rand = Math.random();  

	return(Min + Math.round(Rand * Range));   
};  

util.getMsgCap = function getMsgCap(mob){
	var num = this.getRandomNum(100000, 999999);
	var content = utf8.encode('您的验证码是：' + num + '。请不要把验证码泄露给其他人。');

	/*
	var account = 'cf_shzywh';
	var password = 'cfshzywh';

	var url = 'http://121.199.16.178/webservice/sms.php?method=Submit&account='+account+'&password='+password+'&mobile=' + 
				mob + '&content=' + content;
	console.log(url);

	http.get(url, function(res) {
      	var size = 0;
	    var chunks = [];
	  	res.on('data', function(chunk){
	      	size += chunk.length;
	      	chunks.push(chunk);
	  	});
	  	res.on('end', function(){
	      	var data = Buffer.concat(chunks, size);
	      	console.log(data.toString())
	  	});
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
	*/

	var contents = querystring.stringify({
		apikey : '34d9b7049d09a099282b051f6c0f1677',
		mobile : mob,
		text : '【云片网】您的验证码是'+num
	})


	var URL = 'http://yunpian.com/v1/sms/send.json';
	var obj =  url.parse(URL);
	//console.log(obj);
	var options = {
		hostname: obj.hostname,
		path: obj.path,
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


	return num;
}

module.exports = util;