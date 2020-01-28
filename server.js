const puppeteer = require('puppeteer')

CATEGORIES = ['mediterranean', 'greek', 'middle+eastern']
COORDINATES = '42.0493507,-87.6819763'
ZOOM = 14

async function browse() {
  const browser = await puppeteer.launch({headless: false, defaultViewport: null})

  for (const category of CATEGORIES) {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)
    await page.goto(`https://www.google.com/maps/search/${category}+restaurant/@${COORDINATES},14z`, {timeout : 0, waitUntil : 'networkidle0'})

    while (true) {
      const count = await page.$$eval('.section-result[data-section-id^="or:"]', elements => elements.length)

      for (let i = 1; i <= count; i++) {
        await page.waitFor(1000)
        await page.click(`.section-result[data-section-id="or:${i}"]`)
        await page.waitForSelector('.section-hero-header-title-title')

        await ScrapeDetails(page)

        await page.waitFor(1000)
        await page.click('.section-back-to-list-button')
        await page.waitForSelector(`.section-result`)
      }

      let nextDisabled = await page.evaluate(`document.querySelector('[aria-label=" Next page "]').disabled`)
      if (nextDisabled) break
      let zoom = Object.values(page.url().match(/,[0-9]+z/i))[0].slice(1,-1)
      if (zoom < ZOOM) break

      const firstName = await page.$eval('[data-section-id^="or:"] [jstcache="124"]', element => element.textContent)
      
      await page.waitFor(1000)
      await page.click('[aria-label=" Next page "]')
      console.log(`document.querySelector('[data-section-id^="or:"] [jstcache="124"]').innerText != '${firstName}'`)
      await page.waitForFunction(`document.querySelector('[data-section-id^="or:"] [jstcache="124"]').innerText != '${firstName}'`)
    }

    await page.close()
  }

  await browser.close()
}

async function ScrapeDetails(page){
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
    hours : hours
  }
}

browse()