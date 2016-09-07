var express = require('express');
var router = express.Router();
var client = require('twilio')('SID', 'ACCESS_KEY');
var MongoClient = require('mongodb').MongoClient;

var dbUrl = 'mongodb://localhost:27017/amnesio';

/* GET home page. */
router.post('/send', function(req, res, next) {
  client.sendMessage({
    to: req.body.toNumber,
    from: '+12015282352',
    body: 'Your name is John Connor. Pls kill skynet.',
    statusCallback: 'https://internships-prateekgupta2012900562.codeanyapp.com/api/webhook'
  }, function(err, responseData) {
    if (!err) {
      console.log(responseData);

      MongoClient.connect(dbUrl, function(err, db) {
        console.log("Connected successfully to server");
        var col = db.collection('messages');
        col.insertOne({
          _id: responseData.sid,
          to: responseData.to,
          status: responseData.status
        }, function(err, obj) {
          if (!err) {
            res.status(200).json({
              "_id": responseData.sid,
          "to": responseData.to,
          "status": responseData.status});
          }
        });
        db.close();
      });

    }
  });
});

router.post('/status', function(req, res, next) {
  //console.log(req.Url.query);
  MongoClient.connect(dbUrl, function(err, db) {
    var col = db.collection('messages');
    col.findOne({
      _id: req.body._id
    }, function(err, obj) {
      if (obj == null)
        res.status(404).json({
          status: "Message ID not found"
        });
      else
        res.status(200).json(obj);
    });
    db.close();
  });
});

router.post('/webhook', function(req, res, next) {
  console.log(req.body.MessageStatus);
  MongoClient.connect(dbUrl, function(err, db) {
    var col = db.collection('messages');
    col.findOneAndUpdate({
      _id: req.body.SmsSid
    }, {
      $set: {
        status: req.body.MessageStatus
      }
    }, function(err, obj) {
      if (!err)
        console.log(obj.value);
    });
    db.close();
  });
});

module.exports = router;