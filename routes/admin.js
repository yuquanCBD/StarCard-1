var express = require('express');
var router = express.Router();

var options = {
	root: __dirname + '/../views/',
	dotfiles: 'deny',
	headers: {
	    'x-timestamp': Date.now(),
	    'x-sent': true
	}
};

router.get('/login', function(req, res, next){

  // var fileName = 'login.html';
  // res.sendFile(fileName, options, function (err) {
  //   if (err) {
  //     console.log(err);
  //     res.status(err.status).end();
  //   }
  //   else {
  //     console.log('Sent:', fileName);
  //   }
  // });
  res.render('login.html');
});

router.post('/login', function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;
  console.log('username: '+username+', password: '+password);
  res.sendFile('index.html', options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', 'index.html');
    }
  });
  //res.render('index.html');
  //res.json({error:'失败'});
});
router.get('/starcardAdd',function(req, res, next){
  res.render('StarCardAdd.html');
});
router.post('/starcardAdd',function(req, res, next){
  res.json({title:req.body.title,price:req.body.price,amount:req.body.amount,category:req.body.category,brand:req.body.brand,logistic:req.body.logistic,freight:req.body.freight,exchange:req.body.exchange,describes:req.body.describes});
});
router.get('/index', function(req, res ,next){
});


module.exports = router;