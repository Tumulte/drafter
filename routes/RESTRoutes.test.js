const chai = require('chai');
const supertest = require('supertest');
const expect = chai.expect;



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
