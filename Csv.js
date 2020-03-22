const { Parser } = require('json2csv')
const fs = require('fs')

exports.Save = function (results) {
    let dataFrame = []

    let ToMilitaryTime = function (label) {
        if (label == undefined) return undefined
        else if (label.endsWith('AM'))
          return label.startsWith('12') ? '0000' : parseInt(label.slice(0,-2)) * 100
        else if (label.endsWith('PM'))
            return label.startsWith('12') ? 1200 : parseInt(label.slice(0,-2)) * 100 + 1200
    }

    for (result of results) {
        for (openHour of result.openHours) {
            result[openHour.day + '_closed'] = openHour.closed
            result[openHour.day + '_open'] = ToMilitaryTime(openHour.open)
            result[openHour.day + '_close'] = ToMilitaryTime(openHour.close)
        }
        delete result.openHours

        for (popularity of result.popularity) {
            const time = ToMilitaryTime(popularity.hour)
            result[popularity.day + '_' + time] = popularity.popularity
        }
        delete result.popularity

        dataFrame.push(result)
    }

    const parser = new Parser()
    const csv = parser.parse(dataFrame)
    fs.writeFile('Businesses.csv', csv, function (err) {if (err) throw err})
}