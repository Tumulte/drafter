(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];
        return s(n ? n : e)
      }, l, l.exports, e, t, n, r)
    }
    return n[o].exports
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s
})({
  1: [function (require, module, exports) {
    var unlistedProperties = ["id", "page", "time", "cached"]
    var relationEndMarker = "_";
    //DATA FILTERING
    var extractFilterFromLink = function (link) {
      var href = link.replace("http://", "");
      var hrefAsArray = href.split("/");
      var property = hrefAsArray[hrefAsArray.length - 2].replace(/.$/, "_");
      return {
        "filterBy": property,
        "filterId": hrefAsArray[hrefAsArray.length - 1]
      }
    }

    //Main
    var valueIntoList = function (element, property) {
      var list = ""
      if (element[property][0] !== undefined && typeof element[property][0] === "object") {
        element[property].forEach(function (item) {
          list += '<li>' + property + ' : <a class="filter-list" href="/api/' +
            property + '/' + item.id + '">' + item.name + '</a></li>';
        })
      } else if (typeof element[property] === "object") {
        list += '<li>' + property + ' : <a class="filter-list" href="/api/' + property + "s/" + element[property].id + '">' + element[property].name + '</a></li>';
      } else if (element[property]) {
        list += "<li>" + property + " : " + element[property] + "</li>";
      }
      return list;
    }
    var createFilterLinks = function () {
      var links = document.getElementsByClassName("filter-list");
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function (e) {
          e.preventDefault();
          var filter = extractFilterFromLink(e.target.href);
          getData("quotes/?" + filter.filterBy + "=" + filter.filterId, false, printDataList);
        });
      }
    }
    var createListFromJSON = function (data) {
      var list = "<ul>";
      data.forEach(function (element) {
        for (var property in element) {
          var lastChar = property.substr(property.length - 1);
          if (unlistedProperties.indexOf(property) === -1 && lastChar !== relationEndMarker) {
            list += valueIntoList(element, property);
          }
        }
      });
      list += "</ul>";

      return list;
    }
    var printDataList = function (data) {
      var html = createListFromJSON(data);
      document.getElementById("quote-container").innerHTML = html;
      createFilterLinks();
      return html;
    }
    var getData = function (type, singleElementID, callback) {
      var request = new XMLHttpRequest();
      var url = "/api/" + type;
      if (singleElementID) {
        url = "/api/" + type + "s/" + singleElementID;
      }
      request.open("GET", url);
      request.send();
      request.onload = function () {
        if (request.status === 200) {
          var data = JSON.parse(request.responseText);
          callback(data);
        } else {
          document.getElementById("quote-container").innerHTML = "The API request failed";
        }
      };
    }
    document.addEventListener("DOMContentLoaded", function () {
      getData("quotes", false, printDataList)
    });

  }, {}]
}, {}, [1]);