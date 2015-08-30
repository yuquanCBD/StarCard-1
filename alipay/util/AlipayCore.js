var RSA = require('../sign/RSA');

function AlipayCore(){}

/** 
 * 除去数组中的空值和签名参数
 * @param array 签名参数组[{key:key, value:value}, ...]
 * @return 去掉空值与签名参数后的新签名参数组
 */
AlipayCore.paraFilter = function(array){
	var json = {};
	for(var key in array){
		var value = array[key];
		if(value == null || value == '' || value.toUpperCase() == 'SIGN' || value.toUpperCase() == 'SIGN_TYPE')
			continue;
		json[key] = value;
	}
	return json;
}

/** 
 * 把数组所有元素排序，并按照“参数=参数值”的模式用“&”字符拼接成字符串
 * @param params 需要排序并参与字符拼接的参数组
 * @return 拼接后字符串
 */
AlipayCore.createLinkString = function(array){
	console.log(array);
	var ret = new String('');
	for(var key in array){
		ret += key + '=' + array[key] + '&';
	}
	return ret.slice(0, ret.length - 1);
}

module.exports = AlipayCore;


var json = {notifyid : '123', partner : '456', ace : ''}

//console.log(json, a.length);
console.log(AlipayCore.createLinkString(json));
console.log(AlipayCore.paraFilter(json));









