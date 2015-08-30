var base64 = require('base-64');
var utf8 = require('utf8');
var crypto = require('crypto');


function RSA(){}

/**
* RSA签名
* @param content 待签名数据
* @param privateKey 商户私钥
* @param input_charset 编码格式 默认为utf8
* @return 签名值
*/
RSA.sign = function(content, privateKey){
    var signer = crypto.createSign('sha1')
    signer.update(utf8.encode(content));
    var signed = signer.sign(privateKey, output_format='base64')
	return signed;
}

/**
* RSA验签名检查
* @param content 待签名数据
* @param sign 签名值
* @param ali_public_key 支付宝公钥
* @param input_charset 编码格式
* @return 布尔值
*/

RSA.verify = function(content, sign, ali_public_key){
	var verifier = crypto.createVerify('sha1');
    verifier.update(utf8.encode(content));
    var bverify = verifier.verify(ali_public_key, sign, signature_format='base64')
    return bverify;
}


/**
* 解密
* @param content 密文
* @param private_key 商户私钥
* @param input_charset 编码格式
* @return 解密后的字符串
*/
RSA.decrypt = function(content, private_key){

}

var prikey = '-----BEGIN RSA PRIVATE KEY-----\n'+
'MIICXAIBAAKBgQCsaUPKcznm2mw3ymMw7b7O7VDtSK3VEP/ORDm9FhiOS1IjADrh\n'+
'+0IxeYf/wD1NxGXekL7zildsNkW/fvMEOUZ0bhhXjnj/q/MPNu88LTulGbxby9b4\n'+
'e8vdkGvLzKgW0zsjeQUd6fEIWNlut5A62s9LeT/wFN/BAjBzsKWHg004SQIDAQAB\n'+
'AoGATXkLrkgyx4p0wGkgQ1dBu2gmSkmzWx/FYuGDdHUeWap84R90ViF6cBLlSsYO\n'+
'hghvoiA2veb3O7fzhYY9GzPFdUUT2bvywCNA8V7UCPtytHk75j8Qmcmy0Q6VGs9Y\n'+
'kW0fpKqXaTrGrKEZ8zghse/4nHuCOwAPmQYX1QRSWRjgQgECQQDcHMpccaURqq4F\n'+
'9Ki1nX+Flce+OMx9B/VLbyODpdMzw7I1zkztVMUNvDqd0JjyBDsW+pCIPFlIcQ/U\n'+
'vWRgXlAJAkEAyIV8JDqODnSI3j56ik095L+3+RPgVCj08L3hwCtMDJJd0HUNEjRj\n'+
'AeWKG71w9Au+oA36ICutAu0vDnHW3vE2QQJAL0P7bFh3AtEs51h/NeipLo1YRA+8\n'+
'UYj48obeEHH2ZWI7jXRMbpZKbkWiLKtTfHzOF4QcrzSOU5D7vkohGNSHyQJBAK0O\n'+
'z0oxIwMEvk8YmwebjExMzklwRw47XtIa/qesdnDvLXpIWySYA87SPPSd9csaC8X0\n'+
'6iczqpi4/QC5bRlyEkECQFRNra/Aq3Z0yaFLIjFvWnGNww5TktZPPR/7kI2L3ZOQ\n'+
'BCDw8gamqv80pr9fJlrS5LlteQfMQv8cZElkbZYUBTI=\n'+
'-----END RSA PRIVATE KEY-----';

var ali_public_key  = '-----BEGIN PUBLIC KEY-----\n'+
'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCnxj/9qwVfgoUh/y2W89L6BkRA\n'+
'FljhNhgPdyPuBV64bfQNN1PjbCzkIM6qRdKBoLPXmKKMiFYnkd6rAoprih3/PrQE\n'+
'B/VsW8OoM8fxn67UDYuyBTqA23MML9q1+ilIZwBC2AQ2UBVOrFXfFl75p6/B5Ksi\n'+
'NG9zpgmLCUYuLkxpLQIDAQAB\n'+
'-----END PUBLIC KEY-----';
/*
var ali_public_key = '-----BEGIN PUBLIC KEY-----\n'+
'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCsaUPKcznm2mw3ymMw7b7O7VDt\n'+
'SK3VEP/ORDm9FhiOS1IjADrh+0IxeYf/wD1NxGXekL7zildsNkW/fvMEOUZ0bhhX\n'+
'jnj/q/MPNu88LTulGbxby9b4e8vdkGvLzKgW0zsjeQUd6fEIWNlut5A62s9LeT/w\n'+
'FN/BAjBzsKWHg004SQIDAQAB\n'+
'-----END PUBLIC KEY-----';
*/
var sign = 'Czwr2BqzRL5roopBcntrghP5scH0Hj+jl4Kjaumz/B8yWmESSo+fk9HGVLV4UTramNorG7AcEoD7ZyOS9esxsu6qCp6EI7OBNT98vUrth6+H3ZS6cCkdUtzmxiyka90RkZpKHEI4aZWuuyy2/ppm+4WcxV5EHAQM25gd6J059u4=';
console.log(RSA.sign('123456', prikey));
console.log(RSA.verify('123456', sign, ali_public_key))

module.exports = RSA;