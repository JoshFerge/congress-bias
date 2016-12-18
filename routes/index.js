const MONGO_HOST = process.env.MONGO_HOST;
const GA_TRACKING_CODE = process.env.GA_TRACKING_CODE;

var express = require('express');
var router = express.Router();
var shortid = require('shortid');
var mongoose = require('mongoose');

mongoose.connect('mongodb://' + MONGO_HOST + '/congress-bias');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('Database connection made');
});



var senatorSchema = mongoose.Schema({
  name: String,
  state: String,
  party: String,
  averageAccuracy: Number,
  guessesRight: Number,
  guessesWrong: Number,
  image: String
});
var sessionSchema = mongoose.Schema({
  right: Array,
  wrong: Array,
  _id: {
    type: String,
    unique: true,
    'default': shortid.generate
  }
});

var Session = mongoose.model('Session', sessionSchema);
var Senator = mongoose.model('Senator', senatorSchema);

// var g = {"senatorInfo":[{'name':'Bernie Sanders','state':'Vermont','party':'Democrat','image':'/images/bernie_sanders.jpg'}]};

// Senator.collection.insertMany(g.senatorInfo, function(err,r) {
//     console.log(err);
//     console.log(r);
//     db.close();
// });
router.get('/_ah/health', function(req, res) {
    res.send();
});

router.get('/senators', function(req, res) {
    Senator.find({}, function(err, users) {
        res.send(users);
    });
});

router.get('/senators/:senator', function(req, res) {
    Senator.find({'name': req.params.senator}, function(err, senator) {
        res.send(senator);
    });
});

router.post('/senators/:senator', function(req, res) {
    console.log(req.body.senator.name);
    if (req.body.guess) {
        Senator.findOneAndUpdate({ 'name': req.body.senator.name }, { $inc: { 'guessesRight': 1 }}, null, function(err, res) {console.log(err,res);});
    }
    else {
        Senator.findOneAndUpdate({ 'name': req.body.senator.name }, { $inc: { 'guessesWrong': 1 }}, null, function(err, res) {console.log(err,res);});
    }
    res.send();
});

router.get('/test', function(req, res) {
    Senator.find({'name': req.params.senator}, function(err, senator) {
        res.render('test', { title: 'Test', 'GA': GA_TRACKING_CODE });
    });
});

router.post('/create_session', function(req, res) {

  var session = new Session({ right: req.body.correct, wrong: req.body.incorrect });
  session.save(function (err) {
    if (err) {
      console.log('error saving session');
    }
    else {
      console.log('session saved  :',session._id);
      res.send({'id':session._id});
    }
  });
});

router.get('/results/:session', function(req, res, next) {
  res.render('results', { title: 'Results', 'GA': GA_TRACKING_CODE });
});

router.get('/session/:id', function(req, res, next) {
  Session.findOne({'_id': req.params.id}, function(err, session) {
      if (err) {
        console.log(err);
        res.send(500);
      }
      console.log(session);
      res.send({'session':session});
  });
});




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Which Side Congress Bias Game', 'GA': GA_TRACKING_CODE });
});

module.exports = router;
