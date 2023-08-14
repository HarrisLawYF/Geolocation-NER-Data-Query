'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ValueSchema = new Schema({
    pattern: {
        type: String
    },
    regex: {
        type: String
    },
    title: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Values', ValueSchema);