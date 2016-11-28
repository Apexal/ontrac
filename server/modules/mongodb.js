const fs = require('fs');
const env       = process.env.NODE_ENV || 'development';
const config    = require(__dirname + '/../../config/config.json');

const path = require('path');
const basename = path.basename(module.filename);
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const dbURL = `mongodb://${config[env].host}:27017/${config[env].database}`;
mongoose.connect(dbURL);
const db = mongoose.connection;

let models = {};

db.on('error', function(err) {console.error("Failed to connect to Database: "); throw err;});
db.once('open', (callback) => {
    console.log(`Connected to MongoDB at '${dbURL}'`);
    fs.readdirSync(__dirname + '/schemas')
        .filter(function(file) {
            return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
        })
        .forEach(function(file) {
            var schema = require(path.join(__dirname + '/schemas/', file));
            models[schema.name] = mongoose.model(schema.name, schema.schema);
        });
});

module.exports = models;