var RSA = require('../sign/RSA');

function AlipayCore(){}

/** 
 * 除去数组中的空值和签名参数
 * @param array 签名参数组[{key:key, value:value}, ...]
 * @return 去掉空值与签名参数后的新签名参数组
 */
AlipayCore.paraFilter = function(array){
	var ret = new Array();
	for(var i in array){
		var obj = array[i];
		if(obj.value == null || obj.value == '' || obj.value.toUpperCase() == 'SIGN' || obj.value.toUpperCase() == 'SIGN_TYPE')
			continue;
		ret.push(obj);
	}
	return ret;
}

/** 
 * 把数组所有元素排序，并按照“参数=参数值”的模式用“&”字符拼接成字符串
 * @param params 需要排序并参与字符拼接的参数组
 * @return 拼接后字符串
 */
AlipayCore.createLinkString = function(array){
	array.sort(function(a, b){
		return a.key > b.key;
	})
	var ret = '';
	for(var i = 0; i < array.length; i++){
		if(i == array.length - 1)
			ret += array[i].key + '=' + array[i].value;
		else
			ret += array[i].key + '=' + array[i].value + '&';
	}
	return ret;
}

module.exports = AlipayCore;


var a = new Array();
var stu1 = new Object();
var stu2 = new Object();
var stu3 = new Object();
stu1.key = 'k1';
stu1.value = 'v1';
stu2.key = 'k2';
stu2.value = '';
stu3.key = 'k3';
stu3.value = 'v3';

a[0] = stu1;
a[1] = stu2;
a[2] = stu3;
var json = JSON.stringify(a);
console.log(json, a.length);
console.log(AlipayCore.createLinkString(a));
console.log(AlipayCore.paraFilter(a));









