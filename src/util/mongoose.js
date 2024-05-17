module.exports = {
    mutipleMongooseToObject: function(mongooses) {
        return mongooses.map(mongoose => {
            if (mongoose.toObject) {
                return mongoose.toObject();
            } else {
                return mongoose;
            }
        });
    },
    mongooseToObject: function(mongoose) {
        return mongoose ? mongoose.toObject() : mongoose;
    },
}
