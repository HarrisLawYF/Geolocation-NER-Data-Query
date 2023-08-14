'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var GeoJsonSchema = new Schema({
    location: [Number],
    timeframe: {
        type: Number
    },
    name: {
        type: String
    },
    headers: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    body: {
        type: Object
    }
});

module.exports = mongoose.model('GeoJsons', GeoJsonSchema);