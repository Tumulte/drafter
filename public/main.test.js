const chai = require('chai');
const expect = chai.expect;
const jsdom = require("jsdom");
var dom = new jsdom.JSDOM('<!DOCTYPE html><div id="quote-container">Test</div><a id="test-filter" href="/api/authors/1" class="list-filter">Test Link</a>');

global.document = dom.window.document;
global.window = dom.window;

const main = require("./main");
const $ = require("jquery");
const dataHandler = require("../utils/db").dataHandler;
//DB
var FileSync = require('lowdb/adapters/FileSync');
var low = require('lowdb');
var adapter = new FileSync('./data/dataTest.json')
var db = low(adapter)
var req = {
  "params": {
    "table": "quotes"
  },
  "query": ""
}
$(".list-filter").click();
var data = new dataHandler(db, req).get().getRelations();

describe("Turn a Json into a fine HTML list", () => {

  it('should turn JSON data into HTML list', function () {
    expect(main.printFullDataList(data)).to.have.string('<li><span class="list-property">author : </span><a class="list-filter" href="/api/authors/1">Frédéric Lordon</a></li>');
  });
  it('should turn Tags array into links', function () {
    expect(main.printFullDataList(data)).to.have.string('<li><span class="list-property">tags : </span> <a class="list-filter" href="/api/tags/2">Capitalisme</a></li>');
  });
  it("should return a filtered list of quotes");

});
