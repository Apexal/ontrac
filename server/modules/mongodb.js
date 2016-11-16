const config = require('../../config/config.json');

const mongoose = require('mongoose');
const dbURL = `mongodb://${config.database.host}:${config.database.port}/${config.database.name}`;
mongoose.connect(dbURL);
const db = mongoose.connection;
const Schema = mongoose.Schema;

const schemas = require('./schemas.js');

let models = {};

db.on('error', function(err) {console.error("Failed to connect to Database: "); throw err;});
db.once('open', (callback) => {
    console.log(`Connected to MongoDB at '${dbURL}'`);
    for (var schemaName in schemas) {
        models[schemaName] = mongoose.model(schemaName, Schema(schemas[schemaName]));
    }
});

module.exports = models;
