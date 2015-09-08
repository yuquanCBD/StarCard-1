// 配置 API Key 和 App ID
// 从 Ping++ 管理平台应用信息里获取
var API_KEY = "sk_test_aHSGK00yjnf18Kmn5GePmrH4" // 这里填入你的 Test/Live Key
var pingpp = require('pingpp')(API_KEY);

pingpp.charges.createRefund(
  "ch_bLWP80Ci9S4ODaXLSKLOGe5S",
  { amount: 1, description: "Refund Description" },
  function(err, refund) {
    // YOUR CODE
  }
);

exports.pingpp = pingpp;
exports.API_KEY = API_KEY;