makeSchema = function(mongoose) {
    return {
        type: "Feature",
        geometry: {"type": "Point", "coordinates": []},
        properties: {
            geonameId: String,
            geoname: String,
            adm1: String,
            adm1Id: String,
            adm2: String,
            adm2Id: String
        }
    };
};
