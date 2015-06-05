var http = require('http');
var crypto = require('crypto');

var uid = '秦殇007';
var key = '4aaa53ecb1ca403d9a07';

function GetRandomNum(Min,Max)
{   
	var Range = Max - Min;   
	var Rand = Math.random();  

	return(Min + Math.round(Rand * Range));   
}  

var num = GetRandomNum(100000, 999999);

function GenerateCaptcha(mob){

	var url = 'http://utf8.sms.webchinese.cn/?Uid='+uid+'&Key='+key+'&smsMob='+ mob +'&smsText='+num;
	http.get(url, function(res) {
	  console.log("Got response: " + res.statusCode);
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
	return num;
}




module.exports = GenerateCaptcha;