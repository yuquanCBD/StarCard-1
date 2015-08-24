//var Order = require('../models/order')

function Queue(){
	this.array = new Array();
	this.length = this.array.length;
/*
	this.push(new Order('orderid1', 3));
	this.push(new Order('orderid2', 1));
	this.push(new Order('orderid3', 2));
	this.push(new Order('orderid4', 4));
	this.push(new Order('orderid5', 2));
	*/
}

Queue.prototype.push = function(order){
	this.length = this.array.push(order);
	this.array.sort(function(a, b){
		return a.receive_time < b.receive_time;
	});
}

Queue.prototype.topn = function(){
	var date = new Date();
	var current_time = date.getTime()/60000;
	var ret = new Array();

	var index = this.length - 1;

	while(index != -1){
		if(current_time >= this.array[index].receive_time){
			ret.push(this.array[index]);
		}else if( 2 < this.array[index].receive_time)
			break;
		index--;
	}

	/*
	var i = this.length - 1;
	while(i != index){
		this.array.pop();
		i--;
	}
	this.length = this.array.length;
	*/

	return ret;
}
	
Queue.prototype.pops = function(orderid){
	var index = -1;
	for(x in this.array){
		if (this.array[x].orderid == orderid){
			index = x;
			break;
		}
	}

	if (index != -1){
		this.array.splice(index, 1);
		this.length = this.array.length;
	}
}


Queue.prototype.refresh = function(order){
	for(x in this.array){
		if (array[x].orderid == order.orderid){
			array[x] = order;
			break;
		}
	}
}


var queue = new Queue();

module.exports= queue;