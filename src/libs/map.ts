import type {
    Hifumin,
    NHentai,
    NHentaiPage,
    HifuminPage,
    NHentaiTag,
    HifuminMetadata
} from './types'

export const toHifumin = (h: NHentai): Hifumin => {
    const {
        media_id: id,
        images: { cover, thumbnail, pages }
    } = h

    const mediaId = +id

    return {
        id: h.id,
        title: {
            english: h.title.english ?? '',
            japanese: h.title.japanese ?? '',
            display: h.title.pretty ?? ''
        },
        images: {
            cover: mapNHCoverToHifumin({
                mediaId,
                image: cover
            }),
            thumbnail: mapNHThumbnailToHifumin({
                mediaId,
                image: thumbnail
            }),
            pages: pages.map((page, index) =>
                mapNHPageToHifumin({
                    mediaId,
                    image: thumbnail,
                    page: index + 1
                })
            )
        },
        info: {
            amount: h.num_pages,
            mediaId,
        },
        metadata: createMetadata(h.tags)
    }
}

export const createMetadata = (tags: NHentaiTag[]) => {
    const metadata: HifuminMetadata = {
        artists: [],
        categories: [],
        characters: [],
        groups: [],
        language: 'Translated',
        parodies: [],
        tags: []
    }

    for (const tag of tags) {
        const { name, count } = tag

        switch (tag.type) {
            case 'tag':
                metadata.tags.push(name)
                break

            case 'parody':
                metadata.parodies.push(name)
                break

            case 'character':
                metadata.characters.push(name)
                break

            case 'group':
                metadata.groups.push(name)
                break

            case 'category':
                metadata.categories.push(name)
                break

            case 'artist':
                metadata.artists.push(name)
                break

            case 'language':
                metadata.language = name
                break

            default:
                metadata.tags.push(name)
        }
    }

    return metadata
}

export const mapExtension = (extension: string) => {
    switch (extension) {
        case 'j':
            return 'jpg'

        case 'p':
            return 'png'

        case 'g':
            return 'gif'

        default:
            return 'jpg'
    }
}

export const mapNHPageToHifumin = ({
    mediaId,
    image,
    page
}: {
    mediaId: number
    image: NHentaiPage
    page: number
}): HifuminPage => {
    return {
        link: `https://i.nhentai.net/galleries/${mediaId}/${page}.${mapExtension(
            image.t
        )}`,
        info: {
            width: image.w,
            height: image.h,
            type: mapExtension(image.t)
        }
    }
}

export const mapNHCoverToHifumin = ({
    mediaId,
    image
}: {
    mediaId: number
    image: NHentaiPage
}): HifuminPage => {
    return {
        link: `https://t.nhentai.net/galleries/${mediaId}/cover.${mapExtension(
            image.t
        )}`,
        info: {
            width: image.w,
            height: image.h,
            type: mapExtension(image.t)
        }
    }
}

export const mapNHThumbnailToHifumin = ({
    mediaId,
    image
}: {
    mediaId: number
    image: NHentaiPage
}): HifuminPage => {
    return {
        link: `https://t.nhentai.net/galleries/${mediaId}/1t.${mapExtension(
            image.t
        )}`,
        info: {
            width: image.w,
            height: image.h,
            type: mapExtension(image.t)
        }
    }
}
