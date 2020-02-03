const fs = require('fs');

exports.ToCSV = function (results) {
    let dataFrame = []

    var ToMilitaryTime = function (label) {
        if (label == undefined) return undefined
        else if (label.endsWith('AM'))
          return label.startsWith('12') ? 2400 : parseInt(label.slice(0,-2)) * 100
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
    fs.writeFile('DataFrame.json', JSON.stringify(dataFrame), function (err) {if (err) throw err})
}