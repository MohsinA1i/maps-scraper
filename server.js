const Puppeteer = require('puppeteer')

const Scraper = require('./Scraper.js')
const Csv = require('./Csv.js')

CATEGORIES = ['greek', 'mediterranean', 'middle+eastern']
LATITUDE = 42.0493507
LONGITUDE = -87.6819763
ZOOM = 13

async function browse() {
  const browser = await Puppeteer.launch({headless: false, defaultViewport: null})
  let results = []

  for (const category of CATEGORIES) {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(0)
    await page.goto(`https://www.google.com/maps/search/${category}+restaurant/@${LATITUDE},${LONGITUDE},14z`, {timeout : 0, waitUntil : 'networkidle0'})

    while (true) {
      const count = await page.$$eval('.section-result[data-section-id^="or:"]', elements => elements.length)

      for (let i = 1; i <= count; i++) {
        await page.waitFor(1000)
        await page.click(`.section-result[data-section-id="or:${i}"]`)
        await page.waitForSelector('.section-hero-header-title-title')

        results.push(await Scraper.ScrapePlace(page))

        await page.waitFor(1000)
        await page.click('.section-back-to-list-button')
        await page.waitForSelector(`.section-result`)
      }

      let nextDisabled = await page.$eval('[aria-label=" Next page "]', element => element.disabled)
      if (nextDisabled) break
      let zoom = Object.values(page.url().match(/,\d+z/i))[0].slice(1,-1) 
      if (zoom < ZOOM) break //Scrapes one column of results at lower zoom
   
      await page.waitFor(1000)
      await page.click('[aria-label=" Next page "]')  
      const firstName = await page.$eval('[data-section-id^="or:"] .section-result-title span', element => element.textContent)
      await page.waitForFunction(
        (firstName) => document.querySelector('[data-section-id^="or:"] .section-result-title span').innerText != firstName,
        {timeout: 0}, firstName
      )
    }

    await page.close()
  }

  await browser.close()
  Csv.Save(results)
}

browse()