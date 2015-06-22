var express = require('express');
var router = express.Router();
var Card = require('../models/card');

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
});

router.get('/query', function(req, res ,next){
  res.render('card_manage/table_managed.html');
});

router.post('/query', function(req, res, next){
    var size = req.body.pageSize;
    var offset = req.body.pageIndex * size;
    Card.query(offset, size, function(err, cards){
        if (err)
            return res.json({error: err});
        console.log(cards);
        return res.json(cards);    
    });         
});




module.exports = router;