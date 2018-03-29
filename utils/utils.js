var relationnalChar = "_";
var detectType = function (string) {
  if (/^\d+$/.test(string)) {
    string = Number(string)
  }
  return string;
}
var isRelationnal = function (itemName) {
  return itemName.indexOf(relationnalChar) !== -1
}
module.exports = {
  "detectType": detectType,
  "isRelationnal": isRelationnal
};
