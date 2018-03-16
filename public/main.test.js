const chai = require('chai');
const expect = chai.expect;
const jsdom = require("jsdom");
var dom = new jsdom.JSDOM('<!DOCTYPE html><p id="quote-container"></p');
global.document = dom.window.document;
const main = require("./main");
var data = require("../data/datatest.json");

describe("Turn a Json into a fine HTML list", () => {

  it('should turn JSON data into HTML list', function () {
    expect(main.printFullDataList(data.quotes)).to.have.string('<li>author : <a class="filter-list" href="/api/authors/1">Frédéric Lordon</a></li>');
  });
  it('should turn Tags array into links', function () {
    expect(main.printFullDataList(data.quotes)).to.have.string('<li>tags : <a class="filter-list" href="/api/tags/2">Capitalisme</a></li>');
  })
});
