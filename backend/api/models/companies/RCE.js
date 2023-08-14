'use strict';

var cheerio = require('cheerio')

exports.extract_data_for_ACT = function (html) {
    var body = {}
    const $ = cheerio.load(html)
    var result = $("p:nth-child(15)").text()
    var values = result.split(" ")
    body["cash_balance"] = values[14].replace(/[^\d.-]/g, '')

    var headers = ["cash_balance"]
    var location = [0,0]

    return { body, location, headers };
}