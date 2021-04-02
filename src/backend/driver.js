const _ = require('lodash');
const stream = require('stream');
const driverBase = require('../frontend/driver');
const Analyser = require('./Analyser');
const MongoClient = require('mongodb').MongoClient;

/** @type {import('dbgate-types').EngineDriver} */
const driver = {
  ...driverBase,
  analyserClass: Analyser,
  async connect({ server, port, user, password, database }) {
    let mongoUrl = user ? `mongodb://${user}:${password}@${server}:${port}` : `mongodb://${server}:${port}`;
    if (database) mongoUrl += '/' + database;

    const pool = new MongoClient(mongoUrl);
    await pool.connect();
    // const pool = await MongoClient.connect(mongoUrl);
    return pool;
  },
  // @ts-ignore
  async query(pool, sql) {
    return {
      rows: [],
      columns: [],
    };
  },
  async stream(pool, sql, options) {
    return null;
  },
  async readQuery(pool, sql, structure) {
    const pass = new stream.PassThrough({
      objectMode: true,
      highWaterMark: 100,
    });

    // pass.write(structure)
    // pass.write(row1)
    // pass.write(row2)
    // pass.end()

    return pass;
  },
  async writeTable(pool, name, options) {
    return createBulkInsertStreamBase(this, stream, pool, name, options);
  },
  async getVersion(pool) {
    const status = await pool.db().admin().serverInfo();
    return status;
  },
  async listDatabases(pool) {
    const res = await pool.db().admin().listDatabases();
    return res.databases;
  },
  async readCollection(pool, options) {
    try {
      const collection = pool.db().collection(options.pureName);
      if (options.countDocuments) {
        const count = await collection.countDocuments();
        return { count };
      } else {
        let cursor = await collection.find();
        if (options.skip) cursor = cursor.skip(options.skip);
        if (options.limit) cursor = cursor.limit(options.limit);
        const rows = await cursor.toArray();
        return { rows };
      }
    } catch (err) {
      return { errorMessage: err.message };
    }
  },
};

module.exports = driver;
