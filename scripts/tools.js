cleanAndReplace = function (object,nodeMapping,targetValue,newValue) {    

    if (getNodeValue({obj:object,nodeMapping:nodeMapping}) == targetValue) {
        console.log('inside');
        valueToObjectNode({obj:object,nodeMapping:nodeMapping,value:newValue})
    }
    return object;
}





var fs = require('fs');
var csv = require('csv');

readCsvToJson = function(csvPath,handleData,callback) {
    
    var completePath = './data/' + csvPath;
    
    fs.readFile(completePath, function(err,data) {
        
        if (err) return callback(err);
        
        csv().from.string(data).to.array(function(data){
            var jsonArray = [];
            var jsonTemplate = {};
            for (d in data) {
                if (d == 0) { 
                    for (k in data[0]) {
                         jsonTemplate[data[0][k]] = ""
                     }
                } 
                else {
                    //console.log(jsonTemplate);
                    var tempTemplate = Object.create(jsonTemplate);
                    var l = 0;
                    for (k in tempTemplate) {
                        tempTemplate[k] = data[d][l];
                        l++;
                    }
                    jsonArray.push(Object.create(tempTemplate));
                }
            }
            handleData(jsonArray,csvPath,callback);   
        });
        
    });   
}




mapJsonValues = function(settings) {
    var sourceObject = settings.sourceObject;
    var sourceMapping = settings.sourceNodeMapping.slice();
    var destObject = settings.destObject;
    var destMapping = settings.destNodeMapping.slice();
    var value = getNodeValue({nodeMapping:sourceMapping.slice(),obj:sourceObject});
    if (settings.preprocess) {
        value = settings.preprocess(sourceMapping.slice(),value)
    };
    return valueToObjectNode({obj:destObject,nodeMapping:destMapping,value:value});
}

valueToObjectNode = function(settings) {
    if (settings.nodeMapping.length > 1) {
        var newNodeMapping = settings.nodeMapping.splice(1,settings.nodeMapping.length-1);
        settings.obj = settings.obj || {};
        settings.obj[settings.nodeMapping[0]] = valueToObjectNode({obj: settings.obj[settings.nodeMapping[0]] || {}, nodeMapping:newNodeMapping, value:settings.value});
        return settings.obj;
    }
    else {
        settings.obj[settings.nodeMapping[0]] = settings.value; //note changed this
        return settings.obj;
    }
}

getNodeValue = function(settings) {
    //THIS FUNCTION IS WHERE I ADD ARRAY SUPPORT
    var mapping = settings.nodeMapping;
    var obj = settings.obj;
    if (obj[mapping[0]]) {
        if (mapping.length > 1) {
            //somewhere here i need to add support for arrays
            var newMapping = mapping.splice(1,mapping.length-1);
            return getNodeValue({nodeMapping:newMapping,obj:obj[mapping[0]]});
        }
        else {
            return obj[mapping[0]];
        }
    }
    else {
        return null;
    }
}

reclassifySubObject = function(object,evalKey,replaceKey,classificationScheme) {
    
    for (v in classificationScheme) {
        if (classificationScheme[v].evalValue == object[evalKey]) {
            console.log('replacing');
            object[replaceKey] = classificationScheme[v].replaceValue;
        }
        console.log(object);
    }
    
    return object;
}
    
    
    
    
