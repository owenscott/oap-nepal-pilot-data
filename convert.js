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
        logger.info('Parsing data and writing to db...');
        mapDataToMongo(csvData,mapping,schema,callback);
    },
    //---clean data in db---
    function(callback) {
        return callback();
    }
    
    ],
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

    async.forEach(projects, function(project,callback) {
        var projectJson = new models.project;
        for (m in mapping.project) {
             projectJson = mapJsonValues({
                sourceObject:project,
                sourceNodeMapping: mapping.project[m].sourceNode.slice(),
                destObject: projectJson,
                destNodeMapping: mapping.project[m].destNode.slice(),
                preprocess: preprocess
             })
        }
        projectJson = postProcessProject(projectJson);
         projectJson.save(function(err) {
             if(err) logger.warn('Unable to save model. ' + err, {err:err});
             return callback()
         });
    },
    function() {
        logger.info('Done parsing projects.');
        return callback();
    })
}







function postProcessProject(project) {
    //sector vocabularies
    var settings = [
        //internal database ID
        {obj:project,nodeMapping:["projectId",0,"ownerName"],value:"Development Gateway"},
        {obj:project,nodeMapping:["projectId",0,"type"],value:"InternalManagement"},
        {obj:project,nodeMapping:["projectId",0,"ownerOrgIatiRef"],value:"21006"},
        //donor ID
        {obj:project,nodeMapping:["projectId",1,"type"],value:"DevelopmentPartner"},
        //aid management platform
        {obj:project,nodeMapping:["projectId",2,"ownerName"],value:"Nepal Ministry of Finance"},
        {obj:project,nodeMapping:["projectId",2,"type"],value:"CountryAIMS"},
        //research database
        {obj:project,nodeMapping:["projectId",3,"ownerName"],value:"Development Gateway"},
        {obj:project,nodeMapping:["projectId",3,"ownerOrgIatiRef"],value:"21006"},
        {obj:project,nodeMapping:["projectId",3,"type"],value:"InternalDatabase"},
        //sector
        {obj:project,nodeMapping:["sector",0,"vocab"],value:"ResearchProjectInternal"},
        {obj:project,nodeMapping:["sector",1,"vocab"],value:"AidManagementPlatform"}
    ]
    
    
    //development partner id ownership
    if (project.projectId[1] && project.projectId[1].id) {
        
        if (project.projectId[1].id[0] == "P") {
            project.projectId[1].ownerName = "World Bank";
        }
        else {
            project.projectId[1].ownerName = "Asian Development Bank";
            project.projectId[1].ownerOrgIatiRef = "46004";
        }
    }
        
    //apply settings
    for (s in settings) {
        project = valueToObjectNode(settings[s]);
    }
    
    //clean and replace
    project = cleanAndReplace(project,['developmentPartner','name'],'Japan','Japan International Cooperation Agency');
    
    //reclassify donor organizations
    project.developmentPartner = reclassifySubObject(project.developmentPartner,'name','ref',[{evalValue:'Japan International Cooperation Agency',replaceValue:'JP-8'}]);
    
    
    //drop empty sectors and project databases
    //console.log(project.projectId);
    var p = 0;
    while (true) {
        //console.log(p);
        if (!project.projectId[p]) {
            break;
        }
        if (!project.projectId[p].id) {
            project.projectId.splice(p,1)
        }
        else {
            p++;
        }
    }
    p = 0;
    while(true) {
        if (!project.sector[p]) {
            break;
        }
        if (!project.sector[p].name && !project.sector[p].code) {
            project.sector.splice(p,1);
        }
        else {
            p++;
        }
    }
    //console.log(project.projectId);
    
    return project;
        
}






function preprocess (nodeMapping,value) {
    return value;
}
