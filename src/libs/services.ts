import fetch from 'isomorphic-unfetch'
import { toHifumin } from './map'
import type { Hifumin } from './types'

export const getSavePoint = async () =>
    fetch(
        'https://raw.githubusercontent.com/saltyaom-engine/noa-mirror/generated/latest.json'
    )
        .then((r) => r.json())
        .then((x: Hifumin) => x.id)
