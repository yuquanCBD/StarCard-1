'use strict';
var GeTui = require('./GT.push');
var Target = require('./getui/Target');
var APNTemplate = require('./getui/template/APNTemplate');
var TransmissionTemplate = require('./getui/template/TransmissionTemplate');
var SingleMessage = require('./getui/message/SingleMessage');
 
var HOST = 'http://sdk.open.api.igexin.com/apiex.htm';
var APPID = 'b03c5cfef65ed30108f0a3fd82c3f6b4';
var APPKEY = '110000';
var MASTERSECRET = 'a02a76119b20d4e31620d7597a3b4f35';
var CID = '289cf3a73ee6e37e456faa4582e96b2e';
var CID2 = '3e170b169630706f82baf94c8a2b8923';
var DEVICETOKEN = '40f90da8ad0ff88f5b1fd54a11549a3e555e153786efe9e9d1a0341d227598cc';
var gt = new GeTui(HOST, APPKEY, MASTERSECRET);
gt.connect(function () {
    pushAPN();
});
function pushAPN() {
    var template = new APNTemplate();

   var payload = new APNPayload();
   var alertMsg = new DictionaryAlertMsg();
   alertMsg.body = "";
   alertMsg.actionLocKey = "";
   alertMsg.locKey = "";
   alertMsg.locArgs = Array("");
   alertMsg.launchImage = "";
   //ios8.2以上版本支持
   alertMsg.title = "";
   alertMsg.titleLocKey = "";
   alertMsg.titleLocArgs = Array("");

   payload.alertMsg=alertMsg;
   payload.badge=5;
   payload.contentAvailable =1;
   payload.category="";
   payload.sound="";
   payload.customMsg.payload1="payload";
   template.setApnInfo(payload);

    var message = new SingleMessage();
    message.setData(template);
    gt.pushAPNMessageToSingle(APPID, DEVICETOKEN, message, function (err, res) {
        console.log(res);
    });
}