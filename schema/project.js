//DONE

makeSchema = function(mongoose) {
    
    
    var ProjectId = mongoose.Schema({
        type: String,
        value: String,
        owner: String
    });
    
    var Sector = mongoose.Schema({
        code: String,
        vocab: String,
        name: String
    });
                                 
    var Location = mongoose.Schema({
        location: {type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
        geocoding: {
            precision: String
        }
    });                        
                                 
    var Project = mongoose.Schema({
        projectId: [ProjectId],
        title: String,
        sector: [Sector],
        description: String,
        partnerMinistry: String,
        partnerDepartment: String,
        startDate: Date,
        endDate: Date,
        totalCommitment: Number,
        totalDisbursement: Number,
        dataSource: {
            name: String,
            document: {type: mongoose.Schema.Types.ObjectId, ref: 'Person' }
        },
        procurementRecord: [],
        indicator: [],
        location: [Location]
    });
        
    return Project; 
};