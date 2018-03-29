const chai = require('chai');
const expect = chai.expect;
const jsdom = require("jsdom");
var dom = new jsdom.JSDOM('<!DOCTYPE html><div id="quote-container"></div><a href="/api/authors/1" class="filter-list"></a>');

global.document = dom.window.document;
global.window = dom.window;

const main = require("./main");
const $ = require("jquery");
const RESTRoute = require("../routes/RESTroutes");
//DB
var FileSync = require('lowdb/adapters/FileSync');
var low = require('lowdb');
var adapter = new FileSync('./data/datatest.json')
var db = low(adapter)
var req = {
  "params": {
    "table": "quotes"
  },
  "query": ""
}
var data = RESTRoute.fetchData(db, req);


describe("Turn a Json into a fine HTML list", () => {


  it('should turn JSON data into HTML list', function () {
    expect(main.printFullDataList(data)).to.have.string('<li>author : <a class="filter-list" href="/api/authors/1">Frédéric Lordon</a></li>');
  });
  it('should turn Tags array into links', function () {
    expect(main.printFullDataList(data)).to.have.string('<li>tags : <a class="filter-list" href="/api/tags/2">Capitalisme</a></li>');
  })
});
describe("it should create filter links", function () {
  before(function () {
    main.createFilterLinks();
    $('a').click();
  });
  it("should return a filtered list of quoets", function () {

    expect($("#quote-container ul").length).to.equal(1);
  });

});
