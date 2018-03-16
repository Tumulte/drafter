var express = require('express');
var shortid = require('shortid');
var relationEndMarker = "_";
var utils = require('../utils/utils');
var numberIfInt = utils.numberIfInt;

//UTILITY FUNCTIONS
var flagAsCached = function (query) {
  if (query[0] !== undefined) {
    query[0]["cached"] = true;
  } else {
    query["cached"] = true;
  }
}
var replaceIDByData = function (data, item, db) {
  var dbQuery = false
  if (data[item] === false) {
    return dbQuery;
  } else if (typeof data[item] === "number") {
    table = item.replace("_", "s");
    dbQuery = db.get(table).find({
      "id": data[item]
    }).value();
  } else {
    table = item.replace("_", "");
    dbQuery = db.get(table).filter(function (o) {
      return data[item].indexOf(o.id) !== -1
    }).value();
  }
  return dbQuery;
}
var findRelationnalProperties = function (data, db) {
  if (data[0] !== undefined && data[0].hasOwnProperty('cached')) {
    return
  }
  for (var item in data) {
    var lastChar = item.substr(item.length - 1);
    if (data[item] !== null && typeof data[item] === "object" && data[item].hasOwnProperty("id")) {
      findRelationnalProperties(data[item], db);
    } else if (lastChar === relationEndMarker) {
      table = item.replace("_", "");
      data[table] = replaceIDByData(data, item, db);
    }
  }
}
var getRelations = function (data, db) {
  findRelationnalProperties(data, db);
  flagAsCached(data);
  return data;
}
var detectArrayInFilter = function (o, query) {

  for (property in query) {
    reqQuery = numberIfInt(query[property]);
    if (property === "tag_" && o.tags_) {
      return o.tags_.indexOf(reqQuery) !== -1;
    } else if (query) {

      return numberIfInt(o[property]) === reqQuery;
    }
  }
  return true;
}

var RESTRoutes = function (db) {
  var dataRouter = express.Router();
  dataRouter.use('/:table/:quoteId', function (req, res, next) {
    var fetch = false;
    if (db.has(req.params.table).value()) {
      fetch = db.get(req.params.table).find({
        "id": Number(req.params.quoteId)
      }).value();
    }
    if (fetch && fetch !== undefined) {
      fetch = getRelations(fetch, db);
      req.data = fetch;
      next();
    } else {
      res.status(404).send('this data ' + req.params.table + ' does not exist')
    }
  })
  dataRouter.route('/:table').get(function (req, res) {

      if (db.has(req.params.table).value()) {
        var dbQuery = db.get(req.params.table).filter(function (o) {
          return detectArrayInFilter(o, req.query);
        }).value();
        dbQuery = getRelations(dbQuery, db);
        res.json(dbQuery);
      } else {
        res.status(404).send("There is no table named " + req.params.table)
      }
    })
    .post(function (req, res) {
      db.get(req.param.table).push(
        req.body
      ).write();
      res.send("ok");
    })
  dataRouter.route('/:table/:quoteId')
    .get(function (req, res) {
      res.json(req.data)
    })
    .put(function (req, res) {
      updateItem(req, res);
    })
    .patch(function (req, res) {
      updateItem(req, res);
    })
    .delete(function (req, res) {
      db.get('posts')
        .remove({
          "id": req.params.quoteId
        })
        .write()
    });
  return dataRouter;
};
var updateItem = function (req, res) {
  req.quote
    .assign(req.body)
    .write()
  res.send("updated !");
}

module.exports = {
  "RESTRoutes": RESTRoutes
};
