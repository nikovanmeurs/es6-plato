'use strict';

var plato = require('../lib/plato');

var es6options = {
  complexity: {
    ecmaFeatures: {
      arrowFunctions: true,
      blockBindings: true,
      destructuring: true,
      regexUFlag: false,
      regexYFlag: false,
      templateStrings: true,
      binaryLiterals: false,
      octalLiterals: false,
      unicodeCodePointEscapes: true,
      defaultParams: true,
      restParams: true,
      forOf: false,
      objectLiteralComputedProperties: true,
      objectLiteralShorthandMethods: true,
      objectLiteralShorthandProperties: true,
      objectLiteralDuplicateProperties: false,
      generators: false,
      spread: true,
      superInFunctions: true,
      classes: true,
      newTarget: false,
      modules: true,
      jsx: false,
      globalReturn: false,
      experimentalObjectRestSpread: false
    }
  },
  eslint: true
};

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['plato'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'test empty file' : function(test) {
    test.expect(1);

    var files = [
      'test/fixtures/a.js',
      'test/fixtures/b.js',
      'test/fixtures/empty.js'
    ];

    plato.inspect(files, null, {}, function(reports) {
      test.equal(reports.length, 2, 'Should not attempt to report on empty files');
      test.done();
    });
  },
  'test file glob' : function(test) {
    test.expect(1);

    var files = './test/fixtures/*.js';

    plato.inspect(files, null, es6options, function(reports) {
      test.equal(reports.length, 7, 'Should properly test against the array produced by the glob');
      test.done();
    });
  },

  'test report structure without linters' : function(test) {
    test.expect(6);

    var files = [
      'test/fixtures/a.js',
      'test/fixtures/b.js'
    ];

    plato.inspect(files, null, {}, function(reports) {
      reports.forEach(function(report) {
        test.ok(report.complexity, 'Should contain a complexity report');
        test.ok(!report.jshint, 'Should *not* contain a jshint report');
        test.ok(!report.eslint, 'Should *not* contain a eslint report');
      });
      test.done();
    });
  },

  'test report structure using jshint' : function(test) {
    test.expect(6);

    var files = [
      'test/fixtures/a.js',
      'test/fixtures/b.js'
    ];

    plato.inspect(files, null, {
      jshint: true
    }, function(reports) {
      reports.forEach(function(report) {
        test.ok(report.complexity, 'Should contain a complexity report');
        test.ok(report.jshint, 'Should contain a jshint report');
        test.ok(!report.eslint, 'Should *not* contain a eslint report');
      });
      test.done();
    });
  },

  'test report structure using eslint' : function(test) {
    test.expect(6);

    var files = [
      'test/fixtures/a.js',
      'test/fixtures/b.js'
    ];

    plato.inspect(files, null, {
      eslint: true
    }, function(reports) {
      reports.forEach(function(report) {
        test.ok(report.complexity, 'Should contain a complexity report');
        test.ok(report.eslint, 'Should contain a eslint report');
        test.ok(!report.jshint, 'Should *not* contain a jshint report');
      });
      test.done();
    });
  },

  'test report structure of ES6 files' : function(test) {
    test.expect(4);

    var files = [
      'test/fixtures/es6.js',
      'test/fixtures/es6-extended.js'
    ];

    plato.inspect(files, null, es6options, function(reports) {
      reports.forEach(function(report) {
        test.ok(report.complexity, 'Should contain a complexity report');
        test.ok(report.eslint, 'Should contain an eslint report');
      });
      test.done();
    });
  },

  'test overview report structure' : function(test) {
    var files = [
      'test/fixtures/a.js',
      'test/fixtures/b.js'
    ];

    test.expect((files.length * 3) + 1);

    plato.inspect(files, null, {
      jshint: true
    }, function(reports) {
      var overview = plato.getOverviewReport(reports);
      test.ok(overview.summary.total.lint >= 0, 'Should contain total linting issues');
      test.ok(overview.summary.total.sloc > 0, 'Should contain total sloc');
      test.ok(overview.summary.total.maintainability > 0, 'Should contain total maintainability');
      test.ok(overview.summary.average.lint >= 0, 'Should contain average linting issues');
      test.ok(overview.summary.average.sloc > 0, 'Should contain average sloc');
      test.ok(overview.summary.average.maintainability > 0, 'Should contain average maintainability');
      test.equal(overview.reports.length, files.length,'Should contain right number of reports');
      test.done();
    });
  },

  'test overview report structure of ES6 files' : function(test) {
    var files = [
      'test/fixtures/es6.js',
      'test/fixtures/es6-extended.js'
    ];

    test.expect((files.length * 3) + 1);

    plato.inspect(files, null, es6options, function(reports) {
      var overview = plato.getOverviewReport(reports);
      test.ok(overview.summary.total.lint >= 0, 'Should contain total linting issues');
      test.ok(overview.summary.total.sloc > 0, 'Should contain total sloc');
      test.ok(overview.summary.total.maintainability > 0, 'Should contain total maintainability');
      test.ok(overview.summary.average.lint >= 0, 'Should contain average linting issues');
      test.ok(overview.summary.average.sloc > 0, 'Should contain average sloc');
      test.ok(overview.summary.average.maintainability > 0, 'Should contain average maintainability');
      test.equal(overview.reports.length, files.length,'Should contain right number of reports');
      test.done();
    });
  },

  'test file with shebang' : function(test) {
    test.expect(1);

    var files = [
      'test/fixtures/a.js',
      'test/fixtures/b.js',
      'test/fixtures/shebang.js'
    ];

    plato.inspect(files, null, {}, function(reports) {
      test.equal(reports.length, 3, 'Should report on files starting with a shebang');
      test.done();
    });
  },

  'test noempty line option' : function(test) {
    test.expect(1);

    var files = [
      'test/fixtures/multipleEmptyLines.js'
    ];

    plato.inspect(files, null, {noempty : true}, function(reports) {
      var overview = plato.getOverviewReport(reports);
      test.ok(overview.summary.total.sloc === 10, 'Should contain total sloc without empty lines counted');
      test.done();
     });
  },

  'should not execute any linting with default config' : function(test) {
    var files = [
      'test/fixtures/a.js',
      'test/fixtures/b.js'
    ];

    test.expect(1);

    plato.inspect(files, null, {}, function(reports) {
      var overview = plato.getOverviewReport(reports);
      test.ok(!overview.summary.total.lint, 'Should contain total linting issues');
      test.done();
    });
  },

  'should have linting infos if run with jshint: true' : function(test) {
    var files = [
      'test/fixtures/a.js',
      'test/fixtures/b.js'
    ];

    test.expect(1);

    plato.inspect(files, null, {
      jshint: true
    }, function(reports) {
      var overview = plato.getOverviewReport(reports);
      test.ok(overview.summary.total.lint === 2, 'Should contain total linting issues');
      test.done();
    });
  },

  'should have linting infos if run with eslint: true' : function(test) {
    var files = [
      'test/fixtures/a.js',
      'test/fixtures/b.js'
    ];

    test.expect(1);

    plato.inspect(files, null, {
      eslint: true
    }, function(reports) {
      var overview = plato.getOverviewReport(reports);
      test.ok(overview.summary.total.lint === 3, 'Should contain total linting issues');
      test.done();
    });
  }
};
