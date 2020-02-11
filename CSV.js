const { Parser } = require('json2csv')
const fs = require('fs')

exports.Save = function (results) {
    let dataFrame = []

    var ToMilitaryTime = function (label) {
        if (label == undefined) return undefined
        else if (label.endsWith('AM'))
          return label.startsWith('12') ? 0000 : parseInt(label.slice(0,-2)) * 100
        else if (label.endsWith('PM'))
            return label.startsWith('12') ? 1200 : parseInt(label.slice(0,-2)) * 100 + 1200
    }

    for (result of results) {
        let row = {
            name : result.name,
            rating : result.rating,
            price : result.price
        }
        for (openHour of result.openHours) {
            row[openHour.day + '_closed'] = openHour.closed
            row[openHour.day + '_open'] = ToMilitaryTime(openHour.open)
            row[openHour.day + '_close'] = ToMilitaryTime(openHour.close)
        }
        for (popularity of result.popularity) {
            const time = ToMilitaryTime(popularity.hour)
            row[popularity.day + '_' + time] = popularity.popularity
        }
        dataFrame.push(row)
    }

    const parser = new Parser()
    const csv = parser.parse(dataFrame)
    fs.writeFile('DataFrame.csv', csv, function (err) {if (err) throw err})
}