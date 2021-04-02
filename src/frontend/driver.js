const { driverBase } = require('dbgate-tools');
const Dumper = require('./Dumper');

/** @type {import('dbgate-types').SqlDialect} */
const dialect = {
  limitSelect: true,
  rangeSelect: true,
  offsetFetchRangeSyntax: true,
  stringEscapeChar: "'",
  fallbackDataType: 'nvarchar(max)',
  nosql: true,
  quoteIdentifier(s) {
    return `[${s}]`;
  },
};


/** @type {import('dbgate-types').EngineDriver} */
const driver = {
  ...driverBase,
  dumperClass: Dumper,
  dialect,
  engine: 'mongo@dbgate-plugin-mongo',
  title: 'MongoDB',
  defaultPort: 27017,
};

module.exports = driver;
