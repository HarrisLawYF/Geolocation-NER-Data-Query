'use strict';

var mongoose = require('mongoose'),
    util = require('../util/util'),
    pdf2HtmlConvertor = require('pdf2html'),
    AFIC = require('../models/companies/AFIC'),
    RCE = require('../models/companies/RCE'),
    GeoJsons = mongoose.model('GeoJsons'),
    Multer = require("multer"),
    CsvParser = require("json2csv").Parser,
    //Values = mongoose.model('Values'),
    cheerio = require('cheerio');
    //Pdfs = mongoose.model('Pdfs');

const storage = Multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + '/../../uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});

// Filter for CSV file
const pdfFilter = (req, file, cb) => {
    if (file.mimetype.includes("pdf")) {
        cb(null, true);
    } else {
        cb("Please upload only pdf file.", false);
    }
};

const FileUpload = Multer({ storage: storage, fileFilter: pdfFilter }).single("pdf");

//TODO: AI required?
//https://www.techtarget.com/searchenterpriseai/feature/AI-web-scraping-augments-data-collection

//Test Regex
// https://regex101.com/
// https://regexr.com/


exports.store_uploaded_file = function (req, res) {
    FileUpload(req, res, function (err) {
        if (err) {
            util.report_error(err, res)
        }

        var filename = req.file.filename
        var response;
        var result;
        var timeframe = Date.now()


        if (timeframe == null) {
            util.report_error(new Error("Timeframe not provided."), res)
        }

        pdf2HtmlConvertor.html('./uploads/' + filename, (err, html) => {
            (async () => {
                if (err)
                    util.report_error(err, res)
                if (req.params.documentName == "AFI_NTA") {
                    result = await AFIC.extract_data_for_NTA(html)
                } else if (req.params.documentName == "RCE_ACT") {
                    result = await RCE.extract_data_for_ACT(html)
                } else {
                    util.report_error(new Error("Document format not found."), res)
                }
                let object = util.set_body_structure(result.location, new Date(timeframe).getTime(), result.headers, result.body, req.params.documentName)
                GeoJsons.create(object, function (err, geojson) {
                    if (err)
                        util.report_error(err, res)
                    response = geojson
                    res.json(response)
                });
            })(); 
        })
    })
}

exports.extract_data_from_pdf = function (req, res) {
    var filename = req.body.filename
    var response;
    var result;
    var timeframe = req.body.timeframe


    if (timeframe == null) {
        util.report_error(new Error("Timeframe not provided."), res)
    }
    
    pdf2HtmlConvertor.html('./uploads/' + filename, (err, html) => {
        if (err)
            util.report_error(err, res)
        if (req.params.documentName == "AFI_NTA") {
            result = AFIC.extract_data_for_NTA(html)
        } else if (req.params.documentName == "RCE_ACT") {
            result = RCE.extract_data_for_ACT(html)
        } else {
            util.report_error(new Error("Document format not found."), res)
        }
        let object = util.set_body_structure(result.location, new Date(timeframe).getTime(), result.headers, result.body, req.params.documentName)
        GeoJsons.create(object, function (err, geojson) {
            if (err)
                util.report_error(err, res)
            response = geojson
            res.json(response)
        });
    })
}

exports.inspect = function (req, res) {
    var filename = req.body.filename
    pdf2HtmlConvertor.html("./uploads/" + filename, (err, html) => {
        if (err)
            util.report_error(err, res)
        err = util.generate_html_file(html, req.params.documentName + "_" + Math.floor(new Date().getTime() / 1000))
        if (err)
            util.report_error(err, res)
        res.json()
    })
}