import fetch from 'node-fetch'
import { toHifumin } from './map'
import type { Hifumin } from './types'

export const getSavePoint = () =>
    fetch(
        'https://raw.githubusercontent.com/saltyaom-engine/noa-mirror/generated/latest.json'
    )
        .then((x) => x.json())
        .then((x) => (x as Hifumin).id)
