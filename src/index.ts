import { existsSync } from 'fs'
import { stat, writeFile, mkdir } from 'fs/promises'

import PQueue from 'p-queue'

import {
    createBrowser,
    createProgress,
    getHifumin,
    getLatestID,
    getSavePoint,
    NHentai,
    SearchIndex
} from './libs'

const queue = new PQueue({ concurrency: 6 })

const main = async () => {
    const browser = await createBrowser()

    const savePoint = await getSavePoint()

    let latestId = await getLatestID(browser)
    if (latestId instanceof Error) {
        console.error(latestId.message)
        process.exit(1)
    }

    if (latestId <= savePoint) return
    if (!existsSync('data')) await mkdir('data')

    console.log(
        `Crawl: ${savePoint + 1} -> ${latestId} (${latestId - savePoint + 1})`
    )

    const latest = await getHifumin(browser, latestId)
    if (latest instanceof Error) {
        console.error("Can't get latest hentai")
        process.exit(1)
    }

    await writeFile(`data/latest.json`, JSON.stringify(latest))

    let current = 0

    const stopEstimation = createProgress({
        start: savePoint + 1,
        end: latestId,
        getCurrent: () => current
    })

    for (let i = savePoint + 1; i <= latestId; i++) {
        queue.add(async () => {
            const hentai = await getHifumin(browser, i)
            if (hentai instanceof Error) return console.log(`Skip: ${i}`)

            current++

            await Promise.all([
                writeFile(`data/${i}.json`, JSON.stringify(hentai)),
                new Promise((resolve) => setTimeout(resolve, 500))
            ])
        })
    }

    await queue.onIdle()
    await browser.close()

    stopEstimation()

    process.exit(0)
}

main()
