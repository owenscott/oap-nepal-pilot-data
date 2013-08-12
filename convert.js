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


console.log(mongoose.objectId);

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
            fs.readFile('./mapping/'+path+'.json',function(err,data) {
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
        mapDataToMongo(csvData,mapping,schema,callback);
    }],
    function(err) {
        if (err) return logger.error(err);
        logger.info('All done.');
    }
);



function mapDataToMongo(csvData,mapping,schema,callback) {
    //mongoose objects
    var models = {};
    for (s in schema) {
        models[s] = mongoose.model(s,schema[s]);
    }
    
    //iterate through all projects
    var projects = csvData['project-details.csv']

    for (p in projects) {
        var project = new models.project;
        for (m in mapping.project) {
             project = mapJsonValues({
                sourceObject:projects[p],
                sourceNodeMapping: mapping.project[m].sourceNode.slice(),
                destObject: project,
                destNodeMapping: mapping.project[m].destNode.slice(),
                preprocess: preprocess
             })
             project.save(function(err) {
                 if(err) logger.warn('Unable to save model. ' + err, {err:err});
             });
        }
    }
        
    
    return callback();
}

function preprocess (nodeMapping,value) {
    //if (JSON.stringify(nodeMapping) == JSON.stringify(["projectDatabaseId"])) {
    //    return mongoose.Schema.Types.ObjectId.parseFromString( (value || '').replace(/\s+/g, ''));
    //}
}

/*
for (m in mapping) {
            mongooseObject = mapJsonValues({
                sourceObject:settings.sourceObject,
                sourceNodeMapping:mapping[m].sourceNode.slice(),
                destObject:mongooseObject,
                destNodeMapping:mapping[m].destNode.slice(),
                preprocess:settings.preprocess
            });
        }
        mongooseObject.activityRef = settings.activityRef;
        mongooseObject.save(function(err) {
            if (err) logger.warn('Unable to save model.', {error:err});
            return callback();
        });
    }

*/