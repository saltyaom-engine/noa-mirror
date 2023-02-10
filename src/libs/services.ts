import axios from 'redaxios'
import { toHifumin } from './map'
import type { Hifumin } from './types'

export const getSavePoint = async () =>
    axios
        .get<Hifumin>(
            'https://raw.githubusercontent.com/saltyaom-engine/noa-mirror/generated/latest.json'
        )
        .then((x) => x.data.id)
