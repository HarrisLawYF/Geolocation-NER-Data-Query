'use strict';

const csv = require("fast-csv")
const fs = require('fs');
const { NlpManager } = require('node-nlp');

const natural = require('natural');


exports.read_csv_file = function (filePath) {
    try {
        let csvData = [];
        fs.createReadStream(filePath)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                return null, error
            })
            .on("data", (row) => {
                csvData.push(row);
            })
            .on("end", () => {
                return csvData, null
            });
    } catch (error) {
        return null, error
    }
};

exports.report_error = function (err, res) {
   //TODO: we can send email/sms to both users and developers about any errors
    if (res != null) {
        res.send(err)
    }
};

exports.set_body_structure = function (location, timeframe, headers, body, name) {
    return { location: location, timeframe: timeframe, headers: headers, body: body, name: name }
};

exports.generate_html_file = function (html, filename) {
    try {
        fs.writeFile("./inspections/" + filename + '.html', html, function (err) {
            if (err)
                return err
            return null
        }); 
    } catch (err) {
        return err
    }
};

exports.convert_EPSG_3875_to_EPSG_4326 = function (y, x){
    let lng = x * 180 / 20037508.34
    let lat = Math.atan(Math.exp(y * Math.PI / 20037508.34)) * 360 / Math.PI - 90

    return { lat, lng };
};

exports.learn_and_create_classifier = async function (sample, filename) {
    const manager = new NlpManager({ languages: ['en'], forceNER: true });
    sample.forEach(record => {
        manager.addDocument(record.locale, record.text, record.tag);
    })
    await manager.train();
    manager.save(filename);
    return manager;
}

exports.learn_addresses = async function () {
    var sample = fs.readFileSync('./samples/address.json');
    var addresses = JSON.parse(sample);
    var shuffledAddresses = addresses.sort((a, b) => 0.5 - Math.random());
    var classifier = await this.learn_and_create_classifier(shuffledAddresses, "addresses-ner")
    return classifier;
}

exports.learn_table = async function () {
    var sample = fs.readFileSync('./samples/tables.json');
    var data = JSON.parse(sample);
    var shuffleData = data.sort((a, b) => 0.5 - Math.random());
    var classifier = await this.learn_and_create_classifier(shuffleData, "tables-ner")
    return classifier;
}

exports.load_address_ner = function () {
    const manager = new NlpManager({ languages: ['en'], forceNER: true });
    manager.load("addresses-ner");
    return manager;
}

exports.load_table_ner = function () {
    const manager = new NlpManager({ languages: ['en'], forceNER: true });
    manager.load("tables-ner");
    return manager;
}