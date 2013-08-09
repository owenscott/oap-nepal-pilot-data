makeSchema = function(mongoose) {
    return {
        projectId: [{
            type: String,
            value: String,
            owner: String
        }],
        title: String,
        sector: [{
            code: String,
            vocab: String,
            name: String
        }],
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
        procurementRecord: [{type: mongoose.Schema.Types.ObjectId, ref: 'ProcurementRecord'}],
        indicator: [{type: mongoose.Schema.Types.ObjectId, ref: 'Indicator'}],
        location: [{ 
            location: {type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
            geocoding: {
                precision: String
            }
        }]
        
    };
};