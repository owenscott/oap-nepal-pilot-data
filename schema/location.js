makeSchema = function(mongoose) {
    
    var Location = mongoose.Schema({
        locationType: String,
        geometry: {"type": String, "coordinates": []},
        properties: {
            geonameId: String,
            geoname: String,
            adm1: String,
            adm1Id: String,
            adm2: String,
            adm2Id: String
        }
    });
    
    return Location;
    
};
