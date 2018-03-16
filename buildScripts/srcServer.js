var express = require('express');
//Tools
var browserify = require('browserify-middleware');
var bodyParser = require('body-parser')
var populateQueryDict = function (query, args) {
  for (var element in query) {
    if (args.hasOwnProperty(element)) {
      args[element] = query[element];
    }

  }
  return args;
}

//DB
var FileSync = require('lowdb/adapters/FileSync');
var low = require('lowdb');
var adapter = new FileSync('./data/data.json')
var db = low(adapter)

//Server Params
var port = 3000;
var app = express();

//Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//API Routes
var RESTRouter = require('../routes/RESTRoutes');
RESTRouter = RESTRouter.RESTRoutes(db);


app.use('/api', RESTRouter);

//Template Engine
app.set('view engine', "pug");

//Static Files
app.use(express.static('public'));

//Frontend JS
app.get('/app.js', browserify('./src/main.js'));


//Pages
app.get('/', function (req, res) {
  res.render('index');
});
app.get('/add', function (req, res) {
  var args = {
    'authors': false,
    'authorsName': "",
    'medias': false,
    'mediasName': ""
  };
  args = populateQueryDict(req.query, args)
  res.render('add', args);
});

//Server
/* eslint-disable no-console */
app.listen(port, function (err) {
  if (err) {
    console.log(err);
  }
});
