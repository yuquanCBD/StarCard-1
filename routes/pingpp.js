var express = require('express');
var router = express.Router();
var Order = require('../models/order');

/* pingpp 支付webhooks回调函数 */
router.post('/webhooks', function(req, res, next) {
  //console.log(req.body);
	var event = req.body;

	var resp = function (ret, status_code) {
	  res.writeHead(status_code, {
	    "Content-Type": "text/plain; charset=utf-8"
	  });
	  res.end(ret);
    }

    try {
      console.log(event.type)
      if (event.type === undefined) {
        return resp('Event 对象中缺少 type 字段', 400);
      }
      switch (event.type) {
        case "charge.succeeded":
        	console.log(event);

          // 开发者在此处加入对支付异步通知的处理代码
          var charge = event.data.object;
          if(charge.paid == true)
             Order.payOrderSuccess(charge.order_no, charge.transaction_no, charge.id, function(err, results){if(err) console.log(err)});

          return resp("OK", 200);
          break;
        case "refund.succeeded":
          // 开发者在此处加入对退款异步通知的处理代码
          console.log(event);
          var refund = event.data.object;
          if(refund.status = 'succeeded')
            Order.refundSuccess(refund, function(err, results){if(err) console.log(err)});
          return resp("OK", 200);
          break;
        default:
          return resp("未知 Event 类型", 400);
          break;
      }
    } catch (err) {
      return resp('JSON 解析失败', 400);
    }

});

module.exports = router;
