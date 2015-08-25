var log4js = require('log4js'); // log4j日志
var app    = require('../app');

/*
------------------配置日志----------------------
*/
log4js.configure({
  appenders: [
    { type: 'console' }, //控制台输出
	 {
	      "type": "dateFile",
	      "filename": "logs/access.log",
	      "pattern": "-yyyy-MM-dd",
	      alwaysIncludePattern: false,
	      backups:4,
	      "category" : "normal"
	 },
	 {
	     "type": "file",
	     "filename": "logs/error.log",
	     "maxLogSize": 2097152,
	     "backup": 10,
	     "category": "error"
	 },
	 {
	     "type": "dateFile",
	     "filename": "logs/record.log",
	     "pattern": "-yyyy-MM-dd",
	     "category": "record"
	 }
  ],
  replaceConsole: true,
  "levels": {
     "error":  "error",
     "record" : "trace"
 }

});

module.exports.logger = function (name) {
  var logger = log4js.getLogger(name);
  logger.setLevel('DEBUG');
  return logger;
};


