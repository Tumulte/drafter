var express = require('express');
var shortid = require('shortid');
var relationEndMarker = "_";
var utils = require('../utils/utils');
var detectType = utils.detectType;
var filterFromQuery = function (o, query) {

  for (var property in query) {
    var reqQuery = detectType(query[property]);
    if (property === "tag_" && o.tags_) {
      return o.tags_.indexOf(reqQuery) !== -1;
    } else if (query) {
      return detectType(o[property]) === reqQuery;
    }
  }
  return true;
}
var getRelations = function (db, data) {
  findRelationnalProperties(data, db);
  flagAsCached(data);
  return data;
}

var fetchData = function (db, req) {
  var dbQuery = db.get(req.params.table).filter(function (o) {
    return filterFromQuery(o, req.query);
  }).value();
  return getRelations(db, dbQuery);
}

//UTILITY FUNCTIONS
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
    var table = item.replace("_", "s");
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
      var table = item.replace("_", "");
      data[table] = replaceIDByData(data, item, db);
    }
  }
}
var savenewRelations = function (data) {
  data.forEach(function (element) {
    var table = element.type;
    element.forEach(function (data) {
      if (data.hasOwnProperty("id") && e.id) {
        db.get(table).push(
          data
        ).write();
      }
    });
  });
}
var handleRelations = function (existingData, newData, item) {
  if (!newData && !existingData) {
    return {
      "IDArray": false
    };
  } else if (!newData) {
    return existingData;
  } else if (!existingData) {
    existingData = [];
  }
  var newRelations = [];
  var newRelationsID = [];
  if (typeof newData === "string") {
    newData = newData.split(',');
  }
  if (item.indexOf('existing') !== -1) {
    return {
      "IDArray": existingData.concat(newData)
    };
  }
  newData.forEach(function (element) {
    var id = shortid.generate();
    newRelationsID.push(id);
    newRelations.push({
      "id": id,
      "name": element.trim()
    });
  });
  return {
    "IDArray": existingData.concat(newRelationsID),
    "newRelations": newRelations
  };
}
var standardizePostData = function (data) {

  var standardizedData = {};
  var newRelations = [];
  standardizedData["id"] = shortid.generate();
  for (var item in data) {
    if (utils.isRelationnal(item)) {
      var attribute = item.replace("existing_", "").replace("new_", "");
      var existingData = false;
      var newData = data[item];
      if (standardizedData.hasOwnProperty(attribute)) {
        existingData = standardizedData[attribute];
      }
      var relations = handleRelations(existingData, newData, item);
      standardizedData[attribute] = relations.IDArray;
      if (relations.newRelations) {
        newRelations.push(relations.newRelations);
      }

      if (relations.hasOwnProperty("newRelations")) {
        relations.newRelations["type"] = attribute.replace("_", "");
      } else {
        relations["newRelations"] = false;
      }
    } else {
      standardizedData[item] = data[item];
    }
  }
  return {
    "data": standardizedData,
    "relations": newRelations
  };
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
      fetch = getRelations(db, fetch);
      req.data = fetch;
      next();
    } else {
      res.status(404).send('this data ' + req.params.table + ' does not exist')
    }
  })
  dataRouter.route('/:table').get(function (req, res) {
      if (db.has(req.params.table).value()) {
        res.json(fetchData(db, req));
      } else {
        res.status(404).send("There is no table named " + req.params.table)
      }
    })
    .post(function (req, res) {
      var data = standardizePostData(req.body);
      db.get(req.params.table).push(
        data.data
      ).write();
      savenewRelations(data.relations);
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
      res.send("ok");
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
  "RESTRoutes": RESTRoutes,
  "standardizePostData": standardizePostData,
  "fetchData": fetchData
};
