//DONE

makeSchema = function(mongoose) {
    
    var Currency = mongoose.Schema({
        code: String,
        name: String,
        rate: [{
            year: String,
            toUSD: Number
        }]            
    });
               
    return Currency;
               
};