var schedule = require('node-schedule');
var queue = require('../struct/queue');
var Order = require('../models/order');

	queue.push(new Order('orderid1', 's1', 'b1', 3));
	queue.push(new Order('orderid2', 's2', 'b2', 1));
	queue.push(new Order('orderid3', 's3', 'b3', 2));
	queue.push(new Order('orderid4', 's4', 'b4', 4));
	queue.push(new Order('orderid5', 's5', 'b5', 2));
	
console.log('----------scheduler has been activated----------');
var job = schedule.scheduleJob('0 */1 * * * *', function(){

    var array = queue.topn();//如果返回的数组不为空，则全部

    for(x in array){
    	var order = array[x];
    	Order.receiveOrder(order.orderid, order.seller, order.buyer, function(err, results){
    		if (err)
    			console.log(err);
    		console.log('自动收货成功, orderid: ', order.orderid);
    	})
    }

});

module.exports = job;