const { Parser } = require('json2csv')
const fs = require('fs')

exports.Save = function (results) {
    let dataFrame = []

    let ToMilitaryTime = function (label) {
        if (label == undefined) return undefined
        else if (label.endsWith('AM'))
          return label.startsWith('12') ? 0 : parseInt(label.slice(0,-2)) * 100
        else if (label.endsWith('PM'))
            return label.startsWith('12') ? 1200 : parseInt(label.slice(0,-2)) * 100 + 1200
    }

    for (result of results) {
        let days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

        let openHoursSorted = new Array(7)
        for (openHour of result.openHours) openHoursSorted[days.indexOf(openHour.day)] = openHour

        for (openHour of openHoursSorted) {
            result[openHour.day + '_closed'] = openHour.closed
            result[openHour.day + '_open'] = ToMilitaryTime(openHour.open)
            result[openHour.day + '_close'] = ToMilitaryTime(openHour.close)
        }
        delete result.openHours
        
        let popularitiesSorted = new Array(7)
        for (popularity of result.popularity) {
            let dayIndex = days.indexOf(popularity.day)   
            let popularitySorted = popularitiesSorted[dayIndex]
            if (popularitySorted == undefined) popularitySorted = []
            popularity.hour = ToMilitaryTime(popularity.hour)
            if (popularitySorted.length == 0) popularitySorted.push(popularity)
            else if (popularity.hour < popularitySorted[0].hour) popularitySorted.unshift(popularity)
            else if (popularity.hour > popularitySorted[popularitySorted.length - 1].hour) popularitySorted.push(popularity)
            popularitiesSorted[dayIndex] = popularitySorted
        }


        for (popularitySorted of popularitiesSorted) {
            if (popularitySorted == undefined) continue
            for (popularity of popularitySorted) {
                if (popularity.hour == 0) popularity.hour = '0000'
                result[popularity.day + '_' + popularity.hour] = popularity.popularity
            }
        }
        delete result.popularity

        dataFrame.push(result)
    }

    const parser = new Parser()
    const csv = parser.parse(dataFrame)
    fs.writeFile('Businesses.csv', csv, function (err) {if (err) throw err})
}