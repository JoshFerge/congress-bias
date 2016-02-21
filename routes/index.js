var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/congress-bias');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('working');
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



var Senator = mongoose.model('Senator', senatorSchema);

// var g = {"senatorInfo":[{'name':'Bernie Sanders','state':'Vermont','party':'Democrat','image':'/images/bernie_sanders.jpg'}]};

// Senator.collection.insertMany(g.senatorInfo, function(err,r) {
//     console.log(err);
//     console.log(r);
//     db.close();
// });

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
    res.send('OK');
});

router.get('/test', function(req, res) {
    Senator.find({'name': req.params.senator}, function(err, senator) {
        res.render('test');
    });
});

router.post('/results', function(req, res) {
    res.render('results');
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
