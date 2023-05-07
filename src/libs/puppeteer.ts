import { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import Stealth from 'puppeteer-extra-plugin-stealth'
import { getRandom as getRandomUserAgent } from 'random-useragent'

import { toHifumin } from './map'

import type { Hifumin, NHentai } from './types'

export const usingTor = process.env.TOR == 'true'

const sleep = (second: number) =>
    new Promise((resolve) => setTimeout(resolve, second * 1000))

export const createBrowser = async () => {
    puppeteer.use(Stealth())

    return puppeteer.launch({
        channel: 'chrome',
        headless: false,
        args: [
            '--no-sandbox',
            usingTor ? '--proxy-server=socks5://127.0.0.1:9050' : ''
        ],
        executablePath: process.env.PUPPETEER_EXEC_PATH
    })
}

const userAgent = getRandomUserAgent()
const viewport = {
    width: 1600 + Math.floor(Math.random() * 320),
    height: 960 + Math.floor(Math.random() * 120)
}

export const detectTor = async (browser: Browser) => {
    if (!usingTor) return

    const page = await browser.newPage()

    await page.goto('https://check.torproject.org/')

    const torDetected = await page.$eval('body', (el) =>
        el.innerHTML.includes(
            'Congratulations. This browser is configured to use Tor'
        )
    )

    if (torDetected) console.log('Using Tor')
    else console.log('Failed to detect Tor. Proceed anyway...')

    page.close()
}

const newPage = async (browser: Browser) => {
    const page = await browser.newPage()

    await page.setViewport({
        ...viewport,
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false
    })

    await page.setJavaScriptEnabled(true)
    await page.setDefaultNavigationTimeout(0)
    // await page.setUserAgent(userAgent)

    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en'
    })

    return page
}

export const getLatestID = async (
    browser: Browser,
    iteration = 0
): Promise<number> => {
    const page = await newPage(browser)

    await page.goto('https://nhentai.net/api/galleries/search?query="', {
        waitUntil: 'networkidle2'
    })

    try {
        const humanVerification = await page
            .waitForSelector('.big-button.pow-button', {
                timeout: 30_000 + iteration * 2500
            })
            .then((x) => x?.asElement())
            .catch(() => null)

        if (humanVerification) await humanVerification.click()

        const hentai = await page.$eval('body > pre', (el) => el.innerHTML)
        if (!hentai.startsWith('{"result":[{"id":')) {
            console.error('Unable to get latest hentai')
            process.exit(1)
        }

        let idString =
            hentai[18] === '"'
                ? hentai.slice(19, hentai.indexOf('"', 20))
                : hentai.slice(17, hentai.indexOf(',', 18))

        const id = +idString.replace(/\"/g, '')

        await new Promise((resolve) => setTimeout(resolve, 3000))

        await page.close()

        if (isNaN(id)) {
            console.error('Fail to parse id (id is NaN)')
            process.exit(1)
        }

        return id
    } catch (err) {
        const errorPage = await page.$eval('html', (el) => el.innerHTML)
        const content = await page.$eval('html', (el) => el.textContent)

        await page.close()

        if (iteration < 2) {
            await new Promise((resolve) =>
                setTimeout(resolve, 3000 * iteration)
            )

            return getLatestID(browser, iteration + 1)
        }

        console.error('Unable to bypass Cloudflare')
        console.error(errorPage)
        console.log('Text Content:')
        console.error(content)
        process.exit(1)
    }
}

export const getHifumin = async (
    browser: Browser,
    id: number,
    iteration = 0
): Promise<Hifumin | Error> => {
    const page = await newPage(browser)

    try {
        await page.goto(`https://nhentai.net/api/gallery/${id}`, {
            waitUntil: 'networkidle2'
        })

        await page.waitForSelector('body > pre', {
            timeout: iteration === 0 ? 2500 : 7500
        })

        const hentai = await page.$eval('body > pre', (el) => '' + el.innerText)

        if (!hentai.startsWith('{"id"')) return new Error('Not found')

        const data = JSON.parse(hentai)

        if (typeof data.id === 'string') data.id = +data.id

        return toHifumin(data as NHentai)
    } catch (err) {
        if (iteration < 5) {
            await new Promise((resolve) => setTimeout(resolve, 5000))

            return getHifumin(browser, id, iteration + 1)
        }

        return new Error("Couldn't fetch hentai")
    } finally {
        await page.close()
    }
}
