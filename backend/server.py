var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    mongoose = require('mongoose'),
    GeoJson = require('./api/models/geojson'), //created model loading here
    Pdf = require('./api/models/pdf'),
    Value = require('./api/models/value'),
    util = require('./api/util/util'),
    fs = require('fs'),
    bodyParser = require('body-parser');
const cors = require("cors")



// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/geojsondb');

(async () => {
    if (!fs.existsSync("addresses-ner")) {
        await util.learn_addresses()
    }
    if (!fs.existsSync("tables-ner")) {
        await util.learn_table()
    }
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors())

    var routes = require('./api/routes/routes'); //importing route
    routes(app); //register the route


    app.listen(port);


    console.log('GeoJson RESTful API server started on: ' + port);
})();