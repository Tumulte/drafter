var numberIfInt = function (string) {
  if (/^\d+$/.test(string)) {
    string = Number(string)
  }
  return string;
}
module.exports = {
  "numberIfInt": numberIfInt
};
