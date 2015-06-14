var router = express.Router();
var multiparty = require('multiparty');
var uuid = require('node-uuid');
var Card = require('../models/card');


router.post('/', function(req, res, next){
	var cardInfo = {
		cardid : uuid.v1(),
		title : req.body.title,
		describe : req.body.describe,
		price : req.body.price,
		logistic : req.body.logistic,
		category : req.body.category,
		brand : req.body.brand,
		freight : req.body.freight,
		exchange : req.body.exchange,
		owner : req.body.owner,
		amount : req.body.amount
	};

	//存储卡片照片，依据cardid在public/card/imgs目录下创建同名目录，图片存储在此目录中
	//TODO

	var newCard = new Card(cardInfo);
	newCard.save(function(err){
		if(err){
			console.log('发帖信息存储失败, error: ' + err);
			res.json({error: '发帖失败'});
		}else
			res.json({success: "发帖成功"});
	});
});

module.exports = router;