const puppeteer = require('puppeteer')
const z = require('zebras')

const Scraper = require('./Scraper.js')

CATEGORIES = ['mediterranean', 'greek', 'middle+eastern']
COORDINATES = '42.0493507,-87.6819763'
ZOOM = 14

async function browse() {
  const browser = await puppeteer.launch({headless: false, defaultViewport: null})
  let results = []

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

        results.push(await Scraper.ScrapeDetails(page))

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
      await page.waitForFunction(`document.querySelector('[data-section-id^="or:"] [jstcache="124"]').innerText != '${firstName}'`)
    }

    await page.close()
  }

  await browser.close()
  console.log(results)
  z.toCSV('Businesses.csv', results)
}

browse()