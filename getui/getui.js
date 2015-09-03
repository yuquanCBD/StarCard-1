'use strict';
var GeTui = require('./GT.push');
var Target = require('./getui/Target');
var APNTemplate = require('./getui/template/APNTemplate');
var TransmissionTemplate = require('./getui/template/TransmissionTemplate');
var SingleMessage = require('./getui/message/SingleMessage');
var ListMessage = require('./getui/message/ListMessage');
var APNPayload = require('./payload/APNPayload');
var DictionaryAlertMsg = require('./payload/DictionaryAlertMsg'); 

var HOST = 'http://sdk.open.api.igexin.com/apiex.htm';
var APPID = 'Fci2u5FR3f7LbGE3N3Sqt2';
var APPKEY = '02lp0im7ud7BWPVVvdmtR7';
var MASTERSECRET = 'UiNeSu2Jti5wMAeU516iw8';
var CID = '289cf3a73ee6e37e456faa4582e96b2e';
var CID2 = '3e170b169630706f82baf94c8a2b8923';
var DEVICETOKEN = '21a95fe90f39cff4a135e96f86955ee7fe0fe4c2be10a055c76da1e395c072be';
var gt = new GeTui(HOST, APPKEY, MASTERSECRET);

function pushAPN(title, body, device_token) {
    var template = new APNTemplate();

   var payload = new APNPayload();
   var alertMsg = new DictionaryAlertMsg();
   alertMsg.body = "bbbbb";
   alertMsg.actionLocKey = "";
   alertMsg.locKey = "ccccccc";
   alertMsg.locArgs = Array("dddddd");
   alertMsg.launchImage = "";
   //ios8.2以上版本支持
   alertMsg.title = "aaa";
   alertMsg.titleLocKey = "dddddd";
   alertMsg.titleLocArgs = Array("");
   alertMsg.message_id = '我是消息id';

   payload.alertMsg=alertMsg;
   payload.badge=5;
   payload.contentAvailable =1;
   payload.category="";
   payload.sound="";
   payload.customMsg.payload1="payload";
   template.setApnInfo(payload);

    var message = new SingleMessage();
    message.setData(template);
    gt.pushAPNMessageToSingle(APPID, device_token || DEVICETOKEN, message, function (err, res) {
        console.log(res);
    });
}

exports.push = function(title, body, device_token){
    gt.connect(function () {
        pushAPN(title, body);
    })

}