var http = require('http');
var utf8 = require('utf8');

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
	var url = 'http://121.199.16.178/webservice/sms.php?method=Submit&account=cf_shzywh&password=cfshzywh&mobile=' + 
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
	return num;
};

module.exports = util;