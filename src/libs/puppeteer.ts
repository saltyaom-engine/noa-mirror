import { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import Stealth from 'puppeteer-extra-plugin-stealth'

import type { Hifumin, NHentai } from './types'

import { toHifumin } from './map'

export const createBrowser = async () => {
    puppeteer.use(Stealth())

    return puppeteer.launch({
        channel: 'chrome',
        headless: false,
        args: ['--no-sandbox'],
        executablePath: process.env.PUPPETEER_EXEC_PATH
    })
}

export const getLatestID = async (
    browser: Browser,
    iteration = 0
): Promise<number | Error> => {
    const page = await browser.newPage()
    await page.goto('https://nhentai.net', {
        waitUntil: 'networkidle2'
    })

    try {
        const firstCover = (
            await page.waitForSelector(
                '#content > .index-container:nth-child(3) > .gallery > .cover',
                {
                    timeout: 10000
                }
            )
        )?.asElement()
        if (!firstCover) throw new Error("Couldn't find first cover")

        const url = await firstCover.getProperty('href')

        const id = url
            .toString()
            .split('/')
            .reverse()
            .find((x) => x)

        await new Promise((resolve) => setTimeout(resolve, 3000))

        await page.close()

        return id ? parseInt(id) : new Error("Couldn't find id")
    } catch (err) {
        if (iteration < 5) {
            await new Promise((resolve) =>
                setTimeout(resolve, 3000 * iteration)
            )

            return getLatestID(browser, iteration + 1)
        }

        return new Error('Unable to bypass Cloudflare')
    }
}

export const getHifumin = async (
    browser: Browser,
    id: number,
    iteration = 0
): Promise<Hifumin | Error> => {
    const page = await browser.newPage()
    if (iteration > 1) await page.setJavaScriptEnabled(true)

    try {
        await page.goto(`https://nhentai.net/api/gallery/${id}`, {
            waitUntil: 'networkidle2'
        })

        await page.waitForSelector('body > pre', {
            timeout: iteration === 0 ? 2500 : 7500
        })

        const hentai = await page.$eval('body > pre', (el) => el.innerHTML)
        if (!hentai.startsWith('{"id"')) return new Error('Not found')

        const data = JSON.parse(hentai)

        if (typeof data.id === 'string') data.id = +data.id

        return toHifumin(data as NHentai)
    } catch (err) {
        if (iteration < 3) {
            await new Promise((resolve) => setTimeout(resolve, 5000))

            return getHifumin(browser, id, iteration + 1)
        }

        return new Error("Couldn't fetch hentai")
    } finally {
        await page.close()
    }
}
