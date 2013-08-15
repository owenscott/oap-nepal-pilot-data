//DONE

makeSchema = function(mongoose) {
    
    
    var ProjectId = mongoose.Schema({
        type: String,
        value: String,
        owner: String
    });
    

                                 
    var GeocodedLocation = mongoose.Schema({
        location: {type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
        geocoding: {
            precision: String
        }
    });
    
    
    
                                 
    var Project = mongoose.Schema({
        projectId: Array,
        title: String,
        sector: Array,
        description: String,
        developmentPartner: {
            name: String,
            ref: String
        },
        partnerMinistry: String,
        partnerDepartment: String,
        startDate: Date,
        endDate: Date,
        totalCommitmentUsd: Number,
        totalDisbursementUsd: Number,
        dataSource: {
            name: String,
            document: {type: mongoose.Schema.Types.ObjectId, ref: 'Person' }
        },
        procurementRecord: [],
        indicator: [],
        location: [GeocodedLocation]
    });
    
    Project.methods.getDonorId = function(callback) {
        console.log('method');
    }
    
    
        
    return Project; 
};