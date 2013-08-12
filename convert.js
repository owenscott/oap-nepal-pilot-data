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

require('./scripts/tools.js');

//=========DB CONNECT=========
mongoose.connect('mongodb://localhost/' + dbName);
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connectionerror: '));




//=========CODE=========
var schema = {};
var mapping = {};
var csvData = {};

async.series([
    //---load schemas and mapping---
    function(callback) {
        var schemaPaths = getSchemaPaths();
        logger.info('Loading schema...');
        //----load schemas---//        
        async.forEach(schemaPaths,function(path,callback) {
            require('./schema/'+path+'.js');
            schema[path] = makeSchema(mongoose);
            fs.readFile('./mapping/'+path+'.js',function(err,data) {
                if (err) {
                    logger.error(err);
                    return callback();
                }
                mapping[path] = JSON.parse(data);
                return callback();
            });
                
        },
        function() {
            logger.info('Done loading schema.');
            return callback()
        })
    },
    //---load and parse data---
    function(callback) {
        logger.info('Loading CSVs...');
        //template paths
        var templatePaths = getTemplatePaths();
        
        //hander for csv data
        handleCsv = function (data,path,callback) {
            csvData[path] = data;
            return callback();
        }
        
        async.forEach(templatePaths, function(path,callback) {
            readCsvToJson(path,handleCsv,callback)
        },
        function() {
            logger.info('Done loading csvs.');
            return callback();
        });
    },
    //---write data to db---
    function(callback) {
        mapDataToMongo(csvData,null,schema,callback);
    }],
    function(err) {
        if (err) return logger.error(err);
        logger.info('All done.');
        return db.close();
    }
);



function mapDataToMongo(csvData,mapping,schema,callback) {
    return callback();
    
}

