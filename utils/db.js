var shortid = require('shortid');
var utils = require('../utils/utils');

var filterFromQuery = function (o, query) {
  for (var property in query) {
    var reqQuery = query[property];
    if (property === "tag_" && o.tags_) {
      return o.tags_.indexOf(reqQuery) !== -1;
    } else if (query) {
      return o[property] === reqQuery;
    }
  }
  return true;
};
var dataHandler = function (db, req) {

  this.data = {};

  var relationEndMarker = "_";
  var replaceIDByData = function (data, item, db) {
    var dbQuery = false
    if (data[item] === false) {
      return dbQuery;
    } else if (typeof data[item] === "string") {
      var table = item.replace("_", "s");
      dbQuery = db.get(table).find({
        "id": data[item]
      }).value();
    } else if (typeof data[item] !== 'undefined') {
      table = item.replace("_", "");
      dbQuery = db.get(table).filter(function (o) {
        return data[item].indexOf(o.id) !== -1
      }).value();
    }
    return dbQuery;
  }
  var findRelationnalProperties = function (data, db) {

    for (var item in data) {
      var lastChar = item.substr(item.length - 1);
      if (data[item] !== null && typeof data[item] === "object" && data[item].hasOwnProperty("id")) {
        data[item] = findRelationnalProperties(data[item], db);
      } else if (lastChar === relationEndMarker) {
        var table = item.replace("_", "");

        data[table] = replaceIDByData(data, item, db);
      }
    }
    return data
  }
  var detachObject = function (data) {
    data = JSON.parse(JSON.stringify(data));
    return data;
  }
  this.get = function () {
    if (typeof req.params.quoteId !== "undefined") {
      req.query = {
        "id": req.params.quoteId
      };
    }
    this.data = db.get(req.params.table).filter(function (o) {
      return filterFromQuery(o, req.query);
    }).value();

    return this;
  }
  this.getRelations = function () {
    var data = detachObject(this.data);
    this.data = findRelationnalProperties(data, db);
    return this.data;
  }
}

var dataWriteHandler = function (db, req) {
  var saveNewRelations = function (db, data) {
    data.forEach(function (element) {
      var table = element.type;
      element.forEach(function (data) {
        if (data.hasOwnProperty("id") && data.id) {
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
    //TODO : handle single ID stuff
    if (item === "author_" || item === "media_") {
      return {
        "IDArray": newData,
        "newRelations": false
      };
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
  this.save = function () {
    var data = standardizePostData(req.body);
    db.get(req.params.table).push(
      data.data
    ).write();
    saveNewRelations(db, data.relations);
    return data;
  }
}

module.exports = {
  "dataHandler": dataHandler,
  "dataWriteHandler": dataWriteHandler
};
