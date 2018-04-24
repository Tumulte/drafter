const chai = require('chai');
const expect = chai.expect;


const dbUtils = require("../utils/db");
var dataHandler = dbUtils.dataHandler;
var dataWriteHandler = dbUtils.dataWriteHandler;
//DB
var FileSync = require('lowdb/adapters/FileSync');
var low = require('lowdb');
var rawData = require("../data/dataTest.json");
var adapter = new FileSync('./data/dataTest.json')
var db = low(adapter)
var req;
var data;
describe("Get all data from the database", () => {
  before(function () {
    req = {
      "params": {
        "table": "quotes"
      },
      "query": ""
    }
    data = new dataHandler(db, req).get().getRelations();

  })
  it('return all data from table quote', function () {
    expect(data.length).to.equal(11);
    expect(data[6]).to.deep.equal({
      "id": "SJSuBYJiG",
      "text": "En plus d'être une lecture d'attente une deuxière caractéristique particularise la transaction avec les ouvrages de DP : il s'agit d'une lecture utilitaire, qui demande un investissement important",
      "idea": "Il n'y a pas de notion de «style» ou de «qualité d'écriture», et encore moins de contexte c'est vraiment : ce que ça apporte ici et maintenant",
      "author_": "r1W2F6A9M",
      "media_": "rJGF3T05f",
      "page": "97",
      "from": "",
      "time": "",
      "tags_": [
        "BklrdrKJsf",
        "Skxb3KpR5M"
      ],
      "author": {
        "id": "r1W2F6A9M",
        "name": "Nicolas Marquis",
        "birth": "",
        "death": "",
        "disciplines_": [
          "2"
        ],
        "approaches_": false
      },
      "media": {
        "id": "rJGF3T05f",
        "author_": "r1W2F6A9M",
        "name": "Du bien-être au marché du malaise",
        "subtitle": "La société du développement personnel",
        "year": "2014",
        "publisher": "PUF"
      },
      "tags": [{
          "id": "Skxb3KpR5M",
          "name": "Développement Personnel"
        },
        {
          "id": "BklrdrKJsf",
          "name": "utilitarisme"
        }
      ]
    });
  });
  it('should have sane raw data', function () {
    expect(rawData.quotes[6]).to.deep.equal({
      "id": "SJSuBYJiG",
      "text": "En plus d'être une lecture d'attente une deuxière caractéristique particularise la transaction avec les ouvrages de DP : il s'agit d'une lecture utilitaire, qui demande un investissement important",
      "idea": "Il n'y a pas de notion de «style» ou de «qualité d'écriture», et encore moins de contexte c'est vraiment : ce que ça apporte ici et maintenant",
      "author_": "r1W2F6A9M",
      "media_": "rJGF3T05f",
      "page": "97",
      "from": "",
      "time": "",
      "tags_": [
        "BklrdrKJsf",
        "Skxb3KpR5M"
      ]
    })
  });
});

var postData = {
  body: {
    name: "test name",
    birth: "18/10/2000",
    death: "",
    existing_disciplines_: "1, 3",
    new_disciplines_: "Socio, anthropo",
    new_approaches_: "francfort, micro management",
    existing_approaches_: "",
    existing_tags_: "",
    new_tags_: ""
  },
  params: {
    table: "authors"
  }

};
var newData = new dataWriteHandler(db, postData);
describe("Write data", () => {
  before(function () {
    newData.save();
    data = new dataHandler(db, {
      "params": {
        "table": "authors"
      },
      "query": ""
    }).get().getRelations();


  });
  it("should write new dada", function (done) {

    expect(data[4]).to.include({
      name: 'test name',
      birth: '18/10/2000',
      death: '',
      tags_: false,
      tags: false
    });
    expect(data[4].disciplines_.length).to.equal(4);
    expect(data[4].approaches_.length).to.equal(2);
    expect(data[4].disciplines.length).to.equal(4);
    expect(data[4].approaches.length).to.equal(2);
    expect(data[4].tags_).to.equal(false);
    expect(data[4].tags).to.equal(false);
    expect(data[4].disciplines[3].name).to.equal("anthropo");
    expect(data[4].approaches[1].name).to.equal("micro management");



    done();
  });

  after(function () {
    db.get("authors").remove({
      name: "test name"
    }).write();
    db.get("disciplines").remove({
      name: "Socio"
    }).write();
    db.get("disciplines").remove({
      name: "anthropo"
    }).write();
    db.get("approaches").remove({
      name: "micro management"
    }).write();
    db.get("approaches").remove({
      name: "francfort"
    }).write();
  });
});
