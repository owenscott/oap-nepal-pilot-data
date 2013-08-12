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
var csv = require('csv');

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

//=========DB CONNECT=========
mongoose.connect('mongodb://localhost/' + dbName);
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connectionerror: '));




//=========CODE=========
var schema = {};
async.series([
    //---load schemas---
    function(callback) {
        var schemaPaths = getSchemaPaths();
        logger.info('Loading schema...');
        //----load schemas---//        
        async.forEach(schemaPaths,function(path,callback) {
            require('./schema/'+path+'.js');
            schema[path] = makeSchema(mongoose);
            return callback();
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
        var csvData = {};
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
        logger.info('Writing data to db...');
        return callback();
    }],
    function(err) {
        if (err) return logger.error(err);
        logger.info('All done.');
        return db.close();
    }
);



function readCsvToJson(csvPath,handleData,callback) {
    var completePath = './data/' + csvPath;
    fs.readFile(completePath, function(err,data) {
        if (err) return callback(err);
        csv()
            .from.string(data)
            .to.array(function(data){
                var jsonArray = [];
                var jsonTemplate = {};
                for (d in data) {
                    if (d == 0) {
                         for (k in data[0]) {
                             jsonTemplate[data[0][k]] = ""
                         }
                    } 
                    else {
                        var l = 0;
                        for (k in jsonTemplate) {
                            jsonTemplate[k] = data[d][l];
                            jsonArray.push(jsonTemplate);
                            l++;
                        }
                    }
                }
                handleData(jsonArray,csvPath,callback);
        });
        
    });   
}