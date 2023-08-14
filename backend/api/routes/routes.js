'use strict';

/* Original design to consume csv file, but seems a bit too complicated, might as well just process pure JSON
const multer = require("multer")
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + '/uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});

// Filter for CSV file
const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes("csv")) {
        cb(null, true);
    } else {
        cb("Please upload only csv file.", false);
    }
};
const upload = multer({ storage: storage, fileFilter: csvFilter });*/

module.exports = function (app) {
    var geoDataFunctions = require('../controllers/geoDataController');
    var pdfDataFuntions = require('../controllers/pdfDataController');

    app.route('/geodata')
        .get(geoDataFunctions.get_a_geojson)
        .post(geoDataFunctions.insert_geojsons);
        //.post(upload.single('file'), geoDataFunctions.insert_geojsons);

    app.route('/pdf/upload/:documentName')
        .post(pdfDataFuntions.store_uploaded_file)

    app.route('/pdf/:documentName')
        .post(pdfDataFuntions.extract_data_from_pdf)

    app.route('/inspect/:documentName')
        .post(pdfDataFuntions.inspect)

    app.route('/geodata/:geojsonId')
        .get(geoDataFunctions.get_a_geojson_by_id)
        .put(geoDataFunctions.update_a_geojson)
        .delete(geoDataFunctions.delete_a_geojson);
};