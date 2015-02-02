var should = require('should');
var fs = require('fs');
var path = require('path');
var phpjs = require('phpjs');

var wpautop = require('../../lib/wpautop');

var fixtures = path.join(__dirname, '../fixtures');

describe('wpautop', function() {
  it('should process the "first post" correctly', function() {
    var input = fs.readFileSync(path.resolve(fixtures, 'first-post-input.txt'), {encoding: 'UTF-8'});
    var expected = fs.readFileSync(path.resolve(fixtures, 'first-post-expected.txt'), {encoding: 'UTF-8'});
    wpautop(input).should.be.eql(expected);
  });
});
