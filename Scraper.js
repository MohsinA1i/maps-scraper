exports.ScrapeDetails = async function(page) {
  let name = await page.$eval('.section-hero-header-title-title', element => element.textContent)

  let rating = undefined
  try {  
    rating = await page.$eval('.section-star-display', element => element.textContent)
  } catch (error){}

  let price = undefined
  try {  
    price = await page.$eval('[aria-label^="Price"]', element => element.textContent.length)
  } catch (error){}

  let hours = await page.$$eval('.widget-pane-info-open-hours-row-interval', elements => elements.map(element => {
    let text = element.textContent
    if (text == 'Closed')
      return {open : 0000, close : 0000, closed : true}
    else {
      let times = element.textContent.split('–')
      for (let i = 0; i < times.length; i++) {
        let time = times[i]
        if (time.endsWith('AM'))
          times[i] = time.startsWith('12') ? 2400 : parseInt(time.slice(0,-2)) * 100
        else if (time.endsWith('PM'))
            times[i] = time.startsWith('12') ? 1200 : parseInt(time.slice(0,-2)) * 100 + 1200
        else
          times[i] = i == 0 ? parseInt(time) * 100 : parseInt(time) * 100 + 1200
      }
      return {open : times[0], close : times[1], closed : false}
    }
  }))

  return {
    name : name,
    rating : rating,
    price : price,
    monday_open: hours[0].open,
    tuesday_open: hours[1].open,
    wednesday_open: hours[2].open,
    thursday_open: hours[3].open,
    friday_open: hours[4].open,
    saturday_open: hours[5].open,
    sunday_open: hours[6].open,
    monday_close: hours[0].close,
    tuesday_close: hours[1].close,
    wednesday_close: hours[2].close,
    thursday_close: hours[3].close,
    friday_close: hours[4].close,
    saturday_close: hours[5].close,
    sunday_close: hours[6].close,
  }
}