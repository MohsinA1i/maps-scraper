const puppeteer = require('puppeteer')

CATEGORIES = ['mediterranean', 'greek', 'middle+eastern']
COORDINATES = '42.0493507,-87.6819763'

async function browse() {
  const browser = await puppeteer.launch({headless: false, defaultViewport: null})
  let dictionary = {
    'name' : [],
    'rating' : [],
    'price' : []
  }

  for (const category of CATEGORIES) {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)
    await page.goto(`https://www.google.com/maps/search/${category}+restaurant/@${COORDINATES},14z`, {timeout : 0, waitUntil : 'networkidle0'})
    
    const start = await page.$eval('[jstcache="284"]', element => element.textContent)
    const end = await page.$eval('[jstcache="285"]', element => element.textContent)
    const count = end - start + 1
    
    for (let i = 1; i <= count; i++) {
      await page.waitFor(1000)
      await page.click(`.section-result[data-section-id="or:${i}"]`)
      await page.waitForSelector('.section-hero-header-title-title')

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

      let restaurant = {
        name : name,
        rating : rating,
        price : price,
        hours : hours
      }
      console.log(restaurant)

      await page.waitFor(1000)
      await page.click('.section-back-to-list-button')
      if (i < count) await page.waitForSelector(`.section-result[data-section-id="or:${i+1}"]`)
    }

    /*await page.waitFor(1000)
    await page.click('[aria-label=" Next page "]')
    await page.waitForSelector('.section-result')

    await page.waitFor(1000)
    await page.click(`.section-result[data-section-id="or:1"]`)
    await page.waitForSelector('.section-hero-header-title-title')
    
    await page.waitFor(10000)*/

    await page.close()
  }

  await browser.close()
}

browse()