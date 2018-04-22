var unlistedProperties = ["id", "page", "time", "cached"]
var relationEndMarker = "_";
//DATA FILTERING
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

  var list = '<li><span class="list-property">'
  if (element[property][0] !== undefined && typeof element[property][0] === "object") {
    var snippet = "";
    element[property].forEach(function (item) {
      list += snippet + property + ' : </span> <a class="list-filter" href="/api/' +
        property + '/' + item.id + '">' + item.name + '</a></li>';
      //TODO : ierk ugly
      snippet = '<li><span class="list-property">';
    })
  } else if (typeof element[property] === "object") {
    list += property + ' : </span><a class="list-filter" href="/api/' + property + "s/" + element[property].id + '">' + element[property].name + '</a></li>';
  } else if (element[property]) {
    list += property + ' : </span><span class="list-' + property + '">' + element[property] + "</span></li>";

  } else {
    list = "";
  }
  return list;
}
var createFilterLinks = function () {
  var links = document.getElementsByClassName("list-filter");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function (e) {
      e.preventDefault();
      var filter = extractFilterFromLink(e.target.href);
      getData("quotes/?" + filter.filterBy + "=" + filter.filterId, false, printFullDataList);
    });
  }
}
var createListFromJSON = function (data, callback, type) {
  var list = "<ul>";
  data.forEach(function (element) {
    for (var property in element) {
      var lastChar = property.substr(property.length - 1);
      if (unlistedProperties.indexOf(property) === -1 && lastChar !== relationEndMarker) {
        list += callback(element, property, type);
      }
    }
  });
  list += "</ul>";
  return list;
}
var printFullDataList = function (data) {
  var html = createListFromJSON(data, valueIntoList);
  document.getElementById("quote-container").innerHTML = html;
  createFilterLinks();
  return html;
}
var getData = function (type, filter, callback) {
  var request = new XMLHttpRequest();
  var url = "/api/" + type;
  if (filter && typeof filter === 'string') {
    url = "/api/" + type + "/" + filter;
  } else if (filter) {
    url = "/api/" + type + "/?" + filter.by + "=" + filter.id;
  }
  request.open("GET", url);
  request.send();
  request.onload = function () {
    if (request.status === 200) {
      var data = JSON.parse(request.responseText);
      callback(data, type);
    } else {
      document.getElementById("quote-container").innerHTML = "The API request failed";
    }
  };
}
if (typeof module !== 'undefined') {
  module.exports = {
    "printFullDataList": printFullDataList,
    "createFilterLinks": createFilterLinks
  };
}
