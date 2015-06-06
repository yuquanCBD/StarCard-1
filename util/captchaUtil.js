var http = require('http');
function util(){

}

util.getRandomNum = function getRandomNum(Min,Max)
{   
	var Range = Max - Min;   
	var Rand = Math.random();  

	return(Min + Math.round(Rand * Range));   
}  

util.getMsgCap = function getMsgCap(mob){
	var num = this.getRandomNum(100000, 999999);
	var url = 'http://utf8.sms.webchinese.cn/?Uid='+'秦殇007'+'&Key='+'4aaa53ecb1ca403d9a07'+'&smsMob='+ mob +'&smsText='+num;
	http.get(url, function(res) {
	  console.log("Got response: " + res.statusCode);
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
	return num;
}

module.exports = util;