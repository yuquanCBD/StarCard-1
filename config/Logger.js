var log4js = require('log4js');  
var path = require('path');
var fs = require("fs"); 

// 加载配置文件  
log4js.configure({
  appenders: [
    { type: 'console' },{
      type: 'dateFile', 
      filename: 'logs/access.log', 
      maxLogSize: 1024,
      backups:4,
      category: 'normal',
      pattern: "-yyyy-MM-dd", 
      category: 'logger',
      alwaysIncludePattern: false  
    }
  ],
  replaceConsole: true
});

// 配合express用的方法  
exports.use = function(app) {  
    //页面请求日志, level用auto时,默认级别是WARN  
    app.use(log4js.connectLogger(log4js.getLogger('app'), {level:'auto', format:':method :url'}));  
}  

exports.getLogger = function(name){
	return log4js.getLogger(name);
}