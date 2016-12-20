/* grab stuff from environment variables */
const MONGO_HOST = process.env.MONGO_HOST;
const GA_TRACKING_CODE = process.env.GA_TRACKING_CODE;

let express = require('express');
let router = express.Router();
let shortid = require('shortid');
let mongoose = require('mongoose');

mongoose.connect('mongodb://' + MONGO_HOST + '/congress-bias');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

let senatorSchema = mongoose.Schema({
  name: String,
  state: String,
  party: String,
  averageAccuracy: Number,
  guessesRight: Number,
  guessesWrong: Number,
  image: String
});
let sessionSchema = mongoose.Schema({
  right: Array,
  wrong: Array,
  _id: {
    type: String,
    unique: true,
    'default': shortid.generate
  }
});

let Session = mongoose.model('Session', sessionSchema);
let Senator = mongoose.model('Senator', senatorSchema);

// route for healthcheck
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
  let session = new Session({ right: req.body.correct, wrong: req.body.incorrect });
  session.save(function (err) {
    if (err) {
      console.log('error saving session');
    }
    else {
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
      res.send({'session':session});
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Which Side Congress Bias Game', 'GA': GA_TRACKING_CODE });
});

module.exports = router;
