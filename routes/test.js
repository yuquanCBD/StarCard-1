var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');


router.get('/', function(req, res, next){
	res.render('test');
})

router.post('/', function(req, res, next){
	console.log(req.body);
	res.json({success : 'hello'});
});
var temp="var ht = 200;var func = function(d){return d;}";
router.get('/nev', function(req, res, next){
	var info;
    var filePath = path.join(__dirname, '../public/');
    // fs.writeFile(filePath+'data.json',JSON.stringify({"data":temp}),function(err){
    // 	if(err){
    // 		throw err;
    // 	}
    // 	console.log("exports success!!!!!!!!!!!");
    // });
	fs.readFile(filePath+'data.json',{encoding:'utf-8'},function(err, data){
		if(err) throw err;
		var d = JSON.parse(data);
		var str = "";
		for(var n in d){
			str  = str + n +'; ';
		}
		var body = '<html>'+ 
			    '<head>'+ 
			    '<meta http-equiv="Content-Type" content="text/html; '+ 
			    'charset=UTF-8" />'+ 
			    '</head>'+ 
			    '<body>'+ 
			    '<form action="/test/addInfo" '+ 
			    'method="post">'+
			    'name:<input type="text" name="which" value="" /></br>'+
			    'code:<textarea name="code" cols=70 rows=30></textarea></br>'+
			    '<input type="submit" value="添加" />'+ 
			    '</form>'+
			    '<hr />'+ 
			    '<p><b>图表名称:  </b><em>'+str+'</em></p>'+
			    '<hr />'+
			    '<form action="/test/delInfo" '+ 
			    'method="post">'+
			    '<p>根据chart名删除元素:</p></br>'+
			    'name:<input type="text" name="which" value="" /></br>'+
			    '<input type="submit" value="删除" />'+ 
			    '</form>'+
			    '</body>'+ 
			    '</html>';
		res.writeHead(200,{"Content-Type":"text/html"});
		res.write(body);
		res.end();
	})
});
router.post('/addInfo', function(req, res, next){
	var name = req.body.which;
	var code = req.body.code;
	var filePath = path.join(__dirname, '../public/');
	fs.readFile(filePath+'data.json',{encoding:'utf-8'},function(err, data){
		if(err) throw err;
		var d = JSON.parse(data);
		d[name] = code;
		var str="";
		for(var n in d){
			str+=n;
			str+='; '
		}
		fs.writeFile(filePath+'data.json',JSON.stringify(d),function(err){
	    	if(err){
	    		throw err;
	    	}
	    	console.log("exports success!!!!!!!!!!!");
	    	var body = '<html>'+ 
			    '<head>'+ 
			    '<meta http-equiv="Content-Type" content="text/html; '+ 
			    'charset=UTF-8" />'+ 
			    '</head>'+ 
			    '<body>'+ 
			    '<form action="/test/addInfo" '+ 
			    'method="post">'+
			    'name:<input type="text" name="which" value="" /></br>'+
			    'code:<textarea name="code" cols=70 rows=30></textarea></br>'+
			    '<input type="submit" value="添加" />'+ 
			    '</form>'+
			    '<hr />'+ 
			    '<p><b>图表名称:  </b><em>'+str+'</em></p>'+
			    '<hr />'+
			    '<form action="/test/delInfo" '+ 
			    'method="post">'+
			    '<p>根据chart名删除元素:</p></br>'+
			    'name:<input type="text" name="which" value="" /></br>'+
			    '<input type="submit" value="删除" />'+ 
			    '</form>'+
			    '</body>'+ 
			    '</html>';
		    res.writeHead(200, {"Content-Type": "text/html"}); 
		    res.write(body); 
		    res.end();
		});
	});  
});
router.post("/delInfo",function(req,res,next){
	var name = req.body.which;
	var filePath = path.join(__dirname,'../public/');
	fs.readFile(filePath+'data.json',{encoding:'utf-8'},function(err,data){
		if(err){
			return res.json({"error":" 读取json文件失败"});
		}
		var d = JSON.parse(data);
		var num = 0;
		for(var n in d){
			num++;
		}
		if(num <= 1){
			return res.json({"error":"json中元素不足，请添加数据重试!"});
		}
		if(name in d){
			delete d[name];
		};
		var str ="";
		for(var n in d){
			str= str + n +'; ';
		}
		fs.writeFile(filePath+'data.json',JSON.stringify(d),function(err){
	    	if(err){
	    		throw err;
	    	}
	    	console.log("exports success!!!!!!!!!!!");
	    	var body = '<html>'+ 
			    '<head>'+ 
			    '<meta http-equiv="Content-Type" content="text/html; '+ 
			    'charset=UTF-8" />'+ 
			    '</head>'+ 
			    '<body>'+ 
			    '<form action="/test/addInfo" '+ 
			    'method="post">'+
			    'name:<input type="text" name="which" value="" /></br>'+
			    'code:<textarea name="code" cols=70 rows=30></textarea></br>'+
			    '<input type="submit" value="添加" />'+ 
			    '</form>'+
			    '<hr />'+ 
			    '<p><b>图表名称:  </b><em>'+str+'</em></p>'+
			    '<hr />'+
			    '<form action="/test/delInfo" '+ 
			    'method="post">'+
			    '<p>根据chart名删除元素:</p></br>'+
			    'name:<input type="text" name="which" value="" /></br>'+
			    '<input type="submit" value="删除" />'+ 
			    '</form>'+
			    '</body>'+ 
			    '</html>';
		    res.writeHead(200, {"Content-Type": "text/html"}); 
		    res.write(body); 
		    res.end();
		});

	});
})


module.exports = router;