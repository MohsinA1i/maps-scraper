exports.ScrapeDetails = async function(page) {
  let name = await page.$eval('.section-hero-header-title-title', element => element.textContent)
  console.log(name)

  let rating = undefined
  try {  
    rating = await page.$eval('.section-star-display', element => element.textContent)
  } catch (error){}

  let price = undefined
  try {  
    price = await page.$eval('[aria-label^="Price"]', element => element.textContent.length)
  } catch (error){}

  let address = await page.$eval('[aria-label="Address"]', element => {
    if (!element) return
    return element.parentElement.querySelector('.section-info-text').textContent
  })

  let pluscode = await page.$eval('.maps-sprite-pane-info-plus-code', element => { 
    if (!element) return
    return element.parentElement.parentElement.querySelector('.section-info-text').textContent
  })
  
  let phone = await page.$eval('[aria-label="Phone"]',  element => {
    if (!element) return
    return element.parentElement.querySelector('.section-info-text').textContent
  })

  let openHours = await page.$$eval('.widget-pane-info-open-hours-row-row', elements =>
    elements.map(element => {
      let day = element.querySelector('.widget-pane-info-open-hours-row-header').textContent.toLowerCase().trim()
      let interval = element.querySelector('.widget-pane-info-open-hours-row-interval').textContent
   
      let result = {day: day}
      if (interval == 'Closed')
        result.closed = true
      else if (interval == 'Open 24 hours') {
        result.open = true
        result.open = '12AM'
        result.close = '12AM'
      } else {
        let hours = interval.split('–')
        let openingHour = hours[0]
        if (!(openingHour.endsWith('PM') || openingHour.endsWith('AM'))) 
          openingHour = openingHour + 'AM'
        let closingHour = hours[1]
        if (!(closingHour.endsWith('PM') || closingHour.endsWith('AM'))) 
          closingHour = closingHour + 'PM'

        result.open = openingHour  
        result.close = closingHour
        result.closed = false
      }
      return result
    })
  )
  //console.log(openHours)

  let days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  let popularity = []
  for (let i = 0; i < 7; i++) {
    let popularityDay = await page.$$eval(`.section-popular-times-container [jsinstance="${i == 6 ? '*6' : i}"] .section-popular-times-bar`,
      (elements, day) => { 
        let result = []
        for (element of elements) {
          let label = element.getAttribute('aria-label')
          let hour = label.match(/\d+ [AP]M/i)
          if (hour == undefined) continue
          let popularity = label.match(/\d+%/)
          if (popularity == undefined) continue

          result.push({day : day, hour : hour[0], popularity : popularity[0].slice(0, -1)})
        }
        return result
      }, days[i])
    popularity = popularity.concat(popularityDay)
  }
  //console.log(popularity)

  return {
    name : name,
    rating : rating,
    price : price,
    address : address,
    pluscode : pluscode,
    phone : phone,
    openHours : openHours,
    popularity: popularity
  }
}