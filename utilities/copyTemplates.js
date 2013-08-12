var fs = require('fs');
var async = require('async');
require('./../global/globals.js'); //brings in getTemplatePaths() which returns paths to all templates

var paths = getTemplatePaths();


async.forEach(paths, function(path, callback) {
        fs.createReadStream('./../data-templates/' +path).pipe(fs.createWriteStream('./../data/'+ path));
        return callback();
    },
    function(err) {
        if(err) console.log('Error: ' + err);
        console.log('All done.');
    }
); 