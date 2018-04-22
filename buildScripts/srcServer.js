//TODO :
//-Gérer les tags et l'héritage Quote -> Ouvrage -> auteur.
//- Filtre par tag : ajouter le scope (auteur/ouvrage/quote)
// +en gros ne laisser les tags que pour les quotes et générer le reste automatiquement
//- créer un type de quote «temoignage» (d'autres)
// +lier des quotes entre elles autour de ? (idée ? concepte ???)


var express = require('express');
//Tools
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



//Pages
app.get('/', function (req, res) {
  res.render('index');
});
app.get('/add', function (req, res) {
  db.read();
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
//TEST
