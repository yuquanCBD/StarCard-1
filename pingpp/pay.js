// 配置 API Key 和 App ID
// 从 Ping++ 管理平台应用信息里获取
var API_KEY = "sk_test_SGiDGG0GezfPCyrXX5Wbn1W5" // 这里填入你的 Test/Live Key
var APP_ID = "app_nLm5KC4KGWr1P0SW" // 这里填入你的应用 ID

var pingpp = require('pingpp')(API_KEY);
// pingpp.parseHeaders(/*headers*/); // 把从客户端传上来的 Headers 传到这里
var CHANNEL = 'alipay'; // 选择渠道
var extra = {};
switch (CHANNEL) {
  case 'alipay_wap':
    extra = {
      'success_url': 'http://www.yourdomain.com/success',
      'cancel_url': 'http://www.yourdomain.com/cancel'
    };
    break;
  case 'upacp_wap':
    extra = {
      'result_url': 'http://www.yourdomain.com/result'
    };
    break;
}
var crypto = require('crypto');
var order_no = crypto.createHash('md5')
              .update(new Date().getTime().toString())
              .digest('hex').substr(0, 16);
              /*
pingpp.charges.create({
      subject: "Your Subject",
      body: "Your Body",
      amount: 100,
      order_no: "123456789",
      channel: "alipay",
      currency: "cny",
      client_ip: "127.0.0.1",
      app: {id: APP_ID}
  }, function(err, charge) {
      console.log(err, charge);
});
*/
exports.pingpp = pingpp;
exports.APP_ID = APP_ID;
exports.API_KEY = API_KEY;
exports.CHANNEL = CHANNEL;
