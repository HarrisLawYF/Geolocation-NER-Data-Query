'use strict';

var cheerio = require('cheerio'),
    util = require('../../util/util');

exports.extract_data_for_NTA = async function (html) {

    /*Pdfs.findOne({ name: req.params.documentName }, function (err, pdf) {
        if (err)
            util.report_error(err, res)
        Values.find({ _id: { $in: pdf.values } }, function (err, values) {
            if (err)
                util.report_error(err, res)
            pdf2HtmlConvertor.html('./uploads/' + filename, (err, html) => {
                if (err)
                    util.report_error(err, res)
                const $ = cheerio.load(html)
                values.forEach(value => {
                    var re = new RegExp(value.regex);
                    var result = $(value.pattern).text().match(re);
                    console.log($(value.pattern).text())
                    console.log($(value.pattern).text().match(re))
                    if (result)
                        console.log(value.title + ": " + result[1]);
                    console.log("-----------------")
                });
                res.json()
            })
        });
        res.json();
    });*/


    //TODO: see if we can get address as well
    var body = []
    var address = ""
    const $ = cheerio.load(html)

    /*    static way of retrieving values
    var result = $("p:nth-child(27)").text()
    var values = result.split("\n")
    // Remove unwanted text in arrays
    values.splice(0, 1);
    values.splice(0, 1);
    values.splice(25, 1);
    values.splice(25, 1);

    //Construct objects
    values.forEach(record => {
        var name = record.replace(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1})?/g,' ').trimLeft().trimRight();
        var digits = record.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1})?/g);
        var item = {}
        item["id"] = digits[0]
        item["name"] = name
        item["value"] = digits[1]
        item["portfolio"] = digits[2]
        item["empty"] = ""
        item["contact"] = ""
        body.push(item)
    });

    for (let p of pS) {
        if (p.length > 95) {
            continue
        }
        //console.log(p)
        var address = p.match(/^[#.0-9a-zA-Z\s,-]+[ ](?:[A-Za-z0-9.-]+[ ]?)+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Dr|Rd|Blvd|Ln|St|Level)+[#.0-9a-zA-Z\s,-]+[ ](?:[A-Za-z0-9.-]+[ ]?)\.?/g)
        //console.log(address)
        //console.log("----------------------")
        if (address) {
            body[0].contact = address
            break;
        }
    }*/

    /*   machine learning way fo retrieving values */
    
    var texts = []
    $("p").each(function (i, el) {
        texts.push($(this).text())
    })
    $("h1").each(function (i, el) {
        texts.push($(this).text())
    })
    $("h2").each(function (i, el) {
        texts.push($(this).text())
    })
    $("h3").each(function (i, el) {
        texts.push($(this).text())
    })
    $("table").each(function (i, el) {
        texts.push($(this).text())
    })

    //TODO: maybe do this in a python module?
    var addressClassifier = util.load_address_ner()
    var tableClassifier = util.load_table_ner()
    await Promise.all(texts.map(async (text) => {
        var trimmedText = text.replaceAll("\n", " ")
        var isAddress = await addressClassifier.process('en', trimmedText);
        var isTable = await tableClassifier.process('en', trimmedText);
        if (text.length > 0) {
            console.log(isTable.classifications)
            console.log(trimmedText)
            if (isTable.classifications[0].intent == "TABLE" && isTable.classifications[0].score >= 0.8) {
                try {
                    var values = text.split("\n")
                    //Because we know it is top 25, so we can further filter it
                    if (values.length > 25) {
                        values.splice(25, 1);
                        values.splice(25, 1);
                        values.forEach(record => {
                            var name = record.replace(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1})?/g, ' ').trimLeft().trimRight();
                            var digits = record.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1})?/g);
                            var item = {}
                            item["id"] = digits[0]
                            item["name"] = name
                            item["value"] = digits[1]
                            item["portfolio"] = digits[2]
                            item["empty"] = ""
                            item["contact"] = ""
                            body.push(item)
                        });
                    }
                }
                catch (err) {
                    console.log("Possible wrong classification: " + err)
                }
            }
            console.log("----------------------------")
            if (((isAddress.classifications.length == 1) || (isAddress.classifications[1] != "GPE" && isAddress.classifications[1].score < 0.5)) && isAddress.classifications[0].intent == "GPE" && isAddress.classifications[0].score >= 0.6) {
                address = "\"" + trimmedText + "\""
            }
        }
    }));

    if (body != null & body.length > 0) {
        body[0].contact = address
    }

    var headers = ["id", "name", "value", "portfolio", "", "contact"]
    var location = [0, 0]

    return { body, location, headers };
}