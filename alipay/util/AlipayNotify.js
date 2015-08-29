/* *
 *类名：AlipayNotify
 *功能：支付宝通知处理类
 *详细：处理支付宝各接口通知返回
  *************************注意*************************
 *调试通知返回时，可查看或改写log日志的写入TXT里的数据，来检查通知返回是否正常
 */
var AlipayCore = require('./AlipayCore');
var url = require('url');
var http = require('http');
var https = require('https');

/**
 * 支付宝消息验证地址
 */
var HTTPS_VERIFY_URL = "https://mapi.alipay.com/gateway.do?service=notify_verify&";

function AlipayNotify () {}

/**
 * 验证消息是否是支付宝发出的合法消息
 * @param params 通知返回来的参数数组
 * @return 验证结果
 */
AlipayNotify.verify = function(params){
	//判断responsetTxt是否为true，isSign是否为true
	//responsetTxt的结果不是true，与服务器设置问题、合作身份者ID、notify_id一分钟失效有关
	//isSign不是true，与安全校验码、请求时的参数格式（如：带自定义参数等）、编码格式有关

}

/**
* 获取远程服务器ATN结果
* @param urlvalue 指定URL路径地址
* @return 服务器ATN结果
* 验证结果集：
* invalid命令参数不对 出现这个错误，请检测返回处理中partner和key是否为空 
* true 返回正确信息
* false 请检查防火墙或者是服务器阻止端口问题以及验证时间是否超过一分钟
*/
AlipayNotify.checkUrl = function(urlvalue){
	var urlObj = url.parse(urlvalue);
	console.log(urlvalue);
	var options = {
	host: urlObj.host,
	port: urlObj.port,
	path: urlObj.path,
	method: 'GET',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length' : 0
		}
	};

	var req = https.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (data) {
			console.log(data);
		});
	});

	req.on('connect', function(res, socket, head) {
	    console.log('got connected!');
  	});
  	req.end();
}

module.exports = AlipayNotify;

var veryfy_url = HTTPS_VERIFY_URL + "partner=123&notify_id=123";

AlipayNotify.checkUrl(veryfy_url);
