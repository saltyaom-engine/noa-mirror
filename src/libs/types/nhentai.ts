export interface NHentai {
    id: number
    media_id: number | string
    title: NHentaiTitle
    images: NHentaiImage
    scanlator: string
    upload_date: number
    tags: NHentaiTag[]
    num_pages: number
    num_favorites: number
}

export interface NHentaiTitle {
    english: string
    japanese: string
    pretty: string
}

export interface NHentaiImage {
    pages: NHentaiPage[]
    cover: NHentaiPage
    thumbnail: NHentaiPage
}

export interface NHentaiPage {
    t: string
    w: number
    h: number
}

export interface NHentaiTag {
    id: number
    type: string
    name: string
    url: string
    count: number
}

export interface NHentaiComment {
    id: number
    galleryId: number
    poster: NHentaiCommentPoster
    postDate: number
    body: string
}

export interface NHentaiCommentPoster {
    id: number
    username: string
    slug: string
    avatarUrl: string
    isSuperuser: boolean
    isStaff: boolean
}
