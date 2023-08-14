'use strict';

var mongoose = require('mongoose'),
    util = require('../util/util'),
    GeoJsons = mongoose.model('GeoJsons');

exports.get_a_geojson = function (req, res) {
    var bbox = req.query.bbox;
	var start = req.query.start;
    var end = req.query.end;
    var name = req.query.name;
	var coorMinX = 0
	var coorMinY = 0
	var coorMaxX = 0
    var coorMaxY = 0
    var query = {}

    if (bbox != null) {
        bbox = JSON.parse(bbox);

        if (bbox.length < 4) {
            util.report_error(new Error("bbox not closed"), res)
        } else {
            coorMinX = bbox[0]
            coorMinY = bbox[1]
            coorMaxX = bbox[2]
            coorMaxY = bbox[3]

            if (coorMinX > 180 || coorMinY < -180 || coorMinX > 90 || coorMinY < -90) {
                let minCoors = util.convert_EPSG_3875_to_EPSG_4326(coorMinY, coorMinX)
                coorMinX = minCoors.lng
                coorMinY = minCoors.lat
            }

            if (coorMaxX > 180 || coorMaxY < -180 || coorMaxX > 90 || coorMaxY < -90) {
                let maxCoors = util.convert_EPSG_3875_to_EPSG_4326(coorMaxY, coorMaxX)
                coorMaxX = maxCoors.lng
                coorMaxY = maxCoors.lat
            }

            var within = [
                [coorMinX, coorMinY],
                [coorMaxX, coorMinY],
                [coorMaxX, coorMaxY],
                [coorMinX, coorMaxY],
                [coorMinX, coorMinY]
            ]

            query["location"] = {
                $geoWithin: {
                    $geometry: {
                        "type": "Polygon",
                        coordinates: [within],
                        crs: {
                            type: "name",
                            properties: { name: "urn:x-mongodb:crs:strictwinding:EPSG:4326" }
                        }
                    }
                }
            }
        }

    }

    if (start != null && end != null) {
        var timeStart = Math.floor(new Date(start).getTime());
        var timeEnd = Math.floor(new Date(end).getTime());

        query["timeframe"] = {$gte: timeStart, $lt: timeEnd}
    } else if (start != null) {
        var timeStart = Math.floor(new Date(start).getTime());

        query["timeframe"] = {$gte: timeStart}
    } else if (end != null){
        var timeEnd = Math.floor(new Date(end).getTime());

        query["timeframe"] = {$lt: timeEnd }
    }
    if (name != null) {
        query["name"] = {$eq: name}
    }

	GeoJsons.find(query, function(err, geojson){
        if (err)
            util.report_error(err, res);
    	res.json(geojson);
    });
};

exports.insert_geojsons = function (req, res) {
	var bulkData = []
	var data = req.body.data
	data.forEach(record => {
		var coorX = record.x
		var coorY = record.y
		var insert = {}

        if (coorX == null || coorY == null) {
            util.report_error(new Error("coordinates missing for record"), res);
		}

		if(coorX > 180 || coorY < -180 || coorX > 90 || coorY < -90) {
            let coors = util.convert_EPSG_3875_to_EPSG_4326(coorY, coorX)
            coorX = coors.lng
            coorY = coors.lat
		}

		// Minimise the blob data by removing the coordinates part we already stored
		delete record["x"]
		delete record["y"]

		insert = {location: [coorX, coorY], data: record }
		if (record.time != null) {
			var time = Math.floor(new Date(record.time).getTime() / 1000);
			delete record["time"]
			insert["timeframe"] = time
		}
		bulkData.push(insert)
	});

	GeoJsons.insertMany(bulkData, function (err, geojson) {
        if (err)
            util.report_error(err, res);
		res.json(geojson);
	});
};


exports.get_a_geojson_by_id = function (req, res) {
	GeoJsons.findById(req.params.geojsonId, function (err, geojson) {
        if (err)
            util.report_error(err, res);
		res.json(geojson);
	});
};


exports.update_a_geojson = function (req, res) {
	GeoJsons.findOneAndUpdate({ _id: req.params.geojsonId }, req.body, { new: true }, function (err, geojson) {
        if (err)
            util.report_error(err, res);
		res.json(geojson);
	});
};


exports.delete_a_geojson = function (req, res) {
	GeoJsons.remove({
		_id: req.params.geojsonId
	}, function (err, geojson) {
        if (err)
            util.report_error(err, res);
		res.json({ message: 'GeoJson successfully deleted' });
	});
};
