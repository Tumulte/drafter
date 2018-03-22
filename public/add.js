var valueIntoFormFilter = function (element, property, type) {
  var list = "";
  var authorQuery = "";
  if (authors) {
    authorQuery = "&authors=" + authors + '&authorsName=' + authorsName;
  }
  if (property === "name") {
    list += '<li><a class="form-filter" href="?' + type + '=' + element['id'] + '&' + type + 'Name=' + encodeURI(element[property]) + authorQuery + '">' + element[property] + '</a></li>';
  }
  return list;
}

var concatenateID = function (input, id) {
  if (!input.getAttribute("value")) {
    return id;
  }
  value = input.getAttribute("value");
  valueArray = value.split(',')
  console.debug(valueArray.indexOf(id));
  if (valueArray.indexOf(id) !== -1) {
    valueArray.splice(valueArray.indexOf(id), 1);
  } else {
    valueArray.push(id)
  }
  return valueArray.toString();

}
var enableCaracButton = function (type) {
  var links = document.getElementsByClassName("carac-" + type + "-button");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function (e) {
      e.preventDefault();
      e.target.classList.toggle("selected");
      hiddenInput = document.getElementById(type + '-input');
      caracID = e.target.getAttribute("data-id");
      hiddenInput.setAttribute("value", concatenateID(hiddenInput, caracID));

    });
  }
}
var valueIntoCaracButton = function (element, property, type) {
  var list = "";
  if (property === "name") {
    list += '<li><button data-carac="' + type + '" data-id="' + element['id'] + '" class="carac-' + type + '-button carac-button">' + element[property] + '</button></li>';
  }
  return list;
}
var printFormFilter = function (data, type) {
  var html = createListFromJSON(data, valueIntoFormFilter, type);
  document.getElementById("filter-container").innerHTML = html;
  return html;
}
var printCaracs = function (data, type) {
  var html = createListFromJSON(data, valueIntoCaracButton, type);
  document.getElementById(type + "-container").innerHTML = html;
  enableCaracButton(type);
  return html;
}
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("author-form")) {
    getData("authors", false, printFormFilter);
    getData("approaches", false, printCaracs);
    getData("disciplines", false, printCaracs);
  } else if (authors) {
    getData("medias", {
      "by": 'author_',
      "id": authors
    }, printFormFilter)
  }
  getData("tags", false, printCaracs);

});
