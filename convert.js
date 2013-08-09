//=========CONFIG=========
require('./global/globals.js');

var dbName = getDbName();
var logFile = getLogFileName();

//=========LIB=========
var fs = require('fs');
var async = require('async');
var request = require('request');
var winston = require('winston');
var mongoose = require('mongoose');

//configure logger
var logger = new (winston.Logger)({
    transports:[
        new (winston.transports.Console)({
            colorize:true
        }),
        new (winston.transports.File)({
            filename: logFile
        })
    ]
});

//=========CONNECT=========
mongoose.connect('mongodb://localhost/' + dbName);
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connectionerror: '));


//=========CODE=========
async.series([
    //---load schemas---
    function(callback) {
        var schemaPaths = getSchemaPaths();
        var schema = {};
        
        async.forEach(schemaPaths,function(path,callback) {
            require('./schema/'+path+'.js');
            schema[path] = makeSchema(mongoose);
            callback()
        },
            function() {
                logger.info('Done loading schema.');
                console.log(schema);
                return callback()
            }
        )
    }],
    function(err) {
        if (err) return logger.error(err);
        logger.info('Done series.');
        return db.close();
    }
);

            