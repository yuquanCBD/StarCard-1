function util(){

}

util.prototype.getRandomNum = function(Min,Max)
{   
	var Range = Max - Min;   
	var Rand = Math.random();  

	return(Min + Math.round(Rand * Range));   
}  

util.prototype.getMsgCap = function GenerateCaptcha(mob){
	var num = this.getRandomNum(100000, 999999);
	var url = 'http://utf8.sms.webchinese.cn/?Uid='+uid+'&Key='+key+'&smsMob='+ mob +'&smsText='+num;
	http.get(url, function(res) {
	  console.log("Got response: " + res.statusCode);
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	});
	return num;
}

module.exports = util;