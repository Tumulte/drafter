const chai = require('chai');
const expect = chai.expect;

const utils = require("./utils");

describe("Testing All fine utils", () => {

  it('should be a number if the string contains only an integer', function () {
    expect(utils.detectType("478")).to.equal(478)
    expect(utils.detectType("srnt898")).to.equal("srnt898");
  });

});
