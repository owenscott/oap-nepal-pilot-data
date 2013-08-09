//=========CONFIG=========
var dbName = "oapNepal";
var logFile = "convertLog.log";

//=========LIB=========
var fs = require('fs');
var async = require('async');
var request = require('request');
var winston = require('winston');

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


