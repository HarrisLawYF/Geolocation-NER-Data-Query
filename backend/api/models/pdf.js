'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PdfSchema = new Schema({
    values: [String],
    name: {
        type: String
    },
    address: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pdfs', PdfSchema);