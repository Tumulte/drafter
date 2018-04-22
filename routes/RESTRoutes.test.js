const chai = require('chai');
const supertest = require('supertest');
const expect = chai.expect;
const routes = require('./RESTRoutes');
const dataJson = require("../data/data.json");


var request = supertest("http://localhost:3000")

describe('GET /api', function () {
  it('returns a list of authors', function (done) {
    request.get('/api/authors')
      .expect(200)
      .end(function (err, res) {
        expect(res.body[0].name).to.equal('Frédéric Lordon');
        done();
      });
  });
  it('returns a single author', function (done) {
    request.get('/api/authors/1')
      .expect(200)
      .end(function (err, res) {
        expect(res.body.name).to.equal('Frédéric Lordon');
        done();
      });
  });
  it('should build relationships on the fly', function (done) {
    request.get('/api/quotes/')
      .expect(200)
      .end(function (err, res) {
        expect(res.body[0].tags[0].name).to.equal('Capitalisme');
        expect(res.body[0].author.name).to.equal('Frédéric Lordon');
        done();
      });
  })
  it('should be able to be filtered by author', function (done) {
    request.get('/api/quotes/?author_=1')
      .expect(200)
      .end(function (err, res) {
        expect(res.body.length).to.equal(3);
        done();
      });
  })
  it('should be able to be filtered by tags', function (done) {
    request.get('/api/quotes/?tag_=2')
      .expect(200)
      .end(function (err, res) {
        expect(res.body.length).to.equal(1);
        done();
      });
  })
  it('returns a 404 when the table does not exist', function (done) {
    request.get('/api/auors')
      .expect(404, done);
  });
  it('returns a 404 when fetching an item but the table does not exist', function (done) {
    request.get('/api/auors/1')
      .expect(404, done);
  });
  it('returns a 404 when an item does not exist', function (done) {
    request.get('/api/quotes/uiei')
      .expect(404, done);
  });
});
describe('Should transform form data into lowdb compatible data', function () {
  var data = {
    name: 'Pierre Bourdieu',
    birth: '01/08/1930',
    death: '23/01/2002',
    existing_approaches_: '',
    new_approaches_: 'économie, barbouze, flifoune',
    new_disciplines_: '',
    existing_disciplines_: ['bla', 'blu', 'miu', 'gloup'],
    existing_test_: ['blabla', 'matmac', 'woo_33s'],
    new_test_: 'batterie, guitare, garnte',
    new_tags_: '',
    existing_tags_: ''
  }
  var standardizeData = routes.standardizePostData(data)
  it('It cleans up input name and replaces it with good ones', function () {
    expect(standardizeData.data).to.have.all.keys([
      "disciplines_", "id", "birth", "death", "name", "tags_", "test_", "approaches_"
    ]);
  });
  it('returs normal data as is', function () {
    expect(standardizeData.data.name).to.equal(
      'Pierre Bourdieu'
    );
  });
  it("creates a shortid", function () {
    expect(standardizeData.data.id).to.have.lengthOf.within(7, 14);
    expect(standardizeData.data.id).to.match(/^[a-zA-Z0-9-_]*$/);
  });
  it('It validates data are of the right type');
  it('collects existing ID and concatenates it whin newly created ones',
    function () {
      expect(standardizeData.data.disciplines_).to.deep.equal(['bla', 'blu', 'miu', 'gloup']);
      expect(standardizeData.data.test_).to.include.members(['blabla', 'matmac', 'woo_33s']);
      expect(standardizeData.data.test_.length).to.equal(6);
      expect(standardizeData.data.test_[6]).to.match(/^[a-zA-Z0-9-_]*$/);
      expect(standardizeData.data.approaches_.length).to.equal(3);
      expect(standardizeData.data.approaches_[0]).to.match(/^[a-zA-Z0-9-_]*$/);
    });
  it('It creates an array of newly created objects',
    function () {
      expect(standardizeData.relations[0].type).to.equal("approaches");
      expect(standardizeData.relations[0][0].name).to.equal("économie");
      expect(standardizeData.relations[0][2].id).to.match(/^[a-zA-Z0-9-_]*$/)
    });

})
describe("the data should not change when it shouldn't", function () {
  it("shouldn't create stuff out of the blue", function () {
    expect(dataJson.quotes[0]).to.not.have.property("author");
    expect(dataJson.quotes[0]).to.not.have.property("cached");

  })
})
